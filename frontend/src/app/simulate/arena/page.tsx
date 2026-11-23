"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  AlgorithmType,
  VirtualServer,
  WorkloadConfig,
  SimulationSpeed,
  SimulationState,
  SimulationEvent,
  ServerLiveMetrics,
  RequestResult,
  AlgorithmPerformance,
  SimulationRunHistory,
} from "./types";
import { generateWorkload } from "./engine/workloadGenerator";
import { SimulationEngine, EngineTickState } from "./engine/simulationEngine";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ArenaControls from "./components/ArenaControls";
import VisualArenaLanes from "./components/VisualArenaLanes";
import RealTimeEventConsole from "./components/RealTimeEventConsole";
import PerformanceEvaluation from "./components/PerformanceEvaluation";
import WorkloadConfigModal from "./components/WorkloadConfigModal";
import ServerManagerModal from "./components/ServerManagerModal";
import HistoryModal from "./components/HistoryModal";
import EducationalDrawer from "./components/EducationalDrawer";

const DEFAULT_SERVERS: VirtualServer[] = [
  {
    id: "srv-alpha",
    name: "Node-Alpha",
    region: "us-east-1",
    cpuCores: 8,
    memoryGb: 32,
    maxConcurrent: 60,
    weight: 4,
    baseLatencyMs: 12,
    status: "healthy",
  },
  {
    id: "srv-beta",
    name: "Node-Beta",
    region: "us-west-2",
    cpuCores: 4,
    memoryGb: 16,
    maxConcurrent: 35,
    weight: 2,
    baseLatencyMs: 18,
    status: "healthy",
  },
  {
    id: "srv-gamma",
    name: "Node-Gamma",
    region: "eu-central-1",
    cpuCores: 4,
    memoryGb: 32,
    maxConcurrent: 30,
    weight: 2,
    baseLatencyMs: 22,
    status: "healthy",
  },
  {
    id: "srv-delta",
    name: "Node-Delta",
    region: "ap-south-1",
    cpuCores: 2,
    memoryGb: 8,
    maxConcurrent: 15,
    weight: 1,
    baseLatencyMs: 8,
    status: "healthy",
  },
];

const DEFAULT_WORKLOAD: WorkloadConfig = {
  totalRequests: 160,
  requestsPerSecond: 25,
  concurrentUsers: 10,
  pattern: "constant",
  complexity: "mixed",
  seed: 42,
  timeoutMs: 1200,
};

const STORAGE_KEY = "orbit_arena_history";

type ActiveTab = "simulation" | "results" | "logs" | "reference";

export default function AlgorithmArenaPage() {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<AlgorithmType[]>([
    "round_robin",
    "least_connections",
    "ppo",
  ]);
  const [servers, setServers] = useState<VirtualServer[]>(DEFAULT_SERVERS);
  const [serverWeights, setServerWeights] = useState<Record<string, number>>({
    "srv-alpha": 4,
    "srv-beta": 2,
    "srv-gamma": 2,
    "srv-delta": 1,
  });
  const [workloadConfig, setWorkloadConfig] = useState<WorkloadConfig>(DEFAULT_WORKLOAD);

  // Active view workspace tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("simulation");

  // Simulation execution state
  const [simState, setSimState] = useState<SimulationState>("idle");
  const [simSpeed, setSimSpeed] = useState<SimulationSpeed>(1);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [virtualTimeMs, setVirtualTimeMs] = useState<number>(0);

  // Live telemetry
  const [laneMetrics, setLaneMetrics] = useState<
    Record<AlgorithmType, Record<string, ServerLiveMetrics>>
  >({} as any);
  const [laneResults, setLaneResults] = useState<Record<AlgorithmType, RequestResult[]>>({} as any);
  const [events, setEvents] = useState<SimulationEvent[]>([]);

  // Post-simulation results & insights
  const [finalResults, setFinalResults] = useState<Record<AlgorithmType, AlgorithmPerformance> | null>(
    null
  );
  const [insights, setInsights] = useState<string[]>([]);

  // Modals state
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const engineRef = useRef<SimulationEngine | null>(null);

  const handleUpdateWeight = (serverId: string, weight: number) => {
    setServerWeights((prev) => ({ ...prev, [serverId]: weight }));
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, weight } : s))
    );
  };

  const handleToggleAlgorithm = (algo: AlgorithmType) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]
    );
  };

  const saveRunToHistory = (historyRecord: SimulationRunHistory) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const parsed: SimulationRunHistory[] = existing ? JSON.parse(existing) : [];
      const updated = [historyRecord, ...parsed.slice(0, 24)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save simulation history to localStorage:", err);
    }
  };

  const handleStartSimulation = () => {
    if (selectedAlgorithms.length === 0 || servers.length === 0) return;

    const requests = generateWorkload(workloadConfig);
    const configuredServers = servers.map((s) => ({
      ...s,
      weight: serverWeights[s.id] || s.weight || 1,
    }));

    const engine = new SimulationEngine(
      requests,
      selectedAlgorithms,
      configuredServers,
      workloadConfig,
      simSpeed
    );
    engineRef.current = engine;

    setSimState("running");
    setProgressPercent(0);
    setVirtualTimeMs(0);
    setFinalResults(null);
    setEvents([]);
    setActiveTab("simulation");

    engine.start(
      (tick: EngineTickState) => {
        setVirtualTimeMs(tick.virtualTimeMs);
        setProgressPercent(tick.progressPercent);
        setLaneMetrics(tick.activeLaneMetrics);
        setLaneResults(tick.activeLaneResults);
        setEvents(tick.events);
      },
      (history: SimulationRunHistory) => {
        setSimState("completed");
        setProgressPercent(100);
        setFinalResults(history.results);
        setInsights(history.insights);
        saveRunToHistory(history);
        setActiveTab("results");
      }
    );
  };

  const handlePauseSimulation = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setSimState("paused");
    }
  };

  const handleResumeSimulation = () => {
    if (engineRef.current) {
      engineRef.current.resume();
      setSimState("running");
    }
  };

  const handleStopSimulation = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      setSimState("stopped");
    }
  };

  const handleResetSimulation = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.reset();
      engineRef.current = null;
    }
    setSimState("idle");
    setProgressPercent(0);
    setVirtualTimeMs(0);
    setLaneMetrics({} as any);
    setLaneResults({} as any);
    setEvents([]);
    setFinalResults(null);
    setInsights([]);
    setActiveTab("simulation");
  };

  const handleSpeedChange = (newSpeed: SimulationSpeed) => {
    setSimSpeed(newSpeed);
    if (engineRef.current) {
      engineRef.current.setSpeed(newSpeed);
    }
  };

  const handleToggleServerFail = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === serverId
          ? {
              ...s,
              isManualFailed: !s.isManualFailed,
              status: !s.isManualFailed ? "offline" : "healthy",
            }
          : s
      )
    );

    if (engineRef.current) {
      engineRef.current.toggleServerFailure(serverId);
    }
  };

  const handleExportJson = () => {
    if (!finalResults) return;
    const exportData = {
      exportedAt: new Date().toISOString(),
      workloadConfig,
      servers,
      selectedAlgorithms,
      results: finalResults,
      insights,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arena-evaluation-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    if (!finalResults) return;
    const headers = [
      "Algorithm",
      "TotalRequests",
      "SuccessfulRequests",
      "FailedRequests",
      "ThroughputRps",
      "AvgLatencyMs",
      "MedianLatencyMs",
      "P95LatencyMs",
      "MinLatencyMs",
      "MaxLatencyMs",
      "AvgQueueWaitMs",
      "LoadImbalanceScore",
    ];

    const rows = Object.values(finalResults).map((m) => [
      m.algorithmId,
      m.totalRequests,
      m.successfulRequests,
      m.failedRequests,
      m.throughputRps.toFixed(2),
      m.avgResponseTimeMs.toFixed(2),
      m.medianResponseTimeMs.toFixed(2),
      m.p95ResponseTimeMs.toFixed(2),
      m.minResponseTimeMs.toFixed(2),
      m.maxResponseTimeMs.toFixed(2),
      m.avgQueueWaitMs.toFixed(2),
      m.loadImbalanceScore.toFixed(4),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `arena-evaluation-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="orbit-page min-h-screen bg-[#090d13]">
      <Navbar />

      <main className="orbit-main page-enter-anim max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-5">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#21262d] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/simulate"
                className="text-xs font-mono text-slate-500 hover:text-white transition-colors"
              >
                Simulation Labs
              </Link>
              <span className="text-slate-600 font-mono text-xs">/</span>
              <span className="text-xs font-mono text-purple-400">Arena</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Algorithm Arena
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative discrete-event load balancing benchmarking suite.
            </p>
          </div>

          {/* Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#21262d] text-slate-300">
              {servers.length} Nodes Active
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#21262d] text-slate-300">
              {workloadConfig.totalRequests} Reqs @ {workloadConfig.requestsPerSecond} RPS ({workloadConfig.pattern})
            </span>
            <span
              className={`px-2.5 py-1 rounded-md uppercase font-bold ${
                simState === "running"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : simState === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-[#161b22] border border-[#21262d] text-slate-400"
              }`}
            >
              {simState}
            </span>
          </div>
        </div>

        {/* Section 1: Algorithm Selector */}
        <section>
          <AlgorithmSelector
            selectedAlgorithms={selectedAlgorithms}
            onToggleAlgorithm={handleToggleAlgorithm}
            serverWeights={serverWeights}
            onUpdateWeight={handleUpdateWeight}
            serverIds={servers.map((s) => s.id)}
          />
        </section>

        {/* Section 2: Controls Toolbar */}
        <section>
          <ArenaControls
            state={simState}
            speed={simSpeed}
            progressPercent={progressPercent}
            virtualTimeMs={virtualTimeMs}
            workloadConfig={workloadConfig}
            onStart={handleStartSimulation}
            onPause={handlePauseSimulation}
            onResume={handleResumeSimulation}
            onStop={handleStopSimulation}
            onReset={handleResetSimulation}
            onSpeedChange={handleSpeedChange}
            onOpenWorkloadModal={() => setIsWorkloadModalOpen(true)}
            onOpenServerModal={() => setIsServerModalOpen(true)}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
            canStart={selectedAlgorithms.length > 0 && servers.length > 0}
          />
        </section>

        {/* Section 3: Workspace View Switcher Tabs */}
        <section className="space-y-4">
          {/* Minimalist Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-[#21262d] pb-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("simulation")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "simulation"
                    ? "bg-[#161b22] border border-[#30363d] text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Simulation Topology
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={`px-3 py-1.5 rounded-lg transition-colors relative ${
                  activeTab === "results"
                    ? "bg-[#161b22] border border-[#30363d] text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Benchmark Matrix
                {finalResults && (
                  <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "logs"
                    ? "bg-[#161b22] border border-[#30363d] text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Event Log ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                Architecture Guide
              </button>
            </div>

            <div className="hidden sm:block text-[11px] text-slate-500">
              {activeTab === "simulation" && "Live Socket & Queue Monitors"}
              {activeTab === "results" && "Empirical Latency & Throughput"}
              {activeTab === "logs" && "Real-Time Terminal Output"}
            </div>
          </div>

          {/* TAB 1: SIMULATION LANES */}
          {activeTab === "simulation" && (
            <div>
              <VisualArenaLanes
                selectedAlgorithms={selectedAlgorithms}
                servers={servers}
                laneMetrics={laneMetrics}
                laneResults={laneResults}
                onToggleServerFail={handleToggleServerFail}
                isSimulating={simState === "running" || simState === "paused"}
              />
            </div>
          )}

          {/* TAB 2: BENCHMARK RESULTS */}
          {activeTab === "results" && (
            <div>
              {finalResults ? (
                <PerformanceEvaluation
                  results={finalResults}
                  selectedAlgorithms={selectedAlgorithms}
                  servers={servers}
                  insights={insights}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                  onExportJson={handleExportJson}
                  onExportCsv={handleExportCsv}
                />
              ) : (
                <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-8 text-center text-xs text-slate-500 font-mono">
                  Benchmark matrix will populate upon completing or starting a simulation run.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EVENT LOG */}
          {activeTab === "logs" && (
            <div>
              <RealTimeEventConsole
                events={events}
                selectedAlgorithms={selectedAlgorithms}
                onClearEvents={() => setEvents([])}
              />
            </div>
          )}
        </section>
      </main>

      {/* Configuration Modals */}
      <WorkloadConfigModal
        isOpen={isWorkloadModalOpen}
        onClose={() => setIsWorkloadModalOpen(false)}
        config={workloadConfig}
        onSave={(newConfig) => {
          setWorkloadConfig(newConfig);
          setIsWorkloadModalOpen(false);
        }}
      />

      <ServerManagerModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        servers={servers}
        onUpdateServers={(newServers) => {
          setServers(newServers);
          newServers.forEach((s) => {
            if (serverWeights[s.id] === undefined) {
              setServerWeights((prev) => ({ ...prev, [s.id]: s.weight || 2 }));
            }
          });
        }}
        onResetDefaults={() => {
          setServers(DEFAULT_SERVERS);
          setServerWeights({
            "srv-alpha": 4,
            "srv-beta": 2,
            "srv-gamma": 2,
            "srv-delta": 1,
          });
        }}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectRun={(run) => {
          setFinalResults(run.results);
          setInsights(run.insights);
          setIsHistoryModalOpen(false);
          setActiveTab("results");
        }}
      />

      <EducationalDrawer
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        defaultAlgo={selectedAlgorithms[0] || "round_robin"}
      />
    </div>
  );
}
