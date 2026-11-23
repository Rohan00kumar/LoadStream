import { AlgorithmType, AlgorithmPerformance, WorkloadConfig } from "../types";

export function generateEducationalInsights(
  performances: Record<AlgorithmType, AlgorithmPerformance>,
  workload: WorkloadConfig
): {
  insights: string[];
  fastestAlgo: AlgorithmType;
  mostReliableAlgo: AlgorithmType;
  mostBalancedAlgo: AlgorithmType;
  highestThroughputAlgo: AlgorithmType;
} {
  const algoKeys = Object.keys(performances) as AlgorithmType[];
  if (algoKeys.length === 0) {
    return {
      insights: [],
      fastestAlgo: "round_robin",
      mostReliableAlgo: "round_robin",
      mostBalancedAlgo: "round_robin",
      highestThroughputAlgo: "round_robin",
    };
  }

  // 1. Identify champions
  let fastestAlgo = algoKeys[0];
  let mostReliableAlgo = algoKeys[0];
  let mostBalancedAlgo = algoKeys[0];
  let highestThroughputAlgo = algoKeys[0];

  let lowestLatency = performances[fastestAlgo].avgResponseTimeMs || 99999;
  let lowestFailures = performances[mostReliableAlgo].failedRequests + performances[mostReliableAlgo].timeoutRequests;
  let lowestImbalance = performances[mostBalancedAlgo].loadImbalanceScore ?? 999;
  let highestThroughput = performances[highestThroughputAlgo].throughputRps || 0;

  algoKeys.forEach((algo) => {
    const p = performances[algo];
    const totalFail = p.failedRequests + p.timeoutRequests;

    if (p.avgResponseTimeMs > 0 && p.avgResponseTimeMs < lowestLatency) {
      lowestLatency = p.avgResponseTimeMs;
      fastestAlgo = algo;
    }
    if (totalFail < lowestFailures) {
      lowestFailures = totalFail;
      mostReliableAlgo = algo;
    }
    if (p.loadImbalanceScore < lowestImbalance) {
      lowestImbalance = p.loadImbalanceScore;
      mostBalancedAlgo = algo;
    }
    if (p.throughputRps > highestThroughput) {
      highestThroughput = p.throughputRps;
      highestThroughputAlgo = algo;
    }
  });

  const insights: string[] = [];

  // 2. Data-driven comparative insights
  if (algoKeys.includes("round_robin") && algoKeys.includes("least_connections")) {
    const rr = performances["round_robin"];
    const lc = performances["least_connections"];

    if (lc.p95ResponseTimeMs < rr.p95ResponseTimeMs) {
      const diff = Math.round(
        ((rr.p95ResponseTimeMs - lc.p95ResponseTimeMs) / Math.max(1, rr.p95ResponseTimeMs)) * 100
      );
      insights.push(
        `Under ${workload.pattern} traffic with ${workload.complexity} workloads, Least Connections achieved ${diff}% lower P95 latency (${lc.p95ResponseTimeMs}ms vs ${rr.p95ResponseTimeMs}ms) compared to Round Robin. Round Robin continued cycling onto servers busy with long-running tasks, whereas Least Connections routed away from active socket queues.`
      );
    } else {
      insights.push(
        `Round Robin maintained predictable sequential distribution (${rr.avgResponseTimeMs}ms avg), while Least Connections exhibited comparable latency (${lc.avgResponseTimeMs}ms) with minimal queue overhead.`
      );
    }
  }

  if (algoKeys.includes("ppo")) {
    const ppo = performances["ppo"];
    if (ppo.failedRequests === 0 && ppo.timeoutRequests === 0) {
      insights.push(
        `PPO Neural Policy maintained 100% request success rate with zero SLA timeouts, dynamically factoring in both instantaneous TCP connections and underlying CPU capacity.`
      );
    } else {
      insights.push(
        `PPO balanced load with an imbalance score of ${ppo.loadImbalanceScore}, achieving ${ppo.throughputRps} req/s throughput under high concurrency.`
      );
    }
  }

  if (algoKeys.includes("weighted_round_robin")) {
    const wrr = performances["weighted_round_robin"];
    insights.push(
      `Weighted Round Robin routed requests proportional to configured server capacity weights, deliberately shifting heavier traffic shares to high-compute nodes.`
    );
  }

  if (algoKeys.includes("random")) {
    const rnd = performances["random"];
    insights.push(
      `Random selection operated with zero state overhead (${rnd.avgResponseTimeMs}ms avg latency), but showed an imbalance score of ${rnd.loadImbalanceScore} due to statistical clustering.`
    );
  }

  // Workload pattern specific commentary
  if (workload.pattern === "spike") {
    insights.push(
      `During the sudden 5x traffic spike, algorithms that tracked live server saturation (such as Least Connections and PPO) prevented connection overflows significantly better than static policies.`
    );
  } else if (workload.pattern === "burst") {
    insights.push(
      `The burst arrival pattern stressed server queue depth. Static allocation caused transient backpressure queues, while dynamic policies absorbed the pulse by dispersing across all operational nodes.`
    );
  }

  return {
    insights,
    fastestAlgo,
    mostReliableAlgo,
    mostBalancedAlgo,
    highestThroughputAlgo,
  };
}
