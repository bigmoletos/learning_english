/**
 * Service de monitoring et reporting d'erreurs
 * Prêt pour l'intégration avec Sentry, LogRocket, etc.
 * @version 1.0.0
 * @date 2025-11-19
 */

interface MonitoringConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
  sampleRate: number;
}

interface ErrorContext {
  [key: string]: any;
}

class MonitoringService {
  private config: MonitoringConfig;
  private initialized = false;

  constructor() {
    this.config = {
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      enabled: process.env.NODE_ENV === "production",
      sampleRate: 1.0,
    };
  }

  /**
   * Initialize monitoring service (Sentry)
   * Call this in your app's entry point (index.tsx)
   */
  init(): void {
    if (!this.config.enabled || this.initialized) {
      return;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // import { BrowserTracing } from "@sentry/tracing";
    //
    // Sentry.init({
    //   dsn: this.config.dsn,
    //   environment: this.config.environment,
    //   integrations: [new BrowserTracing()],
    //   tracesSampleRate: this.config.sampleRate,
    //   // Performance Monitoring
    //   tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    //   // Session Replay
    //   replaysSessionSampleRate: 0.1,
    //   replaysOnErrorSampleRate: 1.0,
    //   beforeSend(event) {
    //     // Filter out sensitive data
    //     if (event.request) {
    //       delete event.request.cookies;
    //     }
    //     return event;
    //   },
    // });

    this.initialized = true;
    console.log("[Monitoring] Service initialized in", this.config.environment);
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.config.enabled) {
      return;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // Sentry.captureException(error, {
    //   extra: context,
    // });

    // Fallback: log to console in development
    if (this.config.environment === "development") {
      console.error("[Monitoring] Exception captured:", error, context);
    }
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
    if (!this.config.enabled) {
      return;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // Sentry.captureMessage(message, level);

    // Fallback: log to console in development
    if (this.config.environment === "development") {
      console.log(`[Monitoring] Message captured (${level}):`, message);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.config.enabled) {
      return;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // Sentry.setUser({
    //   id: user.id,
    //   email: user.email,
    //   username: user.username,
    // });
  }

  /**
   * Clear user context (on logout)
   */
  clearUser(): void {
    if (!this.config.enabled) {
      return;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: any): void {
    if (!this.config.enabled) {
      return;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // Sentry.addBreadcrumb({
    //   message,
    //   category,
    //   data,
    //   level: 'info',
    // });
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string): any {
    if (!this.config.enabled) {
      return null;
    }

    // TODO: Uncomment when Sentry is installed
    // import * as Sentry from "@sentry/react";
    // return Sentry.startTransaction({
    //   name,
    //   op,
    // });

    return null;
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

/**
 * Installation instructions:
 *
 * 1. Install Sentry:
 *    npm install --save @sentry/react @sentry/tracing
 *
 * 2. Add to .env:
 *    REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id
 *
 * 3. Initialize in src/index.tsx:
 *    import { monitoring } from './services/monitoring';
 *    monitoring.init();
 *
 * 4. Uncomment the Sentry code in this file
 *
 * 5. Update logger.ts to use monitoring:
 *    import { monitoring } from './monitoring';
 *    // In error() method:
 *    if (!this.isDevelopment) {
 *      monitoring.captureException(error instanceof Error ? error : new Error(errorMessage), context);
 *    }
 */
