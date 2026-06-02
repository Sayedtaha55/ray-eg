-- DropIndex
DROP INDEX "shops_category_governorate_createdAt_idx";

-- DropIndex
DROP INDEX "shops_status_createdAt_idx";

-- CreateTable
CREATE TABLE "user_measurements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "label" TEXT,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'cm',
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "map_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "website_url" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "social_links" JSONB,
    "logo_url" TEXT,
    "cover_url" TEXT,
    "linked_shop_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_at" DATETIME,
    "reviewed_by_admin_id" TEXT,
    "review_note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "map_listing_branches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listing_id" TEXT NOT NULL,
    "name" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address_label" TEXT,
    "governorate" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "map_listing_branches_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "map_listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "map_listing_owners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "map_listing_ownerships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listing_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "granted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "map_listing_ownerships_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "map_listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "map_listing_ownerships_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "map_listing_owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "map_listing_claim_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listing_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "reviewed_at" DATETIME,
    "reviewed_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "map_listing_claim_requests_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "map_listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "map_listing_claim_requests_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "map_listing_owners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "map_listing_analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listing_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "meta" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "map_listing_analytics_events_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "map_listings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portal_otp_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'login',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "booking_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "booking_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "description" TEXT,
    "duration_minutes" INTEGER,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "capacity" INTEGER DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "booking_services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "booking_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_services_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "type" TEXT,
    "capacity" INTEGER DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "booking_resources_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "booking_services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_resources_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_id" TEXT NOT NULL,
    "resource_id" TEXT,
    "date" DATETIME NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "max_capacity" INTEGER NOT NULL DEFAULT 1,
    "current_bookings" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "booking_slots_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "booking_services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_number" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "participants" INTEGER NOT NULL DEFAULT 1,
    "total_amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "special_requests" TEXT,
    "metadata" JSONB,
    "confirmed_at" DATETIME,
    "cancelled_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "booking_services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "booking_slots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "payment_method" TEXT NOT NULL,
    "payment_reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_at" DATETIME,
    "refunded_at" DATETIME,
    "refund_amount" REAL,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "booking_payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "user_measurements_user_id_idx" ON "user_measurements"("user_id");

-- CreateIndex
CREATE INDEX "user_measurements_user_id_is_active_idx" ON "user_measurements"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "map_listings_status_idx" ON "map_listings"("status");

-- CreateIndex
CREATE INDEX "map_listings_category_idx" ON "map_listings"("category");

-- CreateIndex
CREATE INDEX "map_listing_branches_listing_id_idx" ON "map_listing_branches"("listing_id");

-- CreateIndex
CREATE INDEX "map_listing_branches_governorate_idx" ON "map_listing_branches"("governorate");

-- CreateIndex
CREATE INDEX "map_listing_branches_latitude_longitude_idx" ON "map_listing_branches"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "map_listing_owners_phone_key" ON "map_listing_owners"("phone");

-- CreateIndex
CREATE INDEX "map_listing_owners_phone_idx" ON "map_listing_owners"("phone");

-- CreateIndex
CREATE INDEX "map_listing_owners_is_active_idx" ON "map_listing_owners"("is_active");

-- CreateIndex
CREATE INDEX "map_listing_ownerships_listing_id_idx" ON "map_listing_ownerships"("listing_id");

-- CreateIndex
CREATE INDEX "map_listing_ownerships_owner_id_idx" ON "map_listing_ownerships"("owner_id");

-- CreateIndex
CREATE INDEX "map_listing_ownerships_owner_id_role_idx" ON "map_listing_ownerships"("owner_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "map_listing_ownerships_listing_id_owner_id_key" ON "map_listing_ownerships"("listing_id", "owner_id");

-- CreateIndex
CREATE INDEX "map_listing_claim_requests_listing_id_idx" ON "map_listing_claim_requests"("listing_id");

-- CreateIndex
CREATE INDEX "map_listing_claim_requests_owner_id_idx" ON "map_listing_claim_requests"("owner_id");

-- CreateIndex
CREATE INDEX "map_listing_claim_requests_status_idx" ON "map_listing_claim_requests"("status");

-- CreateIndex
CREATE INDEX "map_listing_analytics_events_listing_id_idx" ON "map_listing_analytics_events"("listing_id");

-- CreateIndex
CREATE INDEX "map_listing_analytics_events_listing_id_type_idx" ON "map_listing_analytics_events"("listing_id", "type");

-- CreateIndex
CREATE INDEX "map_listing_analytics_events_listing_id_created_at_idx" ON "map_listing_analytics_events"("listing_id", "created_at");

-- CreateIndex
CREATE INDEX "map_listing_analytics_events_created_at_idx" ON "map_listing_analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "portal_otp_codes_phone_purpose_idx" ON "portal_otp_codes"("phone", "purpose");

-- CreateIndex
CREATE INDEX "portal_otp_codes_expires_at_idx" ON "portal_otp_codes"("expires_at");

-- CreateIndex
CREATE INDEX "booking_categories_type_idx" ON "booking_categories"("type");

-- CreateIndex
CREATE INDEX "booking_categories_is_active_idx" ON "booking_categories"("is_active");

-- CreateIndex
CREATE INDEX "booking_services_category_id_idx" ON "booking_services"("category_id");

-- CreateIndex
CREATE INDEX "booking_services_shop_id_idx" ON "booking_services"("shop_id");

-- CreateIndex
CREATE INDEX "booking_services_is_active_idx" ON "booking_services"("is_active");

-- CreateIndex
CREATE INDEX "booking_resources_service_id_idx" ON "booking_resources"("service_id");

-- CreateIndex
CREATE INDEX "booking_resources_shop_id_idx" ON "booking_resources"("shop_id");

-- CreateIndex
CREATE INDEX "booking_resources_is_active_idx" ON "booking_resources"("is_active");

-- CreateIndex
CREATE INDEX "booking_slots_service_id_idx" ON "booking_slots"("service_id");

-- CreateIndex
CREATE INDEX "booking_slots_resource_id_idx" ON "booking_slots"("resource_id");

-- CreateIndex
CREATE INDEX "booking_slots_date_status_idx" ON "booking_slots"("date", "status");

-- CreateIndex
CREATE INDEX "booking_slots_status_idx" ON "booking_slots"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "bookings"("booking_number");

-- CreateIndex
CREATE INDEX "bookings_service_id_idx" ON "bookings"("service_id");

-- CreateIndex
CREATE INDEX "bookings_slot_id_idx" ON "bookings"("slot_id");

-- CreateIndex
CREATE INDEX "bookings_shop_id_idx" ON "bookings"("shop_id");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_date_idx" ON "bookings"("date");

-- CreateIndex
CREATE INDEX "bookings_booking_number_idx" ON "bookings"("booking_number");

-- CreateIndex
CREATE INDEX "booking_payments_booking_id_idx" ON "booking_payments"("booking_id");

-- CreateIndex
CREATE INDEX "booking_payments_status_idx" ON "booking_payments"("status");

-- CreateIndex
CREATE INDEX "orders_shop_id_status_created_at_idx" ON "orders"("shop_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");
