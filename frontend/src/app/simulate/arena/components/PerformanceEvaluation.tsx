"use client";

import { useMemo, useState } from "react";
import {
  AlgorithmPerformance,
  AlgorithmType,
  SimulationRunHistory,
  VirtualServer,
} from "../types";

interface PerformanceEvaluationProps {
  results: Record<AlgorithmType, AlgorithmPerformance>;
  selectedAlgorithms: AlgorithmType[];
  servers: VirtualServer[];
  insights: string[];
  onOpenHistory?: () => void;
  onExportJson?: () => void;
  onExportCsv?: () => void;
}

const ALGO_TITLES: Record<AlgorithmType, { name: string; color: string; badge: string }> = {
  round_robin: { name: "Round Robin", color: "#60a5fa", badge: "Cyclic Deterministic" },
  random: { name: "Random", color: "#94a3b8", badge: "Stochastic Uniform" },
  least_connections: { name: "Least Connections", color: "#34d399", badge: "State-Aware Dynamic" },
  weighted_round_robin: { name: "Weighted Round Robin", color: "#fbbf24", badge: "Capacity Proportional" },
  ppo: { name: "PPO Policy", color: "#c084fc", badge: "Deep Reinforcement Learning" },
};

export default function PerformanceEvaluation({
  results,
  selectedAlgorithms,
  servers,
  insights,
  onOpenHistory,
  onExportJson,
  onExportCsv,
}: PerformanceEvaluationProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "distribution" | "insights">("summary");

  // Determine category champions dynamically
  const champions = useMemo(() => {
    const algos = selectedAlgorithms.filter((a) => results[a] && results[a].totalRequests > 0);
    if (algos.length === 0) return null;

    // Lowest latency
    const fastest = [...algos].sort(
      (a, b) => results[a].avgResponseTimeMs - results[b].avgResponseTimeMs
    )[0];

    // Highest throughput
    const throughput = [...algos].sort(
      (a, b) => results[b].throughputRps - results[a].throughputRps
    )[0];

    // Most reliable (highest success rate)
    const reliable = [...algos].sort((a, b) => {
      const rateA = results[a].successfulRequests / Math.max(1, results[a].totalRequests);
      const rateB = results[b].successfulRequests / Math.max(1, results[b].totalRequests);
      return rateB - rateA;
    })[0];

    // Most balanced (lowest load imbalance score)
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
        val: `${results[throughput]?.throughputRps.toFixed(1)} req/s`,
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
        val: `Imbalance Coeff: ${results[balanced]?.loadImbalanceScore.toFixed(3)}`,
      },
    };
  }, [results, selectedAlgorithms]);

  const activeResultList = selectedAlgorithms
    .map((algo) => results[algo])
    .filter((r): r is AlgorithmPerformance => !!r && r.totalRequests > 0);

  if (activeResultList.length === 0) {
    return (
      <div className="rounded-2xl border border-[#21262d] bg-[#0d1117]/80 p-8 text-center backdrop-blur-md">
        <p className="text-slate-400 text-sm">
          Simulation results will appear here once the workload begins processing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#21262d] bg-[#0d1117]/90 backdrop-blur-md p-6 shadow-2xl space-y-6">
      {/* Header and Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#21262d] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏆</span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Performance Evaluation & Benchmark Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical comparative analysis derived strictly from identical request conditions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onExportJson && (
            <button
              onClick={onExportJson}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              Export JSON
            </button>
          )}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              Export CSV
            </button>
          )}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              Saved Runs History →
            </button>
          )}
        </div>
      </div>

      {/* Category Champions Cards */}
      {champions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Fastest Response */}
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
                <span>⚡ LOWEST LATENCY</span>
                <span className="font-mono text-white text-xs">{champions.fastest.val}</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {ALGO_TITLES[champions.fastest.algo]?.name}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Delivered fastest average round-trip processing time.
            </p>
          </div>

          {/* Highest Throughput */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                <span>🚀 TOP THROUGHPUT</span>
                <span className="font-mono text-white text-xs">{champions.throughput.val}</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {ALGO_TITLES[champions.throughput.algo]?.name}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Sustained the highest concurrent request completion rate.
            </p>
          </div>

          {/* Highest Reliability */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                <span>🛡️ MAX RELIABILITY</span>
                <span className="font-mono text-white text-xs">{champions.reliable.val}</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {ALGO_TITLES[champions.reliable.algo]?.name}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Minimal rejected or timed-out requests under load.
            </p>
          </div>

          {/* Most Balanced */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
                <span>⚖️ BEST SPREAD</span>
                <span className="font-mono text-white text-xs">{champions.balanced.val}</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {ALGO_TITLES[champions.balanced.algo]?.name}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Lowest variance across heterogeneous virtual nodes.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-[#21262d] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === "summary"
              ? "bg-[#21262d] text-white border border-[#30363d]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Side-by-Side Metrics
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === "distribution"
              ? "bg-[#21262d] text-white border border-[#30363d]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Cluster Traffic Distribution
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === "insights"
              ? "bg-[#21262d] text-white border border-[#30363d]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Educational Observations & Trade-Offs
        </button>
      </div>

      {/* TAB 1: SIDE-BY-SIDE METRICS TABLE */}
      {activeTab === "summary" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#161b22]/60 text-slate-400 font-mono">
                <th className="py-3 px-4 font-normal">ALGORITHM</th>
                <th className="py-3 px-3 font-normal text-right">TOTAL</th>
                <th className="py-3 px-3 font-normal text-right">SUCCESS</th>
                <th className="py-3 px-3 font-normal text-right">THROUGHPUT</th>
                <th className="py-3 px-3 font-normal text-right">AVG LATENCY</th>
                <th className="py-3 px-3 font-normal text-right">MEDIAN (P50)</th>
                <th className="py-3 px-3 font-normal text-right">P95 TAIL</th>
                <th className="py-3 px-3 font-normal text-right">MIN / MAX</th>
                <th className="py-3 px-3 font-normal text-right">AVG QUEUE</th>
                <th className="py-3 px-4 font-normal text-right">IMBALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]/60 font-mono">
              {activeResultList.map((m) => {
                const info = ALGO_TITLES[m.algorithmId];
                const successRate = ((m.successfulRequests / Math.max(1, m.totalRequests)) * 100).toFixed(1);

                return (
                  <tr key={m.algorithmId} className="hover:bg-[#161b22]/40 transition-colors">
                    {/* Algorithm Name */}
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: info?.color || "#fff" }}
                        />
                        <div>
                          <div>{info?.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono font-normal">
                            {info?.badge}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 text-right text-slate-300">{m.totalRequests}</td>

                    {/* Success Rate */}
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          Number(successRate) >= 95
                            ? "text-emerald-400"
                            : Number(successRate) >= 80
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {successRate}%
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {m.failedRequests > 0 ? `${m.failedRequests} fail` : "0 fail"}
                      </div>
                    </td>

                    {/* Throughput */}
                    <td className="py-3.5 px-3 text-right text-slate-200 font-semibold">
                      {m.throughputRps.toFixed(1)} <span className="text-[10px] text-slate-500">rps</span>
                    </td>

                    {/* Avg Latency */}
                    <td className="py-3.5 px-3 text-right text-white font-semibold">
                      {m.avgResponseTimeMs.toFixed(1)} <span className="text-[10px] text-slate-500">ms</span>
                    </td>

                    {/* Median */}
                    <td className="py-3.5 px-3 text-right text-slate-300">
                      {m.medianResponseTimeMs.toFixed(1)} ms
                    </td>

                    {/* P95 */}
                    <td className="py-3.5 px-3 text-right text-amber-300">
                      {m.p95ResponseTimeMs.toFixed(1)} ms
                    </td>

                    {/* Min / Max */}
                    <td className="py-3.5 px-3 text-right text-slate-400 text-[11px]">
                      {m.minResponseTimeMs.toFixed(0)} / {m.maxResponseTimeMs.toFixed(0)} ms
                    </td>

                    {/* Avg Queue Wait */}
                    <td className="py-3.5 px-3 text-right text-slate-300">
                      {m.avgQueueWaitMs.toFixed(1)} ms
                    </td>

                    {/* Imbalance Score */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] border ${
                          m.loadImbalanceScore < 0.25
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : m.loadImbalanceScore < 0.5
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
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

      {/* TAB 2: CLUSTER TRAFFIC DISTRIBUTION */}
      {activeTab === "distribution" && (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            Percentage share of requests allocated to each node in the cluster. Balanced algorithms
            adapt to node capacity and prevent bottlenecking on low-spec servers.
          </p>

          <div className="space-y-5">
            {activeResultList.map((m) => {
              const info = ALGO_TITLES[m.algorithmId];
              return (
                <div
                  key={m.algorithmId}
                  className="p-4 rounded-xl border border-[#21262d] bg-[#161b22]/40 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: info?.color || "#fff" }}
                      />
                      {info?.name}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      Imbalance Coeff: {m.loadImbalanceScore.toFixed(3)}
                    </span>
                  </div>

                  {/* Multi-segment distribution progress bar */}
                  <div className="h-4 w-full bg-[#0d1117] rounded-full overflow-hidden flex border border-[#30363d]/50">
                    {servers.map((srv, idx) => {
                      const sharePct = m.serverPercentages[srv.id] || 0;
                      if (sharePct === 0) return null;
                      // Dynamic color palette per server node
                      const colors = [
                        "bg-blue-500",
                        "bg-purple-500",
                        "bg-emerald-500",
                        "bg-amber-500",
                        "bg-cyan-500",
                        "bg-rose-500",
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <div
                          key={srv.id}
                          style={{ width: `${sharePct}%` }}
                          className={`${color} h-full relative group transition-all duration-300`}
                          title={`${srv.name}: ${sharePct.toFixed(1)}% (${m.serverDistribution[srv.id] || 0} reqs)`}
                        />
                      );
                    })}
                  </div>

                  {/* Node breakdown pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {servers.map((srv, idx) => {
                      const sharePct = m.serverPercentages[srv.id] || 0;
                      const count = m.serverDistribution[srv.id] || 0;
                      const colors = [
                        "text-blue-400 border-blue-500/20 bg-blue-500/5",
                        "text-purple-400 border-purple-500/20 bg-purple-500/5",
                        "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
                        "text-amber-400 border-amber-500/20 bg-amber-500/5",
                        "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
                        "text-rose-400 border-rose-500/20 bg-rose-500/5",
                      ];
                      const style = colors[idx % colors.length];

                      return (
                        <div
                          key={srv.id}
                          className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${style}`}
                        >
                          <div className="truncate font-semibold text-slate-200">{srv.name}</div>
                          <div className="font-mono text-[11px] mt-1 flex justify-between">
                            <span>{sharePct.toFixed(1)}%</span>
                            <span className="text-slate-400">({count} reqs)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EDUCATIONAL OBSERVATIONS & TRADE-OFFS */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Algorithmic insights derived dynamically from runtime data, queue pressure, and node capacity:
          </p>

          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs text-slate-300 leading-relaxed flex items-start gap-3"
              >
                <span className="text-purple-400 text-sm mt-0.5">✦</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-[#21262d] bg-[#161b22]/50 text-xs text-slate-400 space-y-2">
            <h5 className="font-bold text-slate-200 text-xs">Architectural Rule of Thumb:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>
                <strong>Static Round Robin:</strong> Ideal for completely homogeneous clusters with uniform query execution times. Degrades during variable workloads.
              </li>
              <li>
                <strong>Least Connections:</strong> Excels in long-lived TCP sessions, WebSocket streams, or high computational variance workloads.
              </li>
              <li>
                <strong>PPO Reinforcement Learning:</strong> Proactively anticipates traffic surges and server saturation using historical latency gradients, avoiding queue buildup before it happens.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
