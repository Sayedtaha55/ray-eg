-- Shop image maps
CREATE TABLE IF NOT EXISTS shop_image_maps (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT 'Main Map',
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT false,
    layout      JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_image_maps_shop_id ON shop_image_maps(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_image_maps_is_active ON shop_image_maps(is_active);

-- Shop image sections (areas within a map)
CREATE TABLE IF NOT EXISTS shop_image_sections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id      UUID NOT NULL REFERENCES shop_image_maps(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT 'منتجات',
    image_url   TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    width       INT,
    height      INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_image_sections_map_id ON shop_image_sections(map_id);

-- Shop image hotspots (clickable points on a map)
CREATE TABLE IF NOT EXISTS shop_image_hotspots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id      UUID NOT NULL REFERENCES shop_image_maps(id) ON DELETE CASCADE,
    section_id  UUID REFERENCES shop_image_sections(id) ON DELETE SET NULL,
    product_id  TEXT,
    label       TEXT,
    x           NUMERIC(6,2) NOT NULL DEFAULT 0,
    y           NUMERIC(6,2) NOT NULL DEFAULT 0,
    width       NUMERIC(6,2) NOT NULL DEFAULT 50,
    height      NUMERIC(6,2) NOT NULL DEFAULT 50,
    shape       TEXT NOT NULL DEFAULT 'rect',
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_image_hotspots_map_id ON shop_image_hotspots(map_id);

SELECT create_updated_at_trigger('shop_image_maps');
SELECT create_updated_at_trigger('shop_image_sections');
SELECT create_updated_at_trigger('shop_image_hotspots');
