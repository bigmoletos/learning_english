/**
 * Service Firestore générique pour opérations CRUD
 * @version 1.1.0
 * @date 01-11-2025
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from "firebase/firestore";
import { db, auth } from "./config";

/**
 * Vérifie si l'utilisateur est authentifié
 * Retourne true si authentifié, false sinon
 */
const isAuthenticated = (): boolean => {
  if (!auth) {
    return false;
  }
  return !!auth.currentUser;
};

/**
 * Convertit un objet Firestore avec Timestamp en objet JavaScript standard
 */
export const convertTimestamps = (data: any): any => {
  if (!data) return null;

  const converted: any = { ...data };

  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === "object" && !Array.isArray(converted[key])) {
      converted[key] = convertTimestamps(converted[key]);
    }
  });

  return converted;
};

/**
 * Obtient un document par ID
 */
export const getDocument = async <T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  if (!db) {
    console.warn("Firestore n'est pas initialisé");
    return null;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return convertTimestamps({ ...data, id: docSnap.id }) as T;
    }

    return null;
  } catch (error: any) {
    // Gérer silencieusement les erreurs offline ou d'authentification
    if (error.code === "unavailable" || error.code === "failed-precondition" ||
        error.message?.includes("offline") || error.message?.includes("network")) {
      // Client offline - retourner null silencieusement
      return null;
    }
    // Ne logger que les autres erreurs
    if (error.code !== "permission-denied") {
      console.error(`Erreur lors de la récupération du document ${collectionName}/${documentId}:`, error);
    }
    throw error;
  }
};

/**
 * Obtient tous les documents d'une collection avec filtres optionnels
 */
export const getDocuments = async <T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  if (!db) {
    console.warn("Firestore n'est pas initialisé");
    return [];
  }

  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0
      ? query(collectionRef, ...constraints)
      : query(collectionRef);

    const querySnapshot = await getDocs(q);
    const documents: T[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      documents.push(convertTimestamps({ ...data, id: docSnap.id }) as T);
    });

    return documents;
  } catch (error: any) {
    // Gérer silencieusement les erreurs offline ou d'authentification
    if (error.code === "unavailable" || error.code === "failed-precondition" ||
        error.message?.includes("offline") || error.message?.includes("network")) {
      // Client offline - retourner un tableau vide silencieusement
      return [];
    }
    // Ne logger que les autres erreurs
    if (error.code !== "permission-denied") {
      console.error(`Erreur lors de la récupération des documents ${collectionName}:`, error);
    }
    throw error;
  }
};

/**
 * Crée ou met à jour un document
 */
export const setDocument = async <T = DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  if (!db) {
    console.warn("Firestore n'est pas initialisé");
    return;
  }

  // Vérifier l'authentification avant l'écriture - v2
  if (!isAuthenticated()) {
    // Ne pas afficher d'avertissement - c'est normal si Firebase Auth n'est pas configuré
    // Les données seront sauvegardées dans localStorage et synchronisées plus tard
    return;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error: any) {
    // Améliorer le message d'erreur pour les erreurs d'authentification
    if (error.code === "permission-denied" || error.message?.includes("permission")) {
      console.warn(`Permission refusée pour ${collectionName}/${documentId}. L'utilisateur doit être authentifié.`);
    } else {
      console.error(`Erreur lors de la sauvegarde du document ${collectionName}/${documentId}:`, error);
    }
    throw error;
  }
};

/**
 * Met à jour un document existant
 */
export const updateDocument = async <T = DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  if (!db) {
    console.warn("Firestore n'est pas initialisé");
    return;
  }

  // Vérifier l'authentification avant l'écriture
  if (!isAuthenticated()) {
    // Ne pas afficher d'avertissement - c'est normal si Firebase Auth n'est pas configuré
    return;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    // Améliorer le message d'erreur pour les erreurs d'authentification
    if (error.code === "permission-denied" || error.message?.includes("permission")) {
      console.warn(`Permission refusée pour ${collectionName}/${documentId}. L'utilisateur doit être authentifié.`);
    } else {
      console.error(`Erreur lors de la mise à jour du document ${collectionName}/${documentId}:`, error);
    }
    throw error;
  }
};

/**
 * Supprime un document
 */
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  if (!db) {
    console.warn("Firestore n'est pas initialisé");
    return;
  }

  // Vérifier l'authentification avant la suppression
  if (!isAuthenticated()) {
    // Ne pas afficher d'avertissement - c'est normal si Firebase Auth n'est pas configuré
    return;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (error.code === "permission-denied" || error.message?.includes("permission")) {
      console.warn(`Permission refusée pour ${collectionName}/${documentId}. L'utilisateur doit être authentifié.`);
    } else {
      console.error(`Erreur lors de la suppression du document ${collectionName}/${documentId}:`, error);
    }
    throw error;
  }
};

/**
 * Obtient les documents d'une collection filtrés par un champ
 */
export const getDocumentsByField = async <T = DocumentData>(
  collectionName: string,
  field: string,
  value: any,
  orderByField?: string,
  orderDirection: "asc" | "desc" = "asc",
  maxResults?: number
): Promise<T[]> => {
  const constraints: QueryConstraint[] = [where(field, "==", value)];

  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }

  if (maxResults) {
    constraints.push(limit(maxResults));
  }

  return getDocuments<T>(collectionName, constraints);
};

/**
 * Obtient les documents d'une collection ordonnés par un champ
 */
export const getDocumentsOrdered = async <T = DocumentData>(
  collectionName: string,
  orderByField: string,
  orderDirection: "asc" | "desc" = "desc",
  maxResults?: number
): Promise<T[]> => {
  const constraints: QueryConstraint[] = [orderBy(orderByField, orderDirection)];

  if (maxResults) {
    constraints.push(limit(maxResults));
  }

  return getDocuments<T>(collectionName, constraints);
};

/**
 * Vérifie si un document existe
 */
export const documentExists = async (
  collectionName: string,
  documentId: string
): Promise<boolean> => {
  if (!db) {
    return false;
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'existence du document ${collectionName}/${documentId}:`, error);
    return false;
  }
};







