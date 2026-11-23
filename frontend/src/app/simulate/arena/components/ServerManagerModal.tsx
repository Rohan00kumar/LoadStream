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
    setFormWeight(srv.weight);
    setFormBaseLatency(srv.baseLatencyMs);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newSrv: VirtualServer = {
        id: `srv-${Date.now().toString(36)}`,
        name: formName || `Node-${servers.length + 1}`,
        region: formRegion,
        cpuCores: Number(formCores) || 4,
        memoryGb: Number(formMemory) || 8,
        maxConcurrent: Number(formMaxConcurrent) || 20,
        weight: Number(formWeight) || 1,
        baseLatencyMs: Number(formBaseLatency) || 15,
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
              cpuCores: Number(formCores),
              memoryGb: Number(formMemory),
              maxConcurrent: Number(formMaxConcurrent),
              weight: Number(formWeight),
              baseLatencyMs: Number(formBaseLatency),
            }
          : s
      );
      onUpdateServers(updated);
      setEditingServer(null);
    }
  };

  const handleDelete = (id: string) => {
    if (servers.length <= 2) {
      alert("A cluster must have at least 2 servers for load balancing.");
      return;
    }
    onUpdateServers(servers.filter((s) => s.id !== id));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#111622",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "26px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>Virtual Server Cluster Manager</h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Add, configure, or calibrate virtual hardware capacity in the testbed.</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Action Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button
            onClick={handleStartAdd}
            style={{
              padding: "6px 14px",
              backgroundColor: "rgba(52, 211, 153, 0.15)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              borderRadius: "6px",
              color: "#34d399",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add New Virtual Server
          </button>

          <button
            onClick={onResetDefaults}
            style={{
              padding: "6px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#94a3b8",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            ↺ Restore Defaults
          </button>
        </div>

        {/* Server Edit / Add Form */}
        {(isAdding || editingServer) && (
          <form
            onSubmit={handleSaveForm}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(167, 139, 250, 0.3)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#a78bfa", marginBottom: "12px" }}>
              {isAdding ? "Create New Virtual Server" : `Edit ${editingServer?.name}`}
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Region</label>
                <select
                  value={formRegion}
                  onChange={(e) => setFormRegion(e.target.value)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                >
                  <option value="us-east-1">us-east-1</option>
                  <option value="us-west-2">us-west-2</option>
                  <option value="eu-central-1">eu-central-1</option>
                  <option value="ap-south-1">ap-south-1</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>vCPU Cores</label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={formCores}
                  onChange={(e) => setFormCores(parseInt(e.target.value) || 4)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Memory (GB)</label>
                <input
                  type="number"
                  min="2"
                  max="128"
                  value={formMemory}
                  onChange={(e) => setFormMemory(parseInt(e.target.value) || 8)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Max Concurrency</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={formMaxConcurrent}
                  onChange={(e) => setFormMaxConcurrent(parseInt(e.target.value) || 20)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Weight (WRR)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formWeight}
                  onChange={(e) => setFormWeight(parseInt(e.target.value) || 1)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Base Latency (ms)</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={formBaseLatency}
                  onChange={(e) => setFormBaseLatency(parseInt(e.target.value) || 15)}
                  style={{ width: "100%", background: "#0a0e17", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", padding: "6px 8px", color: "#ffffff", fontSize: "0.82rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingServer(null);
                }}
                style={{ padding: "6px 12px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#94a3b8", fontSize: "0.82rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: "6px 16px", backgroundColor: "#a855f7", border: "none", borderRadius: "6px", color: "#ffffff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
              >
                Save Server
              </button>
            </div>
          </form>
        )}

        {/* Existing Servers List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {servers.map((srv) => (
            <div
              key={srv.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "12px 16px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong style={{ fontSize: "0.92rem", color: "#ffffff" }}>{srv.name}</strong>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>[{srv.region}]</span>
                  <span style={{ fontSize: "0.7rem", color: srv.status === "offline" ? "#fca5a5" : "#34d399", backgroundColor: srv.status === "offline" ? "#7f1d1d" : "#064e3b", padding: "1px 6px", borderRadius: "4px" }}>
                    {srv.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>
                  {srv.cpuCores} vCPU • {srv.memoryGb}GB RAM • Max Conns: {srv.maxConcurrent} • Weight: {srv.weight}x • Base Ping: {srv.baseLatencyMs}ms
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleStartEdit(srv)}
                  style={{ padding: "4px 10px", backgroundColor: "rgba(255,255,255,0.08)", border: "none", borderRadius: "4px", color: "#cbd5e1", fontSize: "0.78rem", cursor: "pointer" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(srv.id)}
                  style={{ padding: "4px 10px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "4px", color: "#fca5a5", fontSize: "0.78rem", cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
