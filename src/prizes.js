// Konfigurasi semua hadiah — dipakai SpinWheel, Result, dan Form biar konsisten
export const PRIZES = [
  { label: "Pulsa 20rb", color: "#1f7a4d", type: "pulsa" },
  { label: "86 Diamonds", color: "#0e7490", type: "game" },
  { label: "Kuota 15GB", color: "#065f46", type: "pulsa" },
  { label: "Saldo DANA 50rb", color: "#118eea", type: "ewallet", wallet: "DANA" },
  { label: "Skin Epic", color: "#7c3aed", type: "game" },
  { label: "GoPay 150rb", color: "#0ea5a2", type: "ewallet", wallet: "GoPay" },
  { label: "Pulsa 100rb", color: "#15803d", type: "pulsa" },
  { label: "1075 Diamonds", color: "#c2820a", type: "game" },
  { label: "Smart TV 32\"", color: "#334155", type: "fisik" },
  { label: "Skin Legendary", color: "#9d174d", type: "game" },
  { label: "Laptop Gaming", color: "#4338ca", type: "fisik" },
  { label: "FREE Handphone", color: "#b91c1c", type: "fisik" },
];

export const SEG = 360 / PRIZES.length;

export const getPrize = (label) =>
  PRIZES.find((p) => p.label === label) || { label: label || "Hadiah", type: "fisik" };

export const TYPE_INFO = {
  game: {
    icon: "💎",
    delivery: "Dikirim langsung ke ID game via sistem top-up otomatis",
    claimText: "KLAIM KE AKUN GAME",
  },
  pulsa: {
    icon: "📡",
    delivery: "Masuk otomatis ke nomor HP tujuan dalam 1-5 menit",
    claimText: "TERIMA DI NOMOR HP",
  },
  ewallet: {
    icon: "💸",
    delivery: "Transfer instan ke nomor e-wallet terdaftar",
    claimText: "TERIMA DI E-WALLET",
  },
  fisik: {
    icon: "📦",
    delivery: "Diantar kurir ke alamatmu — gratis ongkir",
    claimText: "ISI ALAMAT PENGIRIMAN",
  },
};
