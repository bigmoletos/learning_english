/**
 * Service pour intégrer Ollama (modèle IA local)
 * @version 1.0.0
 * @date 09-11-2025
 *
 * Utilisation :
 * - Ollama local : http://localhost:11434
 * - Via Firebase Functions (optionnel)
 */

const axios = require("axios");
const logger = require("../utils/logger");

class OllamaService {
  constructor() {
    // URL d'Ollama (local par défaut)
    const rawUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    // Validation de l'URL pour prévenir SSRF
    try {
      const parsedUrl = new URL(rawUrl);
      const allowedHosts = ["localhost", "127.0.0.1", "::1"];
      const allowedProtocols = ["http:", "https:"];

      // Vérifier le protocole
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        throw new Error(`Invalid protocol: ${parsedUrl.protocol}. Only http/https allowed.`);
      }

      // Vérifier l'hôte
      if (!allowedHosts.includes(parsedUrl.hostname)) {
        throw new Error(`Invalid host: ${parsedUrl.hostname}. Only localhost/127.0.0.1 allowed.`);
      }

      // Vérifier le port (doit être entre 1024 et 65535)
      const port = parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === "https:" ? 443 : 80);
      if (port < 1024 || port > 65535) {
        throw new Error(`Invalid port: ${port}. Must be between 1024 and 65535.`);
      }

      this.ollamaUrl = parsedUrl.toString().replace(/\/$/, ""); // Remove trailing slash
      logger.info(`[Ollama] Service configured at: ${this.ollamaUrl}`);
    } catch (error) {
      logger.error(`[Ollama] Invalid URL configuration: ${error.message}`);
      this.ollamaUrl = "http://localhost:11434"; // Fallback sûr
      logger.warn(`[Ollama] Falling back to default: ${this.ollamaUrl}`);
    }

    this.enabled = process.env.ENABLE_OLLAMA === "true";
    this.model = process.env.OLLAMA_MODEL || "llama2"; // ou "mistral", "codellama", etc.
  }

  /**
   * Vérifie si Ollama est disponible
   */
  async isAvailable() {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch (error) {
      logger.warn("[Ollama] Service non disponible:", error.message);
      return false;
    }
  }

  /**
   * Analyse une phrase avec Ollama pour détecter les erreurs grammaticales
   */
  async analyzeGrammar(text, level = "B1") {
    if (!(await this.isAvailable())) {
      return null; // Fallback vers l'analyse basique
    }

    const prompt = `You are an English grammar teacher. Analyze this sentence and identify grammar errors.
Provide corrections with explanations. Level: ${level}

Sentence: "${text}"

Respond in JSON format:
{
  "errors": [
    {
      "type": "error_type",
      "original": "incorrect part",
      "corrected": "corrected part",
      "explanation": "brief explanation",
      "severity": "low|medium|high"
    }
  ],
  "correctedSentence": "full corrected sentence",
  "feedback": "overall feedback"
}`;

    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3, // Plus déterministe pour la grammaire
            top_p: 0.9,
          },
        },
        {
          timeout: 10000, // 10 secondes max
        }
      );

      const generatedText = response.data.response;

      // Extraire le JSON de la réponse
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        logger.info("[Ollama] Analyse grammaticale réussie");
        return analysis;
      }

      return null;
    } catch (error) {
      logger.error("[Ollama] Erreur lors de l'analyse:", error.message);
      return null;
    }
  }

  /**
   * Génère des exercices de speaking personnalisés avec Ollama
   */
  async generateExercises(level, focusAreas = [], count = 5) {
    if (!(await this.isAvailable())) {
      return null; // Fallback vers la génération basique
    }

    const focusAreasStr =
      focusAreas.length > 0 ? focusAreas.join(", ") : "general speaking";

    const prompt = `You are an English teacher creating speaking exercises for level ${level}.
Focus areas: ${focusAreasStr}

Create ${count} speaking exercises. Respond in JSON format:
{
  "exercises": [
    {
      "id": "unique_id",
      "level": "${level}",
      "type": "pronunciation|fluency|grammar|vocabulary",
      "title": "Exercise title",
      "prompt": "What the student should say",
      "duration": 30,
      "difficulty": 1-5,
      "focusAreas": ["area1", "area2"]
    }
  ]
}`;

    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7, // Plus créatif pour les exercices
          },
        },
        {
          timeout: 15000,
        }
      );

      const generatedText = response.data.response;
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        logger.info(
          `[Ollama] ${result.exercises?.length || 0} exercices générés`
        );
        return result.exercises || [];
      }

      return null;
    } catch (error) {
      logger.error("[Ollama] Erreur génération exercices:", error.message);
      return null;
    }
  }

  /**
   * Améliore le feedback avec Ollama
   */
  async enhanceFeedback(
    transcript,
    errors,
    scores,
    level
  ) {
    if (!(await this.isAvailable())) {
      return null;
    }

    const prompt = `You are a supportive English teacher. Provide encouraging feedback for a student at ${level} level.

Student said: "${transcript}"
Grammar score: ${scores.grammar}%
Pronunciation score: ${scores.pronunciation}%
Fluency score: ${scores.fluency}%

Errors found: ${errors.length}

Write encouraging feedback (2-3 sentences) that:
1. Acknowledges what they did well
2. Points out 1-2 main areas to improve
3. Motivates them to continue practicing

Feedback:`;

    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.8,
          },
        },
        {
          timeout: 8000,
        }
      );

      const feedback = response.data.response.trim();
      logger.info("[Ollama] Feedback amélioré généré");
      return feedback;
    } catch (error) {
      logger.error("[Ollama] Erreur amélioration feedback:", error.message);
      return null;
    }
  }

  /**
   * Génère une réponse conversationnelle
   */
  async generateResponse(prompt, options = {}) {
    if (!(await this.isAvailable())) {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            max_tokens: options.max_tokens || 200,
          },
        },
        {
          timeout: options.timeout || 15000, // 15 secondes par défaut
        }
      );

      const generatedText = response.data.response?.trim();
      logger.info("[Ollama] Réponse conversationnelle générée");
      return generatedText || null;
    } catch (error) {
      logger.error("[Ollama] Erreur lors de la génération de réponse:", error.message);
      return null;
    }
  }
}

module.exports = new OllamaService();

