const { spawnSync } = require('node:child_process');

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

function resolveRolledBack(migrationName) {
  const prisma = prismaBin();
  if (!migrationName) return 0;
  return run(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--rolled-back', migrationName]);
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

    tryBaselineInit();

    let deployStatus = deployMigrations();
    if (deployStatus !== 0) {
      // If a migration is marked failed in the database, Prisma will refuse to apply new ones (P3009).
      // In our case, the migration can fail if it attempted to create an enum that already exists.
      // Mark it as rolled back then retry deploy.
      resolveRolledBack('20260208184005_shop_image_maps');
      tryBaselineInit();
      deployStatus = deployMigrations();
    }

    if (deployStatus !== 0) {
      process.exit(deployStatus);
    }

    const serverStatus = run('node', ['dist/main.js']);
    process.exit(serverStatus);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
})();
