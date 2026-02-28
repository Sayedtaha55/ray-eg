
# 💎 Ray  - Hyper-Modern Marketplace

[English](#english) | [العربية](#arabic)

---

<a name="arabic"></a>
## 🇪🇬 الرؤية (باللغة العربية)
**Ray (تست)** هو مشروع طموح يهدف إلى إعادة تعريف تجربة التسوق في مصر. المنصة ليست مجرد متجر إلكتروني، بل هي نظام بيئي متكامل يربط بين المحلات التجارية والمطاعم والعملاء باستخدام أحدث تقنيات الذكاء الاصطناعي والويب المكاني (Spatial Web).

### 🚀 المميزات الرئيسية:
- **نظام POS متكامل:** تحويل أي هاتف ذكي إلى نقطة بيع ذكية للمحلات والمطاعم.
- **مصمم الصفحات (Page Builder):** تمكين أصحاب الأعمال من تصميم هويتهم الخاصة بأسلوب السحب والإفلات.
- **مساعد ذكي (Ray Assistant):** مساعد بحث مدعوم بـ Google Gemini للوصول لأفضل العروض الحقيقية.
- **نظام حجز ذكي:** حجز العروض والمنتجات واستلامها من الفرع لضمان التوافر.
- **تحليلات متقدمة:** لوحة تحكم للتجار تعرض المبيعات، الزيارات، وتوقعات النمو.

### 🛠 التقنيات المستخدمة:
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite.
- **Animation:** Framer Motion.
- **AI Engine:** Google Generative AI (Gemini SDK).
- **Icons:** Lucide React.
- **Backend:** NestJS + Prisma.
- **Database:** Prisma (PostgreSQL افتراضياً، مع schema SQLite legacy داخل `backend/prisma/schema.prisma`).

---

<a name="english"></a>
## 🌍 Vision (English)
**Ray (Test)** is an ambitious project aimed at redefining the shopping experience in Egypt. The platform is not just an e-commerce store but a comprehensive ecosystem connecting retail shops, restaurants, and customers through AI and Spatial Web technologies.

### 🚀 Key Features:
- **Integrated POS System:** Turns any smartphone into a smart Point of Sale for merchants.
- **Dynamic Page Builder:** Allows business owners to design their custom storefronts with ease.
- **AI Assistant (Ray Assistant):** A Google Gemini-powered search tool to find real-time deals.
- **Smart Reservation System:** Reserve products online and pick them up in-store.
- **Advanced Analytics:** A merchant dashboard displaying sales, visits, and growth insights.

### 🛠 Tech Stack:
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite.
- **Animation:** Framer Motion.
- **AI Engine:** Google Generative AI (Gemini API).
- **Icons:** Lucide React.
- **Backend:** NestJS + Prisma.
- **Database:** Prisma (PostgreSQL by default, with a legacy SQLite schema in `backend/prisma/schema.prisma`).

---

## 🛠 How to run locally / كيف تشغل المشروع محلياً

### 1) Install
```bash
npm install
```

### 2) Environment variables
- Copy `.env.example` to `.env` and adjust values.
- Important variables:
  - `JWT_SECRET`
  - `DATABASE_URL` (depends on the Prisma schema you use)
  - `GEMINI_API_KEY` / `VITE_GEMINI_API_KEY` (Gemini key; the codebase supports both names)
  - `API_BASE_URL` (backend base URL)

### 3) Database (Prisma)
```bash
npm run prisma:generate
npm run prisma:push
```

### 4) Run backend
```bash
npm run backend:dev
```

### 5) Run frontend
```bash
npm run dev
```
The frontend will be available at http://localhost:5174

### Public pages performance updates
- Public listings are paginated (take/skip) and images use native lazy loading.
- Public offers page is available at `/offers`.

### Load testing and scaling
- Run baseline load test (k6):
```bash
npm run loadtest:k6
```
- Optional environment variables:
  - `BASE_URL` (default `http://localhost:4000`)
  - `TARGET_SHOP_SLUG` (default `demo-shop`)
- Full practical 1000+ concurrent users plan is documented in `SCALING_PLAYBOOK.md`.

---
*Created with ❤️ by Ray Engineering Team*
