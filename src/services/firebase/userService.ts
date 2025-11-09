/**
 * Service Firestore pour gestion des utilisateurs
 * @version 1.0.0
 * @date 01-11-2025
 */

import {
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByField,
  documentExists
} from "./firestoreService";
import { UserProfile } from "../../types";

const COLLECTION_NAME = "users";

export interface FirestoreUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  currentLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  targetLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  weaknesses?: string[];
  completedExercises?: number;
  totalScore?: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
}

/**
 * Convertit un UserProfile en FirestoreUser
 */
const toFirestoreUser = (user: UserProfile): Partial<FirestoreUser> => {
  // Extraire l'email depuis user.email ou user.name si email n'est pas disponible
  const userEmail = (user as any).email || user.name || "";

  return {
    id: user.id,
    email: userEmail,
    firstName: (user as any).firstName,
    lastName: (user as any).lastName,
    currentLevel: user.currentLevel,
    targetLevel: user.targetLevel,
    weaknesses: user.weaknesses,
    completedExercises: user.completedExercises,
    totalScore: user.totalScore,
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt || Date.now()),
    updatedAt: new Date(),
    lastActivity: user.lastActivity instanceof Date ? user.lastActivity : (user.lastActivity ? new Date(user.lastActivity) : undefined)
  };
};

/**
 * Convertit un FirestoreUser en UserProfile
 */
const toUserProfile = (firestoreUser: FirestoreUser): UserProfile => {
  return {
    id: firestoreUser.id,
    name: firestoreUser.email || `${firestoreUser.firstName || ""} ${firestoreUser.lastName || ""}`.trim() || "Utilisateur",
    currentLevel: firestoreUser.currentLevel,
    targetLevel: firestoreUser.targetLevel,
    strengths: [],
    weaknesses: firestoreUser.weaknesses || [],
    completedExercises: firestoreUser.completedExercises || 0,
    totalScore: firestoreUser.totalScore || 0,
    createdAt: firestoreUser.createdAt,
    lastActivity: firestoreUser.lastActivity || firestoreUser.updatedAt
  };
};

/**
 * Obtient un utilisateur par ID
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const firestoreUser = await getDocument<FirestoreUser>(COLLECTION_NAME, userId);
  return firestoreUser ? toUserProfile(firestoreUser) : null;
};

/**
 * Obtient un utilisateur par email
 */
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const users = await getDocumentsByField<FirestoreUser>(COLLECTION_NAME, "email", email);
  return users.length > 0 ? toUserProfile(users[0]) : null;
};

/**
 * Crée ou met à jour un utilisateur
 */
export const saveUser = async (user: UserProfile): Promise<void> => {
  console.log("💾 [saveUser] Début sauvegarde utilisateur:", {
    userId: user.id,
    email: (user as any).email,
    name: user.name
  });

  try {
    // Vérifier que l'utilisateur a un ID valide
    if (!user.id) {
      const error = new Error("L'utilisateur doit avoir un ID pour être sauvegardé dans Firestore");
      console.error("❌ [saveUser]", error.message);
      throw error;
    }

    console.log("🔄 [saveUser] Conversion en FirestoreUser...");
    const firestoreUser = toFirestoreUser(user);
    console.log("✅ [saveUser] Conversion réussie:", {
      id: firestoreUser.id,
      email: firestoreUser.email,
      hasFirstName: !!firestoreUser.firstName,
      hasLastName: !!firestoreUser.lastName
    });

    // Extraire l'email - c'est obligatoire pour Firestore
    const userEmail = firestoreUser.email || (user as any).email || "";
    if (!userEmail) {
      const error = new Error("L'utilisateur doit avoir un email pour être sauvegardé dans Firestore");
      console.error("❌ [saveUser]", error.message, {
        userData: {
          id: user.id,
          name: user.name,
          hasEmail: !!(user as any).email
        }
      });
      throw error;
    }

    console.log("🔧 [saveUser] Construction des données Firestore...");
    // S'assurer que toutes les propriétés requises sont présentes
    const userData: Partial<FirestoreUser> = {
      id: user.id,
      email: userEmail,
      currentLevel: user.currentLevel,
      targetLevel: user.targetLevel,
      createdAt: firestoreUser.createdAt instanceof Date ? firestoreUser.createdAt : new Date(firestoreUser.createdAt || Date.now()),
      updatedAt: new Date(),
      ...(firestoreUser.firstName && { firstName: firestoreUser.firstName }),
      ...(firestoreUser.lastName && { lastName: firestoreUser.lastName }),
      ...(user.weaknesses && user.weaknesses.length > 0 && { weaknesses: user.weaknesses }),
      ...(user.completedExercises !== undefined && { completedExercises: user.completedExercises }),
      ...(user.totalScore !== undefined && { totalScore: user.totalScore }),
      ...(firestoreUser.lastActivity && { lastActivity: firestoreUser.lastActivity instanceof Date ? firestoreUser.lastActivity : new Date(firestoreUser.lastActivity) })
    };

    console.log("💾 [saveUser] Données préparées:", {
      userId: user.id,
      email: userEmail,
      currentLevel: userData.currentLevel,
      targetLevel: userData.targetLevel,
      dataKeys: Object.keys(userData)
    });

    console.log("🌐 [saveUser] Appel setDocument...");
    await setDocument<FirestoreUser>(COLLECTION_NAME, user.id, userData);
    console.log("✅ [saveUser] Utilisateur sauvegardé avec succès dans Firestore");
  } catch (error: any) {
    console.error("❌ [saveUser] Erreur lors de la sauvegarde:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
      userId: user.id,
      email: (user as any).email,
      error: error
    });
    throw error;
  }
};

/**
 * Met à jour un utilisateur
 */
export const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  const partialUser: Partial<FirestoreUser> = {};

  if (updates.currentLevel) partialUser.currentLevel = updates.currentLevel;
  if (updates.targetLevel) partialUser.targetLevel = updates.targetLevel;
  if (updates.weaknesses) partialUser.weaknesses = updates.weaknesses;
  if (updates.completedExercises !== undefined) partialUser.completedExercises = updates.completedExercises;
  if (updates.totalScore !== undefined) partialUser.totalScore = updates.totalScore;
  if (updates.lastActivity) partialUser.lastActivity = updates.lastActivity;

  await updateDocument<FirestoreUser>(COLLECTION_NAME, userId, partialUser);
};

/**
 * Supprime un utilisateur
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await deleteDocument(COLLECTION_NAME, userId);
};

/**
 * Vérifie si un utilisateur existe
 */
export const userExists = async (userId: string): Promise<boolean> => {
  return documentExists(COLLECTION_NAME, userId);
};









