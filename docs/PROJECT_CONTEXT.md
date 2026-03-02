# PROJECT_CONTEXT (Ray Marketplace)

## Purpose
This file is the **single source of truth** for the current state of the project.
Use it to avoid re-scanning the repo every time.

Update this file whenever you:
- deploy to a new environment
- change environment variables
- change run/build commands
- introduce a new major module

## Current Status
- **State**: Deployed and working ✅ (per team)
- **Phase**: Active development

### Production URLs (fill in)
- **Frontend (Vercel?)**: https://mnmknk.com/
- **Backend API (Railway/Docker?)**: https://ray-eg-production.up.railway.app
- **Database (Postgres provider)**: <UNKNOWN - PLEASE CONFIRM>

---

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + Prisma
- **Database**: PostgreSQL (default schema: `prisma/schema.prisma`)
- **Redis**: optional (present in docker dev setup; module currently disabled in backend)
- **AI**: Google Gemini (`@google/genai`)

---

## Repository Layout (high level)
- `backend/`:
  - NestJS app entry: `backend/main.ts`
  - App module: `backend/app.module.ts`
  - TypeScript config: `backend/tsconfig.json`
- `prisma/`:
  - Primary Prisma schema: `prisma/schema.prisma`
  - Alternate Postgres copy: `prisma/schema.postgres.prisma`
- `backend/prisma/`:
  - Legacy SQLite schema (experimental): `backend/prisma/schema.prisma`
- `services/config.service.ts`:
  - Frontend-side config helper using `import.meta.env`
- `DEPLOYMENT.md`:
  - Detailed deployment guide (Docker/manual)
- `vercel.json`:
  - SPA rewrite rules to route all paths to `index.html`

---

## How to Run Locally
### Install
```bash
npm install
```

### Environment Variables
- Copy `.env.example` to `.env.local` (recommended locally) or `.env`.
- **Important**: `.env`, `.env.local`, and `.env.*` are gitignored.

Example (see `.env.example`):
- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY` (backend)
- `VITE_GEMINI_API_KEY` (frontend alt name; supported)
- `VITE_BACKEND_URL` (frontend -> backend)
- `CORS_ORIGIN` (backend CORS)
- `FRONTEND_APP_URL` / `FRONTEND_URL` (backend redirects / CORS configuration fallback)

### Database (Prisma)
```bash
npm run prisma:generate
npm run prisma:push
```

### Run Backend (dev)
```bash
npm run backend:dev
```

### Run Frontend (dev)
```bash
npm run dev
```

---

## Key NPM Scripts
From `package.json`:
- `dev`: Vite dev server
- `backend:dev`: NestJS dev (via `tsx watch`)
- `backend:build`: build backend to `dist/`
- `backend:start`: push prisma schema then run `dist/main.js`
- `build`: builds frontend
- `vercel-build`: backend build + frontend build

---

## Backend Notes (NestJS)
### Config loading
`backend/app.module.ts` loads env in this order:
- `.env`
- `.env.{NODE_ENV}`
- `.env.local`
- `.env.{NODE_ENV}.local`

### CORS behavior
`backend/main.ts` allows:
- localhost origins by default
- configured origins via `CORS_ORIGIN` or `FRONTEND_URL` or `FRONTEND_APP_URL`
- in production, if no allowed origins configured, it has a fallback that allows `*.vercel.app` origins

### Trust Proxy
Backend sets `trust proxy` when:
- `TRUST_PROXY=true`, or
- `RAILWAY_ENVIRONMENT` is present

---

## Frontend Notes (Vite)
- Vite reads env via `loadEnv(mode, '.', '')`.
- `VITE_PORT` or `PORT` controls the dev port.

### SPA Routing / 404 on refresh
If hosting static output, you must rewrite routes to `index.html`.
- `vercel.json` already rewrites `/(.*)` to `/index.html`.
- Alternative: set `VITE_ROUTER_MODE=hash` if you deploy somewhere without rewrites.

---

## Docker (Dev)
- Dev compose: `docker-compose.dev.yml`
  - `redis` service on `6379`
  - `app` service exposes `3000` and runs `npm run dev`

---

## Monitoring / Health
`DEPLOYMENT.md` references:
- `/monitoring/health`
- `/monitoring/metrics`
- `/monitoring/dashboard`

---

## Production Secrets Policy
- Never commit any `.env*` files.
- Configure deploy-time secrets using the hosting platform **Environment Variables**.

---

## Admin Bootstrap (Production)
There is a secure production initialization endpoint:
- `POST /api/v1/auth/bootstrap-admin`
- guarded by `ADMIN_BOOTSTRAP_TOKEN`

Behavior notes:
- intended as one-time by default in production
- can optionally allow reset via `ADMIN_BOOTSTRAP_ALLOW_RESET=true`

---

## Change Log (manual)
- 2026-01-26: Created this `PROJECT_CONTEXT.md` as the canonical project reference.
