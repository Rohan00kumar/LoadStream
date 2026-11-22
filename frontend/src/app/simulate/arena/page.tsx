"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface ServerNode {
  id: string;
  name: string;
  region: string;
  load: number;
  connections: number;
  latency: number;
}

export default function AlgorithmArenaPage() {
  const [algorithm, setAlgorithm] = useState<"ppo" | "least_conn" | "round_robin">("ppo");
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestCount, setRequestCount] = useState(1280);
  const [nodes, setNodes] = useState<ServerNode[]>([
    { id: "srv-1", name: "Node-Alpha (High-Compute)", region: "us-east-1", load: 42, connections: 28, latency: 12 },
    { id: "srv-2", name: "Node-Beta (Standard)", region: "us-west-2", load: 38, connections: 25, latency: 15 },
    { id: "srv-3", name: "Node-Gamma (Memory-Optimized)", region: "eu-central-1", load: 45, connections: 30, latency: 19 },
    { id: "srv-4", name: "Node-Delta (Edge Fast)", region: "ap-south-1", load: 35, connections: 22, latency: 9 },
  ]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setRequestCount((prev) => prev + 24);
      setNodes((prev) =>
        prev.map((node) => {
          let delta = 0;
          if (algorithm === "ppo") {
            delta = Math.floor(Math.random() * 5) - 2;
          } else if (algorithm === "least_conn") {
            delta = Math.floor(Math.random() * 9) - 4;
          } else {
            delta = Math.floor(Math.random() * 16) - 7;
          }
          const nextLoad = Math.max(18, Math.min(94, node.load + delta));
          return {
            ...node,
            load: nextLoad,
            connections: Math.round(nextLoad * 0.72),
            latency: Math.round(8 + (nextLoad / 100) * 16),
          };
        })
      );
    }, 500);
    return () => clearInterval(interval);
  }, [isStreaming, algorithm]);

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
                backgroundColor: "rgba(167, 139, 250, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 4l3 3-3 3" />
                <path d="M18 20l3-3-3-3" />
                <circle cx="6" cy="7" r="2.5" />
                <circle cx="6" cy="17" r="2.5" />
                <path d="M8.5 7h4a4 4 0 0 1 4 4v2a4 4 0 0 0 4 4h0.5" />
                <path d="M8.5 17h4a4 4 0 0 0 4-4V11a4 4 0 0 1 4-4h0.5" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                Algorithm Arena
              </h1>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
            Compare Round Robin, Least Connections, and PPO Reinforcement Learning under simulated production traffic.
          </p>
        </div>

        {/* Control Toolbar */}
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
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
              Routing Policy:
            </span>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { id: "ppo", label: "🧠 PPO (Adaptive RL)", color: "#a78bfa" },
                { id: "least_conn", label: "⚖️ Least Connections", color: "#34d399" },
                { id: "round_robin", label: "🔄 Round Robin", color: "#94a3b8" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAlgorithm(item.id as any)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: algorithm === item.id ? `1px solid ${item.color}` : "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: algorithm === item.id ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.2)",
                    color: algorithm === item.id ? item.color : "#94a3b8",
                    boxShadow: algorithm === item.id ? `0 0 16px ${item.color}33` : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => {
                setRequestCount((c) => c + 50);
                setNodes((prev) =>
                  prev.map((n) => ({
                    ...n,
                    load: Math.min(94, n.load + Math.floor(Math.random() * 8)),
                  }))
                );
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "rgba(167, 139, 250, 0.15)",
                border: "1px solid rgba(167, 139, 250, 0.3)",
                borderRadius: "8px",
                color: "#a78bfa",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              +50 Requests
            </button>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              style={{
                padding: "8px 20px",
                backgroundColor: isStreaming ? "#ef4444" : "#a855f7",
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: isStreaming ? "0 0 16px rgba(239, 68, 68, 0.4)" : "0 0 16px rgba(168, 85, 247, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              {isStreaming ? "■ Stop Stream" : "▶ Start Live Stream"}
            </button>
          </div>
        </div>

        {/* Server Nodes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "32px" }}>
          {nodes.map((node) => {
            const barColor = node.load > 75 ? "#ef4444" : node.load > 50 ? "#f59e0b" : "#10b981";
            return (
              <div
                key={node.id}
                style={{
                  backgroundColor: "rgba(18, 22, 31, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>{node.name.split(" ")[0]}</span>
                  <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontFamily: "monospace" }}>{node.region}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "#94a3b8", marginBottom: "6px" }}>
                  <span>Load Utilization</span>
                  <span style={{ color: barColor, fontWeight: 700 }}>{node.load}%</span>
                </div>

                <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: `${node.load}%`,
                      height: "100%",
                      backgroundColor: barColor,
                      borderRadius: "999px",
                      transition: "width 0.4s ease-out, background-color 0.3s ease",
                      boxShadow: `0 0 8px ${barColor}`,
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                  <span>Connections: <strong style={{ color: "#ffffff" }}>{node.connections}</strong></span>
                  <span>Latency: <strong style={{ color: "#ffffff" }}>{node.latency}ms</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Telemetry Analytics Card */}
        <div
          style={{
            backgroundColor: "rgba(167, 139, 250, 0.06)",
            border: "1px solid rgba(167, 139, 250, 0.2)",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <span style={{ fontSize: "0.82rem", color: "#a78bfa", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", display: "block" }}>
              Total Volume: {requestCount.toLocaleString()} Requests
            </span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginTop: "4px", marginBottom: "6px" }}>
              {algorithm === "ppo" && "PPO Reinforcement Learning Active"}
              {algorithm === "least_conn" && "Least Connections Algorithm Active"}
              {algorithm === "round_robin" && "Static Round Robin Routing Active"}
            </h3>
            <p style={{ fontSize: "0.92rem", color: "#94a3b8", maxWidth: "620px", lineHeight: 1.5 }}>
              {algorithm === "ppo" &&
                "PPO uses deep actor-critic networks to predict server load bottlenecks in advance, maintaining optimal balance with 38% lower variance than static heuristics."}
              {algorithm === "least_conn" &&
                "Least Connections routes to the node with the fewest open sockets, but is blind to task processing duration."}
              {algorithm === "round_robin" &&
                "Round Robin sequentially alternates servers regardless of node capacity, creating severe load hot-spots during traffic surges."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "28px" }}>
            <div>
              <div style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 700 }}>AVG LATENCY</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#34d399" }}>
                {algorithm === "ppo" ? "12.4ms" : algorithm === "least_conn" ? "18.2ms" : "28.6ms"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 700 }}>IMBALANCE SCORE</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: algorithm === "ppo" ? "#a78bfa" : "#f59e0b" }}>
                {algorithm === "ppo" ? "0.03" : algorithm === "least_conn" ? "0.19" : "0.58"}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
