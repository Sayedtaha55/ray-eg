-- Add 2FA support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tfa_secret VARCHAR(255) DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_users_tfa_secret ON users(tfa_secret) WHERE tfa_secret != '';
