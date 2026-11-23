"use client";

import { SimulationState, SimulationSpeed, WorkloadConfig } from "../types";

interface Props {
  state: SimulationState;
  speed: SimulationSpeed;
  progressPercent: number;
  virtualTimeMs: number;
  workloadConfig: WorkloadConfig;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: SimulationSpeed) => void;
  onOpenWorkloadModal: () => void;
  onOpenServerModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenGuideModal: () => void;
  canStart: boolean;
}

export default function ArenaControls({
  state,
  speed,
  progressPercent,
  virtualTimeMs,
  workloadConfig,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onSpeedChange,
  onOpenWorkloadModal,
  onOpenServerModal,
  onOpenHistoryModal,
  onOpenGuideModal,
  canStart,
}: Props) {
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isCompleted = state === "completed";

  return (
    <div
      style={{
        backgroundColor: "rgba(18, 22, 31, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "18px 22px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        {/* Left Side: Simulation State Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {state === "idle" && (
            <button
              onClick={onStart}
              disabled={!canStart}
              style={{
                padding: "10px 24px",
                backgroundColor: canStart ? "#a855f7" : "#4b5563",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: canStart ? "pointer" : "not-allowed",
                boxShadow: canStart ? "0 4px 18px rgba(168, 85, 247, 0.4)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              ▶ Start Simulation
            </button>
          )}

          {isRunning && (
            <>
              <button
                onClick={onPause}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#eab308",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000000",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⏸ Pause
              </button>

              <button
                onClick={onStop}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ■ Stop
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={onResume}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#10b981",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ▶ Resume
              </button>

              <button
                onClick={onStop}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ■ Stop
              </button>
            </>
          )}

          {(isCompleted || state === "stopped") && (
            <>
              <button
                onClick={onStart}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#a855f7",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(168, 85, 247, 0.4)",
                }}
              >
                ↺ Run Again
              </button>

              <button
                onClick={onReset}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "#cbd5e1",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </>
          )}

          {/* Speed Selector */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "3px", border: "1px solid rgba(255,255,255,0.08)", marginLeft: "4px" }}>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", padding: "0 8px", textTransform: "uppercase", fontWeight: 700 }}>
              Speed:
            </span>
            {([0.5, 1, 2, 4] as SimulationSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                style={{
                  padding: "4px 9px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: speed === s ? 700 : 500,
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: speed === s ? "#a855f7" : "transparent",
                  color: speed === s ? "#ffffff" : "#94a3b8",
                  transition: "all 0.15s ease",
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Setup & Modal Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={onOpenWorkloadModal}
            disabled={isRunning}
            style={{
              padding: "7px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: isRunning ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>⚙️ Traffic Workload ({workloadConfig.totalRequests} reqs / {workloadConfig.pattern})</span>
          </button>

          <button
            onClick={onOpenServerModal}
            disabled={isRunning}
            style={{
              padding: "7px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: isRunning ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🖥️ Virtual Cluster</span>
          </button>

          <button
            onClick={onOpenHistoryModal}
            style={{
              padding: "7px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📜 Run History
          </button>

          <button
            onClick={onOpenGuideModal}
            style={{
              padding: "7px 14px",
              backgroundColor: "rgba(167, 139, 250, 0.12)",
              border: "1px solid rgba(167, 139, 250, 0.3)",
              borderRadius: "8px",
              color: "#a78bfa",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📖 Algorithm Theory
          </button>
        </div>
      </div>

      {/* Progress Bar & Telemetry Status */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "6px" }}>
          <span>
            Status: <strong style={{ color: isRunning ? "#34d399" : isPaused ? "#f59e0b" : isCompleted ? "#a78bfa" : "#cbd5e1", textTransform: "uppercase" }}>{state}</strong>
            {" • "}
            Simulated Clock: <strong style={{ color: "#ffffff" }}>{(virtualTimeMs / 1000).toFixed(2)}s</strong>
          </span>
          <span>{progressPercent}% Complete</span>
        </div>

        <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: isCompleted ? "#a855f7" : "#10b981",
              borderRadius: "999px",
              transition: "width 0.2s linear",
              boxShadow: isCompleted ? "0 0 10px #a855f7" : "0 0 10px #10b981",
            }}
          />
        </div>
      </div>
    </div>
  );
}
