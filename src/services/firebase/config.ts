/**
 * Configuration Firebase
 * @version 1.0.0
 * @date 01-11-2025
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Vérifier que toutes les variables sont définies
const requiredEnvVars = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID"
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0 && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ Variables Firebase manquantes:",
    missingVars.join(", "),
    "\nL'application fonctionnera en mode offline uniquement."
  );
}

// Initialiser Firebase uniquement si les variables sont présentes
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (!missingVars.length || process.env.NODE_ENV === "production") {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Firebase initialisé avec succès");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Firebase:", error);
  }
}

export { app, db, auth, storage };
export default { app, db, auth, storage };







