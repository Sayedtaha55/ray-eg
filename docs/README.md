# دليل التوثيق الشامل لمشروع Ray (نسخة تفصيلية دقيقة)

> هذا الدليل مكتوب بحيث يخدم نوعين من القرّاء:
> 1) المطوّر البشري الذي يريد فهم النظام بسرعة.
> 2) أي نموذج ذكاء اصطناعي يحتاج معلومات منظمة ودقيقة لفهم المشروع واتخاذ قرارات صحيحة.

## طريقة القراءة الموصى بها

- **للاستيعاب السريع (30-45 دقيقة):**
  1. `01-project-overview.md`
  2. `02-architecture.md`
  3. `03-setup-and-run.md`
  4. `08-api-map.md`

- **للبناء/التعديل على الكود (جلسة كاملة):**
  1. `03-setup-and-run.md`
  2. `04-backend-guide.md`
  3. `05-frontend-guide.md`
  4. `06-database-guide.md`
  5. `09-troubleshooting.md`

- **للتشغيل الإنتاجي وDevOps:**
  1. `07-deployment-operations.md`
  2. `06-database-guide.md`
  3. `09-troubleshooting.md`

---

## فهرس التوثيق

1. [نظرة عامة على المشروع](./01-project-overview.md)
2. [المعمارية الفنية](./02-architecture.md)
3. [التشغيل المحلي والإعداد](./03-setup-and-run.md)
4. [دليل الـ Backend (NestJS)](./04-backend-guide.md)
5. [دليل الـ Frontend (React)](./05-frontend-guide.md)
6. [دليل قاعدة البيانات وPrisma](./06-database-guide.md)
7. [النشر والتشغيل الإنتاجي](./07-deployment-operations.md)
8. [خريطة الـ API والوحدات](./08-api-map.md)
9. [استكشاف الأعطال وإصلاحها](./09-troubleshooting.md)

---

## قاموس مصطلحات سريع

- **Merchant**: صاحب نشاط/متجر يدير المنتجات والطلبات.
- **Courier**: مندوب توصيل يتلقى عروض توصيل ويغيّر حالته التشغيلية.
- **Admin**: إدارة عليا للمراجعات والاعتمادات والمتابعة.
- **Public App**: واجهات العميل العامة.
- **Business App**: واجهات التاجر.
- **Admin App**: واجهات التحكم الإداري.

---

## مراجع أساسية داخل الكود (Source of Truth)

- تعريف المشروع وتشغيله: `README.md`, `package.json`
- متغيرات البيئة: `.env.example`
- مدخل الواجهة: `index.tsx`, `App.tsx`
- مدخل الخادم: `backend/main.ts`, `backend/app.module.ts`
- قاعدة البيانات: `prisma/schema.prisma`, `prisma/migrations/`, `backend/prisma/schema.prisma`

> عند أي تعارض بين التوثيق والكود: **الكود هو المرجع النهائي**.
