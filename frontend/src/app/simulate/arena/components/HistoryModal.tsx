"use client";

import { useState, useEffect } from "react";
import { SimulationRunHistory } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectRun?: (run: SimulationRunHistory) => void;
}

const STORAGE_KEY = "orbit_arena_history";

export default function HistoryModal({
  isOpen,
  onClose,
  onSelectRun,
}: Props) {
  const [runs, setRuns] = useState<SimulationRunHistory[]>([]);
  const [selectedRun, setSelectedRun] = useState<SimulationRunHistory | null>(null);

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
    if (confirm("Delete all saved simulation runs?")) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="modal-enter-anim w-full max-w-4xl max-h-[85vh] bg-[#0d1117] border border-[#21262d] rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SIMULATION RUN ARCHIVE
            </h3>
            <p className="text-[11px] text-slate-400">
              Persistent local runs with performance metrics and analytical export.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {runs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear History
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white rounded bg-[#21262d]"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#21262d]">
          {/* Left Column: Runs List */}
          <div className="p-3 overflow-y-auto space-y-1.5 max-h-[300px] md:max-h-full">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">
              SAVED RUNS ({runs.length})
            </div>

            {runs.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-[11px] italic">
                No past runs recorded in storage.
              </div>
            ) : (
              runs.map((r) => {
                const isSelected = selectedRun?.runId === r.runId;
                const date = new Date(r.timestamp);
                return (
                  <div
                    key={r.runId}
                    onClick={() => setSelectedRun(r)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500/50"
                        : "bg-[#161b22] border-[#21262d] hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">{r.runId}</span>
                      <span className="text-[10px] text-slate-500">
                        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="capitalize">{r.workloadConfig.pattern}</span>
                      <span>|</span>
                      <span>{r.workloadConfig.totalRequests} reqs</span>
                      <span>|</span>
                      <span>{r.selectedAlgorithms.length} algos</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Run Details */}
          <div className="p-4 md:col-span-2 overflow-y-auto space-y-4">
            {selectedRun ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#21262d] pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      RUN: {selectedRun.runId}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {new Date(selectedRun.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      onClick={() => exportJson(selectedRun)}
                      className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportCsv(selectedRun)}
                      className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleDeleteRun(selectedRun.runId)}
                      className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="border border-[#21262d] rounded-lg overflow-x-auto bg-[#161b22]/40">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-[#21262d] text-slate-400 text-[10px]">
                        <th className="py-2 px-2.5">ALGORITHM</th>
                        <th className="py-2 px-2 text-right">PASS %</th>
                        <th className="py-2 px-2 text-right">THROUGHPUT</th>
                        <th className="py-2 px-2 text-right">AVG LATENCY</th>
                        <th className="py-2 px-2 text-right">P95 TAIL</th>
                        <th className="py-2 px-2.5 text-right">IMBALANCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d] text-slate-300">
                      {Object.values(selectedRun.results).map((m) => {
                        const successRate = (
                          (m.successfulRequests / Math.max(1, m.totalRequests)) *
                          100
                        ).toFixed(1);
                        return (
                          <tr key={m.algorithmId}>
                            <td className="py-2 px-2.5 font-sans font-semibold text-white">
                              {m.algorithmId.replace(/_/g, " ")}
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-400">
                              {successRate}%
                            </td>
                            <td className="py-2 px-2 text-right">
                              {m.throughputRps.toFixed(1)} rps
                            </td>
                            <td className="py-2 px-2 text-right">
                              {m.avgResponseTimeMs.toFixed(1)} ms
                            </td>
                            <td className="py-2 px-2 text-right text-amber-300">
                              {m.p95ResponseTimeMs.toFixed(1)} ms
                            </td>
                            <td className="py-2 px-2.5 text-right">
                              {m.loadImbalanceScore.toFixed(3)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                Select a run from the archive to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
