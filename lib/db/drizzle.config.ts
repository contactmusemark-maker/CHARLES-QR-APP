import "dotenv/config";

import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  // When running `pnpm --filter @workspace/db run push`, CWD is `lib/db`.
  // This loads the workspace root `.env`.
  path.resolve(process.cwd(), "../../.env"),
];

let loadedEnvFile: string | undefined;
for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    loadedEnvFile = candidate;
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const existing = envCandidates.filter((p) => fs.existsSync(p));
  throw new Error(
    [
      "DATABASE_URL is undefined.",
      `dotenv loaded: ${loadedEnvFile ?? "(default dotenv/config search)"};`,
      `checked: ${envCandidates.join(", ")};`,
      existing.length ? `found: ${existing.join(", ")};` : "found: none;",
      "ensure DATABASE_URL exists in the workspace root `.env`.",
    ].join(" ")
  );
}

if (databaseUrl.includes("<project-ref>") || databaseUrl.includes("<url-encoded-password>")) {
  throw new Error(
    [
      "DATABASE_URL looks like a placeholder value.",
      `dotenv loaded: ${loadedEnvFile ?? "(default dotenv/config search)"};`,
      "paste your real Supabase Postgres connection string into the workspace root `.env`.",
    ].join(" ")
  );
}

const parsed = new URL(databaseUrl);
const dbHost = parsed.hostname;
const dbPort = parsed.port ? Number(parsed.port) : 5432;
const dbName = parsed.pathname.replace(/^\//, "") || "postgres";
const dbUser = decodeURIComponent(parsed.username);
let dbPassword = decodeURIComponent(parsed.password);

// Common mistake: copying Supabase docs placeholders (e.g. `[YOUR-PASSWORD]`) literally.
if (dbPassword.startsWith("[") && dbPassword.endsWith("]")) {
  dbPassword = dbPassword.slice(1, -1);
}

export default defineConfig({
  schema: path.resolve(process.cwd(), "src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    // Supabase poolers require TLS. This works in Node's `pg` driver.
    ssl: { rejectUnauthorized: false },
  },
});
