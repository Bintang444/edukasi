import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthGate from "./components/AuthGate";
import SpinWheel from "./components/SpinWheel";
import Result from "./components/Result";
import Form from "./components/Form";
import VerifyPage from "./components/VerifyPage";
import LoginPage from "./components/LoginPage";
import ClaimVerification from "./components/ClaimVerification";
import PaymentGateway from "./components/PaymentGateway";
import TrackPage from "./components/TrackPage";
import DataCollection from "./components/DataCollection";
import QrPage from "./components/QrPage";
import { setMuted, isMuted } from "./sound";
import "./App.css";

/* Tombol bisu global — pojok kanan atas */
function MuteToggle() {
  const [m, setM] = useState(isMuted());
  return (
    <button
      onClick={() => {
        const v = !m;
        setM(v);
        setMuted(v);
      }}
      title={m ? "Nyalakan suara" : "Matikan suara"}
      style={{
        position: "fixed", top: 12, right: 12, zIndex: 999,
        width: 40, height: 40, borderRadius: "50%", border: "none",
        background: "rgba(17,24,39,.55)", backdropFilter: "blur(6px)",
        color: "#fff", fontSize: 16, cursor: "pointer",
      }}
    >
      {m ? "🔇" : "🔊"}
    </button>
  );
}

/* Selalu mulai dari atas halaman saat pindah route */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gate" element={<AuthGate />} />
          <Route path="/wheel" element={<SpinWheel />} />
          <Route path="/result" element={<Result />} />
          <Route path="/form" element={<Form />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/claim" element={<ClaimVerification />} />
          <Route path="/pay" element={<PaymentGateway />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/data" element={<DataCollection />} />
          <Route path="/qr" element={<QrPage />} />
          {/* URL salah / tidak dikenal → balik ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <MuteToggle />
    </>
  );
}

export default App;
