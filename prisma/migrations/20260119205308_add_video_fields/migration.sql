-- AlterTable
ALTER TABLE "shops" ADD COLUMN "display_address" TEXT;
ALTER TABLE "shops" ADD COLUMN "latitude" REAL;
ALTER TABLE "shops" ADD COLUMN "location_accuracy" REAL;
ALTER TABLE "shops" ADD COLUMN "location_source" TEXT;
ALTER TABLE "shops" ADD COLUMN "location_updated_at" DATETIME;
ALTER TABLE "shops" ADD COLUMN "longitude" REAL;
ALTER TABLE "shops" ADD COLUMN "map_label" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shop_gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL DEFAULT 'IMAGE',
    "thumb_url" TEXT,
    "medium_url" TEXT,
    "caption" TEXT,
    "duration" INTEGER,
    "file_size" BIGINT,
    "is_hero" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shop_gallery_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_shop_gallery" ("caption", "created_at", "id", "image_url", "isActive", "shop_id") SELECT "caption", "created_at", "id", "image_url", "isActive", "shop_id" FROM "shop_gallery";
DROP TABLE "shop_gallery";
ALTER TABLE "new_shop_gallery" RENAME TO "shop_gallery";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
