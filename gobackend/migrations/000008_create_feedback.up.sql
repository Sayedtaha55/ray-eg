-- Create feedback table
-- NOTE: A `feedback` table already exists in shared environments (created by
-- the pre-existing Prisma schema with a different schema). This migration
-- intentionally uses `CREATE TABLE IF NOT EXISTS` and only adds columns/indexes
-- that are missing, to avoid destroying real data. The trigger is also
-- guarded with IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist (idempotent for shared DB)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='type') THEN
        ALTER TABLE feedback ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'REVIEW';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='title') THEN
        ALTER TABLE feedback ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='updated_at') THEN
        ALTER TABLE feedback ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='user_name') THEN
        ALTER TABLE feedback ADD COLUMN user_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='user_email') THEN
        ALTER TABLE feedback ADD COLUMN user_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='order_id') THEN
        ALTER TABLE feedback ADD COLUMN order_id TEXT REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='product_id') THEN
        ALTER TABLE feedback ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for feedback (idempotent with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_shop_id ON feedback(shop_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Create indexes for optional columns (only if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='order_id') THEN
        CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON feedback(order_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback' AND column_name='product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_feedback_product_id ON feedback(product_id);
    END IF;
END $$;

-- Create trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
