/**
 * Tests unitaires pour le service de logging sécurisé
 * @version 1.0.0
 * @date 2025-11-19
 */

import { logger } from "../logger";

// Mock console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

describe("Logger Service", () => {
  beforeEach(() => {
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe("Sanitization", () => {
    it("should redact sensitive data in context", () => {
      const sensitiveContext = {
        username: "testuser",
        password: "secret123",
        apiKey: "key-123",
        token: "token-456",
      };

      logger.warn("Test message", sensitiveContext);

      expect(console.warn).toHaveBeenCalled();
      const loggedMessage = (console.warn as jest.Mock).mock.calls[0][0];

      // Should contain username but not the sensitive values
      expect(loggedMessage).toContain("testuser");
      expect(loggedMessage).toContain("[REDACTED]");
      expect(loggedMessage).not.toContain("secret123");
      expect(loggedMessage).not.toContain("key-123");
      expect(loggedMessage).not.toContain("token-456");
    });

    it("should handle undefined context gracefully", () => {
      expect(() => {
        logger.warn("Test message");
      }).not.toThrow();
    });
  });

  describe("Log Levels", () => {
    it("should format messages with timestamp and level", () => {
      logger.warn("Test warning");

      expect(console.warn).toHaveBeenCalled();
      const loggedMessage = (console.warn as jest.Mock).mock.calls[0][0];

      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(loggedMessage).toContain("[WARN]");
      expect(loggedMessage).toContain("Test warning");
    });

    it("should always log warnings", () => {
      logger.warn("Warning message");
      expect(console.warn).toHaveBeenCalled();
    });

    it("should always log errors", () => {
      const testError = new Error("Test error");
      logger.error("Error message", testError);

      expect(console.error).toHaveBeenCalled();
      const loggedMessage = (console.error as jest.Mock).mock.calls[0][0];

      expect(loggedMessage).toContain("[ERROR]");
      expect(loggedMessage).toContain("Error message");
    });
  });

  describe("Error Handling", () => {
    it("should handle Error objects", () => {
      const testError = new Error("Test error message");
      logger.error("Something went wrong", testError);

      expect(console.error).toHaveBeenCalled();
      const loggedMessage = (console.error as jest.Mock).mock.calls[0][0];

      expect(loggedMessage).toContain("Test error message");
    });

    it("should handle non-Error objects", () => {
      logger.error("Something went wrong", "Simple string error");

      expect(console.error).toHaveBeenCalled();
      const loggedMessage = (console.error as jest.Mock).mock.calls[0][0];

      expect(loggedMessage).toContain("Simple string error");
    });

    it("should include error context", () => {
      const testError = new Error("Test error");
      const context = { userId: "123", action: "login" };

      logger.error("Login failed", testError, context);

      expect(console.error).toHaveBeenCalled();
      const loggedMessage = (console.error as jest.Mock).mock.calls[0][0];

      expect(loggedMessage).toContain("userId");
      expect(loggedMessage).toContain("123");
      expect(loggedMessage).toContain("action");
      expect(loggedMessage).toContain("login");
    });
  });

  describe("Performance Monitoring", () => {
    it("should measure time correctly", () => {
      const label = "test-operation";

      logger.time(label);
      logger.timeEnd(label);

      // In test environment, these should not throw
      expect(() => {
        logger.time("another-test");
        logger.timeEnd("another-test");
      }).not.toThrow();
    });
  });

  describe("Custom Log Levels", () => {
    it("should support custom log levels", () => {
      logger.log("warn", "Custom warning message");
      expect(console.warn).toHaveBeenCalled();

      logger.log("error", "Custom error message");
      expect(console.error).toHaveBeenCalled();
    });
  });
});
