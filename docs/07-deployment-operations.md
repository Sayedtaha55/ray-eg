# 7) النشر والتشغيل الإنتاجي - تفصيلي

## 7.1 نموذج النشر
يفضل فصل الخدمات:
1. **Frontend**: static assets (Vite build).
2. **Backend**: Node/NestJS service.
3. **Database**: PostgreSQL managed/self-hosted.
4. **Redis**: حسب الحاجة الوظيفية.

## 7.2 أوامر البناء
- Frontend:
```bash
npm run build
```
- Backend:
```bash
npm run backend:build
```
- Vercel combined build:
```bash
npm run vercel-build
```

## 7.3 تشغيل الخادم في الإنتاج
- مدخل تشغيل backend موجود بسكربت `scripts/railway-backend-start.js`.
- تأكد من ضبط env قبل التشغيل.

## 7.4 متغيرات حرجة في الإنتاج
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `FRONTEND_APP_URL`
- `TRUST_PROXY=true` عند العمل خلف proxy/load balancer

## 7.5 صحة الخدمة والمراقبة
- استخدم endpoints الصحية المتاحة (مثل health/monitoring حيثما ينطبق).
- فعّل log collection مركزي.
- راقب:
  - معدل الأخطاء 5xx
  - زمن الاستجابة
  - سعة CPU/RAM
  - أخطاء DB/Redis

## 7.6 التعامل مع الضغط العالي
- راجع limits/rate-limits بما يناسب الترافيك.
- افصل heavy tasks (مثل media optimization) عند الحاجة.
- طبّق caching بالمناطق الأكثر طلبًا.

## 7.7 إغلاق آمن للخدمة
الخادم يدعم graceful shutdown للإشارات `SIGTERM` و`SIGINT`، لذلك:
- استخدم rolling deployments.
- امنح الخدمة مهلة إغلاق كافية قبل kill النهائي.

## 7.8 Docker
الملفات المتاحة:
- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.dev.yml`

يفضل استخدام compose في التطوير المحلي الموحد (DB/Redis/backend).
