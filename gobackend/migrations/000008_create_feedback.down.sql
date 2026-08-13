-- NOTE: feedback already exists in shared environments (pre-existing Prisma
-- table). This down migration intentionally does NOT drop it.
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
