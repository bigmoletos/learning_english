/**
 * Routes pour la conversation avec coach IA
 * @version 1.0.0
 * @date 11-11-2025
 */

const express = require("express");
const router = express.Router();
const ollamaService = require("../services/ollamaService");
const logger = require("../utils/logger");
const rateLimit = require("express-rate-limit");

// Rate limiting pour la conversation
const conversationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requêtes par minute
  message: "Trop de requêtes de conversation. Veuillez patienter.",
});

/**
 * POST /api/conversation
 * Conversation avec le coach IA
 */
router.post("/", conversationRateLimiter, async (req, res) => {
  try {
    const { messages, level = "B1", userMessage, errors = [], explanationLevel = 5 } = req.body;

    if (!userMessage || userMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Le message est requis",
      });
    }

    // Vérifier si c'est une demande de traduction
    const translationMatch = userMessage.match(/translate|traduis|traduction/i);
    if (translationMatch) {
      // Extraire le texte à traduire
      const textToTranslate = userMessage.replace(/translate|traduis|traduction|en français|in english/gi, "").trim();
      if (textToTranslate) {
        // Détecter la langue cible
        const targetLang = userMessage.match(/en français|to french|français/i) ? "fr" : "en";
        const sourceLang = targetLang === "fr" ? "en" : "fr";

        const translation = await translateText(textToTranslate, sourceLang, targetLang);
        return res.json({
          success: true,
          message: `Translation: "${translation}"`,
          explanation: `I've translated "${textToTranslate}" to ${targetLang === "en" ? "English" : "French"}.`,
        });
      }
    }

    // Générer une réponse conversationnelle avec Ollama
    if (await ollamaService.isAvailable()) {
      try {
        // Adapter le niveau d'explication selon le slider (0-10)
        const explanationStyle = explanationLevel === 0
          ? "Do NOT provide explanations. Just respond briefly."
          : explanationLevel <= 3
          ? "Provide minimal explanations. Keep responses very short (1-2 sentences)."
          : explanationLevel <= 7
          ? "Provide moderate explanations. Keep responses concise (2-3 sentences)."
          : "Provide detailed explanations with grammar rules, examples, and context. Responses can be longer (3-5 sentences).";

        const systemPrompt = messages?.find((m: any) => m.role === "system")?.content ||
          `You are a friendly and supportive English teacher and conversation coach. Your student is at ${level} level.
- Always respond in English
- Be encouraging and patient
- Correct errors gently and explain them clearly
- ${explanationStyle}
- ALWAYS ask follow-up questions to keep the conversation going - never just correct and stop
- Continue the conversation naturally after corrections
- If the student asks to translate something, provide the translation and explain the grammar
- Engage in a real conversation, don't just correct and end`;

        // Construire le prompt avec l'historique
        let conversationContext = "";
        if (messages && messages.length > 0) {
          conversationContext = messages
            .filter((m: any) => m.role !== "system")
            .slice(-5) // Derniers 5 messages pour le contexte
            .map((m: any) => `${m.role === "user" ? "Student" : "Teacher"}: ${m.content}`)
            .join("\n");
        }

        // Éviter les répétitions en vérifiant les derniers messages
        const recentMessages = messages?.filter((m: any) => m.role === "assistant").slice(-3) || [];
        const isRepetitive = recentMessages.some((m: any) =>
          m.content.toLowerCase().includes("keep going") &&
          m.content.toLowerCase().includes("excellent")
        );

        const prompt = `${systemPrompt}

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}Student: ${userMessage}
${errors.length > 0 ? `\nNote: The student made ${errors.length} error(s). Please correct them gently and explain the mistakes.` : ""}
${isRepetitive ? `\nImportant: Do NOT repeat "keep going" or "excellent" again. Provide a different, more specific response.` : ""}

Teacher:`;

        const response = await ollamaService.generateResponse(prompt, {
          temperature: 0.7,
          max_tokens: 200,
        });

        if (response && response.trim().length > 0) {
          // Générer des corrections si des erreurs sont présentes
          let corrections = [];
          let correctedText = userMessage;
          let explanation = "";

          if (errors.length > 0) {
            corrections = errors;
            // Générer une explication des erreurs
            explanation = `I noticed ${errors.length} error(s) in your sentence. `;
            explanation += errors.map((e) => `"${e.original}" should be "${e.corrected}" (${e.explanation})`).join(". ");
          }

          return res.json({
            success: true,
            message: response.trim(),
            explanation,
            corrections,
            correctedText: errors.length > 0 ? correctedText : undefined,
          });
        } else {
          logger.warn("[Conversation] Ollama a retourné une réponse vide, utilisation du fallback");
        }
      } catch (error) {
        logger.error("[Conversation] Erreur Ollama:", error);
        // Fallback vers réponse basique
      }
    }

    // Réponse basique si Ollama n'est pas disponible ou a échoué
    // Le coach doit TOUJOURS répondre et poser une question pour continuer la conversation
    let response = "";
    if (errors.length > 0) {
      response = `Good effort! I noticed ${errors.length} error(s) in your sentence. `;
      response += errors.map((e) => `"${e.original}" should be "${e.corrected}".`).join(" ");
      response += ` What else would you like to talk about?`;
    } else {
      response = `That's great! Your sentence is correct. What would you like to discuss next?`;
    }

    res.json({
      success: true,
      message: response,
      explanation: errors.length > 0 ? "Try to focus on grammar and sentence structure." : undefined,
      corrections: errors,
    });
  } catch (error) {
    logger.error("[Conversation] Erreur:", error);
    // Toujours retourner une réponse, même en cas d'erreur
    res.json({
      success: true,
      message: "I understand. Let's continue our conversation! What would you like to talk about?",
      explanation: "There was a technical issue, but let's keep practicing!",
      corrections: [],
    });
  }
});

/**
 * Fonction helper pour traduire du texte
 */
async function translateText(text, sourceLang, targetLang) {
  if (await ollamaService.isAvailable()) {
    try {
      const prompt = `Translate the following text from ${sourceLang === "en" ? "English" : "French"} to ${targetLang === "en" ? "English" : "French"}.
Only provide the translation, nothing else.

Text: "${text}"

Translation:`;

      const translation = await ollamaService.generateResponse(prompt, {
        temperature: 0.3,
        max_tokens: 100,
      });

      return translation || text;
    } catch (error) {
      logger.error("[Translation] Erreur:", error);
    }
  }

  // Fallback basique (à améliorer avec un vrai service de traduction)
  return text;
}

module.exports = router;

