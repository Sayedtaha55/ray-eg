# 4) دليل الـ Backend (NestJS) - تفصيلي

## 4.1 نقطة الدخول
- الملف: `backend/main.ts`
- المسؤوليات الرئيسية:
  - قراءة env وتجهيز CORS.
  - تفعيل Helmet وRate Limits وSlow-down.
  - تفعيل ValidationPipe وException Filter.
  - تشغيل static uploads.
  - بدء السيرفر مع graceful shutdown.

## 4.2 تركيب التطبيق
- الملف: `backend/app.module.ts`
- يسجل الموديولات حسب وضع التشغيل (all أو subset من `BOOT_MODULES`).

## 4.3 الموديولات/المجالات الأساسية

### Auth
- signup/login/logout
- google oauth callback
- password reset/change
- bootstrap admin (متحكم فيه عبر env)

### Shop/Product
- إدارة المتجر وخصائصه
- إدارة المنتجات والمخزون
- مسارات عامة ومسارات إدارة

### Order/Reservation/Invoice
- إنشاء ومتابعة الطلبات
- إنشاء ومتابعة الحجوزات
- فواتير وملخصات

### Offer/Analytics
- إدارة عروض المتاجر
- مؤشرات وتقارير تشغيلية

### Notification/Feedback
- إشعارات للمستخدم/المتجر
- استقبال ملاحظات العملاء والإدارة عليها

### Media/Gallery
- رفع ملفات/صور/فيديو
- Presigned uploads (حسب نمط التخزين)

### Courier/Users/Customers
- تدفقات خاصة بالتوصيل
- إدارة حسابات وأدوار
- إدارة بيانات العملاء

## 4.4 الأنماط الأمنية المفعلة
- `helmet()` مع CSP مرنة للتطبيق.
- limits متخصصة لمسارات:
  - `/api/v1/auth/login`
  - `/api/v1/auth/signup`
  - `/api/v1/gallery/upload`
  - `/api/v1/media/presign`
  - POST `/api/v1/reservations`
- limit عام لباقي الـ API.

## 4.5 التعامل مع الأخطاء
- Global filter يعيد استجابة متسقة.
- في dev: تفاصيل أكثر لتسريع التصحيح.
- في production: رسائل عامة آمنة.

## 4.6 متغيرات تشغيل مهمة للـ Backend
- `PORT` / `BACKEND_PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `CORS_ORIGIN`, `FRONTEND_URL`, `FRONTEND_APP_URL`
- `BOOT_MODULES`, `MINIMAL_BOOT`
- `TRUST_PROXY`
- `MEDIA_STORAGE_MODE` (بحسب تطبيق التخزين)

## 4.7 نصائح تطوير Backend
- ابدأ بموديولات قليلة عند التطوير (`BOOT_MODULES`).
- فعّل النوع المناسب من logging في بيئتك.
- اختبر endpoints الحرجة مع payloads غير صالحة للتأكد من validation.
- راجع rate-limits قبل أي load test.
