# Product Requirements Document (PRD)
# Ray — Multi-Vendor Business Platform

## 1. Product Overview

**Ray** is a hyper-modern multi-vendor marketplace and business operating platform designed for the Egyptian market. It connects customers, merchants, couriers, and administrators in a unified ecosystem.

- **Product Name:** Ray (راي)
- **Platform Type:** Web Application (SPA) + Electron Desktop App
- **Target Market:** Egypt (Arabic-first, bilingual AR/EN)
- **Tech Stack:** React 19, Vite, TailwindCSS, NestJS, Prisma, PostgreSQL, Redis

---

## 2. User Roles

| Role | Description | Entry Route |
|------|-------------|-------------|
| **Customer** | Browses shops, products, offers; places orders; tracks deliveries | `/` (public) |
| **Merchant** | Manages shop, products, orders, inventory, analytics, page builder | `/business` |
| **Courier** | Receives delivery requests; tracks and delivers orders | `/courier/orders` |
| **Admin** | Oversees platform: approvals, users, shops, orders, analytics, content | `/admin` |
| **Portal User** | Manages map listings and branches | `/portal` |

---

## 3. Core Feature Areas

### 3.1 Authentication & Authorization
- **Login** (email/password) at `/login`
- **Signup** (customer/merchant) at `/signup`
- **Google OAuth** callback at `/auth/google/callback`
- **Password reset** at `/reset-password`
- **Admin login** at `/admin/gate`
- **Portal login** at `/portal/login`
- JWT-based auth with refresh tokens
- Role-based access control (RBAC)

### 3.2 Public Marketplace (Customer-facing)
- **Home page** (`/`) — Featured shops, products, offers, activities
- **Shop profile** (`/shop/:slug`) — Shop page with products, offers, gallery, info
- **Product page** (`/product/:id`) — Product details, images, add to cart
- **Product landing page** (`/landing/:id`) — Marketing-style product landing
- **Offers pages** (`/offers`, `/offers/restaurants`, `/offers/fashion`, `/offers/supermarket`)
- **Activity pages** (`/activity/cars`, `/activity/real-estate`, `/activity/agriculture`, `/activity/medical`, `/activity/factories`, `/activity/construction`, `/activity/trade`, `/activity/tourism`, `/activity/animal`, `/activity/fish`, `/activity/energy`, `/activity/professional`, `/activity/home`)
- **Map** (`/map`) — Interactive map with shop listings
- **Map listing detail** (`/map/listing/:id`)
- **Add map listing** (`/map/add-listing`)
- **SEO directory** (`/dalil`)
- **Blog** (`/blog`, `/blog/:slug`)
- **Profile** (`/profile`) — User profile and order history
- **Static pages:** About (`/about`), Support (`/support`), Terms (`/terms`), Privacy (`/privacy`), Contact (`/contact`), Return Policy (`/return-policy`), Suggestions (`/suggestions`), Customer Service (`/customer-service`)
- **Courier intro** (`/courier`)
- **Download app** (`/download-app`)

### 3.3 Merchant Dashboard
- **Business landing** (`/business`) — Entry point for merchants
- **Merchant onboarding** (`/business/onboarding`) — Step-by-step shop setup
- **Dashboard** (`/business/dashboard`) — Main merchant control panel with tabs:
  - Overview / Analytics (sales, orders, revenue charts)
  - Products management (CRUD, inventory, variants)
  - Orders management (process, update status, print invoices)
  - Offers management (create discounts, bundles, BOGO)
  - Gallery (upload images, manage media)
  - Reservations / Bookings (for booking-enabled activities)
  - Customers list
  - Notifications
  - Feedback
  - Shop settings (profile, hours, delivery, location)
  - Page Builder (drag-and-drop page customization)
  - AI Builder (AI-powered theme/page generation)
  - Map listing management
- **Merchant profile** (`/business/profile`)
- **Pending approval** (`/business/pending`)
- **Business hero** (`/business/:shopId/hero`)
- **Builder preview** (`/business/builder/preview`)
- **Booking activity** (`/business/:activity`)
- **Courier signup** (`/business/courier-signup`)

### 3.4 Admin Panel
- **Dashboard** (`/admin/dashboard`) — Platform overview stats
- **Approvals** (`/admin/approvals`) — Approve/reject merchant registrations
- **Shops** (`/admin/shops`) — Manage all shops
- **Users** (`/admin/users`) — Manage all users
- **Orders** (`/admin/orders`) — View all platform orders
- **Delivery** (`/admin/delivery`) — Courier management
- **Feedback** (`/admin/feedback`) — User feedback and reports
- **Customer service** (`/admin/customer-service`) — Support tickets
- **Analytics** (`/admin/analytics`) — Platform-wide analytics
- **Notifications** (`/admin/notifications`) — Send platform notifications
- **Content** (`/admin/content`) — Manage blog, SEO, static content
- **Settings** (`/admin/settings`) — Platform configuration

### 3.5 Courier App
- **Courier orders** (`/courier/orders`) — List of assigned/available orders
- Toggle availability (online/offline)
- Accept/reject delivery requests
- Update delivery status (picked up, en route, delivered)
- View delivery history and earnings

### 3.6 Portal (Map Listings)
- **Portal dashboard** (`/portal`)
- **Listings** (`/portal/listings`) — Manage map listings
- **Edit listing** (`/portal/listings/:id/edit`)
- **Branches** (`/portal/listings/:id/branches`)
- **Analytics** (`/portal/analytics`)
- **Profile** (`/portal/profile`)

### 3.7 AI Features
- **AI Theme Generator** — Generate full theme (colors, fonts, brand identity) from activity type and style preset
- **AI Page Generator** — Generate page schemas (sections, layouts) based on business activity
- **AI Brand Generator** — Generate brand identity (name, tagline, colors, fonts)
- **AI Builder Chat** — Iterative design changes via natural language
- **AI Visual Editor** — Click-to-edit any element on page, AI returns JSON design token changes
- All AI output is JSON-only (no executable code), applied as CSS variables

### 3.8 Notifications
- In-app real-time notifications (WebSocket)
- Email notifications (transactional)
- Push notifications (web push)
- Notification preferences per user

### 3.9 Media Management
- Image upload with presigned URLs (S3)
- Video upload and compression
- Image optimization (WebP, multiple resolutions)
- Gallery management per shop
- Image maps for product details

### 3.10 Search & Discovery
- Full-text search for products and shops
- Filter by category, price, rating, location
- Sort by relevance, price, rating, distance
- Activity-based browsing (cars, real estate, medical, etc.)

### 3.11 Shopping Cart & Checkout
- Multi-shop cart
- Quantity management
- Shipping calculation
- Payment options (card, cash, cash on delivery)
- Order confirmation and tracking

### 3.12 Electron Desktop App
- Merchant-only desktop application
- Auto-update via GitHub Releases
- NSIS installer for Windows
- Restricted routes (business only)
- Secure preload bridge

---

## 4. Key User Flows

### 4.1 Customer Journey
1. Visit home page → browse featured shops/products/offers
2. Search or filter by category/activity/location
3. Click shop → view shop profile with products
4. Click product → view details → add to cart
5. Checkout → select payment → place order
6. Track order status in real-time
7. Receive delivery notifications

### 4.2 Merchant Journey
1. Sign up as merchant → complete onboarding
2. Wait for admin approval
3. Access dashboard → set up shop profile, hours, location
4. Add products with images, prices, inventory
5. Create offers and promotions
6. Process incoming orders → update status → print invoices
7. View analytics and reports
8. Customize storefront with Page Builder / AI Builder

### 4.3 Courier Journey
1. Sign up as courier → wait for approval
2. Set status to available
3. Receive delivery requests
4. Accept request → navigate to pickup → pick up order
5. Navigate to customer → deliver order
6. Update status to delivered
7. View earnings history

### 4.4 Admin Journey
1. Log in at `/admin/gate`
2. Review pending merchant approvals
3. Monitor platform analytics
4. Manage users, shops, orders
5. Handle customer service tickets
6. Send notifications
7. Manage content (blog, SEO)

---

## 5. Technical Requirements

### 5.1 Frontend
- React 19 with lazy loading and code splitting
- Vite as build tool
- TailwindCSS for styling
- Framer Motion for animations
- i18n (Arabic/English) with RTL support
- PWA support (service worker, manifest)
- Responsive design (mobile-first)
- WebSocket for real-time updates

### 5.2 Backend
- NestJS modular architecture
- Prisma ORM with PostgreSQL
- Redis for caching and sessions
- BullMQ for background jobs (email, notifications)
- JWT authentication with refresh tokens
- Rate limiting (IP-based and user-based)
- Helmet for security headers
- Input validation with class-validator
- File upload via presigned URLs (S3)

### 5.3 Database
- PostgreSQL (production)
- SQLite (development fallback)
- Prisma migrations
- Indexed for performance (shop, order, product queries)

### 5.4 Infrastructure
- Docker / Docker Compose for development
- Vercel for frontend deployment
- Railway for backend deployment
- CDN for static assets
- Nginx for load balancing (production)

### 5.5 Security
- JWT + refresh token rotation
- Role-based access control
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection (CSP headers)
- Rate limiting
- Admin bootstrap with secure token
- Shop ownership verification on all merchant endpoints

---

## 6. Supported Business Activities

The platform supports multiple industry verticals, each with specialized dashboard tabs and features:

1. **Cars** — Vehicle listings, specifications, test drive booking
2. **Real Estate** — Property listings, virtual tours, agent contact
3. **Agriculture** — Agricultural products, equipment, seasonal offers
4. **Medical** — Pharmacies, clinics, hospitals, appointment booking
5. **Factories** — Industrial products, B2B catalogs, bulk orders
6. **Construction** — Materials, equipment, contractor services
7. **Trade** — General trade and wholesale
8. **Tourism** — Travel packages, hotel bookings, tour reservations
9. **Animal** — Pet products, veterinary services
10. **Fish** — Fishery products, equipment
11. **Energy** — Energy products, solar solutions
12. **Professional** — Professional services (legal, consulting, etc.)
13. **Home** — Home services, maintenance, repair
14. **Restaurants** — Food delivery, menu, table reservations
15. **Fashion** — Clothing, accessories, size variants
16. **Supermarket** — Grocery, daily essentials, bulk pricing

---

## 7. Performance Requirements

- Page load time: < 3 seconds
- API response time: < 200ms for 95% of requests
- Uptime: 99.9%
- Error rate: < 0.1%
- Lighthouse score: > 90 (performance, accessibility, best practices, SEO)

---

## 8. Testing Scope for TestSprite

### 8.1 Frontend Tests (Priority Areas)
1. **Authentication flows** — Login, signup, password reset, Google OAuth
2. **Navigation** — All routes load correctly, no 404s on valid routes
3. **Public pages** — Home, shop profile, product page, offers, activities, map, blog
4. **Merchant dashboard** — All tabs accessible, CRUD operations (products, offers, orders)
5. **Admin panel** — All sections accessible, approvals workflow
6. **Courier app** — Orders list, status updates
7. **Portal** — Listings CRUD, branches management
8. **Responsive design** — Mobile and desktop layouts
9. **i18n** — Language switching (AR/EN), RTL layout
10. **Cart & checkout** — Add to cart, quantity update, checkout flow
11. **AI Builder** — Theme generation, page generation, chat
12. **Page Builder** — Drag-and-drop, preview, save

### 8.2 Backend Tests (Priority Areas)
1. **Auth endpoints** — Login, signup, refresh, password reset
2. **Shop CRUD** — Create, read, update, delete with ownership verification
3. **Product CRUD** — Create, read, update, delete with shop ownership
4. **Order lifecycle** — Create, update status, list by shop, cancel
5. **Offer management** — Create, apply, list, delete
6. **Media upload** — Presigned URL generation, upload completion
7. **Search** — Product/shop search with filters
8. **Notifications** — List, mark as read, preferences
9. **Admin endpoints** — Approvals, user management, shop management
10. **Courier endpoints** — Order assignment, status updates, earnings
11. **Rate limiting** — Verify rate limit enforcement
12. **Security** — Unauthorized access attempts, input validation

---

## 9. Environment & Configuration

- **Frontend dev server:** `http://localhost:5174`
- **Backend dev server:** `http://localhost:4000`
- **Database:** PostgreSQL at `localhost:5433`
- **Redis:** `localhost:6379`
- **Admin bootstrap token:** `admin1234` (dev only)
- **API prefix:** `/api/v1/`
- **CORS:** Dynamic origins based on environment
