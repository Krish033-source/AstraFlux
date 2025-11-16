import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeLog } from "./analyzers/ruleBased.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const events = [];
const clients = new Set();
const MAX_EVENTS = 300;

function pushEvent(evt) {
  events.push(evt);
  if (events.length > MAX_EVENTS) events.shift();
  const payload = `data: ${JSON.stringify(evt)}\n\n`;
  for (const res of clients) res.write(payload);
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "astra-flux-demo" }));

app.post("/log", (req, res) => {
  const log = {
    ts: new Date().toISOString(),
    level: req.body.level || "error",
    message: req.body.message || "Unknown error",
    stack: req.body.stack || "",
    meta: req.body.meta || {}
  };
  pushEvent({ type: "log", log });
  const rca = analyzeLog(log);
  pushEvent({ type: "rca", rca, link: { message: log.message, ts: log.ts } });
  res.json({ ok: true });
});

app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  for (const evt of events) res.write(`data: ${JSON.stringify(evt)}\n\n`);
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

app.use("/", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ AstraFlux running:  http://localhost:${PORT}`);
  console.log(`🔁 SSE /stream | 🔔 POST /log`);
});
