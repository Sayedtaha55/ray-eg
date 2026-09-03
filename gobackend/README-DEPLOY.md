# Deploy Guide — Supabase + Render/Railway (Go backend)

> الباك الوحيد: Go 1.25 + Fiber في `gobackend/` (المنفذ `4000`). باك NestJS القديم حُذف 2026-08-24.

## الخدمات المطلوبة (كلها مجانية)

| الخدمة | الاستخدام | الرابط |
|--------|-----------|--------|
| Supabase | PostgreSQL database | supabase.com |
| Upstash | Redis (`REDIS_URL`) | upstash.com |
| Cloudflare R2 | File storage (اختياري — تحذير `s3 client not available` تحذير فقط) | cloudflare.com |
| Resend | Email | resend.com |
| Render / Railway | Hosting الـ Go API + الـ Worker | render.com |

الصور: `gobackend/Dockerfile` للـ API و`gobackend/Dockerfile.worker` للـ worker (بناء متعدد المراحل).

---

## الخطوات بالترتيب

### 1. Supabase — إعداد قاعدة البيانات

1. روح [supabase.com](https://supabase.com) → New Project
2. احتفظ بـ **Database Password**
3. روح: Project Settings → Database → Connection String → URI
4. انسخ الـ URI وحطه في `.env.production` كـ `DATABASE_URL`
   - تأكد إنه بيستخدم port **5432** (Session mode)
   - أضف `?sslmode=require` في الآخر

### 2. شغل الـ Migrations على Supabase

```bash
cd gobackend

# انسخ الـ example وعدل القيم
copy .env.production.example .env.production

# شغل الـ migrations (golang-migrate تحت migrations/)
go run scripts/migrate.go up
```

### 3. Upstash — إعداد Redis

1. روح [upstash.com](https://upstash.com) → Create Database
2. اختار region قريبة
3. انسخ الـ `REDIS_URL` وحطه في `.env.production` (إلزامي إنتاجيًا — أو `REDIS_HOST`)

### 4. Cloudflare R2 — إعداد Storage (اختياري)

1. Cloudflare Dashboard → R2 → Create Bucket → اسمه `ray-media`
2. R2 → Manage R2 API Tokens → Create Token
3. حط الـ keys في `.env.production`
4. ملاحظة: بدون S3 سترى تحذير `s3 client not available` — تحذير فقط، والوسائط تعمل محليًا.

### 5. متغيرات الإنتاج الإلزامية

قبل الـ Deploy تأكد من (المرجع: `gobackend/.env.example` و`.env.production.example`):

- `JWT_SECRET` — بطول 32+ حرف وغير القيمة الافتراضية
- `ADMIN_BOOTSTRAP_TOKEN` — غير القيمة الافتراضية
- `CSRF_DISABLED=false`
- `CORS_ORIGIN` — بدون `*` (دوميناتك الحقيقية فقط)
- `REDIS_URL` أو `REDIS_HOST`
- الدخول التجريبي (`dev-*-login`) ممنوع إنتاجيًا — يعمل فقط مع `APP_ENV=development` و`ALLOW_DEV_*_BOOTSTRAP=true`

### 6. Deploy الـ API على Render

1. روح [render.com](https://render.com) → New Web Service
2. اربطه بالـ GitHub repo
3. الإعدادات:
   - **Root Directory:** `gobackend`
   - **Build Command:** `go build -o api ./cmd/api`
   - **Start Command:** `./api`
4. أضف كل الـ environment variables من `.env.production` (بما فيها الخمسة الإلزامية أعلاه)

### 7. Deploy الـ Worker على Render

1. New Background Worker
2. نفس الإعدادات بس:
   - **Build Command:** `go build -o worker ./cmd/worker`
   - **Start Command:** `./worker`
3. نفس متغيرات البيئة (`DATABASE_URL` + `REDIS_URL` + الأسرار)

---

## بعد الـ Deploy — تحقق

```bash
# Readiness (DB + Redis)
curl https://your-api-domain.com/monitoring/ready

# Liveness
curl https://your-api-domain.com/monitoring/live

# Status
curl https://your-api-domain.com/api/v1/status

# Metrics (Prometheus)
curl https://your-api-domain.com/metrics
```

الأخطاء تأتي بصيغة موحدة: `{success:false, error, message}`.

---

## لو عايز تشغل محلياً

```bash
cd gobackend

# التشغيل المحلي: postgres + redis ثم Go
docker compose up -d postgres redis
go run ./cmd/api

# التحقق
curl http://localhost:4000/monitoring/ready
curl http://localhost:4000/api/v1/status
```

```bash
# صور Docker الكاملة:
docker build -f Dockerfile -t ray-api:latest .
docker build -f Dockerfile.worker -t ray-worker:latest .

# للـ production (Supabase + Redis خارجي)
docker-compose -f docker-compose.prod.yml up --build
```

الفرونت محليًا (من الجذر): `npm run dev:marketplace` و`npm run dev:dashboard-web` و`npm run dev:business` (أو `npm run dev:all`)، والباك عبر `npm run go:backend:dev`.

---

## ملاحظات مهمة

- **مش محتاج** تشغل NestJS — باك NestJS القديم حُذف 2026-08-24 وبقاياه في `_archive/` فقط. الباك الوحيد هو Go في `gobackend/`.
- الـ migrations بتشتغل عند الإقلاع (يتحكم فيها `DB_MIGRATE_ON_BOOT`) أو يدويًا عبر `go run scripts/migrate.go up`.
- لو عايز تضيف migration جديدة: اعمل ملف `NNNNNN_your_change.up.sql` (و`.down.sql`) في `migrations/`.
- لو المنفذ `4000` مشغول (`bind: address already in use`) فالباك يعمل مسبقًا — تحقق عبر `netstat -ano | findstr :4000`.
- لو ظهر `insufficient_role` على `/shops/me`: امسح `ray_token/token/ray_user` من `localStorage` وأعد الدخول التجريبي من `/admin/gate` (تطوير فقط).
