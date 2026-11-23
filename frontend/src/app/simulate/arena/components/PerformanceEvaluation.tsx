"use client";

import { useMemo, useState } from "react";
import {
  AlgorithmPerformance,
  AlgorithmType,
  VirtualServer,
} from "../types";

interface Props {
  results: Record<AlgorithmType, AlgorithmPerformance>;
  selectedAlgorithms: AlgorithmType[];
  servers: VirtualServer[];
  insights: string[];
  onOpenHistory?: () => void;
  onExportJson?: () => void;
  onExportCsv?: () => void;
}

const ALGO_LABELS: Record<AlgorithmType, { name: string; tag: string }> = {
  round_robin: { name: "Round Robin", tag: "CYCLIC" },
  random: { name: "Random", tag: "STOCHASTIC" },
  least_connections: { name: "Least Connections", tag: "DYNAMIC" },
  weighted_round_robin: { name: "Weighted Round Robin", tag: "PROPORTIONAL" },
  ppo: { name: "PPO Policy", tag: "NEURAL RL" },
};

export default function PerformanceEvaluation({
  results,
  selectedAlgorithms,
  servers,
  insights,
  onOpenHistory,
  onExportJson,
  onExportCsv,
}: Props) {
  const [activeTab, setActiveTab] = useState<"matrix" | "distribution" | "insights">("matrix");

  const champions = useMemo(() => {
    const algos = selectedAlgorithms.filter((a) => results[a] && results[a].totalRequests > 0);
    if (algos.length === 0) return null;

    const fastest = [...algos].sort(
      (a, b) => results[a].avgResponseTimeMs - results[b].avgResponseTimeMs
    )[0];

    const throughput = [...algos].sort(
      (a, b) => results[b].throughputRps - results[a].throughputRps
    )[0];

    const reliable = [...algos].sort((a, b) => {
      const rateA = results[a].successfulRequests / Math.max(1, results[a].totalRequests);
      const rateB = results[b].successfulRequests / Math.max(1, results[b].totalRequests);
      return rateB - rateA;
    })[0];

    const balanced = [...algos].sort(
      (a, b) => results[a].loadImbalanceScore - results[b].loadImbalanceScore
    )[0];

    return {
      fastest: {
        algo: fastest,
        val: `${results[fastest]?.avgResponseTimeMs.toFixed(1)} ms`,
      },
      throughput: {
        algo: throughput,
        val: `${results[throughput]?.throughputRps.toFixed(1)} rps`,
      },
      reliable: {
        algo: reliable,
        val: `${(
          (results[reliable]?.successfulRequests /
            Math.max(1, results[reliable]?.totalRequests)) *
          100
        ).toFixed(1)}%`,
      },
      balanced: {
        algo: balanced,
        val: results[balanced]?.loadImbalanceScore.toFixed(3),
      },
    };
  }, [results, selectedAlgorithms]);

  const activeResultList = selectedAlgorithms
    .map((algo) => results[algo])
    .filter((r): r is AlgorithmPerformance => !!r && r.totalRequests > 0);

  if (activeResultList.length === 0) {
    return (
      <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-6 text-center text-xs text-slate-500 font-mono">
        Awaiting simulation execution data. Run simulation above to generate evaluation metrics.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-5 space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21262d] pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            BENCHMARK EVALUATION MATRIX
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Empirical comparative metrics under identical synthetic load conditions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          {onExportJson && (
            <button
              onClick={onExportJson}
              className="px-2.5 py-1 rounded bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white transition-colors"
            >
              Export JSON
            </button>
          )}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="px-2.5 py-1 rounded bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white transition-colors"
            >
              Export CSV
            </button>
          )}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              Saved Runs
            </button>
          )}
        </div>
      </div>

      {/* Top Summary Metric Cards */}
      {champions && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-lg border border-[#21262d] bg-[#161b22] flex flex-col justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase">MIN LATENCY</div>
            <div className="my-1 text-sm font-bold text-white">
              {ALGO_LABELS[champions.fastest.algo]?.name}
            </div>
            <div className="text-[11px] font-mono text-sky-400">{champions.fastest.val}</div>
          </div>

          <div className="p-3 rounded-lg border border-[#21262d] bg-[#161b22] flex flex-col justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase">PEAK THROUGHPUT</div>
            <div className="my-1 text-sm font-bold text-white">
              {ALGO_LABELS[champions.throughput.algo]?.name}
            </div>
            <div className="text-[11px] font-mono text-emerald-400">{champions.throughput.val}</div>
          </div>

          <div className="p-3 rounded-lg border border-[#21262d] bg-[#161b22] flex flex-col justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase">SUCCESS RATE</div>
            <div className="my-1 text-sm font-bold text-white">
              {ALGO_LABELS[champions.reliable.algo]?.name}
            </div>
            <div className="text-[11px] font-mono text-purple-400">{champions.reliable.val}</div>
          </div>

          <div className="p-3 rounded-lg border border-[#21262d] bg-[#161b22] flex flex-col justify-between">
            <div className="text-[10px] font-mono text-slate-400 uppercase">MIN IMBALANCE</div>
            <div className="my-1 text-sm font-bold text-white">
              {ALGO_LABELS[champions.balanced.algo]?.name}
            </div>
            <div className="text-[11px] font-mono text-amber-400">Score: {champions.balanced.val}</div>
          </div>
        </div>
      )}

      {/* Segmented View Switcher */}
      <div className="flex items-center gap-1.5 border-b border-[#21262d] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === "matrix"
              ? "bg-[#21262d] text-white font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Performance Table
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === "distribution"
              ? "bg-[#21262d] text-white font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Cluster Traffic Distribution
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === "insights"
              ? "bg-[#21262d] text-white font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Algorithmic Trade-offs
        </button>
      </div>

      {/* TAB 1: METRICS TABLE */}
      {activeTab === "matrix" && (
        <div className="tab-enter-anim overflow-x-auto border border-[#21262d] rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#161b22] text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">ALGORITHM</th>
                <th className="py-2.5 px-2 text-right">TOTAL</th>
                <th className="py-2.5 px-2 text-right">PASS %</th>
                <th className="py-2.5 px-2 text-right">THROUGHPUT</th>
                <th className="py-2.5 px-2 text-right">AVG LATENCY</th>
                <th className="py-2.5 px-2 text-right">P50</th>
                <th className="py-2.5 px-2 text-right">P95 TAIL</th>
                <th className="py-2.5 px-2 text-right">MIN / MAX</th>
                <th className="py-2.5 px-2 text-right">QUEUE</th>
                <th className="py-2.5 px-3 text-right">IMBALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] font-mono text-[11px]">
              {activeResultList.map((m) => {
                const info = ALGO_LABELS[m.algorithmId];
                const successRate = ((m.successfulRequests / Math.max(1, m.totalRequests)) * 100).toFixed(1);

                return (
                  <tr key={m.algorithmId} className="hover:bg-[#161b22]/50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{info?.name}</span>
                        <span className="text-[9px] font-mono text-slate-500">[{info?.tag}]</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-right text-slate-300">{m.totalRequests}</td>

                    <td className="py-2.5 px-2 text-right">
                      <span
                        className={
                          Number(successRate) >= 95
                            ? "text-emerald-400 font-semibold"
                            : "text-amber-400 font-semibold"
                        }
                      >
                        {successRate}%
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-right text-slate-200">
                      {m.throughputRps.toFixed(1)} rps
                    </td>

                    <td className="py-2.5 px-2 text-right text-white font-semibold">
                      {m.avgResponseTimeMs.toFixed(1)} ms
                    </td>

                    <td className="py-2.5 px-2 text-right text-slate-300">
                      {m.medianResponseTimeMs.toFixed(1)} ms
                    </td>

                    <td className="py-2.5 px-2 text-right text-amber-300 font-semibold">
                      {m.p95ResponseTimeMs.toFixed(1)} ms
                    </td>

                    <td className="py-2.5 px-2 text-right text-slate-400">
                      {m.minResponseTimeMs.toFixed(0)} / {m.maxResponseTimeMs.toFixed(0)} ms
                    </td>

                    <td className="py-2.5 px-2 text-right text-slate-300">
                      {m.avgQueueWaitMs.toFixed(1)} ms
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#161b22] text-slate-300 border border-[#21262d]">
                        {m.loadImbalanceScore.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DISTRIBUTION BARS */}
      {activeTab === "distribution" && (
        <div className="tab-enter-anim space-y-3 font-mono text-xs">
          {activeResultList.map((m) => {
            const info = ALGO_LABELS[m.algorithmId];
            return (
              <div key={m.algorithmId} className="p-3 rounded-lg border border-[#21262d] bg-[#161b22]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{info?.name}</span>
                  <span className="text-[11px] text-slate-400">
                    Imbalance: {m.loadImbalanceScore.toFixed(3)}
                  </span>
                </div>

                {/* Multi-segment distribution progress bar */}
                <div className="h-2.5 w-full bg-[#0d1117] rounded-full overflow-hidden flex border border-[#21262d]">
                  {servers.map((srv, idx) => {
                    const sharePct = m.serverPercentages[srv.id] || 0;
                    if (sharePct === 0) return null;
                    const colors = [
                      "bg-sky-500",
                      "bg-purple-500",
                      "bg-emerald-500",
                      "bg-amber-500",
                      "bg-cyan-500",
                    ];
                    const color = colors[idx % colors.length];

                    return (
                      <div
                        key={srv.id}
                        style={{ width: `${sharePct}%` }}
                        className={`${color} h-full`}
                        title={`${srv.name}: ${sharePct.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1">
                  {servers.map((srv) => {
                    const sharePct = m.serverPercentages[srv.id] || 0;
                    const count = m.serverDistribution[srv.id] || 0;
                    return (
                      <div key={srv.id} className="flex justify-between px-2 py-1 rounded bg-[#0d1117] border border-[#21262d]">
                        <span className="text-slate-400">{srv.name.split(" ")[0]}</span>
                        <span className="text-slate-200">{sharePct.toFixed(1)}% ({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: INSIGHTS */}
      {activeTab === "insights" && (
        <div className="tab-enter-anim space-y-2 text-xs">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-[#21262d] bg-[#161b22]/50 text-slate-300 leading-relaxed font-mono text-[11px]"
            >
              {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
