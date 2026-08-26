# 🎣 Simulasi Edukasi: "Kenali Web Penipuan Hadiah"

Simulasi web phishing hadiah (spin wheel → menang → klaim) untuk mengajarkan
anak-anak SD berhati-hati terhadap link penipuan. **Semua data hanya tersimpan
lokal di laptop** dan tidak pernah dikirim ke internet.

## 🚀 Cara Menjalankan

### Mode Sesi (paling simpel, 1 proses)
```bash
npm install        # sekali saja di awal
npm run build      # setiap kali ada perubahan kode
npm start          # server jalan di port 3001
```

- Laptop : buka `http://localhost:3001`
- HP murid (satu WiFi): buka `http://<IP-laptop>:3001` — IP tampil saat server start

### 📶 Setup Tanpa Internet (rekomendasi untuk pengajian)
1. Nyalakan **hotspot dari laptop** (atau HP kedua).
2. Hubungkan HP murid ke hotspot tersebut — internet pun tidak perlu aktif.
3. Di laptop, buka `http://<IP-laptop>:3001/qr` lalu **proyeksikan QR-nya**.
4. Murid scan QR → simulasi langsung terbuka di HP mereka.
5. Semua data tetap mengalir ke laptop guru secara realtime.

### Mode Ngoding (frontend auto-reload)
```bash
npm run dev        # terminal 1 — frontend di port 5173
npm run server     # terminal 2 — API di port 3001
```

## 🔐 Panel Guru (`/data`)

Halaman khusus untuk melihat semua jejak yang "dicuri" dari simulasi.
PIN default: **1234** (bisa diubah di `src/components/DataCollection.jsx`, cari `=== "1234"`).
Tersedia tombol **📲 QR untuk Murid** (buka `/qr` untuk diproyeksikan), **Ekspor CSV**, dan **Bersihkan Data**.

Isi panel:
| Kategori | Isi |
|---|---|
| 📇 Identitas | Nama, HP, alamat, UID game |
| 🧾 Password | Akun palsu yang dibuat murid sebelum spin |
| 🔑 Kredensial | Password game, PIN e-wallet, OTP, login m-banking |
| 💸 Uang | "Ongkir/biaya admin" yang dibayarkan |
| 📣 Sebar | Berapa kali link "disebarkan" |

Tersedia tombol **Ekspor CSV**, **Bersihkan Data** (reset antar sesi), dan auto-refresh 3 detik.

## 🎭 Alur Simulasi

```
Landing clickbait → Daftar akun → Spin roda (12 hadiah acak)
→ Halaman menang + timer 15:00 → Formulir (menyesuaikan hadiah:
   UID game / nomor pulsa / e-wallet / alamat pengiriman)
→ CAPTCHA palsu (gagal 1-2x) → Share ke 3 grup
→ Verifikasi akhir sesuai hadiah:
   - Game   → login Moonton/Google/FB palsu
   - Pulsa  → halaman OTP palsu
   - E-wallet → halaman PIN DANA/GoPay palsu
   - Fisik  → bayar "ongkir" → myBCA/DANA/pulsa palsu
→ Lacak paket palsu (hadiah fisik) → kembali ke beranda
```

## 🛠️ Teknologi

- React + Vite (frontend)
- Server Node murni tanpa dependency (`server.mjs`) — serve statis + API JSON
- Penyimpanan: file `submissions.json`
- Efek suara: Web Audio API (tanpa file audio)

## 🌐 Deploy Online (biar kelihatan web asli)

Simulasi bisa di-hosting gratis supaya murid membuka **link internet beneran**
(tidak perlu satu WiFi lagi). Arsitektur: frontend statis di **Vercel** +
database realtime gratis di **Firebase**.

### Langkah 1 — Siapkan Firebase (±5 menit)
1. Buka https://console.firebase.google.com → **Add project** (lewati Google Analytics).
2. Menu **Build → Realtime Database → Create Database** → pilih lokasi terdekat (Singapore) → mode *Locked* → Start.
3. Tab **Rules** → ganti isinya jadi:
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
   → Publish. *(Terbuka memang — datanya cuma simulasi, bukan data asli.)*
4. Salin URL database di tab Data, bentuknya:
   `https://nama-proyek-default-rtdb.asia-southeast1.firebasedatabase.app`

### Langkah 2 — Pasang URL database
```bash
cp .env.example .env
# edit .env, isi VITE_FB_DB_URL dengan URL tadi
```
> Untuk Vercel, variabel yang sama juga harus ditambahkan di
> Project Settings → Environment Variables (`VITE_FB_DB_URL`).

### Langkah 3 — Deploy ke Vercel (pilih salah satu)

**Cara A — lewat GitHub (disarankan):**
```bash
git init && git add -A && git commit -m "simulasi edukasi"
# buat repo baru di github.com lalu:
git remote add origin https://github.com/USERNAME/edukasi-penipuan.git
git push -u origin main
```
Lalu di https://vercel.com → **Add New Project** → import repo tersebut →
tambahkan env `VITE_FB_DB_URL` → **Deploy**. Selesai: `https://namamu.vercel.app`

**Cara B — lewat CLI:**
```bash
npm i -g vercel
vercel          # ikuti pertanyaan, jawab default
vercel --prod
```

### Setelah online
- Bagikan link ke grup WA — preview-nya sudah clickbait 🎁
- Panel guru tetap di `/data` (PIN 1234), kini bisa dibuka dari mana saja
- Mode hotspot LAN tanpa internet **tetap berfungsi** — biarkan `.env` kosong

## ⚠️ Catatan Etis

Gunakan **hanya** untuk edukasi. Selalu beri tahu murid sebelum sesi berakhir
bahwa ini simulasi, lalu gunakan panel guru untuk diskusi. Jangan pernah
memasukkan data asli (password sungguhan, nomor rekening, dll).
