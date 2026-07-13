import sharp from "sharp";
import { FEATURE_DIM } from "./simulatedHE.js";

/**
 * Stands in for the ResNet/MobileNet CNN encoder from the report. Training
 * and running a real CNN per-request is out of scope for this demo, so we
 * derive a genuine, deterministic 64-dim embedding directly from the
 * image's pixel content: resize to an 8x8 grayscale grid and flatten.
 * Visually/perceptually similar images produce nearby vectors, which is
 * enough to demonstrate the encrypted-similarity-search pipeline end to end.
 */
export async function extractFeatures(buffer) {
  const side = Math.sqrt(FEATURE_DIM); // 8
  const { data } = await sharp(buffer)
    .resize(side, side, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // normalize pixel values (0-255) to roughly [-1, 1]
  return Array.from(data).map((px) => px / 127.5 - 1);
}
