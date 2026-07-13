import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { DEFAULT_KEY_ID, kmc } from "./utils/simulatedHE.js";

import imagesRouter from "./routes/images.js";
import queryRouter from "./routes/query.js";
import blockchainRouter from "./routes/blockchain.js";
import federatedRouter from "./routes/federated.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/kmc/keys", (_req, res) => res.json({ defaultKeyId: DEFAULT_KEY_ID, keys: kmc.listKeys() }));

app.use("/api/images", imagesRouter);
app.use("/api/query", queryRouter);
app.use("/api/blockchain", blockchainRouter);
app.use("/api/federated", federatedRouter);

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("[db] connection failed:", err.message);
    process.exit(1);
  });
