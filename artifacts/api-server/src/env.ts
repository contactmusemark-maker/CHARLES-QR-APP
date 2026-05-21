import fs from "node:fs";
import path from "node:path";

// Load workspace root `.env` for local development.
// On Replit/production, env vars come from Secrets and this file may not exist.
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    process.loadEnvFile(candidate);
    break;
  }
}

