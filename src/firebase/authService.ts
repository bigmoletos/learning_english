/**
 * Firebase Authentication Service
 * @version 1.0.0
 * @date 2025-11-06
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";
import { auth } from "./config";

interface AuthResult {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

/**
 * Register a new user with email and password
 * @param email - User email
 * @param password - User password
 * @param displayName - User display name
 * @returns User credential
 */
export const registerUser = async (email: string, password: string, displayName: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Send email verification
    await sendEmailVerification(userCredential.user);

    return {
      success: true,
      user: userCredential.user,
      message: "Registration successful. Please check your email for verification."
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Sign in user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User credential
 */
export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Sign out current user
 * @returns Result
 */
export const logoutUser = async (): Promise<AuthResult> => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: "Logout successful"
    };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Send password reset email
 * @param email - User email
 * @returns Result
 */
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent. Please check your inbox."
    };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Sign in with Google
 * @returns User credential
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
};

/**
 * Get current user
 * @returns Current user or null
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user-friendly error message
 * @param errorCode - Firebase error code
 * @returns User-friendly error message
 */
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use": "Cet email est déjà enregistré.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/operation-not-allowed": "Opération non autorisée. Contactez le support.",
    "auth/weak-password": "Le mot de passe est trop faible. Utilisez au moins 6 caractères.",
    "auth/user-disabled": "Ce compte a été désactivé.",
    "auth/user-not-found": "Aucun compte trouvé avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.",
    "auth/invalid-verification-code": "Code de vérification invalide.",
    "auth/invalid-verification-id": "ID de vérification invalide.",
    "auth/too-many-requests": "Trop de tentatives. Veuillez réessayer plus tard.",
    "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion internet.",
    "auth/popup-closed-by-user": "La fenêtre de connexion a été fermée.",
    "auth/cancelled-popup-request": "Une seule demande de connexion est autorisée à la fois."
  };

  return errorMessages[errorCode] || "Une erreur est survenue. Veuillez réessayer.";
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  signInWithGoogle,
  getCurrentUser,
  onAuthStateChange
};
