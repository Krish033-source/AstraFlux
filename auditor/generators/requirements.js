import fs from "fs";
import path from "path";
import { writeIfMissing, writeFile } from "../utils/fsx.js";

export async function ensureRequirements(root, report) {
  const file = path.join(root, "requirements.txt");
  if (fs.existsSync(file)) {
    console.log("  ✓ requirements.txt exists");
    return;
  }
  // naive mapping; most pip packages match top-level import
  const pkgs = dedupe(report.pythonImports).sort();
  const body = pkgs.length ? pkgs.join("\n") + "\n" : "# add your python deps here\n";
  writeFile(file, body);
  console.log("  ➕ created requirements.txt (from imports)");
}

function dedupe(arr){ return Array.from(new Set(arr)); }
