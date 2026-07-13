import { useEffect, useState } from "react";
import { listImages, uploadImage, imageFileUrl, tamperImage } from "../api.js";

export default function IndexPage() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const refresh = () => listImages().then(setImages).catch(() => {});
  useEffect(() => { refresh(); }, []);

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
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("label", label || "unlabeled");
      const result = await uploadImage(fd);
      setLastResult(result);
      setFile(null);
      setPreview(null);
      setLabel("");
      refresh();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const onTamper = async (id) => {
    await tamperImage(id);
    refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <span className="eyebrow">Stage 01 · Client-side</span>
        <h2 style={{ fontSize: 28, marginTop: 6 }}>Index imagery into the secure cloud</h2>
        <p style={{ marginTop: 8, maxWidth: 640 }}>
          Each upload is encoded into a 64-dim feature vector, encrypted with the standing session key,
          and committed to the ledger as an <code className="mono">INDEX</code> block. Only the
          ciphertext and its hash leave this machine's "client" role for the "cloud" role.
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
              no image selected
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 220 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="eyebrow">Image file</span>
            <input type="file" accept="image/*" onChange={onFile} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="eyebrow">Label</span>
            <input type="text" placeholder="e.g. coastal-tile-04" value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <button className="primary" type="submit" disabled={!file || busy} style={{ alignSelf: "flex-start" }}>
            {busy ? "Encrypting & committing…" : "Encrypt and index"}
          </button>
          {error && <span style={{ color: "var(--red)", fontSize: 13 }}>{error}</span>}
        </div>
      </form>

      {lastResult && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="eyebrow" style={{ color: "var(--cyan)" }}>Last commit</span>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow">Content hash</div>
              <div className="hash">{lastResult.record.contentHash}</div>
            </div>
            <div>
              <div className="eyebrow">Block index</div>
              <div className="mono">#{lastResult.block.index}</div>
            </div>
            <div>
              <div className="eyebrow">Merkle root</div>
              <div className="hash">{lastResult.block.merkleRoot}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <span className="eyebrow">Cloud database ({images.length} records)</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 12 }}>
          {images.map((img) => (
            <div key={img._id} className="card" style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 6, overflow: "hidden", background: "var(--bg-grid)" }}>
                <img src={imageFileUrl(img._id)} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{img.label}</div>
              <div className="hash" style={{ fontSize: 10 }}>{img.contentHash.slice(0, 16)}…</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pill amber">block #{img.blockIndex}</span>
                <button
                  onClick={() => onTamper(img._id)}
                  title="Simulate a database-level tamper for the verification demo"
                  style={{ fontSize: 10.5, padding: "5px 8px" }}
                >
                  tamper
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
