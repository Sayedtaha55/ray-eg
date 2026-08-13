-- Finish the Prisma -> snake_case column-naming conversion for the four
-- foundational tables (users, shops, products, orders) plus offers, so the
-- Go backend (gobackend) can query them with the same snake_case convention
-- already used by every other table. Column values are preserved; only the
-- names change (matching the new `@map(...)` directives added to
-- prisma/schema.prisma in this same change).
--
-- NOTE: applied directly against the shared dev database via `psql` because
-- no Node.js/Prisma CLI was available in the environment that authored this
-- migration. After pulling this change, run `npx prisma generate` (and, if
-- you use `prisma migrate deploy`, mark this migration as already applied
-- with `npx prisma migrate resolve --applied 20260803000000_gobackend_snake_case_core_columns`)
-- so the Prisma Client matches the new column names.

-- users
ALTER TABLE "users" RENAME COLUMN "shopId" TO "shop_id";
ALTER TABLE "users" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "users" RENAME COLUMN "lastLogin" TO "last_login";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tfa_secret" TEXT;

-- shops
ALTER TABLE "shops" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "shops" RENAME COLUMN "ownerId" TO "owner_id";
ALTER TABLE "shops" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "shops" RENAME COLUMN "updatedAt" TO "updated_at";

-- products
ALTER TABLE "products" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "products" RENAME COLUMN "shopId" TO "shop_id";
ALTER TABLE "products" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "products" RENAME COLUMN "updatedAt" TO "updated_at";

-- orders
ALTER TABLE "orders" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "orders" RENAME COLUMN "shopId" TO "shop_id";
ALTER TABLE "orders" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "orders" RENAME COLUMN "updatedAt" TO "updated_at";

-- offers
ALTER TABLE "offers" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "offers" RENAME COLUMN "shopId" TO "shop_id";
ALTER TABLE "offers" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "offers" RENAME COLUMN "updatedAt" TO "updated_at";
