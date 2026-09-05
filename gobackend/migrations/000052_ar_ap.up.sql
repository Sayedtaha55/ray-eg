-- Phase 2: Customers (AR) / Vendors (AP)

-- Add customer/vendor classification to accounts
ALTER TABLE acc_accounts
    ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('normal', 'customer', 'vendor')) DEFAULT 'normal',
    ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'EGP',
    ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 0;   -- net days

-- Business entities (customers / vendors)
CREATE TABLE IF NOT EXISTS acc_entities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id       UUID NOT NULL,
    entity_type   TEXT  NOT NULL CHECK (entity_type IN ('customer', 'vendor')),
    name          TEXT  NOT NULL,
    name_en       TEXT,
    tax_id        TEXT,
    phone         TEXT,
    email         TEXT,
    address       TEXT,
    currency_code TEXT  NOT NULL DEFAULT 'EGP',
    credit_limit  NUMERIC(12,2) DEFAULT 0,
    balance       NUMERIC(12,2) DEFAULT 0,     -- running balance (receivable / payable)
    status        TEXT  NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_by    UUID,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_entities_shop_type ON acc_entities(shop_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON acc_entities(shop_id, name);

-- Trade invoices  (linked to entity; auto-posts journal when status -> posted)
CREATE TABLE IF NOT EXISTS acc_invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL,
    entity_id       UUID REFERENCES acc_entities(id),
    entity_type     TEXT NOT NULL CHECK (entity_type IN ('customer','vendor')),
    invoice_type    TEXT NOT NULL CHECK (invoice_type IN ('sale','purchase')),
    number          TEXT NOT NULL,
    invoice_date    DATE  NOT NULL,
    due_date        DATE  NOT NULL,
    currency_code   TEXT  NOT NULL DEFAULT 'EGP',
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_total       NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance         NUMERIC(12,2) NOT NULL DEFAULT 0,
    status          TEXT  NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','cancelled')),
    journal_id      UUID,               -- null until posted
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_shop_number ON acc_invoices(shop_id, number, entity_type);
CREATE INDEX IF NOT EXISTS idx_invoices_entity_due ON acc_invoices(entity_id, due_date);

CREATE TABLE IF NOT EXISTS acc_invoice_lines (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID NOT NULL REFERENCES acc_invoices(id) ON DELETE CASCADE,
    description TEXT,
    account_id  UUID,
    quantity    NUMERIC(12,4) DEFAULT 1,
    unit_price  NUMERIC(12,2) DEFAULT 0,
    tax_rate    NUMERIC(5,2) DEFAULT 0,
    tax_amount  NUMERIC(12,2) DEFAULT 0,
    amount      NUMERIC(12,2) DEFAULT 0,
    line_no     INTEGER NOT NULL
);

-- Payments received from customers / paid to vendors
CREATE TABLE IF NOT EXISTS acc_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL,
    entity_id       UUID REFERENCES acc_entities(id),
    entity_type     TEXT NOT NULL CHECK (entity_type IN ('customer','vendor')),
    payment_type    TEXT NOT NULL CHECK (payment_type IN ('receipt','payment')),   -- receipt=money in / payment=money out
    number          TEXT NOT NULL,
    payment_date    DATE  NOT NULL,
    amount          NUMERIC(12,2) NOT NULL,
    currency_code   TEXT  NOT NULL DEFAULT 'EGP',
    method          TEXT  NOT NULL CHECK (method IN ('cash','bank','mobile','check','other')),
    reference       TEXT,
    status          TEXT  NOT NULL DEFAULT 'posted' CHECK (status IN ('draft','posted','cancelled')),
    journal_id      UUID,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_shop_number ON acc_payments(shop_id, number);
CREATE INDEX IF NOT EXISTS idx_payments_entity_date ON acc_payments(entity_id, payment_date);

CREATE TABLE IF NOT EXISTS acc_payment_allocations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id  UUID NOT NULL REFERENCES acc_payments(id) ON DELETE CASCADE,
    invoice_id  UUID NOT NULL REFERENCES acc_invoices(id),
    allocated   NUMERIC(12,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pa_payment ON acc_payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_pa_invoice ON acc_payment_allocations(invoice_id);

-- Aging snapshot table (materialised daily for performance)
CREATE TABLE IF NOT EXISTS acc_aging (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL,
    entity_id       UUID NOT NULL REFERENCES acc_entities(id),
    as_of           DATE NOT NULL,
    bucket          TEXT  NOT NULL CHECK (bucket IN ('current','0_30','30_60','60_90','90_plus')),
    amount          NUMERIC(12,2) NOT NULL,
    currency_code   TEXT  NOT NULL DEFAULT 'EGP',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aging_entity ON acc_aging(entity_id, as_of);
CREATE INDEX IF NOT EXISTS idx_aging_shop ON acc_aging(shop_id, as_of);
