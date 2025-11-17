/**
 * Service de persistance unifié pour Web et Mobile (Capacitor)
 * Utilise Capacitor Preferences sur mobile et localStorage sur web
 * @version 1.0.0
 * @date 2025-11-06
 */

// Import conditionnel de Capacitor Preferences (uniquement si disponible)
let Preferences: any;
try {
  Preferences = require("@capacitor/preferences").Preferences;
} catch {
  // @capacitor/preferences n'est pas disponible (environnement web uniquement)
  Preferences = null;
}

// Détecter la plateforme
const isCapacitor = typeof (window as any).Capacitor !== "undefined" && Preferences !== null;

/**
 * Interface pour le service de stockage
 */
interface StorageService {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
}

/**
 * Implémentation pour Capacitor (Android/iOS)
 */
const capacitorStorage: StorageService = {
  get: async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error);
      throw error;
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
      throw error;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error("Erreur lors du nettoyage du stockage:", error);
      throw error;
    }
  },

  keys: async (): Promise<string[]> => {
    try {
      const { keys } = await Preferences.keys();
      return keys;
    } catch (error) {
      console.error("Erreur lors de la récupération des clés:", error);
      return [];
    }
  },
};

/**
 * Implémentation pour Web (localStorage)
 */
const webStorage: StorageService = {
  get: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erreur lors de l'écriture de ${key}:`, error);
      // Gérer le quota dépassé
      if (error instanceof DOMException && error.code === 22) {
        throw new Error("Quota de stockage dépassé. Veuillez libérer de l'espace.");
      }
      throw error;
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
      throw error;
    }
  },

  clear: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Erreur lors du nettoyage du stockage:", error);
      throw error;
    }
  },

  keys: async (): Promise<string[]> => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error("Erreur lors de la récupération des clés:", error);
      return [];
    }
  },
};

// Sélectionner l'implémentation selon la plateforme
const storage: StorageService = isCapacitor ? capacitorStorage : webStorage;

/**
 * Clés de stockage standardisées
 */
export const StorageKeys = {
  // Authentification
  TOKEN: "token",
  FIREBASE_USER: "firebaseUser",
  USER: "user",
  USER_PROFILE: "userProfile",
  PENDING_USER: "pendingUser",

  // Données utilisateur
  USER_RESPONSES: "userResponses",
  LEVEL_ASSESSED: "levelAssessed",

  // Résultats de tests
  EFSET_RESULTS: "efsetResults",
  TOEIC_RESULTS: "toeicResults",
  TOEFL_RESULTS: "toeflResults",
  LAST_TEST_TYPE: "lastTestType",

  // Synchronisation
  SYNC_QUEUE: "syncQueue",
  LAST_SYNC: "lastSync",
  FIREBASE_AUTH_PERSISTENCE: "firebaseAuthPersistence",
} as const;

/**
 * Service de persistance unifié
 */
export const storageService = {
  /**
   * Lire une valeur
   */
  get: async <T = any>(key: string): Promise<T | null> => {
    const value = await storage.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  /**
   * Écrire une valeur
   */
  set: async <T = any>(key: string, value: T): Promise<void> => {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    await storage.set(key, serialized);
  },

  /**
   * Supprimer une clé
   */
  remove: async (key: string): Promise<void> => {
    await storage.remove(key);
  },

  /**
   * Nettoyer tout le stockage
   */
  clear: async (): Promise<void> => {
    await storage.clear();
  },

  /**
   * Obtenir toutes les clés
   */
  keys: async (): Promise<string[]> => {
    return await storage.keys();
  },

  /**
   * Vérifier si une clé existe
   */
  has: async (key: string): Promise<boolean> => {
    const value = await storage.get(key);
    return value !== null;
  },

  /**
   * Obtenir plusieurs valeurs en une fois
   */
  getMultiple: async <T = any>(keys: string[]): Promise<Record<string, T | null>> => {
    const result: Record<string, T | null> = {};
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await storageService.get<T>(key);
      })
    );
    return result;
  },

  /**
   * Écrire plusieurs valeurs en une fois
   */
  setMultiple: async <T = any>(items: Record<string, T>): Promise<void> => {
    await Promise.all(Object.entries(items).map(([key, value]) => storageService.set(key, value)));
  },

  /**
   * Supprimer plusieurs clés
   */
  removeMultiple: async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map((key) => storage.remove(key)));
  },

  /**
   * Obtenir la taille du stockage (approximative)
   */
  getSize: async (): Promise<number> => {
    if (isCapacitor) {
      // Capacitor Preferences ne fournit pas de taille directement
      // On peut estimer en comptant les caractères
      const keys = await storage.keys();
      let totalSize = 0;
      for (const key of keys) {
        const value = await storage.get(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
      return totalSize;
    } else {
      // localStorage : estimation basée sur les données
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    }
  },
};

/**
 * Migration depuis localStorage vers le service unifié
 * Utile lors du premier lancement sur mobile
 */
export const migrateFromLocalStorage = async (): Promise<void> => {
  if (!isCapacitor) return; // Pas nécessaire sur web

  try {
    // Migrer les clés importantes
    const keysToMigrate = Object.values(StorageKeys);
    let migratedCount = 0;

    for (const key of keysToMigrate) {
      const value = localStorage.getItem(key);
      if (value) {
        const existing = await storageService.get(key);
        if (!existing) {
          await storageService.set(key, value);
          migratedCount++;
        }
      }
    }

    if (migratedCount > 0) {
      console.log(
        `✅ Migration réussie : ${migratedCount} éléments migrés vers Capacitor Preferences`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
  }
};

export default storageService;
