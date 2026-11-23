export type AlgorithmType =
  | "round_robin"
  | "random"
  | "least_connections"
  | "weighted_round_robin"
  | "ppo";

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  shortName: string;
  color: string; // hex
  tagline: string;
  explanation: string;
  routingStrategy: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  status: "available" | "simulated_model" | "backend_connected";
  statusBadge: string;
}

export interface VirtualServer {
  id: string;
  name: string;
  region: string;
  cpuCores: number;
  memoryGb: number;
  maxConcurrent: number;
  weight: number;
  baseLatencyMs: number;
  status: "healthy" | "degraded" | "offline";
  isManualFailed?: boolean;
}

export type WorkloadPattern = "constant" | "ramp_up" | "spike" | "burst" | "random";
export type RequestComplexity = "light" | "medium" | "heavy" | "mixed";

export interface WorkloadConfig {
  totalRequests: number;
  requestsPerSecond: number;
  concurrentUsers: number;
  pattern: WorkloadPattern;
  complexity: RequestComplexity;
  seed: number;
  timeoutMs: number;
}

export interface SimulationRequest {
  id: number;
  arrivalMs: number;
  complexity: "light" | "medium" | "heavy";
  cpuFootprintPercent: number;
  memoryFootprintMb: number;
  baseComputeMs: number;
  timeoutMs: number;
}

export interface RequestResult {
  requestId: number;
  algorithmId: AlgorithmType;
  serverId: string | null;
  status: "success" | "overloaded" | "timeout" | "server_failed";
  statusCode: 200 | 503 | 504;
  arrivalMs: number;
  scheduledMs: number;
  completedMs: number;
  queueWaitMs: number;
  serviceDurationMs: number;
  totalLatencyMs: number;
}

export type EventSeverity = "info" | "success" | "warning" | "error";

export interface SimulationEvent {
  id: string;
  timestampMs: number;
  algorithmId: AlgorithmType;
  type:
    | "REQUEST_ARRIVED"
    | "REQUEST_ROUTED"
    | "REQUEST_QUEUED"
    | "REQUEST_COMPLETED"
    | "SERVER_FAILED"
    | "SERVER_RESTORED"
    | "SERVER_OVERLOADED"
    | "REQUEST_REJECTED"
    | "SIMULATION_START"
    | "SIMULATION_END";
  severity: EventSeverity;
  serverId?: string;
  requestId?: number;
  message: string;
}

export interface ServerLiveMetrics {
  serverId: string;
  activeConnections: number;
  queuedRequests: number;
  completedRequests: number;
  failedRequests: number;
  cpuUtilizationPercent: number;
  memoryUtilizationPercent: number;
  avgLatencyMs: number;
  status: "healthy" | "degraded" | "offline";
}

export interface AlgorithmPerformance {
  algorithmId: AlgorithmType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutRequests: number;
  throughputRps: number;
  avgResponseTimeMs: number;
  medianResponseTimeMs: number;
  p95ResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  avgQueueWaitMs: number;
  serverDistribution: Record<string, number>;
  serverPercentages: Record<string, number>;
  loadImbalanceScore: number; // Coefficient of Variation (std / mean)
  serverMetrics: Record<string, ServerLiveMetrics>;
}

export interface SimulationRunHistory {
  runId: string;
  timestamp: string;
  selectedAlgorithms: AlgorithmType[];
  workloadConfig: WorkloadConfig;
  serverConfig: VirtualServer[];
  results: Record<AlgorithmType, AlgorithmPerformance>;
  highlights: {
    fastestAlgo: AlgorithmType;
    mostReliableAlgo: AlgorithmType;
    mostBalancedAlgo: AlgorithmType;
    highestThroughputAlgo: AlgorithmType;
  };
  insights: string[];
}

export type SimulationState = "idle" | "running" | "paused" | "completed" | "stopped";
export type SimulationSpeed = 0.5 | 1 | 2 | 4;
