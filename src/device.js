// Deteksi perangkat sisi klien — model HP dari UA Android + heuristik layar untuk iPhone
const BRANDS = [
  [/^SM-/i, "Samsung"],
  [/^SC[G]/i, "Samsung"],
  [/^CPH/i, "OPPO"],
  [/^RMX/i, "Realme"],
  [/^(Redmi|M2\d{3}|2\d{4})/i, "Xiaomi Redmi"],
  [/^POCO/i, "POCO"],
  [/^23\d{4}/i, "Xiaomi"],
  [/^vivo\s?V?\d*/i, "vivo"],
  [/^V2\d{3}/i, "vivo"],
  [/^(Infinix|X6\d{3})/i, "Infinix"],
  [/^itel/i, "Itel"],
  [/^Nokia/i, "Nokia"],
  [/^TECNO/i, "Tecno"],
  [/^AD/i, "Advan"],
];

// Heuristik iPhone berdasarkan ukuran layar (CSS pixel)
const IPHONES = [
  [[320, 568], "iPhone 5/SE Gen 1"],
  [[375, 667], "iPhone 6/7/8 atau SE 2020"],
  [[414, 736], "iPhone 6+/7+/8+ Plus"],
  [[375, 812], "iPhone X/XS/11 Pro/12 Mini/13 Mini"],
  [[414, 896], "iPhone XR/XS Max/11/11 Pro Max"],
  [[390, 844], "iPhone 12/12 Pro/13/13 Pro/14"],
  [[393, 852], "iPhone 14 Pro/15/15 Pro"],
  [[428, 926], "iPhone 12 Pro Max/13 Pro Max/14 Plus"],
  [[430, 932], "iPhone 14 Pro Max/15 Plus/15 Pro Max"],
];

export function detectDevice() {
  const ua = navigator.userAgent;
  let browser = "Browser tidak dikenal";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) browser = "Internet Samsung";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  try {
    if (/Android/i.test(ua)) {
      let model = "";
      const m = ua.match(/Android[^;)]*;\s*([^;)]+?)\s*(?:Build\/|\))/i);
      if (m) model = m[1].replace(/\s+/g, " ").trim();
      if (model && !/^wv$/i.test(model)) {
        for (const [re, brand] of BRANDS) {
          if (re.test(model)) return `${brand} ${model} · ${browser}`;
        }
        return `${model} · ${browser}`;
      }
      return `HP Android · ${browser}`;
    }

    if (/iPhone|iPad|iPod/i.test(ua)) {
      const w = Math.min(window.screen.width, window.screen.height);
      const h = Math.max(window.screen.width, window.screen.height);
      let model = "iPhone";
      for (const [[mw, mh], name] of IPHONES) {
        if (Math.abs(w - mw) <= 2 && Math.abs(h - mh) <= 2) {
          model = name.includes("/") ? name.split("/")[0] : name;
          break;
        }
      }
      return `${model} · ${browser}`;
    }

    if (/Windows/i.test(ua)) return `PC Windows · ${browser}`;
    if (/Macintosh/i.test(ua)) return `MacBook/iMac · ${browser}`;
  } catch {}

  return `Perangkat tidak dikenal · ${browser}`;
}
