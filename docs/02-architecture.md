# 2) المعمارية الفنية

## 2.1 نظرة طبقية (Layered View)
1. **Presentation Layer**: React SPA (واجهات عامة/تاجر/إدارة/كابتن).
2. **API Layer**: NestJS Controllers + Guards + Validation.
3. **Domain/Application Layer**: NestJS Services (منطق الأعمال).
4. **Data Layer**: Prisma Client + PostgreSQL/SQLite حسب البيئة.
5. **Infra Layer**: Redis/Storage/Rate-limit/Middleware.

## 2.2 الهيكل العام للمجلدات
- `components/` : واجهات ومكونات frontend.
- `backend/` : خادم NestJS.
- `prisma/` : schema/migrations الأساسية.
- `scripts/` : تشغيل وفحص واختبارات دخانية.

## 2.3 Frontend Architecture
- نقطة الدخول: `index.tsx`.
- تعريف المسارات: `App.tsx`.
- نمط التحميل: lazy-loading لمعظم الصفحات لتقليل زمن التحميل الأولي.
- قوالب العرض: `PublicLayout` / `BusinessLayout` / `AdminLayout`.

### ملاحظات UX مهمة
- ScrollToTop عند تغيير المسار.
- Redirect حسب الدور للمستخدم المسجل.
- fallback على صفحة 404 في حالات offline/backend-down.

## 2.4 Backend Architecture
- bootstrap شامل في `backend/main.ts`.
- تسجيل الموديولات في `backend/app.module.ts`.
- كل Domain غالبًا مقسوم إلى: Module + Controller + Service.

### موديولات تشغيلية أساسية (عينة)
- Auth, Shop, Product, Gallery
- Reservation, Order, Offer, Invoice
- Analytics, Monitoring
- Notification, Feedback
- Customers, Users, Courier
- Media, ShopImageMap

## 2.5 Boot Modes (تشغيل مرن)
يمكن تقليل سطح الإقلاع باستخدام env:
- `MINIMAL_BOOT=true` لتشغيل محدود.
- `BOOT_MODULES=auth,shop,...` لتحديد موديولات بعينها.

هذا مفيد لـ:
- تقليل زمن الإقلاع أثناء التطوير.
- عزل المشاكل عند التشخيص.
- تشغيل smoke flows محددة.

## 2.6 Security Runtime Controls
- Helmet لتقوية HTTP headers.
- Rate-limit عام + rate-limit لمسارات حساسة.
- Slow-down middleware لتخفيف abuse.
- ValidationPipe عالمي.
- Global Exception Filter.
- CORS ديناميكي حسب env/hostname.

## 2.7 تدفق الطلب (Request Flow)
1. المتصفح يرسل request إلى `/api/v1/...`.
2. Nest middleware/guards/validation يفلتر الطلب.
3. Controller يوجّه الطلب إلى Service.
4. Service ينفذ business rules ويستدعي Prisma.
5. Prisma يتعامل مع قاعدة البيانات.
6. الاستجابة تعود JSON للواجهة.

## 2.8 تدفق الرفع (Media Flow - مختصر)
1. العميل يطلب presign أو upload endpoint.
2. الخادم يطبّق validation + limit.
3. التخزين يتم محليًا أو remote mode حسب env.
4. يتم إرجاع URL/metadata للاستخدام داخل المنتجات أو الجاليري.
