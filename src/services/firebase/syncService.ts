/**
 * Service de synchronisation localStorage ↔ Firestore
 * @version 1.0.0
 * @date 01-11-2025
 */

import { saveUser, getUserById, updateUser } from "./userService";
import { saveProgress, getUserProgress, getUserProgressStats } from "./progressService";
import { saveAssessment, getUserAssessments } from "./assessmentService";
import { UserProfile, UserResponse } from "../../types";

const SYNC_QUEUE_KEY = "syncQueue";
const LAST_SYNC_KEY = "lastSync";
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface SyncQueueItem {
  type: "user" | "progress" | "assessment";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: number;
}

/**
 * Ajoute un élément à la queue de synchronisation
 */
const addToSyncQueue = (item: SyncQueueItem): void => {
  try {
    const queue = getSyncQueue();
    queue.push(item);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Erreur lors de l'ajout à la queue de synchronisation:", error);
  }
};

/**
 * Obtient la queue de synchronisation
 */
const getSyncQueue = (): SyncQueueItem[] => {
  try {
    const queueStr = localStorage.getItem(SYNC_QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération de la queue de synchronisation:", error);
    return [];
  }
};

/**
 * Vide la queue de synchronisation
 */
const clearSyncQueue = (): void => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

/**
 * Sauvegarde l'utilisateur localement et le synchronise avec Firestore
 */
export const syncUser = async (user: UserProfile): Promise<void> => {
  try {
    // Sauvegarder localement d'abord
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userProfile", JSON.stringify(user));

    // Ajouter à la queue de synchronisation
    addToSyncQueue({
      type: "user",
      action: "create",
      data: user,
      timestamp: Date.now()
    });

    // Synchroniser immédiatement si Firebase est disponible et utilisateur authentifié
    try {
      await saveUser(user);
    } catch (error: any) {
      // Ignorer les erreurs d'authentification - les données seront synchronisées plus tard
      if (error.message?.includes("non authentifié") || error.code === "permission-denied") {
        console.debug("Synchronisation utilisateur reportée (utilisateur non authentifié)");
      } else {
        console.warn("Erreur lors de la synchronisation utilisateur avec Firestore:", error);
      }
      // Les données restent dans localStorage et seront synchronisées plus tard
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde utilisateur:", error);
    throw error;
  }
};

/**
 * Met à jour l'utilisateur localement et le synchronise avec Firestore
 */
export const syncUserUpdate = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    // Mettre à jour localement
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
    }

    // Ajouter à la queue de synchronisation
    addToSyncQueue({
      type: "user",
      action: "update",
      data: { userId, updates },
      timestamp: Date.now()
    });

    // Synchroniser immédiatement si Firebase est disponible et utilisateur authentifié
    try {
      await updateUser(userId, updates);
    } catch (error: any) {
      // Ignorer les erreurs d'authentification
      if (error.message?.includes("non authentifié") || error.code === "permission-denied") {
        console.debug("Synchronisation mise à jour utilisateur reportée (utilisateur non authentifié)");
      } else {
        console.warn("Erreur lors de la synchronisation mise à jour utilisateur avec Firestore:", error);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour utilisateur:", error);
    throw error;
  }
};

/**
 * Synchronise une réponse utilisateur (progression)
 */
export const syncProgress = async (
  userId: string,
  progress: UserResponse,
  exerciseId: string,
  exerciseType: string,
  level: string,
  domain?: string
): Promise<void> => {
  try {
    // Sauvegarder localement
    const responsesStr = localStorage.getItem("userResponses");
    const responses: UserResponse[] = responsesStr ? JSON.parse(responsesStr) : [];
    responses.push(progress);
    localStorage.setItem("userResponses", JSON.stringify(responses));

    // Ajouter à la queue de synchronisation
    addToSyncQueue({
      type: "progress",
      action: "create",
      data: { userId, progress, exerciseId, exerciseType, level, domain },
      timestamp: Date.now()
    });

    // Synchroniser immédiatement si Firebase est disponible et utilisateur authentifié
    try {
      await saveProgress(
        userId,
        progress,
        exerciseId,
        exerciseType as any,
        level as any,
        domain
      );
    } catch (error: any) {
      // Ignorer les erreurs d'authentification
      if (error.message?.includes("non authentifié") || error.code === "permission-denied") {
        console.debug("Synchronisation progression reportée (utilisateur non authentifié)");
      } else {
        console.warn("Erreur lors de la synchronisation progression avec Firestore:", error);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde progression:", error);
    throw error;
  }
};

/**
 * Synchronise un résultat d'évaluation
 */
export const syncAssessment = async (assessmentData: any): Promise<void> => {
  try {
    // Sauvegarder localement selon le type
    const key = `${assessmentData.testType || assessmentData.assessmentType}Results`;
    localStorage.setItem(key, JSON.stringify(assessmentData));

    // Ajouter à la queue de synchronisation
    addToSyncQueue({
      type: "assessment",
      action: "create",
      data: assessmentData,
      timestamp: Date.now()
    });

    // Synchroniser immédiatement si Firebase est disponible et utilisateur authentifié
    try {
      await saveAssessment(assessmentData);
    } catch (error: any) {
      // Ignorer les erreurs d'authentification
      if (error.message?.includes("non authentifié") || error.code === "permission-denied") {
        console.debug("Synchronisation évaluation reportée (utilisateur non authentifié)");
      } else {
        console.warn("Erreur lors de la synchronisation évaluation avec Firestore:", error);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde évaluation:", error);
    throw error;
  }
};

/**
 * Traite la queue de synchronisation
 */
export const processSyncQueue = async (): Promise<void> => {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const processed: number[] = [];

  for (const item of queue) {
    try {
      switch (item.type) {
      case "user":
        if (item.action === "create") {
          await saveUser(item.data);
        } else if (item.action === "update") {
          await updateUser(item.data.userId, item.data.updates);
        }
        break;
      case "progress":
        if (item.action === "create") {
          await saveProgress(
            item.data.userId,
            item.data.progress,
            item.data.exerciseId,
            item.data.exerciseType,
            item.data.level,
            item.data.domain
          );
        }
        break;
      case "assessment":
        if (item.action === "create") {
          await saveAssessment(item.data);
        }
        break;
      }
      processed.push(item.timestamp);
    } catch (error) {
      console.error("Erreur lors du traitement de l'élément de synchronisation:", error);
      // Garder l'élément dans la queue pour réessayer plus tard
    }
  }

  // Retirer les éléments traités de la queue
  if (processed.length > 0) {
    const remainingQueue = queue.filter(item => !processed.includes(item.timestamp));
    if (remainingQueue.length === 0) {
      clearSyncQueue();
    } else {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    }
  }

  // Marquer la dernière synchronisation
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
};

/**
 * Synchronise toutes les données depuis Firestore vers localStorage
 */
export const syncFromFirestore = async (userId: string): Promise<void> => {
  try {
    // Récupérer l'utilisateur depuis Firestore
    const user = await getUserById(userId);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userProfile", JSON.stringify(user));
    }

    // Récupérer la progression depuis Firestore
    const progress = await getUserProgress(userId);
    if (progress.length > 0) {
      localStorage.setItem("userResponses", JSON.stringify(progress));
    }

    // Récupérer les évaluations depuis Firestore
    const assessments = await getUserAssessments(userId);
    assessments.forEach(assessment => {
      const key = `${assessment.testType || assessment.assessmentType}Results`;
      localStorage.setItem(key, JSON.stringify(assessment));
    });

    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error: any) {
    // Gérer silencieusement les erreurs offline ou réseau
    if (error.code === "unavailable" || error.code === "failed-precondition" ||
        error.message?.includes("offline") || error.message?.includes("network")) {
      // Client offline - ignorer silencieusement
      return;
    }
    // Ne logger que les autres erreurs
    if (error.code !== "permission-denied") {
      console.error("Erreur lors de la synchronisation depuis Firestore:", error);
    }
  }
};

/**
 * Vérifie si une synchronisation est nécessaire
 */
export const needsSync = (): boolean => {
  const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
  if (!lastSyncStr) return true;

  const lastSync = parseInt(lastSyncStr, 10);
  const now = Date.now();
  return now - lastSync > SYNC_INTERVAL;
};

/**
 * Démarre la synchronisation automatique périodique
 */
export const startAutoSync = (userId: string, interval: number = SYNC_INTERVAL): () => void => {
  const syncInterval = setInterval(async () => {
    if (needsSync()) {
      await processSyncQueue();
      await syncFromFirestore(userId);
    }
  }, interval);

  // Retourner une fonction pour arrêter la synchronisation
  return () => clearInterval(syncInterval);
};

/**
 * Force une synchronisation complète
 */
export const forceSync = async (userId: string): Promise<void> => {
  await processSyncQueue();
  await syncFromFirestore(userId);
};







