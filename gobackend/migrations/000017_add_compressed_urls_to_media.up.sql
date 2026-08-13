-- Add compressed_urls column to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS compressed_urls JSONB DEFAULT '{}';
