-- Cart events table
CREATE TABLE IF NOT EXISTS cart_events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id        UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id     TEXT NOT NULL,
    event          TEXT NOT NULL,
    user_id        UUID,
    session_id     TEXT,
    customer_name  TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    quantity       INT NOT NULL DEFAULT 1,
    unit_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency       TEXT NOT NULL DEFAULT 'EGP',
    metadata       JSONB,
    is_recovered   BOOLEAN NOT NULL DEFAULT false,
    recovered_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_events_shop_id ON cart_events(shop_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_event ON cart_events(event);
CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_created_at ON cart_events(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_events_is_recovered ON cart_events(is_recovered);

SELECT create_updated_at_trigger('cart_events');
