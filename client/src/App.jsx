import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import IndexPage from "./pages/IndexPage.jsx";
import Retrieve from "./pages/Retrieve.jsx";
import Ledger from "./pages/Ledger.jsx";
import Federated from "./pages/Federated.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: "40px 0 80px" }}>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/index" element={<IndexPage />} />
            <Route path="/retrieve" element={<Retrieve />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/federated" element={<Federated />} />
          </Routes>
        </div>
      </main>
      <footer style={{ borderTop: "1px solid var(--border-soft)", padding: "18px 0" }}>
        <div className="container mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
          Ledgerlens — teaching implementation of Blockchain-Assisted Verifiable and Secure Remote Sensing
          Image Retrieval Using Homomorphic Encryption and Federated Learning. HE and CNN stages are
          simulated for local demo purposes; see README for details.
        </div>
      </footer>
    </>
  );
}
