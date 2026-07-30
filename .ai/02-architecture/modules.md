# Core Modules

Every feature must belong to a module.

Modules communicate through services or events.

Never through direct database access.

---------------------------------

## Frontend Apps (Two-App Monorepo)

### App 1: Marketplace (Next.js)
- **Path:** `apps/marketplace-next/`
- **Port:** 5174
- **Purpose:** Public marketplace — SEO, SSR, sitemaps, product pages, shop profiles, offers, blog
- **Framework:** Next.js 15 (App Router)

### App 2: Dashboard (Vite SPA)
- **Path:** `apps/dashboard/`
- **Port:** 3000
- **Purpose:** Merchant dashboard, admin panel, courier orders, portal — all authenticated routes
- **Framework:** Vite + React 19
- **Desktop:** Electron wraps this app

### Shared Package
- **Path:** `packages/shared/`
- **Package:** `@ray-eg/shared`
- **Contents:** Components (160+), services (API client, auth), i18n (ar/en), utils, types, hooks
- **Alias:** `@` → `packages/shared/src` (in both apps)

### Legacy (Deprecated)
- **Path:** `src/` — old monolithic Vite app, no longer maintained
- Components moved to `packages/shared/src/components/`

---------------------------------

Core Modules

Authentication

Users

Businesses

Branches

Products

Categories

Inventory

Orders

Invoices

Customers

Suppliers

Employees

CRM

Booking

Marketplace

Business Graph

Maps

Notifications

Messaging

Analytics

Reports

Payments

Media

Files

Reviews

Permissions

Roles

Audit Logs

AI

Search

Settings

Integrations

---------------------------------

Future Modules

Insurance

Financing

Shipping

Logistics

Auctions

Government Integration

Export

Import

IoT

Smart Devices

---------------------------------

Rules

Each module owns:

Entities

DTOs

Controllers

Services

Events

Validation

Tests

Documentation

Never share entities directly.

Always expose services or interfaces.

Every module should be reusable.