import fs from "fs";
import path from "path";

export function writeIfMissing(file, content) {
  if (!fs.existsSync(file)) {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, content);
    console.log("  ➕ created", path.relative(process.cwd(), file));
  } else {
    console.log("  ✓ exists", path.relative(process.cwd(), file));
  }
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}
