# 9) استكشاف الأعطال وإصلاحها (Runbook)

## 9.1 مشكلة: Frontend يعمل لكن لا توجد بيانات
### أعراض
- الصفحة تفتح لكن القوائم فارغة.
- أخطاء network في المتصفح.

### تشخيص سريع
1. تأكد أن Backend يعمل على URL صحيح.
2. تحقق من `VITE_BACKEND_URL`.
3. راجع تبويب Network في DevTools (status codes).

### حل
- اضبط env ثم أعد تشغيل frontend/backend.

---

## 9.2 مشكلة: CORS policy blocked
### أعراض
- رسائل `blocked by CORS policy`.

### تشخيص
- قارن Origin الفعلي في المتصفح مع `CORS_ORIGIN` بالخادم.
- راجع `FRONTEND_URL` و`FRONTEND_APP_URL`.

### حل
- أضف origin الصحيح بنفس protocol + host + port.

---

## 9.3 مشكلة: Database connection failed
### أعراض
- `PrismaClientInitializationError`
- timeouts عند الإقلاع

### تشخيص
1. اختبر اتصال PostgreSQL خارجيًا.
2. راجع `DATABASE_URL`.
3. تأكد من schema المتوافق مع البيئة.

### حل
```bash
npm run prisma:generate
npm run prisma:push
```

---

## 9.4 مشكلة: Backend لا يقلع بالكامل
### تشخيص
- شغّل بنمط جزئي لتحديد الموديول المسبب:
```bash
npm run backend:dev:auth
```
أو:
```bash
npm run backend:dev:minimal
```

### الهدف
- عزل المشكلة إلى Domain محدد بسرعة.

---

## 9.5 مشكلة: Auth/JWT
### أعراض
- 401 على endpoints محمية.

### فحص
- `JWT_SECRET` موجود؟
- Token صالح وغير منتهي؟
- Header بصيغة `Authorization: Bearer <token>`؟

---

## 9.6 مشكلة: رفع الملفات لا يعمل
### فحص
- `MEDIA_STORAGE_MODE` مضبوط؟
- هل endpoint الصحيح (`/media/presign` أو `/media/upload`) مستخدم؟
- هل body limit كافٍ؟

### حل
- خفض حجم الملف أو عدّل حدود الرفع في env/الإعداد.

---

## 9.7 مشكلة: ضغط عالي أو تهنيج
### فحص
- راجع rate-limit hits.
- راجع استهلاك CPU/RAM.
- راقب endpoints الأبطأ.

### حل
- زوّد caching.
- عزل heavy jobs.
- راجع الاستعلامات الأكثر كلفة.

---

## 9.8 بيانات مطلوبة قبل فتح Bug
- خطوات إعادة المشكلة (واضحة ومرقمة).
- logs من frontend + backend.
- القيم البيئية المؤثرة (بدون أسرار).
- هل المشكلة محلية فقط أم على staging/production أيضًا.
