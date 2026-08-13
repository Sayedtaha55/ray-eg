# ⚡ دليل البدء السريع - Quick Start & Troubleshooting

**الهدف:** تشغيل النظام واختباره في 5 دقائق

---

## 🚀 1️⃣ **تحضير البيئة (5 دقائق)**

### الخطوة 1: قاعدة البيانات
```bash
# تأكد من تشغيل PostgreSQL
docker-compose up -d postgres redis

# تحقق من الاتصال
psql -U ray_user -d ray_marketplace -c \"SELECT version();\"

# إذا فشل، تحقق من:
# - .env file موجود و صحيح
# - DATABASE_URL صحيح: postgresql://ray_user:ray_password@localhost:5433/ray_marketplace
```

### الخطوة 2: Go Backend
```bash
# من مجلد gobackend
cd gobackend

# تنزيل المكتبات
go mod download

# تشغيل الـ Backend
go run ./cmd/api

# يجب أن تظهر:
# ✅ \"Server started on :4000\"
# ✅ \"Database connected\"
# ✅ \"Redis connected (best-effort)\"
```

### الخطوة 3: Frontend Marketplace
```bash
# من مجلد جديد في terminal
cd apps/marketplace-next

# تحقق من .env.local
# يجب أن يحتوي على:
# NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:4000

npm install  # إذا لم تثبت من قبل
npm run dev

# يجب أن يفتح على http://localhost:5174
```

### الخطوة 4: Dashboard (اختياري)
```bash
# في terminal جديد
cd apps/dashboard-web

npm install  # إذا لم تثبت من قبل
npm run dev

# يجب أن يفتح على http://localhost:3000
```

---

## 🧪 2️⃣ **اختبارات سريعة**

### Test 1: Health Check
```bash
# تحقق من أن Go backend يعمل
curl http://localhost:4000/monitoring/ready

# يجب أن ترى:
# {\"status\":\"ready\"}
```

### Test 2: CORS Test
```bash
# من الـ Browser Console في Marketplace
fetch('http://localhost:4000/api/v1/products', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('CORS OK:', d))
.catch(e => console.error('CORS ERROR:', e))

# يجب أن ترى البيانات بدون CORS error
```

### Test 3: Login Test
```bash
# من Marketplace
1. اذهب إلى http://localhost:5174/login
2. استخدم بيانات تجريبية من database
   أو من Dev Merchant Bootstrap في Dashboard

# يجب أن يتم حفظ Token و التوجيه للـ Profile
```

### Test 4: Orders Test
```bash
# من Marketplace Checkout
1. أضف منتجات للسلة
2. اذهب إلى /checkout
3. ملأ البيانات
4. اضغط \"Place Order\"

# تحقق من Network tab:
# POST /api/v1/orders → 201 Created
```

---

## 🔍 3️⃣ **Debugging & Logging**

### Log Level في Backend
```bash
# اجعل الـ logs أكثر وضوحاً
export LOG_LEVEL=debug
go run ./cmd/api

# أو في .env:
LOG_LEVEL=debug
```

### Browser Network Tab
```
Ctrl+Shift+I → Network tab

تحقق من:
1. Request Headers:
   ✅ Authorization: Bearer <token>
   ✅ Content-Type: application/json
   ✅ Origin: http://localhost:5174

2. Response Headers:
   ✅ Access-Control-Allow-Origin: http://localhost:5174
   ✅ Access-Control-Allow-Credentials: true

3. Response Body:
   ✅ { \"success\": true, \"data\": {...} }
```

### Go Backend Errors
```bash
# في terminal حيث يعمل Go backend
# ستظهر أخطاء مثل:

# ❌ \"database connection failed\"
#    → تحقق من PostgreSQL و DATABASE_URL

# ❌ \"CORS origin not allowed\"
#    → تحقق من CORS_ORIGIN في .env

# ❌ \"invalid token\"
#    → تحقق من JWT_SECRET و token validity
```

---

## 🛠️ 4️⃣ **المشاكل الشائعة و الحلول**

### مشكلة 1: \"CORS Error in Console\"
```
Error: Access to XMLHttpRequest at 'http://localhost:4000/api/v1/products'
from origin 'http://localhost:5174' has been blocked by CORS policy

الحل:
1. تحقق من gobackend/.env:
   CORS_ORIGIN=http://localhost:5174,http://localhost:3000

2. أعد تشغيل Go backend:
   Ctrl+C (في terminal)
   go run ./cmd/api

3. نظف الـ Browser cache:
   Ctrl+Shift+Delete → Clear all
```

### مشكلة 2: \"401 Unauthorized\"
```
Error: 401 Unauthorized - غير مصرح

الحل:
1. تحقق من Token في localStorage:
   Open DevTools → Console
   localStorage.getItem('ray_token')
   localStorage.getItem('token')
   
   يجب أن يظهر token مثل:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. إذا كان فارغاً:
   a. تسجيل دخول مرة أخرى
   b. استخدم Dev Login من Dashboard

3. تحقق من JWT_SECRET:
   - يجب أن يكون نفس القيمة في Go Backend و Frontend
   - تطابقها حيوي!
```

### مشكلة 3: \"Database Connection Failed\"
```
Error: database connection failed

الحل:
1. تحقق من PostgreSQL:
   docker ps | grep postgres
   
   إذا لم يظهر:
   docker-compose up -d postgres

2. اختبر الاتصال:
   psql -U ray_user -d ray_marketplace -c \"SELECT 1;\"
   
   إذا فشل:
   - تحقق من DATABASE_URL في .env
   - تحقق من credentials (ray_user/ray_password)
   - تحقق من port (5433 في docker-compose)

3. شغّل migrations:
   cd gobackend
   make migrate-up
   
   أو:
   go run ./scripts/migrate.go up
```

### مشكلة 4: \"Network timeout\"
```
Error: request timeout after 30s

الحل:
1. تحقق من أن Go backend يعمل:
   curl http://localhost:4000/monitoring/ready
   
   إذا لم يستجب:
   - أعد تشغيل backend
   - تحقق من port 4000 غير مستخدم

2. في Next.js:
   سيكون هناك rewrite من /api/v1/* إلى Go
   تحقق من next.config.js

3. قد تكون قاعدة البيانات بطيئة:
   - اختبر performance
   - قلل حجم البيانات في الاستعلام
```

### مشكلة 5: \"Token Mismatch\"
```
Error: بعض الـ pages تعمل، وأخرى لا

الحل:
1. تحقق من أن كلا التطبيقات تستخدم نفس JWT_SECRET:
   
   في backend .env:
   JWT_SECRET=your-super-secure-key-32-chars-min

   في frontend .env.local:
   NEXT_PUBLIC_JWT_SECRET=your-super-secure-key-32-chars-min
   
   ملاحظة: Frontend لا يحتاج في الواقع، لكن تأكد من معرفة القيمة

2. إعادة تشغيل كامل:
   - أوقف جميع الخدمات
   - امسح browser cache
   - ابدأ من جديد
```

---

## 📝 5️⃣ **قائمة التحقق قبل الإطلاق**

### Backend Readiness
- [ ] PostgreSQL يعمل
- [ ] Redis يعمل (best-effort)
- [ ] Go Backend يستجيب على :4000
- [ ] `/monitoring/ready` يرجع 200
- [ ] JWT_SECRET محدد صحيح
- [ ] DATABASE_URL صحيح
- [ ] CORS_ORIGIN يحتوي على الـ frontend URLs

### Frontend Readiness
- [ ] Marketplace يعمل على :5174
- [ ] Dashboard يعمل على :3000 (optional)
- [ ] NEXT_PUBLIC_BACKEND_URL = http://127.0.0.1:4000
- [ ] لا توجد errors في Console عند التحميل

### Integration Readiness
- [ ] Login يعمل من المتجر
- [ ] Token يُحفظ في localStorage (ray_token و token)
- [ ] طلبات API تحتوي على Authorization header
- [ ] CORS errors لا تظهر
- [ ] Response format صحيح

---

## 🚨 6️⃣ **Emergency Restart**

إذا توقف النظام عن العمل:

```bash
# 1. أوقف كل شيء
# في كل terminal: Ctrl+C

# 2. امسح الـ cache
rm -rf node_modules/.cache
# أو في Windows:
# rmdir /s /q node_modules\.cache

# 3. نظّف Browser cache
# Ctrl+Shift+Delete

# 4. أعد تشغيل Docker services
docker-compose down
docker-compose up -d postgres redis

# 5. أعد تثبيت المكتبات (إذا تغيرت)
# في كل مشروع Next:
npm ci  # بدلاً من npm install

# 6. شغّل البرامج:
# Terminal 1:
cd gobackend && go run ./cmd/api

# Terminal 2:
cd apps/marketplace-next && npm run dev

# Terminal 3:
cd apps/dashboard-web && npm run dev
```

---

## 📊 7️⃣ **Performance Baseline**

قم بقياس الأداء الأساسية:

```bash
# Response time للـ endpoints الرئيسية:

curl -w \"\\nTime: %{time_total}s\\n\" http://localhost:4000/api/v1/products

متوقع:
  ✅ GET /api/v1/products → < 500ms
  ✅ GET /api/v1/shops/me → < 200ms
  ✅ POST /api/v1/orders → < 1s
  ✅ GET /api/v1/search → < 300ms

إذا كانت أبطأ:
  - تحقق من database indexes
  - تحقق من network latency
  - قلل حجم البيانات المرجعة
```

---

## 📞 8️⃣ **Getting Help**

### اطرح السؤال مع:
1. **المشكلة:**
   - ماذا تحاول أن تفعل؟
   - ماذا حدث؟

2. **الملفات الصلة:**
   - الـ endpoint المستخدم
   - Request format
   - Response format

3. **الأدلة:**
   - Browser console errors
   - Go backend logs
   - Network tab screenshots
   - .env configuration (without sensitive data)

### أماكن البحث:
- [ ] Check [INTEGRATION_STATUS_REPORT.md](INTEGRATION_STATUS_REPORT.md)
- [ ] Check [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- [ ] Check [api-migration-map.md](docs/api-migration-map.md)
- [ ] Check [backend-migration-plan-ar.md](docs/backend-migration-plan-ar.md)

---

## ✅ نصائح مهمة

1. **Always use relative paths in frontend:**
   ```javascript
   // ✅ صحيح
   fetch('/api/v1/products')
   
   // ❌ خطأ
   fetch('http://localhost:4000/api/v1/products')
   ```

2. **Server-side requests use absolute URLs:**
   ```javascript
   // في getServerSideProps أو API routes
   const baseURL = process.env.BACKEND_URL || 'http://localhost:4000'
   fetch(`${baseURL}/api/v1/products`)
   ```

3. **Always include Authorization:**
   ```javascript
   fetch('/api/v1/orders', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   })
   ```

4. **Handle errors gracefully:**
   ```javascript
   try {
     const data = await fetch('/api/v1/...')
     if (!data.ok) throw new Error('API Error')
     return await data.json()
   } catch (err) {
     console.error('API call failed:', err)
     // Show user-friendly message
   }
   ```

---

**آخر تحديث:** 2026-08-13
**الإصدار:** 1.0
