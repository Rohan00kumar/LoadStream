"use client";

import { useState } from "react";
import { AlgorithmType } from "../types";

interface Props {
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
    title: "Round Robin",
    category: "Static Deterministic",
    badge: "O(1) Memoryless",
    formula: "S_next = S[(i + 1) mod N]",
    howItWorks:
      "Sequentially advances through the pool of healthy nodes in a circular index. Dispatches each incoming request to the next server without tracking socket count or CPU utilization.",
    advantages: [
      "Zero state overhead; executed in constant time O(1).",
      "No communication needed between load balancer worker threads.",
      "Fair distribution under uniform request complexity.",
    ],
    disadvantages: [
      "Assumes all requests require equal processing duration.",
      "Can cause node overloading if slow tasks accumulate on a single server.",
    ],
    idealWorkloads: "Homogeneous microservices with identical latency envelopes.",
    failureMode: "Variance in query execution times creates uneven queue backpressure.",
    productionUse: "Nginx upstream default, DNS round-robin, Kubernetes kube-proxy.",
  },
  {
    id: "random",
    title: "Uniform Random",
    category: "Static Stochastic",
    badge: "O(1) Stateless",
    formula: "S_next = S[floor(rand() * N)]",
    howItWorks:
      "Selects a node uniformly at random using a pseudo-random generator. Over high request volumes, traffic asymptotically converges to equal distribution.",
    advantages: [
      "Completely stateless; requires zero shared index synchronization.",
      "Mitigates cascading stampedes or lock-step resonances.",
      "Fast execution overhead.",
    ],
    disadvantages: [
      "Subject to short-term Poisson clustering (temporary spikes on individual nodes).",
      "No awareness of backend queue depths.",
    ],
    idealWorkloads: "Distributed edge mesh gateways with high-volume stateless requests.",
    failureMode: "Statistical variance can temporarily saturate lower-tier nodes.",
    productionUse: "Envoy Proxy (Random policy), multi-tier CDN routing.",
  },
  {
    id: "least_connections",
    title: "Least Connections",
    category: "Dynamic State-Aware",
    badge: "O(N) Active Sockets",
    formula: "S_next = argmin_{i in S} (ActiveConnections_i)",
    howItWorks:
      "Tracks concurrent in-flight connections per backend node. Dispatches incoming requests to the server currently handling the fewest active connections.",
    advantages: [
      "Compensates naturally for varying query execution times.",
      "Redirects traffic away from slow or struggling servers.",
      "Minimizes tail latency under heterogeneous workloads.",
    ],
    disadvantages: [
      "Requires thread-safe connection tracking across load balancer processes.",
      "Newly added servers can suffer thundering herd until socket counts equalize.",
    ],
    idealWorkloads: "Database connection pools, WebSocket streaming, variable compute tasks.",
    failureMode: "Servers failing fast with 500s drop sockets immediately, attracting more traffic.",
    productionUse: "HAProxy leastconn, AWS ALB, Nginx least_conn.",
  },
  {
    id: "weighted_round_robin",
    title: "Weighted Round Robin",
    category: "Capacity Proportional",
    badge: "Hardware-Weighted",
    formula: "Ratio(S_i) = Weight_i / Sum(Weight_k)",
    howItWorks:
      "Assigns static numeric capacity weights to servers based on hardware specs. Cycles through servers in direct proportion to their configured weights.",
    advantages: [
      "Allows heterogeneous server tiers (e.g. 8-core vs 2-core) to coexist safely.",
      "Predictable traffic proportions for canary testing or gradual rollouts.",
    ],
    disadvantages: [
      "Static weights do not adapt to runtime memory pressure or background lag.",
      "Requires manual capacity tuning and maintenance.",
    ],
    idealWorkloads: "Clusters with mixed hardware tiers or hybrid on-premise cloud topologies.",
    failureMode: "Misconfigured weights lead to constant overloading of weaker nodes.",
    productionUse: "Nginx weight directive, Envoy WRR, AWS Target Groups.",
  },
  {
    id: "ppo",
    title: "PPO Policy (Reinforcement Learning)",
    category: "Adaptive Neural Policy",
    badge: "Actor-Critic Gradient",
    formula: "L_CLIP(theta) = E_t [min(r_t(theta)*A_t, clip(r_t(theta), 1-eps, 1+eps)*A_t)]",
    howItWorks:
      "Evaluates real-time cluster telemetry (CPU load, queue variance, latency gradient) through a trained deep reinforcement learning neural policy, inferring optimal dispatch probabilities.",
    advantages: [
      "Anticipates queue buildup and server saturation before limits are breached.",
      "Learns non-linear correlations between request attributes and node performance.",
      "Adapts dynamically to sudden traffic spikes.",
    ],
    disadvantages: [
      "Inference latency overhead (~0.8ms forward pass).",
      "Requires pre-training in simulation to avoid exploratory routing failures.",
    ],
    idealWorkloads: "Complex multi-tier microservice architectures with volatile traffic patterns.",
    failureMode: "Out-of-distribution traffic patterns unseen during policy training.",
    productionUse: "Google Borg cluster scheduling, autonomous cloud traffic fabrics.",
  },
];

export default function EducationalDrawer({
  isOpen,
  onClose,
  defaultAlgo = "round_robin",
}: Props) {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>(defaultAlgo);

  if (!isOpen) return null;

  const activeGuide = GUIDES.find((g) => g.id === selectedAlgo) || GUIDES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0d1117] border border-[#21262d] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              ALGORITHM ARCHITECTURE REFERENCE
            </h3>
            <p className="text-[11px] text-slate-400">
              Theoretical routing models, characteristics, and production trade-offs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-white rounded bg-[#21262d]"
          >
            Close
          </button>
        </div>

        {/* Algo Tab Bar */}
        <div className="px-5 py-2 border-b border-[#21262d] bg-[#161b22]/50 flex flex-wrap gap-1.5">
          {GUIDES.map((g) => {
            const isSelected = selectedAlgo === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedAlgo(g.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  isSelected
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-[#21262d] text-slate-400 hover:text-white"
                }`}
              >
                {g.title}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
            <div>
              <span className="text-sm font-bold text-white font-sans">{activeGuide.title}</span>
              <span className="text-[11px] text-slate-400 ml-2">({activeGuide.category})</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#161b22] text-purple-300 border border-purple-500/30 text-[10px]">
              {activeGuide.badge}
            </span>
          </div>

          {/* Formula */}
          <div className="p-2.5 rounded bg-[#161b22] border border-[#21262d] text-purple-300 text-[11px]">
            Formula: {activeGuide.formula}
          </div>

          {/* Description */}
          <div className="p-3 rounded bg-[#161b22]/50 border border-[#21262d] text-slate-300 leading-relaxed font-sans text-xs">
            {activeGuide.howItWorks}
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            <div className="p-3 rounded bg-[#161b22]/40 border border-[#21262d] space-y-1.5">
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                ADVANTAGES
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {activeGuide.advantages.map((adv, idx) => (
                  <li key={idx}>{adv}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded bg-[#161b22]/40 border border-[#21262d] space-y-1.5">
              <span className="font-mono text-[10px] text-rose-400 font-bold uppercase">
                TRADE-OFFS & LIMITS
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {activeGuide.disadvantages.map((dis, idx) => (
                  <li key={idx}>{dis}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scenarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="p-2.5 rounded bg-[#161b22]/30 border border-[#21262d]">
              <span className="text-slate-400 font-bold block mb-0.5">IDEAL WORKLOAD</span>
              <span className="text-slate-300 font-sans">{activeGuide.idealWorkloads}</span>
            </div>
            <div className="p-2.5 rounded bg-[#161b22]/30 border border-[#21262d]">
              <span className="text-slate-400 font-bold block mb-0.5">FAILURE SCENARIO</span>
              <span className="text-slate-300 font-sans">{activeGuide.failureMode}</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#161b22]/30 border border-[#21262d] flex justify-between text-[11px]">
            <span className="text-slate-400 font-bold">PRODUCTION ADOPTION</span>
            <span className="text-slate-300">{activeGuide.productionUse}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
