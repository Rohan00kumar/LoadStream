import { SimulationRequest, WorkloadConfig, RequestComplexity } from "../types";

// Deterministic 32-bit PRNG (Mulberry32) for reproducible workloads
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWorkload(config: WorkloadConfig): SimulationRequest[] {
  const prng = createPRNG(config.seed || 42);
  const requests: SimulationRequest[] = [];
  const baseIntervalMs = 1000 / Math.max(1, config.requestsPerSecond);

  let currentArrivalMs = 0;

  for (let i = 1; i <= config.totalRequests; i++) {
    // 1. Calculate inter-arrival interval based on pattern
    let interval = baseIntervalMs;
    const progress = i / config.totalRequests;

    switch (config.pattern) {
      case "ramp_up": {
        // Starts slow (3x interval) and accelerates to 0.7x interval
        const factor = 3.0 - 2.3 * progress;
        interval = baseIntervalMs * factor;
        break;
      }
      case "spike": {
        // Normal between 0-35% and 65-100%, massive spike (0.2x interval -> 5x RPS) between 35-65%
        if (progress >= 0.35 && progress <= 0.65) {
          interval = baseIntervalMs * 0.22;
        } else {
          interval = baseIntervalMs * 1.2;
        }
        break;
      }
      case "burst": {
        // Periodic burst pulses
        const cycle = (i % 25) / 25;
        interval = cycle < 0.4 ? baseIntervalMs * 0.25 : baseIntervalMs * 2.2;
        break;
      }
      case "random": {
        // Poisson process: exponential distribution
        const u = Math.max(0.001, prng());
        interval = -Math.log(u) * baseIntervalMs;
        break;
      }
      case "constant":
      default: {
        interval = baseIntervalMs + (prng() * 6 - 3); // tiny natural jitter
        break;
      }
    }

    currentArrivalMs += Math.max(1, Math.round(interval));

    // 2. Determine request complexity
    let complexity: "light" | "medium" | "heavy";
    if (config.complexity === "mixed") {
      const roll = prng();
      if (roll < 0.6) {
        complexity = "light";
      } else if (roll < 0.88) {
        complexity = "medium";
      } else {
        complexity = "heavy";
      }
    } else {
      complexity = config.complexity;
    }

    // 3. Compute execution attributes
    let baseComputeMs = 20;
    let cpuFootprintPercent = 6;
    let memoryFootprintMb = 60;

    if (complexity === "light") {
      baseComputeMs = Math.round(14 + prng() * 16); // 14 - 30ms
      cpuFootprintPercent = Math.round(4 + prng() * 4); // 4 - 8%
      memoryFootprintMb = Math.round(40 + prng() * 40);
    } else if (complexity === "medium") {
      baseComputeMs = Math.round(45 + prng() * 40); // 45 - 85ms
      cpuFootprintPercent = Math.round(12 + prng() * 8); // 12 - 20%
      memoryFootprintMb = Math.round(120 + prng() * 100);
    } else if (complexity === "heavy") {
      baseComputeMs = Math.round(140 + prng() * 120); // 140 - 260ms
      cpuFootprintPercent = Math.round(28 + prng() * 16); // 28 - 44%
      memoryFootprintMb = Math.round(350 + prng() * 300);
    }

    requests.push({
      id: i,
      arrivalMs: currentArrivalMs,
      complexity,
      cpuFootprintPercent,
      memoryFootprintMb,
      baseComputeMs,
      timeoutMs: config.timeoutMs || 800,
    });
  }

  return requests;
}
