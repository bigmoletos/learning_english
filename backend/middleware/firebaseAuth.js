/**
 * Middleware d'authentification Firebase pour le backend
 * Alternative au middleware JWT pour utiliser Firebase Auth
 * @version 1.0.0
 * @date 2025-11-06
 */

const { firebaseAuthMiddleware } = require("../services/firebaseAdmin");

/**
 * Middleware d'authentification Firebase
 * Utilise firebaseAuthMiddleware du service Firebase Admin
 */
const auth = firebaseAuthMiddleware;

/**
 * Middleware pour vérifier les droits administrateur
 * À adapter selon votre logique métier
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié"
      });
    }

    // Récupérer les données utilisateur depuis Firestore
    const { getUserDataFromFirestore } = require("../services/firebaseAdmin");
    const userData = await getUserDataFromFirestore(req.userId);

    if (!userData || userData.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Droits administrateur requis."
      });
    }

    req.userData = userData;
    next();
  } catch (error) {
    console.error("Erreur vérification admin:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification des droits"
    });
  }
};

module.exports = { auth, isAdmin };

