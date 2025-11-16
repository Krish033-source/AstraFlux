// Use in Node or browser to send errors to AstraFlux.
const COLLECTOR_URL = process.env.ASTRAFLUX_URL || "http://localhost:8080/log";

export async function logError(err, meta = {}) {
  try {
    const payload = {
      level: "error",
      message: err?.message || String(err),
      stack: err?.stack || "",
      meta
    };
    await fetch(COLLECTOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // ignore
  }
}
