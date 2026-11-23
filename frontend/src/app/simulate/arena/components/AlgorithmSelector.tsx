"use client";

import { useEffect, useState } from "react";
import { AlgorithmType, AlgorithmInfo } from "../types";
import { PPOPolicyBalancer } from "../algorithms/ppoPolicy";

interface Props {
  selectedAlgorithms: AlgorithmType[];
  onToggleAlgorithm: (algo: AlgorithmType) => void;
  serverWeights: Record<string, number>;
  onUpdateWeight: (serverId: string, weight: number) => void;
  serverIds: string[];
}

export const ALGORITHM_METADATA: Record<AlgorithmType, AlgorithmInfo> = {
  round_robin: {
    id: "round_robin",
    name: "Round Robin",
    shortName: "RR",
    color: "#38bdf8",
    tagline: "Sequential Cyclical",
    explanation: "Routes each incoming request to the next server in sequence.",
    routingStrategy: "Deterministic modular index increment across healthy nodes.",
    pros: ["Zero memory overhead", "Fair for uniform jobs", "Stateless"],
    cons: ["Blind to server load", "Hotspots on uneven durations"],
    bestFor: "Uniform servers with short identical requests.",
    status: "available",
    statusBadge: "Heuristic",
  },
  random: {
    id: "random",
    name: "Random Selection",
    shortName: "RND",
    color: "#94a3b8",
    tagline: "Uniform Stochastic",
    explanation: "Selects an operational server uniformly at random.",
    routingStrategy: "Pseudo-random uniform draw across available healthy nodes.",
    pros: ["Stateless", "Scalable in distributed mesh", "Low coordination"],
    cons: ["Statistical clustering creates transient hotspots"],
    bestFor: "High-volume distributed stateless microservices.",
    status: "available",
    statusBadge: "Heuristic",
  },
  least_connections: {
    id: "least_connections",
    name: "Least Connections",
    shortName: "LC",
    color: "#34d399",
    tagline: "Active Socket Minimization",
    explanation: "Directs traffic to the server with lowest active concurrent sockets.",
    routingStrategy: "Selects argmin(activeRequests) among healthy servers.",
    pros: ["Adapts to varying request durations", "Low tail latency", "Drains loaded nodes"],
    cons: ["Requires real-time connection tracking across threads"],
    bestFor: "Workloads with variable duration or streaming connections.",
    status: "available",
    statusBadge: "Dynamic",
  },
  weighted_round_robin: {
    id: "weighted_round_robin",
    name: "Weighted Round Robin",
    shortName: "WRR",
    color: "#fbbf24",
    tagline: "Capacity Proportional",
    explanation: "Dispatches requests cyclically according to assigned hardware weights.",
    routingStrategy: "Smooth interleaved deficit round-robin based on relative server capacity weights.",
    pros: ["Handles mixed hardware capacities", "Deterministic share allocation"],
    cons: ["Static weights fail to adapt to unexpected node lag"],
    bestFor: "Heterogeneous clusters with mixed compute tiers.",
    status: "available",
    statusBadge: "Weighted",
  },
  ppo: {
    id: "ppo",
    name: "PPO Policy",
    shortName: "PPO",
    color: "#a78bfa",
    tagline: "Neural Reinforcement Learning",
    explanation: "Actor-critic policy optimizing latency, queue backpressure, and SLA margins.",
    routingStrategy: "Infers optimal node probability distribution from server state telemetry.",
    pros: ["Adaptive to traffic surges", "Multi-objective optimization"],
    cons: ["Inference latency overhead (~0.8ms)"],
    bestFor: "High-concurrency cloud environments with volatile traffic bursts.",
    status: "simulated_model",
    statusBadge: "Simulated Model",
  },
};

export default function AlgorithmSelector({
  selectedAlgorithms,
  onToggleAlgorithm,
  serverWeights,
  onUpdateWeight,
  serverIds,
}: Props) {
  const [ppoBadge, setPpoBadge] = useState<string>("Simulated Model");

  useEffect(() => {
    PPOPolicyBalancer.checkBackendAvailability().then((res) => {
      setPpoBadge(res.isBackendLive ? "Backend Connected" : "Simulated Model");
    });
  }, []);

  const hasWeighted = selectedAlgorithms.includes("weighted_round_robin");

  return (
    <div className="space-y-3">
      {/* Selector Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {(Object.keys(ALGORITHM_METADATA) as AlgorithmType[]).map((key) => {
          const meta = ALGORITHM_METADATA[key];
          const isSelected = selectedAlgorithms.includes(key);
          const badgeText = key === "ppo" ? ppoBadge : meta.statusBadge;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleAlgorithm(key)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "bg-[#161b22] border-purple-500/60 shadow-sm shadow-purple-500/10"
                  : "bg-[#0d1117] border-[#21262d] hover:border-slate-700 opacity-60 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-semibold text-slate-400 uppercase">
                    {meta.shortName}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? "bg-purple-400" : "bg-slate-600"
                    }`}
                  />
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {meta.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  {meta.tagline}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#21262d] flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#21262d]">
                  {badgeText}
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {isSelected ? "Active" : "Off"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Weights Editor if Weighted Round Robin is active */}
      {hasWeighted && (
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 font-mono text-[11px]">
            <span className="font-semibold text-amber-400">WRR Node Weights:</span> Allocate relative traffic proportion per node
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {serverIds.map((id) => (
              <div key={id} className="flex items-center gap-1.5 bg-[#0d1117] border border-[#21262d] px-2 py-1 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{id.replace("srv-", "")}</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={serverWeights[id] ?? 1}
                  onChange={(e) => onUpdateWeight(id, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 bg-[#161b22] border border-[#30363d] rounded text-center text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
