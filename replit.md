# Charles — Office Mood Check-In

A premium emotionally intelligent office mood check-in system powered by a bonsai mascot. Employees scan a QR code to log their daily mood; admins see a live wellness dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/charles run dev` — run the frontend (port 21716)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + shadcn/ui + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/checkins.ts` — checkins table schema
- `artifacts/charles/src/` — React frontend (pages, components, context)
- `artifacts/api-server/src/routes/checkins.ts` — check-in API routes

## Architecture decisions

- Frontend is fully frontend-only for the mood flow — state managed in React context (EmployeeContext)
- Admin access is controlled by a simple credential check (CCE001/WILLIAM) with no server-side auth — intentional for kiosk simplicity
- All check-ins are stored in PostgreSQL via Drizzle ORM
- Wellness score is computed server-side from mood weights + stress penalty
- QR code destination: root URL `/` → employee identification screen

## Product

- **Employee flow**: Scan QR → enter name/ID → select mood → adjust energy/focus/stress sliders → add tags/note → see success page with motivational quote
- **Admin flow**: Enter CCE001/WILLIAM → instant redirect to live analytics dashboard with mood charts, burnout risk indicators, wellness score, 7-day trends

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Admin check is case-insensitive for both Employee ID and Name
- The `@assets` Vite alias resolves to `attached_assets/` at the monorepo root (bonsai PNGs)
- Always re-run codegen after changing `lib/api-spec/openapi.yaml`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
