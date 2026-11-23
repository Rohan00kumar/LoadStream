"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
    name: "Node-Alpha (High-Compute)",
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
    name: "Node-Beta (Standard)",
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
    name: "Node-Gamma (Memory-Optimized)",
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
    name: "Node-Delta (Edge-Fast)",
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

export default function AlgorithmArenaPage() {
  // Config state
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

  // Engine ref
  const engineRef = useRef<SimulationEngine | null>(null);

  // Keep server weights synchronized with servers
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
      const updated = [historyRecord, ...parsed.slice(0, 24)]; // Keep latest 25 runs
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save simulation history to localStorage:", err);
    }
  };

  // Simulation control actions
  const handleStartSimulation = () => {
    if (selectedAlgorithms.length === 0 || servers.length === 0) return;

    // Generate deterministic workload
    const requests = generateWorkload(workloadConfig);

    // Prepare servers with active weights
    const configuredServers = servers.map((s) => ({
      ...s,
      weight: serverWeights[s.id] || s.weight || 1,
    }));

    // Instantiate discrete-event engine
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
  };

  const handleSpeedChange = (newSpeed: SimulationSpeed) => {
    setSimSpeed(newSpeed);
    if (engineRef.current) {
      engineRef.current.setSpeed(newSpeed);
    }
  };

  // Server crash/restore dynamic injection
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

  // Export handlers
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

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `arena-evaluation-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="orbit-page">
      <Navbar />

      <main className="orbit-main page-enter-anim" style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px 80px" }}>
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/simulate" className="back-link flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            ← Back to Simulation Labs
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Interactive Educational Lab
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Discrete-Event Engine
            </span>
          </div>
        </div>

        {/* Page Title & Intro */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="text-purple-400">⚡</span> Algorithm Arena
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Experiment with, benchmark, and compare state-of-the-art load-balancing algorithms under identical synthetic workloads.
            Observe real queue depths, server saturation, and latency distributions with live failure injection.
          </p>
        </div>

        {/* SECTION 1: ALGORITHM SELECTOR */}
        <section className="mb-8">
          <AlgorithmSelector
            selectedAlgorithms={selectedAlgorithms}
            onToggleAlgorithm={handleToggleAlgorithm}
            serverWeights={serverWeights}
            onUpdateWeight={handleUpdateWeight}
            serverIds={servers.map((s) => s.id)}
          />
        </section>

        {/* SECTION 2: WORKLOAD & SIMULATION CONTROLS */}
        <section className="mb-8">
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

        {/* SECTION 3: LIVE VISUAL ARENA LANES */}
        <section className="mb-8">
          <VisualArenaLanes
            selectedAlgorithms={selectedAlgorithms}
            servers={servers}
            laneMetrics={laneMetrics}
            laneResults={laneResults}
            onToggleServerFail={handleToggleServerFail}
            isSimulating={simState === "running" || simState === "paused"}
          />
        </section>

        {/* SECTION 4: REAL-TIME EVENT CONSOLE */}
        <section className="mb-8">
          <RealTimeEventConsole
            events={events}
            selectedAlgorithms={selectedAlgorithms}
            onClearEvents={() => setEvents([])}
          />
        </section>

        {/* SECTION 5: PERFORMANCE EVALUATION & BENCHMARK MATRIX */}
        <section className="mb-8">
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
            <div className="rounded-2xl border border-[#21262d] bg-[#0d1117]/60 p-8 text-center backdrop-blur-md">
              <span className="text-3xl block mb-2">📊</span>
              <h3 className="text-base font-semibold text-white mb-1">
                Awaiting Simulation Execution
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Press &quot;Start Simulation&quot; above to process requests across the selected algorithms. Full benchmark metrics, response time distributions, and comparative insights will appear here upon completion.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* MODALS */}
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
          // Set default weight for new servers if missing
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
