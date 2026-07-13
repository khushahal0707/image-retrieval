import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview", end: true },
  { to: "/index", label: "Index" },
  { to: "/retrieve", label: "Retrieve" },
  { to: "/ledger", label: "Ledger" },
  { to: "/federated", label: "Federated" },
];

export default function Navbar() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-soft)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(10,15,28,0.85)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
        <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z" stroke="var(--cyan)" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="2.6" fill="var(--cyan)" />
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>
            Ledgerlens
          </span>
        </NavLink>

        <nav style={{ display: "flex", gap: 4 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                letterSpacing: "0.03em",
                padding: "8px 12px",
                borderRadius: 7,
                color: isActive ? "var(--cyan)" : "var(--text-muted)",
                background: isActive ? "rgba(79,216,196,0.08)" : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
