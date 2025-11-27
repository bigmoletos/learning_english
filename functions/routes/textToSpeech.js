/**
 * Routes pour Text-to-Speech (Google Cloud)
 * @version 1.0.0
 * @date 08-11-2025
 */

const express = require("express");
const router = express.Router();
const textToSpeech = require("@google-cloud/text-to-speech");
const logger = require("../utils/logger");

// Initialiser le client Google Cloud TTS
let ttsClient;

try {
  // Configuration depuis les variables d'environnement
  const config = {};

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Si le chemin vers le fichier de credentials est fourni
    config.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  } else if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
    // Sinon, utiliser les credentials directement depuis les variables d'environnement
    config.credentials = {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
    config.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  ttsClient = new textToSpeech.TextToSpeechClient(config);
  logger.info("Client Google Cloud TTS initialisé avec succès");
} catch (error) {
  logger.error("Erreur initialisation Google Cloud TTS:", error);
  ttsClient = null;
}

/**
 * POST /api/text-to-speech
 * Synthétise du texte en audio
 */
router.post("/", async (req, res) => {
  try {
    if (!ttsClient) {
      return res.status(503).json({
        success: false,
        message: "Service TTS non disponible. Veuillez configurer Google Cloud credentials."
      });
    }

    const { text, languageCode = "en-US", voiceName, speakingRate = 1.0, pitch = 0 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Le texte est requis"
      });
    }

    // Limiter la longueur du texte pour contrôler les coûts
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Le texte est trop long (max 5000 caractères)"
      });
    }

    logger.info(`[TTS] Synthèse demandée: ${text.substring(0, 50)}... (${text.length} chars)`);

    // Configurer la requête TTS
    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName || undefined, // Si null, Google choisit automatiquement
        // Ne pas spécifier ssmlGender si voiceName est fourni (Google le détermine automatiquement)
        ...(voiceName ? {} : { ssmlGender: "FEMALE" }) // Fallback si pas de voiceName
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: Math.max(0.25, Math.min(4.0, speakingRate)), // Limiter entre 0.25 et 4.0
        pitch: Math.max(-20.0, Math.min(20.0, pitch)), // Limiter entre -20 et 20
      },
    };

    // Appeler l'API Google Cloud TTS
    const [response] = await ttsClient.synthesizeSpeech(request);

    // Convertir le buffer audio en base64
    const audioContent = response.audioContent.toString("base64");

    logger.info(`[TTS] Synthèse réussie: ${audioContent.length} bytes`);

    res.json({
      success: true,
      audioContent,
      stats: {
        textLength: text.length,
        audioSize: audioContent.length,
        voice: voiceName || "default",
        languageCode
      }
    });

  } catch (error) {
    logger.error("[TTS] Erreur lors de la synthèse:", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération audio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

/**
 * GET /api/text-to-speech/voices?lang=en-US
 * Liste les voix disponibles pour une langue
 */
router.get("/voices", async (req, res) => {
  try {
    if (!ttsClient) {
      return res.status(503).json({
        success: false,
        message: "Service TTS non disponible"
      });
    }

    const languageCode = req.query.lang || "en-US";

    logger.info(`[TTS] Liste des voix demandée pour: ${languageCode}`);

    // Récupérer toutes les voix
    const [result] = await ttsClient.listVoices({});

    // Filtrer par langue
    const voices = result.voices
      .filter(voice => voice.languageCodes.includes(languageCode))
      .map(voice => ({
        name: voice.name,
        gender: voice.ssmlGender,
        languageCodes: voice.languageCodes,
        naturalSampleRateHertz: voice.naturalSampleRateHertz
      }));

    logger.info(`[TTS] ${voices.length} voix trouvées pour ${languageCode}`);

    res.json({
      success: true,
      voices,
      count: voices.length
    });

  } catch (error) {
    logger.error("[TTS] Erreur récupération des voix:", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voix",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;
