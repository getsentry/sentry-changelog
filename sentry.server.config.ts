import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  traceLifecycle: 'stream',
  environment: process.env.NODE_ENV,
  // Enable the Sentry Logs product so `Sentry.logger.*` calls are sent.
  enableLogs: true,
  integrations: [Sentry.nodeRuntimeMetricsIntegration()],
  spotlight: process.env.NODE_ENV === 'development',
});
