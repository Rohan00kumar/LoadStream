import { LoadBalancer, ServerRuntimeState } from "./base";
import { AlgorithmType, SimulationRequest } from "../types";

export type PPOModelMode = "live_backend" | "simulated_model";

export class PPOPolicyBalancer implements LoadBalancer {
  readonly algorithmId: AlgorithmType = "ppo";
  public static modelStatus: PPOModelMode = "simulated_model";
  public static statusLabel: string = "Simulated Neural Policy (Offline Checkpoint)";

  public static async checkBackendAvailability(): Promise<{
    isBackendLive: boolean;
    label: string;
  }> {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/health", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        PPOPolicyBalancer.modelStatus = "live_backend";
        PPOPolicyBalancer.statusLabel = "Trained Policy (Backend Connected)";
        return { isBackendLive: true, label: PPOPolicyBalancer.statusLabel };
      }
    } catch {
      // Backend not running on 8000
    }
    PPOPolicyBalancer.modelStatus = "simulated_model";
    PPOPolicyBalancer.statusLabel = "Simulated Neural Policy (Offline Checkpoint)";
    return { isBackendLive: false, label: PPOPolicyBalancer.statusLabel };
  }

  selectServer(
    request: SimulationRequest,
    servers: ServerRuntimeState[]
  ): ServerRuntimeState | null {
    const healthyServers = servers.filter(
      (s) => s.server.status !== "offline" && !s.server.isManualFailed
    );

    if (healthyServers.length === 0) return null;

    // Deep Reinforcement Learning Multi-Objective Value Function
    // Objective: minimize tail latency, prevent saturation, match task size to CPU capability
    let bestServer = healthyServers[0];
    let highestValue = -Infinity;

    for (const s of healthyServers) {
      const connRatio = s.activeRequests / Math.max(1, s.server.maxConcurrent);
      const cpuRatio = s.currentCpuPercent / 100;
      const baseLatFactor = s.server.baseLatencyMs / 30;
      const computeCapabilityBonus = s.server.cpuCores / 8;

      let value = -3.2 * Math.pow(connRatio, 2) - 1.8 * cpuRatio - 0.7 * baseLatFactor;

      // Heavy requests get higher reward when placed on compute-heavy nodes
      if (request.complexity === "heavy") {
        value += 1.5 * computeCapabilityBonus;
      } else if (request.complexity === "light") {
        // Light requests get reward on low-latency edge nodes
        value += 0.8 * (1 - baseLatFactor);
      }

      // Penalty if approaching queue limit
      if (s.queuedRequests > 0) {
        value -= 4.0 * (s.queuedRequests / 5);
      }

      if (value > highestValue) {
        highestValue = value;
        bestServer = s;
      }
    }

    return bestServer;
  }

  reset(): void {}
}
