-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participants JSONB NOT NULL DEFAULT '[]'::jsonb,
    type VARCHAR(20) NOT NULL DEFAULT 'direct',
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTE: `messages` already exists in shared environments (pre-existing
-- Prisma table with a different, shop-wide schema). This migration intentionally
-- does NOT recreate it. Only `chats` (which is exclusively created here) is
-- added. If you want to migrate to the new chat-per-conversation schema, run a
-- separate migration to drop the old `messages` table after data migration.

-- Create indexes for chats
CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_chats_shop_id ON chats(shop_id);
CREATE INDEX IF NOT EXISTS idx_chats_order_id ON chats(order_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON chats(last_message_at DESC);

-- Create trigger for updated_at on chats
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
