/**
 * Service Firebase Admin SDK pour le backend
 * Permet d'accéder aux mêmes données que le frontend
 * @version 1.0.0
 * @date 2025-11-06
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let initialized = false;

/**
 * Initialiser Firebase Admin SDK
 */
function initializeFirebaseAdmin() {
  if (initialized) {
    return { admin, db: admin.firestore(), auth: admin.auth() };
  }

  try {
    // Chercher le fichier de credentials
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(__dirname, "../config/firebase-service-account.json");

    if (!fs.existsSync(serviceAccountPath)) {
      console.warn("⚠️ Fichier de credentials Firebase Admin non trouvé.");
      console.warn("   Le backend fonctionnera en mode dégradé (sans Firebase).");
      console.warn(`   Chemin attendu : ${serviceAccountPath}`);
      return null;
    }

    const serviceAccount = require(serviceAccountPath);

    // Initialiser Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
    });

    initialized = true;
    console.log("✅ Firebase Admin SDK initialisé avec succès");

    return {
      admin,
      db: admin.firestore(),
      auth: admin.auth()
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation Firebase Admin:", error);
    return null;
  }
}

/**
 * Vérifier un token Firebase ID
 * @param {string} idToken - Token Firebase ID
 * @returns {Promise<Object>} - Données décodées du token
 */
async function verifyIdToken(idToken) {
  try {
    const { auth } = initializeFirebaseAdmin();
    if (!auth) {
      throw new Error("Firebase Admin non initialisé");
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Erreur vérification token:", error);
    throw new Error("Token invalide ou expiré");
  }
}

/**
 * Obtenir un utilisateur par son UID
 * @param {string} uid - UID Firebase
 * @returns {Promise<Object>} - Données utilisateur
 */
async function getUserByUid(uid) {
  try {
    const { auth } = initializeFirebaseAdmin();
    if (!auth) {
      throw new Error("Firebase Admin non initialisé");
    }

    const userRecord = await auth.getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime
    };
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    throw error;
  }
}

/**
 * Obtenir les données utilisateur depuis Firestore
 * @param {string} userId - ID utilisateur
 * @returns {Promise<Object|null>} - Données utilisateur
 */
async function getUserDataFromFirestore(userId) {
  try {
    const { db } = initializeFirebaseAdmin();
    if (!db) {
      throw new Error("Firebase Admin non initialisé");
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data();
  } catch (error) {
    console.error("Erreur récupération données Firestore:", error);
    throw error;
  }
}

/**
 * Sauvegarder les données utilisateur dans Firestore
 * @param {string} userId - ID utilisateur
 * @param {Object} userData - Données utilisateur
 * @returns {Promise<void>}
 */
async function saveUserDataToFirestore(userId, userData) {
  try {
    const { db } = initializeFirebaseAdmin();
    if (!db) {
      throw new Error("Firebase Admin non initialisé");
    }

    await db.collection("users").doc(userId).set(userData, { merge: true });
  } catch (error) {
    console.error("Erreur sauvegarde données Firestore:", error);
    throw error;
  }
}

/**
 * Obtenir la progression utilisateur depuis Firestore
 * @param {string} userId - ID utilisateur
 * @returns {Promise<Array>} - Liste des progressions
 */
async function getUserProgressFromFirestore(userId) {
  try {
    const { db } = initializeFirebaseAdmin();
    if (!db) {
      throw new Error("Firebase Admin non initialisé");
    }

    const progressSnapshot = await db
      .collection("progress")
      .where("userId", "==", userId)
      .get();

    return progressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération progression Firestore:", error);
    throw error;
  }
}

/**
 * Middleware Express pour vérifier l'authentification Firebase
 */
function firebaseAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token d'authentification manquant"
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      req.userId = decodedToken.uid;
      next();
    })
    .catch((error) => {
      return res.status(401).json({
        success: false,
        message: "Token invalide ou expiré",
        error: error.message
      });
    });
}

// Initialiser au chargement du module
const firebaseServices = initializeFirebaseAdmin();

module.exports = {
  initializeFirebaseAdmin,
  verifyIdToken,
  getUserByUid,
  getUserDataFromFirestore,
  saveUserDataToFirestore,
  getUserProgressFromFirestore,
  firebaseAuthMiddleware,
  ...(firebaseServices || {})
};

