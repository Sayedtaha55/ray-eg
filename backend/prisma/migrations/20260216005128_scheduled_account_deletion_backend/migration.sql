-- AlterTable
ALTER TABLE "users" ADD COLUMN "deactivated_at" DATETIME;
ALTER TABLE "users" ADD COLUMN "scheduled_purge_at" DATETIME;
