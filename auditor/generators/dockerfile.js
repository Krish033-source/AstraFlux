import fs from "fs";
import path from "path";
import { writeIfMissing } from "../utils/fsx.js";

export async function ensureDockerfile(root, report) {
  const file = path.join(root, "Dockerfile");
  if (fs.existsSync(file)) {
    console.log("  ✓ Dockerfile exists");
    return;
  }
  const s = report.summary;
  let docker = "";

  if (s.containsNode && !s.containsPython) {
    docker = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production || true
COPY . .
EXPOSE 8080
CMD ["node","server.js"]
`;
  } else if (s.containsPython && !s.containsNode) {
    docker = `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt || true
COPY . .
EXPOSE 8000
CMD ["python","app.py"]
`;
  } else {
    docker = `# Hybrid Node + Python (adjust as needed)
FROM node:20-bullseye as node
WORKDIR /app
COPY package*.json ./
RUN npm install || true
COPY . .

FROM python:3.11-slim
WORKDIR /app
COPY --from=node /app /app
RUN [ -f requirements.txt ] && pip install -r requirements.txt || true
EXPOSE 8080
CMD ["node","server.js"]
`;
  }

  writeIfMissing(file, docker);
}
