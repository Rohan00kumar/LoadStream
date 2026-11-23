import { AlgorithmType, VirtualServer, SimulationRequest } from "../types";

export interface ServerRuntimeState {
  server: VirtualServer;
  activeRequests: number;
  queuedRequests: number;
  currentCpuPercent: number;
  currentMemoryMb: number;
  effectiveWeight: number;
  currentWeight: number; // for smooth weighted round robin
}

export interface LoadBalancer {
  readonly algorithmId: AlgorithmType;
  selectServer(
    request: SimulationRequest,
    servers: ServerRuntimeState[]
  ): ServerRuntimeState | null;
  reset(): void;
}
