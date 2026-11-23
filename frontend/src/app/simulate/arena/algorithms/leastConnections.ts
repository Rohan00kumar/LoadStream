import { LoadBalancer, ServerRuntimeState } from "./base";
import { AlgorithmType, SimulationRequest } from "../types";

export class LeastConnectionsBalancer implements LoadBalancer {
  readonly algorithmId: AlgorithmType = "least_connections";

  selectServer(
    _request: SimulationRequest,
    servers: ServerRuntimeState[]
  ): ServerRuntimeState | null {
    const healthyServers = servers.filter(
      (s) => s.server.status !== "offline" && !s.server.isManualFailed
    );

    if (healthyServers.length === 0) return null;

    let bestServer = healthyServers[0];
    let minLoad = bestServer.activeRequests;

    for (let i = 1; i < healthyServers.length; i++) {
      const candidate = healthyServers[i];
      if (candidate.activeRequests < minLoad) {
        minLoad = candidate.activeRequests;
        bestServer = candidate;
      }
    }

    return bestServer;
  }

  reset(): void {}
}
