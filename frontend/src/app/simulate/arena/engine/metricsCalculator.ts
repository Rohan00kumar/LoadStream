import {
  AlgorithmType,
  AlgorithmPerformance,
  RequestResult,
  ServerLiveMetrics,
  VirtualServer,
} from "../types";

export function calculatePerformance(
  algorithmId: AlgorithmType,
  results: RequestResult[],
  serverMetrics: Record<string, ServerLiveMetrics>,
  servers: VirtualServer[],
  totalSimulationDurationMs: number
): AlgorithmPerformance {
  const total = results.length;
  const successful = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "overloaded" || r.status === "server_failed");
  const timeouts = results.filter((r) => r.status === "timeout");

  const durations = successful.map((r) => r.totalLatencyMs).sort((a, b) => a - b);
  const queueWaits = successful.map((r) => r.queueWaitMs);

  const avgResponseTimeMs =
    durations.length > 0
      ? Math.round((durations.reduce((sum, d) => sum + d, 0) / durations.length) * 10) / 10
      : 0;

  const medianResponseTimeMs =
    durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0;

  const p95ResponseTimeMs =
    durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0;

  const minResponseTimeMs = durations.length > 0 ? durations[0] : 0;
  const maxResponseTimeMs = durations.length > 0 ? durations[durations.length - 1] : 0;

  const avgQueueWaitMs =
    queueWaits.length > 0
      ? Math.round((queueWaits.reduce((sum, q) => sum + q, 0) / queueWaits.length) * 10) / 10
      : 0;

  // Throughput: successful requests per second
  const simSeconds = Math.max(0.1, totalSimulationDurationMs / 1000);
  const throughputRps = Math.round((successful.length / simSeconds) * 10) / 10;

  // Server distribution
  const serverDistribution: Record<string, number> = {};
  servers.forEach((s) => {
    serverDistribution[s.id] = 0;
  });

  results.forEach((r) => {
    if (r.serverId && serverDistribution[r.serverId] !== undefined) {
      serverDistribution[r.serverId]++;
    }
  });

  const serverPercentages: Record<string, number> = {};
  servers.forEach((s) => {
    serverPercentages[s.id] =
      total > 0 ? Math.round((serverDistribution[s.id] / total) * 100) : 0;
  });

  // Load Imbalance Score: Coefficient of Variation (stdDev / mean) of request counts
  const counts = Object.values(serverDistribution);
  const mean = counts.reduce((acc, c) => acc + c, 0) / Math.max(1, counts.length);
  const variance =
    counts.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / Math.max(1, counts.length);
  const stdDev = Math.sqrt(variance);
  const loadImbalanceScore = mean > 0 ? Math.round((stdDev / mean) * 100) / 100 : 0;

  return {
    algorithmId,
    totalRequests: total,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    timeoutRequests: timeouts.length,
    throughputRps,
    avgResponseTimeMs,
    medianResponseTimeMs,
    p95ResponseTimeMs,
    minResponseTimeMs,
    maxResponseTimeMs,
    avgQueueWaitMs,
    serverDistribution,
    serverPercentages,
    loadImbalanceScore,
    serverMetrics,
  };
}
