# 2) المعمارية الفنية الشاملة

## 2.1 النظرة الطبقية للمعمارية (Layered Architecture)

### 2.1.1 طبقة العرض (Presentation Layer)
**الواجهة الأمامية (Frontend):**
- **React SPA (Single Page Application)** مع Server-Side Rendering capabilities
- **Multi-role interfaces:** Public, Merchant, Admin, Courier dashboards
- **Responsive Design:** Mobile-first approach مع Progressive Web App (PWA) features
- **Real-time Updates:** WebSocket connections للتحديثات الفورية
- **State Management:** React Query + Context API لإدارة الحالة
- **Component Architecture:** Atomic Design pattern مع reusable components

**التقنيات المستخدمة:**
- React 19 مع Concurrent Features
- TypeScript للـ type safety
- Vite كـ build tool ومحسّن للأداء
- Tailwind CSS للـ utility-first styling
- Framer Motion للـ animations
- Lucide React للأيقونات

### 2.1.2 طبقة الـ API (API Layer)
**NestJS Controllers & Guards:**
- **RESTful API** مع OpenAPI/Swagger documentation
- **Authentication Guards:** JWT-based authentication مع refresh tokens
- **Authorization Guards:** Role-based access control (RBAC)
- **Validation Pipes:** Comprehensive input validation مع class-validator
- **Exception Filters:** Centralized error handling
- **Rate Limiting:** Multi-tier rate limiting للحماية
- **CORS Configuration:** Dynamic CORS حسب environment

**المميزات الأمنية:**
- Helmet.js لتأمين HTTP headers
- CSRF protection
- XSS prevention مع Content Security Policy
- SQL injection prevention عبر Prisma ORM
- Request/response logging للتدقيق

### 2.1.3 طبقة المجال والتطبيق (Domain/Application Layer)
**NestJS Services (Business Logic):**
- **Domain-Driven Design (DDD)** patterns
- **Service Layer Pattern:** فصل منطق الأعمال عن الـ controllers
- **Repository Pattern:** تجريد الوصول للبيانات
- **Event-Driven Architecture:** Domain events للـ loose coupling
- **CQRS Pattern:** Command Query Responsibility Segregation للعمليات المعقدة
- **Transaction Management:** Atomic operations عبر Prisma

**المجالات الرئيسية (Domains):**
- **Authentication & Authorization Domain**
- **Shop & Product Management Domain**
- **Order & Reservation Domain**
- **Payment & Invoice Domain**
- **Courier & Delivery Domain**
- **Analytics & Reporting Domain**
- **Notification & Communication Domain**

### 2.1.4 طبقة البيانات (Data Layer)
**Prisma ORM & Database:**
- **Multi-database support:** PostgreSQL (production), SQLite (development)
- **Connection Pooling:** إدارة اتصالات قاعدة البيانات بكفاءة
- **Migrations:** Version-controlled schema changes
- **Query Optimization:** N+1 problem prevention
- **Data Validation:** Schema-level constraints
- **Soft Deletes:** Data retention policies

**التخزين المؤقت (Caching):**
- **Redis** للتخزين المؤقت عالي الأداء
- **Session Storage:** User sessions و temporary data
- **API Response Caching:** Cache layer للـ read-heavy operations
- **Distributed Caching:** Multi-instance cache synchronization

### 2.1.5 طبقة البنية التحتية (Infrastructure Layer)
**External Services Integration:**
- **Payment Gateways:** Fawry, PayMob, وغيرها
- **Email Services:** SendGrid, AWS SES
- **SMS Services:** Twilio, محلية SMS providers
- **Cloud Storage:** AWS S3, Google Cloud Storage
- **Maps & Geolocation:** Google Maps API
- **AI Services:** Google Gemini API

**Monitoring & Observability:**
- **Application Logging:** Winston مع structured logging
- **Performance Monitoring:** Response times, throughput metrics
- **Health Checks:** Comprehensive health endpoints
- **Error Tracking:** Sentry أو similar
- **Metrics Collection:** Prometheus/Grafana integration

## 2.2 الهيكل العام للمجلدات والملفات

### 2.2.1 الواجهة الأمامية (Frontend Structure)
```
components/
├── pages/                    # Route-level components
│   ├── public/              # Public-facing pages
│   ├── business/            # Merchant dashboard
│   ├── admin/               # Admin panel
│   └── courier/             # Courier app
├── layouts/                 # Layout components
│   ├── PublicLayout.tsx
│   ├── BusinessLayout.tsx
│   ├── AdminLayout.tsx
│   └── CourierLayout.tsx
├── features/                # Feature-specific components
│   ├── auth/               # Authentication components
│   ├── shop/               # Shop management
│   ├── product/            # Product components
│   ├── order/              # Order management
│   └── payment/            # Payment components
├── ui/                     # Reusable UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Form.tsx
│   └── index.ts
├── hooks/                  # Custom React hooks
├── services/               # API services
├── utils/                  # Utility functions
└── types/                  # TypeScript type definitions
```

### 2.2.2 الواجهة الخلفية (Backend Structure)
```
backend/
├── src/
│   ├── modules/            # Feature modules
│   │   ├── auth/          # Authentication module
│   │   ├── shop/          # Shop management
│   │   ├── product/       # Product management
│   │   ├── order/         # Order processing
│   │   ├── payment/       # Payment processing
│   │   ├── courier/       # Courier management
│   │   └── analytics/     # Analytics module
│   ├── common/            # Shared utilities
│   │   ├── guards/        # Auth guards
│   │   ├── pipes/         # Validation pipes
│   │   ├── interceptors/  # Request/response interceptors
│   │   └── decorators/    # Custom decorators
│   ├── config/            # Configuration files
│   └── database/          # Database configuration
├── test/                  # Test files
└── prisma/                # Database schema and migrations
```

### 2.2.3 قاعدة البيانات (Database Structure)
```
prisma/
├── schema.prisma          # Main database schema
├── schema.postgres.prisma # PostgreSQL-specific schema
├── schema-sqlite.prisma   # SQLite-specific schema
├── migrations/            # Database migrations
└── seed.ts               # Database seeding script
```

## 2.3 معمارية الواجهة الأمامية (Frontend Architecture)

### 2.3.1 نقطة الدخول والتهيئة (Entry Point & Bootstrap)
**index.tsx - Application Bootstrap:**
```typescript
// التهيئة الأساسية للتطبيق
- React 19 root creation
- ErrorBoundary configuration
- ToastProvider setup
- Theme provider initialization
- Service worker registration (PWA)
```

### 2.3.2 نظام التوجيه (Routing System)
**App.tsx - Central Router Configuration:**
```typescript
// App shell only
- Router shell setup
- auth bootstrap lifecycle
- redirector mounting
- route warmup scheduling
```

**app/AppRoutes.tsx - Central Route Tree:**
```typescript
// Route definition module
- Public/business/admin/courier routes
- Nested layouts
- Shared suspense wrappers
- Legacy redirects
```

**app/routerHelpers.tsx / app/routeWarmup.ts:**
```typescript
// Small focused router helpers
- suspense fallback helpers
- redirect components
- route warmup heuristics
```

```typescript
// ميزات التوجيه المتقدمة
- Dynamic routing mode (Hash/Browser Router)
- Lazy loading للـ code splitting
- Route guards للمصادقة والتفويض
- Nested routes للـ layouts
- Redirect handlers للـ legacy routes
- SEO optimization مع RouteSeoManager
```

**نماذج التحميل (Loading Patterns):**
- **Lazy Loading:** معظم الصفحات يتم تحميلها عند الطلب
- **Suspense Boundaries:** Loading states و error boundaries
- **Prefetching:** Intelligent prefetching للصفحات المحتملة
- **Progressive Loading:** Content streaming للصفحات الكبيرة

### 2.3.3 إدارة الحالة (State Management)
**Multi-layer State Management:**
- **Local State:** useState, useReducer للـ component state
- **Global State:** Context API للتطبيق-wide state
- **Server State:** React Query للـ API data
- **Form State:** React Hook Form للـ form management
- **URL State:** URL parameters للـ shareable state

### 2.3.4 مكونات التصميم (Design System)
**Component Architecture:**
- **Atomic Design:** Atoms, Molecules, Organisms, Templates, Pages
- **Compound Components:** المكونات المعقدة القابلة للتخصيص
- **Render Props:** المرونة في الـ component composition
- **Custom Hooks:** Logic reuse و state abstraction

### 2.3.5 تحسين الأداء (Performance Optimization)
**Optimization Strategies:**
- **Code Splitting:** Route-based و feature-based splitting
- **Tree Shaking:** Dead code elimination
- **Image Optimization:** Lazy loading, WebP format, responsive images
- **Bundle Analysis:** Webpack Bundle Analyzer integration
- **Caching Strategies:** Service worker caching, HTTP caching

## 2.4 معمارية الواجهة الخلفية (Backend Architecture)

### 2.4.1 تهيئة التطبيق (Application Bootstrap)
**main.ts - Server Bootstrap:**
```typescript
// تهيئة الخادم المتقدمة
- Environment configuration loading
- CORS setup مع dynamic origins
- Security middleware (Helmet, Rate Limiting)
- ValidationPipe global configuration
- Exception filter setup
- Graceful shutdown handling
```

### 2.4.2 نظام الموديولات (Module System)
**app.module.ts - Module Registration:**
```typescript
// نظام الموديولات المرن
- Dynamic module loading حسب environment
- Feature module isolation
- Shared module configuration
- Dependency injection setup
- Module-level configuration
```

### 2.4.3 الموديولات الأساسية (Core Modules)

#### Authentication Module
```typescript
// ميزات المصادقة المتقدمة
- JWT token management
- Refresh token rotation
- OAuth integration (Google, Facebook)
- Multi-factor authentication
- Password strength validation
- Account lockout mechanisms
```

#### Shop & Product Module
```typescript
// إدارة المتاجر والمنتجات
- Shop creation and customization
- Product catalog management
- Inventory tracking
- Category and tag management
- Product variants and options
- Bulk operations support
```

#### Order & Payment Module
```typescript
// معالجة الطلبات والدفع
- Order lifecycle management
- Payment gateway integration
- Invoice generation
- Refund and return processing
- Order status tracking
- Notification triggers
```

#### Courier & Delivery Module
```typescript
// نظام التوصيل
- Courier registration and verification
- Order assignment algorithms
- Real-time location tracking
- Route optimization
- Delivery confirmation
- Performance analytics
```

### 2.4.4 الأنماط الأمنية (Security Patterns)

#### Authentication & Authorization
```typescript
// طبقات الأمان المتعددة
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Permission-based fine-grained access
- API key authentication للـ external services
- Session management مع Redis
- Audit logging للـ security events
```

#### Data Protection
```typescript
// حماية البيانات
- Input validation و sanitization
- SQL injection prevention
- XSS protection مع CSP
- CSRF token validation
- Data encryption at rest و in transit
- PII (Personally Identifiable Information) protection
```

#### Rate Limiting & Abuse Prevention
```typescript
// الحماية من الإساءة
- Multi-tier rate limiting
- IP-based throttling
- User-based quota management
- DDoS protection
- Bot detection و mitigation
- Anomaly detection
```

## 2.5 أوضاع التشغيل المرنة (Flexible Boot Modes)

### 2.5.1 Minimal Boot Mode
```bash
# تشغيل محدد للموديولات الأساسية
MINIMAL_BOOT=true
BOOT_MODULES=auth,health
```
**الاستخدامات:**
- **Development:** سرعة الإقلاع للتطوير المركز
- **Testing:** عزل الموديولات للاختبار المركز
- **Debugging:** تحديد مصادر المشاكل بسرعة
- **Resource Constrained:** البيئات محدودة الموارد

### 2.5.2 Feature-Specific Boot
```bash
# تشغيل موديولات محددة
BOOT_MODULES=auth,shop,product,order
```
**الموديولات المتاحة:**
- `auth` - المصادقة والتفويض
- `shop` - إدارة المتاجر
- `product` - إدارة المنتجات
- `order` - معالجة الطلبات
- `payment` - معالجة الدفع
- `courier` - إدارة الكابتنات
- `analytics` - التحليلات والتقارير
- `notification` - نظام الإشعارات

### 2.5.3 Development Scripts
```bash
# سكربتات التطوير المخصصة
npm run backend:dev:auth          # Auth module فقط
npm run backend:dev:shop-product  # Shop + Product modules
npm run backend:dev:minimal       # Minimal configuration
npm run backend:dev:stable        # Stable development setup
```

## 2.6 تدفق الطلب (Request Flow)

### 2.6.1 Request Lifecycle
```
1. Client Request → CDN/Load Balancer
2. Web Server (Nginx/Apache)
3. NestJS Application
4. Middleware Chain:
   - CORS Middleware
   - Security Headers (Helmet)
   - Rate Limiting
   - Request Logging
5. Route Guards:
   - Authentication Guard
   - Authorization Guard
   - Role-based Guards
6. Validation Pipe
7. Controller Method
8. Service Layer
9. Repository/Prisma
10. Database
11. Response Chain (reverse order)
```

### 2.6.2 Error Handling Flow
```
1. Exception Occurs
2. Global Exception Filter
3. Error Classification:
   - Validation Errors
   - Authentication Errors
   - Authorization Errors
   - Business Logic Errors
   - System Errors
4. Error Formatting
5. Response Generation
6. Logging & Monitoring
7. Client Notification
```

### 2.6.3 Authentication Flow
```
1. Login Request
2. Credential Validation
3. JWT Token Generation
4. Refresh Token Creation
5. Response with Tokens
6. Subsequent Requests:
   - Token Validation
   - User Context Loading
   - Authorization Check
   - Request Processing
7. Token Refresh Flow
```

## 2.7 تدفق الوسائط (Media Flow)

### 2.7.1 Upload Process
```
1. Client Upload Request
2. Pre-upload Validation:
   - File type checking
   - Size limits
   - User permissions
3. Presigned URL Generation (S3/Cloud Storage)
4. Direct Upload to Cloud Storage
5. Upload Completion Callback
6. Metadata Storage in Database
7. Thumbnail Generation
8. CDN Distribution
```

### 2.7.2 Storage Strategy
**Multi-tier Storage:**
- **Hot Storage:** Frequently accessed media (CDN)
- **Warm Storage:** Recently uploaded media (Cloud Storage)
- **Cold Storage:** Archived media (Glacier/Similar)
- **Cache Layer:** Redis cache for metadata

### 2.7.3 Image Processing Pipeline
```
1. Original Image Upload
2. Validation & Security Scanning
3. Format Optimization (WebP, AVIF)
4. Multiple Resolutions Generation
5. Quality Compression
6. Watermarking (if required)
7. CDN Distribution
8. Cache Invalidation Strategy
```

## 2.8 نظام الإشعارات (Notification System)

### 2.8.1 Notification Channels
**Multi-channel Delivery:**
- **In-App Notifications:** Real-time WebSocket notifications
- **Email Notifications:** Transactional and marketing emails
- **SMS Notifications:** Critical alerts and confirmations
- **Push Notifications:** Mobile app notifications
- **Webhook Notifications:** Third-party integrations

### 2.8.2 Notification Types
**Categorized Notifications:**
- **Order Updates:** Order status changes
- **Payment Alerts:** Payment confirmations and failures
- **Delivery Updates:** Courier location and ETA
- **Promotional:** Marketing messages and offers
- **System Alerts:** Maintenance and downtime notices
- **Security Alerts:** Login attempts and password changes

### 2.8.3 Delivery Strategy
**Intelligent Delivery:**
- **User Preferences:** Channel selection per user
- **Priority Levels:** Critical, high, normal, low priority
- **Retry Logic:** Exponential backoff for failed deliveries
- **Rate Limiting:** Per-user and per-channel limits
- **Analytics:** Delivery rates and engagement metrics

## 2.9 نظام التحليلات (Analytics System)

### 2.9.1 Data Collection
**Multi-source Data:**
- **User Interactions:** Clicks, page views, session duration
- **Business Metrics:** Sales, orders, revenue
- **System Performance:** Response times, error rates
- **Courier Performance:** Delivery times, success rates
- **Market Data:** Trends, seasonal patterns

### 2.9.2 Real-time Analytics
**Live Dashboards:**
- **Order Flow:** Real-time order tracking
- **User Activity:** Concurrent users and sessions
- **System Health:** Performance metrics and alerts
- **Revenue Tracking:** Live revenue calculations
- **Geographic Data:** Location-based analytics

### 2.9.3 Batch Analytics
**Periodic Processing:**
- **Daily Reports:** End-of-day summaries
- **Weekly Trends:** Pattern analysis
- **Monthly Insights:** Business intelligence
- **Custom Reports:** On-demand analytics
- **Predictive Analytics:** AI-powered forecasting

## 2.10 قابلية التوسع (Scalability Architecture)

### 2.10.1 Horizontal Scaling
**Stateless Design:**
- **Load Balancing:** Multiple application instances
- **Database Sharding:** Data distribution across servers
- **Cache Clustering:** Redis cluster for distributed caching
- **Microservices Migration:** Gradual service decomposition
- **Container Orchestration:** Kubernetes deployment

### 2.10.2 Performance Optimization
**Caching Strategies:**
- **Application Cache:** In-memory caching
- **Database Cache:** Query result caching
- **CDN Caching:** Static asset distribution
- **API Response Caching:** Intelligent response caching
- **Session Caching:** User session storage

### 2.10.3 Monitoring & Scaling
**Auto-scaling Logic:**
- **Metrics-based Scaling:** CPU, memory, response time
- **Queue-based Scaling:** Background job processing
- **Predictive Scaling:** AI-powered scaling decisions
- **Manual Scaling:** Administrative override capabilities
- **Cost Optimization:** Resource usage optimization


### 2.3.6 إعادة تنظيم الملفات الكبيرة
- تم فصل شجرة الـ routes عن `App.tsx` إلى `app/AppRoutes.tsx`.
- تم فصل helpers الخاصة بالتوجيه إلى `app/routerHelpers.tsx`.
- تم فصل route warmup logic إلى `app/routeWarmup.ts`.
- تم تقسيم الصفحة الرئيسية إلى منسّق حالة (`HomeFeed.tsx`) + أقسام UI مستقلة داخل `components/pages/public/home/`.
- التفاصيل العملية موجودة في `docs/10-frontend-structure-refactor.md`.
