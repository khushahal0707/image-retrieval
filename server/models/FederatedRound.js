import mongoose from "mongoose";

const FederatedRoundSchema = new mongoose.Schema(
  {
    round: { type: Number, required: true },
    clientLosses: { type: [Number], required: true },
    globalLoss: { type: Number, required: true },
    globalWeightsPreview: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("FederatedRound", FederatedRoundSchema);
