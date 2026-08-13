-- Map listing owners (portal users)
CREATE TABLE IF NOT EXISTS map_listing_owners (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone        TEXT UNIQUE,
    email        TEXT UNIQUE,
    name         TEXT,
    password_hash TEXT,
    avatar_url   TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    last_login   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_map_listing_owners_phone ON map_listing_owners(phone);
CREATE INDEX IF NOT EXISTS idx_map_listing_owners_email ON map_listing_owners(email);

-- Portal OTP codes
CREATE TABLE IF NOT EXISTS portal_otp_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone      TEXT NOT NULL,
    code_hash  TEXT NOT NULL,
    purpose    TEXT NOT NULL DEFAULT 'login',
    verified   BOOLEAN NOT NULL DEFAULT false,
    attempts   INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_otp_codes_phone ON portal_otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_portal_otp_codes_expires_at ON portal_otp_codes(expires_at);

SELECT create_updated_at_trigger('map_listing_owners');
