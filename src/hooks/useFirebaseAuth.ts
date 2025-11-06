/**
 * Custom React Hook for Firebase Authentication
 * @version 1.0.0
 * @date 2025-11-06
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  signInWithGoogle,
  getCurrentUser,
  onAuthStateChange
} from '../firebase/authService';

/**
 * Custom hook for Firebase authentication
 * @returns Auth state and methods
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Register new user
   * @param email - User email
   * @param password - User password
   * @param displayName - User display name
   * @returns Result object
   */
  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);

    const result = await registerUser(email, password, displayName);

    if (!result.success) {
      setError(result.message || null);
    }

    setLoading(false);
    return result;
  };

  /**
   * Login user
   * @param email - User email
   * @param password - User password
   * @returns Result object
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await loginUser(email, password);

    if (!result.success) {
      setError(result.message || null);
    }

    setLoading(false);
    return result;
  };

  /**
   * Logout user
   * @returns Result object
   */
  const logout = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    const result = await logoutUser();

    if (!result.success) {
      setError(result.message || null);
    }

    setLoading(false);
    return result;
  };

  /**
   * Reset password
   * @param email - User email
   * @returns Result object
   */
  const resetPass = async (email: string) => {
    setLoading(true);
    setError(null);

    const result = await resetPassword(email);

    if (!result.success) {
      setError(result.message || null);
    }

    setLoading(false);
    return result;
  };

  /**
   * Sign in with Google
   * @returns Result object
   */
  const googleSignIn = async () => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.message || null);
    }

    setLoading(false);
    return result;
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword: resetPass,
    signInWithGoogle: googleSignIn,
    clearError,
    isAuthenticated: !!user
  };
};

export default useFirebaseAuth;
