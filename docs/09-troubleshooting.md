# 9) استكشاف الأعطال وإصلاحها الشامل

## 9.1 مشاكل الواجهة الأمامية (Frontend Issues)

### 9.1.1 مشكلة: Frontend يعمل لكن لا تظهر بيانات
**الأعراض:**
- الصفحة تفتح لكن القوائم فارغة
- أخطاء network في المتصفح (404, 500, timeout)
- Loading spinner يدور بدون توقف

**التشخيص السريع:**
1. تحقق من تشغيل Backend:
   ```bash
   curl http://localhost:4000/health
   ```
2. تحقق من متغيرات البيئة:
   ```bash
   # في مجلد components
   echo $VITE_API_BASE_URL
   ```
3. تحقق من الـ Network tab في DevTools:
   - ابحث عن طلبات API الفاشلة
   - تحقق من status codes
   - راجع response headers

**الحلول:**
```bash
# 1. تحقق من إعدادات البيئة
echo "VITE_API_BASE_URL: $VITE_API_BASE_URL"
echo "VITE_APP_NAME: $VITE_APP_NAME"

# 2. أعد تشغيل الخدمات
npm run dev:backend
npm run dev:frontend

# 3. تحقق من الاتصال
curl -I http://localhost:4000/api/v1/health
```

**البيانات المطلوبة للإبلاغ عن المشكلة:**
- نسخة من Network tab (request/response)
- متغيرات البيئة الحالية
- خطأء الـ console في المتصفح
- إصدار المتصفح ونظام التشغيل

---

### 9.1.2 مشكلة: CORS Policy Blocked
**الأعراض:**
- رسائل `Access to fetch at 'URL' from origin 'origin' has been blocked by CORS policy`
- أخطاء 403 Preflight request

**التشخيص السريع:**
1. تحقق من الـ Origin في طلبات المتصفح
2. قارن مع إعدادات CORS في Backend
3. راجع متغيرات البيئة:
   ```bash
   echo "CORS_ORIGIN: $CORS_ORIGIN"
   echo "FRONTEND_URL: $FRONTEND_URL"
   ```

**الحلول:**
```bash
# 1. أضف الـ Origin الصحيح
# في .env.local
CORS_ORIGIN=http://localhost:5174,https://yourdomain.com
FRONTEND_URL=http://localhost:5174
FRONTEND_APP_URL=http://localhost:5174

# 2. أعد تشغيل Backend
npm run dev:backend

# 3. تحقق من الإعدادات
curl -H "Origin: http://localhost:5174" http://localhost:4000/api/v1/health
```

**البيانات المطلوبة:**
- رسالة الخطأ الكاملة
- الـ Origin المطلوب
- إعدادات CORS الحالية
- headers الطلب

---

### 9.1.3 مشكلة: Build Errors
**الأعراض:**
- أخطاء TypeScript أثناء البناء
- أخطاء Vite build
- تحذيرات الـ dependencies

**التشخيص السريع:**
```bash
# تحقق من الأخطاء
npm run build
npm run type-check

# تحقق من الـ dependencies
npm audit
npm ls
```

**الحلول:**
```bash
# 1. تحديث الـ dependencies
npm update

# 2. حذف node_modules و reinstall
rm -rf node_modules package-lock.json
npm install

# 3. تحقق من TypeScript
npm run type-check

# 4. بناء مرة أخرى
npm run build
```

---

### 9.1.4 مشكلة: Performance Issues
**الأعراض:**
- التطبيق بطيء جداً
- Memory usage عالي
- CPU usage مرتفع

**التشخيص السريع:**
1. افتح DevTools Performance tab
2. تحقق من Lighthouse score
3. راجع Network waterfall
4. تحقق من Memory usage

**الحلول:**
```typescript
// 1. تفحص الـ lazy loading
const LazyComponent = React.lazy(() => import('./Component'));

// 2. تحسين الـ bundle
// في vite.config.ts
manualChunks: {
  vendor: ['react', 'react-dom'],
  router: ['react-router-dom'],
}

// 3. استخدم React.memo للمكونات المكلفة
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render data */}</div>;
});
```

---

## 9.2 مشاكل الواجهة الخلفية (Backend Issues)

### 9.2.1 مشكلة: Database Connection Failed
**الأعراض:**
- `PrismaClientInitializationError: Unable to connect to the database`
- `Connection timeout`
- `Database connection refused`

**التشخيص السريع:**
```bash
# 1. اختبر اتصال قاعدة البيانات
psql -h localhost -U username -d database_name

# 2. تحقق من متغيرات البيئة
echo $DATABASE_URL

# 3. اختبر Prisma
npx prisma db pull
npx prisma generate
```

**الحلول:**
```bash
# 1. تحقق من تشغيل PostgreSQL
sudo systemctl status postgresql
# أو
brew services list | grep postgresql

# 2. تحقق من الـ URL
# تأكد من صحة اسم المستخدم وكلمة المرور
# تأكد من اسم قاعدة البيانات

# 3. مزامنة قاعدة البيانات
npx prisma generate
npx prisma db push

# 4. إعادة تشغيل Backend
npm run dev:backend
```

**البيانات المطلوبة:**
- نسخة من خطأ الاتصال الكامل
- متغيرات DATABASE_URL (بدون بيانات حساسة)
- نسخة من `prisma/schema.prisma`
- إصدار PostgreSQL

---

### 9.2.2 مشكلة: Backend Startup Failure
**الأعراض:**
- الخادم لا يبدأ على الإطلاق
- أخطاء `EADDRINUSE` (port in use)
- أخطاء `MODULE_NOT_FOUND`

**التشخيص السريع:**
```bash
# 1. تحقق من البورت
lsof -i :4000
netstat -an | grep :4000

# 2. تحقق من الـ logs
npm run dev:backend

# 3. تحقق من الـ dependencies
npm ls backend/node_modules
```

**الحلول:**
```bash
# 1. قتل العملية التي تستخدم البورت
sudo kill -9 <PID>

# 2. تحقق من الـ dependencies
cd backend
npm install

# 3. تحقق من الـ environment variables
cat .env.local

# 4. أعد تشغيل Backend
npm run dev:backend
```

---

### 9.2.3 مشكلة: Module Loading Issues
**الأعراض:**
- `Error: Cannot find module 'module-name'`
- أخطاء `MODULE_NOT_FOUND`
- أخطاء import/export

**التشخيص السريع:**
```bash
# 1. تحقق من الـ package.json
cat package.json | grep -A 5 -B 5 "module-name"

# 2. تحقق من الـ node_modules
ls node_modules/module-name

# 3. تحقق من الـ imports
grep -r "import.*module-name" src/
```

**الحلول:**
```bash
# 1. تثبيت الـ module المفقود
npm install module-name

# 2. تحقق من الـ TypeScript paths
# في tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

# 3. أعد تشغيل Backend
npm run dev:backend
```

---

### 9.2.4 مشكلة: Memory Leaks
**الأعراض:**
- Memory usage يزداد باستمر
- الخادم يصبح بطيئاً مع الوقت
- `JavaScript heap out of memory`

**التشخيص السريع:**
```bash
# 1. مراقبة الـ memory usage
top -p <PID>
htop

# 2. تحقق من الـ leaks
node --inspect --trace-warnings backend/dist/main.js

# 3. تحليل الـ heap
node --inspect --heap-prof backend/dist/main.js
```

**الحلول:**
```typescript
// 1. استخدم weak references للـ cache
const cache = new WeakMap();

// 2. نظّف الـ event listeners
// أضف `once: true` للـ listeners التي تحتاجها مرة واحدة

// 3. استخدم `clearInterval` و `clearTimeout`
const intervalId = setInterval(() => {}, 1000);
clearInterval(intervalId);

// 4. أغلق الـ database connections
await prisma.$disconnect();
```

---

## 9.3 مشاكل قاعدة البيانات (Database Issues)

### 9.3.1 مشكلة: Schema Mismatch
**الأعراض:**
- `Schema mismatch: The database schema does not match the Prisma schema`
- أخطاء في الـ migrations

**التشخيص السريع:**
```bash
# 1. تحقق من حالة الـ migrations
npx prisma migrate status

# 2. قارن الـ schema مع قاعدة البيانات
npx prisma db pull

# 3. تحقق من الـ generated client
npx prisma generate
```

**الحلول:**
```bash
# 1. مزامنة الـ schema
npx prisma db push

# 2. إذا كانت البيانات غير مهمة:
npx prisma migrate reset

# 3. إنشاء ترحيل جديد
npx prisma migrate dev --name fix_schema_mismatch
```

---

### 9.3.2 مشكلة: Migration Conflicts
**الأعراض:**
- `Migration failed with error: relation "table_name" already exists`
- أخطاء في تطبيق الترحيلات

**التشخيص السريع:**
```bash
# 1. عرض حالة الترحيلات
npx prisma migrate status

# 2. حل الترحيلات المعلقة
npx prisma migrate resolve

# 3. عرض تفاصيل الخطأ
npx prisma migrate diff
```

**الحلول:**
```bash
# 1. حل الترحيلات يدوياً
npx prisma migrate resolve --applied 20231201120000_add_user_roles

# 2. إذا لم ينجح، قم بإنشاء ترحيل جديد
npx prisma migrate dev --name fix_conflict
```

---

### 9.3.3 مشكلة: Performance Issues
**الأعراض:**
- استعلامات بطيئة جداً
- قفلوف على الـ tables
- high CPU usage

**التشيص السريع:**
```sql
-- 1. تحقق من الـ slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- 2. تحقق من الـ locks
SELECT blocked_locks.pid,
       blocked_locks.mode,
       blocked_locks.locktype,
       blocked_locks.relation
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
  ON blocked_activity.pid = blocked_locks.pid;

-- 3. تحقق من الـ table sizes
SELECT schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**الحلول:**
```sql
-- 1. إنشاء الـ indexes
CREATE INDEX CONCURRENTLY idx_products_shop_id ON products(shop_id);
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);

-- 2. تحليل الـ slow queries
EXPLAIN ANALYZE SELECT * FROM products WHERE shop_id = 'shop_id' AND price > 100;

-- 3. تحديث الإحصائصات
VACUUM ANALYZE products;
ANALYZE products;
```

---

## 9.4 مشاكل المصادقة (Authentication Issues)

### 9.4.1 مشكلة: Token Issues
**الأعراض:**
- `Invalid or expired token`
- `JWT malformed`
- `Token verification failed`

**التشخيص السريع:**
```bash
# 1. تحقق من الـ JWT secret
echo $JWT_SECRET | wc -c
# يجب أن يكون 32 حرف على الأقل

# 2. تحقق من الـ token payload
echo $JWT_TOKEN | cut -d. -f2 | base64 -d | jq .

# 3. تحقق من الـ expiration
echo $JWT_EXPIRES_IN
```

**الحلول:**
```typescript
// 1. تحقق من الـ token
const token = req.headers.authorization?.replace('Bearer ', '');
if (!token) {
  throw new UnauthorizedException('No token provided');
}

// 2. تحقق من الـ token signature
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
  throw new UnauthorizedException('Invalid token');
}

// 3. تحقق من الـ token expiration
if (decoded.exp < Date.now() / 1000) {
  throw new UnauthorizedException('Token expired');
}
```

---

### 9.4.2 مشكلة: Password Issues
**الأعراض:**
- `Invalid password`
- `Password too weak`
- `Password reset failed`

**التشيص السريع:**
```typescript
// تحقق من قوة كلمة المرور
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  throw new BadRequestException('Password too weak');
}
```

**الحلول:**
```typescript
// 1. تطبيق سياسة كلمات المرور قوية
const bcrypt = require('bcryptjs');
const saltRounds = 12;

const hashedPassword = await bcrypt.hash(password, saltRounds);

// 2. تحقق من كلمة المرور
const isValid = await bcrypt.compare(password, hashedPassword);
if (!isValid) {
  throw new UnauthorizedException('Invalid password');
}
```

---

### 9.4.3 مشكلة: Session Issues
**الأعراض:**
- `Session not found`
- `Session expired`
- `Invalid session`

**الحلول:**
```typescript
// 1. استخدم refresh tokens
const refreshToken = req.cookies.refreshToken;
if (!refreshToken) {
  throw new UnauthorizedException('No refresh token');
}

// 2. تحقق من الـ refresh token
try {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const newAccessToken = jwt.sign(
    { userId: decoded.userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  return { accessToken: newAccessToken };
} catch (error) {
  throw new UnauthorizedException('Invalid refresh token');
}
```

---

## 9.5 مشاكل التخزين والملفات (Storage & File Issues)

### 9.5.1 مشكلة: File Upload Failed
**أعراض:**
- `File too large`
- `Invalid file type`
- `Upload directory not found`

**التشخيص السريع:**
```bash
# 1. تحقق من حجم الملف
ls -lh file.jpg

# 2. تحقق من نوع الملف
file file.jpg

# 3. تحقق من صلاحيات المجلد
ls -la uploads/
```

**الحلول:**
```typescript
// 1. تحقق من حجم الملف
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  throw new BadRequestException('File too large');
}

// 2. تحقق من نوع الملف
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type');
}

// 3. إنشاء المجلد إذا لم يكن موجوداً
const fs = require('fs');
const path = require('path');
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

---

### 9.5.2 مشكلة: S3 Upload Issues
**أعراض:**
- `Access Denied`
- `Invalid bucket name`
- `Network timeout`

**التشخيص السريع:**
```bash
# 1. تحقق من صلاحيات الـ S3
aws s3 ls s3://your-bucket-name

# 2. تحقق من الـ credentials
aws sts get-caller-identity

# 3. تحقق من الـ bucket policy
aws s3api get-bucket-policy --bucket your-bucket-name
```

**الحلول:**
```typescript
// 1. تحقق من صلاحيات الـ bucket
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// 2. تحقق من وجود الـ bucket
try {
  await s3.headObject({ Bucket: bucketName, Key: fileName });
} catch (error) {
  if (error.code === 'NotFound') {
    // إنشاء الـ bucket
    await s3.createBucket({ Bucket: bucketName });
  }
}
```

---

## 9.6 مشاكل الأداء (Performance Issues)

### 9.6.1 مشكلة: Slow Response Times
**الأعراض:**
- API responses بطيئة (>2s)
- High latency
- Timeout errors

**التشخيص السريع:**
```bash
# 1. تحقق من الـ response times
curl -w "Response time: %{time_total}s\n" http://localhost:4000/api/v1/products

# 2. تحقق من الـ server load
top
htop

# 3. تحقق من الـ database queries
npx prisma studio
```

**الحلول:**
```typescript
// 1. استخدم الـ caching
const cache = new Map();

// 2. تحسين الـ database queries
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
  where: {
    isActive: true,
  },
  take: 20,
  skip: (page - 1) * 20,
});

// 3. استخدم الـ connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

---

### 9.6.2 مشكلة: High Memory Usage
**الأعراض:**
- Memory usage > 80%
- `JavaScript heap out of memory`
- System becomes unresponsive

**التشيص السريع:**
```bash
# 1. مراقبة الـ memory usage
free -h
top -p <PID>

# 2. تحليل الـ heap
node --inspect --heap-prof backend/dist/main.js
```

**الحلول:**
```typescript
// 1. استخدم الـ streaming للبيانات الكبيرة
const stream = fs.createReadStream('large-file.json');
const chunks = [];

for await (const chunk of stream) {
  chunks.push(chunk);
}

// 2. استخدم الـ pagination
const items = await prisma.product.findMany({
  take: 100,
  skip: (page - 1) * 100,
});

// 3. حرر الـ references
const weakCache = new WeakMap();
```

---

### 9.6.3 مشكلة: Database Locks
**أعراض:**
- `Deadlock detected`
- `Lock wait timeout`
- Transactions failing

**التشخيص السريع:**
```sql
-- 1. تحقق من الـ locks
SELECT blocked_locks.pid,
       blocked_locks.mode,
       blocked_locks.locktype,
       blocked_locks.relation
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
  ON blocked_activity.pid = blocked_locks.pid;

-- 2. تحقق من الـ long-running transactions
SELECT pid,
       age(clock_timestamp(), query_start),
       state,
       query
FROM pg_stat_activity
WHERE state = 'active'
  AND age(clock_timestamp(), query_start) > '5 minutes';
```

**الحلول:**
```sql
-- 1. قتل الـ lock
SELECT pg_cancel_backend(<PID>);

-- 2. تحسين الـ transactions
-- استخدم الـ transactions للعمليات القصيرة فقط
BEGIN;
-- عملك هنا
COMMIT;

-- 3. تجنب الـ long-running transactions
-- قسّم العمليات الكبيرة إلى عمليات أصغر
```

---

## 9.7 مشاكل النشر (Deployment Issues)

### 9.7.1 مشكلة: Build Failed
**الأعراض:**
- Build errors في CI/CD
- Dependencies installation failed
- Environment variables missing

**التشخيص السريع:**
```bash
# 1. تحقق من الـ build logs
npm run build:prod

# 2. تحقق من الـ environment
printenv | grep -E "NODE_ENV|DATABASE_URL|JWT_SECRET"

# 3. تحقق من الـ dependencies
npm ci
```

**الحلول:**
```bash
# 1. تحديث الـ dependencies
npm ci

# 2. تحقق من الـ environment variables
# تأكد من وجود جميع المتغيرات المطلوبة

# 3. بناء مرة أخرى
npm run build:prod
```

---

### 9.7.2 مشكلة: Container Issues
**أعراض:**
- Container fails to start
- Container crashes
- Port conflicts

**التشيص السريع:**
```bash
# 1. تحقق من الـ container logs
docker logs <container_name>

# 2. تحقق من الـ container status
docker ps -a

# 3. تحقق من الـ container resources
docker stats <container_name>
```

**الحلول:**
```dockerfile
# 1. استخدم الـ health checks
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# 2. استخدم الـ non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 3. استخدم الـ multi-stage builds
FROM node:20-alpine AS builder
# build steps
FROM node:20-alpine AS production
# production steps
```

---

### 9.7.3 مشكلة: Environment Variables
**الأعراض:**
- `Environment variable not found`
- `undefined` values
- Configuration errors

**التشخيص السريع:**
```bash
# 1. تحقق من الـ environment variables
printenv | grep -E "NODE_ENV|DATABASE_URL|JWT_SECRET"

# 2. تحقق من الـ .env files
cat .env.local
cat .env.production

# 3. تحقق من الـ platform variables
# Vercel: vercel env ls
# Railway: railway variables list
```

**الحلول:**
```bash
# 1. استخدم الـ .env.local لـ local development
cp .env.example .env.local

# 2. أضف جميع المتغيرات المطلوبة
echo "NODE_ENV=production" >> .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local

# 3. استخدم الـ platform variables للإنتاج
# Vercel: vercel env add
# Railway: railway variables set
```

---

## 9.8 أدوات التشخيص (Diagnostic Tools)

### 9.8.1 Frontend Tools
```bash
# 1. Browser DevTools
# - Network tab: لمراقبة الـ requests
# - Performance tab: لتحليل الأداء
# - Console: لعرض الأخطاء
# - Application tab: لمراقبة الـ memory

# 2. React DevTools
npm install @reduxjs/toolkit
# أضف في store setup

# 3. Lighthouse
npm install -g lighthouse
lighthouse http://localhost:5174
```

### 9.8.2 Backend Tools
```bash
# 1. Prisma Studio
npx prisma studio

# 2. Node.js Inspector
node --inspect backend/dist/main.js

# 3. Memory Profiling
node --inspect --heap-prof backend/dist/main.js

# 4. CPU Profiling
node --inspect --prof backend/dist/main.js
```

### 9.8.3 Database Tools
```bash
# 1. psql
psql -h localhost -U username -d database_name

# 2. pgAdmin
# استخدم واجهة الـ web

# 3. Database Analysis
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_stat_statements;
```

### 9.8.4 System Monitoring
```bash
# 1. System Resources
top
htop
free -h
df -h

# 2. Network Tools
netstat -an
ss -tulpn

# 3. Process Monitoring
ps aux
ps -ef | grep node
```

---

## 9.9 البيانات المطلوبة للإبلاغ عن المشاكل

### 9.9.1 معلومات أساسية
- **الإصدار:** Ray v1.0.0
- **البيئة:** Development/Production
- **الـ OS:** Windows/Linux/macOS
- **الـ Node.js:** v20.x
- **الـ Browser:** Chrome/Firefox/Safari

### 9.9.2 الخطأ الكامل
- **رسالة الخطأ:** النص الكامل للخطأ
- **Stack Trace:** كامل الـ stack trace إن وجد
- **Timestamp:** وقت حدوث الخطأ
- **URL:** الـ URL الذي حدث فيه الخطأ (إن وجد)

### 9.9.3 السياق
- **ما كنت تفعل:** الخطوات التي أدت إلى الخطأ
- **الـ Page/Route:** الصفحة أو الـ route الذي كنت عليه
- **الـ User Action:** الإجراء الذي قمت به

### 9.9.4 البيئة
- **Environment Variables:** قائمة بالمتغيرات الحالية (بدون قيم حساسة)
- **Browser:** نوع ومعلومات المتصفح
- **Device:** معلومات الجهاز

### 9.9.5 Logs
- **Console Errors:** أخطاء الـ console في المتصفح
- **Network Requests:** قائمة بالطلبات الفاشلة
- **Server Logs:** سجلات الـ server (إن وجدت)

### 9.9.6 الإعدادات
- **Package.json:** محتويات الـ package.json
- **Environment Files:** نسخة من الـ .env files
- **Configuration Files:** إعدادات التطبيق

### 9.9.7 الخطوات التي تم تجربتها
- **Steps Taken:** الخطوات التي قمت بها لحل المشكلة
- **Expected vs Actual:** ما كنت تتوقع مقابل ما حدث

---

## 9.10 قائمة المراجعة السريعة (Quick Reference)

### 9.10.1 Frontend Issues
1. **No data loading:** تحقق من API URL و CORS
2. **Build errors:** تحقق من TypeScript و dependencies
3. **Performance:** استخدم DevTools و Lighthouse
4. **Routing:** تحقق من React Router configuration

### 9.10.2 Backend Issues
1. **Database connection:** تحقق من DATABASE_URL و PostgreSQL
2. **Module loading:** تحقق من dependencies و imports
3. **Authentication:** تحقق من JWT secrets and tokens
4. **Performance:** تحقق من database queries and caching

### 9.10.3 Database Issues
1. **Schema mismatch:** استخدم `npx prisma db push`
2. **Migration conflicts:** استخدم `npx prisma migrate resolve`
3. **Performance:** تحقق من indexes و slow queries
4. **Locks:** استخدم `pg_stat_activity` و `pg_locks`

### 9.10.4 Deployment Issues
1. **Build failures:** تحقق من environment variables
2. **Container issues:** تحقق من Docker configuration
3. **Environment variables:** تحقق من platform settings
4. **Health checks:** تحقق من health endpoints

هذا الدليل الشامل يغطي معظم المشاكل الشائعة في تطوير Ray مع حلول مفصل وتفصيلي لكل مشكلة.
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
