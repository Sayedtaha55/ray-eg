-- Create seasonal_offers table
CREATE TABLE IF NOT EXISTS seasonal_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    occasion VARCHAR(100) NOT NULL DEFAULT 'general',
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    categories TEXT[] DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    banner_color VARCHAR(20) DEFAULT '#1A1A1A',
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('active', 'scheduled', 'paused', 'ended')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seasonal_offers_shop_id ON seasonal_offers(shop_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_offers_status ON seasonal_offers(status);
CREATE INDEX IF NOT EXISTS idx_seasonal_offers_is_active ON seasonal_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_seasonal_offers_occasion ON seasonal_offers(occasion);
CREATE INDEX IF NOT EXISTS idx_seasonal_offers_dates ON seasonal_offers(start_date, end_date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_seasonal_offers_updated_at ON seasonal_offers;
CREATE TRIGGER update_seasonal_offers_updated_at BEFORE UPDATE ON seasonal_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
