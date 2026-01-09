# تحسينات قاعدة البيانات للتوسع المستقبلي

## نماذج مقترحة للإضافة

### 1. نموذج المتاجر ثلاثي الأبعاد
```prisma
model Shop3D {
  id          String   @id @default(cuid())
  shopId      String   @unique
  modelUrl    String   @map("model_url")
  thumbnailUrl String?  @map("thumbnail_url")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  shop        Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@map("shop_3d")
}
```

### 2. نموذج الخرائط والمواقع
```prisma
model ShopLocation {
  id          String   @id @default(cuid())
  shopId      String   @unique
  latitude    Float
  longitude   Float
  address     String
  floor       String?  // الدور
  apartment   String?  // الشقة
  landmark    String?  // معلم بارز
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  shop        Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@map("shop_locations")
}
```

### 3. نموذج التوصيل
```prisma
model Delivery {
  id            String         @id @default(cuid())
  orderId       String         @unique
  customerId    String
  shopId        String
  driverId      String?
  status        DeliveryStatus @default(PENDING)
  pickupTime    DateTime?
  deliveryTime  DateTime?
  address       String
  floor         String?
  apartment     String?
  notes         String?
  trackingCode  String         @unique
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  customer      User           @relation("CustomerDeliveries", fields: [customerId], references: [id])
  shop          Shop           @relation("ShopDeliveries", fields: [shopId], references: [id])
  driver        User?          @relation("DriverDeliveries", fields: [driverId], references: [id])
  order         Order          @relation(fields: [orderId], references: [id])

  @@map("deliveries")
}
```

### 4. نموذج السائقين
```prisma
model Driver {
  id          String   @id @default(cuid())
  userId      String   @unique
  licenseNo   String   @unique
  vehicleType VehicleType
  isAvailable Boolean  @default(true)
  rating      Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deliveries  Delivery[]

  @@map("drivers")
}
```

### 5. نموذج الخريطة العامة
```prisma
model RayMap {
  id          String   @id @default(cuid())
  name        String
  description String?
  imageUrl    String   @map("image_url")
  mapData     Json     // بيانات الخريطة التفاعلية
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("ray_maps")
}
```

## Enums جديدة
```prisma
enum DeliveryStatus {
  PENDING
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  CANCELLED
}

enum VehicleType {
  MOTORCYCLE
  CAR
  VAN
  BICYCLE
}
```

## تحسينات الفهرسة
```sql
-- فهرسة للبحث الجغرافي
CREATE INDEX idx_shop_locations_coords ON shop_locations (latitude, longitude);

-- فهرسة للتوصيل السريع
CREATE INDEX idx_deliveries_status ON deliveries (status);
CREATE INDEX idx_deliveries_driver ON deliveries (driver_id, status);

-- فهرسة للبحث في المتاجر
CREATE INDEX idx_shops_category_location ON shops (category, governorate, city);
```

## تحسينات الأداء
```sql
-- تقسيم الجداول الكبيرة
CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- ضغط البيانات القديمة
ALTER TABLE orders_2023 SET (autovacuum_vacuum_scale_factor = 0.05);
```
