/**
 * Routes utilisateurs
 * @version 1.0.0
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");

// Profil utilisateur
router.get("/me", auth, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil"
    });
  }
});

// Mettre à jour le profil
router.put("/me", auth, async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ["firstName", "lastName", "currentLevel", "targetLevel"];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await req.user.update(updates);

    res.status(200).json({
      success: true,
      message: "Profil mis à jour",
      user: req.user.toJSON()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    });
  }
});

module.exports = router;

