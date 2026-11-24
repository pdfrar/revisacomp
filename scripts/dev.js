// Servidor local para ver o site gerado em dist/ (como na Vercel, com URLs sem .html).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT || 3000);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon" };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]).replace(/\/+$/, "") || "/";
  const base = path.join(DIST, path.normalize(url).replace(/^(\.\.[/\\])+/, ""));
  const tries = url === "/" ? [path.join(DIST, "index.html")] : [base, base + ".html", path.join(base, "index.html")];
  const file = tries.find((f) => f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile());
  if (!file) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Página não encontrada"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Site em http://localhost:${PORT}  (Ctrl+C para parar)`));
