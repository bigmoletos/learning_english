/**
 * Configuration Firebase
 * @version 2.0.0
 * @date 2025-11-06
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfigGenerated } from "../services/firebase/firebaseConfig.generated";

// Vérifier si on est sur Capacitor/Android
const isCapacitor = typeof (window as any).Capacitor !== "undefined";

// Configuration Firebase : utiliser les variables d'environnement ou la config générée en fallback
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || firebaseConfigGenerated.apiKey,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || firebaseConfigGenerated.authDomain,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || firebaseConfigGenerated.projectId,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || firebaseConfigGenerated.storageBucket,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigGenerated.messagingSenderId,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || firebaseConfigGenerated.appId,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || firebaseConfigGenerated.measurementId
};

// Vérifier que la configuration est valide
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Configuration Firebase manquante. Vérifiez vos variables d'environnement ou le fichier firebaseConfig.generated.ts");
}

// Initialiser Firebase
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialisé avec succès");
} catch (error) {
  console.error("❌ Erreur lors de l'initialisation Firebase:", error);
  throw error;
}

// Initialiser les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurer la persistance Firebase Auth (web uniquement)
if (!isCapacitor && typeof window !== "undefined") {
  // Persistance locale pour maintenir la session même après fermeture du navigateur
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn("Erreur lors de la configuration de la persistance Auth:", error);
  });
}

// Configurer Firestore avec cache offline persistant
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
    .then(() => {
      console.log("✅ Cache Firestore offline activé");
    })
    .catch((error) => {
      // Erreur si plusieurs onglets sont ouverts (normal)
      if (error.code === "failed-precondition") {
        console.warn("⚠️ Plusieurs onglets ouverts. Le cache offline est déjà activé dans un autre onglet.");
      } else if (error.code === "unimplemented") {
        console.warn("⚠️ Le cache offline n'est pas disponible sur cette plateforme.");
      } else {
        console.error("❌ Erreur lors de l'activation du cache Firestore:", error);
      }
    });
}

// Analytics (optionnel)
let analytics = null;
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;
