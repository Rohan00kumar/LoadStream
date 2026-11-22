"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ScenariosPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const scenarios = [
    {
      title: "Flash Crowds Surge (10x Influx)",
      category: "High Throughput Test",
      description: "Viral traffic surge sends 10,000 requests/sec in under 2 seconds. Demonstrates PPO vs Round Robin overload prevention.",
      expectedDuration: "4.2s stabilization",
      details: "PPO dynamically redistributes incoming batches to memory-heavy nodes, keeping cluster latency below 15ms without packet drops.",
    },
    {
      title: "Sudden Hardware Node Crash",
      category: "Resilience & Failover",
      description: "A primary data center switch fails unexpectedly. LoadStream isolates the broken cluster within 20ms with 0 dropped sessions.",
      expectedDuration: "20ms auto-failover",
      details: "Surviving nodes scale TCP socket pools dynamically, absorbing the dead node's volume seamlessly.",
    },
    {
      title: "Cascading Microservice Timeout",
      category: "Latency Throttling",
      description: "Downstream database queries trigger thread pool exhaustion. Adaptive throttling redirects requests before cascading timeouts occur.",
      expectedDuration: "Sub-second throttling",
      details: "Detects rising tail latency in upstream microservices and routes around congested nodes.",
    },
    {
      title: "Zero-Downtime Rolling Update",
      category: "Continuous Deployment",
      description: "Upgrading a container cluster node-by-node while preserving 99.999% SLA and zero connection drops.",
      expectedDuration: "Smooth rollout",
      details: "Gracefully drains active connections on target nodes before redirecting new ingress requests.",
    },
  ];

  const handleRun = () => {
    setRunning(true);
    setStep(1);
    setTimeout(() => setStep(2), 1100);
    setTimeout(() => setStep(3), 2300);
    setTimeout(() => {
      setStep(4);
      setRunning(false);
    }, 3600);
  };

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
                backgroundColor: "rgba(251, 191, 36, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                Scenario Explorer
              </h1>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
            Explore guided real-world infrastructure incidents and watch how PPO adaptive balancing prevents outages.
          </p>
        </div>

        {/* Scenarios Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          {scenarios.map((sc, idx) => (
            <div
              key={sc.title}
              onClick={() => {
                setSelectedIdx(idx);
                setStep(0);
              }}
              style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: selectedIdx === idx ? "rgba(251, 191, 36, 0.12)" : "rgba(18, 22, 31, 0.75)",
                border: selectedIdx === idx ? "1px solid rgba(251, 191, 36, 0.45)" : "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              <div style={{ fontSize: "0.74rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                {sc.category}
              </div>
              <h4 style={{ fontSize: "1.02rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>{sc.title}</h4>
              <p style={{ fontSize: "0.86rem", color: "#94a3b8", lineHeight: 1.45 }}>{sc.description}</p>
            </div>
          ))}
        </div>

        {/* Active Scenario Execution Deck */}
        <div
          style={{
            backgroundColor: "rgba(8, 12, 20, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase" }}>
                Active Case Study
              </span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>
                {scenarios[selectedIdx].title}
              </h3>
              <p style={{ fontSize: "0.92rem", color: "#cbd5e1", marginTop: "4px" }}>
                {scenarios[selectedIdx].details}
              </p>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              style={{
                padding: "12px 28px",
                backgroundColor: "#f59e0b",
                border: "none",
                borderRadius: "8px",
                color: "#000000",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: running ? "not-allowed" : "pointer",
                boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              {running ? "Simulating Scenario..." : "▶ Run Scenario"}
            </button>
          </div>

          {/* 4-Step Progressive Timeline */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginTop: "24px" }}>
            {[
              { num: 1, label: "1. Normal Baseline", note: "Steady load distribution across nodes" },
              { num: 2, label: "2. Incident Triggered", note: "Traffic spike or node failure detected" },
              { num: 3, label: "3. PPO Optimization", note: "Adaptive policy shifts flow in milliseconds" },
              { num: 4, label: "4. Full SLA Stabilized", note: "0 dropped sessions, sub-15ms latency" },
            ].map((s) => {
              const active = step >= s.num;
              return (
                <div
                  key={s.num}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    backgroundColor: active ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.03)",
                    border: active ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: active ? "#34d399" : "#64748b" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: active ? "#cbd5e1" : "#475569", marginTop: "4px" }}>
                    {s.note}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
