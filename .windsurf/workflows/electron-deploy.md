---
description: Electron desktop app build, publish, and release workflow — always ask the user before deploying
---

# Electron Desktop App — Build & Release Workflow

## ⚠️ قاعدة صارمة: اسأل المستخدم دايماً قبل أي رفع أو نشر

قبل أي خطوة نشر أو رفع، **اسأل المستخدم**:
1. "تحب أرفع النسخة على GitHub Releases؟"
2. "هل الـ backend URL صح؟ (الافتراضي: https://api.mnmknk.com)"
3. "هل رقم النسخة (version) محدّث في package.json؟"

لا ترفع أي حاجة تلقائياً بدون موافقة صريحة من المستخدم.

---

## خطوات الـ Build

### 1. Build محلي (تجربة فقط)
```bash
npm run electron:dist
# النتيجة: release/نمّي أعمالك Setup X.X.X.exe
```

### 2. Build + Publish على GitHub Releases
```bash
# يحتاج GH_TOKEN
$env:GH_TOKEN="ghp_your_token"
npm run electron:publish
```

### 3. النشر التلقائي عبر GitHub Actions (الأفضل)
```bash
# حدّث رقم النسخة أولاً في package.json
# ثم:
git tag v1.0.X
git push origin v1.0.X
# الـ workflow هيـ build وينشر تلقائياً
```

---

## ما قبل الـ Build — checklist

قبل أي build للـ Electron، تأكد من:

1. **رقم النسخة** في `package.json` محدّث (`"version": "1.0.X"`)
2. **Backend URL** — لو التوزيع للإنتاج:
   - set `ELECTRON_BACKEND_URL=https://api.mnmknk.com` قبل الـ build
   - أو خليه فاضي والتطبيق هيستخدم fallback
3. **الـ frontend build** سليم (`npm run electron:build-web`)
4. **الـ Electron compile** سليم (`npm run electron:build`)
5. **الـ tests** بتعدّي (`npm test`)

---

## ملفات Electron المهمة

| الملف | الوظيفة |
|-------|---------|
| `electron/main.ts` | Main process — النافذة، الـ routing restriction، auto-update |
| `electron/preload.ts` | Bridge آمن بين main و renderer |
| `electron/tsconfig.json` | TypeScript config للـ Electron |
| `vite.electron.config.mts` | Vite config منفصل (بدون PWA، base: './') |
| `.github/workflows/electron-release.yml` | GitHub Actions للـ auto build & publish |
| `ELECTRON_GUIDE.md` | دليل شامل للتوزيع |

---

## إعدادات electron-builder في package.json

```json
"build": {
  "appId": "com.mnmknk.dashboard",
  "productName": "نمّي أعمالك",
  "publish": {
    "provider": "github",
    "owner": "Sayedtaha55",
    "repo": "ray-eg"
  }
}
```

---

## Auto-update behavior

- التطبيق بيـ check على تحديثات بعد 10 ثواني من الفتح
- بيـ check كل ساعة
- التحديث بيـ download تلقائياً
- بيـ install عند إغلاق التطبيق
- Notifications بتظهر للمستخدم
- المصدر: GitHub Releases

---

## المسارات المسموحة في Electron

التطبيق مقيّد على مسارات التاجر فقط:
- `/business/*` — لوحة التحكم
- `/login` — تسجيل الدخول
- `/signup` — التسجيل

أي محاولة للتنقل لصفحات العميل → redirect تلقائي لـ `/business`

---

## رابط التحميل للتاجر

بعد النشر على GitHub Releases:
```
https://github.com/Sayedtaha55/ray-eg/releases/latest
```

التاجر يفتح الرابط → يحمل `.exe` → يثبته → يفتحه → يسجل → يدخل لوحته.

صفحة التنزيل على الموقع: `#/download-app`
