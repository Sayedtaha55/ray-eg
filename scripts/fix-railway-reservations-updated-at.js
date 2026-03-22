const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'reservations'
        AND column_name IN ('updatedAt', 'updated_at')
      ORDER BY column_name
    `);

    const columns = new Set(rows.map((row) => String(row.column_name)));
    const hasLegacyColumn = columns.has('updatedAt');
    const hasMappedColumn = columns.has('updated_at');

    if (!hasLegacyColumn && !hasMappedColumn) {
      console.log('[fix-reservations-updated-at] reservations table has no updatedAt/updated_at column to reconcile');
      return;
    }

    if (hasLegacyColumn && !hasMappedColumn) {
      await prisma.$executeRawUnsafe('ALTER TABLE "reservations" RENAME COLUMN "updatedAt" TO "updated_at"');
      console.log('[fix-reservations-updated-at] renamed reservations.updatedAt -> reservations.updated_at');
      return;
    }

    if (hasLegacyColumn && hasMappedColumn) {
      await prisma.$executeRawUnsafe('UPDATE "reservations" SET "updated_at" = COALESCE("updated_at", "updatedAt") WHERE "updated_at" IS NULL');
      console.log('[fix-reservations-updated-at] backfilled reservations.updated_at from reservations.updatedAt');
      return;
    }

    console.log('[fix-reservations-updated-at] reservations.updated_at already matches Prisma schema');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[fix-reservations-updated-at] failed');
  console.error(error);
  process.exit(1);
});
