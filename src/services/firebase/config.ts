/**
 * Configuration Firebase
 * @version 2.0.0
 * @date 07-11-2025
 */

import { initializeApp, FirebaseApp, getApps } from "firebase/app";
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
  // Vérifier si Firebase est déjà initialisé pour éviter la double initialisation
  const existingApps = getApps();

  if (existingApps.length > 0) {
    // Utiliser l'app existante
    app = existingApps[0] as FirebaseApp;
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log(`✅ Firebase réutilisé (${platform})`);
  } else {
    // Utiliser la configuration générée (fonctionne en dev et prod)
    app = initializeApp(firebaseConfigGenerated);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log(`✅ Firebase initialisé avec succès (${platform})`);
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Ignorer l'erreur de double initialisation si Firebase est déjà initialisé
  if (errorMessage.includes("already exists") || errorMessage.includes("duplicate-app")) {
    try {
      // Récupérer l'app existante
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0] as FirebaseApp;
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
        console.log(`✅ Firebase réutilisé après erreur de duplication (${platform})`);
      }
    } catch (reuseError) {
      console.error(`❌ Erreur Firebase (${platform}):`, errorMessage);
    }
  } else {
    console.error(`❌ Erreur Firebase (${platform}):`, errorMessage);
  }

  // Sur mobile, ne pas crasher l'app
  if (isCapacitor) {
    console.warn("Mode offline activé pour Capacitor");
  }
}

export { app, db, auth, storage };
const firebaseConfig = { app, db, auth, storage };
export default firebaseConfig;
