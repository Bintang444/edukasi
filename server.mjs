import { createServer } from "http";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "submissions.json");
const DIST_DIR = path.join(process.cwd(), "dist");
const PORT = process.env.PORT || 3001;

async function readSubmissions() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function writeSubmissions(data) {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS biar aman diakses dari mana saja (LAN)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  // ===== API =====
  if (url.pathname === "/api/submissions") {
    if (req.method === "GET") {
      const data = await readSubmissions();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const item = JSON.parse(body);
          item.waktu = new Date().toLocaleString();
          item.id = Date.now();
          item.ua = req.headers["user-agent"] || "tidak diketahui";
          const all = await readSubmissions();
          all.push(item);
          await writeSubmissions(all);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false }));
        }
      });
      return;
    }

    if (req.method === "DELETE") {
      await writeSubmissions([]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
  }

  // ===== Static files (production build) =====
  let filePath = path.join(DIST_DIR, url.pathname === "/" ? "index.html" : url.pathname);
  if (!filePath.startsWith(DIST_DIR)) filePath = path.join(DIST_DIR, "index.html");
  if (!existsSync(filePath)) filePath = path.join(DIST_DIR, "index.html");

  if (existsSync(filePath)) {
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(await readFile(filePath));
  } else {
    res.writeHead(404);
    res.end("Not Found — jalankan 'npm run build' dulu untuk mode produksi.");
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
});
