-- Apps table
CREATE TABLE IF NOT EXISTS apps (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    version     TEXT NOT NULL DEFAULT '1.0.0',
    permissions JSONB NOT NULL DEFAULT '[]',
    hooks       JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shop apps (installed apps per shop)
CREATE TABLE IF NOT EXISTS shop_apps (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    app_id      UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'INSTALLED',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    settings    JSONB,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(shop_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_apps_shop_id ON shop_apps(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_apps_app_id ON shop_apps(app_id);

SELECT create_updated_at_trigger('apps');
SELECT create_updated_at_trigger('shop_apps');

-- Seed default apps
INSERT INTO apps (key, name, description, version, permissions, hooks) VALUES
    ('image-editor', 'محرر الصور', 'محرر صور احترافي لتعديل صور المنتجات والشعارات مع فلاتر وتأثيرات متقدمة.', '1.0.0', '["products","shop"]', '[]'),
    ('voice-ordering', 'Voice Ordering', 'Enable voice-based ordering and AI assistant flows.', '1.0.0', '["orders","products"]', '["onOrderCreate"]'),
    ('whatsapp-button', 'WhatsApp Button', 'Show a WhatsApp contact button on your storefront.', '1.0.0', '["shop"]', '[]')
ON CONFLICT (key) DO NOTHING;
