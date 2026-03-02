# 6) دليل قاعدة البيانات وPrisma الشامل

## 6.1 ملفات Prisma المتاحة

### 6.1.1 هيكل الملفات
```
prisma/
├── schema.prisma              # المخطط الأساسي (PostgreSQL)
├── schema.postgres.prisma      # مخطط PostgreSQL محدد
├── schema-sqlite.prisma        # مخطط SQLite للتطوير السريع
├── migrations/                  # ملفات الترحيل (migrations)
│   ├── 001_initial_migration/
│   ├── 002_add_user_roles/
│   └── ...
├── seed.ts                     # بيانات أولية للنظام
└── seed-data/                  # ملفات البيانات الأولية
    ├── users.json
    ├── shops.json
    └── products.json
```

### 6.1.2 اختيار المخطط الصحيح
**PostgreSQL (الإنتاج والتطوير القياسي):**
```bash
# استخدام المخطط الأساسي
DATABASE_URL="postgresql://username:password@localhost:5432/ray_eg"
# أو تحديد المخطط مباشرة
DATABASE_URL="postgresql://username:password@localhost:5432/ray_eg?schema=public"
```

**SQLite (التطوير السريع والاختبار):**
```bash
# استخدام SQLite للتطوير السريع
DATABASE_URL="file:./dev.db"
# أو تحديد المخطط SQLite
DATABASE_URL="file:./dev.db?schema=public"
```

**التوصية:**
- استخدم **PostgreSQL** للتطوير القياسي والإنتاج
- استخدم **SQLite** فقط للتطوير السريع والاختبار الأولي
- لا تخلط بين المخططات في نفس البيئة

## 6.2 أوامر Prisma الأساسية

### 6.2.1 توليد Prisma Client
```bash
# توليد العميل الأساسي
npm run prisma:generate

# توليد مع مراقبة التغييرات
npx prisma generate --watch

# توليد للبيئة المحددة
npx prisma generate --schema=./prisma/schema.postgres.prisma
```

### 6.2.2 مزامنة قاعدة البيانات
```bash
# للتطوير (يحذف البيانات)
npm run prisma:push

# مزامنة مع التحقق
npx prisma db push --accept-data-loss

# تطبيق الترحيلات (للإنتاج)
npm run prisma:migrate:deploy

# إنشاء ترحيل جديد
npm run prisma:migrate:dev --name add_new_feature
```

### 6.2.3 إدارة الترحيلات (Migrations)
```bash
# عرض حالة الترحيلات
npx prisma migrate status

# إعادة تعيين قاعدة البيانات
npx prisma migrate reset

# تطبيق ترحيلات معينة
npx prisma migrate deploy --to 20231201120000_add_user_roles

# حل الترحيلات المعلقة
npx prisma migrate resolve
```

### 6.2.4 عرض قاعدة البيانات
```bash
# فتح واجهة Prisma Studio
npm run prisma:studio

# فتح Studio على بورت محدد
npx prisma studio --port 5555

# فتح Studio مع مخطط محدد
npx prisma studio --schema=./prisma/schema.postgres.prisma
```

### 6.2.5 التحقق والصيانة
```bash
# التحقق من صحة المخطط
npm run prisma:validate

# التحقق من صحة الاتصال بقاعدة البيانات
npx prisma db pull

# تنسيق الكود
npx prisma format

# فحص قاعدة البيانات
npx prisma db seed
```

## 6.3 استراتيجية الترحيلات (Migration Strategy)

### 6.3.1 أفضل الممارسات للترحيلات
```typescript
// 1. استخدم أسماء وصفية للترحيلات
// مثال: 20231201120000_add_user_roles_and_permissions

// 2. اكتب SQL واضح وقابل للقراءة
// مثال:
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

// 3. استخدم الـ constraints المناسبة
// - NOT NULL للحقول المطلوبة
// - UNIQUE للحقول الفريدة
// - FOREIGN KEY للعلاقات
// - CHECK للتحقق من القيم
```

### 6.3.2 أنواع التغييرات المدعومة
```typescript
// إضافة جدول جديد
model NewTable {
    id        String   @id @default(cuid())
    name      String   @unique
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

// إضافة حقل جديد
model ExistingModel {
    // حقول موجودة...
    newField String? @default("default_value")
    anotherField Int?    @default(0)
}

// تعديل حقل موجود
model ExistingModel {
    // تعديل نوع الحقل
    oldField    String @db.Text // كان String عادي
    // إضافة قيد فريد
    uniqueField String @unique
}

// إضافة علاقة
model User {
    id        String   @id @default(cuid())
    profileId String?  @unique
    profile   Profile? @relation(fields: [profileId], references: [id])
}

model Profile {
    id     String  @id @default(cuid())
    user   User?   @relation(fields: [id], references: [id])
    userId String? @unique
}
```

### 6.3.3 التعامل مع البيانات الحساسة
```typescript
// تشفير البيانات الحساسة
model User {
    id        String   @id @default(cuid())
    email     String   @unique
    password  String   // سيتم تشفيره في الـ service
    
    // حقول حساسة أخرى
    phone     String?  @map("phone_number")
    ssn       String?  @map("social_security_number") @db.Text
    
    @@map("users")
}

// استخدام الـ enums للحقول ذات القيم محددة
enum UserRole {
    CUSTOMER
    MERCHANT
    ADMIN
    COURIER
}

model User {
    id   String    @id @default(cuid())
    role UserRole  @default(CUSTOMER)
    
    @@map("users")
}
```

## 6.4 قواعد أمان البيانات

### 6.4.1 حماية البيانات الحساسة
```typescript
// 1. لا تخزن كلمات المرور كنص عادي
model User {
    id        String   @id @default(cuid())
    email     String   @unique
    password  String   // سيتم تخزين الـ hash فقط
    
    // لا تخزن بيانات حساسة في النص العادي
    // استخدم التشفير للبيانات المالية والشخصية
    creditCard String? @db.Text // مشفر
    ssn         String? @db.Text // مشفر
}

// 2. استخدم الـ soft deletes
model Product {
    id        String   @id @default(cuid())
    name      String
    deletedAt DateTime? @map("deleted_at")
    
    @@map("products")
}

// 3. استخدم الـ timestamps للتدقيق
model AuditLog {
    id        String   @id @default(cuid())
    action    String   // CREATE, UPDATE, DELETE
    tableName String   @map("table_name")
    recordId  String   @map("record_id")
    userId    String?  @map("user_id")
    oldData   Json?    @map("old_data")
    newData   Json?    @map("new_data")
    createdAt DateTime @default(now()) @map("created_at")
    
    @@map("audit_logs")
}
```

### 6.4.2 إعدادات الاتصال الآمنة
```bash
# استخدام SSL للاتصال بقاعدة البيانات
DATABASE_URL="postgresql://user:pass@localhost:5432/db?sslmode=require"

# تحديد مهلة الاتصال
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connect_timeout=10"

# استخدام connection pooling
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=20&pool_timeout=10"
```

### 6.4.3 النسخ الاحتياطي والاسترداد
```bash
# إنشاء نسخة احتياطية
pg_dump ray_eg > backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة النسخة الاحتياطية
psql ray_eg < backup_20231201_120000.sql

# باستخدام Prisma
npx prisma db push --force-reset
npx prisma db seed
```

## 6.5 تحسين الأداء (Performance Optimization)

### 6.5.1 الـ Indexes الاستراتيجية
```typescript
model Product {
    id          String   @id @default(cuid())
    name        String
    price       Decimal
    categoryId  String
    shopId      String
    createdAt   DateTime @default(now())
    
    // indexes للبحث السريع
    @@index([name])
    @@index([price])
    @@index([categoryId])
    @@index([shopId])
    @@index([createdAt])
    @@index([shopId, categoryId]) // composite index
    
    @@map("products")
}

model Order {
    id         String   @id @default(cuid())
    userId     String
    shopId     String
    status     OrderStatus
    total      Decimal
    createdAt  DateTime @default(now())
    
    // indexes للاستعلامات الشائعة
    @@index([userId])
    @@index([shopId])
    @@index([status])
    @@index([createdAt])
    @@index([userId, status]) // composite index
    @@index([shopId, createdAt]) // composite index
    
    @@map("orders")
}
```

### 6.5.2 تحسين الاستعلامات
```typescript
// استخدام select محدد لتقليل البيانات المنقولة
const products = await prisma.product.findMany({
    select: {
        id: true,
        name: true,
        price: true,
        shop: {
            select: {
                id: true,
                name: true
            }
        }
    },
    where: {
        categoryId: categoryId
    },
    orderBy: {
        createdAt: 'desc'
    },
    take: 20,
    skip: (page - 1) * 20
});

// استخدام include مع تحديد
const orders = await prisma.order.findMany({
    include: {
        user: {
            select: {
                id: true,
                name: true,
                email: true
            }
        },
        items: {
            select: {
                id: true,
                quantity: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        }
    }
});

// استخدام raw queries للاستعلامات المعقدة
const result = await prisma.$queryRaw`
    SELECT p.*, s.name as shop_name
    FROM products p
    JOIN shops s ON p.shop_id = s.id
    WHERE p.price > $1
    AND p.created_at > $2
    ORDER BY p.created_at DESC
    LIMIT $3
` [minPrice, date, limit];
```

### 6.5.3 Connection Pooling
```typescript
// prisma/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    
    // إعدادات connection pooling
    directUrl = env("DIRECT_URL") // للـ migrations
}

// في ملف البيئة
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=20&pool_timeout=10"
DIRECT_URL="postgresql://user:pass@localhost:5432/db"
```

## 6.6 البيانات الأولية (Seeding)

### 6.6.1 إعداد البيانات الأولية
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // إنشاء أدوار المستخدمين
    await prisma.userRole.createMany({
        data: [
            { name: 'CUSTOMER', description: 'Regular customer' },
            { name: 'MERCHANT', description: 'Shop owner' },
            { name: 'ADMIN', description: 'System administrator' },
            { name: 'COURIER', description: 'Delivery person' }
        ],
        skipDuplicates: true
    });

    // إنشاء مستخدم admin افتراضي
    const adminPassword = await hash('admin123');
    await prisma.user.upsert({
        where: { email: 'admin@ray-eg.com' },
        update: {},
        create: {
            email: 'admin@ray-eg.com',
            fullName: 'System Administrator',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
            isEmailVerified: true
        }
    });

    // إنشاء فئات المنتجات
    await prisma.category.createMany({
        data: [
            { name: 'Electronics', slug: 'electronics' },
            { name: 'Clothing', slug: 'clothing' },
            { name: 'Food', slug: 'food' },
            { name: 'Books', slug: 'books' },
            { name: 'Home & Garden', slug: 'home-garden' }
        ],
        skipDuplicates: true
    });

    // إنشاء متاجر تجريبية
    await prisma.shop.createMany({
        data: [
            {
                name: 'Demo Electronics',
                slug: 'demo-electronics',
                description: 'Best electronics store in town',
                email: 'demo@electronics.com',
                phone: '+201234567890',
                address: '123 Main St, Cairo, Egypt',
                isActive: true,
                isApproved: true
            },
            {
                name: 'Fashion Hub',
                slug: 'fashion-hub',
                description: 'Latest fashion trends',
                email: 'info@fashion-hub.com',
                phone: '+201098765432',
                address: '456 Fashion Ave, Alexandria, Egypt',
                isActive: true,
                isApproved: true
            }
        ],
        skipDuplicates: true
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

### 6.6.2 بيانات أولية للمنتجات
```typescript
// إنشاء منتجات تجريبية
const demoProducts = [
    {
        name: 'Smartphone XYZ',
        description: 'Latest smartphone with amazing features',
        price: 12999.99,
        originalPrice: 14999.99,
        sku: 'PHONE-XYZ-001',
        stock: 50,
        images: ['phone1.jpg', 'phone2.jpg'],
        shopId: 'demo-shop-id',
        categoryId: 'electronics-id',
        isActive: true,
        tags: ['smartphone', 'electronics', 'mobile']
    },
    {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation',
        price: 2499.99,
        sku: 'HEADPHONE-WL-001',
        stock: 100,
        images: ['headphones1.jpg', 'headphones2.jpg'],
        shopId: 'demo-shop-id',
        categoryId: 'electronics-id',
        isActive: true,
        tags: ['headphones', 'wireless', 'audio']
    }
];

await prisma.product.createMany({
    data: demoProducts,
    skipDuplicates: true
});
```

## 6.7 المراقبة والصيانة (Monitoring & Maintenance)

### 6.7.1 مراقبة أداء قاعدة البيانات
```typescript
// إنشاء service لمراقبة الأداء
class DatabaseMonitor {
    async checkConnection() {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return { status: 'connected', timestamp: new Date() };
        } catch (error) {
            return { status: 'error', error: error.message, timestamp: new Date() };
        }
    }

    async getTableSizes() {
        const tables = await prisma.$queryRaw`
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                nullfrac
            FROM pg_stats
            WHERE schemaname = 'public'
            ORDER BY tablename, attname;
        `;
        return tables;
    }

    async getSlowQueries() {
        const slowQueries = await prisma.$queryRaw`
            SELECT 
                query,
                calls,
                total_time,
                mean_time,
                rows
            FROM pg_stat_statements
            WHERE mean_time > 100
            ORDER BY mean_time DESC
            LIMIT 10;
        `;
        return slowQueries;
    }
}
```

### 6.7.2 الصيانة الدورية
```bash
#!/bin/bash
# scripts/db-maintenance.sh

echo "Starting database maintenance..."

# 1. تحديث الإحصائيات
echo "Updating statistics..."
psql -d ray_eg -c "ANALYZE;"

# 2. إعادة بناء الـ indexes
echo "Rebuilding indexes..."
psql -d ray_eg -c "REINDEX DATABASE ray_eg;"

# 3. تنظيف الجدول المؤقت
echo "Cleaning up temporary tables..."
psql -d ray_eg -c "VACUUM ANALYZE;"

# 4. التحقق من حجم قاعدة البيانات
echo "Database size:"
psql -d ray_eg -c "SELECT pg_size_pretty(pg_database_size('ray_eg'));"

# 5. التحقق من حجم الجداول
echo "Table sizes:"
psql -d ray_eg -c "
    SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;
"

echo "Database maintenance completed."
```

## 6.8 أخطاء شائعة وحلولها

### 6.8.1 Prisma Client Initialization Error
```bash
# المشكلة
Error: PrismaClientInitializationError: 
Unable to connect to the database: ...

# الحلول
# 1. تحقق من DATABASE_URL
echo $DATABASE_URL

# 2. تحقق من تشغيل قاعدة البيانات
pg_ctl status
# أو
sudo systemctl status postgresql

# 3. تحقق من صلاحيات المستخدم
psql -h localhost -U username -d database_name

# 4. تحقق من جدار الحماية
sudo ufw status
```

### 6.8.2 Schema Mismatch
```bash
# المشكلة
Error: Schema mismatch: The database schema does not match the Prisma schema

# الحلول
# 1. توليد Prisma Client جديد
npx prisma generate

# 2. مزامنة قاعدة البيانات
npx prisma db push

# 3. إعادة تعيين قاعدة البيانات (للتطوير)
npx prisma migrate reset
```

### 6.8.3 Migration Conflicts
```bash
# المشكلة
Error: Migration failed with error: relation "table_name" already exists

# الحلول
# 1. عرض حالة الترحيلات
npx prisma migrate status

# 2. حل الترحيلات المعلقة
npx prisma migrate resolve

# 3. إنشاء ترحيل جديد يدوياً
npx prisma migrate dev --name fix_table_conflict
```

## 6.9 أفضل الممارسات (Best Practices)

### 6.9.1 تصميم المخطط (Schema Design)
```typescript
// 1. استخدم أسماء واضحة ومتسقة
model User {
    id        String   @id @default(cuid())
    email     String   @unique
    createdAt DateTime @default(now()) @map("created_at")
    updatedAt DateTime @updatedAt @map("updated_at")
    
    @@map("users") // دائما استخدم أسماء جداول صغيرة
}

// 2. استخدم الـ constraints المناسبة
model Product {
    id        String   @id @default(cuid())
    name      String   @db.VarChar(255) // تحديد الطول
    price      Decimal  @db.Decimal(10, 2) // تحديد الدقة
    sku       String   @unique @db.VarChar(100)
    isActive  Boolean  @default(true)
    
    @@index([sku]) // index للبحث السريع
    @@index([isActive, createdAt]) // composite index
    @@map("products")
}

// 3. استخدم الـ enums للحقول ذات القيم محددة
enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
}

model Order {
    id     String      @id @default(cuid())
    status OrderStatus @default(PENDING)
    
    @@map("orders")
}
```

### 6.9.2 إدارة البيانات
```typescript
// 1. استخدم الـ transactions للعمليات المتعددة
async function createOrderWithItems(orderData: CreateOrderDto) {
    return await prisma.$transaction(async (tx) => {
        // إنشاء الطلب
        const order = await tx.order.create({
            data: {
                userId: orderData.userId,
                total: orderData.total,
                status: 'PENDING'
            }
        });

        // إنشاء عناصر الطلب
        for (const item of orderData.items) {
            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }
            });

            // تحديث المخزون
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        return order;
    });
}

// 2. استخدم الـ batch operations للعمليات المتعددة
async function updateMultipleProducts(updates: ProductUpdate[]) {
    const operations = updates.map(update => 
        prisma.product.update({
            where: { id: update.id },
            data: update.data
        })
    );

    return await prisma.$transaction(operations);
}

// 3. استخدم الـ pagination للبيانات الكبيرة
async function getProducts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
        prisma.product.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count()
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}
```

## 6.10 التحقق من النجاح (Success Checklist)

### 6.10.1 التحقق من التثبيت
- [ ] Node.js و npm مثبتان بشكل صحيح
- [ ] Prisma CLI مثبت (`npm install -g prisma`)
- [ ] قاعدة البيانات (PostgreSQL/SQLite) تعمل
- [ ] DATABASE_URL معرف بشكل صحيح
- [ ] الاعتماديات المثبتة (`npm install`)

### 6.10.2 التحقق من المخطط
- [ ] Prisma Client تم توليده (`npx prisma generate`)
- [ ] المخطط صالح (`npx prisma validate`)
- [ ] الاتصال بقاعدة البيانات يعمل
- [ ] الترحيلات تعمل (`npx prisma migrate status`)

### 6.10.3 التحقق من البيانات
- [ ] البيانات الأولية تم إضافتها (`npx prisma db seed`)
- [ ] Prisma Studio يعمل ويعرض البيانات
- [ ] الجداول والعلاقات صحيحة
- [ ] الـ indexes تم إنشاؤها بشكل صحيح

### 6.10.4 التحقق من الأداء
- [ ] الاستعلامات الأساسية تعمل بكفاءة
- [ ] الـ indexes تعمل بشكل صحيح
- [ ] Connection pooling يعمل
- [ ] لا يوجد استعلامات بطيئة

### 6.10.5 التحقق من الأمان
- [ ] البيانات الحساسة مشفرة
- [ ] الاتصالات تستخدم SSL
- [ ] الصلاحيات معدة بشكل صحيح
- [ ] النسخ الاحتياطي يعمل

هذا الدليل الشامل يغطي جميع جوانب إدارة قاعدة البيانات باستخدام Prisma، مع التركيز على أفضل الممارسات والأمان والأداء.
