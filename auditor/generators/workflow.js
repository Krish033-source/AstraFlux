import fs from "fs";
import path from "path";
import { ensureDir, writeFile } from "../utils/fsx.js";

export async function ensureWorkflow(root, report) {
  const dir = path.join(root, ".github", "workflows");
  ensureDir(dir);
  const file = path.join(dir, "ci.yml");

  if (fs.existsSync(file)) {
    console.log("  ✓ workflow exists");
    return;
  }

  const s = report.summary;
  const nodeJob = s.containsNode ? `
  node:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci || npm install
      - run: node -v
` : "";

  const pyJob = s.containsPython ? `
  python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: |
          python -m venv .venv
          source .venv/bin/activate
          pip install -r requirements.txt || true
      - run: python --version
` : "";

  const yml = `name: CI
on: [push, pull_request]
jobs:${nodeJob}${pyJob}
`;

  writeFile(file, yml);
  console.log("  ➕ created GitHub Actions workflow");
}
