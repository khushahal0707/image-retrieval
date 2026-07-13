import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getFederatedHistory, runFederatedRound, resetFederated } from "../api.js";

const CLIENT_COLORS = ["#4fd8c4", "#9c8cf2", "#f2b84b"];

export default function Federated() {
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => getFederatedHistory().then(setHistory);
  useEffect(() => { refresh(); }, []);

  const onRun = async () => {
    setBusy(true);
    await runFederatedRound();
    await refresh();
    setBusy(false);
  };

  const onReset = async () => {
    await resetFederated();
    await refresh();
  };

  const chartData = history.map((h) => ({
    round: h.round,
    "Client-1": h.clientLosses[0],
    "Client-2": h.clientLosses[1],
    "Client-3": h.clientLosses[2],
    Global: h.globalLoss,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="eyebrow">Algorithm 1 · FedAvg</span>
          <h2 style={{ fontSize: 28, marginTop: 6 }}>Decentralized model training</h2>
          <p style={{ marginTop: 8, maxWidth: 620 }}>
            Three simulated data owners each hold a private synthetic dataset. Every round they train
            locally for one step and send only their updated weights — never raw imagery — to be
            averaged into the global model, weighted by local dataset size.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onReset}>Reset</button>
          <button className="primary" onClick={onRun} disabled={busy}>
            {busy ? "Training…" : "Run federated round"}
          </button>
        </div>
      </div>

      <div className="card" style={{ height: 320 }}>
        {chartData.length === 0 ? (
          <p style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
            Run a round to start plotting convergence.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1a253c" />
              <XAxis dataKey="round" stroke="#566384" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} label={{ value: "Round", position: "insideBottom", offset: -4, fill: "#566384", fontSize: 11 }} />
              <YAxis stroke="#566384" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
              <Tooltip contentStyle={{ background: "#111a2b", border: "1px solid #23304a", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
              <Line type="monotone" dataKey="Client-1" stroke={CLIENT_COLORS[0]} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Client-2" stroke={CLIENT_COLORS[1]} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Client-3" stroke={CLIENT_COLORS[2]} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Global" stroke="#eaf0fb" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...history].reverse().map((h) => (
          <div key={h.round} className="card" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mono" style={{ minWidth: 70, color: "var(--text-faint)" }}>round {h.round}</span>
            {h.clientLosses.map((l, i) => (
              <span key={i} className="mono" style={{ fontSize: 12, color: CLIENT_COLORS[i] }}>
                Client-{i + 1}: {l.toFixed(4)}
              </span>
            ))}
            <span className="pill amber" style={{ marginLeft: "auto" }}>global loss {h.globalLoss.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
