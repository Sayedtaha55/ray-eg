# 8) خريطة الـ API والوحدات الشاملة

> **مهم:** هذه الخريطة مرجعية لتسهيل الفهم السريع. المرجع النهائي دائمًا هو ملفات `backend/*controller.ts`.

## 8.1 Base URLs والبيئة

### 8.1.1 URLs الأساسية
```bash
# التطوير المحلي
Local Base URL: http://localhost:4000
API Base URL: http://localhost:4000/api/v1

# الإنتاج
Production Base URL: https://api.ray-eg.com
API Base URL: https://api.ray-eg.com/api/v1

# Testing
Testing Base URL: https://api-test.ray-eg.com
API Base URL: https://api-test.ray-eg.com/api/v1
```

### 8.1.2 Headers القياسية
```bash
# لجميع الطلبات
Content-Type: application/json
Accept: application/json

# للمصادقة
Authorization: Bearer <jwt_token>

# للـ CORS
Origin: <frontend_domain>
X-Requested-With: XMLHttpRequest
```

### 8.1.3 استجابات قياسية
```json
// نجاح
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}

// خطأ
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}

// التحقق من الصحة
{
  "status": "up",
  "timestamp": "2023-12-01T12:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

## 8.2 المصادقة (Authentication) — `/api/v1/auth`

### 8.2.1 التسجيل (Registration)
```typescript
POST /api/v1/auth/signup
Content-Type: application/json

// Request Body
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "phone": "+201234567890",
  "role": "CUSTOMER" | "MERCHANT" | "COURIER",
  // Legacy fields for compatibility
  "storeType": "electronics",
  "storePhone": "+201234567891",
  "workingHours": "9:00-18:00",
  "address": "123 Main St, Cairo, Egypt",
  "description": "Store description"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "isActive": true,
      "isEmailVerified": false
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}

POST /api/v1/auth/courier-signup
// Similar to signup but with courier-specific fields
```

### 8.2.2 تسجيل الدخول (Login)
```typescript
POST /api/v1/auth/login
Content-Type: application/json

// Request Body
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "avatar": "avatar_url",
      "phone": "+201234567890"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}

// Development shortcuts
POST /api/v1/auth/dev-merchant-login
POST /api/v1/auth/dev-courier-login
// These endpoints bypass authentication for development
```

### 8.2.3 OAuth و Social Login
```typescript
GET /api/v1/auth/google
// Redirects to Google OAuth

GET /api/v1/auth/google/callback
// Google OAuth callback
// Response contains user data and tokens
```

### 8.2.4 إدارة الحساب (Account Management)
```typescript
GET /api/v1/auth/session
// Get current user session
// Requires: Authorization header

POST /api/v1/auth/logout
// Logout user
// Requires: Authorization header

POST /api/v1/auth/deactivate
// Deactivate user account
// Requires: Authorization header

POST /api/v1/auth/password/forgot
// Request password reset
{
  "email": "user@example.com"
}

POST /api/v1/auth/password/reset
// Reset password with token
{
  "token": "reset_token",
  "newPassword": "NewSecurePassword123!"
}

POST /api/v1/auth/password/change
// Change password (authenticated)
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

### 8.2.5 Admin Bootstrap
```typescript
POST /api/v1/auth/bootstrap-admin
// Initialize admin user (production only)
{
  "token": "ADMIN_BOOTSTRAP_TOKEN",
  "email": "admin@ray-eg.com",
  "password": "SecureAdminPassword123!",
  "fullName": "System Administrator"
}
```

## 8.3 المتاجر (Shops) — `/api/v1/shops`

### 8.3.1 إدارة المتجر (Shop Management)
```typescript
POST /api/v1/shops
// Create new shop
// Requires: Authorization (MERCHANT)
{
  "name": "My Electronics Store",
  "slug": "my-electronics-store",
  "description": "Best electronics in town",
  "email": "shop@example.com",
  "phone": "+201234567890",
  "address": "123 Main St, Cairo, Egypt",
  "categoryId": "electronics_category_id",
  "workingHours": "9:00-18:00",
  "deliveryTime": "30-45 minutes",
  "minOrderAmount": 50.00
}

GET /api/v1/shops/me
// Get current user's shop
// Requires: Authorization (MERCHANT)

PATCH /api/v1/shops/me
// Update current user's shop
// Requires: Authorization (MERCHANT)
{
  "name": "Updated Store Name",
  "description": "Updated description",
  "workingHours": "10:00-19:00"
}

POST /api/v1/shops/me/banner
// Upload shop banner
// Requires: Authorization (MERCHANT)
// Content-Type: multipart/form-data
```

### 8.3.2 ترقيات الموديولات (Module Upgrades)
```typescript
POST /api/v1/shops/me/module-upgrade-requests
// Request module upgrade
// Requires: Authorization (MERCHANT)
{
  "moduleId": "analytics_module_id",
  "reason": "Need advanced analytics for better insights"
}

GET /api/v1/shops/me/module-upgrade-requests
// Get my upgrade requests
// Requires: Authorization (MERCHANT)
```

### 8.3.3 إدارة المتاجر للـ Admin
```typescript
GET /api/v1/shops/admin/list
// Get all shops (admin)
// Requires: Authorization (ADMIN)
// Query params: page, limit, status, search

GET /api/v1/shops/admin/:id
// Get shop details (admin)
// Requires: Authorization (ADMIN)

PATCH /api/v1/shops/admin/:id/status
// Update shop status (admin)
// Requires: Authorization (ADMIN)
{
  "isActive": true,
  "isApproved": true,
  "rejectionReason": null
}

POST /api/v1/shops/admin/:id/reset-visitors
// Reset shop visitor count (admin)
// Requires: Authorization (ADMIN)

GET /api/v1/shops/admin/module-upgrade-requests
// Get all upgrade requests (admin)
// Requires: Authorization (ADMIN)

POST /api/v1/shops/admin/module-upgrade-requests/:id/approve
// Approve upgrade request (admin)
// Requires: Authorization (ADMIN)

POST /api/v1/shops/admin/module-upgrade-requests/:id/reject
// Reject upgrade request (admin)
// Requires: Authorization (ADMIN)
{
  "reason": "Insufficient documentation"
}
```

### 8.3.4 الوصول العام للمتاجر (Public Shop Access)
```typescript
GET /api/v1/shops/sitemap
// Get shops sitemap for SEO

GET /api/v1/shops
// Get public shops list
// Query params: page, limit, category, search, location

GET /api/v1/shops/:slug
// Get shop by slug (public)

GET /api/v1/shops/:id
// Get shop by ID (public)

POST /api/v1/shops/:id/visit
// Record shop visit
// Optional: Authorization for tracking

POST /api/v1/shops/:id/follow
// Follow/unfollow shop
// Requires: Authorization

PATCH /api/v1/shops/:id/design
// Update shop design (owner only)
// Requires: Authorization
{
  "theme": "dark",
  "primaryColor": "#3b82f6",
  "layout": "grid",
  "customCSS": ".custom-style { color: red; }"
}

GET /api/v1/shops/:id/analytics
// Get shop analytics (owner only)
// Requires: Authorization
{
  "period": "TODAY" | "WEEK" | "MONTH" | "YEAR"
}
```

## 8.4 المنتجات (Products) — `/api/v1/products`

### 8.4.1 الوصول العام للمنتجات (Public Product Access)
```typescript
GET /api/v1/products
// Get products list (public)
// Query params: page, limit, category, shopId, search, sortBy, priceRange

GET /api/v1/products/:id
// Get product details (public)

GET /api/v1/products/featured
// Get featured products

GET /api/v1/products/trending
// Get trending products

GET /api/v1/products/search
// Search products
// Query params: q, category, priceRange, sortBy
```

### 8.4.2 إدارة المنتجات (Product Management)
```typescript
POST /api/v1/products
// Create new product
// Requires: Authorization (MERCHANT)
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with amazing features",
  "price": 12999.99,
  "originalPrice": 14999.99,
  "sku": "IPHONE15PRO001",
  "stock": 50,
  "categoryId": "electronics_category_id",
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["smartphone", "apple", "electronics"],
  "specifications": {
    "screen": "6.1 inches",
    "storage": "128GB",
    "color": "Space Gray"
  }
}

GET /api/v1/products/manage/by-shop/:shopId
// Get shop's products for management
// Requires: Authorization (MERCHANT)

PATCH /api/v1/products/:id
// Update product
// Requires: Authorization (MERCHANT/ADMIN)

DELETE /api/v1/products/:id
// Delete product
// Requires: Authorization (MERCHANT/ADMIN)

POST /api/v1/products/manage/by-shop/:shopId/import-drafts
// Import product drafts
// Requires: Authorization (MERCHANT)
{
  "products": [
    {
      "name": "Product Name",
      "price": 99.99,
      "sku": "SKU001"
    }
  ]
}
```

### 8.4.3 إدارة المخزون (Inventory Management)
```typescript
PATCH /api/v1/products/:id/stock
// Update product stock
// Requires: Authorization (MERCHANT)
{
  "stock": 100,
  "operation": "set" | "increment" | "decrement"
}

GET /api/v1/products/:id/inventory
// Get product inventory history
// Requires: Authorization (MERCHANT)
```

## 8.5 الطلبات (Orders) — `/api/v1/orders`

### 8.5.1 إدارة الطلبات (Order Management)
```typescript
POST /api/v1/orders
// Create new order
// Requires: Authorization
{
  "shopId": "shop_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Cairo",
    "country": "Egypt",
    "postalCode": "12345"
  },
  "deliveryInstructions": "Ring the doorbell twice"
}

GET /api/v1/orders/me
// Get my orders
// Requires: Authorization
// Query params: status, page, limit

GET /api/v1/orders/:id
// Get order details
// Requires: Authorization

PATCH /api/v1/orders/:id
// Update order
// Requires: Authorization (CUSTOMER/MERCHANT/ADMIN)
{
  "status": "CONFIRMED",
  "notes": "Customer requested special packaging"
}
```

### 8.5.2 إدارة الكابتنات (Courier Management)
```typescript
PATCH /api/v1/orders/:id/assign-courier
// Assign courier to order
// Requires: Authorization (ADMIN/MERCHANT)
{
  "courierId": "courier_id"
}

PATCH /api/v1/orders/:id/courier
// Update courier status
// Requires: Authorization (COURIER)
{
  "status": "PICKED_UP",
  "location": {
    "latitude": 30.0444,
    "longitude": 31.2357
  },
  "notes": "Customer not available, will retry"
}

GET /api/v1/orders/courier/me
// Get courier's assigned orders
// Requires: Authorization (COURIER)
// Query params: status, page, limit
```

### 8.5.3 إرجاع الطلبات (Order Returns)
```typescript
GET /api/v1/orders/:id/returns
// Get order returns
// Requires: Authorization

POST /api/v1/orders/:id/returns
// Create order return
// Requires: Authorization (CUSTOMER)
{
  "reason": "Product not as described",
  "description": "Color is different from images",
  "items": [
    {
      "orderItemId": "order_item_id",
      "quantity": 1
    }
  ]
}
```

### 8.5.4 إدارة الطلبات للـ Admin
```typescript
GET /api/v1/orders/admin
// Get all orders (admin)
// Requires: Authorization (ADMIN)
// Query params: status, shopId, customerId, dateRange, page, limit

GET /api/v1/orders/admin/:id
// Get order details (admin)
// Requires: Authorization (ADMIN)
```

## 8.6 الحجوزات (Reservations) — `/api/v1/reservations`

### 8.6.1 إدارة الحجوزات
```typescript
POST /api/v1/reservations
// Create new reservation
// Requires: Authorization
{
  "shopId": "shop_id",
  "serviceId": "service_id",
  "dateTime": "2023-12-01T14:00:00Z",
  "duration": 60,
  "participants": 2,
  "notes": "Special requirements"
}

GET /api/v1/reservations/me
// Get my reservations
// Requires: Authorization

GET /api/v1/reservations/:id
// Get reservation details
// Requires: Authorization

PATCH /api/v1/reservations/:id
// Update reservation
// Requires: Authorization
{
  "status": "CONFIRMED",
  "notes": "Customer requested change"
}

DELETE /api/v1/reservations/:id
// Cancel reservation
// Requires: Authorization
```

## 8.7 العروض (Offers) — `/api/v1/offers`

### 8.7.1 إدارة العروض
```typescript
POST /api/v1/offers
// Create new offer
// Requires: Authorization (MERCHANT)
{
  "shopId": "shop_id",
  "title": "Flash Sale - 50% Off",
  "description": "Limited time offer on selected items",
  "type": "PERCENTAGE" | "FIXED_AMOUNT",
  "value": 50,
  "startDate": "2023-12-01T00:00:00Z",
  "endDate": "2023-12-07T23:59:59Z",
  "applicableProducts": ["product_id_1", "product_id_2"],
  "minimumOrderAmount": 100.00,
  "usageLimit": 100
}

GET /api/v1/offers
// Get active offers (public)
// Query params: shopId, category, active

GET /api/v1/offers/:id
// Get offer details (public)

PATCH /api/v1/offers/:id
// Update offer
// Requires: Authorization (MERCHANT/ADMIN)

DELETE /api/v1/offers/:id
// Delete offer
// Requires: Authorization (MERCHANT/ADMIN)
```

## 8.8 الفواتير (Invoices) — `/api/v1/payments`

### 8.8.1 إدارة الفواتير
```typescript
POST /api/v1/payments/invoices
// Create invoice
// Requires: Authorization (MERCHANT)
{
  "orderId": "order_id",
  "items": [
    {
      "description": "Product name",
      "quantity": 2,
      "unitPrice": 99.99,
      "total": 199.98
    }
  ],
  "taxRate": 0.14,
  "dueDate": "2023-12-15T00:00:00Z",
  "notes": "Payment due within 15 days"
}

GET /api/v1/payments/invoices/me
// Get my invoices
// Requires: Authorization

GET /api/v1/payments/invoices/summary/me
// Get invoice summary
// Requires: Authorization

GET /api/v1/payments/invoices/:id
// Get invoice details
// Requires: Authorization

GET /api/v1/payments/invoices
// Get all invoices (admin)
// Requires: Authorization (ADMIN)

GET /api/v1/payments/invoices/summary
// Get invoice summary (admin)
// Requires: Authorization (ADMIN)
```

### 8.8.2 معالجة الدفعات (Payment Processing)
```typescript
POST /api/v1/payments/process
// Process payment
// Requires: Authorization
{
  "orderId": "order_id",
  "paymentMethod": "CREDIT_CARD" | "CASH_ON_DELIVERY" | "WALLET",
  "amount": 199.99,
  "currency": "EGP",
  "paymentDetails": {
    "cardNumber": "****-****-****-1234",
    "expiryDate": "12/25",
    "cvv": "***"
  }
}

POST /api/v1/payments/verify
// Verify payment
// Requires: Authorization
{
  "paymentId": "payment_id",
  "verificationCode": "123456"
}
```

## 8.9 المعرض والمعرض (Gallery & Media) — `/api/v1/gallery`

### 8.9.1 إدارة المعرض
```typescript
POST /api/v1/gallery/upload
// Upload media file
// Requires: Authorization
// Content-Type: multipart/form-data
{
  "file": <binary_data>,
  "type": "image" | "video" | "document",
  "folder": "products/shop_id",
  "alt": "Product image description"
}

GET /api/v1/gallery/:folder
// Get gallery folder contents
// Query params: page, limit, type

DELETE /api/v1/gallery/:id
// Delete media file
// Requires: Authorization
```

### 8.9.2 معالجة الوسائط (Media Processing)
```typescript
POST /api/v1/media/presign
// Get presigned URL for direct upload
// Requires: Authorization
{
  "fileName": "product_image.jpg",
  "contentType": "image/jpeg",
  "folder": "products/shop_id"
}

GET /api/v1/media/thumbnails/:id
// Get media thumbnails
```

## 8.10 التحليلات (Analytics) — `/api/v1/analytics`

### 8.10.1 تحليلات المتجر (Shop Analytics)
```typescript
GET /api/v1/analytics/shop/:shopId
// Get shop analytics
// Requires: Authorization (MERCHANT/ADMIN)
// Query params: period, startDate, endDate

// Response
{
  "period": "WEEK",
  "metrics": {
    "totalOrders": 150,
    "totalRevenue": 15000.00,
    "averageOrderValue": 100.00,
    "conversionRate": 3.5,
    "uniqueVisitors": 4285,
    "pageViews": 15420
  },
  "trends": {
    "orders": [
      { "date": "2023-11-25", "count": 20 },
      { "date": "2023-11-26", "count": 25 }
    ],
    "revenue": [
      { "date": "2023-11-25", "amount": 2000.00 },
      { "date": "2023-11-26", "amount": 2500.00 }
    ]
  }
}
```

### 8.10.2 تحليلات النظام (System Analytics)
```typescript
GET /api/v1/analytics/system
// Get system analytics
// Requires: Authorization (ADMIN)
{
  "users": {
    "total": 10000,
    "active": 8500,
    "newThisMonth": 500
  },
  "shops": {
    "total": 500,
    "active": 450,
    "pendingApproval": 25
  },
  "orders": {
    "total": 50000,
    "thisMonth": 5000,
    "averageValue": 150.00
  },
  "revenue": {
    "total": 7500000.00,
    "thisMonth": 750000.00
  }
}
```

## 8.11 الإشعارات (Notifications) — `/api/v1/notifications`

### 8.11.1 إدارة الإشعارات
```typescript
GET /api/v1/notifications
// Get user notifications
// Requires: Authorization
// Query params: page, limit, type, isRead

PATCH /api/v1/notifications/:id/read
// Mark notification as read
// Requires: Authorization

PATCH /api/v1/notifications/read-all
// Mark all notifications as read
// Requires: Authorization

DELETE /api/v1/notifications/:id
// Delete notification
// Requires: Authorization

POST /api/v1/notifications/send
// Send notification (admin)
// Requires: Authorization (ADMIN)
{
  "userId": "user_id",
  "type": "ORDER_UPDATE" | "PROMOTION" | "SYSTEM",
  "title": "Order Status Update",
  "message": "Your order has been shipped",
  "channels": ["in_app", "email", "sms"]
}
```

## 8.12 الملاحظات (Feedback) — `/api/v1/feedback`

### 8.12.1 إدارة الملاحظات
```typescript
POST /api/v1/feedback
// Submit feedback
{
  "type": "BUG_REPORT" | "FEATURE_REQUEST" | "GENERAL",
  "subject": "Login issue",
  "description": "I cannot login with my credentials",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "attachments": ["screenshot1.png", "screenshot2.png"]
}

GET /api/v1/feedback
// Get feedback (admin)
// Requires: Authorization (ADMIN)
// Query params: type, status, priority, page, limit

PATCH /api/v1/feedback/:id
// Update feedback status
// Requires: Authorization (ADMIN)
{
  "status": "RESOLVED",
  "resolution": "Fixed authentication issue",
  "assignedTo": "developer_id"
}
```

## 8.13 العملاء (Customers) — `/api/v1/customers`

### 8.13.1 إدارة العملاء
```typescript
GET /api/v1/customers/me
// Get customer profile
// Requires: Authorization (CUSTOMER)

PATCH /api/v1/customers/me
// Update customer profile
// Requires: Authorization (CUSTOMER)
{
  "fullName": "Updated Name",
  "phone": "+201234567890",
  "address": {
    "street": "456 Main St",
    "city": "Alexandria",
    "country": "Egypt",
    "postalCode": "12345"
  },
  "preferences": {
    "language": "ar",
    "currency": "EGP",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}

GET /api/v1/customers/me/orders
// Get customer orders
// Requires: Authorization (CUSTOMER)

GET /api/v1/customers/me/favorites
// Get customer favorites
// Requires: Authorization (CUSTOMER)

POST /api/v1/customers/me/favorites/:productId
// Add to favorites
// Requires: Authorization (CUSTOMER)

DELETE /api/v1/customers/me/favorites/:productId
// Remove from favorites
// Requires: Authorization (CUSTOMER)
```

### 8.13.2 إدارة العملاء للـ Admin
```typescript
GET /api/v1/customers/admin
// Get all customers (admin)
// Requires: Authorization (ADMIN)
// Query params: search, status, registrationDate, page, limit

GET /api/v1/customers/admin/:id
// Get customer details (admin)
// Requires: Authorization (ADMIN)

PATCH /api/v1/customers/admin/:id
// Update customer (admin)
// Requires: Authorization (ADMIN)
{
  "isActive": true,
  "isEmailVerified": true,
  "role": "CUSTOMER"
}
```

## 8.14 الكابتنات (Couriers) — `/api/v1/courier`

### 8.14.1 إدارة الكابتنات
```typescript
GET /api/v1/courier/state
// Get courier state
// Requires: Authorization (COURIER)
{
  "isOnline": true,
  "isAvailable": true,
  "currentLocation": {
    "latitude": 30.0444,
    "longitude": 31.2357
  },
  "activeOrders": 2,
  "completedOrders": 45,
  "rating": 4.8
}

PATCH /api/v1/courier/state
// Update courier state
// Requires: Authorization (COURIER)
{
  "isOnline": true,
  "isAvailable": false,
  "currentLocation": {
    "latitude": 30.0444,
    "longitude": 31.2357
  }
}

GET /api/v1/courier/offers
// Get delivery offers
// Requires: Authorization (COURIER)
// Query params: status, distance, page, limit

POST /api/v1/courier/offers/:id/accept
// Accept delivery offer
// Requires: Authorization (COURIER)

POST /api/v1/courier/offers/:id/reject
// Reject delivery offer
// Requires: Authorization (COURIER)
{
  "reason": "Too far from current location"
}
```

### 8.14.2 إدارة الكابتنات للـ Admin
```typescript
GET /api/v1/courier/admin
// Get all couriers (admin)
// Requires: Authorization (ADMIN)
// Query params: status, rating, page, limit

PATCH /api/v1/courier/admin/:id
// Update courier (admin)
// Requires: Authorization (ADMIN)
{
  "isActive": true,
  "isVerified": true,
  "rating": 4.8,
  "vehicleType": "MOTORCYCLE",
  "licensePlate": "ABC1234"
}
```

## 8.15 المستخدمون (Users) — `/api/v1/users`

### 8.15.1 إدارة المستخدمين
```typescript
GET /api/v1/users/me
// Get current user profile
// Requires: Authorization

PATCH /api/v1/users/me
// Update user profile
// Requires: Authorization
{
  "fullName": "Updated Name",
  "avatar": "avatar_url",
  "phone": "+201234567890",
  "preferences": {
    "language": "ar",
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}

GET /api/v1/users/me/activity
// Get user activity log
// Requires: Authorization

DELETE /api/v1/users/me
// Delete user account
// Requires: Authorization
{
  "password": "CurrentPassword123!",
  "reason": "No longer need the service"
}
```

### 8.15.2 إدارة المستخدمين للـ Admin
```typescript
GET /api/v1/users/admin
// Get all users (admin)
// Requires: Authorization (ADMIN)
// Query params: role, status, registrationDate, page, limit

GET /api/v1/users/admin/:id
// Get user details (admin)
// Requires: Authorization (ADMIN)

PATCH /api/v1/users/admin/:id
// Update user (admin)
// Requires: Authorization (ADMIN)
{
  "role": "ADMIN",
  "isActive": true,
  "isEmailVerified": true,
  "permissions": ["MANAGE_SHOPS", "MANAGE_USERS"]
}

DELETE /api/v1/users/admin/:id
// Delete user (admin)
// Requires: Authorization (ADMIN)
```

## 8.16 العمليات التشغيلية (Operational) — `/api/v1/ops`

### 8.16.1 صحة النظام (System Health)
```typescript
GET /api/v1/ops/health
// System health check
{
  "status": "up",
  "timestamp": "2023-12-01T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": {
      "status": "up",
      "responseTime": 15
    },
    "redis": {
      "status": "up",
      "responseTime": 2
    },
    "storage": {
      "status": "up",
      "usedSpace": "45GB",
      "totalSpace": "100GB"
    }
  }
}

GET /api/v1/ops/metrics
// System metrics
// Requires: Authorization (ADMIN)
{
  "uptime": 86400,
  "memoryUsage": 0.65,
  "cpuUsage": 0.35,
  "diskUsage": 0.45,
  "activeConnections": 150,
  "requestsPerMinute": 250
}
```

### 8.16.2 الصيانة والعمليات (Maintenance & Operations)
```typescript
POST /api/v1/ops/cache/clear
// Clear cache
// Requires: Authorization (ADMIN)
{
  "pattern": "user:*" // Optional pattern
}

POST /api/v1/ops/backup/create
// Create backup
// Requires: Authorization (ADMIN)

GET /api/v1/ops/logs
// Get system logs
// Requires: Authorization (ADMIN)
// Query params: level, service, date, page, limit

POST /api/v1/ops/maintenance/enable
// Enable maintenance mode
// Requires: Authorization (ADMIN)

POST /api/v1/ops/maintenance/disable
// Disable maintenance mode
// Requires: Authorization (ADMIN)
```

## 8.17 رموز الخطأ الشائعة (Common Error Codes)

### 8.17.1 رموز المصادقة (Authentication Error Codes)
```typescript
AUTH_001: "Invalid credentials"
AUTH_002: "Token expired"
AUTH_003: "Token invalid"
AUTH_004: "User not found"
AUTH_005: "Account deactivated"
AUTH_006: "Email not verified"
AUTH_007: "Insufficient permissions"
AUTH_008: "Account locked"
```

### 8.17.2 رموز التحقق (Validation Error Codes)
```typescript
VAL_001: "Required field missing"
VAL_002: "Invalid email format"
VAL_003: "Password too weak"
VAL_004: "Invalid phone number"
VAL_005: "Invalid date format"
VAL_006: "File too large"
VAL_007: "Invalid file type"
```

### 8.17.3 رموز العمل (Business Logic Error Codes)
```typescript
BIZ_001: "Insufficient stock"
BIZ_002: "Shop not active"
BIZ_003: "Order cannot be cancelled"
BIZ_004: "Payment failed"
BIZ_005: "Delivery not available"
BIZ_006: "Duplicate order"
BIZ_007: "Invalid quantity"
```

### 8.17.4 رموز النظام (System Error Codes)
```typescript
SYS_001: "Database connection failed"
SYS_002: "Cache service unavailable"
SYS_003: "File upload failed"
SYS_004: "External service error"
SYS_005: "Rate limit exceeded"
SYS_006: "Service temporarily unavailable"
```

## 8.18 أفضل الممارسات (Best Practices)

### 8.18.1 استخدام الـ API
```typescript
// 1. استخدم الـ Authorization header دائماً للمصادقة
Authorization: Bearer <jwt_token>

// 2. استخدم الـ Content-Type المناسب
Content-Type: application/json
Content-Type: multipart/form-data

// 3. تعامل مع الـ pagination بشكل صحيح
GET /api/v1/products?page=1&limit=20

// 4. استخدم الـ filtering والـ sorting
GET /api/v1/products?category=electronics&sortBy=price&order=asc

// 5. تعامل مع الـ errors بشكل صحيح
{
  "success": false,
  "error": {
    "code": "VAL_001",
    "message": "Required field missing",
    "details": {
      "field": "email",
      "value": null
    }
  }
}
```

### 8.18.2 Rate Limiting
```typescript
// حدود الـ rate limiting حسب نوع الـ endpoint
// Auth endpoints: 5 requests per 15 minutes
// General API: 100 requests per 15 minutes
// File upload: 10 requests per hour
// Admin endpoints: 50 requests per 15 minutes
```

### 8.18.3 Caching
```typescript
// الـ endpoints المُخبأة (cached):
// - GET /api/v1/shops
// - GET /api/v1/products
// - GET /api/v1/offers
// - GET /api/v1/analytics (لـ 5 دقائق)
// - GET /api/v1/ops/health (لـ 1 دقيقة)
```

هذه الخريطة الشاملة تغطي جميع الـ endpoints المتاحة في Ray API مع تفاصيل الطلبات والاستجابات وأفضل الممارسات للاستخدام.
- `GET /:id`
- `POST /`
- `POST /manage/by-shop/:shopId/import-drafts`
- `PATCH /:id/stock`
- `PATCH /:id`
- `DELETE /:id`

## 8.5 Orders — `/api/v1/orders`
- `GET /me`
- `GET /`
- `GET /admin`
- `GET /courier/me`
- `POST /`
- `PATCH /:id`
- `PATCH /:id/assign-courier`
- `PATCH /:id/courier`
- `GET /:id/returns`
- `POST /:id/returns`

## 8.6 Reservations — `/api/v1/reservations`
- `POST /`
- `GET /me`
- `GET /`
- `PATCH /:id/status`

## 8.7 Offers — `/api/v1/offers`
- `GET /`
- `GET /:id`
- `POST /`
- `DELETE /:id`

## 8.8 Invoices — `/api/v1/invoices`
- `GET /me`
- `GET /summary/me`
- `GET /`
- `GET /summary`
- `GET /:id`
- `POST /`
- `PATCH /:id`

## 8.9 Gallery — `/api/v1/gallery`
- `POST /upload`
- `GET /:shopId`
- `DELETE /:id`
- `POST /:id/caption`

## 8.10 Media — `/api/v1/media`
- `GET /ping`
- `GET /status`
- `POST /presign`
- `POST /upload`
- `PUT /upload`
- `POST /complete`

## 8.11 Analytics — `/api/v1/analytics`
- `GET /system`
- `GET /system/timeseries`
- `GET /system/activity`

## 8.12 Notifications — `/api/v1/notifications`
- `GET /me`
- `GET /me/unread-count`
- `PATCH /me/read`
- `PATCH /me/:id/read`
- `GET /shop/:shopId`
- `GET /shop/:shopId/unread-count`
- `PATCH /shop/:shopId/read`
- `PATCH /shop/:shopId/:id/read`

## 8.13 Feedback — `/api/v1/feedback`
- `POST /public`
- `POST /`
- `GET /admin`
- `PATCH /admin/:id/status`
- `DELETE /admin/:id`

## 8.14 Customers — `/api/v1/customers`
- `GET /shop/:shopId`
- `PUT /:customerId/status`
- `POST /send-promotion`
- `POST /convert`

## 8.15 Courier — `/api/v1/courier`
- `GET /state`
- `PATCH /state`
- `GET /offers`
- `POST /offers/:id/accept`
- `POST /offers/:id/reject`

## 8.16 Users — `/api/v1/users`
- `PATCH /me`
- `GET /couriers`
- `POST /couriers`
- `GET /couriers/pending`
- `PATCH /couriers/:id/approve`
- `PATCH /couriers/:id/reject`

## 8.17 مسارات تشغيلية خارج `/api/v1`
- `GET /` و`GET /health` (health controller)
- `GET /monitoring/health|metrics|alerts|dashboard`
- `GET /db-test`
