import path from "path";
import { writeIfMissing } from "../utils/fsx.js";

export async function ensureGitignore(root, report) {
  const file = path.join(root, ".gitignore");
  const content = `node_modules
npm-debug.log*
pnpm-lock.yaml
yarn.lock
.DS_Store
.env
.venv
__pycache__/
dist/
build/
coverage/
`;
  writeIfMissing(file, content);
}
