"use client";

import { useState } from "react";
import { VirtualServer } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  servers: VirtualServer[];
  onUpdateServers: (servers: VirtualServer[]) => void;
  onResetDefaults: () => void;
}

export default function ServerManagerModal({
  isOpen,
  onClose,
  servers,
  onUpdateServers,
  onResetDefaults,
}: Props) {
  const [editingServer, setEditingServer] = useState<VirtualServer | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formName, setFormName] = useState("");
  const [formRegion, setFormRegion] = useState("us-east-1");
  const [formCores, setFormCores] = useState(4);
  const [formMemory, setFormMemory] = useState(8);
  const [formMaxConcurrent, setFormMaxConcurrent] = useState(25);
  const [formWeight, setFormWeight] = useState(2);
  const [formBaseLatency, setFormBaseLatency] = useState(15);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingServer(null);
    setFormName(`Node-${String.fromCharCode(65 + servers.length)}`);
    setFormRegion("us-east-1");
    setFormCores(4);
    setFormMemory(8);
    setFormMaxConcurrent(25);
    setFormWeight(2);
    setFormBaseLatency(15);
  };

  const handleStartEdit = (srv: VirtualServer) => {
    setEditingServer(srv);
    setIsAdding(false);
    setFormName(srv.name);
    setFormRegion(srv.region);
    setFormCores(srv.cpuCores);
    setFormMemory(srv.memoryGb);
    setFormMaxConcurrent(srv.maxConcurrent);
    setFormWeight(srv.weight || 2);
    setFormBaseLatency(srv.baseLatencyMs);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newSrv: VirtualServer = {
        id: `srv-${Date.now().toString().slice(-4)}`,
        name: formName || `Node-${servers.length + 1}`,
        region: formRegion,
        cpuCores: formCores,
        memoryGb: formMemory,
        maxConcurrent: formMaxConcurrent,
        weight: formWeight,
        baseLatencyMs: formBaseLatency,
        status: "healthy",
      };
      onUpdateServers([...servers, newSrv]);
      setIsAdding(false);
    } else if (editingServer) {
      const updated = servers.map((s) =>
        s.id === editingServer.id
          ? {
              ...s,
              name: formName,
              region: formRegion,
              cpuCores: formCores,
              memoryGb: formMemory,
              maxConcurrent: formMaxConcurrent,
              weight: formWeight,
              baseLatencyMs: formBaseLatency,
            }
          : s
      );
      onUpdateServers(updated);
      setEditingServer(null);
    }
  };

  const handleDeleteServer = (id: string) => {
    if (servers.length <= 1) {
      alert("At least one server node must remain active.");
      return;
    }
    onUpdateServers(servers.filter((s) => s.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-enter-anim w-full max-w-3xl max-h-[90vh] bg-[#0d1117] border border-[#21262d] rounded-xl p-5 overflow-y-auto space-y-4 shadow-2xl font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              VIRTUAL CLUSTER TOPOLOGY
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Add, tune capacity, and manage cluster nodes across compute regions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartAdd}
              className="px-2.5 py-1 rounded bg-purple-600 text-white hover:bg-purple-500 font-semibold transition-colors"
            >
              Add Node
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 text-slate-400 hover:text-white rounded bg-[#161b22]"
            >
              Close
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingServer) && (
          <form
            onSubmit={handleSaveForm}
            className="p-3.5 rounded-lg border border-purple-500/40 bg-purple-500/5 space-y-3"
          >
            <div className="text-xs font-bold text-purple-300 font-sans">
              {isAdding ? "Add New Server Node" : `Edit Node: ${editingServer?.name}`}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Node Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Region</label>
                <select
                  value={formRegion}
                  onChange={(e) => setFormRegion(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="us-east-1">us-east-1</option>
                  <option value="us-west-2">us-west-2</option>
                  <option value="eu-central-1">eu-central-1</option>
                  <option value="ap-south-1">ap-south-1</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">CPU Cores</label>
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={formCores}
                  onChange={(e) => setFormCores(parseInt(e.target.value) || 2)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Memory (GB)</label>
                <input
                  type="number"
                  min={2}
                  max={256}
                  value={formMemory}
                  onChange={(e) => setFormMemory(parseInt(e.target.value) || 8)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Max Concurrent</label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={formMaxConcurrent}
                  onChange={(e) => setFormMaxConcurrent(parseInt(e.target.value) || 20)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">WRR Weight</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formWeight}
                  onChange={(e) => setFormWeight(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Base Ping (ms)</label>
                <input
                  type="number"
                  min={2}
                  max={150}
                  value={formBaseLatency}
                  onChange={(e) => setFormBaseLatency(parseInt(e.target.value) || 10)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingServer(null);
                }}
                className="px-2.5 py-1 text-slate-400 hover:text-white rounded bg-[#161b22]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                Save Node
              </button>
            </div>
          </form>
        )}

        {/* Existing Servers List */}
        <div className="space-y-2">
          {servers.map((srv) => (
            <div
              key={srv.id}
              className="p-3 rounded-lg border border-[#21262d] bg-[#161b22] flex flex-wrap items-center justify-between gap-2.5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white font-sans">{srv.name}</span>
                  <span className="text-[10px] text-slate-500">[{srv.region}]</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {srv.cpuCores} cores | {srv.memoryGb}GB RAM | {srv.maxConcurrent} max conns | Weight: {srv.weight || 1} | Latency: {srv.baseLatencyMs}ms
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleStartEdit(srv)}
                  className="px-2 py-1 rounded bg-[#21262d] text-slate-300 hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteServer(srv.id)}
                  className="px-2 py-1 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#21262d] pt-3 flex items-center justify-between">
          <button
            onClick={onResetDefaults}
            className="text-[11px] text-slate-400 hover:text-white"
          >
            Reset Default Cluster
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
