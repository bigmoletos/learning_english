/**
 * Routes pour la traduction
 * @version 1.0.0
 * @date 11-11-2025
 */

const express = require("express");
const router = express.Router();
const ollamaService = require("../services/ollamaService");
const logger = require("../utils/logger");
const rateLimit = require("express-rate-limit");

// Rate limiting pour la traduction
const translationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 traductions par minute
  message: "Trop de requêtes de traduction. Veuillez patienter.",
});

/**
 * POST /api/translation
 * Traduit un texte (français ↔ anglais)
 */
router.post("/", translationRateLimiter, async (req, res) => {
  try {
    const { text, sourceLanguage = "en", targetLanguage = "en" } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Le texte à traduire est requis",
      });
    }

    if (sourceLanguage === targetLanguage) {
      return res.status(400).json({
        success: false,
        error: "Les langues source et cible doivent être différentes",
      });
    }

    // Traduire avec Ollama si disponible
    if (await ollamaService.isAvailable()) {
      try {
        const prompt = `Translate the following text from ${sourceLanguage === "en" ? "English" : "French"} to ${targetLanguage === "en" ? "English" : "French"}.
Only provide the translation, nothing else. Do not add explanations or comments.

Text: "${text}"

Translation:`;

        const translation = await ollamaService.generateResponse(prompt, {
          temperature: 0.3,
          max_tokens: 200,
        });

        if (translation) {
          return res.json({
            success: true,
            translatedText: translation.trim(),
            sourceLanguage,
            targetLanguage,
          });
        }
      } catch (error) {
        logger.error("[Translation] Erreur Ollama:", error);
      }
    }

    // Fallback basique (à améliorer)
    res.json({
      success: true,
      translatedText: text, // Pour l'instant, retourne le texte original
      sourceLanguage,
      targetLanguage,
    });
  } catch (error: any) {
    logger.error("[Translation] Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de la traduction",
    });
  }
});

module.exports = router;

