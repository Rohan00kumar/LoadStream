"use client";

import { WorkloadConfig, WorkloadPattern, RequestComplexity } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: WorkloadConfig;
  onSave: (newConfig: WorkloadConfig) => void;
}

export default function WorkloadConfigModal({ isOpen, onClose, config, onSave }: Props) {
  if (!isOpen) return null;

  const patterns: { id: WorkloadPattern; label: string; desc: string }[] = [
    { id: "constant", label: "Constant Traffic", desc: "Steady uniform ingress rate" },
    { id: "ramp_up", label: "Gradual Ramp-Up", desc: "Linearly accelerates from 20% to 100% capacity" },
    { id: "spike", label: "Sudden Spike", desc: "5x traffic surge mid-run" },
    { id: "burst", label: "Burst Traffic", desc: "Alternating pulses and quiet lulls" },
    { id: "random", label: "Poisson Random", desc: "Stochastic inter-arrival distribution" },
  ];

  const complexities: { id: RequestComplexity; label: string; desc: string }[] = [
    { id: "light", label: "Light", desc: "15-30ms, ~6% CPU" },
    { id: "medium", label: "Medium", desc: "45-85ms, ~15% CPU" },
    { id: "heavy", label: "Heavy", desc: "140-260ms, ~35% CPU" },
    { id: "mixed", label: "Mixed", desc: "60% Light, 30% Med, 10% Heavy" },
  ];

  const applyPreset = (preset: "steady" | "spike" | "burst" | "stress") => {
    if (preset === "steady") {
      onSave({ ...config, totalRequests: 200, requestsPerSecond: 25, pattern: "constant", complexity: "mixed" });
    } else if (preset === "spike") {
      onSave({ ...config, totalRequests: 300, requestsPerSecond: 40, pattern: "spike", complexity: "mixed" });
    } else if (preset === "burst") {
      onSave({ ...config, totalRequests: 250, requestsPerSecond: 30, pattern: "burst", complexity: "heavy" });
    } else if (preset === "stress") {
      onSave({ ...config, totalRequests: 500, requestsPerSecond: 60, pattern: "ramp_up", complexity: "mixed" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-enter-anim w-full max-w-xl max-h-[90vh] bg-[#0d1117] border border-[#21262d] rounded-xl p-5 overflow-y-auto space-y-4 shadow-2xl font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              WORKLOAD GENERATOR CONFIG
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Set request volume, arrival patterns, and computational complexity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-slate-400 hover:text-white rounded bg-[#161b22]"
          >
            Close
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
            PRESETS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "steady", label: "Steady (200 reqs)" },
              { id: "spike", label: "Flash Spike (300 reqs)" },
              { id: "burst", label: "Microbursts (250 reqs)" },
              { id: "stress", label: "Stress Test (500 reqs)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id as any)}
                className="px-2.5 py-1 rounded bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase">
              Total Requests
            </label>
            <input
              type="number"
              min={20}
              max={2000}
              step={10}
              value={config.totalRequests}
              onChange={(e) =>
                onSave({ ...config, totalRequests: Math.max(10, parseInt(e.target.value) || 100) })
              }
              className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1 uppercase">
              Target RPS Rate
            </label>
            <input
              type="number"
              min={5}
              max={200}
              step={5}
              value={config.requestsPerSecond}
              onChange={(e) =>
                onSave({ ...config, requestsPerSecond: Math.max(1, parseInt(e.target.value) || 20) })
              }
              className="w-full bg-[#161b22] border border-[#21262d] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Traffic Pattern */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] text-slate-400 block uppercase">
            Traffic Arrival Pattern
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans">
            {patterns.map((pat) => (
              <button
                key={pat.id}
                type="button"
                onClick={() => onSave({ ...config, pattern: pat.id })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  config.pattern === pat.id
                    ? "bg-purple-500/10 border-purple-500/50 text-white"
                    : "bg-[#161b22] border-[#21262d] text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-semibold">{pat.label}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{pat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Complexity Profile */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] text-slate-400 block uppercase">
            Request Complexity Profile
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-sans">
            {complexities.map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => onSave({ ...config, complexity: comp.id })}
                className={`p-2 rounded-lg border text-left transition-all ${
                  config.complexity === comp.id
                    ? "bg-purple-500/10 border-purple-500/50 text-white"
                    : "bg-[#161b22] border-[#21262d] text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-semibold">{comp.label}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{comp.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#21262d] pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
