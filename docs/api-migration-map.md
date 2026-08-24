# API Migration Map: Nest/Prisma إلى Go/SQL

هذه الخريطة هي المرجع أثناء نقل الربط من الباك القديم إلى `gobackend`، مع تأجيل الحجوزات حاليًا.

## Backend freeze decision (2026-08-24)

- **`gobackend` هو الباك-إند الوحيد المسموح للشغل الجديد.** باك NestJS القديم (`backend/`) مجمّد ثم حُذف من المستودع بتاريخ 2026-08-24؛ نسخة كاملة على الجهاز في `C:\Users\Dream\ray-backups\` (وأيضًا في تاريخ git). المرجع أثناء ترحيل أي endpoint هو النسخة الاحتياطية.
- **الحجوزات/Bookings ستُبنى في `gobackend` مباشرة** عند إعادة التصميم (SQL migrations جديدة)، ولن يُطوَّر عليها في القديم إطلاقًا.
- أي endpoint جديد يُضاف هنا في الخريطة قبل تنفيذه.

## Active routing

- Next apps call `/api/v1/*` from the browser.
- Next rewrites proxy `/api/*` to `NEXT_PUBLIC_BACKEND_URL` / `BACKEND_URL`, defaulting to `http://localhost:4000`.
- The target service for new work is `gobackend`.

## Priority slices

| Priority | Area | Frontend entry | Go endpoint target | State | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Auth/session | dashboard login, marketplace login | `/api/v1/auth/*` | In progress | Must normalize token storage between `token` and `ray_token`. |
| 2 | Shop context | dashboard shell, inventory, builder | `/api/v1/shops/me`, `/api/v1/shops/:slug` | In progress | Required before merchant APIs. |
| 3 | Products/categories | marketplace listing, inventory | `/api/v1/products`, `/api/v1/products/manage/by-shop/:shopId` | In progress | Public reads and merchant writes stay first. |
| 4 | Orders/checkout | marketplace checkout, order tracking, sales dashboard | `/api/v1/orders`, `/api/v1/orders/:id`, `/api/v1/orders/me` | In progress | Checkout now uses the Go proxy path. |
| 5 | Media/uploads | product media, image maps | `/api/v1/media/*` | Pending | Needs storage and compression checks. |
| 6 | Offers/marketing | marketplace offers, dashboard marketing | `/api/v1/offers`, `/api/v1/marketing/seasonal-offers/*` | In progress | Seasonal offer response includes optional `status`. |
| Later | Bookings | dashboard bookings and reservations builder | `/api/v1/reservations`, `/api/v1/bookings/*` | Deferred | Deferred until the requested booking redesign is clear. |

## SQL migration rule

- New Go features must use SQL migrations in `gobackend/migrations`.
- Prisma remains only as the compatibility source for the old `backend` until parity is reached.
- Before changing an existing table, compare the Prisma model and Go migration history in this map.

## Frontend integration rule

- Browser code should call relative `/api/v1/*` through the shared API helpers so Next rewrites route traffic to Go.
- Server-side data loading can use the absolute backend URL helper because rewrites do not apply in the same way during server rendering.
