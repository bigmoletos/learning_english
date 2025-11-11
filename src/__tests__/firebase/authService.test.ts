/**
 * Tests for Firebase Authentication Service
 * @version 1.0.0
 */

import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  signInWithGoogle,
  getCurrentUser,
  onAuthStateChange,
} from '../../firebase/authService';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth');
jest.mock('../../firebase/config', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('Firebase Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (firebaseAuth.updateProfile as jest.Mock).mockResolvedValue(undefined);
      (firebaseAuth.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      const result = await registerUser('test@example.com', 'password123', 'Test User');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.message).toContain('Registration successful');
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User',
      });
      expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockUser);
    });

    it('should handle registration error', async () => {
      const error = { code: 'auth/email-already-in-use' };
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await registerUser('existing@example.com', 'password123', 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/email-already-in-use');
      expect(result.message).toBe('This email is already registered.');
    });

    it('should handle weak password error', async () => {
      const error = { code: 'auth/weak-password' };
      (firebaseAuth.createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await registerUser('test@example.com', '123', 'Test');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is too weak. Use at least 6 characters.');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
      };

      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await loginUser('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should handle wrong password error', async () => {
      const error = { code: 'auth/wrong-password' };
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await loginUser('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Incorrect password.');
    });

    it('should handle user not found error', async () => {
      const error = { code: 'auth/user-not-found' };
      (firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const result = await loginUser('nonexistent@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('No account found with this email.');
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      (firebaseAuth.signOut as jest.Mock).mockResolvedValue(undefined);

      const result = await logoutUser();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      const error = { code: 'auth/network-request-failed' };
      (firebaseAuth.signOut as jest.Mock).mockRejectedValue(error);

      const result = await logoutUser();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error. Please check your connection.');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      (firebaseAuth.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await resetPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Password reset email sent');
      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    it('should handle invalid email error', async () => {
      const error = { code: 'auth/invalid-email' };
      (firebaseAuth.sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      const result = await resetPassword('invalid-email');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email address.');
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const mockUser = {
        uid: 'google-uid-123',
        email: 'google@example.com',
        displayName: 'Google User',
      };

      (firebaseAuth.GoogleAuthProvider as jest.Mock).mockImplementation(() => ({}));
      (firebaseAuth.signInWithPopup as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
    });

    it('should handle popup closed error', async () => {
      const error = { code: 'auth/popup-closed-by-user' };
      (firebaseAuth.GoogleAuthProvider as jest.Mock).mockImplementation(() => ({}));
      (firebaseAuth.signInWithPopup as jest.Mock).mockRejectedValue(error);

      const result = await signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Sign-in popup was closed before completion.');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const mockAuth = require('../../firebase/config').auth;
      mockAuth.currentUser = { uid: 'test-123', email: 'test@example.com' };

      const user = getCurrentUser();

      expect(user).toEqual({ uid: 'test-123', email: 'test@example.com' });
    });

    it('should return null if no user', () => {
      const mockAuth = require('../../firebase/config').auth;
      mockAuth.currentUser = null;

      const user = getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const callback = jest.fn();
      (firebaseAuth.onAuthStateChanged as jest.Mock).mockReturnValue(() => {});

      const unsubscribe = onAuthStateChange(callback);

      expect(firebaseAuth.onAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
