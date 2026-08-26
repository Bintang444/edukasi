import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { playBeep } from "../sound";

const STEPS = [
  { icon: "📝", title: "Pesanan Dibuat", desc: "Hadiah terverifikasi & dikunci atas nama penerima" },
  { icon: "📦", title: "Paket Disiapkan", desc: "Gudang Reward Center, Jakarta Barat" },
  { icon: "🚚", title: "Dalam Pengiriman", desc: "Kurir RewardExpress menuju alamat tujuan" },
  { icon: "🏠", title: "Tiba di Tujuan", desc: "Menunggu konfirmasi penerima" },
];

const TrackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prize = "FREE Handphone", nama = "" } = location.state || {};
  const [resi] = useState(() => `RC${Math.floor(100000000 + Math.random() * 899999999)}`);
  const [activeStep, setActiveStep] = useState(1);

  // Step bergerak otomatis biar serasa live tracking
  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return;
    const t = setTimeout(() => {
      setActiveStep((s) => s + 1);
      playBeep();
      navigator.vibrate?.(50);
    }, 2600);
    return () => clearTimeout(t);
  }, [activeStep]);

  useEffect(() => {
    const t = setTimeout(() => navigate("/"), 14000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ background: "#f4f5f7", color: "#1f2937" }}>
      {/* Header ala aplikasi kurir */}
      <div style={{
        background: "linear-gradient(135deg,#b91c1c,#7f1d1d)",
        padding: "16px 18px 26px",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>🚚</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>RewardExpress</div>
              <div style={{ fontSize: 10.5, opacity: 0.75 }}>Layanan pengiriman hadiah event</div>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,.12)", borderRadius: 12, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10.5, opacity: 0.75 }}>NO. RESI</div>
              <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>{resi}</div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(resi);
                alert("Nomor resi disalin!");
              }}
              style={{ background: "#fff", color: "#7f1d1d", border: "none", borderRadius: 8, padding: "7px 13px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              Salin
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "-12px auto 0", padding: "0 16px 40px" }}>
        {/* Kartu paket */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 6px 24px rgba(0,0,0,.09)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>PAKET</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{prize}</div>
              {nama && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>untuk {nama}</div>}
            </div>
            <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 99 }}>
              🕒 Estimasi 2-3 hari
            </span>
          </div>

          {/* Timeline */}
          <div style={{ marginTop: 18 }}>
            {STEPS.map((s, i) => {
              const done = i < activeStep;
              const current = i === activeStep;
              return (
                <div key={s.title} style={{ display: "flex", gap: 13 }}>
                  {/* Kolom ikon + garis */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                      background: done ? "#dcfce7" : current ? "#dbeafe" : "#f3f4f6",
                      border: `2px solid ${done ? "#22c55e" : current ? "#3b82f6" : "#e5e7eb"}`,
                      animation: current ? "pulseDot 1.4s ease infinite" : "none",
                    }}>{done ? "✓" : s.icon}</div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 3, flex: 1, minHeight: 30, background: done ? "#22c55e" : "#e5e7eb", borderRadius: 2 }} />
                    )}
                  </div>
                  {/* Teks */}
                  <div style={{ paddingBottom: 20, paddingTop: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: done || current ? "#111827" : "#9ca3af" }}>
                      {s.title}{current && <span style={{ marginLeft: 7, fontSize: 11, color: "#2563eb" }}>● sedang berlangsung</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 13px", fontSize: 11.5, color: "#1d4ed8", lineHeight: 1.55 }}>
            ℹ️ Halaman ini meniru fitur lacak resi sungguhan — di web penipuan asli, resi & status pengiriman juga bisa dipalsukan supaya korban yakin hadiahnya “benar-benar dikirim”.
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="btn-cta"
          style={{ width: "100%", marginTop: 18, background: "linear-gradient(180deg,#334155,#1e293b)", boxShadow: "0 6px 0 #0f172a", fontSize: 16 }}
        >
          ← KEMBALI KE BERANDA
        </button>
      </div>
    </div>
  );
};

export default TrackPage;
