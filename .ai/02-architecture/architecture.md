# Software Architecture

## Architecture Style

The project follows a **Two-App Monorepo** architecture:
- **Marketplace** (Next.js 15) — public-facing, SEO-optimized
- **Dashboard** (Vite SPA) — authenticated dashboards (merchant/admin/courier)
- **Shared Package** (@ray-eg/shared) — components, services, i18n, utils
- **Backend** (NestJS) — shared API for both apps
- Designed to evolve into Microservices when needed

```
Marketplace (Next.js)     Dashboard (Vite SPA)
     Port 5174                 Port 3000
         \                    /
          \                  /
     @ray-eg/shared (packages/shared)
                   |
          Backend (NestJS) — Port 4000
                   |
          PostgreSQL + Redis + S3
```

## Key Decisions
- **Why Next.js for Marketplace?** SSR, sitemaps, robots.txt, structured data, social sharing — all critical for SEO
- **Why Vite for Dashboard?** SPA is sufficient for authenticated routes, faster dev iteration, Electron-compatible
- **Why Shared Package?** Avoid code duplication — both apps use same components, services, i18n
- **Why Monorepo?** Shared backend, shared types, atomic commits across apps

----------------------------

## Principles

- Modular First
- Domain Driven Design (DDD)
- Clean Architecture
- SOLID
- DRY
- KISS
- Event Driven Ready
- Microservice Ready
- Plugin Ready

----------------------------

## Layers

Presentation

↓

Application

↓

Domain

↓

Infrastructure

----------------------------

## Controllers

Controllers must:

Only receive requests.

Validate input.

Call application services.

Return responses.

Never contain business logic.

----------------------------

## Services

Application Services

Coordinate business operations.

Domain Services

Contain business rules.

Infrastructure Services

Database.

Email.

Redis.

S3.

External APIs.

----------------------------

## Dependencies

Allowed

Controller

↓

Application

↓

Domain

↓

Infrastructure

Forbidden

Infrastructure

↓

Controller

----------------------------

## Rules

No circular dependencies.

No business logic in controllers.

No Prisma inside controllers.

No HTTP requests inside entities.

No duplicated logic.

Every module owns its data.

Every feature must be replaceable.