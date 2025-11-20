/**
 * Service de logging sécurisé avec niveaux
 * Empêche l'exposition de données sensibles en production
 * @version 1.1.0
 * @date 2025-11-19
 */

import { monitoring } from "./monitoring";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private isTest: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isTest = process.env.NODE_ENV === "test";
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitize(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = ["password", "token", "apikey", "secret", "credential", "auth", "key"];

    Object.keys(sanitized).forEach((key) => {
      const lowerKey = key.toLowerCase();
      // Check if the key contains any sensitive keyword
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive.toLowerCase()))) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(this.sanitize(context))}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  /**
   * Info logs - only in development
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      console.info(this.formatMessage("info", message, context));
    }
  }

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, this.sanitize(context)));
  }

  /**
   * Error logs - always logged and sent to monitoring service in production
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorContext = {
      ...this.sanitize(context),
      error: errorMessage,
      stack: errorStack,
    };

    console.error(this.formatMessage("error", message, errorContext));

    // Send to monitoring service in production
    if (!this.isDevelopment && error instanceof Error) {
      monitoring.captureException(error, this.sanitize(context));
    }
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case "debug":
        this.debug(message, context);
        break;
      case "info":
        this.info(message, context);
        break;
      case "warn":
        this.warn(message, context);
        break;
      case "error":
        this.error(message, undefined, context);
        break;
    }
  }

  /**
   * Performance measurement
   */
  time(label: string): void {
    if (this.isDevelopment && !this.isTest) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment && !this.isTest) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
