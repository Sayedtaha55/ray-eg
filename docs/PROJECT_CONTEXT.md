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
- **State**: Active development — architecture split into two independent apps
- **Phase**: Two-app monorepo (Next.js marketplace + Vite dashrd)

### Production URLs (fill in)
- **Marketplace (Next.js)**: https://mnmknk.com/
- **Dashboard (Vite/Electron)**: <TBD — separate domain or subdomain>
- **Backend API (Railway/Docker?)**: https://ray-eg-production.up.railway.app
- **Database (Postgres provider)**: <UNKNOWN - PLEASE CONFIRM>

---

## Architecture: Two-App Monorepoboa

The project is split into **two independent frontend apps** that share a common backend and a shared package:

```
ray-eg/
├── apps/
│   ├── marketplace-next/     ← Next.js 15 app (public marketplace, SEO-optimized)
│   └── dashboard/            ← Vite React SPA (merchant/admin/courier dashboard)
├── packages/
│   └── shared/               ← @ray-eg/shared (components, services, i18n, utils, types)
├── backend/                  ← NestJS API (shared by both apps)
├── prisma/                   ← Prisma schema + migrations
├── electron/                 ← Electron wrapper for the dashboard app
└── src/                      ← Legacy Vite app (DEPRECATED — do not use)
```

### Why Split?
- **Marketplace (Next.js)**: Server-side rendering for SEO, sitemaps, robots.txt, structured data, social sharing — critical for public-facing pages.
- **Dashboard (Vite)**: SPA is sufficient for authenticated dashboards (merchant/admin/courier) — no SEO needed, faster dev iteration.
- **Shared Package**: Both apps import from `@ray-eg/shared` for components, services, i18n, utils — no code duplication.
- **Independent Marketing**: Each app can be deployed, marketed, and scaled independently.

### App 1: Marketplace (Next.js)
- **Location**: `apps/marketplace-next/`
- **Framework**: Next.js 15 (App Router)
- **Port**: `5174` (dev)
- **Purpose**: Public marketplace — shop browsing, product pages, offers, activities, blog, SEO directory
- **Deployment**: Vercel (recommended for Next.js)
- **Key files**: `apps/marketplace-next/app/` (App Router pages), `apps/marketplace-next/next.config.mjs`

### App 2: Dashboard (Vite SPA)
- **Location**: `apps/dashboard/`
- **Framework**: Vite + React 19
- **Port**: `3000` (dev)
- **Purpose**: Merchant dashboard, admin panel, courier orders, portal — all authenticated routes
- **Deployment**: Vercel/Vercel/Netlify (static SPA) or Electron desktop app
- **Key files**: `apps/dashboard/src/` (App, routes, pages), `apps/dashboard/vite.config.ts`
- **Electron**: `electron/` wraps the dashboard app for desktop distribution

### Shared Package
- **Location**: `packages/shared/`
- **Package name**: `@ray-eg/shared`
- **Contents**: Components (160+), services (API client, auth), i18n (ar/en), utils, types, hooks
- **Alias**: `@` → `packages/shared/src` (in both apps' configs)

---

## Tech Stack
- **Marketplace Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Dashboard Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Shared Package**: `@ray-eg/shared` (components, services, i18n, utils)
- **Backend**: NestJS + Prisma
- **Database**: PostgreSQL (default schema: `prisma/schema.prisma`)
- **Redis**: optional (present in docker dev setup; module currently disabled in backend)
- **AI**: Google Gemini (`@google/genai`)
- **Desktop**: Electron (wraps dashboard app)

---

## How to Run Locally

### Install (root — installs all workspaces)
```bash
npm install
```

### Environment Variables
- Copy `.env.example` to `.env.local` (recommended locally) or `.env`.
- **Important**: `.env`, `.env.local`, and `.env.*` are gitignored.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `GEMINI_API_KEY` — backend AI
- `CORS_ORIGIN` — backend CORS (include both app origins)
- `FRONTEND_APP_URL` / `FRONTEND_URL` — backend redirect/CORS fallback

### Database (Prisma)
```bash
npm run prisma:generate
npm run prisma:push
```

### Run Backend (dev) — Port 4000
```bash
npm run backend:dev:stable
```
Backend runs on `http://localhost:4000`

### Run Marketplace (Next.js) — Port 5174
```bash
cd apps/marketplace-next
npm run dev
```
Marketplace runs on `http://localhost:5174`

### Run Dashboard (Vite) — Port 3000
```bash
cd apps/dashboard
npm run dev
```
Dashboard runs on `http://localhost:3000`

### Run All Three (concurrent)
```bash
# Terminal 1: Backend
npm run backend:dev:stable

# Terminal 2: Marketplace
cd apps/marketplace-next && npm run dev

# Terminal 3: Dashboard
cd apps/dashboard && npm run dev
```

### CORS Configuration
Set `CORS_ORIGIN` to include both origins:
```
CORS_ORIGIN="http://localhost:5174,http://localhost:3000"
```

---

## Port Reference

| Service         | Port  | Command                          |
|-----------------|-------|----------------------------------|
| Backend (NestJS)| 4000  | `npm run backend:dev:stable`     |
| Marketplace     | 5174  | `cd apps/marketplace-next && npm run dev` |
| Dashboard       | 3000  | `cd apps/dashboard && npm run dev` |
| Electron        | —     | `npm run electron:dev` (wraps dashboard) |

---

## Key NPM Scripts (root `package.json`)
- `backend:dev:stable`: NestJS dev with full modules (port 4000)
- `backend:dev:minimal`: NestJS dev with minimal modules
- `backend:build`: build backend to `dist/`
- `prisma:generate`: generate Prisma client
- `prisma:push`: sync database schema
- `electron:dev`: build + run Electron desktop app
- `electron:dist`: build .exe installer
- `typecheck:web`: TypeScript check for frontend (legacy)
- `backend:typecheck`: TypeScript check for backend

### Per-app scripts (run from app directory)
- `apps/marketplace-next/`: `npm run dev`, `npm run build`, `npm run start`
- `apps/dashboard/`: `npm run dev`, `npm run build`, `npm run preview`

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

## Frontend Notes

### Marketplace (Next.js)
- App Router with file-based routing
- Server-side rendering for SEO-critical pages
- API proxy via `next.config.mjs` rewrites (`/api/:path*` → backend)
- `NEXT_PUBLIC_BACKEND_URL` env var for backend URL
- Sitemap and robots.txt generated dynamically

### Dashboard (Vite SPA)
- Vite dev server with proxy to backend
- `@` alias → `packages/shared/src`
- HTTPS support via `certs/localhost.pem`
- SPA routing (HashRouter or BrowserRouter)

### Legacy Vite App (`src/`)
- **DEPRECATED** — the old monolithic Vite app in `src/` is no longer maintained
- Components were moved to `packages/shared/src/components/`
- `vite.config.mts` and `vite.electron.config.mts` still reference old paths
- Do NOT use `npm run dev` from root for development — use the per-app commands above

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
- 2026-07-28: Updated to reflect two-app architecture (Next.js marketplace + Vite dashboard + shared package).
