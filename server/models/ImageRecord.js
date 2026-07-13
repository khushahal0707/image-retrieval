import mongoose from "mongoose";

const ImageRecordSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    owner: { type: String, default: "Client-1" },
    filename: { type: String, required: true },
    // Plaintext feature vector NEVER leaves the client in the real design.
    // We keep it here only because this is a local teaching/demo instance
    // acting as both "client" and "cloud" — see README security note.
    plaintextFeature: { type: [Number], required: true, select: false },
    // What the "cloud" actually stores/operates on: HE(feature)
    encryptedFeature: { type: [Number], required: true },
    keyId: { type: String, required: true },
    contentHash: { type: String, required: true },
    blockIndex: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("ImageRecord", ImageRecordSchema);
