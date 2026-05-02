-- CreateTable
CREATE TABLE "users" (
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

-- CreateTable
CREATE TABLE "shops" (
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

-- CreateTable
CREATE TABLE "shop_module_upgrade_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_modules" JSONB NOT NULL,
    "reviewed_at" DATETIME,
    "note" TEXT,
    "requested_by_user_id" TEXT,
    "reviewed_by_admin_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shop_module_upgrade_requests_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "track_stock" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL DEFAULT 'عام',
    "unit" TEXT,
    "pack_options" JSONB,
    "image_url" TEXT,
    "images" JSONB,
    "colors" JSONB,
    "sizes" JSONB,
    "addons" JSONB,
    "menu_variants" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shopId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "image_url" TEXT,
    "width" INTEGER,
    "height" INTEGER,
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
CREATE TABLE "offers" (
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

-- CreateTable
CREATE TABLE "orders" (
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

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variant_selection" JSONB,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "shopId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
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

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "variant_selection" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reservations_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feedback" (
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

-- CreateTable
CREATE TABLE "shop_gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "thumbUrl" TEXT,
    "mediumUrl" TEXT,
    "caption" TEXT,
    "shopId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shop_gallery_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shop_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "revenue" REAL NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "visitorsCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shop_analytics_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shop_themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "borderRadius" TEXT NOT NULL,
    "customCSS" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shop_themes_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "theme_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "borderRadius" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "source" TEXT,
    "path" TEXT,
    CONSTRAINT "visits_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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

-- CreateTable
CREATE TABLE "_ShopFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ShopFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "shops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ShopFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "shops_ownerId_key" ON "shops"("ownerId");

-- CreateIndex
CREATE INDEX "shop_module_upgrade_requests_shop_id_idx" ON "shop_module_upgrade_requests"("shop_id");

-- CreateIndex
CREATE INDEX "shop_module_upgrade_requests_status_idx" ON "shop_module_upgrade_requests"("status");

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
CREATE UNIQUE INDEX "shop_analytics_shopId_key" ON "shop_analytics"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_themes_shopId_key" ON "shop_themes"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "theme_templates_name_key" ON "theme_templates"("name");

-- CreateIndex
CREATE INDEX "visits_shopId_date_idx" ON "visits"("shopId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "visits_shopId_date_ipHash_key" ON "visits"("shopId", "date", "ipHash");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ShopFollowers_AB_unique" ON "_ShopFollowers"("A", "B");

-- CreateIndex
CREATE INDEX "_ShopFollowers_B_index" ON "_ShopFollowers"("B");
