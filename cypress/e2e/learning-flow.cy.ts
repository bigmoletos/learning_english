/**
 * E2E Tests for Learning and Exercise Flow
 * @version 1.0.0
 */

describe('Learning and Exercise Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginViaAPI('test@example.com', 'Password123!');
  });

  describe('Dashboard', () => {
    it('should display user dashboard with stats', () => {
      cy.visit('/dashboard');

      cy.contains(/dashboard/i).should('be.visible');
      cy.contains(/progress/i).should('be.visible');
    });

    it('should show user profile information', () => {
      cy.visit('/dashboard');

      cy.contains('Test User').should('be.visible');
      cy.contains('test@example.com').should('be.visible');
    });

    it('should display learning progress', () => {
      cy.visit('/dashboard');

      // Should show progress metrics
      cy.contains(/tests completed/i).should('exist');
      cy.contains(/average score/i).should('exist');
      cy.contains(/time spent/i).should('exist');
    });

    it('should navigate to exercises from dashboard', () => {
      cy.visit('/dashboard');

      cy.contains(/exercises/i).click();
      cy.url().should('include', 'exercises');
    });
  });

  describe('Exercise Selection', () => {
    beforeEach(() => {
      cy.visit('/exercises');
    });

    it('should display available exercise categories', () => {
      cy.contains(/reading/i).should('be.visible');
      cy.contains(/listening/i).should('be.visible');
      cy.contains(/grammar/i).should('be.visible');
    });

    it('should filter exercises by level', () => {
      // Select B1 level
      cy.contains('B1').click();

      // Should show only B1 exercises
      cy.contains('B1').should('be.visible');
    });

    it('should start an exercise', () => {
      cy.getByTestId('exercise-card').first().click();

      // Should navigate to exercise page
      cy.url().should('include', 'exercise');
    });

    it('should show exercise description and difficulty', () => {
      cy.getByTestId('exercise-card').first().within(() => {
        cy.contains(/difficulty/i).should('exist');
        cy.contains(/description/i).should('exist');
      });
    });
  });

  describe('Completing Exercises', () => {
    beforeEach(() => {
      cy.visit('/exercises/qcm-1'); // Specific exercise
    });

    it('should display exercise questions', () => {
      cy.contains(/question/i).should('be.visible');
      cy.get('input[type="radio"]').should('exist');
    });

    it('should allow selecting answers', () => {
      cy.get('input[type="radio"]').first().check();
      cy.get('input[type="radio"]').first().should('be.checked');
    });

    it('should submit answers and show results', () => {
      // Answer all questions
      cy.get('input[type="radio"]').first().check();
      cy.contains('Next').click();

      cy.get('input[type="radio"]').first().check();
      cy.contains('Next').click();

      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      // Should show results
      cy.contains(/score/i, { timeout: 10000 }).should('be.visible');
      cy.contains(/correct/i).should('be.visible');
    });

    it('should save progress to Firebase', () => {
      // Complete exercise
      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      // Visit dashboard to verify progress was saved
      cy.visit('/dashboard');
      cy.contains(/tests completed/i).parent().should('contain', '1');
    });

    it('should show explanation for answers', () => {
      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      // Should show explanations
      cy.contains(/explanation/i).should('be.visible');
    });

    it('should allow retrying exercise', () => {
      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      cy.contains(/retry/i).click();

      // Should reset exercise
      cy.get('input[type="radio"]:checked').should('not.exist');
    });
  });

  describe('Level Assessment', () => {
    it('should start level assessment test', () => {
      cy.visit('/assessment');

      cy.contains(/start assessment/i).click();

      cy.url().should('include', 'assessment');
      cy.contains(/question/i).should('be.visible');
    });

    it('should complete assessment and get level recommendation', () => {
      cy.visit('/assessment');
      cy.contains(/start assessment/i).click();

      // Answer multiple questions
      for (let i = 0; i < 10; i++) {
        cy.get('input[type="radio"]').first().check();
        cy.contains('Next').click();
      }

      cy.contains('Finish').click();

      // Should show recommended level
      cy.contains(/recommended level/i, { timeout: 10000 }).should('be.visible');
      cy.contains(/A1|A2|B1|B2|C1|C2/).should('be.visible');
    });

    it('should save assessed level to user profile', () => {
      cy.visit('/assessment');
      cy.contains(/start assessment/i).click();

      // Complete assessment
      for (let i = 0; i < 10; i++) {
        cy.get('input[type="radio"]').first().check();
        cy.contains('Next').click();
      }

      cy.contains('Finish').click();

      // Visit dashboard
      cy.visit('/dashboard');

      // Should show assessed level
      cy.contains(/current level/i).should('be.visible');
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(() => {
      cy.visit('/progress');
    });

    it('should display progress statistics', () => {
      cy.contains(/statistics/i).should('be.visible');
      cy.contains(/total exercises/i).should('be.visible');
      cy.contains(/average score/i).should('be.visible');
    });

    it('should show progress chart', () => {
      cy.get('canvas').should('exist'); // Chart element
    });

    it('should display recent test results', () => {
      cy.contains(/recent tests/i).should('be.visible');
      cy.getByTestId('test-result').should('exist');
    });

    it('should filter results by date range', () => {
      cy.contains(/filter/i).click();
      cy.contains(/last week/i).click();

      // Should update results
      cy.getByTestId('test-result').should('exist');
    });

    it('should show streak information', () => {
      cy.contains(/streak/i).should('be.visible');
      cy.contains(/day/i).should('be.visible');
    });
  });

  describe('Voice Features', () => {
    it('should allow voice recording for speaking exercises', () => {
      cy.visit('/exercises/speaking-1');

      cy.getByTestId('record-button').click();

      // Should start recording
      cy.getByTestId('recording-indicator').should('be.visible');

      // Stop recording
      cy.getByTestId('stop-button').click();

      // Should show playback controls
      cy.getByTestId('play-button').should('be.visible');
    });

    it('should provide feedback on pronunciation', () => {
      cy.visit('/exercises/speaking-1');

      cy.getByTestId('record-button').click();
      cy.wait(2000); // Record for 2 seconds
      cy.getByTestId('stop-button').click();

      cy.contains('Submit').click();

      // Should show pronunciation feedback
      cy.contains(/pronunciation/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Adaptive Learning', () => {
    it('should recommend exercises based on performance', () => {
      cy.visit('/dashboard');

      cy.contains(/recommended/i).should('be.visible');
      cy.getByTestId('recommended-exercise').should('exist');
    });

    it('should adjust difficulty based on performance', () => {
      // Complete an easy exercise
      cy.visit('/exercises/easy-1');
      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      // Next recommendation should be harder
      cy.visit('/dashboard');
      cy.getByTestId('recommended-exercise')
        .should('contain', 'B1')
        .or('contain', 'B2');
    });
  });

  describe('Offline Support', () => {
    it('should cache exercises for offline use', () => {
      cy.visit('/exercises');

      // Go offline
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });

      // Should still show cached exercises
      cy.getByTestId('exercise-card').should('exist');
      cy.contains(/offline mode/i).should('be.visible');
    });

    it('should sync data when coming back online', () => {
      // Complete exercise offline
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });

      cy.visit('/exercises/qcm-1');
      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      // Go online
      cy.window().then((win) => {
        win.dispatchEvent(new Event('online'));
      });

      // Should sync data
      cy.contains(/syncing/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/dashboard');

      // Should show mobile menu
      cy.getByTestId('mobile-menu-button').should('be.visible');

      // Navigation should work
      cy.getByTestId('mobile-menu-button').click();
      cy.contains('Exercises').should('be.visible');
    });

    it('should allow exercise completion on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/exercises/qcm-1');

      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      cy.contains(/score/i).should('be.visible');
    });
  });

  describe('Notifications', () => {
    it('should show success notification after completing exercise', () => {
      cy.visit('/exercises/qcm-1');

      cy.get('input[type="radio"]').first().check();
      cy.contains('Submit').click();

      cy.contains(/completed/i).should('be.visible');
    });

    it('should show notification for daily streak', () => {
      cy.visit('/dashboard');

      // Should show streak notification
      cy.contains(/streak/i).should('be.visible');
    });
  });
});
