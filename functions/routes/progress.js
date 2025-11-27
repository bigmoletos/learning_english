/**
 * Routes progression
 * @version 1.0.0
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const UserProgress = require("../models/UserProgress");

// Sauvegarder la progression
router.post("/", auth, async (req, res) => {
  try {
    const {
      exerciseId,
      exerciseType,
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      score,
      level,
      domain
    } = req.body;

    const progress = await UserProgress.create({
      userId: req.userId,
      exerciseId,
      exerciseType,
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      score,
      level,
      domain
    });

    res.status(201).json({
      success: true,
      message: "Progression sauvegardée",
      progress
    });

  } catch (error) {
    console.error("Erreur sauvegarde progression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la sauvegarde"
    });
  }
});

// Récupérer la progression
router.get("/", auth, async (req, res) => {
  try {
    const progress = await UserProgress.findAll({
      where: { userId: req.userId },
      order: [["completedAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      count: progress.length,
      progress
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération"
    });
  }
});

// Statistiques
router.get("/stats", auth, async (req, res) => {
  try {
    const { Op, fn, col } = require("sequelize");
    
    const totalExercises = await UserProgress.count({
      where: { userId: req.userId },
      distinct: true,
      col: "exerciseId"
    });

    const correctAnswers = await UserProgress.count({
      where: {
        userId: req.userId,
        isCorrect: true
      }
    });

    const totalAnswers = await UserProgress.count({
      where: { userId: req.userId }
    });

    const averageScore = totalAnswers > 0 
      ? Math.round((correctAnswers / totalAnswers) * 100)
      : 0;

    const totalTime = await UserProgress.sum("timeSpent", {
      where: { userId: req.userId }
    }) || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalExercises,
        correctAnswers,
        totalAnswers,
        averageScore,
        totalTime
      }
    });

  } catch (error) {
    console.error("Erreur stats:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul des statistiques"
    });
  }
});

module.exports = router;

