# 10) Frontend Structure Refactor & Organization Guide

## What changed

This refactor splits previously oversized frontend files into smaller modules with clearer responsibilities.

### New app-level structure

- `app/AppRoutes.tsx`
  - Owns the full route tree.
  - Keeps `App.tsx` focused on bootstrap and router shell concerns.
- `app/routerHelpers.tsx`
  - Centralizes suspense fallback and small redirect helper components.
- `app/routeWarmup.ts`
  - Isolates route preloading heuristics and warmup loaders from the main app bootstrap.

### New public home structure

- `components/pages/public/home/HomeHero.tsx`
  - Owns the hero / LCP-friendly top section.
- `components/pages/public/home/OffersSection.tsx`
  - Owns the offers loading skeleton, grid rendering, sentinel, and “load more” UI.
- `components/pages/public/HomeFeed.tsx`
  - Now focuses on state, fetching, and orchestration only.

## Why this structure is better

### 1. Smaller files
Large mixed-purpose files are harder to reason about and slower to change safely. Splitting them makes review, debugging, and future optimization easier.

### 2. Clear boundaries
Each module now has a more obvious responsibility:
- bootstrap shell
- route definition
- route helper UI
- route warmup heuristics
- page state orchestration
- page visual sections

### 3. Safer performance work
When route warmup logic, suspense helpers, and hero rendering are isolated, performance changes can be made without risking unrelated routing logic.

### 4. Better onboarding
New developers can find routing logic in `app/`, page-level UI sections in the page folder, and cross-cutting helpers in `lib/` / `services/`.

## Suggested organization rules going forward

1. If a route file exceeds ~250 lines, split route helpers out.
2. If a page mixes:
   - fetching/state,
   - large visual sections,
   - modal wiring,
   split the visual sections into sibling files under the page folder.
3. Keep `App.tsx` as a shell, not a mega-file.
4. Put performance heuristics (warmup, prefetch, scheduling) in dedicated modules.
5. Prefer one responsibility per file when the logic is reused or independently testable.

## Current high-value folders

```text
app/
  AppRoutes.tsx
  routerHelpers.tsx
  routeWarmup.ts

components/pages/public/
  HomeFeed.tsx
  home/
    HomeHero.tsx
    OfferCard.tsx
    OffersSection.tsx
```

## Recommended next refactor candidates

- `components/layouts/PublicLayout.tsx`
- `components/pages/public/ShopProfile/index.tsx`
- `components/pages/shared/CartDrawer.tsx`
- `components/pages/public/ProductPage.tsx`

These files still contain multiple responsibilities and are good candidates for the same pattern.
