CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TYPE store_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- Stores are the root tenant boundary. Every row in tenant-scoped tables
-- links back to store_id and is filtered by the tenant middleware.
CREATE TABLE stores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            CITEXT NOT NULL UNIQUE,
    domain          CITEXT UNIQUE,
    subdomain       CITEXT UNIQUE,
    logo_url        TEXT,
    status          store_status NOT NULL DEFAULT 'pending',
    settings        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index common lookups for tenant resolution.
CREATE UNIQUE INDEX idx_stores_slug ON stores (slug);
CREATE UNIQUE INDEX idx_stores_domain ON stores (domain) WHERE domain IS NOT NULL;
CREATE UNIQUE INDEX idx_stores_subdomain ON stores (subdomain) WHERE subdomain IS NOT NULL;

-- Example tenant-scoped table: users of a store.
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email       CITEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(50) NOT NULL DEFAULT 'member',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, email)
);

CREATE INDEX idx_users_store_id ON users (store_id);

-- Tenant-scoped products table.
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_store_id ON products (store_id);
CREATE INDEX idx_products_store_active ON products (store_id, is_active);
CREATE INDEX idx_products_created_at ON products (store_id, created_at DESC);

-- Tenant-scoped categories table (supports nested categories via parent_id).
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id    UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    description TEXT,
    image_url   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, slug)
);

CREATE INDEX idx_categories_store_id ON categories (store_id);
CREATE INDEX idx_categories_parent ON categories (parent_id);
CREATE INDEX idx_categories_store_active ON categories (store_id, is_active);

-- Link products to categories (many-to-many).
CREATE TABLE product_categories (
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_product ON product_categories (product_id);
CREATE INDEX idx_product_categories_category ON product_categories (category_id);

-- Order status enum.
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Tenant-scoped orders table.
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number    VARCHAR(50) NOT NULL,
    status          order_status NOT NULL DEFAULT 'pending',
    subtotal        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax             NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    customer_name   VARCHAR(255),
    customer_email  CITEXT,
    customer_phone  VARCHAR(50),
    shipping_address JSONB,
    billing_address  JSONB,
    notes           TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, order_number)
);

CREATE INDEX idx_orders_store_id ON orders (store_id);
CREATE INDEX idx_orders_store_status ON orders (store_id, status);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_created_at ON orders (store_id, created_at DESC);

-- Order items (line items for each order).
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity    INTEGER NOT NULL DEFAULT 1,
    subtotal    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- Media storage (tenant-scoped). Supports presigned uploads to S3/R2/MinIO
-- and records metadata for each uploaded file.
CREATE TABLE media (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    uploaded_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    purpose             VARCHAR(100) NOT NULL DEFAULT 'images',
    original_key        TEXT NOT NULL,
    original_url        TEXT NOT NULL,
    mime_type           VARCHAR(255) NOT NULL,
    file_size           BIGINT,
    width               INTEGER,
    height              INTEGER,
    thumb_key           TEXT,
    thumb_url           TEXT,
    small_key           TEXT,
    small_url           TEXT,
    medium_key          TEXT,
    medium_url          TEXT,
    optimized_key       TEXT,
    optimized_url       TEXT,
    optimization_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    optimization_error  TEXT,
    linked_type         VARCHAR(50),
    linked_id           UUID,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_store_id ON media (store_id);
CREATE INDEX idx_media_store_purpose ON media (store_id, purpose);
CREATE INDEX idx_media_linked ON media (linked_type, linked_id);
CREATE INDEX idx_media_created_at ON media (store_id, created_at DESC);
