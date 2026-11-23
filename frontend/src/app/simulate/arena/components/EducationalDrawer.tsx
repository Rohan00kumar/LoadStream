"use client";

import { useState } from "react";
import { AlgorithmType } from "../types";

interface EducationalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAlgo?: AlgorithmType;
}

interface GuideContent {
  id: AlgorithmType;
  title: string;
  category: string;
  badge: string;
  formula: string;
  howItWorks: string;
  advantages: string[];
  disadvantages: string[];
  idealWorkloads: string;
  failureMode: string;
  productionUse: string;
}

const GUIDES: GuideContent[] = [
  {
    id: "round_robin",
    title: "Round Robin (RR)",
    category: "Static Deterministic",
    badge: "O(1) Memoryless",
    formula: "S_next = S[(i + 1) mod N]",
    howItWorks:
      "Sequentially steps through the healthy server pool in a circular index. Each incoming request is handed to the next server without evaluating server load, queue depth, or request complexity.",
    advantages: [
      "Zero state overhead; executed in constant time O(1).",
      "No communication needed between load balancer nodes.",
      "Fair and completely deterministic distribution under uniform request lengths.",
    ],
    disadvantages: [
      "Assumes all requests require equal processing time.",
      "Assumes all backend servers have identical compute and memory capacity.",
      "Can cause catastrophic server overloading if long-running requests pile up on one node.",
    ],
    idealWorkloads: "Static asset serving, microservice RPCs with identical latency envelopes.",
    failureMode:
      "When request durations vary significantly (e.g. 5ms vs 500ms), servers can become severely imbalanced (Convoy Effect).",
    productionUse: "Default in DNS load balancing, Nginx upstream default, Kubernetes kube-proxy iptables.",
  },
  {
    id: "random",
    title: "Uniform Random",
    category: "Static Stochastic",
    badge: "O(1) Stateless",
    formula: "S_next = S[floor(rand() * N)]",
    howItWorks:
      "Selects a server uniformly at random from all healthy nodes using a pseudo-random number generator. Over large request volumes (N > 10,000), request distribution asymptotically converges to equal share across all servers.",
    advantages: [
      "Completely stateless; requires zero shared index synchronization across multiple load balancers.",
      "Mitigates cascading stampedes or lock-step resonances that can occur in round-robin.",
      "Extremely fast to compute.",
    ],
    disadvantages: [
      "Subject to short-term Poisson clustering (statistical bursts where one server gets several requests back-to-back).",
      "Completely unaware of server health, connection depth, or queue backpressure.",
    ],
    idealWorkloads: "High-volume distributed gateways with thousands of stateless micro-requests.",
    failureMode: "Temporary load spikes on individual nodes due to variance in random sampling.",
    productionUse: "Envoy proxy (Random load balancing policy), multi-tier edge CDN routing.",
  },
  {
    id: "least_connections",
    title: "Least Connections",
    category: "Dynamic State-Aware",
    badge: "O(N) Active Sockets",
    formula: "S_next = argmin_{i ∈ S} (ActiveConnections_i)",
    howItWorks:
      "Maintains active socket counts for every backend server. When a request arrives, it evaluates current in-flight connections and routes to the server currently handling the fewest active concurrent requests.",
    advantages: [
      "Automatically compensates for heterogeneous request processing durations.",
      "Naturally redirects traffic away from struggling or slow servers without needing health checks to fail.",
      "Maintains low tail latencies (P95/P99) under high-variance payloads.",
    ],
    disadvantages: [
      "Requires state tracking across load balancer threads or distributed state synchronization.",
      "Can cause 'thundering herd' to newly added servers because they start with 0 connections.",
    ],
    idealWorkloads:
      "Database connection pooling, WebSocket streaming servers, CPU-intensive transactional workloads.",
    failureMode:
      "If a server starts failing immediately with 500 errors, its active connection count drops to zero, inadvertently attracting more requests.",
    productionUse: "HAProxy `leastconn`, AWS Application Load Balancer (ALB), Nginx `least_conn`.",
  },
  {
    id: "weighted_round_robin",
    title: "Weighted Round Robin (WRR)",
    category: "Proportional Static",
    badge: "Capacity-Weighted",
    formula: "Ratio(S_i) = Weight_i / ∑ Weight_k",
    howItWorks:
      "Extends round-robin by assigning static numerical weights to servers based on hardware specs (e.g. 8-core server gets weight 4, 2-core server gets weight 1). The smooth interleaved algorithm cycles through servers in proportion to their weight.",
    advantages: [
      "Allows heterogeneous server fleets (differing CPU, RAM, and GPU capacities) to operate safely in one pool.",
      "Low algorithmic overhead while respecting hardware differences.",
      "Predictable traffic proportions for canary testing or gradual rollouts.",
    ],
    disadvantages: [
      "Weights are static; fails to adapt if a background cron or memory leak throttles a high-weight server.",
      "Requires manual capacity tuning and maintenance.",
    ],
    idealWorkloads:
      "Clusters with mixed hardware generations, hybrid on-premise + cloud burst topologies, canary deployments.",
    failureMode:
      "Misconfigured weights lead to constant overloading of under-provisioned nodes.",
    productionUse: "Nginx `weight` parameter, Envoy Weighted Round Robin, AWS Target Groups.",
  },
  {
    id: "ppo",
    title: "PPO Policy (Deep Reinforcement Learning)",
    category: "Adaptive Neural Policy",
    badge: "Actor-Critic Gradient",
    formula: "L^{CLIP}(θ) = \u00ca_t [min(r_t(θ)Â_t, clip(r_t(θ), 1-ε, 1+ε)Â_t)]",
    howItWorks:
      "Uses a Proximal Policy Optimization (PPO) neural network actor-critic model. It continuously observes server telemetry (CPU utilization, queue depth, latency variance, recent error rate) and outputs an optimal probability distribution over backend nodes to minimize systemic latency while maximizing cluster throughput.",
    advantages: [
      "Anticipates congestion before servers exceed capacity limits.",
      "Learns non-linear correlations between complex request parameters and server performance.",
      "Adapts in real-time to sudden traffic spikes, cache warmups, and degraded network paths.",
    ],
    disadvantages: [
      "Inference latency: calculating neural forward passes requires GPU/CPU inference budgets.",
      "Requires extensive pre-training in simulation environments to prevent exploratory failures in production.",
    ],
    idealWorkloads:
      "Complex multi-tier microservice meshes with unpredictable traffic spikes and heterogeneous server profiles.",
    failureMode:
      "Out-of-distribution traffic patterns that the reinforcement learning policy was never trained on.",
    productionUse:
      "Google Borg autonomic cluster scheduling, Netflix intelligent routing, modern autonomous traffic fabrics.",
  },
];

export default function EducationalDrawer({
  isOpen,
  onClose,
  defaultAlgo = "round_robin",
}: EducationalDrawerProps) {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>(defaultAlgo);

  if (!isOpen) return null;

  const activeGuide = GUIDES.find((g) => g.id === selectedAlgo) || GUIDES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎓</span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Load Balancing Architecture Guide
              </h3>
              <p className="text-xs text-slate-400">
                Theoretical foundations, routing equations, and architectural trade-offs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#21262d] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Algo Tab Bar */}
        <div className="px-6 py-3 border-b border-[#21262d] bg-[#161b22]/50 flex flex-wrap gap-2">
          {GUIDES.map((g) => {
            const isSelected = selectedAlgo === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedAlgo(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow"
                    : "bg-[#21262d] text-slate-400 hover:text-white hover:bg-[#30363d]"
                }`}
              >
                {g.title}
              </button>
            );
          })}
        </div>

        {/* Guide Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21262d] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold text-white">{activeGuide.title}</h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                  {activeGuide.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Classification: {activeGuide.category}</p>
            </div>

            {/* Mathematical Formula Card */}
            <div className="px-3.5 py-2 rounded-xl bg-[#161b22] border border-[#21262d] font-mono text-xs text-purple-300">
              {activeGuide.formula}
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
              How the Algorithm Works
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#161b22]/50 p-4 rounded-xl border border-[#21262d]">
              {activeGuide.howItWorks}
            </p>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Advantages */}
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
              <h5 className="text-xs font-bold uppercase font-mono text-emerald-400 flex items-center gap-1.5">
                <span>✓</span> Key Advantages
              </h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {activeGuide.advantages.map((adv, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {adv}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disadvantages */}
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
              <h5 className="text-xs font-bold uppercase font-mono text-rose-400 flex items-center gap-1.5">
                <span>✕</span> Limitations & Trade-offs
              </h5>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {activeGuide.disadvantages.map((dis, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {dis}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ideal Workloads & Failure Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
              <span className="font-mono text-[10px] text-blue-400 uppercase font-bold">
                Ideal Workload Scenarios
              </span>
              <p className="text-slate-300 leading-relaxed">{activeGuide.idealWorkloads}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] space-y-1">
              <span className="font-mono text-[10px] text-amber-400 uppercase font-bold">
                Failure & Bottleneck Condition
              </span>
              <p className="text-slate-300 leading-relaxed">{activeGuide.failureMode}</p>
            </div>
          </div>

          {/* Production Implementations */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#21262d] flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">INDUSTRY ADOPTION:</span>
            <span className="text-purple-300 font-semibold">{activeGuide.productionUse}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#21262d] bg-[#161b22] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#21262d] text-slate-300 hover:text-white hover:bg-[#30363d] transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
