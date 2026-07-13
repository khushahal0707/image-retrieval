import { useState } from "react";
import { runQuery, imageFileUrl, verifyRecord } from "../api.js";

export default function Retrieve() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [k, setK] = useState(3);
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState(null);
  const [verifications, setVerifications] = useState({});
  const [error, setError] = useState(null);

  const onFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    setVerifications({});
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("k", k);
      const result = await runQuery(fd);
      setResponse(result);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async (recordId) => {
    const v = await verifyRecord(recordId);
    setVerifications((prev) => ({ ...prev, [recordId]: v }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <span className="eyebrow">Stage 02–06 · Blind retrieval</span>
        <h2 style={{ fontSize: 28, marginTop: 6 }}>Query the cloud without exposing it</h2>
        <p style={{ marginTop: 8, maxWidth: 640 }}>
          Your query image is encrypted client-side before it's sent. The similarity ranking below is
          computed by the server directly on ciphertext — inspect the encrypted vector preview to see
          it never touches plaintext.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            width: 160, height: 160, borderRadius: 10, border: "1px dashed var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            background: "var(--bg-grid)", flexShrink: 0,
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center", padding: 8 }}>
              no query image
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 220 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="eyebrow">Query image</span>
            <input type="file" accept="image/*" onChange={onFile} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 140 }}>
            <span className="eyebrow">Top-K</span>
            <input type="number" min={1} max={10} value={k} onChange={(e) => setK(e.target.value)} />
          </label>
          <button className="primary" type="submit" disabled={!file || busy} style={{ alignSelf: "flex-start" }}>
            {busy ? "Searching ciphertext…" : "Encrypt & retrieve"}
          </button>
          {error && <span style={{ color: "var(--red)", fontSize: 13 }}>{error}</span>}
        </div>
      </form>

      {response && (
        <>
          <div className="card">
            <span className="eyebrow" style={{ color: "var(--cyan)" }}>Encrypted query (first 8 dims)</span>
            <div className="hash" style={{ marginTop: 6 }}>
              [{response.encryptedQueryPreview.map((v) => v.toFixed(3)).join(", ")}, …]
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {response.results.map((r, i) => {
              const v = verifications[r.recordId];
              return (
                <div key={r.recordId} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="pill violet">rank {i + 1}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--cyan)" }}>
                      sim {r.similarity.toFixed(4)}
                    </span>
                  </div>
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: 6, overflow: "hidden", background: "var(--bg-grid)" }}>
                    <img src={imageFileUrl(r.recordId)} alt={r.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.label}</div>
                  <div className="hash" style={{ fontSize: 10 }}>{r.contentHash.slice(0, 18)}…</div>

                  {!v && (
                    <button onClick={() => onVerify(r.recordId)} style={{ fontSize: 11.5 }}>
                      Verify against ledger
                    </button>
                  )}
                  {v && (
                    <span className={`pill ${v.verdict === "VERIFIED" ? "amber" : "red"}`}>
                      {v.verdict === "VERIFIED" ? "✔ verified on-chain" : "✕ tampered — hash mismatch"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow">Audit block</div>
              <div className="mono">#{response.auditBlock.index} · QUERY</div>
            </div>
            <div>
              <div className="eyebrow">Merkle root at query time</div>
              <div className="hash">{response.auditBlock.merkleRoot}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
