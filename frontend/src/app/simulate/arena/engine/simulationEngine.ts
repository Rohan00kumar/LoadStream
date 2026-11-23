import {
  AlgorithmType,
  SimulationRequest,
  VirtualServer,
  WorkloadConfig,
  RequestResult,
  SimulationEvent,
  ServerLiveMetrics,
  AlgorithmPerformance,
  SimulationRunHistory,
} from "../types";
import { ServerRuntimeState, LoadBalancer } from "../algorithms/base";
import { RoundRobinBalancer } from "../algorithms/roundRobin";
import { RandomBalancer } from "../algorithms/random";
import { LeastConnectionsBalancer } from "../algorithms/leastConnections";
import { WeightedRoundRobinBalancer } from "../algorithms/weightedRoundRobin";
import { PPOPolicyBalancer } from "../algorithms/ppoPolicy";
import { calculatePerformance } from "./metricsCalculator";
import { generateEducationalInsights } from "./insightGenerator";

interface InFlightTask {
  request: SimulationRequest;
  serverId: string;
  scheduledMs: number;
  queueWaitMs: number;
  serviceDurationMs: number;
  completionMs: number;
}

interface QueuedTask {
  request: SimulationRequest;
  serverId: string;
  queuedAtMs: number;
}

export interface EngineTickState {
  virtualTimeMs: number;
  progressPercent: number;
  isFinished: boolean;
  activeLaneMetrics: Record<AlgorithmType, Record<string, ServerLiveMetrics>>;
  activeLaneResults: Record<AlgorithmType, RequestResult[]>;
  events: SimulationEvent[];
}

export class SimulationEngine {
  private workload: SimulationRequest[] = [];
  private selectedAlgos: AlgorithmType[] = [];
  private baseServers: VirtualServer[] = [];
  private workloadConfig: WorkloadConfig;

  // Per-algorithm state
  private balancers: Record<AlgorithmType, LoadBalancer>;
  private laneServers: Record<AlgorithmType, ServerRuntimeState[]> = {} as any;
  private inFlightTasks: Record<AlgorithmType, InFlightTask[]> = {} as any;
  private queuedTasks: Record<AlgorithmType, QueuedTask[]> = {} as any;
  private results: Record<AlgorithmType, RequestResult[]> = {} as any;
  private nextRequestIdx: Record<AlgorithmType, number> = {} as any;

  // Timing and execution
  private virtualTimeMs: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private speed: number = 1.0;
  private timerId: any = null;

  // Events log (capped at 200)
  private events: SimulationEvent[] = [];
  private eventCounter: number = 0;

  // Callbacks
  private onTickCallback?: (state: EngineTickState) => void;
  private onCompleteCallback?: (history: SimulationRunHistory) => void;

  constructor(
    workload: SimulationRequest[],
    selectedAlgorithms: AlgorithmType[],
    servers: VirtualServer[],
    workloadConfig: WorkloadConfig,
    speed: number = 1.0
  ) {
    this.workload = workload;
    this.selectedAlgos = selectedAlgorithms;
    this.baseServers = servers;
    this.workloadConfig = workloadConfig;
    this.speed = speed;

    this.balancers = {
      round_robin: new RoundRobinBalancer(),
      random: new RandomBalancer(),
      least_connections: new LeastConnectionsBalancer(),
      weighted_round_robin: new WeightedRoundRobinBalancer(),
      ppo: new PPOPolicyBalancer(),
    };

    this.reset();
  }

  public setSpeed(newSpeed: number) {
    this.speed = newSpeed;
  }

  public reset() {
    this.stop();
    this.virtualTimeMs = 0;
    this.events = [];
    this.eventCounter = 0;

    for (const algo of this.selectedAlgos) {
      this.balancers[algo]?.reset();
      this.nextRequestIdx[algo] = 0;
      this.inFlightTasks[algo] = [];
      this.queuedTasks[algo] = [];
      this.results[algo] = [];

      // Clone independent server states for this algorithm lane
      this.laneServers[algo] = this.baseServers.map((s) => ({
        server: { ...s },
        activeRequests: 0,
        queuedRequests: 0,
        currentCpuPercent: 12,
        currentMemoryMb: 50,
        effectiveWeight: s.weight || 1,
        currentWeight: 0,
      }));
    }

    this.addEvent(
      this.selectedAlgos[0] || "round_robin",
      "SIMULATION_START",
      "info",
      `Simulation initialized with ${this.workload.length} requests across ${this.selectedAlgos.length} algorithm lanes.`
    );
  }

  public start(
    onTick: (state: EngineTickState) => void,
    onComplete: (history: SimulationRunHistory) => void
  ) {
    this.onTickCallback = onTick;
    this.onCompleteCallback = onComplete;
    this.isRunning = true;
    this.isPaused = false;
    this.scheduleNextTick();
  }

  public pause() {
    this.isPaused = true;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.scheduleNextTick();
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  // Live dynamic failure injection
  public toggleServerFailure(serverId: string) {
    for (const algo of this.selectedAlgos) {
      const serverState = this.laneServers[algo]?.find((s) => s.server.id === serverId);
      if (serverState) {
        serverState.server.isManualFailed = !serverState.server.isManualFailed;
        serverState.server.status = serverState.server.isManualFailed ? "offline" : "healthy";

        if (serverState.server.isManualFailed) {
          // Drop in-flight tasks as failed 503
          const dropped = this.inFlightTasks[algo].filter((t) => t.serverId === serverId);
          this.inFlightTasks[algo] = this.inFlightTasks[algo].filter((t) => t.serverId !== serverId);
          dropped.forEach((task) => {
            this.results[algo].push({
              requestId: task.request.id,
              algorithmId: algo,
              serverId,
              status: "server_failed",
              statusCode: 503,
              arrivalMs: task.request.arrivalMs,
              scheduledMs: task.scheduledMs,
              completedMs: this.virtualTimeMs,
              queueWaitMs: task.queueWaitMs,
              serviceDurationMs: this.virtualTimeMs - task.scheduledMs,
              totalLatencyMs: this.virtualTimeMs - task.request.arrivalMs,
            });
          });
          serverState.activeRequests = 0;
          serverState.queuedRequests = 0;

          this.addEvent(
            algo,
            "SERVER_FAILED",
            "error",
            `[Live Failure] Server ${serverState.server.name} offline. In-flight requests dropped.`,
            serverId
          );
        } else {
          this.addEvent(
            algo,
            "SERVER_RESTORED",
            "success",
            `[Live Recovery] Server ${serverState.server.name} returned to cluster.`,
            serverId
          );
        }
      }
    }
  }

  private scheduleNextTick() {
    if (!this.isRunning || this.isPaused) return;
    const intervalRealMs = 30; // 30ms real clock step
    this.timerId = setTimeout(() => {
      this.tick(intervalRealMs);
      if (this.isRunning && !this.isPaused) {
        this.scheduleNextTick();
      }
    }, intervalRealMs);
  }

  private tick(realElapsedMs: number) {
    // Virtual time advancement scaled by speed multiplier
    const virtualStepMs = realElapsedMs * this.speed * 2.2;
    this.virtualTimeMs += virtualStepMs;

    let allCompleted = true;

    for (const algo of this.selectedAlgos) {
      const balancer = this.balancers[algo];
      const servers = this.laneServers[algo];
      const inFlight = this.inFlightTasks[algo];
      const queue = this.queuedTasks[algo];
      const results = this.results[algo];

      // 1. Process in-flight request completions
      const finished: InFlightTask[] = [];
      const stillActive: InFlightTask[] = [];

      for (const task of inFlight) {
        if (task.completionMs <= this.virtualTimeMs) {
          finished.push(task);
        } else {
          stillActive.push(task);
        }
      }
      this.inFlightTasks[algo] = stillActive;

      // Handle completions
      for (const task of finished) {
        const sState = servers.find((s) => s.server.id === task.serverId);
        if (sState) {
          sState.activeRequests = Math.max(0, sState.activeRequests - 1);
        }

        results.push({
          requestId: task.request.id,
          algorithmId: algo,
          serverId: task.serverId,
          status: "success",
          statusCode: 200,
          arrivalMs: task.request.arrivalMs,
          scheduledMs: task.scheduledMs,
          completedMs: task.completionMs,
          queueWaitMs: task.queueWaitMs,
          serviceDurationMs: task.serviceDurationMs,
          totalLatencyMs: task.completionMs - task.request.arrivalMs,
        });

        // Promote from queue if slot opened
        if (sState && queue.length > 0) {
          const qIdx = queue.findIndex((q) => q.serverId === task.serverId);
          if (qIdx !== -1) {
            const queuedItem = queue.splice(qIdx, 1)[0];
            sState.queuedRequests = Math.max(0, sState.queuedRequests - 1);
            sState.activeRequests++;

            const queueWaitMs = this.virtualTimeMs - queuedItem.queuedAtMs;
            const serviceDurationMs = this.computeServiceDuration(queuedItem.request, sState);

            this.inFlightTasks[algo].push({
              request: queuedItem.request,
              serverId: task.serverId,
              scheduledMs: this.virtualTimeMs,
              queueWaitMs,
              serviceDurationMs,
              completionMs: this.virtualTimeMs + serviceDurationMs,
            });
          }
        }
      }

      // 2. Dispatch arriving requests
      while (
        this.nextRequestIdx[algo] < this.workload.length &&
        this.workload[this.nextRequestIdx[algo]].arrivalMs <= this.virtualTimeMs
      ) {
        const req = this.workload[this.nextRequestIdx[algo]];
        this.nextRequestIdx[algo]++;

        const chosenServer = balancer.selectServer(req, servers);

        if (!chosenServer) {
          // No healthy servers available
          results.push({
            requestId: req.id,
            algorithmId: algo,
            serverId: null,
            status: "server_failed",
            statusCode: 503,
            arrivalMs: req.arrivalMs,
            scheduledMs: this.virtualTimeMs,
            completedMs: this.virtualTimeMs,
            queueWaitMs: 0,
            serviceDurationMs: 0,
            totalLatencyMs: 0,
          });
          this.addEvent(
            algo,
            "REQUEST_REJECTED",
            "error",
            `Request #${req.id} rejected: no operational servers available.`
          );
          continue;
        }

        // Capacity & concurrency evaluation
        const maxConns = chosenServer.server.maxConcurrent;
        if (chosenServer.activeRequests < maxConns) {
          // Direct execution
          chosenServer.activeRequests++;
          const serviceDurationMs = this.computeServiceDuration(req, chosenServer);

          this.inFlightTasks[algo].push({
            request: req,
            serverId: chosenServer.server.id,
            scheduledMs: this.virtualTimeMs,
            queueWaitMs: 0,
            serviceDurationMs,
            completionMs: this.virtualTimeMs + serviceDurationMs,
          });

          if (req.id % 20 === 0 || req.id === 1) {
            this.addEvent(
              algo,
              "REQUEST_ROUTED",
              "info",
              `Req #${req.id} (${req.complexity}) -> ${chosenServer.server.name} [Active: ${chosenServer.activeRequests}/${maxConns}]`,
              chosenServer.server.id,
              req.id
            );
          }
        } else {
          // Server reached concurrency limit: check queue limit (max 10)
          if (chosenServer.queuedRequests < 10) {
            chosenServer.queuedRequests++;
            queue.push({
              request: req,
              serverId: chosenServer.server.id,
              queuedAtMs: this.virtualTimeMs,
            });

            this.addEvent(
              algo,
              "REQUEST_QUEUED",
              "warning",
              `Server ${chosenServer.server.name} saturated (${chosenServer.activeRequests}/${maxConns}). Req #${req.id} placed in queue.`,
              chosenServer.server.id,
              req.id
            );
          } else {
            // Queue full -> 503 Overload Drop
            results.push({
              requestId: req.id,
              algorithmId: algo,
              serverId: chosenServer.server.id,
              status: "overloaded",
              statusCode: 503,
              arrivalMs: req.arrivalMs,
              scheduledMs: this.virtualTimeMs,
              completedMs: this.virtualTimeMs,
              queueWaitMs: 0,
              serviceDurationMs: 0,
              totalLatencyMs: 0,
            });

            this.addEvent(
              algo,
              "SERVER_OVERLOADED",
              "error",
              `Req #${req.id} dropped: Server ${chosenServer.server.name} queue capacity exceeded!`,
              chosenServer.server.id,
              req.id
            );
          }
        }
      }

      // 3. Update dynamic CPU and memory utilization
      for (const s of servers) {
        if (s.server.status === "offline" || s.server.isManualFailed) {
          s.currentCpuPercent = 0;
          s.currentMemoryMb = 0;
        } else {
          const loadRatio = s.activeRequests / Math.max(1, s.server.maxConcurrent);
          const targetCpu = Math.round(10 + loadRatio * 82);
          s.currentCpuPercent = Math.min(100, Math.max(8, targetCpu));
          s.currentMemoryMb = Math.round(100 + s.activeRequests * 45);
        }
      }

      // Check if this lane is still running
      const laneFinished =
        this.nextRequestIdx[algo] >= this.workload.length &&
        this.inFlightTasks[algo].length === 0 &&
        this.queuedTasks[algo].length === 0;

      if (!laneFinished) {
        allCompleted = false;
      }
    }

    // Prepare Live Metrics Snapshot for UI
    const totalRequests = Math.max(1, this.workload.length);
    const maxProcessed = Math.max(...Object.values(this.results).map((r) => r.length));
    const progressPercent = Math.min(100, Math.round((maxProcessed / totalRequests) * 100));

    const activeLaneMetrics: Record<AlgorithmType, Record<string, ServerLiveMetrics>> = {} as any;
    for (const algo of this.selectedAlgos) {
      activeLaneMetrics[algo] = {};
      for (const s of this.laneServers[algo]) {
        activeLaneMetrics[algo][s.server.id] = {
          serverId: s.server.id,
          activeConnections: s.activeRequests,
          queuedRequests: s.queuedRequests,
          completedRequests: this.results[algo].filter(
            (r) => r.serverId === s.server.id && r.status === "success"
          ).length,
          failedRequests: this.results[algo].filter(
            (r) => r.serverId === s.server.id && r.status !== "success"
          ).length,
          cpuUtilizationPercent: s.currentCpuPercent,
          memoryUtilizationPercent: Math.round(
            (s.currentMemoryMb / (s.server.memoryGb * 1024)) * 100
          ),
          avgLatencyMs: s.server.baseLatencyMs,
          status: s.server.status,
        };
      }
    }

    if (this.onTickCallback) {
      this.onTickCallback({
        virtualTimeMs: Math.round(this.virtualTimeMs),
        progressPercent,
        isFinished: allCompleted,
        activeLaneMetrics,
        activeLaneResults: this.results,
        events: this.events.slice(-120),
      });
    }

    // Check completion condition
    if (allCompleted) {
      this.finishSimulation();
    }
  }

  private computeServiceDuration(req: SimulationRequest, sState: ServerRuntimeState): number {
    const baseLat = sState.server.baseLatencyMs;
    const compute = req.baseComputeMs;
    const concurrencyPenalty = 1 + 0.45 * (sState.activeRequests / Math.max(1, sState.server.maxConcurrent));
    return Math.round((baseLat + compute) * concurrencyPenalty);
  }

  private finishSimulation() {
    this.stop();
    this.addEvent(
      this.selectedAlgos[0] || "round_robin",
      "SIMULATION_END",
      "success",
      `Simulation successfully completed at T = ${(this.virtualTimeMs / 1000).toFixed(2)}s.`
    );

    // Calculate final metrics for each lane
    const performances: Record<AlgorithmType, AlgorithmPerformance> = {} as any;
    for (const algo of this.selectedAlgos) {
      const liveMetrics: Record<string, ServerLiveMetrics> = {};
      for (const s of this.laneServers[algo]) {
        liveMetrics[s.server.id] = {
          serverId: s.server.id,
          activeConnections: 0,
          queuedRequests: 0,
          completedRequests: this.results[algo].filter(
            (r) => r.serverId === s.server.id && r.status === "success"
          ).length,
          failedRequests: this.results[algo].filter(
            (r) => r.serverId === s.server.id && r.status !== "success"
          ).length,
          cpuUtilizationPercent: 12,
          memoryUtilizationPercent: 8,
          avgLatencyMs: s.server.baseLatencyMs,
          status: s.server.status,
        };
      }

      performances[algo] = calculatePerformance(
        algo,
        this.results[algo],
        liveMetrics,
        this.baseServers,
        this.virtualTimeMs
      );
    }

    const { insights, fastestAlgo, mostReliableAlgo, mostBalancedAlgo, highestThroughputAlgo } =
      generateEducationalInsights(performances, this.workloadConfig);

    const runHistory: SimulationRunHistory = {
      runId: `run_${Date.now().toString(36)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      selectedAlgorithms: this.selectedAlgos,
      workloadConfig: this.workloadConfig,
      serverConfig: this.baseServers,
      results: performances,
      highlights: {
        fastestAlgo,
        mostReliableAlgo,
        mostBalancedAlgo,
        highestThroughputAlgo,
      },
      insights,
    };

    if (this.onCompleteCallback) {
      this.onCompleteCallback(runHistory);
    }
  }

  private addEvent(
    algo: AlgorithmType,
    type: SimulationEvent["type"],
    severity: SimulationEvent["severity"],
    message: string,
    serverId?: string,
    requestId?: number
  ) {
    this.eventCounter++;
    this.events.push({
      id: `evt_${this.eventCounter}`,
      timestampMs: Math.round(this.virtualTimeMs),
      algorithmId: algo,
      type,
      severity,
      message,
      serverId,
      requestId,
    });
    if (this.events.length > 250) {
      this.events.shift();
    }
  }
}
