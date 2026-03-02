# 3) التشغيل المحلي والإعداد (خطوة بخطوة)

## 3.1 متطلبات النظام
- Node.js LTS (مستحسن 18+ أو 20+)
- npm
- PostgreSQL (للـ schema الأساسي)
- Redis (اختياري، حسب الموديولات)

## 3.2 الإعداد الأولي
```bash
npm install
```

## 3.3 إعداد البيئة (Environment)
1. انسخ ملف المثال:
```bash
cp .env.example .env
```
2. حدّث المتغيرات الحرجة:
- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_BACKEND_URL`
- `FRONTEND_URL`
- `CORS_ORIGIN`

## 3.4 إعداد قاعدة البيانات (Prisma)
```bash
npm run prisma:generate
npm run prisma:push
```

> في بيئة production لا تستخدم `push`، استخدم migrations (`prisma:migrate:deploy`).

## 3.5 تشغيل الخدمات
### Backend
```bash
npm run backend:dev
```
- افتراضي: `http://127.0.0.1:4000`

### Frontend
```bash
npm run dev
```
- افتراضي: `http://localhost:5174`

## 3.6 أوامر فحص مهمة
- فحص Typescript للواجهة:
```bash
npm run typecheck
```

- فحص Typescript للخادم:
```bash
npm run backend:typecheck
```

- اختبارات Jest:
```bash
npm run test
```

- فحص شامل:
```bash
npm run checks
```

## 3.7 أوضاع تشغيل Backend المفيدة
- تشغيل ثابت نسبيًا (dev stable):
```bash
npm run backend:dev:stable
```
- تشغيل Minimal:
```bash
npm run backend:dev:minimal
```
- تشغيل Auth فقط:
```bash
npm run backend:dev:auth
```
- تشغيل Shop + Product:
```bash
npm run backend:dev:shop-product
```

## 3.8 لماذا توجد سكربتات dev متعددة؟
لأن المشروع كبير ويحتوي موديولات عديدة؛ السكربتات المخصصة تساعد على:
- تسريع وقت الإقلاع.
- تقليل استهلاك الموارد.
- عزل أجزاء معينة أثناء التطوير أو الاختبار.

## 3.9 Checklist تشغيل ناجح
- [ ] `npm install` اكتمل بدون أخطاء.
- [ ] `npm run prisma:generate` نجح.
- [ ] DB تعمل ويمكن الوصول لها.
- [ ] Backend يعمل على البورت المتوقع.
- [ ] Frontend قادر على استدعاء API بدون CORS errors.
