/**
 * Routes pour l'agent IA de speaking (analyse, correction, exercices)
 * @version 1.0.0
 * @date 09-11-2025
 */

const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const ollamaService = require("../services/ollamaService");
const rateLimit = require("express-rate-limit");

// Rate limiting pour prévenir les abus
const analyzeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 requêtes par minute
  message: { success: false, message: "Trop de requêtes. Réessayez dans une minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

const exercisesRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // max 20 requêtes par 5 minutes
  message: { success: false, message: "Trop de requêtes d'exercices. Réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Longueur maximale pour prévenir ReDoS
const MAX_TEXT_LENGTH = 1000;

/**
 * POST /api/speaking-agent/analyze
 * Analyse une phrase prononcée et retourne un rapport détaillé
 */
router.post("/analyze", analyzeRateLimiter, async (req, res) => {
  try {
    const {
      transcript,
      confidence = 0,
      targetLevel = "B1",
      expectedSentence,
      userId,
    } = req.body;

    // Protection ReDoS : limiter la longueur du texte
    if (transcript && transcript.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Le texte est trop long (max ${MAX_TEXT_LENGTH} caractères)`,
      });
    }

    if (!transcript || transcript.trim().length === 0) {
      return res.json({
        success: true,
        originalTranscript: transcript,
        errors: [],
        score: 0,
        fluencyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        feedback: "Aucune parole détectée. Veuillez réessayer.",
        recommendations: [
          "Parlez plus fort et plus clairement",
          "Vérifiez votre microphone",
        ],
        suggestedExercises: [],
      });
    }

    // Analyse grammaticale (avec Ollama si disponible, sinon basique)
    let errors = detectGrammarErrors(transcript);
    let correctedSentence = generateCorrectedSentence(transcript, errors);

    // Essayer d'améliorer avec Ollama si disponible
    if (await ollamaService.isAvailable()) {
      try {
        const ollamaAnalysis = await ollamaService.analyzeGrammar(
          transcript,
          targetLevel
        );
        if (ollamaAnalysis && ollamaAnalysis.errors) {
          // Ajouter le champ 'position' aux erreurs Ollama pour assurer la cohérence
          const ollamaErrorsWithPosition = ollamaAnalysis.errors.map((err) => {
            if (!err.position) {
              // Chercher la position de l'erreur dans le texte
              const index = transcript.toLowerCase().indexOf(err.original.toLowerCase());
              return {
                ...err,
                position: {
                  start: index >= 0 ? index : 0,
                  end: index >= 0 ? index + err.original.length : 0,
                },
              };
            }
            return err;
          });

          // Fusionner les erreurs détectées par Ollama avec celles de base
          errors = [...errors, ...ollamaErrorsWithPosition];

          // Régénérer la phrase corrigée avec toutes les erreurs fusionnées
          if (ollamaAnalysis.correctedSentence) {
            correctedSentence = ollamaAnalysis.correctedSentence;
          } else {
            // Régénérer avec les erreurs fusionnées
            correctedSentence = generateCorrectedSentence(transcript, errors);
          }
        }
      } catch (err) {
        logger.warn("[SpeakingAgent] Ollama non disponible, utilisation de l'analyse basique");
      }
    }

    // Calcul des scores
    const grammarScore = calculateGrammarScore(errors, transcript);
    const pronunciationScore = Math.round(confidence * 100);
    const fluencyScore = calculateFluencyScore(transcript, confidence);
    const overallScore = Math.round(
      (grammarScore + pronunciationScore + fluencyScore) / 3
    );

    // Génération du feedback (amélioré avec Ollama si disponible)
    let feedback = generateFeedback(overallScore, errors, transcript);

    if (await ollamaService.isAvailable()) {
      try {
        const enhancedFeedback = await ollamaService.enhanceFeedback(
          transcript,
          errors,
          {
            grammar: grammarScore,
            pronunciation: pronunciationScore,
            fluency: fluencyScore,
          },
          targetLevel
        );
        if (enhancedFeedback) {
          feedback = enhancedFeedback;
        }
      } catch (err) {
        // Utiliser le feedback basique en cas d'erreur
      }
    }

    // Recommandations
    const recommendations = generateRecommendations(
      errors,
      fluencyScore,
      pronunciationScore
    );

    // Exercices suggérés
    const suggestedExercises = generateSpeakingExercises(errors, targetLevel);

    logger.info(`[SpeakingAgent] Analyse réussie pour: "${transcript}"`);

    res.json({
      success: true,
      originalTranscript: transcript,
      correctedSentence:
        correctedSentence !== transcript ? correctedSentence : undefined,
      errors,
      score: overallScore,
      fluencyScore: Math.round(fluencyScore),
      grammarScore: Math.round(grammarScore),
      pronunciationScore: Math.round(pronunciationScore),
      feedback,
      recommendations,
      suggestedExercises,
    });
  } catch (error) {
    logger.error("[SpeakingAgent] Erreur lors de l'analyse:", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'analyse de la phrase",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/speaking-agent/exercises
 * Génère des exercices de speaking personnalisés selon le niveau
 */
router.post("/exercises", exercisesRateLimiter, async (req, res) => {
  try {
    const { level = "B1", focusAreas = [], count = 5 } = req.body;

    let exercises = generateExercisesForLevel(level, focusAreas, count);

    // Améliorer avec Ollama si disponible
    if (await ollamaService.isAvailable()) {
      try {
        const ollamaExercises = await ollamaService.generateExercises(
          level,
          focusAreas,
          count
        );
        if (ollamaExercises && ollamaExercises.length > 0) {
          // Fusionner les exercices Ollama avec ceux de base
          exercises = [...exercises, ...ollamaExercises].slice(0, count);
        }
      } catch (err) {
        logger.warn("[SpeakingAgent] Ollama non disponible pour génération exercices");
      }
    }

    res.json({
      success: true,
      exercises,
      count: exercises.length,
      level,
    });
  } catch (error) {
    logger.error(
      "[SpeakingAgent] Erreur lors de la génération d'exercices:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération d'exercices",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/speaking-agent/correct
 * Corrige une phrase avec explications détaillées
 */
router.post("/correct", async (req, res) => {
  try {
    const { sentence, level = "B1" } = req.body;

    if (!sentence || sentence.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "La phrase est requise",
      });
    }

    const errors = detectGrammarErrors(sentence);
    const correctedSentence = generateCorrectedSentence(sentence, errors);

    res.json({
      success: true,
      original: sentence,
      corrected: correctedSentence,
      errors: errors.map((err) => ({
        type: err.type,
        original: err.original,
        corrected: err.corrected,
        explanation: err.explanation,
        exceptions: err.exceptions,
        severity: err.severity,
      })),
    });
  } catch (error) {
    logger.error("[SpeakingAgent] Erreur lors de la correction:", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la correction",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// === Fonctions utilitaires ===

const GRAMMAR_PATTERNS = [
  {
    pattern: /\b(he|she|it)\s+(go|have|do|say)\b/gi,
    type: "subject_verb_agreement",
    explanation:
      "Avec he/she/it, il faut ajouter -s/-es au verbe au présent simple.",
    exceptions: [
      "Verbes modaux (can, must, should) ne prennent jamais de -s",
      'Verbe "to be" : he is, she is, it is',
    ],
    severity: "high",
  },
  {
    pattern: /\b(I|you|we|they)\s+(goes|has|does|says)\b/gi,
    type: "subject_verb_agreement",
    explanation:
      "Avec I/you/we/they, le verbe ne prend pas de -s au présent simple.",
    exceptions: ['Sauf avec "have" qui devient "have" pour I/you/we/they'],
    severity: "high",
  },
  {
    pattern: /\b(a)\s+([aeiou]\w+)\b/gi,
    type: "article",
    explanation:
      'Utilisez "an" devant un mot commençant par une voyelle (a, e, i, o, u).',
    exceptions: [
      'Exception : "a university" (son de "you"), "a European" (son de "eu")',
    ],
    severity: "medium",
  },
  {
    pattern: /\b(an)\s+([bcdfghjklmnpqrstvwxyz]\w+)\b/gi,
    type: "article",
    explanation: 'Utilisez "a" devant un mot commençant par une consonne.',
    exceptions: ['Exception : "an hour" (h muet), "an honest person"'],
    severity: "medium",
  },
  {
    pattern: /\bmuch\s+(people|things|cars|books)\b/gi,
    type: "quantifier",
    explanation:
      '"Much" s\'utilise avec les noms indénombrables. Pour les noms dénombrables, utilisez "many".',
    exceptions: [
      "Much water, much time (indénombrables) vs many cars, many people (dénombrables)",
    ],
    severity: "medium",
  },
  {
    pattern: /\bdidn't\s+(went|had|was|were|did)\b/gi,
    type: "double_negative",
    explanation:
      'Après "didn\'t", utilisez la forme de base du verbe (infinitif sans "to").',
    exceptions: [
      "didn't go (pas \"didn't went\")",
      "didn't have (pas \"didn't had\")",
    ],
    severity: "high",
  },
];

function detectGrammarErrors(text) {
  const errors = [];

  // Protection ReDoS : limiter la longueur
  if (text.length > MAX_TEXT_LENGTH) {
    logger.warn(`[SpeakingAgent] Text too long for grammar check: ${text.length} chars`);
    text = text.substring(0, MAX_TEXT_LENGTH);
  }

  GRAMMAR_PATTERNS.forEach((pattern) => {
    const regex = new RegExp(pattern.pattern);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      let corrected = original;

      // Corrections spécifiques
      if (pattern.type === "subject_verb_agreement") {
        const parts = original.toLowerCase().split(/\s+/);
        if (parts.length === 2) {
          const [subject, verb] = parts;
          if (["he", "she", "it"].includes(subject)) {
            corrected = `${subject} ${conjugateThirdPerson(verb)}`;
          } else if (["i", "you", "we", "they"].includes(subject)) {
            corrected = `${subject} ${removeThirdPersonS(verb)}`;
          }
        }
      } else if (pattern.type === "article") {
        if (original.toLowerCase().startsWith("a ")) {
          corrected = original.replace(/^a\s+/i, "an ");
        } else if (original.toLowerCase().startsWith("an ")) {
          corrected = original.replace(/^an\s+/i, "a ");
        }
      } else if (pattern.type === "quantifier") {
        // Vérifier si on doit remplacer "much" par "many" ou l'inverse
        if (/much/i.test(original)) {
          corrected = original.replace(/much/i, "many");
        } else if (/many/i.test(original)) {
          corrected = original.replace(/many/i, "much");
        }
      } else if (pattern.type === "double_negative") {
        const verb = original.split(/\s+/)[1];
        corrected = `didn't ${getBaseForm(verb)}`;
      }

      if (original.toLowerCase() !== corrected.toLowerCase()) {
        errors.push({
          type: pattern.type,
          original,
          corrected,
          explanation: pattern.explanation,
          exceptions: pattern.exceptions,
          severity: pattern.severity,
          position: { start: match.index, end: match.index + original.length },
        });
      }
    }
  });

  return errors;
}

function generateCorrectedSentence(text, errors) {
  let corrected = text;
  const sortedErrors = [...errors].sort(
    (a, b) => b.position.start - a.position.start
  );

  sortedErrors.forEach((error) => {
    corrected =
      corrected.substring(0, error.position.start) +
      error.corrected +
      corrected.substring(error.position.end);
  });

  return corrected;
}

function calculateGrammarScore(errors, text) {
  if (errors.length === 0) return 100;

  const wordCount = text.split(/\s+/).length;
  const severityWeight = { high: 15, medium: 10, low: 5 };

  const totalPenalty = errors.reduce(
    (sum, error) => sum + severityWeight[error.severity],
    0
  );
  const errorRate = (totalPenalty / wordCount) * 100;

  return Math.max(0, 100 - errorRate);
}

function calculateFluencyScore(text, confidence) {
  const wordCount = text.split(/\s+/).length;
  const lengthScore = Math.min(100, (wordCount / 10) * 100);
  const confidenceScore = confidence;
  const complexityScore = calculateComplexity(text);

  return lengthScore * 0.3 + confidenceScore * 0.4 + complexityScore * 0.3;
}

function calculateComplexity(text) {
  const hasConjunctions = /\b(and|but|or|because|although|however|while)\b/i.test(
    text
  );
  const hasComplexVerbs = /\b(have been|has been|will have|would have|could have)\b/i.test(
    text
  );
  const hasClauses = (text.match(/,/g) || []).length > 0;

  let score = 50;
  if (hasConjunctions) score += 20;
  if (hasComplexVerbs) score += 20;
  if (hasClauses) score += 10;

  return Math.min(100, score);
}

function generateFeedback(score, errors, text) {
  if (score >= 90) {
    return "Excellent ! Votre expression orale est très claire et grammaticalement correcte. Continuez à ce niveau.";
  } else if (score >= 75) {
    const mainError = errors[0];
    return `Très bien ! Quelques petites améliorations possibles, notamment sur : ${mainError?.type.replace(
      /_/g,
      " "
    )}. ${mainError?.explanation}`;
  } else if (score >= 60) {
    return `Bon effort ! Concentrez-vous sur l'amélioration de ${errors.length} points grammaticaux. Voyez les explications ci-dessous.`;
  } else if (score >= 40) {
    return `Vous progressez. Il y a plusieurs points à améliorer. Pratiquez les exercices suggérés pour renforcer vos bases.`;
  } else {
    return `Continuez à pratiquer ! La grammaire de base nécessite plus d'attention. Commencez par les exercices de niveau A2.`;
  }
}

function generateRecommendations(errors, fluency, pronunciation) {
  const recommendations = [];

  if (errors.length > 0) {
    const errorTypes = new Set(errors.map((e) => e.type));
    errorTypes.forEach((type) => {
      recommendations.push(`Révisez les règles de : ${type.replace(/_/g, " ")}`);
    });
  }

  if (fluency < 60) {
    recommendations.push(
      "Pratiquez en parlant plus longuement pour améliorer votre fluidité"
    );
  }

  if (pronunciation < 70) {
    recommendations.push(
      "Travaillez votre prononciation en répétant après des locuteurs natifs"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Excellent travail ! Essayez des exercices de niveau supérieur"
    );
  }

  return recommendations.slice(0, 5);
}

function generateSpeakingExercises(errors, level) {
  const exercises = [];
  const errorTypes = new Set(errors.map((e) => e.type));

  errorTypes.forEach((type, index) => {
    const exercise = createExerciseForErrorType(type, level, index);
    if (exercise) exercises.push(exercise);
  });

  while (exercises.length < 3) {
    exercises.push(createGeneralExercise(level, exercises.length));
  }

  return exercises.slice(0, 5);
}

function createExerciseForErrorType(errorType, level, index) {
  const templates = {
    subject_verb_agreement: {
      type: "grammar",
      title: "Concordance sujet-verbe",
      prompt:
        "Décrivez votre routine quotidienne en utilisant he/she pour parler d'une personne. Exemple: \"She works from 9 to 5.\"",
      focusAreas: ["third person singular", "present simple"],
    },
    article: {
      type: "grammar",
      title: "Articles a/an",
      prompt:
        'Énumérez 5 objets dans votre pièce en utilisant "a" ou "an". Exemple: "I see an apple and a book."',
      focusAreas: ["indefinite articles", "pronunciation"],
    },
    quantifier: {
      type: "grammar",
      title: "Quantificateurs much/many",
      prompt:
        'Décrivez ce que vous avez dans votre cuisine en utilisant "much" et "many". Exemple: "I have many apples but not much milk."',
      focusAreas: ["countable/uncountable nouns", "quantifiers"],
    },
    double_negative: {
      type: "grammar",
      title: "Négation au passé",
      prompt:
        'Racontez ce que vous n\'avez pas fait hier en utilisant "didn\'t". Exemple: "I didn\'t go to the gym yesterday."',
      focusAreas: ["past simple negative", "base form"],
    },
  };

  const template = templates[errorType];
  if (!template) return null;

  return {
    id: `speaking_${errorType}_${level}_${index}`,
    level,
    type: template.type,
    title: template.title,
    prompt: template.prompt,
    duration: getDurationForLevel(level),
    difficulty: getDifficultyForLevel(level),
    focusAreas: template.focusAreas,
  };
}

function createGeneralExercise(level, index) {
  const exercises = [
    {
      type: "fluency",
      title: "Description libre",
      prompt:
        "Décrivez votre journée idéale en détail. Parlez pendant au moins 30 secondes.",
      focusAreas: ["fluency", "vocabulary", "present simple"],
    },
    {
      type: "pronunciation",
      title: "Prononciation des verbes irréguliers",
      prompt:
        "Conjuguez ces verbes au passé à voix haute: go, see, eat, take, make",
      focusAreas: ["irregular verbs", "past simple", "pronunciation"],
    },
    {
      type: "vocabulary",
      title: "Vocabulaire technique IT",
      prompt:
        "Expliquez ce qu'est le cloud computing comme si vous parliez à quelqu'un qui ne connaît pas l'informatique.",
      focusAreas: ["technical vocabulary", "explanation skills"],
    },
  ];

  const exercise = exercises[index % exercises.length];

  return {
    id: `speaking_general_${level}_${index}`,
    level,
    ...exercise,
    duration: getDurationForLevel(level),
    difficulty: getDifficultyForLevel(level),
  };
}

function generateExercisesForLevel(level, focusAreas, count) {
  const exercises = [];
  const levels = ["A2", "B1", "B2", "C1"];

  for (let i = 0; i < count; i++) {
    exercises.push(createGeneralExercise(level, i));
  }

  return exercises;
}

function getDurationForLevel(level) {
  const durations = { A1: 20, A2: 30, B1: 45, B2: 60, C1: 90 };
  return durations[level] || 30;
}

function getDifficultyForLevel(level) {
  const difficulties = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
  return difficulties[level] || 3;
}

function conjugateThirdPerson(verb) {
  const lowerVerb = verb.toLowerCase();
  if (lowerVerb.endsWith("y") && !/[aeiou]y$/.test(lowerVerb)) {
    return lowerVerb.slice(0, -1) + "ies";
  }
  if (
    lowerVerb.endsWith("s") ||
    lowerVerb.endsWith("sh") ||
    lowerVerb.endsWith("ch") ||
    lowerVerb.endsWith("x") ||
    lowerVerb.endsWith("o")
  ) {
    return lowerVerb + "es";
  }
  return lowerVerb + "s";
}

function removeThirdPersonS(verb) {
  const lowerVerb = verb.toLowerCase();
  if (lowerVerb.endsWith("ies")) {
    return lowerVerb.slice(0, -3) + "y";
  }
  if (lowerVerb.endsWith("es")) {
    return lowerVerb.slice(0, -2);
  }
  if (lowerVerb.endsWith("s")) {
    return lowerVerb.slice(0, -1);
  }
  return lowerVerb;
}

function getBaseForm(verb) {
  const irregularVerbs = {
    went: "go",
    had: "have",
    was: "be",
    were: "be",
    did: "do",
  };

  return irregularVerbs[verb.toLowerCase()] || verb;
}

module.exports = router;

