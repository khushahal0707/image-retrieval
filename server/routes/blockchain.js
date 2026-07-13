import express from "express";
import Block from "../models/Block.js";
import { verifyChainIntegrity } from "../utils/blockchain.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const blocks = await Block.find().sort({ index: -1 });
  res.json(blocks);
});

router.get("/status", async (_req, res) => {
  const status = await verifyChainIntegrity();
  res.json(status);
});

export default router;
