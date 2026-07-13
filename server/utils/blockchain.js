import crypto from "crypto";
import Block from "../models/Block.js";

function sha256(input) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function merkleRoot(hashes) {
  if (hashes.length === 0) return sha256("GENESIS");
  let level = [...hashes];
  while (level.length > 1) {
    if (level.length % 2 !== 0) level.push(level[level.length - 1]);
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(sha256(level[i] + level[i + 1]));
    }
    level = next;
  }
  return level[0];
}

/**
 * Appends a new immutable block to the ledger. `type` is one of
 * INDEX | QUERY | MODEL_UPDATE (see Block model). Every block links to the
 * previous block's hash, and folds in a rolling Merkle root over all
 * payload hashes seen so far — this is what clients use in /verify to
 * prove a record hasn't been tampered with after the fact.
 */
export async function appendBlock(type, payload) {
  const last = await Block.findOne().sort({ index: -1 });
  const index = last ? last.index + 1 : 0;
  const prevHash = last ? last.hash : sha256("GENESIS");

  const payloadHash = sha256(payload);

  const priorHashes = await Block.find().sort({ index: 1 }).select("payloadHash -_id");
  const root = merkleRoot([...priorHashes.map((b) => b.payloadHash), payloadHash]);

  const hash = sha256({ index, type, payloadHash, prevHash, merkleRoot: root });

  const block = await Block.create({
    index,
    type,
    payload,
    payloadHash,
    prevHash,
    hash,
    merkleRoot: root,
  });

  return block;
}

/** Recomputes the chain from scratch and reports whether it's intact. */
export async function verifyChainIntegrity() {
  const blocks = await Block.find().sort({ index: 1 });
  const hashesSoFar = [];
  for (const b of blocks) {
    const expectedPrev = hashesSoFar.length
      ? blocks[hashesSoFar.length - 1].hash
      : sha256("GENESIS");
    const expectedPayloadHash = sha256(b.payload);
    hashesSoFar.push(expectedPayloadHash);
    const expectedRoot = merkleRoot(hashesSoFar);
    const expectedHash = sha256({
      index: b.index,
      type: b.type,
      payloadHash: expectedPayloadHash,
      prevHash: expectedPrev,
      merkleRoot: expectedRoot,
    });

    if (
      expectedPayloadHash !== b.payloadHash ||
      expectedPrev !== b.prevHash ||
      expectedRoot !== b.merkleRoot ||
      expectedHash !== b.hash
    ) {
      return { intact: false, brokenAt: b.index };
    }
  }
  return { intact: true, brokenAt: null, length: blocks.length };
}

export { sha256, merkleRoot };
