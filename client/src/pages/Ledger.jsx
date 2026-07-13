import { useEffect, useState } from "react";
import { getChain, getChainStatus } from "../api.js";

const typeColor = { INDEX: "cyan", QUERY: "violet", MODEL_UPDATE: "amber" };

export default function Ledger() {
  const [blocks, setBlocks] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const [b, s] = await Promise.all([getChain(), getChainStatus()]);
    setBlocks(b);
    setStatus(s);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="eyebrow">Permissioned ledger</span>
          <h2 style={{ fontSize: 28, marginTop: 6 }}>Immutable audit trail</h2>
          <p style={{ marginTop: 8, maxWidth: 620 }}>
            Every index event, query, and federated model update is appended here as a linked block.
            Each block folds a rolling Merkle root over all prior payload hashes — mutate any record in
            the database and re-verification will catch it.
          </p>
        </div>
        <button onClick={refresh}>{loading ? "Refreshing…" : "Refresh"}</button>
      </div>

      {status && (
        <div className="card" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`pill ${status.intact ? "amber" : "red"}`} style={{ fontSize: 13, padding: "6px 14px" }}>
            {status.intact ? "✔ chain intact" : `✕ broken at block #${status.brokenAt}`}
          </span>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {blocks.length} blocks committed
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {blocks.map((b) => (
          <div key={b._id} className="card" style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 13, color: "var(--text-faint)", minWidth: 48 }}>#{b.index}</span>
            <span className={`pill ${typeColor[b.type] || "cyan"}`} style={{ minWidth: 96, justifyContent: "center" }}>
              {b.type}
            </span>
            <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="hash">hash: {b.hash}</div>
              <div className="hash">prev: {b.prevHash}</div>
              <div className="hash" style={{ color: "var(--amber)" }}>root: {b.merkleRoot}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
              {new Date(b.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
        {!loading && blocks.length === 0 && (
          <div className="card">
            <p>No blocks yet — index an image or run a query to create the genesis activity.</p>
          </div>
        )}
      </div>
    </div>
  );
}
