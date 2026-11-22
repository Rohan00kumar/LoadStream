"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { checkBackendHealth, HealthResponse } from "@/lib/api";

type LabTab = "arena" | "api" | "infra" | "scenario";

interface ServerNode {
  id: string;
  name: string;
  region: string;
  load: number; // 0 - 100%
  connections: number;
  latency: number; // ms
  status: "healthy" | "degraded" | "offline";
}

export default function SimulatePage() {
  const [activeLab, setActiveLab] = useState<LabTab>("arena");
  const stageRef = useRef<HTMLDivElement>(null);

  // Lab 1: Algorithm Arena state
  const [algorithm, setAlgorithm] = useState<"ppo" | "round_robin" | "least_conn">("ppo");
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestCount, setRequestCount] = useState(482);
  const [arenaNodes, setArenaNodes] = useState<ServerNode[]>([
    { id: "srv-1", name: "Node-Alpha (High-Compute)", region: "us-east-1", load: 42, connections: 28, latency: 12, status: "healthy" },
    { id: "srv-2", name: "Node-Beta (Standard)", region: "us-west-2", load: 38, connections: 25, latency: 15, status: "healthy" },
    { id: "srv-3", name: "Node-Gamma (Memory-Optimized)", region: "eu-central-1", load: 45, connections: 30, latency: 19, status: "healthy" },
    { id: "srv-4", name: "Node-Delta (Edge Fast)", region: "ap-south-1", load: 35, connections: 22, latency: 9, status: "healthy" },
  ]);

  // Lab 2: API Testing Lab state
  const [apiTesting, setApiTesting] = useState(false);
  const [apiResult, setApiResult] = useState<{
    status: number;
    latency: number;
    data: any;
    isLive: boolean;
    timestamp: string;
  } | null>(null);

  // Lab 3: Infrastructure Playground state
  const [infraNodes, setInfraNodes] = useState<ServerNode[]>([
    { id: "inf-1", name: "Cluster-Alpha", region: "us-east-1", load: 32, connections: 45, latency: 11, status: "healthy" },
    { id: "inf-2", name: "Cluster-Beta", region: "us-west-1", load: 41, connections: 58, latency: 14, status: "healthy" },
    { id: "inf-3", name: "Cluster-Gamma", region: "eu-west-1", load: 28, connections: 39, latency: 18, status: "healthy" },
    { id: "inf-4", name: "Cluster-Delta", region: "ap-northeast-1", load: 36, connections: 50, latency: 16, status: "healthy" },
  ]);
  const [failoverAlert, setFailoverAlert] = useState<string | null>(null);

  // Lab 4: Scenario Explorer state
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [scenarioStep, setScenarioStep] = useState(0);

  const scenarios = [
    {
      title: "Flash Traffic Surge (10x Influx)",
      description: "A viral product release sends 10,000 requests/sec within 2 seconds. Demonstrates PPO vs Round Robin overload prevention.",
      impact: "High Throughput Test",
      duration: "4.2s resolution",
    },
    {
      title: "Sudden Hardware Node Crash",
      description: "A primary data center switch fails unexpectedly. LoadStream detects loss within 20ms and smoothly redistributes traffic.",
      impact: "Zero Dropped Connections",
      duration: "20ms failover",
    },
    {
      title: "Cascading Microservice Latency",
      description: "Downstream database queries trigger gradual thread pool exhaustion. Adaptive throttling redirects requests before timeouts cascade.",
      impact: "Latency Protection",
      duration: "Adaptive routing",
    },
    {
      title: "Zero-Downtime Rolling Update",
      description: "Rolling out a new container build node-by-node while preserving 99.999% SLA and sub-15ms user response times.",
      impact: "Rolling SLA Guard",
      duration: "Smooth transition",
    },
  ];

  // Streaming effect for Algorithm Arena
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setRequestCount((prev) => prev + 15);
      setArenaNodes((prev) =>
        prev.map((node) => {
          let delta = 0;
          if (algorithm === "ppo") {
            // PPO balances tightly around 40-50%
            delta = Math.floor(Math.random() * 5) - 2;
          } else if (algorithm === "least_conn") {
            delta = Math.floor(Math.random() * 9) - 4;
          } else {
            // Round robin has higher variance & spikes
            delta = Math.floor(Math.random() * 15) - 6;
          }
          const newLoad = Math.max(15, Math.min(92, node.load + delta));
          return {
            ...node,
            load: newLoad,
            connections: Math.round(newLoad * 0.7),
            latency: Math.round(8 + (newLoad / 100) * 16),
          };
        })
      );
    }, 600);
    return () => clearInterval(interval);
  }, [isStreaming, algorithm]);

  const handleSelectLab = (lab: LabTab) => {
    setActiveLab(lab);
    setTimeout(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const runApiTest = async () => {
    setApiTesting(true);
    const start = performance.now();
    try {
      const data: HealthResponse = await checkBackendHealth();
      const end = performance.now();
      setApiResult({
        status: 200,
        latency: Math.round(end - start),
        data,
        isLive: true,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch {
      // Fallback simulated response if local backend is not yet booted
      await new Promise((r) => setTimeout(r, 80));
      const end = performance.now();
      setApiResult({
        status: 200,
        latency: Math.round(end - start),
        data: {
          status: "healthy",
          service: "LoadStream Backend (Simulated Node)",
          frontend_connected: true,
          algorithm: "PPO-Resource-Allocation",
          active_workers: 4,
          p99_latency_ms: 14.2,
        },
        isLive: false,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setApiTesting(false);
    }
  };

  const toggleInfraNode = (id: string) => {
    setInfraNodes((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) {
          const nextStatus: ServerNode["status"] =
            n.status === "offline" ? "healthy" : "offline";
          return {
            ...n,
            status: nextStatus,
            load: nextStatus === "offline" ? 0 : 35,
          };
        }
        return n;
      });

      const offlineCount = updated.filter((n) => n.status === "offline").length;
      if (offlineCount > 0) {
        setFailoverAlert(`Dynamic Failover Active: ${offlineCount} node(s) isolated. Traffic smoothly absorbed by surviving nodes.`);
      } else {
        setFailoverAlert(null);
      }
      return updated;
    });
  };

  const runScenarioSimulation = () => {
    setScenarioRunning(true);
    setScenarioStep(1);
    setTimeout(() => setScenarioStep(2), 1200);
    setTimeout(() => setScenarioStep(3), 2400);
    setTimeout(() => {
      setScenarioStep(4);
      setScenarioRunning(false);
    }, 3800);
  };

  return (
    <div className="orbit-page">
      {/* Top Navbar */}
      <header className="orbit-header">
        <nav className="orbit-navbar">
          <Link href="/" className="orbit-logo">
            ORBIT
          </Link>

          <div className="orbit-nav">
            <Link href="/" className="orbit-nav-link">
              Home
            </Link>
            <Link href="/simulate" className="orbit-nav-link" style={{ color: "#a78bfa" }}>
              Simulate
            </Link>
            <Link href="/#features" className="orbit-nav-link">
              Features
            </Link>
            <Link href="/#services" className="orbit-nav-link">
              Services
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="orbit-main">
        <div className="sim-labs-wrapper">
          {/* Header matching user's design */}
          <div className="sim-labs-header">
            <h1 className="sim-labs-title">Explore Simulation Labs</h1>
            <p className="sim-labs-subtitle">
              Experiment with algorithms, APIs, infrastructure, and real-world scenarios.
            </p>
          </div>

          {/* 4 Cards Grid - Pixel-perfect to screenshot */}
          <div className="sim-labs-grid">
            {/* Card 1: Algorithm Arena */}
            <div
              className={`sim-card sim-card-arena ${activeLab === "arena" ? "sim-card-active" : ""}`}
              onClick={() => handleSelectLab("arena")}
              role="button"
              tabIndex={0}
            >
              <div className="sim-card-top">
                <div className="sim-icon-box">
                  {/* Purple Branching / Routing Route Icon */}
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 4l3 3-3 3" />
                    <path d="M18 20l3-3-3-3" />
                    <circle cx="6" cy="7" r="2.5" />
                    <circle cx="6" cy="17" r="2.5" />
                    <path d="M8.5 7h4a4 4 0 0 1 4 4v2a4 4 0 0 0 4 4h0.5" />
                    <path d="M8.5 17h4a4 4 0 0 0 4-4V11a4 4 0 0 1 4-4h0.5" />
                  </svg>
                </div>
                <h3 className="sim-card-name">Algorithm Arena</h3>
                <p className="sim-card-desc">
                  Compare Round Robin, Least Connections, PPO, and more.
                </p>
              </div>
              <div className="sim-card-cta cta-purple">
                <span>Explore Lab</span>
                <span className="sim-arrow">→</span>
              </div>
            </div>

            {/* Card 2: API Testing Lab */}
            <div
              className={`sim-card sim-card-api ${activeLab === "api" ? "sim-card-active" : ""}`}
              onClick={() => handleSelectLab("api")}
              role="button"
              tabIndex={0}
            >
              <div className="sim-card-top">
                <div className="sim-icon-box">
                  {/* Indigo / Purple Code Brackets </> Icon */}
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <h3 className="sim-card-name">API Testing Lab</h3>
                <p className="sim-card-desc">
                  Send requests, inspect responses, and measure latency.
                </p>
              </div>
              <div className="sim-card-cta cta-indigo">
                <span>Test APIs</span>
                <span className="sim-arrow">→</span>
              </div>
            </div>

            {/* Card 3: Infrastructure Playground */}
            <div
              className={`sim-card sim-card-infra ${activeLab === "infra" ? "sim-card-active" : ""}`}
              onClick={() => handleSelectLab("infra")}
              role="button"
              tabIndex={0}
            >
              <div className="sim-card-top">
                <div className="sim-icon-box">
                  {/* Emerald Green 3-Node Cluster Icon */}
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="5" r="3" />
                    <circle cx="6" cy="19" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="12" y1="8" x2="6" y2="16" />
                    <line x1="12" y1="8" x2="18" y2="16" />
                  </svg>
                </div>
                <h3 className="sim-card-name">Infrastructure Playground</h3>
                <p className="sim-card-desc">
                  Build virtual servers and simulate traffic and failures.
                </p>
              </div>
              <div className="sim-card-cta cta-green">
                <span>Build Environment</span>
                <span className="sim-arrow">→</span>
              </div>
            </div>

            {/* Card 4: Scenario Explorer */}
            <div
              className={`sim-card sim-card-scenario ${activeLab === "scenario" ? "sim-card-active" : ""}`}
              onClick={() => handleSelectLab("scenario")}
              role="button"
              tabIndex={0}
            >
              <div className="sim-card-top">
                <div className="sim-icon-box">
                  {/* Amber Graduation Cap Icon */}
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>
                <h3 className="sim-card-name">Scenario Explorer</h3>
                <p className="sim-card-desc">
                  Learn through guided real-world infrastructure problems.
                </p>
              </div>
              <div className="sim-card-cta cta-amber">
                <span>Explore Scenarios</span>
                <span className="sim-arrow">→</span>
              </div>
            </div>
          </div>

          {/* Timeline Connector Dot at bottom of cards - matching screenshot */}
          <div className="sim-bottom-timeline">
            <div className="sim-timeline-stem" />
            <div className="sim-timeline-circle" />
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE WORKBENCH STAGE                               */}
          {/* ========================================================= */}
          <div ref={stageRef} className="sim-interactive-stage">
            {/* Header Tabs */}
            <div className="stage-tab-header">
              <div className="stage-title">
                {activeLab === "arena" && (
                  <>
                    <span style={{ color: "#a78bfa" }}>🔀</span>
                    <span>Algorithm Arena — Live Balancing Sandbox</span>
                    <span className="stage-badge" style={{ color: "#a78bfa", borderColor: "rgba(167, 139, 250, 0.4)", backgroundColor: "rgba(167, 139, 250, 0.1)" }}>
                      Live Metrics
                    </span>
                  </>
                )}
                {activeLab === "api" && (
                  <>
                    <span style={{ color: "#818cf8" }}>⚡</span>
                    <span>API Testing Lab — FastAPI Endpoint Inspector</span>
                    <span className="stage-badge" style={{ color: "#818cf8", borderColor: "rgba(129, 140, 248, 0.4)", backgroundColor: "rgba(129, 140, 248, 0.1)" }}>
                      HTTP Client
                    </span>
                  </>
                )}
                {activeLab === "infra" && (
                  <>
                    <span style={{ color: "#34d399" }}>🏛️</span>
                    <span>Infrastructure Playground — Node Cluster</span>
                    <span className="stage-badge" style={{ color: "#34d399", borderColor: "rgba(52, 211, 153, 0.4)", backgroundColor: "rgba(52, 211, 153, 0.1)" }}>
                      Failover Ready
                    </span>
                  </>
                )}
                {activeLab === "scenario" && (
                  <>
                    <span style={{ color: "#fbbf24" }}>🎯</span>
                    <span>Scenario Explorer — Incident Simulator</span>
                    <span className="stage-badge" style={{ color: "#fbbf24", borderColor: "rgba(251, 191, 36, 0.4)", backgroundColor: "rgba(251, 191, 36, 0.1)" }}>
                      Guided Labs
                    </span>
                  </>
                )}
              </div>

              {/* Lab Quick Nav Buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(["arena", "api", "infra", "scenario"] as LabTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLab(tab)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: activeLab === tab ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor: activeLab === tab ? "rgba(255, 255, 255, 0.1)" : "transparent",
                      color: activeLab === tab ? "#ffffff" : "#94a3b8",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab === "arena" && "Algorithm Arena"}
                    {tab === "api" && "API Lab"}
                    {tab === "infra" && "Infrastructure"}
                    {tab === "scenario" && "Scenarios"}
                  </button>
                ))}
              </div>
            </div>

            {/* ======================================================= */}
            {/* 1. ALGORITHM ARENA CONTENT                             */}
            {/* ======================================================= */}
            {activeLab === "arena" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                      Select Load Balancing Algorithm:
                    </label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {[
                        { id: "ppo", label: "🧠 PPO (Adaptive AI)", color: "#a78bfa" },
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

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button
                      onClick={() => {
                        setRequestCount((c) => c + 50);
                        setArenaNodes((prev) =>
                          prev.map((n) => ({
                            ...n,
                            load: Math.min(90, n.load + Math.floor(Math.random() * 8)),
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
                      + Inject 50 Requests
                    </button>

                    <button
                      onClick={() => setIsStreaming(!isStreaming)}
                      style={{
                        padding: "8px 18px",
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
                      {isStreaming ? "Stop Live Stream" : "▶ Start Live Traffic"}
                    </button>
                  </div>
                </div>

                {/* Nodes Load Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  {arenaNodes.map((node) => {
                    const barColor = node.load > 75 ? "#ef4444" : node.load > 50 ? "#f59e0b" : "#10b981";
                    return (
                      <div
                        key={node.id}
                        style={{
                          backgroundColor: "rgba(13, 17, 23, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "10px",
                          padding: "16px 18px",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#ffffff" }}>{node.name.split(" ")[0]}</span>
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{node.region}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "6px" }}>
                          <span>CPU Utilization</span>
                          <span style={{ color: barColor, fontWeight: 700 }}>{node.load}%</span>
                        </div>

                        {/* Progress Bar with smooth transition */}
                        <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden", marginBottom: "14px" }}>
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

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8" }}>
                          <span>Active Conns: <strong style={{ color: "#ffffff" }}>{node.connections}</strong></span>
                          <span>Latency: <strong style={{ color: "#ffffff" }}>{node.latency}ms</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Performance Summary Banner */}
                <div style={{ backgroundColor: "rgba(167, 139, 250, 0.06)", border: "1px solid rgba(167, 139, 250, 0.2)", borderRadius: "10px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#a78bfa", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", display: "block" }}>
                      Total Requests Processed: {requestCount}
                    </span>
                    <p style={{ fontSize: "0.92rem", color: "#e2e8f0", marginTop: "2px" }}>
                      {algorithm === "ppo" && "PPO AI dynamically shifts heavy tasks to high-memory nodes, achieving 38% lower tail latency."}
                      {algorithm === "least_conn" && "Least Connections balances socket count, but can choke if slow queries saturate a single node."}
                      {algorithm === "round_robin" && "Round Robin sends queries evenly without considering node load, leading to periodic server spikes."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div>
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>AVG LATENCY</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#34d399" }}>
                        {algorithm === "ppo" ? "12.4ms" : algorithm === "least_conn" ? "17.8ms" : "26.1ms"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>IMBALANCE SCORE</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: algorithm === "ppo" ? "#a78bfa" : "#f59e0b" }}>
                        {algorithm === "ppo" ? "0.04 (Optimal)" : algorithm === "least_conn" ? "0.18 (Good)" : "0.52 (High)"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* 2. API TESTING LAB CONTENT                             */}
            {/* ======================================================= */}
            {activeLab === "api" && (
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.94rem", marginBottom: "20px", lineHeight: 1.5 }}>
                  Inspect real-time HTTP requests, round-trip timing, and headers directly to the FastAPI server at <code style={{ color: "#818cf8", backgroundColor: "rgba(129,140,248,0.1)", padding: "2px 6px", borderRadius: "4px" }}>http://localhost:8000/api/health</code>.
                </p>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 14px", flex: 1, minWidth: "260px" }}>
                    <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.85rem", marginRight: "12px" }}>GET</span>
                    <span style={{ color: "#ffffff", fontFamily: "monospace", fontSize: "0.88rem" }}>/api/health</span>
                  </div>

                  <button
                    onClick={runApiTest}
                    disabled={apiTesting}
                    style={{
                      padding: "10px 22px",
                      backgroundColor: "#6366f1",
                      border: "none",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontWeight: 600,
                      cursor: apiTesting ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {apiTesting ? "Connecting..." : "Send Request →"}
                  </button>
                </div>

                {apiResult ? (
                  <div style={{ backgroundColor: "#080c14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ backgroundColor: "#064e3b", color: "#34d399", padding: "3px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700 }}>
                          HTTP {apiResult.status} OK
                        </span>
                        <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Latency: <strong style={{ color: "#ffffff" }}>{apiResult.latency}ms</strong></span>
                        <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Checked: {apiResult.timestamp}</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: apiResult.isLive ? "#34d399" : "#fbbf24", fontWeight: 600 }}>
                        {apiResult.isLive ? "● Live Backend Connected" : "● Simulated Response (Backend not on 8000)"}
                      </span>
                    </div>

                    <pre style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "14px", fontSize: "0.84rem", color: "#818cf8", fontFamily: "monospace", overflowX: "auto" }}>
                      {JSON.stringify(apiResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "36px 16px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.92rem" }}>Click "Send Request →" to fire a test probe and view server telemetry response.</p>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================= */}
            {/* 3. INFRASTRUCTURE PLAYGROUND CONTENT                   */}
            {/* ======================================================= */}
            {activeLab === "infra" && (
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.94rem", marginBottom: "18px", lineHeight: 1.5 }}>
                  Simulate live server crashes and network degradations. Observe how LoadStream's automated failover engine instantly isolates problematic nodes without breaking user requests.
                </p>

                {failoverAlert && (
                  <div style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>⚠️</span>
                    <span>{failoverAlert}</span>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
                  {infraNodes.map((node) => {
                    const isOffline = node.status === "offline";
                    return (
                      <div
                        key={node.id}
                        style={{
                          backgroundColor: isOffline ? "rgba(239, 68, 68, 0.05)" : "rgba(13, 17, 23, 0.8)",
                          border: isOffline ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "10px",
                          padding: "18px",
                          transition: "all 0.25s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>{node.name}</span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor: isOffline ? "#7f1d1d" : "#064e3b",
                              color: isOffline ? "#fca5a5" : "#34d399",
                            }}
                          >
                            {isOffline ? "Offline" : "Healthy"}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "16px" }}>
                          <div>Region: <strong style={{ color: "#ffffff" }}>{node.region}</strong></div>
                          <div>Load: <strong style={{ color: isOffline ? "#ef4444" : "#34d399" }}>{node.load}%</strong></div>
                          <div>Active TCP Sockets: <strong style={{ color: "#ffffff" }}>{node.connections}</strong></div>
                        </div>

                        <button
                          onClick={() => toggleInfraNode(node.id)}
                          style={{
                            width: "100%",
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
                          {isOffline ? "Revive Server Node" : "Trigger Crash Failure"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* 4. SCENARIO EXPLORER CONTENT                           */}
            {/* ======================================================= */}
            {activeLab === "scenario" && (
              <div>
                <p style={{ color: "#94a3b8", fontSize: "0.94rem", marginBottom: "20px" }}>
                  Select a guided real-world infrastructure scenario and run an interactive automated simulation to evaluate how LoadStream maintains zero-downtime reliability.
                </p>

                {/* Scenario Picker Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                  {scenarios.map((sc, idx) => (
                    <div
                      key={sc.title}
                      onClick={() => {
                        setSelectedScenario(idx);
                        setScenarioStep(0);
                      }}
                      style={{
                        padding: "16px",
                        borderRadius: "10px",
                        backgroundColor: selectedScenario === idx ? "rgba(251, 191, 36, 0.1)" : "rgba(13, 17, 23, 0.8)",
                        border: selectedScenario === idx ? "1px solid rgba(251, 191, 36, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: "0.76rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                        Case 0{idx + 1}
                      </div>
                      <h4 style={{ fontSize: "0.96rem", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>{sc.title}</h4>
                      <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.4 }}>{sc.description}</p>
                    </div>
                  ))}
                </div>

                {/* Scenario Runner Controls & Visualizer */}
                <div style={{ backgroundColor: "#080c14", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>{scenarios[selectedScenario].title}</h3>
                      <span style={{ fontSize: "0.82rem", color: "#34d399" }}>Expected: {scenarios[selectedScenario].duration}</span>
                    </div>

                    <button
                      onClick={runScenarioSimulation}
                      disabled={scenarioRunning}
                      style={{
                        padding: "10px 22px",
                        backgroundColor: "#f59e0b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#000000",
                        fontWeight: 700,
                        cursor: scenarioRunning ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 16px rgba(245, 158, 11, 0.35)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {scenarioRunning ? "Simulating Scenario..." : "▶ Run Scenario"}
                    </button>
                  </div>

                  {/* Step by step timeline */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "16px" }}>
                    {[
                      { step: 1, title: "1. Normal Influx", desc: "Steady traffic distribution" },
                      { step: 2, title: "2. Incident Trigger", desc: "Anomaly detected" },
                      { step: 3, title: "3. PPO Optimization", desc: "Dynamic route calculation" },
                      { step: 4, title: "4. SLA Stabilized", desc: "100% requests resolved" },
                    ].map((st) => {
                      const isReached = scenarioStep >= st.step;
                      return (
                        <div
                          key={st.step}
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: isReached ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.03)",
                            border: isReached ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(255,255,255,0.05)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isReached ? "#34d399" : "#64748b" }}>{st.title}</div>
                          <div style={{ fontSize: "0.76rem", color: isReached ? "#cbd5e1" : "#475569", marginTop: "4px" }}>{st.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="orbit-footer">
        <div className="footer-content">
          <div>
            <strong style={{ color: "#ffffff" }}>ORBIT</strong>
            {" // "}
            <span>Adaptive Load Balancing</span>
          </div>
          <div>Every Request the right server every time.</div>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/simulate">Simulate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
