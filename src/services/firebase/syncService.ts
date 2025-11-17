/**
 * Service de synchronisation Storage ↔ Firestore
 * @version 2.0.0
 * @date 2025-11-06
 * Migré vers storageService pour support Web + Android
 */

import { saveUser, getUserById, updateUser } from "./userService";
import { saveProgress, getUserProgress } from "./progressService";
import { saveAssessment, getUserAssessments } from "./assessmentService";
import { UserProfile, UserResponse } from "../../types";
import { storageService, StorageKeys } from "../../utils/storageService";
import { auth } from "../../firebase/config";

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
const addToSyncQueue = async (item: SyncQueueItem): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    queue.push(item);
    await storageService.set(StorageKeys.SYNC_QUEUE, queue);
  } catch (error) {
    console.error("Erreur lors de l'ajout à la queue de synchronisation:", error);
  }
};

/**
 * Obtient la queue de synchronisation
 */
const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const queue = await storageService.get<SyncQueueItem[]>(StorageKeys.SYNC_QUEUE);
    return Array.isArray(queue) ? queue : [];
  } catch (error) {
    console.error("Erreur lors de la récupération de la queue de synchronisation:", error);
    return [];
  }
};

/**
 * Vide la queue de synchronisation
 */
const clearSyncQueue = async (): Promise<void> => {
  await storageService.remove(StorageKeys.SYNC_QUEUE);
};

/**
 * Sauvegarde l'utilisateur localement et le synchronise avec Firestore
 */
export const syncUser = async (user: UserProfile): Promise<void> => {
  console.log("🔄 [syncUser] Début synchronisation utilisateur:", {
    userId: user.id,
    email: (user as any).email || "non défini",
    name: user.name
  });

  try {
    // Sauvegarder localement d'abord dans le service de stockage unifié
    console.log("💾 [syncUser] Sauvegarde locale...");
    await storageService.setMultiple({
      [StorageKeys.USER]: user,
      [StorageKeys.USER_PROFILE]: user
    });
    console.log("✅ [syncUser] Sauvegarde locale réussie");

    // Ajouter à la queue de synchronisation
    console.log("📋 [syncUser] Ajout à la queue de synchronisation...");
    await addToSyncQueue({
      type: "user",
      action: "create",
      data: user,
      timestamp: Date.now()
    });
    console.log("✅ [syncUser] Ajouté à la queue");

    // Synchroniser immédiatement si Firebase est disponible et utilisateur authentifié
    console.log("🔍 [syncUser] Vérification authentification...");
    if (!auth.currentUser) {
      console.warn("⚠️ [syncUser] Utilisateur non authentifié. Synchronisation reportée.");
      return;
    }

    console.log("🔍 [syncUser] Vérification UID...", {
      authUid: auth.currentUser.uid,
      userUid: user.id
    });
    if (auth.currentUser.uid !== user.id) {
      console.warn(`⚠️ [syncUser] UID mismatch: auth.uid=${auth.currentUser.uid}, user.id=${user.id}. Synchronisation reportée.`);
      return;
    }

    // S'assurer que l'utilisateur a un email
    const userEmail = (user as any).email || user.name;
    console.log("🔍 [syncUser] Vérification email...", { email: userEmail });
    if (!userEmail) {
      console.warn("⚠️ [syncUser] Utilisateur sans email. Synchronisation reportée.");
      return;
    }

    try {
      console.log("🌐 [syncUser] Tentative de sauvegarde dans Firestore...");
      await saveUser(user);
      console.log("✅ [syncUser] Utilisateur synchronisé avec Firestore avec succès");
    } catch (error: any) {
      // Logger l'erreur complète pour diagnostic
      console.error("❌ [syncUser] Erreur lors de la synchronisation utilisateur avec Firestore:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        userId: user.id,
        authUid: auth.currentUser?.uid,
        email: (user as any).email,
        errorDetails: error
      });
      // Les données restent dans le stockage local et seront synchronisées plus tard via la queue
    }
  } catch (error: any) {
    console.error("❌ [syncUser] Erreur critique lors de la sauvegarde utilisateur:", {
      message: error.message,
      stack: error.stack,
      userId: user.id,
      error: error
    });
    throw error;
  }
};

/**
 * Met à jour l'utilisateur localement et le synchronise avec Firestore
 */
export const syncUserUpdate = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    // Mettre à jour localement dans le service de stockage unifié
    const user = await storageService.get<UserProfile>(StorageKeys.USER);
    if (user) {
      const updatedUser = { ...user, ...updates };
      await storageService.setMultiple({
        [StorageKeys.USER]: updatedUser,
        [StorageKeys.USER_PROFILE]: updatedUser
      });
    }

    // Ajouter à la queue de synchronisation
    await addToSyncQueue({
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
    // Sauvegarder localement dans le service de stockage unifié
    const responses = await storageService.get<UserResponse[]>(StorageKeys.USER_RESPONSES) || [];
    responses.push(progress);
    await storageService.set(StorageKeys.USER_RESPONSES, responses);

    // Ajouter à la queue de synchronisation
    await addToSyncQueue({
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
    // Sauvegarder localement selon le type dans le service de stockage unifié
    const testType = assessmentData.testType || assessmentData.assessmentType;
    const storageKey = testType === "efset"
      ? StorageKeys.EFSET_RESULTS
      : testType === "toeic"
        ? StorageKeys.TOEIC_RESULTS
        : testType === "toefl"
          ? StorageKeys.TOEFL_RESULTS
          : `${testType}Results`;

    await storageService.set(storageKey, assessmentData);

    // Ajouter à la queue de synchronisation
    await addToSyncQueue({
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
  console.log("🔄 [processSyncQueue] Début traitement de la queue...");

  // Vérifier que l'utilisateur est authentifié
  if (!auth.currentUser) {
    console.debug("⚠️ [processSyncQueue] Utilisateur non authentifié. Traitement annulé.");
    return;
  }

  console.log("🔍 [processSyncQueue] Récupération de la queue...", {
    authUid: auth.currentUser.uid
  });
  const queue = await getSyncQueue();
  console.log(`📋 [processSyncQueue] Queue récupérée: ${queue.length} élément(s)`);

  if (queue.length === 0) {
    console.log("✅ [processSyncQueue] Queue vide, rien à traiter");
    return;
  }

  const processed: number[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const item of queue) {
    console.log("🔄 [processSyncQueue] Traitement élément:", {
      type: item.type,
      action: item.action,
      timestamp: item.timestamp
    });

    try {
      switch (item.type) {
      case "user":
        console.log("👤 [processSyncQueue] Synchronisation utilisateur...");
        if (item.action === "create") {
          await saveUser(item.data);
          console.log("✅ [processSyncQueue] Utilisateur créé");
        } else if (item.action === "update") {
          await updateUser(item.data.userId, item.data.updates);
          console.log("✅ [processSyncQueue] Utilisateur mis à jour");
        }
        break;
      case "progress":
        console.log("📊 [processSyncQueue] Synchronisation progression...");
        if (item.action === "create") {
          await saveProgress(
            item.data.userId,
            item.data.progress,
            item.data.exerciseId,
            item.data.exerciseType,
            item.data.level,
            item.data.domain
          );
          console.log("✅ [processSyncQueue] Progression sauvegardée");
        }
        break;
      case "assessment":
        console.log("📝 [processSyncQueue] Synchronisation évaluation...");
        if (item.action === "create") {
          await saveAssessment(item.data);
          console.log("✅ [processSyncQueue] Évaluation sauvegardée");
        }
        break;
      }
      processed.push(item.timestamp);
      successCount++;
      console.log(`✅ [processSyncQueue] Élément traité avec succès (${successCount}/${queue.length})`);
    } catch (error: any) {
      errorCount++;
      console.error("❌ [processSyncQueue] Erreur lors du traitement de l'élément:", {
        type: item.type,
        action: item.action,
        timestamp: item.timestamp,
        code: error.code,
        message: error.message,
        stack: error.stack,
        error: error
      });

      // Si c'est une erreur d'authentification/permission, garder dans la queue
      if (error.code === "permission-denied" || error.code === "unauthenticated" ||
          error.message?.includes("permission") || error.message?.includes("authenticated")) {
        console.warn("⚠️ [processSyncQueue] Erreur d'authentification. L'élément reste dans la queue.");
        continue;
      }
      // Garder l'élément dans la queue pour réessayer plus tard
      console.warn("⚠️ [processSyncQueue] L'élément reste dans la queue pour réessai ultérieur");
    }
  }

  console.log(`📊 [processSyncQueue] Traitement terminé: ${successCount} succès, ${errorCount} erreurs`);

  // Retirer les éléments traités de la queue
  if (processed.length > 0) {
    console.log(`🧹 [processSyncQueue] Nettoyage de la queue: ${processed.length} élément(s) traité(s)`);
    const remainingQueue = queue.filter(item => !processed.includes(item.timestamp));
    if (remainingQueue.length === 0) {
      await clearSyncQueue();
      console.log("✅ [processSyncQueue] Queue vidée");
    } else {
      await storageService.set(StorageKeys.SYNC_QUEUE, remainingQueue);
      console.log(`✅ [processSyncQueue] Queue mise à jour: ${remainingQueue.length} élément(s) restant(s)`);
    }
  } else {
    console.log("ℹ️ [processSyncQueue] Aucun élément traité, queue inchangée");
  }

  // Marquer la dernière synchronisation
  const syncTime = Date.now();
  await storageService.set(StorageKeys.LAST_SYNC, syncTime);
  console.log(`✅ [processSyncQueue] Dernière synchronisation marquée: ${new Date(syncTime).toISOString()}`);
};

/**
 * Synchronise toutes les données depuis Firestore vers le service de stockage
 */
export const syncFromFirestore = async (userId: string): Promise<void> => {
  console.log(`🔄 [syncFromFirestore] Début synchronisation depuis Firestore pour userId: ${userId}`);

  // Vérifier que l'utilisateur est authentifié
  if (!auth.currentUser) {
    console.warn("⚠️ [syncFromFirestore] Utilisateur non authentifié. Synchronisation annulée.");
    return;
  }

  if (auth.currentUser.uid !== userId) {
    console.warn(`⚠️ [syncFromFirestore] UID mismatch: auth.uid=${auth.currentUser.uid}, userId=${userId}. Synchronisation annulée.`);
    return;
  }

  try {
    console.log("📥 [syncFromFirestore] Récupération utilisateur depuis Firestore...");
    // Récupérer l'utilisateur depuis Firestore
    const user = await getUserById(userId);
    if (user) {
      console.log("✅ [syncFromFirestore] Utilisateur récupéré:", {
        id: user.id,
        name: user.name,
        level: user.currentLevel
      });
      await storageService.setMultiple({
        [StorageKeys.USER]: user,
        [StorageKeys.USER_PROFILE]: user
      });
      console.log("✅ [syncFromFirestore] Utilisateur sauvegardé localement");
    } else {
      console.warn("⚠️ [syncFromFirestore] Aucun utilisateur trouvé dans Firestore");
    }

    // Récupérer la progression depuis Firestore
    console.log("📊 [syncFromFirestore] Récupération progression...");
    const progress = await getUserProgress(userId);
    console.log(`📊 [syncFromFirestore] ${progress.length} élément(s) de progression récupéré(s)`);
    if (progress.length > 0) {
      await storageService.set(StorageKeys.USER_RESPONSES, progress);
      console.log("✅ [syncFromFirestore] Progression sauvegardée localement");
    }

    // Récupérer les évaluations depuis Firestore
    console.log("📝 [syncFromFirestore] Récupération évaluations...");
    const assessments = await getUserAssessments(userId);
    console.log(`📝 [syncFromFirestore] ${assessments.length} évaluation(s) récupérée(s)`);
    const assessmentUpdates: Record<string, any> = {};
    assessments.forEach(assessment => {
      const testType = assessment.testType || assessment.assessmentType;
      const storageKey = testType === "efset"
        ? StorageKeys.EFSET_RESULTS
        : testType === "toeic"
          ? StorageKeys.TOEIC_RESULTS
          : testType === "toefl"
            ? StorageKeys.TOEFL_RESULTS
            : `${testType}Results`;
      assessmentUpdates[storageKey] = assessment;
    });
    if (Object.keys(assessmentUpdates).length > 0) {
      await storageService.setMultiple(assessmentUpdates);
      console.log("✅ [syncFromFirestore] Évaluations sauvegardées localement");
    }

    // Marquer la dernière synchronisation
    const syncTime = Date.now();
    await storageService.set(StorageKeys.LAST_SYNC, syncTime);
    console.log(`✅ [syncFromFirestore] Synchronisation terminée à ${new Date(syncTime).toISOString()}`);
  } catch (error: any) {
    console.error("❌ [syncFromFirestore] Erreur lors de la synchronisation depuis Firestore:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
      userId: userId,
      authUid: auth.currentUser?.uid,
      error: error
    });

    // Gérer silencieusement les erreurs offline ou réseau
    if (error.code === "unavailable" || error.code === "failed-precondition" ||
        error.message?.includes("offline") || error.message?.includes("network")) {
      console.warn("⚠️ [syncFromFirestore] Client offline. Synchronisation reportée.");
      return;
    }

    // Re-throw les autres erreurs pour qu'elles soient gérées par l'appelant
    throw error;
  }
};

/**
 * Vérifie si une synchronisation est nécessaire
 */
export const needsSync = async (): Promise<boolean> => {
  const lastSync = await storageService.get<number>(StorageKeys.LAST_SYNC);
  if (!lastSync) return true;

  const now = Date.now();
  return now - lastSync > SYNC_INTERVAL;
};

/**
 * Démarre la synchronisation automatique périodique
 */
export const startAutoSync = (userId: string, interval: number = SYNC_INTERVAL): () => void => {
  console.log(`🔄 [startAutoSync] Démarrage synchronisation automatique pour userId: ${userId}`, {
    interval: interval / 1000 + "s"
  });

  const syncInterval = setInterval(async () => {
    try {
      console.log("⏰ [startAutoSync] Cycle de synchronisation...");

      // Vérifier que l'utilisateur est toujours authentifié
      if (!auth.currentUser) {
        console.debug("⚠️ [startAutoSync] Utilisateur non authentifié. Synchronisation annulée.");
        return;
      }

      if (auth.currentUser.uid !== userId) {
        console.warn(`⚠️ [startAutoSync] UID mismatch: auth.uid=${auth.currentUser.uid}, userId=${userId}. Synchronisation annulée.`);
        return;
      }

      console.log("🔍 [startAutoSync] Vérification besoin de synchronisation...");
      const needsSyncNow = await needsSync();
      console.log(`📊 [startAutoSync] Besoin de synchronisation: ${needsSyncNow}`);

      if (needsSyncNow) {
        console.log("🔄 [startAutoSync] Traitement de la queue...");
        await processSyncQueue();

        console.log("🔄 [startAutoSync] Synchronisation depuis Firestore...");
        await syncFromFirestore(userId);

        console.log("✅ [startAutoSync] Cycle de synchronisation terminé");
      } else {
        console.debug("ℹ️ [startAutoSync] Pas besoin de synchronisation pour le moment");
      }
    } catch (error: any) {
      console.error("❌ [startAutoSync] Erreur lors du cycle de synchronisation:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        userId: userId,
        authUid: auth.currentUser?.uid,
        error: error
      });
    }
  }, interval);

  console.log("✅ [startAutoSync] Synchronisation automatique démarrée");

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







