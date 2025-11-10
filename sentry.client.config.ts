import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  // Performance Monitoring
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/your-domain\.com/,
      ],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance sampling
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Release tracking
  release: process.env.REACT_APP_VERSION || '1.0.0',

  // Error filtering
  beforeSend(event, hint) {
    // Filter out errors from development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Filter out specific errors
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message);

      // Ignore ResizeObserver errors (browser noise)
      if (message.includes('ResizeObserver')) {
        return null;
      }

      // Ignore network errors (they're expected)
      if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
        return null;
      }
    }

    return event;
  },

  // Breadcrumbs
  maxBreadcrumbs: 50,

  // User context (privacy-aware)
  initialScope: {
    tags: {
      'app.version': process.env.REACT_APP_VERSION,
    },
  },

  // Ignore specific URLs
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',

    // Facebook
    'fb_xd_fragment',

    // Random plugins/extensions
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',

    // ResizeObserver
    'ResizeObserver loop limit exceeded',
  ],

  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});

export default Sentry;
