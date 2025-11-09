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
    // Gérer silencieusement les erreurs offline, d'authentification ou de permission
    if (error.code === "unavailable" || error.code === "failed-precondition" ||
        error.code === "permission-denied" || error.code === "unauthenticated" ||
        error.message?.includes("offline") || error.message?.includes("network") ||
        error.message?.includes("permission") || error.message?.includes("authenticated")) {
      // Client offline ou non authentifié - retourner null silencieusement
      return null;
    }
    // Ne logger que les autres erreurs
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
  } catch (error: any) {
    // Gérer silencieusement les erreurs offline, d'authentification ou de permission
    if (error.code === "unavailable" || error.code === "failed-precondition" ||
        error.code === "permission-denied" || error.code === "unauthenticated" ||
        error.message?.includes("offline") || error.message?.includes("network") ||
        error.message?.includes("permission") || error.message?.includes("authenticated")) {
      // Client offline ou non authentifié - retourner un tableau vide silencieusement
      return [];
    }
    // Ne logger que les autres erreurs
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

  // Vérifier l'authentification avant l'écriture - v2
  if (!isAuthenticated()) {
    throw new Error("Utilisateur non authentifié. Impossible de sauvegarder dans Firestore.");
  }

  try {
    // Vérifier que l'utilisateur est bien authentifié avec un token valide
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    // Vérifier que le documentId correspond à l'UID de l'utilisateur pour la collection users
    if (collectionName === "users" && documentId !== auth.currentUser.uid) {
      throw new Error(`UID mismatch: documentId=${documentId}, auth.uid=${auth.currentUser.uid}`);
    }

    const docRef = doc(db, collectionName, documentId);
    
    // Convertir les dates en Timestamp Firestore
    const firestoreData: any = { ...data };
    Object.keys(firestoreData).forEach((key) => {
      if (firestoreData[key] instanceof Date) {
        firestoreData[key] = Timestamp.fromDate(firestoreData[key]);
      } else if (firestoreData[key] && typeof firestoreData[key] === "string" && firestoreData[key].match(/^\d{4}-\d{2}-\d{2}T/)) {
        // Convertir les chaînes ISO en Timestamp
        try {
          firestoreData[key] = Timestamp.fromDate(new Date(firestoreData[key]));
        } catch (e) {
          // Garder la chaîne si la conversion échoue
        }
      }
    });
    
    // Vérifier que les données essentielles sont présentes
    if (collectionName === "users" && !firestoreData.email) {
      console.warn("⚠️ Tentative de sauvegarde utilisateur sans email:", firestoreData);
    }

    await setDoc(docRef, {
      ...firestoreData,
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log(`✅ Document sauvegardé: ${collectionName}/${documentId}`);
  } catch (error: any) {
    // Logger l'erreur complète pour diagnostic
    const errorDetails = {
      code: error.code,
      message: error.message,
      collection: collectionName,
      documentId: documentId,
      authUid: auth.currentUser?.uid || "non authentifié",
      dataKeys: Object.keys(data || {}),
      dataSample: collectionName === "users" ? { id: (data as any)?.id, email: (data as any)?.email } : "N/A"
    };
    
    console.error(`❌ Erreur lors de la sauvegarde du document ${collectionName}/${documentId}:`, errorDetails);
    
    // Si c'est une erreur de permission, donner plus de détails
    if (error.code === "permission-denied") {
      console.error("🔒 Permission refusée. Vérifiez que:");
      console.error("  1. Les règles Firestore sont déployées");
      console.error("  2. L'utilisateur est authentifié (auth.uid:", auth.currentUser?.uid, ")");
      console.error("  3. Le documentId correspond à auth.uid pour la collection users");
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
    throw new Error("Utilisateur non authentifié. Impossible de mettre à jour dans Firestore.");
  }

  try {
    const docRef = doc(db, collectionName, documentId);

    // Convertir les dates en Timestamp Firestore
    const firestoreData: any = { ...data };
    Object.keys(firestoreData).forEach((key) => {
      if (firestoreData[key] instanceof Date) {
        firestoreData[key] = Timestamp.fromDate(firestoreData[key]);
      }
    });

    await updateDoc(docRef, {
      ...firestoreData,
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    // Logger l'erreur pour diagnostic
    console.error(`Erreur lors de la mise à jour du document ${collectionName}/${documentId}:`, {
      code: error.code,
      message: error.message,
      data: data
    });
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
    throw new Error("Utilisateur non authentifié. Impossible de supprimer dans Firestore.");
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error: any) {
    // Logger l'erreur pour diagnostic
    console.error(`Erreur lors de la suppression du document ${collectionName}/${documentId}:`, {
      code: error.code,
      message: error.message
    });
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







