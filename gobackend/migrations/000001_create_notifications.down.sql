-- NOTE: notifications, merchant_push_subscriptions, customer_push_subscriptions
-- and notification_preferences already exist in shared environments (created
-- by the pre-existing Prisma schema before this migration ever ran there), so
-- this down migration intentionally does NOT drop them to avoid destroying
-- real data. Only the trigger objects (and the update_updated_at_column
-- helper function, only if nothing else still depends on it) added by the
-- matching up migration are removed here.
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_customer_push_subscriptions_updated_at ON customer_push_subscriptions;
DROP TRIGGER IF EXISTS update_merchant_push_subscriptions_updated_at ON merchant_push_subscriptions;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
