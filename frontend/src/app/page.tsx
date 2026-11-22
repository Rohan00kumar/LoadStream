"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(
      "git clone https://github.com/LoadStream/LoadStream.git",
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
    }, 1200);
  };

  return (
    <div className="orbit-page">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="orbit-main">
        <div className="timeline-track-wrapper">
          {/* ========================================================= */}
          {/* 1. HERO SECTION                                           */}
          {/* ========================================================= */}
          <section
            id="home"
            className="orbit-section"
            style={{ paddingTop: "16px" }}
          >
            {/* Timeline: Purple Dot & Line going down into Section 2 */}
            <div className="hero-timeline-dot" />
            <div className="timeline-segment-hero" />

            <div className="hero-layout">
              {/* Left Column: Heading, Subtitle & Highlights */}
              <div className="hero-left">
                <h1 className="hero-title">
                  Adaptive Load
                  <br />
                  Balance
                </h1>

                <p className="hero-subtitle">
                  Every Request the right server every time.
                </p>
              </div>

              {/* Right Column: Celestial Moon & Cloud Vector Illustration */}
              <div className="hero-right">
                <div className="illustration-box">
                  <svg
                    viewBox="0 0 320 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="illustration-svg"
                  >
                    {/* Large Celestial Moon */}
                    <circle
                      cx="195"
                      cy="95"
                      r="48"
                      stroke="#a78bfa"
                      strokeWidth="1.75"
                    />

                    {/* Top-Right Stepped Cloud Capsule */}
                    <path
                      d="M205 60 H 240 C 246 60, 250 64, 250 70 C 250 76, 246 80, 240 80 H 230 C 224 80, 220 84, 220 90 C 220 96, 224 100, 230 100 H 255 C 261 100, 265 96, 265 90 C 265 84, 261 80, 255 80"
                      stroke="#a78bfa"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <line
                      x1="225"
                      y1="63"
                      x2="229"
                      y2="72"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="231"
                      y1="63"
                      x2="235"
                      y2="72"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    {/* Middle-Right Floating Cloud Bar */}
                    <path
                      d="M210 115 H 255 C 261 115, 266 119, 266 124 C 266 129, 261 133, 255 133 H 230"
                      stroke="#a78bfa"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />

                    {/* Bottom-Left Stepped Ground Cloud */}
                    <path
                      d="M90 170 H 135 C 141 170, 145 166, 145 160 C 145 154, 141 150, 135 150 H 125 C 119 150, 115 146, 115 140 C 115 134, 119 130, 125 130 H 150"
                      stroke="#a78bfa"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                    <line
                      x1="102"
                      y1="168"
                      x2="106"
                      y2="177"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="108"
                      y1="168"
                      x2="112"
                      y2="177"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    {/* Stylized Swirling Cloud Puffs (Bottom-Left of Moon) */}
                    <path
                      d="M165 145 C 160 145, 155 141, 155 136 C 155 131, 160 126, 166 126 C 167 122, 171 118, 176 118 C 182 118, 186 122, 187 126 C 192 126, 196 130, 196 135 C 196 140, 192 145, 186 145 Z"
                      fill="#0d1117"
                      stroke="#a78bfa"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M162 138 C 166 140, 172 139, 175 135 C 178 131, 176 126, 171 125"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M180 142 C 184 142, 188 139, 188 135 C 188 131, 185 129, 181 130"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M192 144 C 197 144, 203 140, 203 134 C 203 128, 198 125, 193 126"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M174 152 C 180 156, 190 156, 196 150 C 201 145, 201 138, 195 134"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    {/* Bottom Horizontal Dash */}
                    <line
                      x1="145"
                      y1="185"
                      x2="175"
                      y2="185"
                      stroke="#a78bfa"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />

                    {/* Small Sparkle Plus + */}
                    <path
                      d="M235 50 V 56 M 232 53 H 238"
                      stroke="#a78bfa"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />

                    {/* Small Floating Hollow Circles o */}
                    <circle
                      cx="248"
                      cy="115"
                      r="2.5"
                      stroke="#a78bfa"
                      strokeWidth="1.25"
                      fill="none"
                    />
                    <circle
                      cx="65"
                      cy="148"
                      r="2.5"
                      stroke="#a78bfa"
                      strokeWidth="1.25"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 2. SIMULATE / HOW IT WORKS SECTION                        */}
          {/* ========================================================= */}
          <section id="simulate" className="orbit-section">
            {/* Timeline: Connecting Line & Green Node */}
            <div className="timeline-segment-simulate" />
            <div className="timeline-node node-green">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <div className="section-header">
              <div className="section-tag tag-green">
                <span>●</span> How It Works
              </div>
              <h2 className="section-title">Simulate & Balance</h2>
            </div>

            {/* Simple, Minimal Summary Box */}
            <div className="quote-box quote-green">
              <p>
                Standard load balancers send requests blindly in round-robin
                order. LoadStream continuously monitors server health, CPU load,
                and response speed to route every request to the fastest
                available node.
              </p>
            </div>

            {/* 3 Simple, Clear Points Grid */}
            <div className="cards-grid-3">
              <div className="simple-card">
                <span className="card-icon-badge">📡</span>
                <h3 className="card-heading">Live Health Checks</h3>
                <p className="card-desc">
                  Continuously tracks active connections, server response times,
                  and memory usage across every server.
                </p>
              </div>

              <div className="simple-card">
                <span className="card-icon-badge">🧠</span>
                <h3 className="card-heading">Smart AI Routing</h3>
                <p className="card-desc">
                  Uses an intelligent reinforcement learning policy to assign
                  each user request to the optimal server.
                </p>
              </div>

              <div className="simple-card">
                <span className="card-icon-badge">⚡</span>
                <h3 className="card-heading">Zero Overloads</h3>
                <p className="card-desc">
                  Detects traffic surges early and redistributes requests before
                  any server slows down or crashes.
                </p>
              </div>
            </div>

            {/* Green Line Art Illustration: Server Balance Scale */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <div style={{ width: "100%", maxWidth: "300px" }}>
                <svg
                  viewBox="0 0 320 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    width: "100%",
                    height: "auto",
                    filter: "drop-shadow(0 0 15px rgba(16, 185, 129, 0.3))",
                  }}
                >
                  <path
                    d="M160 30 V 140"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M80 80 H 240"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="160,25 150,45 170,45"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <path
                    d="M120 140 H 200"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Left node cluster */}
                  <path
                    d="M80 80 L 60 120"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M80 80 L 100 120"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx="60"
                    cy="120"
                    r="10"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="120"
                    r="10"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                  <circle cx="60" cy="120" r="4" fill="#a7f3d0" />
                  <circle cx="100" cy="120" r="4" fill="#a7f3d0" />

                  {/* Right node cluster */}
                  <path
                    d="M240 80 L 220 120"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M240 80 L 260 120"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx="220"
                    cy="120"
                    r="10"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                  <circle
                    cx="260"
                    cy="120"
                    r="10"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                  <circle cx="220" cy="120" r="4" fill="#a7f3d0" />
                  <circle cx="260" cy="120" r="4" fill="#a7f3d0" />

                  {/* Central Balance Indicator */}
                  <circle cx="160" cy="80" r="6" fill="#10b981" />
                </svg>
              </div>
            </div>

            {/* Explore Simulation Labs Section (matching user design) */}
            <div className="sim-labs-wrapper" style={{ marginTop: "40px" }}>
              <div className="sim-labs-header">
                <h3 className="sim-labs-title" style={{ fontSize: "1.85rem" }}>
                  Explore Simulation Labs
                </h3>
                <p className="sim-labs-subtitle">
                  Experiment with algorithms, APIs, infrastructure, and
                  real-world scenarios.
                </p>
              </div>

              <div className="sim-labs-grid">
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
          </section>

          {/* ========================================================= */}
          {/* 3. FEATURES SECTION                                       */}
          {/* ========================================================= */}
          <section id="features" className="orbit-section">
            {/* Timeline: Connecting Line & Orange Node */}
            <div className="timeline-segment-features" />
            <div className="timeline-node node-orange">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>

            <div className="section-header">
              <div className="section-tag tag-orange">
                <span>●</span> Key Capabilities
              </div>
              <h2 className="section-title">Features</h2>
            </div>

            <div className="features-stack">
              {/* Feature 1 */}
              <div className="feature-card">
                <h3 className="feature-title">
                  <span className="feature-num">01</span>
                  Autonomous AI-Powered Routing
                </h3>
                <ul className="feature-bullets">
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Self-Learning:</strong> Learns network patterns
                      automatically with Proximal Policy Optimization (PPO).
                    </span>
                  </li>
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>No Manual Setup:</strong> Replaces tedious manual
                      server weighting rules with automated learning.
                    </span>
                  </li>
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Continuous Tuning:</strong> Gets faster and more
                      accurate with every request handled.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 (Staggered Offset) */}
              <div className="feature-card">
                <h3 className="feature-title">
                  <span className="feature-num">02</span>
                  Auto-Healing & Fault Tolerance
                </h3>
                <ul className="feature-bullets">
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Instant Failover:</strong> Detects slow or down
                      servers in milliseconds and reroutes traffic immediately.
                    </span>
                  </li>
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Surge Protection:</strong> Absorbs sudden traffic
                      spikes smoothly without dropping connections.
                    </span>
                  </li>
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Sub-Millisecond Overhead:</strong> Ultra-lean
                      decision engine adding less than 1ms latency.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="feature-card">
                <h3 className="feature-title">
                  <span className="feature-num">03</span>
                  Observability & Easy Integration
                </h3>
                <ul className="feature-bullets">
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Plug & Play:</strong> Easily connects to Docker,
                      Kubernetes, Nginx, or any cloud microservice.
                    </span>
                  </li>
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Real-Time Metrics:</strong> Clear visibility into
                      server loads, request rates, and response latency.
                    </span>
                  </li>
                  <li>
                    <span className="bullet-dot" />
                    <span>
                      <strong>Audit Logs:</strong> Detailed history of routing
                      decisions for testing and performance reviews.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="orbit-footer">
        <div className="footer-content">
          <div>
            <strong style={{ color: "#ffffff" }}>ORBIT</strong>
            {" // "}
            <span>Adaptive Load Balancing</span>
          </div>
          <div>Every Request the right server every time.</div>
          <div className="footer-links">
            <a href="#home">Back to Top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
