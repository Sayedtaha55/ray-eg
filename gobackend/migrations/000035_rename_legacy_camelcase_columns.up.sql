-- Align legacy Prisma-era camelCase columns with the snake_case names the
-- Go backend queries. PostgreSQL automatically rewrites indexes, FKs and
-- views on RENAME COLUMN, so this is safe for existing data.
-- The old Node backend is retired; these tables are only written by Go now.

-- shops: camelCase columns have no snake_case twins yet -> rename.
ALTER TABLE shops RENAME COLUMN "isActive"  TO is_active;
ALTER TABLE shops RENAME COLUMN "ownerId"   TO owner_id;
ALTER TABLE shops RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE shops RENAME COLUMN "updatedAt" TO updated_at;

-- users: snake_case twins already exist (added by earlier migrations).
-- Copy any newer camelCase values across, then drop the legacy columns.
UPDATE users SET
    is_active  = "isActive",
    shop_id    = "shopId",
    last_login = "lastLogin",
    created_at = "createdAt",
    updated_at = "updatedAt";

ALTER TABLE users DROP COLUMN IF EXISTS "isActive";
ALTER TABLE users DROP COLUMN IF EXISTS "shopId";
ALTER TABLE users DROP COLUMN IF EXISTS "lastLogin";
ALTER TABLE users DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE users DROP COLUMN IF EXISTS "updatedAt";

-- products
ALTER TABLE products RENAME COLUMN "isActive"  TO is_active;
ALTER TABLE products RENAME COLUMN "shopId"    TO shop_id;
ALTER TABLE products RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE products RENAME COLUMN "updatedAt" TO updated_at;

-- orders
ALTER TABLE orders RENAME COLUMN "shopId"    TO shop_id;
ALTER TABLE orders RENAME COLUMN "userId"    TO user_id;
ALTER TABLE orders RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE orders RENAME COLUMN "updatedAt" TO updated_at;

-- offers
ALTER TABLE offers RENAME COLUMN "isActive"  TO is_active;
ALTER TABLE offers RENAME COLUMN "shopId"    TO shop_id;
ALTER TABLE offers RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE offers RENAME COLUMN "updatedAt" TO updated_at;

-- apps
ALTER TABLE apps RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE apps RENAME COLUMN "updatedAt" TO updated_at;
