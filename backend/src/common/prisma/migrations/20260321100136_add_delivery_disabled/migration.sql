/*
  Warnings:

  - You are about to drop the column `courierId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `orders` table. All the data in the column will be lost.
  - Added the required column `shop_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "total_amount" REAL NOT NULL,
    "total" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "source" TEXT DEFAULT 'customer',
    "user_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "handed_to_courier_at" DATETIME,
    "notes" TEXT,
    "delivered_at" DATETIME,
    "cod_collected_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("id", "paymentMethod", "paymentStatus", "source", "status", "total", "total_amount") SELECT "id", "paymentMethod", "paymentStatus", "source", "status", "total", "total_amount" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
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
    "delivery_disabled" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_shops" ("addons", "address", "addressDetailed", "banner_url", "category", "city", "coverImage", "createdAt", "delivery_fee", "description", "displayAddress", "email", "followers", "governorate", "id", "isActive", "latitude", "layout_config", "locationAccuracy", "locationSource", "locationUpdatedAt", "logo", "logo_url", "longitude", "mapLabel", "name", "openingHours", "ownerId", "page_design", "phone", "slug", "status", "updatedAt", "visitors", "website") SELECT "addons", "address", "addressDetailed", "banner_url", "category", "city", "coverImage", "createdAt", "delivery_fee", "description", "displayAddress", "email", "followers", "governorate", "id", "isActive", "latitude", "layout_config", "locationAccuracy", "locationSource", "locationUpdatedAt", "logo", "logo_url", "longitude", "mapLabel", "name", "openingHours", "ownerId", "page_design", "phone", "slug", "status", "updatedAt", "visitors", "website" FROM "shops";
DROP TABLE "shops";
ALTER TABLE "new_shops" RENAME TO "shops";
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");
CREATE UNIQUE INDEX "shops_ownerId_key" ON "shops"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
