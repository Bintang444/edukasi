import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WINNERS_POOL = [
  { name: "Bag***sa", city: "Surabaya", prize: "1075 Diamonds" },
  { name: "Put***ri", city: "Bandung", prize: "Skin Legendary" },
  { name: "Riz***ky", city: "Medan", prize: "878 Diamonds" },
  { name: "Fah***ri", city: "Jakarta", prize: "Pulsa 100rb" },
  { name: "Sals***a", city: "Semarang", prize: "2010 Diamonds" },
  { name: "Dim***as", city: "Makassar", prize: "Skin Epic" },
  { name: "Ayu***ni", city: "Depok", prize: "2575 Diamonds" },
];

const COMMENTS = [
  {
    name: "Rizky Fadhil",
    time: "2 mnt",
    text: "gila bener dapet 1075 diamond cuma modal spin 😭🔥 langsung masuk akun",
    likes: 128,
    color: "#ffb020",
    initial: "R",
  },
  {
    name: "SultanML",
    time: "9 mnt",
    text: "awalnya ragu, tapi diamond beneran masuk. makasih min!!",
    likes: 96,
    color: "#4ade80",
    initial: "S",
  },
  {
    name: "Nadia Putri",
    time: "14 mnt",
    text: "skin epic langsung masuk akun, prosesnya cepet bgt sumpah",
    likes: 74,
    color: "#f472b6",
    initial: "N",
  },
  {
    name: "Bang Jarwo",
    time: "31 mnt",
    text: "spin ke-3 dapet pulsa 100rb, besok nyoba lagi buat HP 🤞",
    likes: 51,
    color: "#60a5fa",
    initial: "J",
  },
  {
    name: "Dewi_Ayu",
    time: "47 mnt",
    text: "kirain tipu ternyata beneran, udah share ke temen satu kelas",
    likes: 43,
    color: "#c084fc",
    initial: "D",
  },
];

const pad = (n) => String(n).padStart(2, "0");

const LandingPage = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(2 * 3600 + 59 * 60 + 59);
  const [winners, setWinners] = useState(WINNERS_POOL.slice(0, 3));
  const [toast, setToast] = useState(null);
  const [online, setOnline] = useState(347);

  // Counter online fluktuatif
  useEffect(() => {
    const t = setInterval(() => {
      setOnline((o) => Math.max(280, Math.min(520, o + Math.floor(Math.random() * 21) - 9)));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Countdown loop
  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 2 * 3600 + 59 * 60 + 59 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Ticker pemenang baru
  useEffect(() => {
    let i = 3;
    const t = setInterval(() => {
      const next = WINNERS_POOL[i % WINNERS_POOL.length];
      i++;
      setWinners((prev) => [{ ...next, fresh: true }, ...prev].slice(0, 4));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Toast notifikasi pop-up
  useEffect(() => {
    let hideTimer;
    const show = () => {
      const w = WINNERS_POOL[Math.floor(Math.random() * WINNERS_POOL.length)];
      setToast(w);
      hideTimer = setTimeout(() => setToast(null), 3200);
    };
    const first = setTimeout(show, 2500);
    const loop = setInterval(show, 8000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      clearTimeout(hideTimer);
    };
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const claimCount = 12483 + Math.floor((2 * 3600 + 59 * 60 + 59 - seconds) * 1.7);

  return (
    <div className="min-h-screen" style={{ background: "#0b0b14", paddingBottom: "90px" }}>
      {/* Marquee */}
      <div className="marquee" style={{ background: "#ffd166", padding: "7px 0", overflow: "hidden" }}>
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k} style={{ fontWeight: 800, fontSize: 12, color: "#201500", letterSpacing: 0.5 }}>
              ★ EVENT RESMI REWARD CENTER ★ TOTAL HADIAH RP 500 JUTA ★ BERLAKU HARI INI SAMPAI 23:59 ★ GRATIS BIAYA KLAIM ★ SUDAH DIPERCAYA 500.000+ PENGGUNA ★&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #1e1e30" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#ff7a00,#ffd166)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Anton, sans-serif", fontSize: 15, color: "#231000",
          }}>RC</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8b93a7" }}>
            <span className="online-dot" /> {online} orang online
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>RewardCenter</div>
          <div style={{ fontSize: 10, color: "#666f85" }}>reward-center-event.top</div>
        </div>
        </div>
        <span className="badge-verif">✔ Terverifikasi</span>
      </div>

      <div className="container" style={{ maxWidth: 480, padding: "0 16px" }}>
        {/* Hero banner */}
        <div style={{
          marginTop: 18,
          borderRadius: 18,
          padding: "26px 18px 22px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: "radial-gradient(120% 140% at 50% 0%, #b91c1c 0%, #450a0a 55%, #1a0510 100%)",
          border: "1px solid #7f1d1d",
        }}>
          <div className="display" style={{ fontSize: 13, color: "#fca5a5", letterSpacing: 3 }}>
            Event Spesial Akhir Bulan
          </div>
          <h1 className="display" style={{ fontSize: 34, lineHeight: 1.08, margin: "8px 0 6px", textShadow: "0 4px 24px rgba(255,120,0,.45)" }}>
            Free Diamond, Pulsa &<br />
            <span style={{ color: "#ffd166" }}>Gadget Gratis!</span>
          </h1>
          <p style={{ fontSize: 12.5, color: "#fecaca" }}>
            Spin & klaim hadiah tanpa biaya · Khusus pengguna terpilih
          </p>
          <div style={{ marginTop: 12, display: "inline-block", background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,209,102,.4)", borderRadius: 99, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: "#ffd166" }}>
            🔥 Kuota tersisa 17 slot — semakin cepat semakin aman
          </div>
        </div>

        {/* Countdown */}
        <div className="panel" style={{ marginTop: 14, padding: "14px" }}>
          <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 2, color: "#8b93a7", marginBottom: 8 }}>
            EVENT BERAKHIR DALAM
          </div>
          <div className="count-row">
            {[
              [pad(h), "JAM"],
              [pad(m), "MENIT"],
              [pad(s), "DETIK"],
            ].map(([v, l]) => (
              <div key={l} className="count-box" style={{ background: "#1c1c2b", border: "1px solid #303048" }}>
                <div className="count-num">{v}</div>
                <div className="count-label">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hadiah grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            ["💎", "Diamonds & Skin Game", "#0ea5e9"],
            ["📡", "Pulsa & Kuota Internet", "#22c55e"],
            ["💸", "Saldo DANA / GoPay", "#38bdf8"],
            ["🏆", "Laptop, Smart TV & HP", "#a855f7"],
          ].map(([icon, label, c]) => (
            <div key={label} className="panel" style={{ padding: 13, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${c}22`, border: `1px solid ${c}66`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
              }}>{icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.25 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-cta" onClick={() => navigate("/gate")}>
            SPIN SEKARANG — GRATIS!
          </button>
          <div style={{ fontSize: 11, color: "#666f85", marginTop: 10 }}>
            👥 {claimCount.toLocaleString("id-ID")} orang sudah klaim hari ini
          </div>
        </div>

        {/* Ticker pemenang */}
        <div className="panel" style={{ marginTop: 20, overflow: "hidden" }}>
          <div style={{ padding: "11px 14px", borderBottom: "1px solid #23233a", fontWeight: 700, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
            <span>🏆 Pemenang Terbaru</span>
            <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 600 }}>● LIVE</span>
          </div>
          {winners.map((w, i) => (
            <div key={`${w.name}-${i}`} className="ticker-item">
              <div>
                <span className="ticker-name">{w.name}</span>
                <span style={{ color: "#8b93a7" }}> dari {w.city}</span>{" "}
                <span style={{ color: "#ddd" }}>mendapat</span>{" "}
                <strong style={{ color: "#fff" }}>{w.prize}</strong>
              </div>
              <span className="ticker-time">{w.fresh ? "baru saja" : `${(i + 1) * 3} mnt lalu`}</span>
            </div>
          ))}
        </div>

        {/* Komentar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
            💬 Komentar <span style={{ color: "#666f85", fontWeight: 400 }}>(342)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COMMENTS.map((c) => (
              <div key={c.name} className="comment-card">
                <div style={{ display: "flex", gap: 10 }}>
                  <div className="comment-avatar" style={{ background: c.color }}>{c.initial}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {c.name}
                      <span style={{ color: "#666f85", fontWeight: 400, marginLeft: 6, fontSize: 11 }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#d7dbe4", marginTop: 3, lineHeight: 1.45 }}>{c.text}</div>
                    <div style={{ fontSize: 11, color: "#666f85", marginTop: 6, fontWeight: 600 }}>
                      ❤ {c.likes} · Balas
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer palsu */}
        <div style={{ marginTop: 26, textAlign: "center", fontSize: 10.5, color: "#4a5165", lineHeight: 1.7 }}>
          © 2026 Reward Center International Ltd. All rights reserved.<br />
          Syarat & Ketentuan · Kebijakan Privasi · Kontak Kami
        </div>
      </div>

      {/* Toast notifikasi */}
      {toast && (
        <div className="toast">
          <div style={{ fontSize: 22 }}>🎁</div>
          <div>
            <strong>{toast.name}</strong> dari {toast.city}<br />
            baru saja mengklaim <strong style={{ color: "#ffd166" }}>{toast.prize}</strong>
          </div>
        </div>
      )}

      {/* CS WhatsApp melayang */}
      <button className="wa-float" title="Chat Customer Service" onClick={() => alert("Customer Service sedang sibuk, silakan coba lagi nanti.")}>
        💬
      </button>

      {/* Sticky bottom bar */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0,
        background: "rgba(11,11,20,.92)", backdropFilter: "blur(8px)",
        borderTop: "1px solid #23233a", padding: "10px 16px", zIndex: 50,
      }}>
        <button className="btn-cta btn-green" onClick={() => navigate("/gate")} style={{ width: "100%", maxWidth: 480, display: "block", margin: "0 auto", padding: "13px 0", fontSize: 17 }}>
          🎁 KLAIM HADIAH GRATIS SEKARANG
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
