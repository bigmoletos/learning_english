const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  integrations: [
    // Express integration
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: true }),
    // Profiling
    new ProfilingIntegration(),
  ],

  // Performance sampling
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Profiling sampling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Release tracking
  release: process.env.APP_VERSION || '1.0.0',

  // Server name
  serverName: process.env.SERVER_NAME || 'backend',

  // Error filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(hint.originalException || hint.syntheticException);
      return null;
    }

    return event;
  },

  // Breadcrumbs
  maxBreadcrumbs: 50,

  // Ignore specific errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ],
});

// Express middleware
const requestHandler = Sentry.Handlers.requestHandler();
const tracingHandler = Sentry.Handlers.tracingHandler();
const errorHandler = Sentry.Handlers.errorHandler();

module.exports = {
  Sentry,
  requestHandler,
  tracingHandler,
  errorHandler,
};
