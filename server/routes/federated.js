import express from "express";
import FederatedRound from "../models/FederatedRound.js";
import { runFederatedRound, resetFederatedState } from "../utils/fedAvg.js";
import { appendBlock, sha256 } from "../utils/blockchain.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const rounds = await FederatedRound.find().sort({ round: 1 });
  res.json(rounds);
});

router.post("/round", async (_req, res) => {
  const last = await FederatedRound.findOne().sort({ round: -1 });
  const roundNumber = last ? last.round + 1 : 1;

  const result = runFederatedRound();
  const doc = await FederatedRound.create({
    round: roundNumber,
    clientLosses: result.clientLosses,
    globalLoss: result.globalLoss,
    globalWeightsPreview: result.globalWeightsPreview,
  });

  const modelHash = sha256(result.globalWeightsPreview);
  const block = await appendBlock("MODEL_UPDATE", {
    round: roundNumber,
    modelHash,
    clientIds: result.clientIds,
    globalLoss: result.globalLoss,
  });

  res.status(201).json({ round: doc, block });
});

router.post("/reset", async (_req, res) => {
  resetFederatedState();
  await FederatedRound.deleteMany({});
  res.json({ message: "Federated training state reset." });
});

export default router;
