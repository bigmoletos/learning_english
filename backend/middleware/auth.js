/**
 * Middleware d'authentification JWT
 * @version 1.0.0
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès refusé. Token manquant."
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trouver l'utilisateur
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé ou inactif"
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    next();

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide"
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré"
      });
    }
    res.status(500).json({
      success: false,
      message: "Erreur d'authentification"
    });
  }
};

const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Accès refusé. Droits administrateur requis."
    });
  }
  next();
};

module.exports = { auth, isAdmin };

