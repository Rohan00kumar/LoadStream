"use client";

import { AlgorithmType, VirtualServer, ServerLiveMetrics, RequestResult } from "../types";
import { ALGORITHM_METADATA } from "./AlgorithmSelector";

interface Props {
  selectedAlgorithms: AlgorithmType[];
  servers: VirtualServer[];
  laneMetrics: Record<AlgorithmType, Record<string, ServerLiveMetrics>>;
  laneResults: Record<AlgorithmType, RequestResult[]>;
  onToggleServerFail: (serverId: string) => void;
  isSimulating: boolean;
}

export default function VisualArenaLanes({
  selectedAlgorithms,
  servers,
  laneMetrics,
  laneResults,
  onToggleServerFail,
  isSimulating,
}: Props) {
  if (selectedAlgorithms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#21262d] bg-[#0d1117]/60 p-8 text-center text-xs text-slate-500 font-mono">
        Select at least one algorithm above to render the live routing simulation.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {selectedAlgorithms.map((algoKey) => {
        const meta = ALGORITHM_METADATA[algoKey];
        const metrics = laneMetrics[algoKey] || {};
        const results = laneResults[algoKey] || [];
        const successCount = results.filter((r) => r.status === "success").length;
        const failCount = results.filter((r) => r.status !== "success").length;
        const total = results.length;

        return (
          <div
            key={algoKey}
            className="rounded-xl border border-[#21262d] bg-[#0d1117] p-4 space-y-3 transition-colors hover:border-[#30363d]"
          >
            {/* Lane Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#21262d] pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${meta.color}15`,
                    color: meta.color,
                    border: `1px solid ${meta.color}30`,
                  }}
                >
                  {meta.shortName}
                </span>
                <span className="text-xs font-semibold text-white">{meta.name}</span>
                <span className="text-[11px] font-mono text-slate-500">
                  [{meta.tagline}]
                </span>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-slate-400">
                  Routed: <span className="text-white font-semibold">{total}</span>
                </span>
                <span className="text-emerald-400">
                  Pass: {successCount}
                </span>
                {failCount > 0 && (
                  <span className="text-rose-400 font-semibold">
                    Fail: {failCount}
                  </span>
                )}
              </div>
            </div>

            {/* Server Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {servers.map((srv) => {
                const srvMetric = metrics[srv.id];
                const activeConns = srvMetric?.activeConnections ?? 0;
                const queueDepth = srvMetric?.queuedRequests ?? 0;
                const cpuLoad = srvMetric?.cpuUtilizationPercent ?? (srv.isManualFailed ? 0 : 12);
                const isOffline = srv.isManualFailed || srv.status === "offline";

                return (
                  <div
                    key={srv.id}
                    className={`rounded-lg border p-3 flex flex-col justify-between space-y-2 transition-all duration-300 ease-in-out ${
                      isOffline
                        ? "bg-rose-500/5 border-rose-500/30 opacity-70"
                        : "bg-[#161b22] border-[#21262d] hover:border-slate-700"
                    }`}
                  >
                    {/* Server Header */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200 truncate">{srv.name}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            isOffline
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isOffline ? "Offline" : "Healthy"}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {srv.region} | {srv.cpuCores} cores | {srv.memoryGb}GB
                      </div>
                    </div>

                    {/* Sockets & Queues */}
                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Active Sockets</span>
                        <span className="text-slate-200">
                          {activeConns} / {srv.maxConcurrent}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>Queue Depth</span>
                        <span className={queueDepth > 0 ? "text-amber-400 font-bold" : "text-slate-500"}>
                          {queueDepth}
                        </span>
                      </div>

                      {/* CPU Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>CPU Load</span>
                          <span>{cpuLoad.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-[#0d1117] rounded-full overflow-hidden border border-[#21262d]">
                          <div
                            className={`h-full transition-all duration-300 ease-out ${
                              cpuLoad > 85
                                ? "bg-rose-500"
                                : cpuLoad > 60
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, cpuLoad)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kill / Restore Toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleServerFail(srv.id)}
                      className={`w-full py-1 rounded text-[10px] font-mono uppercase font-semibold transition-all duration-200 active:scale-95 mt-1 ${
                        isOffline
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20"
                      }`}
                    >
                      {isOffline ? "Restore Node" : "Simulate Failure"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
