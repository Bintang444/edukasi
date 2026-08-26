// Adapter penyimpanan otomatis:
// - Kalau VITE_FB_DB_URL diset (mode online/deploy) → simpan ke Firebase Realtime DB
// - Kalau tidak → pakai server lokal /api/submissions (npm run server)
// - Fallback terakhir → localStorage (perangkat itu saja)

const FB = (import.meta.env.VITE_FB_DB_URL || "").replace(/\/$/, "");

export async function sendSubmission(payload) {
  const item = {
    ...payload,
    id: Date.now() + Math.floor(Math.random() * 999),
    ts: Date.now(),
    waktu: new Date().toLocaleString(),
  };

  // 1) Mode online (Firebase)
  if (FB) {
    try {
      const r = await fetch(`${FB}/submissions.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (r.ok) return;
    } catch {}
  }

  // 2) Server lokal (development / hotspot LAN)
  try {
    const r = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (r.ok) return;
  } catch {}

  // 3) Fallback terakhir
  let all = [];
  const saved = localStorage.getItem("edukasi_data");
  if (saved) all = JSON.parse(saved);
  all.push(item);
  localStorage.setItem("edukasi_data", JSON.stringify(all));
}

export async function getSubmissions() {
  // 1) Mode online
  if (FB) {
    try {
      const r = await fetch(`${FB}/submissions.json`);
      const obj = await r.json();
      if (obj) {
        return Object.values(obj).sort((a, b) => (a.ts || 0) - (b.ts || 0));
      }
    } catch {}
  }

  // 2) Server lokal
  try {
    const r = await fetch("/api/submissions");
    if (r.ok) return await r.json();
  } catch {}

  // 3) Fallback
  const saved = localStorage.getItem("edukasi_data");
  return saved ? JSON.parse(saved) : [];
}

export async function clearSubmissions() {
  if (FB) {
    try {
      await fetch(`${FB}/submissions.json`, { method: "PUT", body: "null" });
    } catch {}
  }
  try {
    await fetch("/api/submissions", { method: "DELETE" });
  } catch {}
  localStorage.removeItem("edukasi_data");
}
