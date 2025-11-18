/**
 * Routes administrateur
 * @version 1.0.0
 */

const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const AssessmentResult = require("../models/AssessmentResult");

// Middleware admin pour toutes les routes
router.use(auth, isAdmin);

// Liste des utilisateurs
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] }
    });

    res.status(200).json({
      success: true,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs"
    });
  }
});

// Statistiques globales
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const verifiedUsers = await User.count({ where: { isEmailVerified: true } });
    
    const totalProgress = await UserProgress.count();
    const totalAssessments = await AssessmentResult.count();

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers
        },
        progress: totalProgress,
        assessments: totalAssessments
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul des statistiques"
    });
  }
});

// Désactiver un utilisateur
router.put("/users/:id/deactivate", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Impossible de désactiver un administrateur"
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Utilisateur désactivé"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la désactivation"
    });
  }
});

module.exports = router;

