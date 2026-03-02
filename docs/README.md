
# 💎 Ray - Hyper-Modern Marketplace Platform

[English](#english) | [العربية](#arabic)

---

<a name="arabic"></a>
## 🇪🇬 الرؤية (باللغة العربية)

**Ray (تست)** هو مشروع طموح يهدف إلى إعادة تعريف تجربة التسوق في مصر. المنصة ليست مجرد متجر إلكتروني، بل هي نظام بيئي متكامل يربط بين المحلات التجارية والمطاعم والعملاء باستخدام أحدث تقنيات الذكاء الاصطناعي والويب المكاني (Spatial Web).

### 🚀 المميزات الرئيسية:
- **نظام POS متكامل:** تحويل أي هاتف ذكي إلى نقطة بيع ذكية للمحلات والمطاعم
- **مصمم الصفحات (Page Builder):** تمكين أصحاب الأعمال من تصميم هويتهم الخاصة بأسلوب السحب والإفلات
- **مساعد ذكي (Ray Assistant):** مساعد بحث مدعوم بـ Google Gemini للوصول لأفضل العروض الحقيقية
- **نظام حجز ذكي:** حجز العروض والمنتجات واستلامها من الفرع لضمان التوافر
- **تحليلات متقدمة:** لوحة تحكم للتجار تعرض المبيعات، الزيارات، وتوقعات النمو
- **نظام توصيل ذكي:** إدارة الطلبات والتوصيل مع كابتنات النظام
- **نظام عروض ترويجي:** إنشاء وإدارة العروض والخصومات
- **دفعات إلكترونية:** تكامل مع بوابات الدفع المصرية والدولية

### 🛠 التقنيات المستخدمة:
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Animation:** Framer Motion
- **State Management:** Redux Toolkit, React Query
- **AI Engine:** Google Generative AI (Gemini SDK)
- **Icons:** Lucide React
- **Backend:** NestJS + Prisma
- **Database:** Prisma (PostgreSQL افتراضياً، مع schema SQLite legacy داخل `backend/prisma/schema.prisma`)
- **Cache:** Redis
- **Authentication:** JWT with refresh tokens
- **File Storage:** AWS S3 / Local storage
- **Email:** SendGrid
- **Deployment:** Vercel (Frontend), Railway (Backend)

### 📊 نماذج الأعمال المدعومة:
- **متاجر إلكترونية:** منتجات متنوعة مع إدارة المخزون
- **مطاعم ومقاهي:** قوائم طعام وحجوزات طاولات
- **صيدليات:** وصفات طبية وحجوزات استشارات
- **عيادات ومستشفيات:** مواعيد وحجوزات طبية
- **وكالات سيارات:** عرض السيارات وحجوزات تجارب القيادة
- **فنادق وشقق مفروشة:** حجوزات إقامة وإدارة الممتلكات
- **خدمات متنوعة:** أي خدمة يمكن حجزها أو تقديمها عبر الإنترنت

---

<a name="english"></a>
## 🌍 Vision (English)

**Ray (Test)** is an ambitious project aimed at redefining the shopping experience in Egypt. The platform is not just an e-commerce store but a comprehensive ecosystem connecting retail shops, restaurants, and customers through AI and Spatial Web technologies.

### 🚀 Key Features:
- **Integrated POS System:** Turns any smartphone into a smart Point of Sale for merchants
- **Dynamic Page Builder:** Allows business owners to design their custom storefronts with ease
- **AI Assistant (Ray Assistant):** A Google Gemini-powered search tool to find real-time deals
- **Smart Reservation System:** Reserve products online and pick them up in-store
- **Advanced Analytics:** A merchant dashboard displaying sales, visits, and growth insights
- **Smart Delivery System:** Order management and delivery with system couriers
- **Promotional Offers:** Create and manage deals and discounts
- **Electronic Payments:** Integration with Egyptian and international payment gateways

### 🛠 Tech Stack:
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Animation:** Framer Motion
- **State Management:** Redux Toolkit, React Query
- **AI Engine:** Google Generative AI (Gemini API)
- **Icons:** Lucide React
- **Backend:** NestJS + Prisma
- **Database:** Prisma (PostgreSQL by default, with a legacy SQLite schema in `backend/prisma/schema.prisma`)
- **Cache:** Redis
- **Authentication:** JWT with refresh tokens
- **File Storage:** AWS S3 / Local storage
- **Email:** SendGrid
- **Deployment:** Vercel (Frontend), Railway (Backend)

### 📊 Supported Business Models:
- **E-commerce Stores:** Various products with inventory management
- **Restaurants & Cafes:** Menus and table reservations
- **Pharmacies:** Prescriptions and consultation bookings
- **Clinics & Hospitals:** Appointments and medical bookings
- **Car Dealerships:** Vehicle displays and test drive reservations
- **Hotels & Furnished Apartments:** Accommodation bookings and property management
- **Various Services:** Any service that can be booked or offered online

---

## 📚 Comprehensive Project Documentation

A detailed, AI-friendly Arabic documentation set is available under [`docs/`](./docs/README.md), with structured references for:

### 📖 Documentation Structure:
1. **[01-project-overview.md](./docs/01-project-overview.md)** - نظرة عامة شاملة على المشروع
2. **[02-architecture.md](./docs/02-architecture.md)** - المعمارية الفنية والتقنية
3. **[03-setup-and-run.md](./docs/03-setup-and-run.md)** - إعداد وتشغيل المشروع محلياً
4. **[04-backend-guide.md](./docs/04-backend-guide.md)** - دليل شامل للواجهة الخلفية
5. **[05-frontend-guide.md](./docs/05-frontend-guide.md)** - دليل شامل للواجهة الأمامية
6. **[06-database-guide.md](./docs/06-database-guide.md)** - دليل قاعدة البيانات و Prisma
7. **[07-deployment-operations.md](./docs/07-deployment-operations.md)** - النشر والتشغيل الإنتاجي
8. **[08-api-map.md](./docs/08-api-map.md)** - خريطة الـ API والوحدات
9. **[09-troubleshooting.md](./docs/09-troubleshooting.md)** - استكشاف الأعطال وإصلاحها

### 🎯 Key Documentation Features:
- **AI-Friendly:** Designed for AI model comprehension
- **Comprehensive:** Covers all aspects of development and deployment
- **Practical:** Includes code examples and real-world scenarios
- **Up-to-Date:** Reflects current project state and best practices
- **Bilingual:** Arabic primary with English sections where needed

---

## 🛠 How to run locally / كيف تشغل المشروع محلياً

### 📋 Prerequisites / المتطلبات الأساسية:
- Node.js 20+ 
- PostgreSQL (recommended) or SQLite
- Redis (for caching)
- Git

### 1️⃣ Installation / التثبيت:
```bash
# Clone the repository
git clone https://github.com/your-org/ray-eg.git
cd ray-eg

# Install dependencies
npm install
```

### 2️⃣ Environment Variables / متغيرات البيئة:
```bash
# Copy environment template
cp .env.example .env.local

# Important variables to configure:
# - JWT_SECRET (minimum 32 characters)
# - DATABASE_URL (PostgreSQL or SQLite)
# - GEMINI_API_KEY (for AI features)
# - REDIS_URL (for caching)
# - CORS_ORIGIN (frontend URLs)
# - MEDIA_STORAGE_MODE (local or s3)
```

### 3️⃣ Database Setup / إعداد قاعدة البيانات:
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed initial data (optional)
npm run prisma:seed
```

### 4️⃣ Start Backend / تشغيل الواجهة الخلفية:
```bash
# Start development server
npm run backend:dev

# Backend will be available at http://localhost:4000
# Health check: http://localhost:4000/api/v1/health
```

### 5️⃣ Start Frontend / تشغيل الواجهة الأمامية:
```bash
# Start development server
npm run dev

# Frontend will be available at http://localhost:5174
```

### 6️⃣ Verify Installation / التحقق من التثبيت:
```bash
# Check backend health
curl http://localhost:4000/api/v1/health

# Open frontend in browser
# Navigate to http://localhost:5174
```

---

## 🚀 Development Workflow / سير العمل التطوير

### 📁 Project Structure / هيكل المشروع:
```
ray-eg/
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── store/            # Redux store
│   └── utils/            # Utility functions
├── backend/               # Backend source
│   ├── src/              # NestJS source
│   ├── prisma/           # Database schema
│   └── test/             # Backend tests
├── docs/                  # Documentation
├── public/                # Static assets
└── scripts/               # Build and deployment scripts
```

### 🔧 Development Commands / أوامر التطوير:
```bash
# Frontend commands
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run frontend tests
npm run lint             # Lint frontend code

# Backend commands
npm run backend:dev      # Start backend dev server
npm run backend:build    # Build backend for production
npm run backend:start    # Start backend production
npm run test:e2e         # Run backend tests

# Database commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Testing commands
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### 🎨 Frontend Development / تطوير الواجهة الأمامية:
- **Component Architecture:** Atomic Design pattern
- **State Management:** Redux Toolkit + React Query
- **Routing:** React Router v6 with lazy loading
- **Styling:** Tailwind CSS with custom theme
- **Forms:** React Hook Form with validation
- **Testing:** React Testing Library + Jest

### 🔧 Backend Development / تطوير الواجهة الخلفية:
- **Framework:** NestJS with TypeScript
- **Database:** Prisma ORM with PostgreSQL
- **Authentication:** JWT with refresh tokens
- **Validation:** Class-validator with DTOs
- **Testing:** Jest with Supertest
- **Documentation:** Swagger/OpenAPI

---

## 📊 Performance & Scaling / الأداء والتوسع

### ⚡ Performance Optimizations / تحسينات الأداء:
- **Frontend:** Code splitting, lazy loading, image optimization
- **Backend:** Database indexing, query optimization, caching
- **Database:** Connection pooling, read replicas
- **Network:** CDN, compression, HTTP/2

### 📈 Load Testing / اختبار الحمل:
```bash
# Run baseline load test
npm run loadtest:k6

# Custom load test
npm run loadtest:k6:custom

# Stress test
npm run loadtest:k6:stress
```

### 🔄 Scaling Strategy / استراتيجية التوسع:
- **Horizontal Scaling:** Load balancers + multiple instances
- **Database Scaling:** Read replicas + sharding
- **Cache Strategy:** Redis cluster + CDN
- **Monitoring:** Application performance monitoring (APM)

---

## 🚀 Deployment / النشر

### 🌐 Production Deployment / النشر الإنتاجي:
- **Frontend:** Vercel (recommended) or Netlify
- **Backend:** Railway (recommended) or AWS ECS
- **Database:** Managed PostgreSQL (Railway, AWS RDS, Neon)
- **Cache:** Managed Redis (Railway, AWS ElastiCache)
- **Storage:** AWS S3 or similar

### 📋 Deployment Checklist / قائمة التحقق للنشر:
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit performed

---

## 🔧 Configuration / الإعدادات

### 🌍 Environment Variables / متغيرات البيئة:
```bash
# Core Application
NODE_ENV=development
PORT=4000
BACKEND_PORT=4000

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ray_eg"
DIRECT_URL="postgresql://user:pass@localhost:5432/ray_eg"

# Security
JWT_SECRET="your-super-secure-jwt-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
BCRYPT_ROUNDS=12

# Frontend
FRONTEND_URL="http://localhost:5174"
CORS_ORIGIN="http://localhost:5174"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"

# Cache
REDIS_URL="redis://localhost:6379"

# Storage
MEDIA_STORAGE_MODE="local"
UPLOAD_DIR="./uploads"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

### 🔐 Security Configuration / إعدادات الأمان:
- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Comprehensive input validation
- **Rate Limiting:** API rate limiting
- **CORS:** Proper CORS configuration
- **HTTPS:** SSL/TLS encryption

---

## 🧪 Testing / الاختبار

### 📋 Test Types / أنواع الاختبارات:
- **Unit Tests:** Component and function testing
- **Integration Tests:** API and database testing
- **E2E Tests:** Full application testing
- **Performance Tests:** Load and stress testing
- **Security Tests:** Vulnerability scanning

### 🧪 Testing Commands / أوامر الاختبار:
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## 📊 Monitoring & Analytics / المراقبة والتحليلات

### 📈 Application Monitoring / مراقبة التطبيق:
- **Health Checks:** Application and service health
- **Performance Metrics:** Response times, error rates
- **Business Metrics:** User activity, conversion rates
- **System Metrics:** CPU, memory, disk usage

### 📊 Analytics Dashboard / لوحة التحليلات:
- **User Analytics:** Registration, engagement, retention
- **Business Analytics:** Sales, revenue, growth
- **Performance Analytics:** Page speed, API performance
- **Error Analytics:** Error rates, common issues

---

## 🤝 Contributing / المساهمة

### 📋 How to Contribute / كيف تساهم:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### 📝 Code Standards / معايير الكود:
- **TypeScript:** Strict mode enabled
- **ESLint:** Configured with recommended rules
- **Prettier:** Code formatting
- **Husky:** Git hooks for quality checks

---

## 📞 Support & Contact / الدعم والتواصل

### 🆘 Getting Help / الحصول على المساعدة:
- **Documentation:** Check the comprehensive docs in `/docs`
- **Issues:** Report bugs on GitHub Issues
- **Discussions:** Join our GitHub Discussions
- **Email:** Contact our support team

### 📧 Contact Information / معلومات الاتصال:
- **Email:** support@ray-eg.com
- **Website:** https://ray-eg.com
- **GitHub:** https://github.com/your-org/ray-eg

---

## 📄 License / الرخصة

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Created with ❤️ by Ray Engineering Team*

**🎯 Mission:** To revolutionize the shopping experience in Egypt through innovative technology and exceptional user experience.

**🔮 Vision:** To become the leading marketplace platform in Egypt, empowering local businesses and delighting customers with cutting-edge technology.
