"use client";

import { AlgorithmType, VirtualServer, ServerLiveMetrics, RequestResult } from "../types";
import { ALGORITHM_METADATA } from "./AlgorithmSelector";

interface Props {
  selectedAlgorithms: AlgorithmType[];
  servers: VirtualServer[];
  laneMetrics: Record<AlgorithmType, Record<string, ServerLiveMetrics>>;
  laneResults: Record<AlgorithmType, RequestResult[]>;
  onToggleServerFail: (serverId: string) => void;
  isSimulating: boolean;
}

export default function VisualArenaLanes({
  selectedAlgorithms,
  servers,
  laneMetrics,
  laneResults,
  onToggleServerFail,
  isSimulating,
}: Props) {
  if (selectedAlgorithms.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px",
          backgroundColor: "rgba(18, 22, 31, 0.5)",
          borderRadius: "14px",
          border: "1px dashed rgba(255, 255, 255, 0.1)",
          marginBottom: "24px",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          Please select at least one algorithm above to view the live simulation environment.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "28px" }}>
      {selectedAlgorithms.map((algoKey) => {
        const meta = ALGORITHM_METADATA[algoKey];
        const metrics = laneMetrics[algoKey] || {};
        const results = laneResults[algoKey] || [];
        const successCount = results.filter((r) => r.status === "success").length;
        const failCount = results.filter((r) => r.status !== "success").length;

        // Recent routed server
        const lastResult = results[results.length - 1];
        const lastTargetServerId = lastResult?.serverId;

        return (
          <div
            key={algoKey}
            style={{
              backgroundColor: "rgba(18, 22, 31, 0.75)",
              border: `1.5px solid ${meta.color}40`,
              borderRadius: "14px",
              padding: "20px 22px",
              boxShadow: `0 8px 30px ${meta.color}10`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Bar: Algorithm Name & Live Telemetry Counters */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "14px",
                marginBottom: "18px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    backgroundColor: `${meta.color}25`,
                    color: meta.color,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                  }}
                >
                  {meta.shortName}
                </span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff" }}>
                  {meta.name}
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  — {meta.tagline}
                </span>
              </div>

              {/* Lane Scoreboard */}
              <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "0.82rem" }}>
                <div>
                  <span style={{ color: "#94a3b8" }}>Processed: </span>
                  <strong style={{ color: "#ffffff" }}>{results.length}</strong>
                </div>
                <div>
                  <span style={{ color: "#94a3b8" }}>Success: </span>
                  <strong style={{ color: "#34d399" }}>{successCount}</strong>
                </div>
                {failCount > 0 && (
                  <div>
                    <span style={{ color: "#94a3b8" }}>Dropped: </span>
                    <strong style={{ color: "#f87171" }}>{failCount}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Flow Pipeline: Ingress -> Router -> Server Cluster */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 100px 1fr",
                alignItems: "center",
                gap: "16px",
              }}
            >
              {/* 1. Ingress Stream / Request Queue */}
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "10px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "140px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                  Ingress Influx
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    border: "1.5px solid rgba(59, 130, 246, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    marginBottom: "8px",
                    animation: isSimulating ? "pulse 1.2s infinite" : "none",
                  }}
                >
                  ⚡
                </div>
                <span style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                  {isSimulating ? "Active Traffic Stream" : "Standby Ingress"}
                </span>
              </div>

              {/* 2. Central Router Node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    backgroundColor: `${meta.color}20`,
                    border: `2px solid ${meta.color}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSimulating ? `0 0 20px ${meta.color}40` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: meta.color }}>
                    LB
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "#ffffff", fontFamily: "monospace" }}>
                    {meta.shortName}
                  </span>
                </div>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: "6px" }}>Router</span>
              </div>

              {/* 3. Connected Virtual Servers Cluster */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "12px",
                }}
              >
                {servers.map((srv) => {
                  const sMetrics = metrics[srv.id];
                  const activeConns = sMetrics?.activeConnections || 0;
                  const queued = sMetrics?.queuedRequests || 0;
                  const cpu = sMetrics?.cpuUtilizationPercent || 10;
                  const isOffline = srv.status === "offline" || srv.isManualFailed;
                  const isTargeted = lastTargetServerId === srv.id && isSimulating;

                  const cpuColor =
                    cpu > 80 ? "#ef4444" : cpu > 50 ? "#f59e0b" : "#10b981";

                  return (
                    <div
                      key={srv.id}
                      style={{
                        backgroundColor: isOffline
                          ? "rgba(239, 68, 68, 0.05)"
                          : isTargeted
                          ? `${meta.color}12`
                          : "rgba(13, 17, 23, 0.7)",
                        border: isOffline
                          ? "1.5px solid rgba(239, 68, 68, 0.4)"
                          : isTargeted
                          ? `1.5px solid ${meta.color}`
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        padding: "14px",
                        position: "relative",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Server Title & Status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div>
                          <strong style={{ fontSize: "0.88rem", color: isOffline ? "#94a3b8" : "#ffffff", textDecoration: isOffline ? "line-through" : "none" }}>
                            {srv.name}
                          </strong>
                          <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: "6px" }}>
                            {srv.region}
                          </span>
                        </div>

                        {/* Fail / Revive live toggle button */}
                        <button
                          onClick={() => onToggleServerFail(srv.id)}
                          title={isOffline ? "Restore Server Node" : "Simulate Crash on this server"}
                          style={{
                            padding: "2px 7px",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            backgroundColor: isOffline ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                            border: isOffline ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                            color: isOffline ? "#34d399" : "#fca5a5",
                          }}
                        >
                          {isOffline ? "Heal" : "Kill"}
                        </button>
                      </div>

                      {/* CPU Utilization Bar */}
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>
                          <span>CPU Load</span>
                          <span style={{ color: isOffline ? "#ef4444" : cpuColor, fontWeight: 700 }}>
                            {isOffline ? "OFFLINE" : `${cpu}%`}
                          </span>
                        </div>

                        <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: isOffline ? "0%" : `${cpu}%`,
                              height: "100%",
                              backgroundColor: cpuColor,
                              borderRadius: "999px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* Connections & Queues */}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#94a3b8" }}>
                        <span>
                          Conns: <strong style={{ color: "#ffffff" }}>{activeConns}</strong>/{srv.maxConcurrent}
                        </span>
                        {queued > 0 ? (
                          <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                            Queue: {queued}
                          </span>
                        ) : (
                          <span>Base: {srv.baseLatencyMs}ms</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
