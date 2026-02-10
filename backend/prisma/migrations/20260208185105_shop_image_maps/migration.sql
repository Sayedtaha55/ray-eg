/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `orders` table. All the data in the column will be lost.
  - Added the required column `total_amount` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "shop_image_maps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_id" TEXT NOT NULL,
    "title" TEXT,
    "image_url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ai_meta" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shop_image_maps_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shop_image_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "map_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shop_image_sections_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "shop_image_maps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shop_image_hotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "map_id" TEXT NOT NULL,
    "section_id" TEXT,
    "product_id" TEXT,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL,
    "height" REAL,
    "label" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "price_override" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ai_meta" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shop_image_hotspots_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "shop_image_maps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shop_image_hotspots_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "shop_image_sections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "shop_image_hotspots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "typeSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "shopId" TEXT,
    "productId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "feedback_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "feedback_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_feedback" ("comment", "createdAt", "id", "productId", "rating", "shopId", "status", "userEmail", "userId", "userName") SELECT "comment", "createdAt", "id", "productId", "rating", "shopId", "status", "userEmail", "userId", "userName" FROM "feedback";
DROP TABLE "feedback";
ALTER TABLE "new_feedback" RENAME TO "feedback";
CREATE TABLE "new_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "shopId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_notifications" ("content", "createdAt", "id", "read", "title", "type", "userId") SELECT "content", "createdAt", "id", "read", "title", "type", "userId" FROM "notifications";
DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
CREATE TABLE "new_offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discount" REAL NOT NULL,
    "old_price" REAL,
    "new_price" REAL,
    "image_url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "expires_at" DATETIME,
    "shopId" TEXT NOT NULL,
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offers_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "offers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_offers" ("createdAt", "description", "discount", "endDate", "id", "productId", "shopId", "startDate", "title", "updatedAt") SELECT "createdAt", "description", "discount", "endDate", "id", "productId", "shopId", "startDate", "title", "updatedAt" FROM "offers";
DROP TABLE "offers";
ALTER TABLE "new_offers" RENAME TO "offers";
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "total_amount" REAL NOT NULL,
    "total" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "deliveryAddress" TEXT,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "courierId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "deliveryAddress", "id", "paymentMethod", "paymentStatus", "shopId", "status", "updatedAt", "userId") SELECT "createdAt", "deliveryAddress", "id", "paymentMethod", "paymentStatus", "shopId", "status", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "image_url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER,
    "track_stock" BOOLEAN NOT NULL DEFAULT true,
    "images" JSONB,
    "colors" JSONB,
    "sizes" JSONB,
    "addons" JSONB,
    "menu_variants" JSONB,
    "shopId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("category", "createdAt", "description", "id", "image", "inStock", "menu_variants", "name", "price", "shopId", "stock", "updatedAt") SELECT "category", "createdAt", "description", "id", "image", "inStock", "menu_variants", "name", "price", "shopId", "stock", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE TABLE "new_shops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "logo_url" TEXT,
    "coverImage" TEXT,
    "banner_url" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressDetailed" TEXT,
    "displayAddress" TEXT,
    "mapLabel" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "locationSource" TEXT,
    "locationAccuracy" REAL,
    "locationUpdatedAt" DATETIME,
    "openingHours" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT NOT NULL DEFAULT 'RETAIL',
    "governorate" TEXT,
    "city" TEXT,
    "delivery_fee" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "addons" JSONB,
    "page_design" JSONB,
    "layout_config" JSONB,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_shops" ("addons", "address", "addressDetailed", "coverImage", "createdAt", "description", "displayAddress", "email", "id", "latitude", "locationAccuracy", "locationSource", "locationUpdatedAt", "logo", "longitude", "mapLabel", "name", "openingHours", "ownerId", "phone", "slug", "status", "updatedAt", "website") SELECT "addons", "address", "addressDetailed", "coverImage", "createdAt", "description", "displayAddress", "email", "id", "latitude", "locationAccuracy", "locationSource", "locationUpdatedAt", "logo", "longitude", "mapLabel", "name", "openingHours", "ownerId", "phone", "slug", "status", "updatedAt", "website" FROM "shops";
DROP TABLE "shops";
ALTER TABLE "new_shops" RENAME TO "shops";
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");
CREATE UNIQUE INDEX "shops_ownerId_key" ON "shops"("ownerId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "shop_image_maps_shop_id_idx" ON "shop_image_maps"("shop_id");

-- CreateIndex
CREATE INDEX "shop_image_sections_map_id_idx" ON "shop_image_sections"("map_id");

-- CreateIndex
CREATE INDEX "shop_image_hotspots_map_id_idx" ON "shop_image_hotspots"("map_id");

-- CreateIndex
CREATE INDEX "shop_image_hotspots_section_id_idx" ON "shop_image_hotspots"("section_id");

-- CreateIndex
CREATE INDEX "shop_image_hotspots_product_id_idx" ON "shop_image_hotspots"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");
