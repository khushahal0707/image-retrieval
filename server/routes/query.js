import express from "express";
import multer from "multer";
import fs from "fs";
import ImageRecord from "../models/ImageRecord.js";
import { extractFeatures } from "../utils/featureExtractor.js";
import { encrypt, cosineSimilarity, DEFAULT_KEY_ID } from "../utils/simulatedHE.js";
import { appendBlock, sha256, verifyChainIntegrity } from "../utils/blockchain.js";

const router = express.Router();
const upload = multer({ dest: "uploads/tmp" });

// POST /api/query  (multipart: image, k)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image file is required" });
    const k = Math.max(1, Math.min(10, Number(req.body.k) || 3));
    const keyId = req.body.keyId || DEFAULT_KEY_ID;

    const buffer = fs.readFileSync(req.file.path);
    const queryFeature = await extractFeatures(buffer);
    const encryptedQuery = encrypt(queryFeature, keyId);
    fs.unlink(req.file.path, () => {});

    // SERVER SIDE: compute similarity entirely on ciphertext (Algorithm 2)
    const db = await ImageRecord.find();
    const scored = db.map((rec) => ({
      recordId: rec._id,
      label: rec.label,
      filename: rec.filename,
      similarity: cosineSimilarity(encryptedQuery, rec.encryptedFeature),
      contentHash: rec.contentHash,
      blockIndex: rec.blockIndex,
    }));
    scored.sort((a, b) => b.similarity - a.similarity);
    const topK = scored.slice(0, k);

    const queryHash = sha256(encryptedQuery);
    const block = await appendBlock("QUERY", {
      queryHash,
      keyId,
      resultIds: topK.map((r) => r.recordId.toString()),
      k,
    });

    res.json({
      encryptedQueryPreview: encryptedQuery.slice(0, 8),
      results: topK,
      auditBlock: block,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/query/verify/:recordId -> re-hash the stored ciphertext and
// compare it against the value committed on-chain at index time.
router.get("/verify/:recordId", async (req, res) => {
  try {
    const record = await ImageRecord.findById(req.params.recordId);
    if (!record) return res.status(404).json({ error: "record not found" });

    const recomputedHash = sha256(record.encryptedFeature);
    const matches = recomputedHash === record.contentHash;
    const chain = await verifyChainIntegrity();

    res.json({
      recordId: record._id,
      storedHash: record.contentHash,
      recomputedHash,
      hashMatches: matches,
      chainIntact: chain.intact,
      verdict: matches && chain.intact ? "VERIFIED" : "TAMPERED",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
