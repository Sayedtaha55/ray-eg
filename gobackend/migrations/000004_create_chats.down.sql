-- NOTE: `messages` already exists in shared environments (pre-existing
-- Prisma table with a different, shop-wide schema) so this down migration
-- intentionally does NOT drop it or its trigger. Only `chats`, which is
-- exclusively created by the matching up migration, is dropped here.
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
DROP TABLE IF EXISTS chats;
