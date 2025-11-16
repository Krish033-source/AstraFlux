#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { scanRepo } from "./scanner.js";
import { writeIfMissing } from "./utils/fsx.js";
import { generateReadme } from "./generators/readme.js";
import { ensureRequirements } from "./generators/requirements.js";
import { ensureDockerfile } from "./generators/dockerfile.js";
import { ensureGitignore } from "./generators/gitignore.js";
import { ensureWorkflow } from "./generators/workflow.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = path.resolve(process.argv[2] || ".");
if (!fs.existsSync(target)) {
  console.error("Path not found:", target);
  process.exit(1);
}

console.log("🔎 Scanning repo:", target);
const report = await scanRepo(target);
console.log("📋 Detected:", report.summary);

console.log("📝 Generating/Ensuring: README.md");
const readme = generateReadme(report);
writeIfMissing(path.join(target, "README.md"), readme);

if (report.summary.containsPython) {
  console.log("📦 Ensuring requirements.txt (Python)");
  await ensureRequirements(target, report);
}

console.log("🐋 Ensuring Dockerfile");
await ensureDockerfile(target, report);

console.log("🙈 Ensuring .gitignore");
await ensureGitignore(target, report);

console.log("⚙️  Ensuring GitHub Actions CI");
await ensureWorkflow(target, report);

console.log("\n✅ Repo GitHub-ready! Files ensured/created where missing.");
console.log("   Next: git init && git add . && git commit -m \"init\" && git push …");
