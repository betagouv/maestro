import * as Sentry from '@sentry/node';
import config from './utils/config.ts';

if (config.sentry.enabled && !config.sentry.dsn) {
  throw new Error('Sentry must be initialized with a valid DSN');
}

if (config.sentry.enabled && config.sentry.dsn) {
  const logLevel = ['error'];

  // eslint-disable-next-line no-undef
  console.info(
    `Initializing Sentry for log level "${logLevel}" and config: ${config.sentry.dsn}`
  );

  Sentry.init({
    dsn: config.sentry.dsn,
    environment:
      config.environment === 'production' ? 'production' : 'development',
    tracesSampleRate: 1.0
  });
}
