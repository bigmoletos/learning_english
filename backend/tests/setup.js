// Backend test setup
const dotenv = require("dotenv");
const path = require("path");
const { TextEncoder, TextDecoder } = require("util");

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Load test environment variables
dotenv.config({ path: path.join(__dirname, "../../.env.test") });

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-testing-purposes-only-minimum-32-chars";
process.env.DATABASE_PATH = ":memory:"; // Use in-memory SQLite for tests

// Global test utilities
global.testHelpers = {
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate test JWT token
  generateTestToken: () => {
    const jwt = require("jsonwebtoken");
    return jwt.sign(
      { userId: "test-user-123", email: "test@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  },
};

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
