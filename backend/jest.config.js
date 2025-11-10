/**
 * Configuration Jest pour les tests backend
 * @version 1.0.0
 * @date 10-11-2025
 */

module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "routes/**/*.js",
    "services/**/*.js",
    "middleware/**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  verbose: true,
};
