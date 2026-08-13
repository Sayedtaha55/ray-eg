-- Add builder_config JSONB column to shops for the unified builder.
-- The Prisma schema already declares this column; this migration ensures the
-- raw SQL schema (used by the Go backend) has it too.

ALTER TABLE shops ADD COLUMN IF NOT EXISTS builder_config JSONB;
