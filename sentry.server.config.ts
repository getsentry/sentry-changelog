import * as Sentry from '@sentry/nextjs';
import {PrismaInstrumentation} from '@prisma/instrumentation';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  traceLifecycle: 'stream',
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.nodeRuntimeMetricsIntegration(),
    Sentry.prismaIntegration({
      prismaInstrumentation: new PrismaInstrumentation(),
    }),
  ],
  spotlight: process.env.NODE_ENV === 'development',
});
