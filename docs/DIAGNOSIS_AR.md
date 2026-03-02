# تشخيص شامل للمشروع (كود + أداء + موبايل)

## نطاق التشخيص
- Frontend + Backend + إعدادات البناء والاختبارات.
- تم الاعتماد على فحوصات TypeScript والبناء والاختبارات مع مراجعة الملفات الأساسية.

## الأخطاء البرمجية المكتشفة (وتم إصلاحها)
1. **خطأ TypeScript في `OfferCard`**
   - السبب: استخدام الخاصية `margin` داخل `IntersectionObserverInit` (غير صحيحة).
   - الإصلاح: استبدالها بـ `rootMargin`.
   - التأثير: إزالة خطأ typecheck ومنع سلوك غير متوقع في كشف العنصر داخل viewport.

2. **خطأ TypeScript في `vite.config.ts`**
   - السبب: إعدادات `terserOptions` لم تعد متوافقة مع typing الحالي لـ Vite 7.
   - الإصلاح: التحويل إلى minifier افتراضي مدعوم (`esbuild`) مع `drop: ['console', 'debugger']` في الإنتاج.
   - التأثير: استقرار البناء والتوافق مع النسخة الحالية.

3. **فشل اختبارات `shop.performance` بسبب Dependency Injection**
   - السبب: `ShopService` أصبح يعتمد على خدمات جديدة (`ShopSettingsService`, `ShopPublicQueryService`, `ShopMediaService`, `ShopAnalyticsService`) بدون mocks في الاختبار.
   - الإصلاح: إضافة مزودات mock وتحديث الاختبارات للتحقق من delegation الصحيح.
   - التأثير: عودة الاختبارات للعمل وتقليل false negatives.

## أشياء يُفضل حذفها/تنظيفها (تقليل الحمل والتعقيد)
1. **تكرار مكتبات التشفير**
   - وجود `bcrypt` و `bcryptjs` معًا غالبًا زائد.
   - المقترح: الاحتفاظ بواحدة فقط حسب بيئة التشغيل (عادة `bcryptjs` لو عايز portability أعلى بدون native build).

2. **سكريبتات تشغيل Backend كثيرة جدًا ومتشابهة في `package.json`**
   - يوجد عدد كبير من أوامر PowerShell متقاربة.
   - المقترح: تقليلها عبر سكربت مركزي واحد يستقبل profile/env بدل تكرار الأوامر.

3. **اعتماد زائد على أيقونات/حزم ثقيلة في الصفحة الأولى**
   - لو أي صفحة Home تحمل `framer-motion` + `lucide-react` + `recharts` + `leaflet` في نفس المسار، فهذا يزيد وقت التحميل على الأجهزة الضعيفة.
   - المقترح: التحميل الكسول لكل قسم غير مرئي في البداية.

## تحسينات مهمة مقترحة (High Impact)
1. **تقسيم أكثر دقة للـ bundles حسب route**
   - بالفعل يوجد `manualChunks` جيد.
   - التحسين: إضافة lazy boundaries على مستوى الصفحات ومكونات analytics/maps فقط عند الطلب.

2. **تحسين استراتيجية الصور**
   - الاستمرار في `getOptimizedImageUrl` ممتاز.
   - التحسين: توفير `srcset/sizes` للصور الرئيسية + WebP/AVIF افتراضي + fallback نظيف.

3. **تقليل تكلفة الأنيميشن على الموبايل**
   - المشروع يستخدم `useReducedMotion` في أجزاء (ممتاز).
   - التحسين: إيقاف hover-heavy animations تلقائيًا على `pointer: coarse` وتقليل blur/shadow الكبير على الشاشات الضعيفة.

4. **تقليل hydration/render cost**
   - إضافة `React.memo` موجود لبعض المكونات.
   - التحسين: منع إعادة إنشاء handlers/objects في قوائم طويلة (باستخدام `useCallback` و memoized derived props).

5. **تحسين cache للـ API والواجهة**
   - Backend cache موجود.
   - التحسين: إضافة ETag/Cache-Control للـ public shop endpoints، ودعم stale-while-revalidate لنتائج الصفحات العامة.

## تحسينات خاصة بالموبايل والأجهزة الضعيفة
1. **تقليل JavaScript على أول تحميل**
   - هدف عملي: أقل من 180KB gzip للـ initial route.
   - تنفيذ: lazy imports + إزالة المكتبات غير المستخدمة + code splitting أدق.

2. **تقليل الصور الكبيرة فوق الطيّة (above-the-fold)**
   - تحميل صورة hero واحدة بدقة مناسبة فقط، والباقي lazy.
   - إجبار أبعاد ثابتة للصور لتجنب CLS.

3. **تعطيل مؤثرات مكلفة للأداء المنخفض**
   - عند `navigator.deviceMemory <= 4` (مع fallback آمن) استخدم وضع light effects.

4. **Virtualization للقوائم الطويلة**
   - عند كثرة المنتجات/العروض: تفعيل `react-window` بشكل افتراضي بعد عتبة معينة (مثل 20 عنصر).

5. **تقليل عدد طلبات الشبكة المبكرة**
   - prefetch انتقائي فقط للروابط المتوقع ضغطها، وليس لكل الصفحة.

6. **تحسين الخطوط العربية**
   - subset للأوزان المستخدمة فقط + `font-display: swap` لتقليل تأخير الرسم على الشبكات البطيئة.

## خطة تنفيذ مختصرة (أولوية)
1. إصلاحات الاستقرار (تم): type errors + tests.
2. profile للأداء على موبايل منخفض (Lighthouse mobile + Web Vitals).
3. تقليل JS initial route بالتحميل الكسول.
4. تحسين image pipeline وقياس LCP/CLS.
5. تشغيل Performance Budget داخل CI لمنع التراجع.
