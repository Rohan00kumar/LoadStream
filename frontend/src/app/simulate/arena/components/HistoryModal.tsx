"use client";

import { useState, useEffect } from "react";
import { SimulationRunHistory } from "../types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRun?: (run: SimulationRunHistory) => void;
}

const STORAGE_KEY = "orbit_arena_history";

export default function HistoryModal({
  isOpen,
  onClose,
  onSelectRun,
}: HistoryModalProps) {
  const [runs, setRuns] = useState<SimulationRunHistory[]>([]);
  const [selectedRun, setSelectedRun] = useState<SimulationRunHistory | null>(null);
  const [compareRunA, setCompareRunA] = useState<string | null>(null);
  const [compareRunB, setCompareRunB] = useState<string | null>(null);

  // Load runs from localStorage
  const loadHistory = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRuns(parsed);
          if (parsed.length > 0 && !selectedRun) {
            setSelectedRun(parsed[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse history from localStorage:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteRun = (runId: string) => {
    const next = runs.filter((r) => r.runId !== runId);
    setRuns(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (selectedRun?.runId === runId) {
      setSelectedRun(next[0] || null);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all saved simulation runs?")) {
      setRuns([]);
      setSelectedRun(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportJson = (run: SimulationRunHistory) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(run, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arena-run-${run.runId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCsv = (run: SimulationRunHistory) => {
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

    const rows = Object.values(run.results).map((m) => [
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
    downloadAnchor.setAttribute("download", `arena-metrics-${run.runId}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const runA = runs.find((r) => r.runId === compareRunA);
  const runB = runs.find((r) => r.runId === compareRunB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Simulation History & Benchmark Archive
              </h3>
              <p className="text-xs text-slate-400">
                Persistent local run archives with replay, comparison, and analytical export.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {runs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#21262d] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#21262d]">
          {/* Left Column: Runs List */}
          <div className="p-4 overflow-y-auto space-y-2.5 max-h-[350px] md:max-h-full">
            <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
              Previous Runs ({runs.length})
            </div>

            {runs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No past runs found in storage.
              </div>
            ) : (
              runs.map((r) => {
                const isSelected = selectedRun?.runId === r.runId;
                const date = new Date(r.timestamp);
                return (
                  <div
                    key={r.runId}
                    onClick={() => setSelectedRun(r)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500/50 shadow-md"
                        : "bg-[#161b22]/50 border-[#21262d] hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-white font-bold">{r.runId}</span>
                      <span className="text-[10px] text-slate-400">
                        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-2">
                      <span className="capitalize">{r.workloadConfig.pattern}</span>
                      <span>•</span>
                      <span>{r.workloadConfig.totalRequests} reqs</span>
                      <span>•</span>
                      <span>{r.selectedAlgorithms.length} algos</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {r.selectedAlgorithms.map((algo) => (
                        <span
                          key={algo}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#21262d] text-slate-300"
                        >
                          {algo.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Run Details & Comparison */}
          <div className="p-6 md:col-span-2 overflow-y-auto space-y-5">
            {selectedRun ? (
              <div className="space-y-6">
                {/* Details Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21262d] pb-4">
                  <div>
                    <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      Run Details: {selectedRun.runId}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Executed on {new Date(selectedRun.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportJson(selectedRun)}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportCsv(selectedRun)}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleDeleteRun(selectedRun.runId)}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Workload & Environment Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
                    <div className="text-slate-400 text-[10px] font-mono">TRAFFIC PATTERN</div>
                    <div className="font-semibold text-white mt-1 capitalize">
                      {selectedRun.workloadConfig.pattern}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
                    <div className="text-slate-400 text-[10px] font-mono">TOTAL REQUESTS</div>
                    <div className="font-semibold text-white mt-1">
                      {selectedRun.workloadConfig.totalRequests}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
                    <div className="text-slate-400 text-[10px] font-mono">RPS RATE</div>
                    <div className="font-semibold text-white mt-1">
                      {selectedRun.workloadConfig.requestsPerSecond} req/s
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#21262d]">
                    <div className="text-slate-400 text-[10px] font-mono">SERVER NODES</div>
                    <div className="font-semibold text-white mt-1">
                      {selectedRun.serverConfig.length} servers
                    </div>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="border border-[#21262d] rounded-xl overflow-x-auto bg-[#161b22]/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#21262d] text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-3">ALGORITHM</th>
                        <th className="py-2.5 px-2 text-right">SUCCESS %</th>
                        <th className="py-2.5 px-2 text-right">THROUGHPUT</th>
                        <th className="py-2.5 px-2 text-right">AVG LATENCY</th>
                        <th className="py-2.5 px-2 text-right">P95 LATENCY</th>
                        <th className="py-2.5 px-3 text-right">IMBALANCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d] font-mono text-slate-300">
                      {Object.values(selectedRun.results).map((m) => {
                        const successRate = (
                          (m.successfulRequests / Math.max(1, m.totalRequests)) *
                          100
                        ).toFixed(1);
                        return (
                          <tr key={m.algorithmId}>
                            <td className="py-2.5 px-3 font-sans font-semibold text-white">
                              {m.algorithmId.replace(/_/g, " ")}
                            </td>
                            <td className="py-2.5 px-2 text-right text-emerald-400">
                              {successRate}%
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              {m.throughputRps.toFixed(1)} rps
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              {m.avgResponseTimeMs.toFixed(1)} ms
                            </td>
                            <td className="py-2.5 px-2 text-right text-amber-300">
                              {m.p95ResponseTimeMs.toFixed(1)} ms
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {m.loadImbalanceScore.toFixed(3)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Compare Two Runs Selector */}
                <div className="p-4 rounded-xl border border-[#21262d] bg-[#161b22]/60 space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                    Compare Runs Side-by-Side
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Run A</label>
                      <select
                        value={compareRunA || ""}
                        onChange={(e) => setCompareRunA(e.target.value || null)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs"
                      >
                        <option value="">Select Run A</option>
                        {runs.map((r) => (
                          <option key={r.runId} value={r.runId}>
                            {r.runId} ({r.workloadConfig.pattern}, {r.workloadConfig.totalRequests} reqs)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Run B</label>
                      <select
                        value={compareRunB || ""}
                        onChange={(e) => setCompareRunB(e.target.value || null)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs"
                      >
                        <option value="">Select Run B</option>
                        {runs.map((r) => (
                          <option key={r.runId} value={r.runId}>
                            {r.runId} ({r.workloadConfig.pattern}, {r.workloadConfig.totalRequests} reqs)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {runA && runB && (
                    <div className="pt-2 border-t border-[#21262d] text-xs font-mono space-y-1.5">
                      <div className="text-slate-400 font-semibold mb-2 font-sans">
                        Comparison Result:
                      </div>
                      <div className="grid grid-cols-3 text-slate-400 text-[11px] pb-1 border-b border-[#21262d]">
                        <span>Metric</span>
                        <span>Run A ({runA.runId})</span>
                        <span>Run B ({runB.runId})</span>
                      </div>
                      <div className="grid grid-cols-3 text-[11px] text-slate-200">
                        <span className="text-slate-400">Pattern</span>
                        <span>{runA.workloadConfig.pattern}</span>
                        <span>{runB.workloadConfig.pattern}</span>
                      </div>
                      <div className="grid grid-cols-3 text-[11px] text-slate-200">
                        <span className="text-slate-400">Total Reqs</span>
                        <span>{runA.workloadConfig.totalRequests}</span>
                        <span>{runB.workloadConfig.totalRequests}</span>
                      </div>
                      <div className="grid grid-cols-3 text-[11px] text-slate-200">
                        <span className="text-slate-400">RPS Rate</span>
                        <span>{runA.workloadConfig.requestsPerSecond} rps</span>
                        <span>{runB.workloadConfig.requestsPerSecond} rps</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select a run from the history archive to view performance breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#21262d] bg-[#161b22] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#21262d] text-slate-300 hover:text-white hover:bg-[#30363d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
