"use client";

import { SimulationState, SimulationSpeed, WorkloadConfig } from "../types";

interface Props {
  state: SimulationState;
  speed: SimulationSpeed;
  progressPercent: number;
  virtualTimeMs: number;
  workloadConfig: WorkloadConfig;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: SimulationSpeed) => void;
  onOpenWorkloadModal: () => void;
  onOpenServerModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenGuideModal: () => void;
  canStart: boolean;
}

export default function ArenaControls({
  state,
  speed,
  progressPercent,
  virtualTimeMs,
  workloadConfig,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onSpeedChange,
  onOpenWorkloadModal,
  onOpenServerModal,
  onOpenHistoryModal,
  onOpenGuideModal,
  canStart,
}: Props) {
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isCompleted = state === "completed";

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const fraction = Math.floor((ms % 1000) / 100);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${fraction}s`;
  };

  const processedCount = Math.min(
    workloadConfig.totalRequests,
    Math.round((progressPercent / 100) * workloadConfig.totalRequests)
  );

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] p-3.5 space-y-3">
      {/* Primary Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {state === "idle" && (
            <button
              onClick={onStart}
              disabled={!canStart}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all ${
                canStart
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-500/20"
                  : "bg-[#21262d] text-slate-500 cursor-not-allowed"
              }`}
            >
              Start Run
            </button>
          )}

          {isRunning && (
            <button
              onClick={onPause}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              Pause
            </button>
          )}

          {isPaused && (
            <button
              onClick={onResume}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
            >
              Resume
            </button>
          )}

          {(isRunning || isPaused) && (
            <button
              onClick={onStop}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            >
              Stop
            </button>
          )}

          {(isCompleted || state === "stopped" || isPaused) && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono bg-[#21262d] border border-[#30363d] text-slate-300 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}

          {isCompleted && (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              Rerun
            </button>
          )}

          {/* Speed Multiplier Segmented Buttons */}
          <div className="flex items-center rounded-lg border border-[#30363d] bg-[#161b22] p-0.5 ml-2">
            {([0.5, 1, 2, 4] as SimulationSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  speed === s
                    ? "bg-purple-500/30 text-purple-200 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Modals Triggers */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={onOpenWorkloadModal}
            className="px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white hover:border-[#30363d] transition-colors"
          >
            Workload ({workloadConfig.pattern})
          </button>
          <button
            onClick={onOpenServerModal}
            className="px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white hover:border-[#30363d] transition-colors"
          >
            Cluster Nodes
          </button>
          <button
            onClick={onOpenHistoryModal}
            className="px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-slate-300 hover:text-white hover:border-[#30363d] transition-colors"
          >
            History
          </button>
        </div>
      </div>

      {/* Progress & Runtime Status Bar */}
      <div className="pt-2 border-t border-[#21262d] flex flex-col gap-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                isRunning
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : isPaused
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : isCompleted
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {state}
            </span>
            <span>Clock: {formatTime(virtualTimeMs)}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {processedCount} / {workloadConfig.totalRequests} reqs
            </span>
            <span className="text-white font-bold">{Math.round(progressPercent)}%</span>
          </div>
        </div>

        {/* Crisp slim progress line */}
        <div className="w-full h-1 bg-[#161b22] rounded-full overflow-hidden border border-[#21262d]">
          <div
            className="h-full bg-purple-500 transition-all duration-150 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
