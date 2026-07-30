# Current Project State

Every completed feature must update this file.

-------------------------------------

Last Feature

Architecture split: Marketplace moved to Next.js 15 (apps/marketplace-next) for SEO.
Dashboard remains Vite SPA (apps/dashboard) for authenticated routes.
Shared code extracted to @ray-eg/shared (packages/shared).
Legacy Vite app in src/ is deprecated.

-------------------------------------

Current Sprint

- Documentation update for two-app architecture ✅
- Stabilize marketplace-next (fix typecheck errors, missing modules)
- Stabilize dashboard app (verify all routes work with shared package)

-------------------------------------

Current Problems

- Legacy Vite app (src/) is broken — imports point to moved components
- apps/marketplace-next has typecheck errors (missing @/lib/config, @/components/*)
- vite.electron.config.mts still references old src/shared paths
- Root package.json scripts still reference old monolithic Vite app

-------------------------------------

Next Priority

- Fix marketplace-next missing modules and typecheck errors
- Update vite.electron.config.mts to point to packages/shared
- Clean up root package.json scripts for two-app structure
- Verify dashboard app works end-to-end with @ray-eg/shared

-------------------------------------

Architecture Decisions

- Split frontend into two independent apps (Next.js + Vite) for SEO vs SPA needs
- Shared package (@ray-eg/shared) for components, services, i18n — no duplication
- Backend (NestJS) remains shared between both apps
- Electron wraps the dashboard app only (merchant desktop)
- Each app marketed and deployed independently

-------------------------------------

Technical Debt

- Legacy src/ directory with broken Vite app (needs cleanup or removal)
- vite.config.mts and vite.electron.config.mts reference old paths
- Root tsconfig.json includes both old and new paths (ambiguous)
- Some marketplace-next imports reference non-existent modules

-------------------------------------

Known Risks

- Two apps = two deployment pipelines = more complexity
- Shared package changes affect both apps (need coordination)
- CORS must allow both app origins

-------------------------------------

Future Ideas

- Separate domains/subdomains for each app
- Independent CI/CD pipelines per app
- Mobile app (React Native) using same shared package
- Micro-frontend architecture if apps grow further