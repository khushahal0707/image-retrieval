import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true, unique: true },
    type: { type: String, enum: ["INDEX", "QUERY", "MODEL_UPDATE"], required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    payloadHash: { type: String, required: true },
    prevHash: { type: String, required: true },
    hash: { type: String, required: true },
    merkleRoot: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("Block", BlockSchema);
