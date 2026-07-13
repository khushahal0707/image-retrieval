/**
 * Toy implementation of Algorithm 1 (FedAvg) from the report. Three
 * simulated clients each hold a small synthetic dataset. Each round,
 * every client runs one local gradient-descent step on a linear model,
 * and the server averages the resulting weights proportionally to each
 * client's dataset size — exactly the FedAvg update rule.
 *
 * This is intentionally lightweight (no PyTorch/TF dependency) so the
 * whole demo runs with nothing but Node.js.
 */

const WEIGHT_DIM = 8;
const CLIENTS = [
  { id: "Client-1", size: 120, seed: 11 },
  { id: "Client-2", size: 95, seed: 29 },
  { id: "Client-3", size: 140, seed: 47 },
];

function pseudoRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function randomVector(dim, rng) {
  return Array.from({ length: dim }, () => rng() * 2 - 1);
}

// Each client has a fixed synthetic "target" it's nudging the model toward,
// standing in for its private local dataset.
const clientTargets = CLIENTS.map((c) => {
  const rng = pseudoRandom(c.seed);
  return randomVector(WEIGHT_DIM, rng);
});

let globalWeights = new Array(WEIGHT_DIM).fill(0);

export function resetFederatedState() {
  globalWeights = new Array(WEIGHT_DIM).fill(0);
}

export function runFederatedRound() {
  const lr = 0.15;
  const localWeights = [];
  const clientLosses = [];

  CLIENTS.forEach((client, idx) => {
    const target = clientTargets[idx];
    // one local "training epoch": gradient step toward this client's target
    const local = globalWeights.map((w, i) => w + lr * (target[i] - w));
    const loss = local.reduce((sum, w, i) => sum + (target[i] - w) ** 2, 0) / WEIGHT_DIM;
    localWeights.push({ weights: local, size: client.size });
    clientLosses.push(Number(loss.toFixed(5)));
  });

  const totalSize = localWeights.reduce((s, l) => s + l.size, 0);
  const aggregated = new Array(WEIGHT_DIM).fill(0);
  localWeights.forEach(({ weights, size }) => {
    weights.forEach((w, i) => {
      aggregated[i] += (size / totalSize) * w;
    });
  });

  globalWeights = aggregated;
  const globalLoss = Number(
    (clientLosses.reduce((a, b) => a + b, 0) / clientLosses.length).toFixed(5)
  );

  return {
    clientIds: CLIENTS.map((c) => c.id),
    clientLosses,
    globalLoss,
    globalWeightsPreview: globalWeights.map((w) => Number(w.toFixed(4))),
  };
}
