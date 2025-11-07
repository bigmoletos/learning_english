/**
 * Service Firestore générique pour opérations CRUD
 * @version 1.0.0
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
import { db } from "./config";

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
  } catch (error) {
    console.error(`Erreur lors de la récupération du document ${collectionName}/${documentId}:`, error);
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
  } catch (error) {
    console.error(`Erreur lors de la récupération des documents ${collectionName}:`, error);
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

  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du document ${collectionName}/${documentId}:`, error);
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

  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du document ${collectionName}/${documentId}:`, error);
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

  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression du document ${collectionName}/${documentId}:`, error);
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







