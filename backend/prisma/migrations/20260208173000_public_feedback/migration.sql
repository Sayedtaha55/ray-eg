PRAGMA foreign_keys=OFF;

-- Rebuild feedback table to:
-- 1) make userId nullable
-- 2) add userName/userEmail columns

ALTER TABLE "feedback" RENAME TO "feedback_old";

CREATE TABLE "feedback" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "userId" TEXT,
  "userName" TEXT,
  "userEmail" TEXT,
  "shopId" TEXT,
  "productId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "feedback_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "feedback_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "feedback" ("id", "rating", "comment", "userId", "shopId", "productId", "status", "createdAt")
SELECT "id", "rating", "comment", "userId", "shopId", "productId", "status", "createdAt"
FROM "feedback_old";

DROP TABLE "feedback_old";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
