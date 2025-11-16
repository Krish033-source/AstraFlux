import fs from "fs";
import path from "path";

const IGNORES = ["node_modules", ".git", ".venv", "__pycache__", "dist", "build"];

export async function scanRepo(root) {
  const files = [];
  walk(root, files);

  const byExt = countByExt(files);
  const containsNode = files.includes(path.join(root, "package.json"));
  const containsPy   = files.some(f => f.endsWith(".py"));
  const containsReq  = files.includes(path.join(root, "requirements.txt"));
  const containsPJT  = files.includes(path.join(root, "pyproject.toml"));
  const containsNext = files.includes(path.join(root, "next.config.js")) || files.find(f => f.endsWith("next.config.mjs"));
  const containsReact = byExt[".jsx"] || byExt[".tsx"];
  const containsDockerfile = files.includes(path.join(root, "Dockerfile"));

  const summary = {
    containsNode,
    containsPython: containsPy || containsReq || containsPJT,
    containsDockerfile,
    containsNext,
    containsReact: !!containsReact,
    byExt
  };

  const pkg = containsNode ? safeJson(path.join(root, "package.json")) : null;

  // naive import scan for Python deps
  const pythonImports = summary.containsPython ? findPythonImports(root) : [];

  return { root, files, summary, pkg, pythonImports };
}

function walk(dir, out) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of ents) {
    if (IGNORES.includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
}

function countByExt(files) {
  const acc = {};
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!ext) continue;
    acc[ext] = (acc[ext] || 0) + 1;
  }
  return acc;
}

function safeJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch { return null; }
}

function findPythonImports(root) {
  const imports = new Set();
  walkPy(root, imports);
  return Array.from(imports);
}

function walkPy(dir, set) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of ents) {
    if (IGNORES.includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkPy(p, set);
    else if (p.endsWith(".py")) {
      const src = fs.readFileSync(p, "utf-8");
      const lines = src.split(/\r?\n/);
      for (const line of lines) {
        const m1 = line.match(/^\s*import\s+([a-zA-Z0-9_]+)/);
        const m2 = line.match(/^\s*from\s+([a-zA-Z0-9_]+)\s+import/);
        const name = (m1?.[1] || m2?.[1]);
        if (name && !isStdLib(name)) set.add(name);
      }
    }
  }
}

// very rough stdlib filter; keeps common third-party names
function isStdLib(name) {
  const std = new Set(["os","sys","json","re","math","time","datetime","pathlib","itertools","subprocess","typing","logging","functools","collections","random","uuid"]);
  return std.has(name);
}
