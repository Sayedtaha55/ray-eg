# 3) دليل التشغيل المحلي والإعداد الشامل

## 3.1 متطلبات النظام (System Requirements)

### 3.1.1 المتطلبات الأساسية
**Hardware Requirements:**
- **RAM:** 8GB كحد أدنى، 16GB موصى به
- **Storage:** 10GB مساحة حرة على الأقل
- **Processor:** Modern multi-core processor (Intel i5/AMD Ryzen 5 أو أحدث)

**Software Requirements:**
- **Node.js:** الإصدار 18.x LTS أو 20.x LTS (موصى به 20.x)
- **npm:** الإصدار 9.x أو أحدث (يأتي مع Node.js)
- **Git:** للتحكم في الإصدارات
- **VS Code:** محرر الأكواد الموصى به (مع extensions المذكورة لاحقاً)

### 3.1.2 قواعد البيانات (Database Requirements)
**PostgreSQL (Production-like Development):**
- **Version:** PostgreSQL 14+ أو 15+
- **Tools:** pgAdmin 4 أو DBeaver للإدارة
- **Connection:** Local أو Docker-based PostgreSQL

**SQLite (Quick Development):**
- **Version:** SQLite 3.35+ (مدمج مع Node.js)
- **Tools:** DB Browser for SQLite
- **Use Case:** التطوير السريع والاختبار

**Redis (Optional but Recommended):**
- **Version:** Redis 6.x أو 7.x
- **Use Case:** Caching, sessions, background jobs
- **Installation:** Docker أو native installation

### 3.1.3 الأدوات المساعدة (Development Tools)
**Recommended VS Code Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

**Browser Tools:**
- **Chrome DevTools:** للـ debugging والـ performance analysis
- **React Developer Tools:** لتطوير React
- **Redux DevTools:** (إذا تم استخدام Redux)

## 3.2 الإعداد الأولي للمشروع (Initial Setup)

### 3.2.1 خطوات التثبيت (Installation Steps)

**1. استنساخ المشروع:**
```bash
git clone https://github.com/Sayedtaha55/ray-eg.git
cd ray-eg
```

**2. تثبيت الاعتماديات:**
```bash
# تثبيت جميع الاعتماديات للواجهة الأمامية والخلفية
npm install

# أو إذا واجهت مشاكل، استخدم:
npm ci --force
```

**3. التحقق من التثبيت:**
```bash
# التحقق من إصدارات Node.js و npm
node --version  # يجب أن يكون 18.x أو 20.x
npm --version   # يجب أن يكون 9.x أو أحدث

# التحقق من الاعتماديات المثبتة
npm list --depth=0
```

### 3.2.2 إعداد البيئة (Environment Setup)

**1. إنشاء ملفات البيئة:**
```bash
# نسخ ملف المثال
cp .env.example .env

# إنشاء ملفات البيئة المحلية (إذا لم تكن موجودة)
touch .env.local
```

**2. إعدادات البيئة الأساسية:**
```bash
# .env file - المتغيرات الأساسية
NODE_ENV=development
PORT=4000
BACKEND_PORT=4000

# قاعدة البيانات
DATABASE_URL="postgresql://username:password@localhost:5432/ray_eg_dev"
# أو لـ SQLite:
# DATABASE_URL="file:./dev.db"

# المصادقة
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"

# الواجهة الأمامية
VITE_BACKEND_URL="http://localhost:4000"
VITE_API_BASE_URL="http://localhost:4000/api/v1"
FRONTEND_URL="http://localhost:5174"
FRONTEND_APP_URL="http://localhost:5174"

# CORS
CORS_ORIGIN="http://localhost:5174,http://localhost:3000"

# Redis (اختياري)
REDIS_URL="redis://localhost:6379"

# خدمات خارجية
GEMINI_API_KEY="your-gemini-api-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# التخزين
MEDIA_STORAGE_MODE="local" # أو "s3"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# البريد الإلكتروني (اختياري)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**3. إعدادات البيئة المحلية (.env.local):**
```bash
# .env.local - متغيرات محلية (لا ترفع للـ git)
NODE_ENV=development
DEBUG=true
LOG_LEVEL="debug"

# بيانات التطوير المحلية
DEV_ADMIN_EMAIL="admin@ray-eg.com"
DEV_ADMIN_PASSWORD="admin123"

# إعدادات التطوير
MINIMAL_BOOT=false
BOOT_MODULES="auth,shop,product,order"
```

## 3.3 إعداد قاعدة البيانات (Database Setup)

### 3.3.1 PostgreSQL Setup

**1. تثبيت PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (باستخدام Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# تحميل وتثبيت من postgresql.org
```

**2. إنشاء قاعدة البيانات:**
```bash
# الدخول لـ PostgreSQL
sudo -u postgres psql

# إنشاء المستخدم وقاعدة البيانات
CREATE USER ray_eg_user WITH PASSWORD 'your_password';
CREATE DATABASE ray_eg_dev OWNER ray_eg_user;
GRANT ALL PRIVILEGES ON DATABASE ray_eg_dev TO ray_eg_user;
\q
```

**3. التحقق من الاتصال:**
```bash
# اختبار الاتصال بقاعدة البيانات
psql -h localhost -U ray_eg_user -d ray_eg_dev
```

### 3.3.2 SQLite Setup (Quick Start)

**1. لا حاجة للتثبيت (مدمج):**
```bash
# SQLite جاهز مع Node.js
# فقط تأكد من DATABASE_URL في .env
DATABASE_URL="file:./dev.db"
```

### 3.3.3 Redis Setup (Optional)

**1. تثبيت Redis:**
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
brew services start redis

# Windows
# تحميل من redis.io أو استخدام Docker
docker run -d -p 6379:6379 redis:latest
```

**2. التحقق من Redis:**
```bash
redis-cli ping
# يجب أن تعود بـ "PONG"
```

### 3.3.4 إعداد Prisma

**1. توليد Prisma Client:**
```bash
npm run prisma:generate
```

**2. مزامنة قاعدة البيانات:**
```bash
# للتطوير (يحذف البيانات)
npm run prisma:push

# للإنتاج (يحافظ على البيانات)
npm run prisma:migrate:deploy
```

**3. ملء البيانات الأولية (Seeding):**
```bash
npm run prisma:seed
```

**4. التحقق من قاعدة البيانات:**
```bash
# عرض قاعدة البيانات
npm run prisma:studio

# التحقق من الـ schema
npm run prisma:validate
```

## 3.4 تشغيل الخدمات (Running Services)

### 3.4.1 تشغيل الواجهة الخلفية (Backend)

**1. التشغيل العادي:**
```bash
npm run backend:dev
```
**النتيجة:** Backend يعمل على `http://localhost:4000`

**2. التشغيل مع Debugging:**
```bash
npm run backend:dev:debug
```

**3. التشغيل مع Watch Mode:**
```bash
npm run backend:dev:watch
```

**4. التحقق من عمل Backend:**
```bash
# اختبار health endpoint
curl http://localhost:4000/health

# اختبار API endpoint
curl http://localhost:4000/api/v1/auth/session
```

### 3.4.2 تشغيل الواجهة الأمامية (Frontend)

**1. التشغيل العادي:**
```bash
npm run dev
```
**النتيجة:** Frontend يعمل على `http://localhost:5174`

**2. التشغيل مع HTTPS:**
```bash
npm run dev:https
```

**3. التحقق من عمل Frontend:**
```bash
# افتح المتصفح على
http://localhost:5174
```

### 3.4.3 التشغيل المتزامن (Concurrent Development)

**1. تشغيل الخدمتين معاً:**
```bash
# في نافذة واحدة
npm run dev:concurrent

# أو باستخدام concurrently
npm run dev:all
```

**2. باستخدام Docker Compose:**
```bash
# تشغيل جميع الخدمات مع Docker
docker-compose -f docker-compose.dev.yml up
```

## 3.5 أوضاع التشغيل المتقدمة (Advanced Boot Modes)

### 3.5.1 Minimal Boot Mode
```bash
# تشغيل الحد الأدنى من الموديولات
MINIMAL_BOOT=true npm run backend:dev

# أو باستخدام السكربت المخصص
npm run backend:dev:minimal
```
**الموديولات المشغلة:**
- Health checks
- Basic authentication
- Core utilities

### 3.5.2 Feature-Specific Boot
```bash
# تشغيل موديولات محددة
BOOT_MODULES=auth,shop,product npm run backend:dev

# أو باستخدام السكربتات المخصصة
npm run backend:dev:auth          # Auth فقط
npm run backend:dev:shop-product  # Shop + Product
npm run backend:dev:full          # جميع الموديولات
```

### 3.5.3 Development Scripts
```bash
# سكربتات التطوير المتاحة
npm run backend:dev:stable    # إعدادات تطوير مستقرة
npm run backend:dev:debug     # مع debugging إضافي
npm run backend:dev:verbose   # مع logging مفصل
npm run backend:dev:watch     # مع file watching
```

## 3.6 الأوامر والفحوصات الهامة (Essential Commands)

### 3.6.1 Type Checking
```bash
# فحص TypeScript للواجهة الأمامية
npm run typecheck

# فحص TypeScript للواجهة الخلفية
npm run backend:typecheck

# فحص شامل للنظام بأكمله
npm run typecheck:all
```

### 3.6.2 Testing
```bash
# تشغيل جميع الاختبارات
npm run test

# اختبارات الواجهة الأمامية
npm run test:frontend

# اختبارات الواجهة الخلفية
npm run test:backend

# اختبارات e2e
npm run test:e2e

# اختبارات التغطية
npm run test:coverage
```

### 3.6.3 Code Quality
```bash
# فحص ESLint
npm run lint

# إصلاح ESLint تلقائياً
npm run lint:fix

# فحص Prettier
npm run format:check

# تنسيق الكود تلقائياً
npm run format:write
```

### 3.6.4 Build Commands
```bash
# بناء الواجهة الأمامية
npm run build

# بناء الواجهة الخلفية
npm run backend:build

# بناء للإنتاج
npm run build:production

# تحليل حجم البناء
npm run build:analyze
```

### 3.6.5 Database Commands
```bash
# توليد Prisma client
npm run prisma:generate

# مزامنة قاعدة البيانات
npm run prisma:push

# إنشاء migration جديد
npm run prisma:migrate:dev

# تطبيق migrations
npm run prisma:migrate:deploy

# عرض قاعدة البيانات
npm run prisma:studio

# إعادة تعيين قاعدة البيانات
npm run prisma:reset
```

## 3.7 سير العمل اليومي (Daily Workflow)

### 3.7.1 بداية اليوم
```bash
# 1. تحديث الكود
git pull origin main

# 2. تحديث الاعتماديات
npm install

# 3. تحديث قاعدة البيانات
npm run prisma:generate
npm run prisma:push

# 4. تشغيل الخدمات
npm run dev:concurrent
```

### 3.7.2 أثناء التطوير
```bash
# 1. فحص الأنواع
npm run typecheck

# 2. تشغيل الاختبارات
npm run test

# 3. فحص الكود
npm run lint

# 4. تنسيق الكود
npm run format:write
```

### 3.7.3 نهاية اليوم
```bash
# 1. إجراء اختبارات شاملة
npm run checks

# 2. بناء المشروع
npm run build

# 3. commit التغييرات
git add .
git commit -m "Daily work completed"

# 4. push التغييرات
git push origin main
```

## 3.8 حل المشاكل الشائعة (Common Issues)

### 3.8.1 مشاكل التثبيت
**Problem:** `npm install` يفشل
```bash
# الحل 1: مسح cache
npm cache clean --force

# الحل 2: حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install

# الحل 3: استخدام npm ci
npm ci --force
```

**Problem:** أخطاء في Prisma
```bash
# الحل: إعادة توليد client
npx prisma generate
npm run prisma:generate
```

### 3.8.2 مشاكل قاعدة البيانات
**Problem:** فشل الاتصال بقاعدة البيانات
```bash
# التحقق من PostgreSQL
sudo systemctl status postgresql

# التحقق من الاتصال
psql -h localhost -U username -d database_name

# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql
```

**Problem:** Schema mismatch
```bash
# إعادة مزامنة قاعدة البيانات
npm run prisma:push --force-reset
```

### 3.8.3 مشاكل التشغيل
**Problem:** Port conflicts
```bash
# البحث عن العمليات التي تستخدم الـ ports
netstat -tulpn | grep :4000
netstat -tulpn | grep :5174

# قتل العمليات
sudo kill -9 <PID>

# أو تغيير الـ ports في .env
PORT=4001
VITE_PORT=5175
```

**Problem:** CORS errors
```bash
# التحقق من إعدادات CORS في .env
CORS_ORIGIN="http://localhost:5174,http://localhost:3000"

# التأكد من تطابق الـ URLs
FRONTEND_URL="http://localhost:5174"
VITE_BACKEND_URL="http://localhost:4000"
```

## 3.9 أدوات التطوير المتقدمة (Advanced Development Tools)

### 3.9.1 Docker Development
```bash
# بناء Docker images
docker build -t ray-eg-frontend .
docker build -t ray-eg-backend -f Dockerfile.dev .

# تشغيل مع Docker Compose
docker-compose -f docker-compose.dev.yml up

# إيقاف Docker Compose
docker-compose -f docker-compose.dev.yml down
```

### 3.9.2 Performance Monitoring
```bash
# تثبيت أدوات المراقبة
npm install -g clinic

# مراقبة الأداء
clinic doctor -- node dist/backend/main.js
clinic bubbleprof -- node dist/backend/main.js
clinic flame -- node dist/backend/main.js
```

### 3.9.3 Load Testing
```bash
# تثبيت k6 للـ load testing
npm install -g k6

# تشغيل load test
k6 run scripts/load-test.js

# أو باستخدام السكربت المدمج
npm run loadtest:k6
```

## 3.10 التحقق من النجاح (Success Checklist)

### 3.10.1 Installation Checklist
- [ ] Node.js 18+ أو 20+ مثبت
- [ ] npm 9+ مثبت
- [ ] PostgreSQL أو Redis جاهز (اختياري)
- [ ] المشروع مستنسخ بنجاح
- [ ] الاعتماديات مثبتة بدون أخطاء
- [ ] ملفات البيئة معدلة بشكل صحيح

### 3.10.2 Database Checklist
- [ ] قاعدة البيانات متصلة و تعمل
- [ ] Prisma client تم توليده بنجاح
- [ ] Database schema تم مزامنته
- [ ] البيانات الأولية تم إضافتها (seed data)
- [ ] Prisma studio يعمل و يعرض البيانات

### 3.10.3 Backend Checklist
- [ ] Backend يعمل على البورت الصحيح (4000)
- [ ] Health endpoint يعمل (`/health`)
- [ ] API endpoints تستجيب (`/api/v1/*`)
- [ ] Authentication تعمل
- [ ] لا توجد أخطاء في الـ console
- [ ] Database queries تعمل بنجاح

### 3.10.4 Frontend Checklist
- [ ] Frontend يعمل على البورت الصحيح (5174)
- [ ] الصفحة الرئيسية تعرض بشكل صحيح
- [ ] Routing يعمل بين الصفحات
- [ ] API calls تعمل بدون أخطاء CORS
- [ ] Components تعرض بشكل صحيح
- [ ] لا توجد أخطاء في browser console

### 3.10.5 Integration Checklist
- [ ] Frontend يتصل بـ Backend بنجاح
- [ ] Authentication flow يعمل بالكامل
- [ ] Data flow بين الواجهتين يعمل
- [ ] Real-time updates تعمل (WebSocket)
- [ ] Error handling يعمل بشكل صحيح
- [ ] Performance مقبولة للتطوير

## 3.11 النصائح والحيل (Tips & Tricks)

### 3.11.1 Development Tips
- استخدم `npm run dev:concurrent` لتشغيل الخدمتين معاً
- استخدم `MINIMAL_BOOT=true` للتطوير السريع
- استخدم `BOOT_MODULES` لتشغيل موديولات محددة
- استخدم `npm run prisma:studio` لعرض قاعدة البيانات

### 3.11.2 Performance Tips
- استخدم `npm run build:analyze` لتحليل حجم البناء
- استخدم `npm run typecheck` للكشف عن الأخطاء مبكراً
- استخدم `npm run lint:fix` لإصلاح أخطاء الكود تلقائياً
- استخدم `npm run test:watch` لاختبار مستمر

### 3.11.3 Debugging Tips
- استخدم `console.log` مع `DEBUG=true` للـ logging المفصل
- استخدم `npm run backend:dev:debug` للـ debugging المتقدم
- استخدم `npm run prisma:studio` لتصحيح أخطاء قاعدة البيانات
- استخدم browser DevTools لتصحيح أخطاء الواجهة الأمامية
