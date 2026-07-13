import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import ImageRecord from "../models/ImageRecord.js";
import { extractFeatures } from "../utils/featureExtractor.js";
import { encrypt, DEFAULT_KEY_ID } from "../utils/simulatedHE.js";
import { appendBlock, sha256 } from "../utils/blockchain.js";

const router = express.Router();

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files allowed"));
    cb(null, true);
  },
});

// POST /api/images  (multipart: image, label)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image file is required" });
    const label = (req.body.label || "unlabeled").trim();
    const keyId = req.body.keyId || DEFAULT_KEY_ID;

    const buffer = fs.readFileSync(req.file.path);
    const plaintextFeature = await extractFeatures(buffer);
    const encryptedFeature = encrypt(plaintextFeature, keyId);
    const contentHash = sha256(encryptedFeature);

    const record = await ImageRecord.create({
      label,
      filename: req.file.filename,
      plaintextFeature,
      encryptedFeature,
      keyId,
      contentHash,
    });

    const block = await appendBlock("INDEX", {
      recordId: record._id.toString(),
      label,
      contentHash,
      keyId,
    });

    record.blockIndex = block.index;
    await record.save();

    res.status(201).json({
      record: {
        _id: record._id,
        label: record.label,
        filename: record.filename,
        encryptedFeature: record.encryptedFeature,
        contentHash: record.contentHash,
        blockIndex: record.blockIndex,
        createdAt: record.createdAt,
      },
      block,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/images  -> gallery of everything in the "cloud"
router.get("/", async (_req, res) => {
  const records = await ImageRecord.find().sort({ createdAt: -1 });
  res.json(records);
});

// GET /api/images/:id/file -> serve the stored image
router.get("/:id/file", async (req, res) => {
  const record = await ImageRecord.findById(req.params.id);
  if (!record) return res.status(404).end();
  res.sendFile(path.join(uploadDir, record.filename));
});

// DEV-ONLY: simulate a tampering attack for the verification demo
router.post("/:id/tamper", async (req, res) => {
  const record = await ImageRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ error: "not found" });
  record.encryptedFeature = record.encryptedFeature.map((v) => v + 999);
  await record.save();
  res.json({ message: "Record mutated in the database (not on-chain).", record });
});

export default router;
