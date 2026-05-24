const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
    ...opts,
  });
  return res.status ?? 0;
}

function registerDistBackendAliases(distRootAbs) {
  const distRoot = distRootAbs || path.resolve(process.cwd(), 'dist-backend', 'src');
  const aliasPrefixToDir = {
    '@core/': path.join(distRoot, 'core') + path.sep,
    '@modules/': path.join(distRoot, 'modules') + path.sep,
    '@shared/': path.join(distRoot, 'shared') + path.sep,
    '@common/': path.join(distRoot, 'common') + path.sep,
  };

  // Already registered
  if (Module.__rayEgAliasPatched) return;

  const originalResolveFilename = Module._resolveFilename;
  // eslint-disable-next-line no-underscore-dangle
  Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
    if (typeof request === 'string') {
      for (const [prefix, targetDir] of Object.entries(aliasPrefixToDir)) {
        if (request.startsWith(prefix)) {
          const rest = request.slice(prefix.length);
          const mapped = path.join(targetDir, rest);
          return originalResolveFilename.call(this, mapped, parent, isMain, options);
        }
      }
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
  };

  Module.__rayEgAliasPatched = true;
}

function prismaBin() {
  return process.platform === 'win32' ? 'node_modules\\.bin\\prisma.cmd' : 'node_modules/.bin/prisma';
}

function tscBin() {
  return process.platform === 'win32' ? 'node_modules\\.bin\\tsc.cmd' : 'node_modules/.bin/tsc';
}

function resolveBackendTsconfigPath() {
  const candidates = [
    'backend/tsconfig.json',
    'tsconfig.json',
    '../backend/tsconfig.json',
    '../tsconfig.json',
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

function resolveEntrypointCandidates() {
  const bases = ['.', '..'];
  const rels = [
    'dist/main.js',
    'dist/src/main.js',
    'dist/core/main.js',
    'dist-backend/src/main.js',
    'dist-backend/src/core/main.js',
    'dist-backend/core/main.js',
  ];
  return bases.flatMap((base) => rels.map((rel) => path.join(base, rel).replace(/\\/g, '/')));
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

function extractFailedMigrationName(combinedOutput) {
  const output = String(combinedOutput || '');
  const match = output.match(/The `([^`]+)` migration started at/i);
  return match?.[1] || null;
}

function reconcileLegacyReservationUpdatedAtColumn() {
  return run('node', ['scripts/fix-railway-reservations-updated-at.js']);
}

function applyAiPlatformCoreRepairIfNeeded(combinedOutput) {
  const output = String(combinedOutput || '');
  if (!output.includes('P3009')) return 0;
  const failedMigration = extractFailedMigrationName(output);
  if (failedMigration !== '20260422151343_add_ai_platform_core') return 0;

  // This repair is safe + idempotent. It makes the original migration effectively apply on non-empty DBs.
  const prisma = prismaBin();
  const repairFile = 'prisma/migrations/20260423093000_ai_platform_core_repair/migration.sql';

  // eslint-disable-next-line no-console
  console.warn('[railway-backend-start] detected P3009; applying AI platform core repair SQL then resolving failed migration');

  const execStatus = run(prisma, ['db', 'execute', '--schema', 'prisma/schema.prisma', '--file', repairFile]);
  if (execStatus !== 0) return execStatus;

  const resolveStatus = run(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--applied', failedMigration]);
  if (resolveStatus !== 0) return resolveStatus;

  return 0;
}

function applyPortalEmailPasswordRepairIfNeeded(combinedOutput) {
  const output = String(combinedOutput || '');
  if (!output.includes('P3018') && !output.includes('P3009')) return 0;
  if (!output.includes('20260502160020_add_portal_email_password')) return 0;
  if (!output.includes('MapListingStatus') && !output.includes('already exists')) return 0;

  const prisma = prismaBin();
  const repairFile = 'prisma/migrations/20260524110000_portal_email_password_repair/migration.sql';
  const execStatus = run(prisma, ['db', 'execute', '--schema', 'prisma/schema.prisma', '--file', repairFile]);
  if (execStatus !== 0) return execStatus;

  return run(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--applied', '20260502160020_add_portal_email_password']);
}

function resolveKnownFailedMigration(combinedOutput) {
  const output = String(combinedOutput || '');
  if (!output.includes('P3009')) return 0;

  const failedMigration = extractFailedMigrationName(output);
  if (!failedMigration) return 0;

  // Mark the migration as rolled back to unblock deploy; this is idempotent and only targets
  // the migration Prisma itself reported as failed in _prisma_migrations.
  return resolveRolledBack(failedMigration);
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
        const portalRepairStatus = applyPortalEmailPasswordRepairIfNeeded(combined);
        if (repairStatus === 0 && portalRepairStatus === 0) {
          tryBaselineInit();
          deployStatus = deployMigrations();
        }
      }

      if (deployStatus !== 0) {
        // If Prisma still reports P3009, mark exactly the reported failed migration as rolled back.
        const res = deployMigrationsCapture();
        const combined = `${res.stdout}\n${res.stderr}`;
        resolveKnownFailedMigration(combined);
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

    const candidates = resolveEntrypointCandidates();

    let entry = candidates.find((file) => existsSync(file));
    if (!entry) {
      // Attempt to compile backend during runtime (some platforms don't run build step as expected).
      // eslint-disable-next-line no-console
      console.warn('[railway-backend-start] backend entrypoint not found; attempting backend build then retrying');

      const tsconfigPath = resolveBackendTsconfigPath();
      if (!tsconfigPath) {
        // eslint-disable-next-line no-console
        console.error('[railway-backend-start] could not find backend tsconfig; cwd:', process.cwd());
      } else {
        run(tscBin(), ['-p', tsconfigPath]);
      }
      entry = candidates.find((file) => existsSync(file));
    }
    if (!entry) {
      // eslint-disable-next-line no-console
      console.error('[railway-backend-start] backend entrypoint not found; cwd:', process.cwd());
      console.error('[railway-backend-start] checked:', candidates.join(', '));
      process.exit(1);
    }

    const absEntry = path.resolve(process.cwd(), entry);

    // Docker runner image copies /app/dist-backend/src -> /app/dist
    // so compiled root can be either /app/dist or /app/dist-backend/src.
    const distRootAbs = (() => {
      if (existsSync(path.resolve(process.cwd(), 'dist', 'core'))) return path.resolve(process.cwd(), 'dist');
      if (existsSync(path.resolve(process.cwd(), 'dist-backend', 'src', 'core'))) return path.resolve(process.cwd(), 'dist-backend', 'src');
      return null;
    })();
    if (distRootAbs) {
      registerDistBackendAliases(distRootAbs);
    }

    // Loading the compiled Nest entrypoint will bootstrap the server.
    // If it throws, we'll fall into the catch below.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(absEntry);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
})();
