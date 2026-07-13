import crypto from "crypto";

/**
 * SIMULATED Homomorphic Encryption
 * ---------------------------------
 * Real CKKS (used by TenSEAL in the report) allows arithmetic directly on
 * ciphertexts. Implementing real CKKS is out of scope for a teaching demo,
 * so we simulate the *property* the report relies on: distance-preserving
 * translation. Each key is a fixed pseudo-random vector; "encryption" is
 * elementwise addition of that vector, "decryption" is subtraction.
 * Because every vector in a session is shifted by the SAME key, relative
 * distances between ciphertexts are preserved, which is what lets the
 * "cloud" rank similarity without ever seeing plaintext features.
 *
 * This is clearly labelled as a simulation everywhere it surfaces in the
 * API and the UI — see README "Security Notes".
 */

const FEATURE_DIM = 64;

class KeyManagementCenter {
  constructor() {
    this.keys = new Map(); // keyId -> { vector, owner, issuedAt }
  }

  issueKey(owner = "Client-1") {
    const keyId = crypto.randomUUID();
    const seed = crypto.createHash("sha256").update(keyId).digest();
    const vector = Array.from({ length: FEATURE_DIM }, (_, i) => {
      // deterministic pseudo-random value in [-5, 5] derived from the seed
      const byte = seed[i % seed.length];
      return (byte / 255) * 10 - 5;
    });
    this.keys.set(keyId, { vector, owner, issuedAt: new Date() });
    return keyId;
  }

  getKey(keyId) {
    const entry = this.keys.get(keyId);
    if (!entry) throw new Error(`Unknown key id: ${keyId}`);
    return entry;
  }

  listKeys() {
    return Array.from(this.keys.entries()).map(([keyId, v]) => ({
      keyId,
      owner: v.owner,
      issuedAt: v.issuedAt,
    }));
  }
}

export const kmc = new KeyManagementCenter();
// Issue one standing key at boot so the demo works immediately.
export const DEFAULT_KEY_ID = kmc.issueKey("Client-1");

export function encrypt(vector, keyId) {
  const { vector: key } = kmc.getKey(keyId);
  return vector.map((v, i) => v + key[i]);
}

export function decrypt(vector, keyId) {
  const { vector: key } = kmc.getKey(keyId);
  return vector.map((v, i) => v - key[i]);
}

export function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export { FEATURE_DIM };
