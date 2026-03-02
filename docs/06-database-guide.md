# 6) دليل قاعدة البيانات وPrisma - تفصيلي

## 6.1 ملفات Prisma الموجودة
- `prisma/schema.prisma` (الأساسي)
- `prisma/schema.postgres.prisma`
- `prisma/schema-sqlite.prisma`
- `backend/prisma/schema.prisma` (مسارات legacy/خاصة)

## 6.2 كيف تختار schema الصحيح؟
- التطوير القياسي الحالي: ابدأ بـ `prisma/schema.prisma` + PostgreSQL.
- استخدم أي schema بديل فقط لو عندك سبب واضح ومتفق عليه بالفريق.

## 6.3 أوامر Prisma الأساسية
- توليد client:
```bash
npm run prisma:generate
```
- مزامنة schema مباشرة (تطوير):
```bash
npm run prisma:push
```
- تطبيق migrations (إنتاج):
```bash
npm run prisma:migrate:deploy
```

## 6.4 استراتيجية migrations
- أنشئ migration واحدة لكل تغيير منطقي واضح.
- راجع SQL الناتج قبل الدمج.
- اختبر migration على نسخة staging data قدر الإمكان.

## 6.5 قواعد أمان البيانات
- لا تضع أسرار DB في الكود؛ استخدم env.
- راقب timeout/connection params في `DATABASE_URL`.
- خطط للنسخ الاحتياطي قبل أي تغييرات هيكلية.

## 6.6 أخطاء شائعة
- `PrismaClientInitializationError`: غالبًا URL خاطئ أو DB down.
- schema mismatch: تشغيل generate/push على schema غير مقصود.
- migration drift: اختلاف بين db state وملفات migration.

## 6.7 checklist قبل merge لتغييرات DB
- [ ] migration واضحة الاسم والهدف.
- [ ] prisma generate شغّال.
- [ ] النوعيات (types) لم تنكسر.
- [ ] السيناريوهات الأساسية (create/read/update) تم اختبارها.
