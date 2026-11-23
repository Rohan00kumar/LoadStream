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
    color: "#94a3b8",
    tagline: "Sequential Cyclical Routing",
    explanation:
      "Routes each incoming request to the next server in cyclical sequence (1 → 2 → 3 → 4 → 1).",
    routingStrategy: "Deterministic index increment across healthy nodes.",
    pros: ["Zero memory overhead", "Fair distribution for uniform jobs", "Stateless & fast"],
    cons: ["Blind to server load differences", "Causes hot-spots if job execution time varies"],
    bestFor: "Uniform, homogeneous servers with short identical requests.",
    status: "available",
    statusBadge: "Built-in Heuristic",
  },
  random: {
    id: "random",
    name: "Random Selection",
    shortName: "RND",
    color: "#60a5fa",
    tagline: "Uniform Pseudo-Random Distribution",
    explanation:
      "Selects an operational server uniformly at random from the active cluster pool.",
    routingStrategy: "Pseudo-random uniform draw across available healthy nodes.",
    pros: ["Zero shared state synchronization", "Highly scalable in distributed mesh", "Extremely fast"],
    cons: ["Statistical clustering creates transient hot-spots", "No load or capacity awareness"],
    bestFor: "Massive scale microservices with distributed stateless proxies.",
    status: "available",
    statusBadge: "Built-in Heuristic",
  },
  least_connections: {
    id: "least_connections",
    name: "Least Connections",
    shortName: "LC",
    color: "#34d399",
    tagline: "Active Socket Minimization",
    explanation:
      "Directs traffic to the server with the lowest number of active concurrent TCP connections.",
    routingStrategy: "Selects argmin(activeRequests) among healthy servers.",
    pros: ["Adapts to varying request durations", "Drains overloaded servers naturally", "Low tail latency"],
    cons: ["Requires real-time connection tracking", "Can overload slow servers with low socket counts"],
    bestFor: "Mixed workloads with long-lived transactions (e.g. streaming, heavy queries).",
    status: "available",
    statusBadge: "Built-in Dynamic",
  },
  weighted_round_robin: {
    id: "weighted_round_robin",
    name: "Weighted Round Robin",
    shortName: "WRR",
    color: "#fbbf24",
    tagline: "Capacity-Proportional Distribution",
    explanation:
      "Dispatches requests cyclically according to assigned hardware weights (e.g. 3x to 8-core, 1x to 2-core).",
    routingStrategy: "Smooth interleaved deficit round-robin based on relative server capacity weights.",
    pros: ["Supports heterogeneous hardware", "Prevents weak nodes from taking heavy shares", "Deterministic"],
    cons: ["Static weights cannot predict dynamic traffic bursts or background node lag"],
    bestFor: "Multi-tier clusters with mixed hardware capabilities (e.g. Edge vs Core servers).",
    status: "available",
    statusBadge: "Configurable Weights",
  },
  ppo: {
    id: "ppo",
    name: "PPO Neural Policy",
    shortName: "PPO",
    color: "#a78bfa",
    tagline: "Proximal Policy Optimization (RL)",
    explanation:
      "A deep reinforcement learning actor-critic policy that predicts multi-objective SLA trade-offs (CPU, memory, queues).",
    routingStrategy:
      "Maximizes expected cumulative reward minimizing tail latency and SLA timeout penalties.",
    pros: ["Self-learning & adaptive", "Anticipates bottleneck surges", "Optimizes multi-resource trade-offs"],
    cons: ["Inference overhead (~0.8ms)", "Requires training data & reward calibration"],
    bestFor: "High-concurrency cloud environments with volatile traffic bursts and tight SLA constraints.",
    status: "simulated_model",
    statusBadge: "Simulated Neural Policy (Offline Checkpoint)",
  },
};

export default function AlgorithmSelector({
  selectedAlgorithms,
  onToggleAlgorithm,
  serverWeights,
  onUpdateWeight,
  serverIds,
}: Props) {
  const [ppoBadge, setPpoBadge] = useState<string>(ALGORITHM_METADATA.ppo.statusBadge);
  const [expandedAlgo, setExpandedAlgo] = useState<AlgorithmType | null>(null);

  useEffect(() => {
    PPOPolicyBalancer.checkBackendAvailability().then((res) => {
      setPpoBadge(res.label);
    });
  }, []);

  return (
    <div
      style={{
        backgroundColor: "rgba(18, 22, 31, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "22px 24px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
            Select Competing Algorithms
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Choose one or multiple algorithms to run simultaneously under identical workload conditions.
          </p>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#a78bfa", backgroundColor: "rgba(167, 139, 250, 0.1)", border: "1px solid rgba(167, 139, 250, 0.25)", padding: "4px 12px", borderRadius: "8px" }}>
          {selectedAlgorithms.length} selected for comparison
        </div>
      </div>

      {/* Grid of algorithm cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {(Object.keys(ALGORITHM_METADATA) as AlgorithmType[]).map((key) => {
          const meta = ALGORITHM_METADATA[key];
          const isSelected = selectedAlgorithms.includes(key);
          const badgeText = key === "ppo" ? ppoBadge : meta.statusBadge;

          return (
            <div
              key={key}
              style={{
                position: "relative",
                backgroundColor: isSelected ? "rgba(255, 255, 255, 0.06)" : "rgba(13, 17, 23, 0.6)",
                border: isSelected ? `1.5px solid ${meta.color}` : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.22s ease",
                boxShadow: isSelected ? `0 0 16px ${meta.color}22` : "none",
              }}
              onClick={() => onToggleAlgorithm(key)}
            >
              {/* Top row: Checkbox & Short Tag */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent onClick
                    style={{ accentColor: meta.color, width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <strong style={{ fontSize: "0.98rem", color: "#ffffff" }}>{meta.name}</strong>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: `${meta.color}20`,
                    color: meta.color,
                  }}
                >
                  {meta.shortName}
                </span>
              </div>

              {/* Tagline */}
              <div style={{ fontSize: "0.78rem", color: meta.color, fontWeight: 600, marginBottom: "8px" }}>
                {meta.tagline}
              </div>

              {/* Explanation */}
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.45, marginBottom: "12px" }}>
                {meta.explanation}
              </p>

              {/* Status Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: key === "ppo" && ppoBadge.includes("Simulated") ? "#fbbf24" : "#cbd5e1",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {badgeText}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedAlgo(expandedAlgo === key ? null : key);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#818cf8",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {expandedAlgo === key ? "Less info" : "Details"}
                </button>
              </div>

              {/* Details Drawer if expanded */}
              {expandedAlgo === key && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px dashed rgba(255, 255, 255, 0.1)",
                    fontSize: "0.78rem",
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ marginBottom: "6px" }}>
                    <strong style={{ color: meta.color }}>Routing Strategy:</strong> {meta.routingStrategy}
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <strong style={{ color: "#34d399" }}>Pros:</strong> {meta.pros.join(", ")}
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    <strong style={{ color: "#f87171" }}>Cons:</strong> {meta.cons.join(", ")}
                  </div>
                  <div>
                    <strong style={{ color: "#fbbf24" }}>Best for:</strong> {meta.bestFor}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weighted Round Robin Specific Config (if selected) */}
      {selectedAlgorithms.includes("weighted_round_robin") && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            backgroundColor: "rgba(251, 191, 36, 0.07)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", marginBottom: "8px" }}>
            Weighted Round Robin — Server Capacity Weights:
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {serverIds.map((srvId) => (
              <div key={srvId} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                <span>{srvId}:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={serverWeights[srvId] || 1}
                  onChange={(e) => onUpdateWeight(srvId, parseInt(e.target.value) || 1)}
                  style={{
                    width: "48px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    color: "#ffffff",
                    padding: "2px 6px",
                    fontSize: "0.8rem",
                  }}
                />
                <span style={{ color: "#94a3b8" }}>x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
