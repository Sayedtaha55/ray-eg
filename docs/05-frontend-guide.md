# 5) دليل الـ Frontend (React) - تفصيلي

## 5.1 نقطة البداية
- `index.tsx`
  - إنشاء React root.
  - تفعيل `ErrorBoundary` و`ToastProvider` حول التطبيق.

## 5.2 نظام التوجيه (Routing)
- `App.tsx` يحتوي:
  - Router mode قابل للتبديل (`HashRouter` أو `BrowserRouter`) عبر env.
  - Lazy loading لمعظم الصفحات.
  - مسارات عامة + business + admin + courier.
  - Redirect helpers لمسارات legacy/بديلة.

## 5.3 التقسيم الوظيفي
- `components/pages/`: صفحات route-level.
- `components/layouts/`: Layouts حسب نوع المستخدم.
- `components/features/`: منطق واجهة متخصص (cart/shop/product/...)
- `components/ui/`: عناصر واجهة reusable.

## 5.4 سلوكيات مهمة داخل App
- ScrollToTop: يحسن تجربة الانتقال.
- RoleRedirector: يوجّه المستخدم وفق دوره.
- OfflineOrBackendDownRedirector: يحوّل إلى شاشة 404 بأسباب واضحة.
- RouteSeoManager: يضبط SEO metadata حسب الصفحة.

## 5.5 أفضل ممارسات عند إضافة صفحة جديدة
1. أضف الصفحة داخل `components/pages/...`.
2. استوردها lazy في `App.tsx`.
3. أضف route مناسب تحت layout الصحيح.
4. راجع تجربة الهاتف + سطح المكتب.
5. أضف handling لأخطاء التحميل إن لزم.

## 5.6 الاتصال بالـ Backend
- يعتمد على `VITE_BACKEND_URL`.
- تأكد تطابقه مع إعدادات CORS على الخادم.
- استخدم wrappers/helpers موحدة للطلبات إن كانت متاحة بالمشروع.

## 5.7 نقاط فحص قبل الدمج
- لا يوجد أخطاء TypeScript.
- لا يوجد runtime errors بالمتصفح.
- المسارات الجديدة لا تكسر redirects القديمة.
- fallback loading يعمل أثناء lazy loading.
