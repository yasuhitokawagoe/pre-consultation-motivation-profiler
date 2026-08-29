import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL("./public/", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
const port = Number(process.env.APP_PORT || 3000);

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const file = normalize(join(root, requested));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "cache-control": extname(file) === ".html" ? "no-cache" : "public, max-age=86400" });
    res.end(body);
  } catch {
    try {
      const fallback = await readFile(join(root, "index.html"));
      if (!res.headersSent) res.writeHead(200, { "content-type": types[".html"] });
      if (!res.writableEnded) res.end(fallback);
    } catch {
      if (!res.headersSent) res.writeHead(404);
      if (!res.writableEnded) res.end("Not found");
    }
  }
}).listen(port, "0.0.0.0", () => console.log(`Profiler listening on ${port}`));
