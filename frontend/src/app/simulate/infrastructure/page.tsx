"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface InfraNode {
  id: string;
  name: string;
  region: string;
  load: number;
  connections: number;
  status: "healthy" | "degraded" | "offline";
}

export default function InfrastructurePage() {
  const [nodes, setNodes] = useState<InfraNode[]>([
    { id: "inf-1", name: "Cluster-Alpha", region: "us-east-1", load: 34, connections: 45, status: "healthy" },
    { id: "inf-2", name: "Cluster-Beta", region: "us-west-2", load: 42, connections: 58, status: "healthy" },
    { id: "inf-3", name: "Cluster-Gamma", region: "eu-central-1", load: 29, connections: 39, status: "healthy" },
    { id: "inf-4", name: "Cluster-Delta", region: "ap-south-1", load: 38, connections: 52, status: "healthy" },
  ]);
  const [failoverLog, setFailoverLog] = useState<string | null>(null);

  const toggleNodeState = (id: string) => {
    setNodes((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) {
          const nextStatus: InfraNode["status"] = n.status === "offline" ? "healthy" : "offline";
          return {
            ...n,
            status: nextStatus,
            load: nextStatus === "offline" ? 0 : 36,
          };
        }
        return n;
      });

      const offlineNodes = updated.filter((n) => n.status === "offline");
      if (offlineNodes.length > 0) {
        setFailoverLog(
          `⚡ Auto-Healing Triggered: Node [${offlineNodes.map((x) => x.name).join(", ")}] isolated. Traffic dynamically redirected to healthy clusters with 0 dropped packets.`
        );
      } else {
        setFailoverLog(null);
      }
      return updated;
    });
  };

  const spikeNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, load: 92, status: "degraded" } : n))
    );
  };

  const healthyCount = nodes.filter((n) => n.status === "healthy").length;

  return (
    <div className="orbit-page">
      <Navbar />

      <main className="orbit-main page-enter-anim">
        <Link href="/simulate" className="back-link">
          ← Back to Simulation Labs
        </Link>

        {/* Page Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(52, 211, 153, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3" />
                <circle cx="6" cy="19" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="12" y1="8" x2="6" y2="16" />
                <line x1="12" y1="8" x2="18" y2="16" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                Infrastructure Playground
              </h1>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
            Build virtual servers, simulate regional hardware crashes, and observe autonomous zero-downtime failover.
          </p>
        </div>

        {/* Cluster Status Card */}
        <div
          style={{
            backgroundColor: "rgba(18, 22, 31, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>
              Global Cluster Health
            </span>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
              {healthyCount} of {nodes.length} Nodes Operational ({Math.round((healthyCount / nodes.length) * 100)}%)
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>TOTAL CAPACITY</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }}>18,000 req/s</div>
            </div>
            <div>
              <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>FAILOVER SPEED</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#34d399" }}>&lt; 20ms</div>
            </div>
          </div>
        </div>

        {/* Auto-Healing Alert Banner */}
        {failoverLog && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "10px",
              padding: "14px 18px",
              marginBottom: "24px",
              color: "#fca5a5",
              fontSize: "0.92rem",
              lineHeight: 1.5,
              animation: "simFadeIn 0.3s ease-out",
            }}
          >
            {failoverLog}
          </div>
        )}

        {/* Virtual Servers Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          {nodes.map((node) => {
            const isOffline = node.status === "offline";
            const isDegraded = node.status === "degraded";
            return (
              <div
                key={node.id}
                style={{
                  backgroundColor: isOffline
                    ? "rgba(239, 68, 68, 0.05)"
                    : isDegraded
                    ? "rgba(245, 158, 11, 0.05)"
                    : "rgba(18, 22, 31, 0.75)",
                  border: isOffline
                    ? "1px solid rgba(239, 68, 68, 0.3)"
                    : isDegraded
                    ? "1px solid rgba(245, 158, 11, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span style={{ fontSize: "1.02rem", fontWeight: 700, color: "#ffffff" }}>{node.name}</span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: isOffline ? "#7f1d1d" : isDegraded ? "#78350f" : "#064e3b",
                      color: isOffline ? "#fca5a5" : isDegraded ? "#fde68a" : "#34d399",
                    }}
                  >
                    {node.status}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.8, marginBottom: "18px" }}>
                  <div>Region: <strong style={{ color: "#ffffff" }}>{node.region}</strong></div>
                  <div>CPU Load: <strong style={{ color: isOffline ? "#ef4444" : "#34d399" }}>{node.load}%</strong></div>
                  <div>TCP Connections: <strong style={{ color: "#ffffff" }}>{node.connections}</strong></div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => toggleNodeState(node.id)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: isOffline ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      border: isOffline ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                      color: isOffline ? "#34d399" : "#fca5a5",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isOffline ? "Revive Node" : "Trigger Crash"}
                  </button>

                  {!isOffline && (
                    <button
                      onClick={() => spikeNode(node.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        color: "#fde68a",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Spike 90%
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
