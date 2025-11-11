// Cypress E2E support file
import './commands';

// Disable uncaught exception handling for certain errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // Firebase auth popup errors
  if (err.message.includes('popup')) {
    return false;
  }
  // Network errors during tests
  if (err.message.includes('NetworkError')) {
    return false;
  }
  return true;
});

// Global before hook
beforeEach(() => {
  // Clear local storage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
});
