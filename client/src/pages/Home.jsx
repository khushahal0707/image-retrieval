import { Link } from "react-router-dom";
import Pipeline from "../components/Pipeline.jsx";

const modules = [
  {
    title: "Encrypted Index",
    tag: "cyan",
    desc: "Upload remote sensing imagery. A CNN-style encoder extracts a feature vector, which is homomorphically encrypted before it ever reaches the cloud database.",
    to: "/index",
    cta: "Index imagery →",
  },
  {
    title: "Blind Retrieval",
    tag: "violet",
    desc: "Submit a query image. Cosine similarity is computed directly on ciphertext — the server ranks results without ever decrypting a single vector.",
    to: "/retrieve",
    cta: "Run a query →",
  },
  {
    title: "Chain of Custody",
    tag: "amber",
    desc: "Every index and query event is committed to an append-only ledger with a rolling Merkle root, so any tampering after the fact is detectable.",
    to: "/ledger",
    cta: "Inspect the ledger →",
  },
  {
    title: "Federated Training",
    tag: "violet",
    desc: "Three simulated data owners run local training rounds; only model weights are averaged centrally via FedAvg — raw imagery never leaves a client.",
    to: "/federated",
    cta: "Run a round →",
  },
];

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
        <span className="eyebrow">Secure Remote Sensing Retrieval — Local Demo Instance</span>
        <h1 style={{ fontSize: 44, lineHeight: 1.12 }}>
          Search satellite imagery without the cloud ever seeing it.
        </h1>
        <p style={{ fontSize: 16 }}>
          Ledgerlens is a working reference implementation of the report's architecture: images are
          encoded, encrypted, matched, and logged through six stages — from a raw tile on a client's
          disk to a verified, on-chain-audited result. Watch a query packet move through the pipeline
          below, then try it yourself.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/index"><button className="primary">Index your first image</button></Link>
          <Link to="/retrieve"><button>Run a retrieval</button></Link>
        </div>
      </section>

      <section>
        <Pipeline />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {modules.map((m) => (
          <Link key={m.title} to={m.to} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span className={`pill ${m.tag}`}>{m.title}</span>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{m.desc}</p>
            <span className="mono" style={{ fontSize: 12, color: "var(--cyan)", marginTop: "auto" }}>{m.cta}</span>
          </Link>
        ))}
      </section>

      <section className="card" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="eyebrow">Threat model</span>
          <p style={{ marginTop: 8, fontSize: 13.5 }}>
            Honest-but-curious cloud server, potentially malicious clients, network eavesdroppers. The
            system targets confidentiality of raw imagery and queries, integrity of retrieval results,
            and resistance to silent tampering.
          </p>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className="eyebrow">What's simulated here</span>
          <p style={{ marginTop: 8, fontSize: 13.5 }}>
            The CNN encoder is approximated with a deterministic pixel-grid embedding, and homomorphic
            encryption uses a distance-preserving translation scheme rather than CKKS — enough to
            demonstrate the pipeline end to end without heavyweight ML/crypto dependencies. See the
            README for how to swap in TenSEAL/PyTorch for a production build.
          </p>
        </div>
      </section>
    </div>
  );
}
