export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const env = String(process.env.NODE_ENV || '').toLowerCase();
  const isProduction = env === 'production';
  const isStaging = env === 'staging';

  const required = isProduction || isStaging
    ? ['JWT_SECRET', 'DATABASE_URL', 'NODE_ENV']
    : ['DATABASE_URL'];

  for (const key of required) {
    const value = String(process.env[key] || '').trim();
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  if (isProduction) {
    const jwtSecret = String(process.env.JWT_SECRET || '').trim();
    if (jwtSecret && jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
    if (jwtSecret === 'dev-fallback-secret-change-in-production') {
      errors.push('JWT_SECRET must not be the default fallback in production');
    }

    const bootstrapToken = String(process.env.ADMIN_BOOTSTRAP_TOKEN || '').trim();
    if (bootstrapToken === 'change-this-to-secure-random-string-in-production') {
      warnings.push('ADMIN_BOOTSTRAP_TOKEN is still the default value — change it in production');
    }

    const devFlags = [
      'ALLOW_DEV_ADMIN_BOOTSTRAP',
      'ALLOW_DEV_MERCHANT_BOOTSTRAP',
      'ALLOW_DEV_COURIER_BOOTSTRAP',
    ];
    for (const flag of devFlags) {
      if (String(process.env[flag] || '').toLowerCase() === 'true') {
        warnings.push(`${flag} is enabled in production — dev bootstrap endpoints are active`);
      }
    }

    const corsOrigin = String(process.env.CORS_ORIGIN || '').trim();
    if (corsOrigin === '*') {
      warnings.push('CORS_ORIGIN is set to wildcard (*) in production — this is insecure');
    }

    const bodyLimit = String(process.env.BODY_LIMIT || '10mb').trim();
    if (bodyLimit.endsWith('mb') && parseInt(bodyLimit) > 10) {
      warnings.push(`BODY_LIMIT is ${bodyLimit} — consider reducing to 10mb or less to mitigate DoS`);
    }
  }

  const port = parseInt(String(process.env.PORT || '4000'), 10);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    warnings.push(`PORT value "${process.env.PORT}" is invalid, falling back to 4000`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function logEnvValidation() {
  const result = validateEnv();
  if (result.errors.length > 0) {
    console.error('[ENV] Configuration errors:');
    for (const err of result.errors) {
      console.error(`  ❌ ${err}`);
    }
  }
  if (result.warnings.length > 0) {
    console.warn('[ENV] Configuration warnings:');
    for (const w of result.warnings) {
      console.warn(`  ⚠️  ${w}`);
    }
  }
  if (!result.valid) {
    console.error('[ENV] Application cannot start due to configuration errors');
    process.exit(1);
  }
}
