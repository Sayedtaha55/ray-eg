# Deploy Guide — Supabase + Render/Railway

## الخدمات المطلوبة (كلها مجانية)

| الخدمة | الاستخدام | الرابط |
|--------|-----------|--------|
| Supabase | PostgreSQL database | supabase.com |
| Upstash | Redis | upstash.com |
| Cloudflare R2 | File storage | cloudflare.com |
| Resend | Email | resend.com |
| Render / Railway | Hosting الـ Go API | render.com |

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

# شغل الـ migrations
go run scripts/migrate.go up
```

### 3. Upstash — إعداد Redis

1. روح [upstash.com](https://upstash.com) → Create Database
2. اختار region قريبة
3. انسخ الـ `REDIS_URL` وحطه في `.env.production`

### 4. Cloudflare R2 — إعداد Storage

1. Cloudflare Dashboard → R2 → Create Bucket → اسمه `ray-media`
2. R2 → Manage R2 API Tokens → Create Token
3. حط الـ keys في `.env.production`

### 5. Deploy الـ API على Render

1. روح [render.com](https://render.com) → New Web Service
2. اربطه بالـ GitHub repo
3. الإعدادات:
   - **Root Directory:** `gobackend`
   - **Build Command:** `go build -o api ./cmd/api`
   - **Start Command:** `./api`
4. أضف كل الـ environment variables من `.env.production`

### 6. Deploy الـ Worker على Render

1. New Background Worker
2. نفس الإعدادات بس:
   - **Build Command:** `go build -o worker ./cmd/worker`
   - **Start Command:** `./worker`

---

## بعد الـ Deploy — تحقق

```bash
# Health check
curl https://your-api-domain.com/monitoring/health

# Status
curl https://your-api-domain.com/api/v1/status
```

---

## لو عايز تشغل محلياً بـ Docker

```bash
cd gobackend

# للـ development (مع postgres و redis محليين)
docker-compose up --build

# للـ production (Supabase + Redis خارجي)
docker-compose -f docker-compose.prod.yml up --build
```

---

## ملاحظات مهمة

- **مش محتاج** تشغل Prisma أو NestJS — الـ gobackend مستقل تماماً
- الـ migrations بتشتغل مرة واحدة بس عند أول deploy
- لو عايز تضيف migration جديدة: اعمل ملف `000035_your_change.up.sql` في `migrations/`
