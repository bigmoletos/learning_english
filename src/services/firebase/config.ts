/**
 * Configuration Firebase
 * @version 2.0.0
 * @date 07-11-2025
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfigGenerated } from "./firebaseConfig.generated";

// Vérifier si on est sur Capacitor/Android
const isCapacitor = typeof (window as any).Capacitor !== "undefined";
const platform = isCapacitor ? (window as any).Capacitor?.getPlatform() : "web";

// Initialiser Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

try {
  // Utiliser la configuration générée (fonctionne en dev et prod)
  app = initializeApp(firebaseConfigGenerated);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  console.log(`✅ Firebase initialisé avec succès (${platform})`);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`❌ Erreur Firebase (${platform}):`, errorMessage);

  // Sur mobile, ne pas crasher l'app
  if (isCapacitor) {
    console.warn("Mode offline activé pour Capacitor");
  }
}

export { app, db, auth, storage };
const firebaseConfig = { app, db, auth, storage };
export default firebaseConfig;
