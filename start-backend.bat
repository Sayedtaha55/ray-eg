@echo off
cd /d c:\Users\Dream\ray-eg-1
set CSRF_DISABLED=true
set DATABASE_URL=postgresql://ray_user:ray_password@localhost:5433/ray_marketplace?schema=public
set BOOT_MODULES=all
set NODE_ENV=development
set ALLOW_DEV_MERCHANT_BOOTSTRAP=true
set ALLOW_DEV_COURIER_BOOTSTRAP=true
npx tsx watch backend/src/core/main.ts
