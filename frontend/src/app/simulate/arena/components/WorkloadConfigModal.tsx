"use client";

import { WorkloadConfig, WorkloadPattern, RequestComplexity } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: WorkloadConfig;
  onSave: (newConfig: WorkloadConfig) => void;
}

export default function WorkloadConfigModal({ isOpen, onClose, config, onSave }: Props) {
  if (!isOpen) return null;

  const patterns: { id: WorkloadPattern; label: string; desc: string }[] = [
    { id: "constant", label: "Constant Traffic", desc: "Steady uniform ingress rate" },
    { id: "ramp_up", label: "Gradual Ramp-Up", desc: "Linearly accelerates from 20% to 100% capacity" },
    { id: "spike", label: "Sudden Spike", desc: "Massive 5x traffic surge in the middle duration" },
    { id: "burst", label: "Burst Traffic", desc: "Alternating high pulses and quiet lulls" },
    { id: "random", label: "Poisson Random", desc: "Stochastic inter-arrival distribution" },
  ];

  const complexities: { id: RequestComplexity; label: string; desc: string }[] = [
    { id: "light", label: "Light", desc: "15-30ms execution, ~6% CPU" },
    { id: "medium", label: "Medium", desc: "45-85ms execution, ~15% CPU" },
    { id: "heavy", label: "Heavy", desc: "140-260ms execution, ~35% CPU" },
    { id: "mixed", label: "Mixed Realistic", desc: "60% Light, 30% Med, 10% Heavy" },
  ];

  const applyPreset = (preset: "steady" | "spike" | "burst" | "stress") => {
    if (preset === "steady") {
      onSave({ ...config, totalRequests: 200, requestsPerSecond: 25, pattern: "constant", complexity: "mixed" });
    } else if (preset === "spike") {
      onSave({ ...config, totalRequests: 300, requestsPerSecond: 40, pattern: "spike", complexity: "mixed" });
    } else if (preset === "burst") {
      onSave({ ...config, totalRequests: 250, requestsPerSecond: 30, pattern: "burst", complexity: "heavy" });
    } else if (preset === "stress") {
      onSave({ ...config, totalRequests: 500, requestsPerSecond: 60, pattern: "ramp_up", complexity: "mixed" });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#111622",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "26px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>Configure Workload Generator</h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Set request volume, arrival patterns, and computational complexity.</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
            Quick Presets:
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "steady", label: "Steady Traffic (200 reqs)" },
              { id: "spike", label: "Flash Spike (300 reqs)" },
              { id: "burst", label: "Microbursts (250 reqs)" },
              { id: "stress", label: "Stress Test (500 reqs)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id as any)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: "rgba(167, 139, 250, 0.1)",
                  border: "1px solid rgba(167, 139, 250, 0.25)",
                  color: "#c084fc",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "22px" }}>
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "6px" }}>
              <span>Total Requests</span>
              <strong style={{ color: "#a78bfa" }}>{config.totalRequests}</strong>
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={config.totalRequests}
              onChange={(e) => onSave({ ...config, totalRequests: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "#a855f7" }}
            />
          </div>

          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "6px" }}>
              <span>Target Rate (Req/Sec)</span>
              <strong style={{ color: "#34d399" }}>{config.requestsPerSecond} RPS</strong>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={config.requestsPerSecond}
              onChange={(e) => onSave({ ...config, requestsPerSecond: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "#10b981" }}
            />
          </div>
        </div>

        {/* Traffic Arrival Patterns */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Traffic Arrival Pattern:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            {patterns.map((pat) => (
              <div
                key={pat.id}
                onClick={() => onSave({ ...config, pattern: pat.id })}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: config.pattern === pat.id ? "1.5px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: config.pattern === pat.id ? "rgba(168, 85, 247, 0.15)" : "rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: config.pattern === pat.id ? "#ffffff" : "#cbd5e1" }}>
                  {pat.label}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{pat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Complexity */}
        <div style={{ marginBottom: "22px" }}>
          <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Request Complexity:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            {complexities.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onSave({ ...config, complexity: comp.id })}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: config.complexity === comp.id ? "1.5px solid #34d399" : "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: config.complexity === comp.id ? "rgba(16, 185, 129, 0.12)" : "rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ fontSize: "0.84rem", fontWeight: 700, color: config.complexity === comp.id ? "#ffffff" : "#cbd5e1" }}>
                  {comp.label}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{comp.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reproducibility Seed */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Random Seed (Reproducibility):</span>
            <input
              type="number"
              value={config.seed}
              onChange={(e) => onSave({ ...config, seed: parseInt(e.target.value) || 42 })}
              style={{
                width: "70px",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
                color: "#ffffff",
                padding: "4px 8px",
                fontSize: "0.8rem",
              }}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
