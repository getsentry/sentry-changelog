import * as Sentry from '@sentry/nextjs';

import {dataCollection} from './sentry.data-collection';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  environment: process.env.NODE_ENV,
  dataCollection,
  spotlight: process.env.NODE_ENV === 'development',
});
