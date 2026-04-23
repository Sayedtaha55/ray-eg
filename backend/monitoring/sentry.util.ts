type SentryModule = typeof import('@sentry/node');

let sentry: SentryModule | null = null;
let initialized = false;

async function getSentry(): Promise<SentryModule> {
  if (sentry) return sentry;
  sentry = await import('@sentry/node');
  return sentry;
}

function enabled() {
  const dsn = String(process.env.SENTRY_DSN || '').trim();
  return Boolean(dsn);
}

export async function initSentry() {
  if (initialized) return { enabled: enabled() };
  initialized = true;

  if (!enabled()) return { enabled: false };

  const Sentry = await getSentry();

  const environment = String(process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development').trim();
  const release = String(process.env.SENTRY_RELEASE || '').trim() || undefined;

  const tracesSampleRateRaw = String(process.env.SENTRY_TRACES_SAMPLE_RATE || '').trim();
  const tracesSampleRate = tracesSampleRateRaw ? Number(tracesSampleRateRaw) : undefined;

  Sentry.init({
    dsn: String(process.env.SENTRY_DSN || '').trim(),
    environment,
    release,
    tracesSampleRate: typeof tracesSampleRate === 'number' && Number.isFinite(tracesSampleRate) ? tracesSampleRate : undefined,
  });

  return { enabled: true };
}

export async function captureException(err: any, context?: Record<string, any>) {
  if (!enabled()) return;

  try {
    const Sentry = await getSentry();
    Sentry.withScope((scope) => {
      if (context && typeof context === 'object') {
        scope.setContext('extra', context);
      }
      Sentry.captureException(err);
    });
  } catch {
    // never throw
  }
}
