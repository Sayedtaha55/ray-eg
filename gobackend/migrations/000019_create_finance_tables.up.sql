-- Finance module: accounts, journal_entries, expenses, taxes, wallets, transactions

CREATE TABLE IF NOT EXISTS fin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    code VARCHAR(40) NOT NULL,
    name VARCHAR(160) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'asset',
    balance NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (shop_id, code)
);

CREATE INDEX IF NOT EXISTS idx_fin_accounts_shop_id ON fin_accounts(shop_id);

CREATE TABLE IF NOT EXISTS fin_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description VARCHAR(240) NOT NULL,
    account VARCHAR(160),
    debit NUMERIC(14,2) NOT NULL DEFAULT 0,
    credit NUMERIC(14,2) NOT NULL DEFAULT 0,
    reference VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_journal_shop_id ON fin_journal_entries(shop_id);
CREATE INDEX IF NOT EXISTS idx_fin_journal_date ON fin_journal_entries(date DESC);

CREATE TABLE IF NOT EXISTS fin_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'other',
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_expenses_shop_id ON fin_expenses(shop_id);
CREATE INDEX IF NOT EXISTS idx_fin_expenses_date ON fin_expenses(date DESC);

CREATE TABLE IF NOT EXISTS fin_taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    rate NUMERIC(6,2) NOT NULL DEFAULT 0,
    type VARCHAR(20) NOT NULL DEFAULT 'inclusive',
    applied_to VARCHAR(160),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_taxes_shop_id ON fin_taxes(shop_id);

CREATE TABLE IF NOT EXISTS fin_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'cash',
    balance NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EGP',
    number VARCHAR(80),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_wallets_shop_id ON fin_wallets(shop_id);

CREATE TABLE IF NOT EXISTS fin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    wallet_id UUID REFERENCES fin_wallets(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'income',
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    description VARCHAR(240),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_transactions_shop_id ON fin_transactions(shop_id);
CREATE INDEX IF NOT EXISTS idx_fin_transactions_date ON fin_transactions(date DESC);
