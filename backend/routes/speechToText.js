/**
 * Routes pour Speech-to-Text (Google Cloud)
 * @version 1.0.0
 * @date 09-11-2025
 */

const express = require('express');
const router = express.Router();
const speech = require('@google-cloud/speech');
const logger = require('../utils/logger');

// Initialiser le client Google Cloud Speech-to-Text
let sttClient;

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
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    config.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  sttClient = new speech.SpeechClient(config);
  logger.info('Client Google Cloud Speech-to-Text initialisé avec succès');
} catch (error) {
  logger.error('Erreur initialisation Google Cloud Speech-to-Text:', error);
  sttClient = null;
}

/**
 * POST /api/speech-to-text
 * Transcrit de l'audio en texte
 */
router.post('/', async (req, res) => {
  try {
    if (!sttClient) {
      return res.status(503).json({
        success: false,
        message: 'Service STT non disponible. Veuillez configurer Google Cloud credentials.'
      });
    }

    const { audioContent, languageCode = 'en-US', sampleRateHertz = 16000, encoding = 'WEBM_OPUS' } = req.body;

    if (!audioContent) {
      return res.status(400).json({
        success: false,
        message: 'L\'audio est requis'
      });
    }

    logger.info(`[STT] Transcription demandée: ${languageCode}, encoding: ${encoding}`);

    // Configurer la requête STT
    const audio = {
      content: audioContent, // Base64 encoded audio
    };

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
      enableWordConfidence: true,
      model: 'default', // ou 'command_and_search', 'phone_call', 'video', 'default'
      useEnhanced: true,
    };

    const request = {
      audio: audio,
      config: config,
    };

    // Appeler l'API Google Cloud Speech-to-Text
    const [response] = await sttClient.recognize(request);

    if (!response.results || response.results.length === 0) {
      return res.json({
        success: true,
        transcript: '',
        confidence: 0,
        words: [],
        message: 'Aucune parole détectée dans l\'audio'
      });
    }

    // Extraire le meilleur résultat
    const transcription = response.results
      .map(result => result.alternatives[0])
      .filter(alternative => alternative)
      .map(alternative => alternative.transcript)
      .join('\n');

    const confidence = response.results[0]?.alternatives[0]?.confidence || 0;
    const words = response.results[0]?.alternatives[0]?.words || [];

    logger.info(`[STT] Transcription réussie: "${transcription}" (confidence: ${confidence})`);

    res.json({
      success: true,
      transcript: transcription,
      confidence: Math.round(confidence * 100),
      words: words.map(word => ({
        word: word.word,
        startTime: word.startTime?.seconds || 0,
        endTime: word.endTime?.seconds || 0,
        confidence: word.confidence || 0
      })),
      stats: {
        languageCode,
        encoding,
        resultsCount: response.results.length
      }
    });

  } catch (error) {
    logger.error('[STT] Erreur lors de la transcription:', error);

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la transcription audio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/speech-to-text/languages
 * Liste les langues supportées
 */
router.get('/languages', async (req, res) => {
  try {
    // Liste des langues couramment supportées par Google Cloud STT
    const languages = [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'fr-FR', name: 'French' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
    ];

    res.json({
      success: true,
      languages,
      count: languages.length
    });

  } catch (error) {
    logger.error('[STT] Erreur récupération des langues:', error);

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des langues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
