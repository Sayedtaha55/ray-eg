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

function tryBaselineInit() {
  const prisma = prismaBin();
  const initMigration = '20260124054347_init';
  const status = run(prisma, ['migrate', 'resolve', '--schema', 'prisma/schema.prisma', '--applied', initMigration]);
  return status;
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
