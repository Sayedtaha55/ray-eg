-- AlterTable
ALTER TABLE "orders" ADD COLUMN "source" TEXT DEFAULT 'customer';

-- CreateTable
CREATE TABLE "product_furniture_meta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "unit" TEXT,
    "length_cm" REAL,
    "width_cm" REAL,
    "height_cm" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "product_furniture_meta_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "product_furniture_meta_product_id_key" ON "product_furniture_meta"("product_id");

-- CreateIndex
CREATE INDEX "product_furniture_meta_product_id_idx" ON "product_furniture_meta"("product_id");
