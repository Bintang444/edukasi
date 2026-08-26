import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPrize, TYPE_INFO } from "../prizes";
import { playCash, playClick } from "../sound";

const COLORS = ["#ffd166", "#ff7a00", "#22c55e", "#38bdf8", "#f472b6", "#c084fc"];
const ORIGINAL_TITLE = "Reward Center — Event Hadiah Gratis Hari Ini!";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prize = location.state?.prize;
  const info = getPrize(prize);
  const typeInfo = TYPE_INFO[info.type] || TYPE_INFO.fisik;
  const [lockLeft, setLockLeft] = useState(15 * 60);

  // Timer "hadiah dikunci" — tekanan waktu ala scam asli
  useEffect(() => {
    const t = setInterval(() => setLockLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(lockLeft / 60)).padStart(2, "0");
  const ss = String(lockLeft % 60).padStart(2, "0");

  const confetti = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2.6 + Math.random() * 2.4,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 6,
      })),
    []
  );

  // Judul tab berkedip — trik asli biar korban ganti tab tetap penasaran
  useEffect(() => {
    playCash();
    let flip = false;
    const t = setInterval(() => {
      flip = !flip;
      document.title = flip ? "🎉 KAMU MENANG HADIAH!!!" : "🎁 Klaim sebelum kedaluwarsa!";
      navigator.vibrate?.(60);
    }, 1100);
    return () => {
      clearInterval(t);
      document.title = ORIGINAL_TITLE;
    };
  }, []);

  if (!prize) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0b0b14", gap: 16 }}>
        <p style={{ color: "#8b93a7" }}>Sesi hadiah tidak ditemukan.</p>
        <button className="btn-cta" onClick={() => navigate("/")}>Kembali ke Event</button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(120% 100% at 50% 0%, #4a1d05 0%, #0b0b14 55%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        {confetti.map((c, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.7,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="container flex flex-col items-center justify-center" style={{ maxWidth: 480, minHeight: "100vh", padding: 20, zIndex: 2, position: "relative" }}>
        <div className="display" style={{ fontSize: 13, letterSpacing: 4, color: "#ffb020", marginBottom: 10 }}>
          — Selamat Kepada Kamu —
        </div>
        <h1 className="display" style={{ fontSize: 44, textAlign: "center", lineHeight: 1.05, textShadow: "0 6px 34px rgba(255,176,32,.5)" }}>
          KAMU MENANG!
        </h1>

        {/* Kartu hadiah */}
        <div className="panel" style={{
          width: "100%", marginTop: 24, padding: 20, textAlign: "center",
          borderColor: "#ffb02066", borderWidth: 1.5,
          background: "linear-gradient(180deg,#1d1608,#12121c)",
        }}>
          <div style={{ fontSize: 54, marginBottom: 8 }}>{typeInfo.icon}</div>
          <div style={{ fontSize: 11, letterSpacing: 2.5, color: "#8b93a7" }}>HADIAH KAMU</div>
          <div className="display" style={{ fontSize: 26, color: "#ffd166", marginTop: 4 }}>{prize}</div>
          <p style={{ fontSize: 12, color: "#8b93a7", marginTop: 8 }}>{typeInfo.delivery}</p>
          <div style={{ margin: "14px auto 0", display: "inline-block", fontSize: 11.5, color: lockLeft < 300 ? "#fca5a5" : "#4ade80", border: `1px solid ${lockLeft < 300 ? "#ef444455" : "#22c55e55"}`, borderRadius: 99, padding: "5px 12px", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
            ⏳ Hadiah dikunci — klaim dalam {mm}:{ss}
          </div>
        </div>

        <button className="btn-cta btn-green" onClick={() => { playClick(); navigate("/form", { state: { prize } }); }} style={{ marginTop: 26, width: "100%", maxWidth: 340 }}>
          {typeInfo.claimText} →
        </button>
        <p style={{ fontSize: 11, color: "#666f85", marginTop: 12, textAlign: "center" }}>
          Segera klaim sebelum kuota habis dan hadiah diberikan ke pengguna lain
        </p>
      </div>
    </div>
  );
};

export default Result;
