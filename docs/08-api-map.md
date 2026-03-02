# 8) خريطة الـ API والوحدات (دقيقة ومرجعية)

> **مهم:** هذه الخريطة مرجعية لتسهيل الفهم السريع. المرجع النهائي دائمًا هو ملفات `backend/*controller.ts`.

## 8.1 Base
- Local Base URL: `http://127.0.0.1:4000`
- أغلب endpoints تحت: `/api/v1`

## 8.2 Auth — `/api/v1/auth`
- `GET /google`
- `GET /google/callback`
- `POST /signup`
- `POST /courier-signup`
- `POST /bootstrap-admin`
- `POST /login`
- `POST /dev-merchant-login`
- `POST /dev-courier-login`
- `GET /session`
- `POST /logout`
- `POST /deactivate`
- `POST /password/forgot`
- `POST /password/reset`
- `POST /password/change`

## 8.3 Shops — `/api/v1/shops`
- `GET /sitemap`
- `POST /`
- `GET /me`
- `PATCH /me`
- `POST /me/banner`
- `POST /me/module-upgrade-requests`
- `GET /me/module-upgrade-requests`
- `GET /admin/list`
- `GET /admin/:id`
- `PATCH /admin/:id/status`
- `POST /admin/:id/reset-visitors`
- `GET /admin/module-upgrade-requests`
- `POST /admin/module-upgrade-requests/:id/approve`
- `POST /admin/module-upgrade-requests/:id/reject`
- `GET /`
- `GET /:slug`
- `GET /:id`
- `POST /:id/visit`
- `POST /:id/follow`
- `PATCH /:id/design`
- `GET /:id/analytics`

## 8.4 Products — `/api/v1/products`
- `GET /`
- `GET /manage/by-shop/:shopId`
- `GET /:id`
- `POST /`
- `POST /manage/by-shop/:shopId/import-drafts`
- `PATCH /:id/stock`
- `PATCH /:id`
- `DELETE /:id`

## 8.5 Orders — `/api/v1/orders`
- `GET /me`
- `GET /`
- `GET /admin`
- `GET /courier/me`
- `POST /`
- `PATCH /:id`
- `PATCH /:id/assign-courier`
- `PATCH /:id/courier`
- `GET /:id/returns`
- `POST /:id/returns`

## 8.6 Reservations — `/api/v1/reservations`
- `POST /`
- `GET /me`
- `GET /`
- `PATCH /:id/status`

## 8.7 Offers — `/api/v1/offers`
- `GET /`
- `GET /:id`
- `POST /`
- `DELETE /:id`

## 8.8 Invoices — `/api/v1/invoices`
- `GET /me`
- `GET /summary/me`
- `GET /`
- `GET /summary`
- `GET /:id`
- `POST /`
- `PATCH /:id`

## 8.9 Gallery — `/api/v1/gallery`
- `POST /upload`
- `GET /:shopId`
- `DELETE /:id`
- `POST /:id/caption`

## 8.10 Media — `/api/v1/media`
- `GET /ping`
- `GET /status`
- `POST /presign`
- `POST /upload`
- `PUT /upload`
- `POST /complete`

## 8.11 Analytics — `/api/v1/analytics`
- `GET /system`
- `GET /system/timeseries`
- `GET /system/activity`

## 8.12 Notifications — `/api/v1/notifications`
- `GET /me`
- `GET /me/unread-count`
- `PATCH /me/read`
- `PATCH /me/:id/read`
- `GET /shop/:shopId`
- `GET /shop/:shopId/unread-count`
- `PATCH /shop/:shopId/read`
- `PATCH /shop/:shopId/:id/read`

## 8.13 Feedback — `/api/v1/feedback`
- `POST /public`
- `POST /`
- `GET /admin`
- `PATCH /admin/:id/status`
- `DELETE /admin/:id`

## 8.14 Customers — `/api/v1/customers`
- `GET /shop/:shopId`
- `PUT /:customerId/status`
- `POST /send-promotion`
- `POST /convert`

## 8.15 Courier — `/api/v1/courier`
- `GET /state`
- `PATCH /state`
- `GET /offers`
- `POST /offers/:id/accept`
- `POST /offers/:id/reject`

## 8.16 Users — `/api/v1/users`
- `PATCH /me`
- `GET /couriers`
- `POST /couriers`
- `GET /couriers/pending`
- `PATCH /couriers/:id/approve`
- `PATCH /couriers/:id/reject`

## 8.17 مسارات تشغيلية خارج `/api/v1`
- `GET /` و`GET /health` (health controller)
- `GET /monitoring/health|metrics|alerts|dashboard`
- `GET /db-test`
