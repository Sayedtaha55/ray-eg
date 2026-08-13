DROP INDEX IF EXISTS idx_users_tfa_secret;
ALTER TABLE users DROP COLUMN IF EXISTS tfa_secret;
