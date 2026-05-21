# Supabase Production Setup — Charles App

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `charles-mood`), a strong database password, and a region closest to your users
3. Wait ~2 minutes for the project to spin up

---

## Step 2 — Get Your Connection String

In your Supabase project:

1. Go to **Settings → Database**
2. Scroll to **Connection string**
3. Choose **Transaction** (URI tab) — this uses port `6543` (pooler mode, best for short-lived API connections)
4. Copy the string — it looks like:

```
postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Replace `[YOUR-PASSWORD]` with the password you set in Step 1.
If your password contains special characters (like `@`, `:`, `[`, `]`), make sure to URL-encode it before pasting (for example `@` → `%40`).

---

## Step 3 — Set the Environment Variable

### On Replit
1. Open **Secrets** (lock icon in the sidebar)
2. Find `DATABASE_URL` → replace with your Supabase URI
3. The app will automatically reconnect on next restart

### Locally (VSCode)
Edit your `.env` file:
```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SESSION_SECRET=your-long-random-secret
```

Note: the square brackets in examples are placeholders — do not include `[` or `]` in your actual URL unless they are part of your real password (and then they must be URL-encoded).

---

## Step 4 — Push the Schema

Run once to create the `checkins` table in Supabase:

```bash
pnpm --filter @workspace/db run push
```

This uses Drizzle Kit to sync your schema to the Supabase Postgres database.

---

## Step 5 — Apply RLS Policies (Security)

1. In Supabase Dashboard → **SQL Editor** → **New Query**
2. Paste the entire contents of `scripts/supabase-setup.sql`
3. Click **Run**

You'll see a confirmation table at the bottom showing:
- `rls_enabled = true`
- All 4 policies listed

---

## Step 6 — Deploy

### Replit (recommended)
Click **Publish** in the Replit interface. The app will be live at your `.replit.app` domain.

### Local / Self-hosted
```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/charles run dev
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | Supabase PostgreSQL connection string (Transaction pooler) |
| `SESSION_SECRET` | ✅ Yes | Random string for session signing (run `openssl rand -base64 32`) |

---

## Security Notes

| What | How it's protected |
|---|---|
| Check-in data | RLS enabled — service role key only via API server |
| Admin dashboard | Employee ID `CCE001` + name `WILLIAM` (case-insensitive) |
| No passwords stored | No auth table — admin check is server-side only |
| Data retention | Optional auto-archive via pg_cron (see SQL script) |

---

## Useful Supabase Dashboard Links

- **Table Editor** — view all check-ins live
- **SQL Editor** — run custom queries / reports  
- **Logs → Postgres** — debug slow queries
- **Reports** — see database size, connections, cache hit rate
