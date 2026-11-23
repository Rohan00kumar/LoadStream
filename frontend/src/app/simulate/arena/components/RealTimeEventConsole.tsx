"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { SimulationEvent, AlgorithmType, EventSeverity } from "../types";

interface Props {
  events: SimulationEvent[];
  selectedAlgorithms: AlgorithmType[];
  onClearEvents?: () => void;
}

const SEVERITY_CONFIG: Record<
  EventSeverity,
  { label: string; bg: string; text: string; border: string }
> = {
  info: {
    label: "INFO",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  success: {
    label: "PASS",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  warning: {
    label: "WARN",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  error: {
    label: "FAIL",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

const ALGO_STYLES: Record<AlgorithmType, string> = {
  round_robin: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  random: "text-slate-400 border-slate-500/30 bg-slate-500/10",
  least_connections: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  weighted_round_robin: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  ppo: "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

export default function RealTimeEventConsole({
  events,
  selectedAlgorithms,
  onClearEvents,
}: Props) {
  const [algoFilter, setAlgoFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isFeedPaused, setIsFeedPaused] = useState<boolean>(false);
  const [frozenEvents, setFrozenEvents] = useState<SimulationEvent[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFeedPaused) {
      setFrozenEvents(events);
    }
  }, [events, isFeedPaused]);

  const activeEvents = isFeedPaused ? frozenEvents : events;

  const filteredEvents = useMemo(() => {
    return activeEvents.filter((ev) => {
      if (algoFilter !== "all" && ev.algorithmId !== algoFilter) return false;
      if (severityFilter !== "all" && ev.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          ev.message.toLowerCase().includes(query) ||
          ev.type.toLowerCase().includes(query) ||
          ev.serverId?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeEvents, algoFilter, severityFilter, searchQuery]);

  useEffect(() => {
    if (autoScroll && scrollRef.current && !isFeedPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredEvents.length, autoScroll, isFeedPaused]);

  const formatTimestamp = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const fraction = Math.floor((ms % 1000) / 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(
      fraction
    ).padStart(2, "0")}`;
  };

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#0d1117] overflow-hidden flex flex-col font-mono text-xs">
      {/* Console Header Bar */}
      <div className="px-4 py-2.5 border-b border-[#21262d] flex flex-wrap items-center justify-between gap-2.5 bg-[#161b22]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white tracking-wider">
            EVENT LOG
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#21262d] text-slate-400">
            {filteredEvents.length} / {events.length}
          </span>
          {isFeedPaused && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              PAUSED
            </span>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-0.5 text-[11px] rounded bg-[#0d1117] border border-[#30363d] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 w-28"
          />

          <select
            value={algoFilter}
            onChange={(e) => setAlgoFilter(e.target.value)}
            className="px-2 py-0.5 text-[11px] rounded bg-[#0d1117] border border-[#30363d] text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Algorithms</option>
            {selectedAlgorithms.map((algo) => (
              <option key={algo} value={algo}>
                {algo.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2 py-0.5 text-[11px] rounded bg-[#0d1117] border border-[#30363d] text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Severity</option>
            <option value="info">INFO</option>
            <option value="success">PASS</option>
            <option value="warning">WARN</option>
            <option value="error">FAIL</option>
          </select>

          <button
            onClick={() => setIsFeedPaused(!isFeedPaused)}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              isFeedPaused
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-[#21262d] border-[#30363d] text-slate-400 hover:text-slate-200"
            }`}
          >
            {isFeedPaused ? "Resume" : "Pause"}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              autoScroll
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "bg-[#21262d] border-[#30363d] text-slate-500 hover:text-slate-300"
            }`}
          >
            Auto-Scroll: {autoScroll ? "ON" : "OFF"}
          </button>

          {onClearEvents && (
            <button
              onClick={onClearEvents}
              className="px-2 py-0.5 rounded text-[11px] bg-[#21262d] border border-[#30363d] text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal Lines Container */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto p-3 text-[11px] space-y-1 bg-[#090d13] select-text scrollbar-thin scrollbar-thumb-[#21262d]"
      >
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic select-none">
            No events recorded. Start simulation to observe routing log stream.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const sev = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.info;
            const algoStyle = ALGO_STYLES[ev.algorithmId] || "text-slate-400 border-slate-700";

            return (
              <div
                key={ev.id}
                className="flex items-start gap-2 leading-relaxed hover:bg-[#161b22]/60 px-1.5 py-0.5 rounded transition-colors"
              >
                <span className="text-slate-600 shrink-0 select-none">
                  [{formatTimestamp(ev.timestampMs)}]
                </span>

                <span
                  className={`px-1 py-0.1 rounded text-[9px] font-bold border shrink-0 ${sev.bg} ${sev.text} ${sev.border}`}
                >
                  {sev.label}
                </span>

                <span
                  className={`px-1 py-0.1 rounded text-[9px] uppercase font-bold border shrink-0 ${algoStyle}`}
                >
                  {ev.algorithmId.replace(/_/g, " ")}
                </span>

                <div className="text-slate-300 break-words flex-1">
                  <span className="text-slate-500 mr-1.5">[{ev.type}]</span>
                  <span>{ev.message}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
