/**
 * E2E Tests for Authentication Flow
 * @version 1.0.0
 */

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/');

      // Navigate to signup page
      cy.contains('S\'inscrire').click();

      // Fill in registration form
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Should show email verification message
      cy.contains(/verifi/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show validation errors for invalid data', () => {
      cy.visit('/');
      cy.contains('S\'inscrire').click();

      // Try to submit with weak password
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');
      cy.get('button[type="submit"]').click();

      // Should show error
      cy.contains(/8 caractères/i).should('be.visible');
    });

    it('should show error for mismatched passwords', () => {
      cy.visit('/');
      cy.contains('S\'inscrire').click();

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
      cy.get('button[type="submit"]').click();

      cy.contains(/ne correspondent pas/i).should('be.visible');
    });

    it('should show error for existing email', () => {
      cy.visit('/');
      cy.contains('S\'inscrire').click();

      // Use a known existing email
      cy.get('input[name="email"]').type('existing@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.contains(/existe déjà/i, { timeout: 10000 }).should('be.visible');
    });

    it('should allow switching to login page', () => {
      cy.visit('/');
      cy.contains('S\'inscrire').click();
      cy.url().should('include', 'signup');

      cy.contains('Se connecter').click();
      cy.url().should('include', 'login');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user via API
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
        email: `testuser${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    it('should login with valid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard
      cy.url({ timeout: 10000 }).should('include', 'dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('WrongPassword123!');
      cy.get('button[type="submit"]').click();

      cy.contains(/incorrect/i).should('be.visible');
    });

    it('should show error for unverified email', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('unverified@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.contains(/vérifi/i).should('be.visible');
    });

    it('should toggle password visibility', () => {
      cy.visit('/login');

      cy.get('input[name="password"]').should('have.attr', 'type', 'password');

      // Click visibility toggle
      cy.get('button[aria-label*="toggle password"]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');

      cy.get('button[aria-label*="toggle password"]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('should navigate to forgot password page', () => {
      cy.visit('/login');

      cy.contains('Mot de passe oublié').click();
      cy.url().should('include', 'forgot-password');
    });

    it('should navigate to signup page', () => {
      cy.visit('/login');

      cy.contains('S\'inscrire').click();
      cy.url().should('include', 'signup');
    });

    it('should persist session after refresh', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 10000 }).should('include', 'dashboard');

      // Refresh page
      cy.reload();

      // Should still be logged in
      cy.url().should('include', 'dashboard');
    });
  });

  describe('Password Reset', () => {
    it('should request password reset successfully', () => {
      cy.visit('/forgot-password');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();

      cy.contains(/email envoyé/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show error for invalid email format', () => {
      cy.visit('/forgot-password');

      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();

      cy.contains(/invalide/i).should('be.visible');
    });

    it('should handle password reset with valid token', () => {
      // This would require a valid token from the backend
      // In a real scenario, you'd get this from email or test database
      const resetToken = 'valid-test-token';

      cy.visit(`/reset-password?token=${resetToken}`);

      cy.get('input[name="password"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');
      cy.get('button[type="submit"]').click();

      cy.contains(/réinitialisé/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login first
      cy.loginViaAPI('test@example.com', 'Password123!');
      cy.visit('/dashboard');
    });

    it('should logout successfully', () => {
      cy.contains('Déconnexion').click();

      // Should redirect to login page
      cy.url().should('include', 'login');

      // Local storage should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });

    it('should redirect to login when accessing protected route after logout', () => {
      cy.contains('Déconnexion').click();

      // Try to access dashboard
      cy.visit('/dashboard');

      // Should redirect to login
      cy.url().should('include', 'login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/dashboard');
      cy.url().should('include', 'login');

      cy.visit('/exercises');
      cy.url().should('include', 'login');

      cy.visit('/profile');
      cy.url().should('include', 'login');
    });

    it('should allow access to protected routes when authenticated', () => {
      cy.loginViaAPI('test@example.com', 'Password123!');

      cy.visit('/dashboard');
      cy.url().should('include', 'dashboard');

      cy.visit('/exercises');
      cy.url().should('include', 'exercises');
    });
  });

  describe('Google Sign-In', () => {
    it('should display Google sign-in button', () => {
      cy.visit('/login');
      cy.contains(/Google/i).should('be.visible');
    });

    // Note: Testing actual Google OAuth flow requires more complex setup
    // This is a placeholder for where those tests would go
  });

  describe('Accessibility', () => {
    it('should have accessible form labels on login page', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').should('have.attr', 'aria-label');
      cy.get('input[name="password"]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/login');

      // Tab through form elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'name', 'email');

      cy.get('body').tab();
      cy.focused().should('have.attr', 'name', 'password');

      cy.get('body').tab();
      cy.focused().should('have.attr', 'type', 'submit');
    });

    it('should have proper heading hierarchy', () => {
      cy.visit('/login');

      cy.get('h1, h2, h3, h4').should('exist');
    });
  });
});
