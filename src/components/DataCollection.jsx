import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissions, clearSubmissions } from "../store";

/* ---------- Terjemahkan User-Agent jadi bahasa manusia (fallback) ---------- */
const parseUA = (ua = "") => {
  let os = "Perangkat tidak dikenal";
  if (/Android/i.test(ua)) os = `Android ${(ua.match(/Android (\d+)/) || [])[1] || ""}`.trim();
  else if (/iPhone|iPad/i.test(ua)) os = "iPhone/iPad";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh/i.test(ua)) os = "Mac";
  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) browser = "Chrome Samsung";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  return `${os} · ${browser}`;
};

/* ---------- Definisi seksi ---------- */
const SECTIONS = [
  {
    key: "pribadi",
    icon: "📇",
    title: "Identitas & Kontak Pribadi",
    desc: "Data yang korban ketik sendiri di formulir klaim.",
    risk: "Nama, nomor HP, dan alamat bisa dipakai untuk penipuan COD palsu, pinjaman online, sampai dihubungi orang tak dikenal. Tipe HP pun ikut terbaca.",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    key: "registrasi",
    icon: "🧾",
    title: "Password yang Baru Dibuat",
    desc: "Korban diminta mendaftar akun sebelum bisa memutar roda.",
    risk: "Jika password ini sama dengan akun media sosial atau game lainnya, SEMUA akun tersebut ikut terancam.",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    key: "kredensial",
    icon: "🔑",
    title: "Akun, PIN & Kode OTP",
    desc: "Kredensial sensitif yang diserahkan lewat halaman verifikasi palsu.",
    risk: "Ini kerugian paling serius. OTP membuka akses rekening bank, PIN mengosongkan e-wallet, login game dicuri dan dijual. Sekali lepas, sulit ditutup.",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    key: "uang",
    icon: "💸",
    title: "Uang yang Sudah Dibayarkan",
    desc: "'Biaya admin' atau 'ongkir' yang diminta sebelum hadiah dikirim.",
    risk: "Hadiah asli tidak pernah meminta pembayaran. Uang yang sudah terkirim tidak akan kembali — dan hadiahnya memang tidak pernah ada.",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    key: "sebar",
    icon: "📣",
    title: "Link yang Disebarkan",
    desc: "Syarat 'bagikan ke 3 grup' untuk membuka klaim.",
    risk: "Inilah mesin penyebar penipuan. Setiap korban membawa puluhan target baru — biasanya teman sekelas dan keluarga sendiri.",
    color: "#0891b2",
    bg: "#ecfeff",
  },
];

/* ---------- Komponen kecil ---------- */
const Row = ({ icon, label, value }) => (
  <div style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 13.5, alignItems: "baseline" }}>
    <span style={{ width: 18, textAlign: "center", flexShrink: 0 }}>{icon}</span>
    {label && <span style={{ color: "#6b7280", minWidth: 74, flexShrink: 0 }}>{label}</span>}
    <span style={{ color: "#111827", fontWeight: 600, wordBreak: "break-word" }}>{value}</span>
  </div>
);

const CodeChip = ({ children, size = 14 }) => (
  <code style={{
    display: "inline-block", background: "#dc2626", color: "#fff",
    padding: "4px 14px", borderRadius: 8,
    fontFamily: "ui-monospace, monospace", fontSize: size,
    letterSpacing: 3, fontWeight: 700,
  }}>{children}</code>
);

const DeviceLine = ({ item }) =>
  item.waktu ? (
    <div style={{
      marginTop: 9, paddingTop: 7, borderTop: "1px dashed #e5e7eb",
      fontSize: 10.5, color: "#9ca3af", display: "flex", flexWrap: "wrap", gap: "3px 10px",
    }}>
      <span>🕒 {item.waktu}</span>
      <span>📱 {item.perangkat || parseUA(item.ua)}</span>
      {item.layar && <span>🖥️ Layar {item.layar}</span>}
    </div>
  ) : null;

/* ================= HALAMAN UTAMA ================= */
const DataCollection = () => {
  const [dataList, setDataList] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  // Panel terkunci PIN biar murid tidak iseng membuka
  useEffect(() => {
    if (!sessionStorage.getItem("guru_ok")) {
      const p = prompt("🔒 Panel Guru\nMasukkan PIN (default: 1234):");
      if (p === "1234") {
        sessionStorage.setItem("guru_ok", "1");
      } else {
        alert("PIN salah.");
        navigate("/");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!sessionStorage.getItem("guru_ok")) return;
    const load = () => {
      getSubmissions().then((data) => {
        setDataList(Array.isArray(data) ? data : []);
        setLastUpdate(new Date().toLocaleTimeString());
      });
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const rows = [["waktu", "tipe", "detail"]];
    dataList.forEach((d) => rows.push([d.waktu || "", d.tipe || "", JSON.stringify(d)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `data-simulasi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const clearData = async () => {
    if (!confirm("Hapus semua data simulasi?")) return;
    await clearSubmissions();
    setDataList([]);
  };

  const grouped = {
    pribadi: dataList.filter((d) => d.tipe === "data-pribadi"),
    registrasi: dataList.filter((d) => d.tipe === "registrasi"),
    kredensial: dataList.filter((d) => ["login", "otp", "pin-ewallet", "bank"].includes(d.tipe)),
    uang: dataList.filter((d) => d.tipe === "pembayaran"),
    sebar: dataList.filter((d) => d.tipe === "share"),
  };
  const totalUang = grouped.uang.reduce((s, d) => s + (d.jumlah || 0), 0);
  const totalRisiko =
    grouped.pribadi.length + grouped.registrasi.length + grouped.kredensial.length + grouped.uang.length;

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", padding: "22px 14px 40px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ===== HEADER ===== */}
        <div style={{
          background: "linear-gradient(150deg,#111a2e,#1c2b4a)",
          borderRadius: 18, padding: "22px 20px 18px", color: "#fff",
          position: "relative", overflow: "hidden",
          boxShadow: "0 12px 34px rgba(17,26,46,.35)",
        }}>
          <div style={{ position: "absolute", top: -40, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,209,102,.07)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{
              background: "rgba(255,209,102,.15)", border: "1px solid rgba(255,209,102,.45)",
              color: "#ffd166", fontSize: 10.5, fontWeight: 700,
              padding: "4px 12px", borderRadius: 99, letterSpacing: 1,
            }}>
              👨‍🏫 PANEL GURU · SIMULASI EDUKASI
            </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/qr")}
              style={{
                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.25)",
                color: "#fff", fontSize: 11, fontWeight: 700,
                padding: "5px 12px", borderRadius: 99, cursor: "pointer",
              }}
            >
              📲 QR untuk Murid
            </button>
            <span style={{ fontSize: 11, opacity: 0.65 }}>🟢 Live{lastUpdate ? ` · ${lastUpdate}` : ""}</span>
          </div>
          </div>

          <h1 style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.35, marginTop: 14 }}>
            Semua yang “Penipu” Ketahui<br />Tentang Murid Kita
          </h1>
          <p style={{ fontSize: 12.5, opacity: 0.75, lineHeight: 1.65, marginTop: 8, maxWidth: 430 }}>
            Setiap langkah yang anak-anak lakukan di web simulasi tercatat di sini —
            persis seperti yang akan dialami korban sungguhan.
          </p>

          {/* Statistik */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7, marginTop: 18 }}>
            {[
              [totalRisiko, "Total Jejak"],
              [grouped.registrasi.length + grouped.kredensial.length, "Kredensial"],
              [grouped.pribadi.length, "Data Diri"],
              [totalUang ? `Rp${Math.round(totalUang / 1000)}rb` : "0", "Uang"],
              [grouped.sebar.length, "Sebar"],
            ].map(([n, l], i) => (
              <div key={l} style={{
                background: i === 0 ? "rgba(255,209,102,.16)" : "rgba(255,255,255,.07)",
                border: i === 0 ? "1px solid rgba(255,209,102,.4)" : "1px solid transparent",
                borderRadius: 11, padding: "10px 4px", textAlign: "center",
              }}>
                <div style={{
                  fontSize: n && String(n).length > 4 ? 14 : 21,
                  fontWeight: 800, color: i === 0 ? "#ffd166" : "#fff",
                }}>{n}</div>
                <div style={{ fontSize: 8.5, opacity: 0.72, letterSpacing: 0.4, marginTop: 2 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== PETUNJUK SINGKAT ===== */}
        <div style={{
          background: "#fff", border: "1px solid #dbe2ee", borderRadius: 13,
          padding: "11px 15px", margin: "14px 0",
          fontSize: 12, color: "#4b5563", lineHeight: 1.6,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16, lineHeight: 1.2 }}>💡</span>
          <span>
            <strong>Cara pakai:</strong> minta murid membuka simulasi dari HP mereka sampai selesai,
            lalu tunjukkan halaman ini di depan kelas. Diskusikan satu per satu apa saja yang
            berhasil “dicuri” — tanpa mereka sadari.
          </span>
        </div>

        {/* ===== EMPTY STATE ===== */}
        {dataList.length === 0 && (
          <div style={{
            background: "#fff", border: "2px dashed #c7cfdd", borderRadius: 16,
            padding: "48px 26px", textAlign: "center", color: "#6b7280",
          }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              Belum ada jejak yang masuk
            </p>
            <p style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              Jalankan simulasi dari HP, setiap ketikan murid<br />
              akan muncul otomatis di sini dalam hitungan detik.
            </p>
          </div>
        )}

        {/* ===== SEKSI PER KATEGORI ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {SECTIONS.map((sec) => {
            const items = grouped[sec.key];
            if (!items?.length) return null;
            return (
              <section key={sec.key}>
                {/* Judul seksi */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, padding: "0 4px" }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: 10, background: `${sec.color}1c`,
                    border: `1px solid ${sec.color}55`, display: "inline-flex",
                    alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                  }}>{sec.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 15.5, fontWeight: 800, color: "#1f2937", lineHeight: 1.25 }}>
                      {sec.title}
                      <span style={{
                        marginLeft: 8, background: sec.color, color: "#fff",
                        fontSize: 11, fontWeight: 800, padding: "2px 9px",
                        borderRadius: 99, verticalAlign: "2px",
                      }}>{items.length}</span>
                    </h2>
                    <p style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{sec.desc}</p>
                  </div>
                </div>

                {/* Peringatan resiko */}
                <div style={{
                  background: sec.bg, border: `1px solid ${sec.color}30`,
                  borderLeft: `4px solid ${sec.color}`,
                  borderRadius: 11, padding: "10px 13px",
                  margin: "9px 0 11px", fontSize: 12, lineHeight: 1.65, color: "#374151",
                }}>
                  <strong style={{ color: sec.color }}>⚠️ Resikonya — </strong>
                  {sec.risk}
                </div>

                {/* Kartu item */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map((item, i) => (
                    <article key={item.id || i} style={{
                      background: "#fff", borderRadius: 13, padding: "14px 15px",
                      boxShadow: "0 1px 4px rgba(16,24,40,.06)",
                      border: "1px solid #e8ecf3", borderLeft: `4px solid ${sec.color}`,
                      animation: "slideUp .4s ease both",
                    }}>
                      {/* ---- ISI TIAP TIPE ---- */}
                      {sec.key === "pribadi" && (
                        <>
                          <Row icon="👤" label="" value={item.nama} />
                          {item.game && (
                            <Row icon="🎮" label="ID Game" value={`${item.game} — UID ${item.uid || "-"}${item.server ? ` / Server ${item.server}` : ""}`} />
                          )}
                          {item.wallet && (
                            <Row icon="💳" label="E-Wallet" value={`Nomor terdaftar ${item.wallet}`} />
                          )}
                          <Row icon="📱" label="No. HP" value={item.hp} />
                          {item.alamat && <Row icon="🏠" label="Alamat" value={item.alamat} />}
                          <Row icon="🎣" label="Umpan" value={item.prize} />
                        </>
                      )}

                      {sec.key === "registrasi" && (
                        <>
                          <Row icon="📧" label="Akun" value={item.identitas} />
                          <div style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 13.5, alignItems: "baseline" }}>
                            <span style={{ width: 18, textAlign: "center" }}>🔓</span>
                            <span style={{ color: "#6b7280", minWidth: 74 }}>Password</span>
                            <CodeChip size={13}>{item.password}</CodeChip>
                          </div>
                          <Row icon="📄" label="Lewat" value={item.metode === "daftar" ? "Halaman pendaftaran event" : "Halaman masuk"} />
                        </>
                      )}

                      {sec.key === "kredensial" && (
                        <>
                          {item.tipe === "login" && (
                            <>
                              <Row icon="🎮" label="Platform" value={`${item.platform} — ${item.username}`} />
                              <div style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 13.5, alignItems: "baseline" }}>
                                <span style={{ width: 18, textAlign: "center" }}>🔓</span>
                                <span style={{ color: "#6b7280", minWidth: 74 }}>Password</span>
                                <CodeChip size={13}>{item.password}</CodeChip>
                              </div>
                            </>
                          )}
                          {item.tipe === "otp" && (
                            <>
                              <Row icon="🚨" label="" value={`Kode OTP diserahkan (${item.tujuan})`} />
                              <div style={{ paddingLeft: 27, paddingTop: 4 }}>
                                <CodeChip size={16}>{item.kode}</CodeChip>
                              </div>
                            </>
                          )}
                          {item.tipe === "pin-ewallet" && (
                            <>
                              <Row icon="🚨" label="" value={`PIN ${item.wallet} terungkap`} />
                              {item.hp && <Row icon="📱" label="Nomor" value={item.hp} />}
                              <div style={{ paddingLeft: 27, paddingTop: 4 }}>
                                <CodeChip size={16}>••{item.pin}••</CodeChip>
                              </div>
                            </>
                          )}
                          {item.tipe === "bank" && (
                            <>
                              <Row icon="🏦" label="M-Banking" value={`${item.bank} — ${item.user}`} />
                              <div style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 13.5, alignItems: "baseline" }}>
                                <span style={{ width: 18, textAlign: "center" }}>🔓</span>
                                <span style={{ color: "#6b7280", minWidth: 74 }}>Password</span>
                                <CodeChip size={13}>{item.pass}</CodeChip>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {sec.key === "uang" && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: 19, fontWeight: 800, color: "#7c3aed" }}>
                              Rp {(item.jumlah || 0).toLocaleString("id-ID")}
                            </span>
                            <span style={{ fontSize: 11, background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#7c3aed", fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                              {item.metode}
                            </span>
                          </div>
                          <p style={{ fontSize: 12.5, color: "#4b5563", marginTop: 7, lineHeight: 1.6 }}>
                            Dibayarkan demi klaim <strong>{item.prize}</strong> yang tidak akan pernah dikirim.
                          </p>
                        </>
                      )}

                      {sec.key === "sebar" && (
                        <>
                          <Row icon="📤" label="Disebar ke" value={item.target} />
                          <Row icon="🐟" label="Umpannya" value={item.prize} />
                        </>
                      )}

                      <DeviceLine item={item} />
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ===== PENUTUP ===== */}
        {dataList.length > 0 && (
          <div style={{
            background: "linear-gradient(150deg,#14532d,#166534)",
            borderRadius: 16, padding: "18px 20px", marginTop: 22, color: "#dcfce7",
          }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 6 }}>
              🎓 Momen diskusi bersama murid
            </div>
            <ul style={{ fontSize: 12.5, lineHeight: 1.85, paddingLeft: 18, margin: 0, opacity: 0.95 }}>
              <li>Tanyakan: “Coba lihat password kalian di atas — merasa gimana?”</li>
              <li>Tekankan: hadiah asli <strong>tidak pernah</strong> minta OTP, PIN, atau bayaran.</li>
              <li>Ingatkan: sebelum klik link, cek alamat situsnya & tanya orang tua/guru dulu.</li>
            </ul>
          </div>
        )}

        {/* ===== TOMBOL ===== */}
        <div style={{ marginTop: 20, display: "flex", gap: 11 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              flex: 1.2, padding: 13, borderRadius: 11, border: "none",
              background: "#2563eb", color: "#fff", fontWeight: 700,
              cursor: "pointer", fontSize: 14.5,
            }}
          >
            ← Buka Simulasi
          </button>
          <button
            onClick={exportCSV}
            style={{
              flex: 1, padding: 13, borderRadius: 11,
              border: "1.5px solid #dbe2ee", background: "#fff", color: "#374151",
              fontWeight: 700, cursor: "pointer", fontSize: 14.5,
            }}
          >
            ⬇️ Ekspor CSV
          </button>
          <button
            onClick={clearData}
            style={{
              flex: 1, padding: 13, borderRadius: 11,
              border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626",
              fontWeight: 700, cursor: "pointer", fontSize: 14.5,
            }}
          >
            🗑️ Bersihkan
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 10.5, color: "#9ca3af", marginTop: 16, lineHeight: 1.7 }}>
          Panel khusus guru/edukator · Data tersimpan lokal di laptop ini<br />
          dan tidak pernah dikirim ke luar — aman untuk latihan berulang
        </p>
      </div>
    </div>
  );
};

export default DataCollection;
