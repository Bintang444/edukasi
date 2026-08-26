import { useEffect, useState } from "react";
import QRCode from "qrcode";

const QrPage = () => {
  const [src, setSrc] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Pakai alamat yang sedang dipakai (localhost di laptop / IP LAN dari HP)
    const u = `${window.location.origin}/`;
    setUrl(u);
    QRCode.toDataURL(u, {
      width: 520,
      margin: 2,
      color: { dark: "#111a2e", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#eef1f6", padding: 24 }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "30px 26px",
        maxWidth: 400, width: "100%", textAlign: "center",
        boxShadow: "0 14px 40px rgba(16,24,40,.12)", color: "#1f2937",
      }}>
        <div style={{ fontSize: 40 }}>📱</div>
        <h1 style={{ fontSize: 19, fontWeight: 800, margin: "8px 0 4px" }}>
          Scan untuk Ikut Simulasi
        </h1>
        <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.6, marginBottom: 18 }}>
          Minta murid scan kode ini dengan kamera HP.<br />
          Pastikan HP terhubung WiFi/hotspot yang sama dengan laptop.
        </p>

        <div style={{
          background: src ? "#fff" : "#f3f4f6", border: "1px solid #e5e7eb",
          borderRadius: 16, padding: 14, display: "inline-block",
        }}>
          {src ? (
            <img src={src} alt="QR Code simulasi" style={{ width: "100%", maxWidth: 280, display: "block", borderRadius: 8 }} />
          ) : (
            <div style={{ width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
              Menyiapkan QR...
            </div>
          )}
        </div>

        <div style={{
          marginTop: 16, background: "#f1f5f9", borderRadius: 10,
          padding: "10px 12px", fontFamily: "ui-monospace, monospace",
          fontSize: 12.5, wordBreak: "break-all", color: "#334155",
        }}>{url}</div>

        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 14, lineHeight: 1.6 }}>
          Alamat mengikuti tempat halaman ini dibuka —<br />
          buka halaman ini lewat IP laptop agar QR berisi alamat LAN.
        </p>
      </div>
    </div>
  );
};

export default QrPage;
