"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { SimulationEvent, AlgorithmType, EventSeverity } from "../types";

interface RealTimeEventConsoleProps {
  events: SimulationEvent[];
  selectedAlgorithms: AlgorithmType[];
  onClearEvents?: () => void;
}

const SEVERITY_CONFIG: Record<
  EventSeverity,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  info: {
    label: "INFO",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: "ℹ",
  },
  success: {
    label: "OK",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: "✓",
  },
  warning: {
    label: "WARN",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: "▲",
  },
  error: {
    label: "FAIL",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    icon: "✕",
  },
};

const ALGO_COLORS: Record<AlgorithmType, string> = {
  round_robin: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  random: "text-slate-400 border-slate-500/30 bg-slate-500/10",
  least_connections: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  weighted_round_robin: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  ppo: "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

export default function RealTimeEventConsole({
  events,
  selectedAlgorithms,
  onClearEvents,
}: RealTimeEventConsoleProps) {
  const [algoFilter, setAlgoFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isFeedPaused, setIsFeedPaused] = useState<boolean>(false);
  const [frozenEvents, setFrozenEvents] = useState<SimulationEvent[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Manage frozen events when feed is paused
  useEffect(() => {
    if (!isFeedPaused) {
      setFrozenEvents(events);
    }
  }, [events, isFeedPaused]);

  const activeEvents = isFeedPaused ? frozenEvents : events;

  // Filtered event list
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

  // Auto-scroll to bottom on new event if enabled
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
    <div className="rounded-2xl border border-[#21262d] bg-[#0d1117]/90 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col">
      {/* Console Top Toolbar */}
      <div className="px-5 py-3.5 border-b border-[#21262d] flex flex-wrap items-center justify-between gap-3 bg-[#161b22]/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isFeedPaused ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-ping"
              }`}
            />
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 font-mono">
              EVENT_CONSOLE
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-slate-400 font-sans font-normal">
                {filteredEvents.length} / {events.length} logs
              </span>
            </h3>
          </div>
          {isFeedPaused && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              FEED PAUSED
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 w-36"
          />

          {/* Algorithm Filter */}
          <select
            value={algoFilter}
            onChange={(e) => setAlgoFilter(e.target.value)}
            className="px-2 py-1 text-xs rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Algorithms</option>
            {selectedAlgorithms.map((algo) => (
              <option key={algo} value={algo}>
                {algo.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2 py-1 text-xs rounded-lg bg-[#0d1117] border border-[#30363d] text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={() => setIsFeedPaused(!isFeedPaused)}
            title={isFeedPaused ? "Resume live feed" : "Pause feed to inspect"}
            className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
              isFeedPaused
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                : "bg-[#21262d] border-[#30363d] text-slate-300 hover:bg-[#30363d]"
            }`}
          >
            {isFeedPaused ? "Resume Feed" : "Pause Feed"}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title="Auto-scroll to bottom"
            className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
              autoScroll
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "bg-[#21262d] border-[#30363d] text-slate-400 hover:bg-[#30363d]"
            }`}
          >
            Auto-Scroll: {autoScroll ? "ON" : "OFF"}
          </button>

          {onClearEvents && (
            <button
              onClick={onClearEvents}
              title="Clear event logs"
              className="px-2 py-1 text-xs rounded-lg bg-[#21262d] border border-[#30363d] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollRef}
        className="h-64 sm:h-72 overflow-y-auto p-4 font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent bg-[#090d13]/90 select-text"
      >
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic select-none">
            No events logged yet. Start or configure the simulation to observe live routing actions.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const sev = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.info;
            const algoStyle = ALGO_COLORS[ev.algorithmId] || "text-slate-400 border-slate-700";

            return (
              <div
                key={ev.id}
                className="flex items-start gap-2.5 leading-relaxed hover:bg-[#161b22]/50 px-2 py-1 rounded transition-colors"
              >
                {/* Timestamp */}
                <span className="text-slate-500 shrink-0 select-none">
                  [{formatTimestamp(ev.timestampMs)}]
                </span>

                {/* Severity Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${sev.bg} ${sev.text} ${sev.border}`}
                >
                  <span>{sev.icon}</span>
                  {sev.label}
                </span>

                {/* Algorithm Tag */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0 ${algoStyle}`}
                >
                  {ev.algorithmId.replace(/_/g, " ")}
                </span>

                {/* Event Type & Message */}
                <div className="text-slate-300 break-words flex-1">
                  <span className="text-slate-400 font-semibold mr-1.5">{ev.type}:</span>
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
