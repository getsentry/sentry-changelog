import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true,
  traceLifecycle: 'stream',
  environment: process.env.NODE_ENV,
  integrations: [Sentry.nodeRuntimeMetricsIntegration()],
  spotlight: process.env.NODE_ENV === 'development',
});
