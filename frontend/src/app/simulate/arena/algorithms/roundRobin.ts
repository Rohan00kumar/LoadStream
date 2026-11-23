import { LoadBalancer, ServerRuntimeState } from "./base";
import { AlgorithmType, SimulationRequest } from "../types";

export class RoundRobinBalancer implements LoadBalancer {
  readonly algorithmId: AlgorithmType = "round_robin";
  private currentIndex: number = 0;

  selectServer(
    _request: SimulationRequest,
    servers: ServerRuntimeState[]
  ): ServerRuntimeState | null {
    const healthyServers = servers.filter(
      (s) => s.server.status !== "offline" && !s.server.isManualFailed
    );

    if (healthyServers.length === 0) return null;

    const selected = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex = (this.currentIndex + 1) % healthyServers.length;
    return selected;
  }

  reset(): void {
    this.currentIndex = 0;
  }
}
