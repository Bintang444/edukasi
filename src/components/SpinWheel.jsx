import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRIZES, SEG } from "../prizes";
import { playTick, playWhoosh, playFanfare } from "../sound";

const SpinWheel = () => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const tickRef = useRef(null);

  // Hentikan suara detak kalau halaman ditinggal
  useEffect(() => () => clearInterval(tickRef.current), []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    playWhoosh();

    // Detak roda — makin lambat menjelang berhenti
    let tickDelay = 55;
    tickRef.current = setInterval(() => {
      playTick();
      navigator.vibrate?.(12);
    }, tickDelay);

    // Setiap anak "menang" hadiah berbeda — diacak dari semua segmen.
    // Roda penipuan tidak pernah membuat siapa pun pulang tanpa hadiah!
    const winnerIndex = Math.floor(Math.random() * PRIZES.length);
    const winnerMid = winnerIndex * SEG + SEG / 2;

    const currentMod = ((rotation % 360) + 360) % 360;
    const targetMod = (360 - winnerMid) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    delta += 360 * 6;

    setRotation(rotation + delta);

    setTimeout(() => {
      clearInterval(tickRef.current);
      playFanfare();
      navigator.vibrate?.([80, 60, 120]);
      navigate("/result", { state: { prize: PRIZES[winnerIndex].label } });
    }, 4900);
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(120% 100% at 50% 0%, #241333 0%, #0b0b14 60%)" }}>
      <div className="container flex flex-col items-center" style={{ maxWidth: 480, padding: "26px 16px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 18 }}>
          <div className="display" style={{ fontSize: 13, letterSpacing: 2, color: "#ffd166" }}>LUCKY SPIN</div>
          <span className="badge-verif">✔ Event Resmi</span>
        </div>

        <h1 className="display" style={{ fontSize: 27, textAlign: "center", lineHeight: 1.15 }}>
          Putar & Menangkan<br />
          <span style={{ color: "#ffb020" }}>Hadiah Langsung!</span>
        </h1>
        <p style={{ fontSize: 12.5, color: "#8b93a7", margin: "8px 0 22px", textAlign: "center" }}>
          Selamat! Akun kamu terpilih mendapat <strong style={{ color: "#fff" }}>1x spin gratis</strong> tanpa deposit
        </p>

        {/* Roda */}
        <div className="wheel-wrap">
          <div className="wheel-pointer" />
          <div
            className="wheel-disc"
            style={{
              background: `conic-gradient(${PRIZES.map(
                (p, i) => `${p.color} ${i * SEG}deg ${(i + 1) * SEG}deg`
              ).join(", ")})`,
              transition: spinning ? "transform 4.4s cubic-bezier(0.12, 0.84, 0.18, 1)" : "none",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Garis pemisah segmen */}
            <div
              className="wheel-dividers"
              style={{
                background: `repeating-conic-gradient(rgba(255,255,255,.35) 0deg 1deg, transparent 1deg ${SEG}deg)`,
              }}
            />
            {PRIZES.map((p, i) => {
              const mid = i * SEG + SEG / 2;
              return (
                <div
                  key={i}
                  className="wheel-label"
                  style={{
                    transform: `rotate(${mid}deg) translateY(-114px) translateX(-50%)`,
                    maxWidth: 86,
                    whiteSpace: "normal",
                    textAlign: "center",
                    lineHeight: 1.12,
                    letterSpacing: 0.2,
                  }}
                >
                  {p.label}
                </div>
              );
            })}
          </div>
          <button className="wheel-center-btn" onClick={spin} disabled={spinning}>
            {spinning ? "..." : "SPIN"}
          </button>
        </div>

        {/* Status */}
        <div style={{ height: 34, marginTop: 20, display: "flex", alignItems: "center" }}>
          {spinning ? (
            <span style={{ fontSize: 13, color: "#ffd166", fontWeight: 600 }}>🎡 Roda berputar...</span>
          ) : (
            <span style={{ fontSize: 11.5, color: "#666f85", textAlign: "center" }}>
              Tekan tombol tengah untuk memutar roda
            </span>
          )}
        </div>

        {/* Sosial proof */}
        <div className="panel" style={{ width: "100%", marginTop: 10, padding: "12px 14px", display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          {[
            ["12.483", "Klaim hari ini"],
            ["Rp 500 jt", "Total hadiah"],
            ["98,2%", "Berhasil dikirim"],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#ffd166" }}>{v}</div>
              <div style={{ fontSize: 10, color: "#666f85", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, color: "#4a5165", marginTop: 14, textAlign: "center", maxWidth: 300 }}>
          *Hadiah berupa kredit dalam game dan berlaku selama event. Periode klaim terbatas.
        </p>
      </div>
    </div>
  );
};

export default SpinWheel;
