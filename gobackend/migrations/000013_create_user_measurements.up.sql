-- User measurements table
CREATE TABLE IF NOT EXISTS user_measurements (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      TEXT,
    value      NUMERIC(10,2) NOT NULL,
    unit       TEXT NOT NULL DEFAULT 'cm',
    notes      TEXT,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_is_active ON user_measurements(is_active);

SELECT create_updated_at_trigger('user_measurements');
