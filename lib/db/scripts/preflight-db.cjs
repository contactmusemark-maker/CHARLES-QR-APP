/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const { Client } = require("pg");

const cwd = process.cwd();
const envCandidates = [
  path.resolve(cwd, ".env"),
  // When running via `pnpm --filter @workspace/db ...`, CWD is `lib/db`.
  path.resolve(cwd, "../../.env"),
];

let loadedEnvFile;
for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    loadedEnvFile = candidate;
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    [
      "DATABASE_URL is undefined.",
      `dotenv loaded: ${loadedEnvFile ?? "(none found)"};`,
      `checked: ${envCandidates.join(", ")};`,
    ].join(" ")
  );
  process.exit(1);
}

if (databaseUrl.includes("<project-ref>") || databaseUrl.includes("<url-encoded-password>")) {
  console.error(
    [
      "DATABASE_URL looks like a placeholder value.",
      `dotenv loaded: ${loadedEnvFile ?? "(none found)"};`,
      "Paste your real Supabase Postgres connection string into the workspace root `.env`.",
    ].join(" ")
  );
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(databaseUrl);
} catch (e) {
  console.error(
    [
      "DATABASE_URL is not a valid URL.",
      `dotenv loaded: ${loadedEnvFile ?? "(none found)"};`,
      `value: ${databaseUrl}`,
    ].join(" ")
  );
  process.exit(1);
}

const host = parsed.hostname;
const port = parsed.port ? Number(parsed.port) : 5432;
const database = parsed.pathname.replace(/^\//, "") || "postgres";
const user = decodeURIComponent(parsed.username || "");
let password = decodeURIComponent(parsed.password || "");

if (password.startsWith("[") && password.endsWith("]")) {
  console.warn(
    "Warning: DATABASE_URL password is wrapped in `[...]` — removing brackets (common copy/paste from docs)."
  );
  password = password.slice(1, -1);
}

if (!user || !password) {
  console.error(
    [
      "DATABASE_URL is missing username or password.",
      `dotenv loaded: ${loadedEnvFile ?? "(none found)"};`,
    ].join(" ")
  );
  process.exit(1);
}

const timeoutMs = 10_000;
const timer = setTimeout(() => {
  console.error(
    [
      `Timed out connecting to Postgres after ${timeoutMs}ms.`,
      `host=${host} port=${port} db=${database} user=${user};`,
      "Double-check you copied the correct Supabase connection string (Transaction pooler / port 6543) and your network allows outbound connections.",
    ].join(" ")
  );
  process.exit(1);
}, timeoutMs);

(async () => {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("select 1");
    console.log(`Preflight OK: connected to ${host}:${port}/${database} as ${user}`);
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.error(
      [
        "Preflight FAILED: could not connect to Postgres.",
        `dotenv loaded: ${loadedEnvFile ?? "(none found)"};`,
        `host=${host} port=${port} db=${database} user=${user};`,
        `error=${message};`,
        "If your Supabase DB password contains special characters (like @, :, [, ]), URL-encode it in `.env`.",
        "Or reset the DB password in Supabase Dashboard → Settings → Database and update `.env`.",
      ].join(" ")
    );
    process.exitCode = 1;
  } finally {
    clearTimeout(timer);
    try {
      await client.end();
    } catch {}
  }
})().catch((e) => {
  clearTimeout(timer);
  console.error(e && e.stack ? e.stack : String(e));
  process.exit(1);
});

