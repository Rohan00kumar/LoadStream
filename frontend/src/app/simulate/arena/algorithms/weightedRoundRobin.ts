import { LoadBalancer, ServerRuntimeState } from "./base";
import { AlgorithmType, SimulationRequest } from "../types";

export class WeightedRoundRobinBalancer implements LoadBalancer {
  readonly algorithmId: AlgorithmType = "weighted_round_robin";

  selectServer(
    _request: SimulationRequest,
    servers: ServerRuntimeState[]
  ): ServerRuntimeState | null {
    const healthyServers = servers.filter(
      (s) => s.server.status !== "offline" && !s.server.isManualFailed
    );

    if (healthyServers.length === 0) return null;

    let totalWeight = 0;
    let bestServer: ServerRuntimeState | null = null;
    let maxCurrentWeight = -Infinity;

    for (const s of healthyServers) {
      const weight = Math.max(1, s.server.weight || 1);
      s.currentWeight = (s.currentWeight || 0) + weight;
      totalWeight += weight;

      if (s.currentWeight > maxCurrentWeight) {
        maxCurrentWeight = s.currentWeight;
        bestServer = s;
      }
    }

    if (bestServer) {
      bestServer.currentWeight -= totalWeight;
    }

    return bestServer;
  }

  reset(): void {}
}
