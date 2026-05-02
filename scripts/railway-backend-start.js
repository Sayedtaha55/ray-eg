const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
    ...opts,
  });
  return res.status ?? 0;
}

function prismaBin() {
  return process.platform === 'win32' ? 'node_modules\\.bin\\prisma.cmd' : 'node_modules/.bin/prisma';
}

function runCapture(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: process.env,
    shell: false,
    ...opts,
  });
  return {
    status: res.status ?? 0,
    stdout: String(res.stdout || ''),
    stderr: String(res.stderr || ''),
  };
}

function generateClient() {
  const prisma = prismaBin();
  return run(prisma, ['generate', '--schema', 'prisma/schema.prisma']);
}

function tryBaselineInit() {
  const prisma = prismaBin();
  const initMigration = '20260124054347_init';
  const res = runCapture(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--applied', initMigration]);
  if (res.status === 0) return 0;
  const combined = `${res.stdout}\n${res.stderr}`;
  if (combined.includes('P3008') || combined.toLowerCase().includes('already recorded as applied')) {
    return 0;
  }
  process.stdout.write(res.stdout || '');
  process.stderr.write(res.stderr || '');
  return res.status;
}

function deployMigrations() {
  const prisma = prismaBin();
  return run(prisma, ['migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
}

function deployMigrationsCapture() {
  const prisma = prismaBin();
  return runCapture(prisma, ['migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
}

function dbPush() {
  const prisma = prismaBin();
  return run(prisma, ['db', 'push', '--schema', 'prisma/schema.prisma', '--skip-generate']);
}

function resolveRolledBack(migrationName) {
  const prisma = prismaBin();
  if (!migrationName) return 0;
  return run(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--rolled-back', migrationName]);
}

function reconcileLegacyReservationUpdatedAtColumn() {
  return run('node', ['scripts/fix-railway-reservations-updated-at.js']);
}

function applyAiPlatformCoreRepairIfNeeded(combinedOutput) {
  const output = String(combinedOutput || '');
  if (!output.includes('P3009')) return 0;

  // This repair is safe + idempotent. It makes the original migration effectively apply on non-empty DBs.
  const prisma = prismaBin();
  const repairFile = 'prisma/migrations/20260423093000_ai_platform_core_repair/migration.sql';

  // eslint-disable-next-line no-console
  console.warn('[railway-backend-start] detected P3009; applying AI platform core repair SQL then resolving failed migration');

  const execStatus = run(prisma, ['db', 'execute', '--schema', 'prisma/schema.prisma', '--file', repairFile]);
  if (execStatus !== 0) return execStatus;

  const failedMigration = '20260422151343_add_ai_platform_core';
  const resolveStatus = run(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--applied', failedMigration]);
  if (resolveStatus !== 0) return resolveStatus;

  return 0;
}

(function main() {
  try {
    const shouldGenerateOnStart = String(process.env.PRISMA_GENERATE_ON_START || '').toLowerCase().trim() === 'true';
    if (shouldGenerateOnStart) {
      const genStatus = generateClient();
      if (genStatus !== 0) {
        // On some platforms, node_modules can be mounted read-only at runtime.
        // In that case, Prisma client must be generated during build/install step (postinstall).
        const env = String(process.env.NODE_ENV || '').toLowerCase();
        if (env === 'production') {
          // best-effort: continue so server can boot if client already exists
          // eslint-disable-next-line no-console
          console.warn('[railway-backend-start] prisma generate failed; continuing (ensure postinstall runs prisma generate)');
        } else {
          process.exit(genStatus);
        }
      }
    }

    const reconcileStatus = reconcileLegacyReservationUpdatedAtColumn();
    if (reconcileStatus !== 0) {
      process.exit(reconcileStatus);
    }

    tryBaselineInit();

    let deployStatus = deployMigrations();
    if (deployStatus !== 0) {
      // If a migration is marked failed in the database, Prisma will refuse to apply new ones (P3009).
      // Attempt automated repair for the known failing migration, then retry.
      const res = deployMigrationsCapture();
      const combined = `${res.stdout}\n${res.stderr}`;
      if (res.status !== 0) {
        const repairStatus = applyAiPlatformCoreRepairIfNeeded(combined);
        if (repairStatus === 0) {
          tryBaselineInit();
          deployStatus = deployMigrations();
        }
      }

      if (deployStatus !== 0) {
        // In our case, another historical migration can fail if it attempted to create an enum that already exists.
        // Mark it as rolled back then retry deploy.
        resolveRolledBack('20260208184005_shop_image_maps');
        tryBaselineInit();
        deployStatus = deployMigrations();
      }
    }

    if (deployStatus !== 0) {
      process.exit(deployStatus);
    }

    const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID);
    const shouldDbPushOnStart = String(process.env.PRISMA_DB_PUSH_ON_START || '').toLowerCase().trim() === 'true' || isRailway;
    if (shouldDbPushOnStart) {
      const pushStatus = dbPush();
      if (pushStatus !== 0) {
        const env = String(process.env.NODE_ENV || '').toLowerCase();
        if (env === 'production') {
          // eslint-disable-next-line no-console
          console.warn('[railway-backend-start] prisma db push failed; continuing');
        } else {
          process.exit(pushStatus);
        }
      }
    }

    const candidates = ['dist/main.js', 'dist/core/main.js', 'dist/src/main.js', 'dist-backend/src/main.js', 'dist-backend/src/core/main.js'];
    const entry = candidates.find((file) => existsSync(file));
    if (!entry) {
      // eslint-disable-next-line no-console
      console.error('[railway-backend-start] backend entrypoint not found; checked:', candidates.join(', '));
      process.exit(1);
    }

    const serverStatus = run('node', [entry]);
    process.exit(serverStatus);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
})();
