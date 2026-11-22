"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SimulateHubPage() {
  return (
    <div className="orbit-page">
      <Navbar />

      <main className="orbit-main page-enter-anim" style={{ minHeight: "calc(100vh - 160px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="sim-labs-wrapper" style={{ padding: "40px 0" }}>
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
            <Link href="/simulate/arena" className="sim-card sim-card-arena">
              <div className="sim-card-top">
                <div className="sim-icon-box">
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
            </Link>

            {/* Card 2: API Testing Lab */}
            <Link href="/simulate/api-lab" className="sim-card sim-card-api">
              <div className="sim-card-top">
                <div className="sim-icon-box">
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
            </Link>

            {/* Card 3: Infrastructure Playground */}
            <Link href="/simulate/infrastructure" className="sim-card sim-card-infra">
              <div className="sim-card-top">
                <div className="sim-icon-box">
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
            </Link>

            {/* Card 4: Scenario Explorer */}
            <Link href="/simulate/scenarios" className="sim-card sim-card-scenario">
              <div className="sim-card-top">
                <div className="sim-icon-box">
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
            </Link>
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
