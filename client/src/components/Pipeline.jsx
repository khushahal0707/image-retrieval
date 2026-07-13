const stages = [
  { label: "Raw Image", sub: "client-side", color: "var(--text-muted)" },
  { label: "Feature Vector", sub: "CNN encoder", color: "var(--cyan)" },
  { label: "HE Ciphertext", sub: "CKKS-style", color: "var(--cyan)" },
  { label: "Cloud Similarity", sub: "blind compute", color: "var(--violet)" },
  { label: "Chain Commit", sub: "Merkle proof", color: "var(--amber)" },
  { label: "Verified Result", sub: "client decrypts", color: "var(--amber)" },
];

export default function Pipeline() {
  return (
    <div className="card" style={{ padding: "28px 22px", overflowX: "auto" }}>
      <style>{`
        @keyframes travel {
          0% { left: 0%; opacity: 0; }
          6% { opacity: 1; }
          94% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .packet {
          position: absolute;
          top: 50%;
          width: 10px;
          height: 10px;
          margin-top: -5px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 12px 3px rgba(79,216,196,0.55);
          animation: travel 6s linear infinite;
        }
        .pipe-line {
          position: relative;
          height: 2px;
          background: repeating-linear-gradient(90deg, var(--border) 0 6px, transparent 6px 12px);
          margin: 0 6px;
        }
        .stage-node {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          min-width: 108px;
        }
        .stage-dot {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid currentColor;
          background: var(--bg);
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "flex-start", minWidth: 720 }}>
        {stages.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", flex: i < stages.length - 1 ? 1 : "none" }}>
            <div className="stage-node">
              <div className="stage-dot" style={{ color: s.color }} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                {s.label}
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-faint)", textAlign: "center" }}>
                {s.sub}
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="pipe-line" style={{ flex: 1 }}>
                <div className="packet" style={{ animationDelay: `${i * -1}s` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
