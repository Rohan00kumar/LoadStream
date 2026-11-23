import { LoadBalancer, ServerRuntimeState } from "./base";
import { AlgorithmType, SimulationRequest } from "../types";

export class RandomBalancer implements LoadBalancer {
  readonly algorithmId: AlgorithmType = "random";

  selectServer(
    _request: SimulationRequest,
    servers: ServerRuntimeState[]
  ): ServerRuntimeState | null {
    const healthyServers = servers.filter(
      (s) => s.server.status !== "offline" && !s.server.isManualFailed
    );

    if (healthyServers.length === 0) return null;

    const idx = Math.floor(Math.random() * healthyServers.length);
    return healthyServers[idx];
  }

  reset(): void {}
}
