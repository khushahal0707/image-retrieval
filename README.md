# Ledgerlens

A MERN-stack reference implementation of the report **"Blockchain-Assisted Verifiable and
Secure Remote Sensing Image Retrieval in Cloud Environments Using Homomorphic Encryption and
Federated Learning."**

It turns the report's four building blocks into a running app:

| Report concept | Where it lives |
|---|---|
| CNN feature extraction | `server/utils/featureExtractor.js` |
| Homomorphic encryption (Algorithm 2) | `server/utils/simulatedHE.js`, `server/routes/query.js` |
| Federated Averaging (Algorithm 1) | `server/utils/fedAvg.js`, `server/routes/federated.js` |
| Blockchain audit logging (Algorithm 3) | `server/utils/blockchain.js`, `server/routes/blockchain.js` |
| Key Management Center | `server/utils/simulatedHE.js` (`KeyManagementCenter`) |

## Stack

- **M**ongoDB (via Mongoose) — stores encrypted feature vectors, blockchain blocks, and
  federated-round history.
- **E**xpress — REST API (`/server`).
- **R**eact + Vite — UI (`/client`), five screens: Overview, Index, Retrieve, Ledger, Federated.
- **N**ode.js — runtime for both the API and the image feature pipeline (`sharp`).

## Getting it running locally

You'll need Node.js 18+ and a MongoDB instance (local `mongod` or a free Atlas cluster).

```bash
# 1. Backend
cd server
cp .env.example .env      # edit MONGO_URI if you're not running Mongo on localhost
npm install
npm run dev                # starts on http://localhost:5000

# 2. Frontend (in a second terminal)
cd client
npm install
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to the Express
server, so you don't need to configure CORS beyond the defaults in `.env.example`.

## Using the app

1. **Index** — upload a few images with labels. Each one is encoded into a 64-dim vector,
   encrypted, and committed to the ledger as an `INDEX` block.
2. **Retrieve** — upload a query image. The server ranks the encrypted database by cosine
   similarity *without decrypting anything*, and logs a `QUERY` block. Click "Verify against
   ledger" on any result to re-hash its stored ciphertext and compare it to the on-chain
   commitment.
3. **Ledger** — browse every block, and see the chain's overall integrity status (this
   recomputes every hash and Merkle root from scratch).
4. **Federated** — run FedAvg rounds across three simulated clients and watch per-client and
   global loss converge, exactly matching Algorithm 1 in the report.
5. Back on **Index**, hit "tamper" on any record, then re-run Retrieve → Verify on that same
   record to see the ledger catch the mismatch.

## Security notes (read before treating this as production-ready)

This is a **teaching/demo implementation**, not a deployable secure system:

- `simulatedHE.js` uses a distance-preserving translation cipher (add/subtract a fixed key
  vector) rather than real CKKS homomorphic encryption. It demonstrates *why* the property
  matters (the server can rank ciphertexts without decrypting them) without the overhead of a
  real lattice-crypto library. To swap in real HE, replace this module with bindings to
  [node-seal](https://github.com/s0l0ist/node-seal) (a WASM build of Microsoft SEAL, the same
  family as the report's TenSEAL) and re-implement `encrypt`/`cosineSimilarity` against
  ciphertext objects instead of arrays.
- `featureExtractor.js` derives features from raw pixels via `sharp`, standing in for the
  report's CNN encoder (ResNet/MobileNet). For real retrieval quality, replace it with a call
  out to a Python microservice (PyTorch/TensorFlow) or an ONNX runtime model loaded in Node.
- The blockchain in `blockchain.js` is an in-process, MongoDB-backed hash chain with Merkle
  roots — it demonstrates tamper-evidence and auditability, but is not a consensus network. For
  the report's actual target (a permissioned network like Hyperledger Fabric, or Ethereum via
  Web3.py/Solidity as used in the original prototype), replace `appendBlock`/
  `verifyChainIntegrity` with calls to a deployed smart contract.
- The Key Management Center issues one shared key at boot and exposes it over
  `GET /api/kmc/keys` purely so the UI can show what's happening. A real KMC would authenticate
  clients and never expose key material over an unauthenticated endpoint.

## Project layout

```
server/
  config/db.js            Mongo connection
  models/                 ImageRecord, Block, FederatedRound
  routes/                 images, query, blockchain, federated
  utils/                  simulatedHE, featureExtractor, blockchain, fedAvg
  server.js
client/
  src/
    pages/                Home, IndexPage, Retrieve, Ledger, Federated
    components/           Navbar, Pipeline
    api.js                axios wrapper for the REST API
    styles/index.css       design tokens (dark "telemetry console" theme)
```
