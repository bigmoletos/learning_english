/**
 * Agent IA pour l'analyse et la correction de l'expression orale
 * @version 1.0.0
 * @date 09-11-2025
 * @author AI English Trainer
 *
 * Fonctionnalités :
 * - Analyse de la phrase transcrite
 * - Détection et correction des erreurs grammaticales
 * - Explications précises avec exceptions
 * - Génération d'exercices de speaking personnalisés (A2-C1)
 * - Évaluation de la prononciation et de la fluidité
 */

import { LanguageLevel } from "../types";

export interface SpeakingAnalysis {
  originalTranscript: string;
  correctedSentence?: string;
  errors: GrammarError[];
  score: number;
  fluencyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  feedback: string;
  recommendations: string[];
  suggestedExercises: SpeakingExercise[];
}

export interface GrammarError {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
  exceptions?: string[];
  severity: "low" | "medium" | "high";
  position: { start: number; end: number };
}

export interface SpeakingExercise {
  id: string;
  level: LanguageLevel;
  type: "pronunciation" | "fluency" | "grammar" | "vocabulary";
  title: string;
  prompt: string;
  targetSentence?: string;
  duration: number; // en secondes
  difficulty: number;
  focusAreas: string[];
}

class SpeakingAgent {
  private readonly GRAMMAR_PATTERNS = [
    {
      pattern: /\b(he|she|it)\s+(go|have|do|say)\b/gi,
      correction: (match: string) => {
        const [subject, verb] = match.toLowerCase().split(/\s+/);
        return `${subject} ${this.conjugateThirdPerson(verb)}`;
      },
      type: "subject_verb_agreement",
      explanation: "Avec he/she/it, il faut ajouter -s/-es au verbe au présent simple.",
      exceptions: [
        "Verbes modaux (can, must, should) ne prennent jamais de -s",
        "Verbe \"to be\" : he is, she is, it is",
      ],
    },
    {
      pattern: /\b(I|you|we|they)\s+(goes|has|does|says)\b/gi,
      correction: (match: string) => {
        const [subject, verb] = match.toLowerCase().split(/\s+/);
        return `${subject} ${this.removeThirdPersonS(verb)}`;
      },
      type: "subject_verb_agreement",
      explanation: "Avec I/you/we/they, le verbe ne prend pas de -s au présent simple.",
      exceptions: ["Sauf avec \"have\" qui devient \"have\" pour I/you/we/they"],
    },
    {
      pattern: /\b(a)\s+([aeiou]\w+)\b/gi,
      correction: (match: string) => match.replace(/^a\s+/i, "an "),
      type: "article",
      explanation: "Utilisez \"an\" devant un mot commençant par une voyelle (a, e, i, o, u).",
      exceptions: ["Exception : \"a university\" (son de \"you\"), \"a European\" (son de \"eu\")"],
    },
    {
      pattern: /\b(an)\s+([bcdfghjklmnpqrstvwxyz]\w+)\b/gi,
      correction: (match: string) => match.replace(/^an\s+/i, "a "),
      type: "article",
      explanation: "Utilisez \"a\" devant un mot commençant par une consonne.",
      exceptions: ["Exception : \"an hour\" (h muet), \"an honest person\""],
    },
    {
      pattern: /\bmuch\s+(people|things|cars|books)\b/gi,
      correction: (match: string) => match.replace(/much/i, "many"),
      type: "quantifier",
      explanation:
        "\"Much\" s'utilise avec les noms indénombrables. Pour les noms dénombrables, utilisez \"many\".",
      exceptions: [
        "Much water, much time (indénombrables) vs many cars, many people (dénombrables)",
      ],
    },
    {
      pattern: /\bmany\s+(water|money|information|time)\b/gi,
      correction: (match: string) => match.replace(/many/i, "much"),
      type: "quantifier",
      explanation:
        "\"Many\" s'utilise avec les noms dénombrables. Pour les noms indénombrables, utilisez \"much\".",
      exceptions: [],
    },
    {
      pattern: /\bdidn't\s+(went|had|was|were|did)\b/gi,
      correction: (match: string) => {
        const verb = match.split(/\s+/)[1];
        return `didn't ${this.getBaseForm(verb)}`;
      },
      type: "double_negative",
      explanation: "Après \"didn't\", utilisez la forme de base du verbe (infinitif sans \"to\").",
      exceptions: ["didn't go (pas \"didn't went\")", "didn't have (pas \"didn't had\")"],
    },
    {
      // Détecte les répétitions de mots (ex: "me with me", "the the", "and and")
      pattern: /\b(\w+)\s+(\w+\s+)?\1\b/gi,
      correction: (match: string) => {
        const words = match
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 0);
        if (words.length < 2) return match;
        const repeated = words[0];
        // Retirer la répétition si elle existe
        const filtered = words.filter((w, i) => i === 0 || w !== repeated);
        return filtered.join(" ");
      },
      type: "word_repetition",
      explanation: "Vous avez répété le même mot. Vérifiez votre phrase.",
      exceptions: [],
    },
    {
      pattern: /\b(me|you|him|her|us|them|it)\s+\w+\s+\1\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const pronoun = words[0];
        return words.filter((w, i) => i === 0 || w !== pronoun).join(" ");
      },
      type: "pronoun_repetition",
      explanation: "Vous avez répété le même pronom. Vérifiez votre phrase.",
      exceptions: [],
    },
    {
      pattern: /\b(projek|projec|proj|projeckt)\b/gi,
      correction: () => "project",
      type: "spelling",
      explanation: "L'orthographe correcte est \"project\".",
      exceptions: [],
    },
    {
      pattern: /\b(call|ask|tell|give)\s+(you|he|she|it|they)\s+(update|provide|give|send)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb1 = words[0];
        const verb2 = words[2];
        // Corriger : "call you update" → "call me to update" ou "update me"
        if (verb1 === "call" && verb2 === "update") {
          return "call me to update";
        }
        return `${verb1} me to ${verb2}`;
      },
      type: "sentence_structure",
      explanation:
        "La structure de la phrase est incorrecte. Utilisez \"call me to update\" ou \"update me\".",
      exceptions: [],
    },
    {
      pattern: /\b(call)\s+(provide|give|send|show|update)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[1];
        return `please ${verb}`;
      },
      type: "sentence_structure",
      explanation:
        "La structure est incorrecte. Utilisez \"please [verb]\" ou \"could you please [verb]\".",
      exceptions: [],
    },
    {
      pattern: /\b(can you|could you)\s+(call)\s+(provide|give|send|show|update)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[3]; // Le verbe après "call"
        return `could you please ${verb}`;
      },
      type: "sentence_structure",
      explanation: "La structure est incorrecte. Utilisez \"could you please [verb]\" sans \"call\".",
      exceptions: [],
    },
    {
      pattern: /\b(call)\s+(you)\b/gi,
      correction: () => "call me",
      type: "pronoun_error",
      explanation:
        "Utilisez \"call me\" pour dire que vous allez appeler quelqu'un, ou \"I'll call you\" pour dire que vous allez l'appeler.",
      exceptions: [],
    },
    {
      pattern: /\b(call)\s+(you)\s+\w+/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[2]; // Le verbe après "call you"
        return `call me to ${verb}`;
      },
      type: "sentence_structure",
      explanation:
        "La structure est incorrecte. Utilisez \"call me to [verb]\" ou \"I'll call you to [verb]\".",
      exceptions: [],
    },
    {
      pattern: /\b(provide|give|send|show)\s+with\s+(me|you|him|her|us|them|it)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[0];
        const pronoun = words[2];
        return `${verb} ${pronoun}`;
      },
      type: "preposition_error",
      explanation: "Utilisez \"provide me\" ou \"provide me with\" (pas \"provide with me\").",
      exceptions: [],
    },
    {
      pattern: /\b(provide|give|send|show)\s+(with)\s+(me|you|him|her|us|them|it)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[0];
        const pronoun = words[2];
        return `${verb} ${pronoun}`;
      },
      type: "preposition_error",
      explanation: "L'ordre est incorrect. Utilisez \"provide me\" ou \"provide me with\".",
      exceptions: [],
    },
    {
      pattern:
        /\b(provide|give|send|show)\s+(me|you|him|her|us|them|it)\s+with\s+(me|you|him|her|us|them|it)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[0];
        const pronoun1 = words[1];
        const pronoun2 = words[3]; // "with" est à l'index 2
        // Si les deux pronoms sont identiques, retirer "with [pronoun]"
        if (pronoun1 === pronoun2) {
          return `${verb} ${pronoun1}`;
        }
        return match; // Sinon, ne pas modifier
      },
      type: "redundant_preposition",
      explanation:
        "Vous avez répété le pronom après \"with\". Utilisez simplement \"provide me\" ou \"give me\".",
      exceptions: [],
    },
    {
      pattern:
        /\b(provide|give|send|show)\s+(me|you|him|her|us|them|it)\s+and\s+(a|an|the)\s+\w+/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[0];
        const pronoun = words[1];
        const article = words[3];
        const noun = words.slice(4).join(" ");
        return `${verb} ${pronoun} with ${article} ${noun}`;
      },
      type: "missing_preposition",
      explanation:
        "Il manque \"with\" après le pronom. Utilisez \"provide me with a date\" (pas \"provide me and a date\").",
      exceptions: [],
    },
    {
      pattern: /\b(provide|give|send|show)\s+(me|you|him|her|us|them|it)\s+and\s+\w+/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const verb = words[0];
        const pronoun = words[1];
        const rest = words.slice(3).join(" ");
        return `${verb} ${pronoun} with ${rest}`;
      },
      type: "missing_preposition",
      explanation:
        "Il manque \"with\" après le pronom. Utilisez \"provide me with [something]\" (pas \"provide me and [something]\").",
      exceptions: [],
    },
    {
      // Détecte "when the date" qui devrait être "an update" dans un contexte professionnel
      pattern:
        /\b(with|for|about)\s+(when the date|when a date|when date|the date|a date)\s+(on|about|for)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const preposition1 = words[0];
        const preposition2 = words[words.length - 1];
        return `${preposition1} an update ${preposition2}`;
      },
      type: "word_choice",
      explanation: "Dans un contexte professionnel, utilisez \"an update\" plutôt que \"the date\".",
      exceptions: [],
    },
    {
      // Détecte "weave" qui devrait être "with" ou autre chose
      pattern: /\b(remind|tell|ask)\s+(me|you|him|her|us|them)\s+(weave|wave|waive)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const pronoun = words[1];
        return `please give ${pronoun}`;
      },
      type: "word_recognition",
      explanation: "Il semble y avoir une erreur de reconnaissance vocale. Vérifiez la phrase.",
      exceptions: [],
    },
    {
      // Détecte "on a" quand ça devrait être "on the" dans un contexte professionnel
      pattern:
        /\b(on|about|for)\s+(a)\s+(project|task|work|job|meeting|call|update|progress|status|report)\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const preposition = words[0];
        const noun = words[2];
        return `${preposition} the ${noun}`;
      },
      type: "article_error",
      explanation:
        "Utilisez \"the\" plutôt que \"a\" pour parler d'un projet ou d'une tâche spécifique.",
      exceptions: [],
    },
    {
      // Détecte "on project progress", "about task update", etc. (manque l'article "the")
      pattern:
        /\b(on|about|for)\s+(project|task|work|job|meeting|call|update)\s+(progress|update|status|report|information|details)/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        const preposition = words[0];
        const noun = words[1];
        const rest = words.slice(2).join(" ");
        // Ajouter l'article "the" si manquant
        return `${preposition} the ${noun} ${rest}`;
      },
      type: "missing_article",
      explanation:
        "Il manque l'article \"the\" avant le nom. Utilisez \"on the project progress\" ou \"about the project progress\".",
      exceptions: [],
    },
    {
      pattern: /\b(to|for|with|at|in|on)\s+\1\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        return words[0]; // Garder seulement le premier
      },
      type: "preposition_repetition",
      explanation: "Vous avez répété la même préposition. Vérifiez votre phrase.",
      exceptions: [],
    },
    {
      pattern: /\b(and|or|but)\s+\1\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        return words[0]; // Garder seulement le premier
      },
      type: "conjunction_repetition",
      explanation: "Vous avez répété la même conjonction. Utilisez-la une seule fois.",
      exceptions: [],
    },
    {
      pattern: /\b(the|a|an)\s+\1\b/gi,
      correction: (match: string) => {
        const words = match.toLowerCase().split(/\s+/);
        return words[0]; // Garder seulement le premier
      },
      type: "article_repetition",
      explanation: "Vous avez répété le même article. Utilisez-le une seule fois.",
      exceptions: [],
    },
    {
      pattern: /\b(recieve|recieved|recieving)\b/gi,
      correction: (match: string) =>
        match
          .replace(/recieve/gi, "receive")
          .replace(/recieved/gi, "received")
          .replace(/recieving/gi, "receiving"),
      type: "spelling",
      explanation: "L'orthographe correcte est \"receive\" (i avant e sauf après c).",
      exceptions: [],
    },
    {
      pattern: /\b(seperate|seperated|seperating)\b/gi,
      correction: (match: string) =>
        match
          .replace(/seperate/gi, "separate")
          .replace(/seperated/gi, "separated")
          .replace(/seperating/gi, "separating"),
      type: "spelling",
      explanation: "L'orthographe correcte est \"separate\" (a, pas e).",
      exceptions: [],
    },
    {
      pattern: /\b(definately|definately|definetly)\b/gi,
      correction: () => "definitely",
      type: "spelling",
      explanation: "L'orthographe correcte est \"definitely\".",
      exceptions: [],
    },
    {
      pattern: /\b(accomodate|accomodation)\b/gi,
      correction: (match: string) =>
        match.replace(/accomodate/gi, "accommodate").replace(/accomodation/gi, "accommodation"),
      type: "spelling",
      explanation: "L'orthographe correcte est \"accommodate\" (double m et double c).",
      exceptions: [],
    },
  ];

  /**
   * Analyse une phrase prononcée et retourne un rapport détaillé
   */
  public async analyzeSpeaking(
    transcript: string,
    confidence: number,
    targetLevel: LanguageLevel = "B1",
    _expectedSentence?: string
  ): Promise<SpeakingAnalysis> {
    if (!transcript || transcript.trim().length === 0) {
      return {
        originalTranscript: transcript,
        errors: [],
        score: 0,
        fluencyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        feedback: "Aucune parole détectée. Veuillez réessayer.",
        recommendations: ["Parlez plus fort et plus clairement", "Vérifiez votre microphone"],
        suggestedExercises: [],
      };
    }

    // Détection des erreurs grammaticales
    const errors = this.detectGrammarErrors(transcript);

    // Générer la phrase corrigée
    const correctedSentence = this.generateCorrectedSentence(transcript, errors);

    // Calculer les scores
    const grammarScore = this.calculateGrammarScore(errors, transcript);
    const pronunciationScore = this.calculatePronunciationScore(confidence);
    const fluencyScore = this.calculateFluencyScore(transcript, confidence);
    const overallScore = (grammarScore + pronunciationScore + fluencyScore) / 3;

    // Générer le feedback
    const feedback = this.generateFeedback(overallScore, errors, transcript);

    // Générer des recommandations
    const recommendations = this.generateRecommendations(errors, fluencyScore, pronunciationScore);

    // Proposer des exercices ciblés
    const suggestedExercises = this.generateSpeakingExercises(errors, targetLevel);

    return {
      originalTranscript: transcript,
      correctedSentence: correctedSentence !== transcript ? correctedSentence : undefined,
      errors,
      score: Math.round(overallScore),
      fluencyScore: Math.round(fluencyScore),
      grammarScore: Math.round(grammarScore),
      pronunciationScore: Math.round(pronunciationScore),
      feedback,
      recommendations,
      suggestedExercises,
    };
  }

  /**
   * Détecte les erreurs grammaticales dans la phrase
   */
  private detectGrammarErrors(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    const processedPositions = new Set<string>(); // Pour éviter les doublons

    // Trier les patterns par spécificité (les plus spécifiques en premier)
    const sortedPatterns = [...this.GRAMMAR_PATTERNS].sort((a, b) => {
      const aSpecificity = (a.pattern.toString().match(/\\b/g) || []).length;
      const bSpecificity = (b.pattern.toString().match(/\\b/g) || []).length;
      return bSpecificity - aSpecificity; // Plus spécifique en premier
    });

    sortedPatterns.forEach((pattern) => {
      const regex = new RegExp(pattern.pattern);
      let match;
      const tempText = text;
      let lastIndex = 0;

      // Réinitialiser le regex pour chaque pattern
      regex.lastIndex = 0;

      while ((match = regex.exec(tempText)) !== null) {
        // Éviter les boucles infinies
        if (match.index === lastIndex && match[0].length === 0) {
          break;
        }
        lastIndex = match.index;

        const original = match[0];
        const corrected = pattern.correction(original);
        const positionKey = `${match.index}-${match.index + original.length}`;

        // Vérifier si cette position a déjà été traitée
        if (processedPositions.has(positionKey)) {
          continue;
        }

        if (original.toLowerCase() !== corrected.toLowerCase()) {
          errors.push({
            type: pattern.type,
            original,
            corrected,
            explanation: pattern.explanation,
            exceptions: pattern.exceptions,
            severity: this.determineSeverity(pattern.type),
            position: { start: match.index, end: match.index + original.length },
          });

          // Marquer cette position comme traitée
          processedPositions.add(positionKey);
        }
      }
    });

    return errors;
  }

  /**
   * Génère une phrase corrigée
   */
  private generateCorrectedSentence(text: string, errors: GrammarError[]): string {
    let corrected = text;

    // Trier les erreurs par position (de la fin vers le début pour ne pas décaler les indices)
    const sortedErrors = [...errors].sort((a, b) => b.position.start - a.position.start);

    sortedErrors.forEach((error) => {
      corrected =
        corrected.substring(0, error.position.start) +
        error.corrected +
        corrected.substring(error.position.end);
    });

    return corrected;
  }

  /**
   * Calcule le score grammatical
   */
  private calculateGrammarScore(errors: GrammarError[], text: string): number {
    if (errors.length === 0) return 100;

    const wordCount = text.split(/\s+/).length;
    const severityWeight = {
      high: 20, // Augmenté pour être plus sévère avec les erreurs importantes
      medium: 12, // Augmenté pour les erreurs moyennes
      low: 6, // Augmenté pour les erreurs mineures
    };

    const totalPenalty = errors.reduce((sum, error) => sum + severityWeight[error.severity], 0);
    const errorRate = (totalPenalty / wordCount) * 100;

    // Pénalité supplémentaire pour les erreurs multiples (plus il y a d'erreurs, plus la pénalité est forte)
    const multipleErrorsPenalty = errors.length > 1 ? (errors.length - 1) * 5 : 0;
    const finalPenalty = errorRate + multipleErrorsPenalty;

    return Math.max(0, Math.round(100 - finalPenalty));
  }

  /**
   * Calcule le score de prononciation basé sur la confidence du STT
   */
  private calculatePronunciationScore(confidence: number): number {
    return confidence;
  }

  /**
   * Calcule le score de fluidité
   */
  private calculateFluencyScore(text: string, confidence: number): number {
    const wordCount = text.split(/\s+/).length;

    // Critères de fluidité
    const lengthScore = Math.min(100, (wordCount / 10) * 100); // 10 mots = 100%
    const confidenceScore = confidence;
    const complexityScore = this.calculateComplexity(text);

    return lengthScore * 0.3 + confidenceScore * 0.4 + complexityScore * 0.3;
  }

  /**
   * Calcule la complexité de la phrase
   */
  private calculateComplexity(text: string): number {
    const hasConjunctions = /\b(and|but|or|because|although|however|while)\b/i.test(text);
    const hasComplexVerbs = /\b(have been|has been|will have|would have|could have)\b/i.test(text);
    const hasClauses = (text.match(/,/g) || []).length > 0;

    let score = 50; // Base
    if (hasConjunctions) score += 20;
    if (hasComplexVerbs) score += 20;
    if (hasClauses) score += 10;

    return Math.min(100, score);
  }

  /**
   * Génère un feedback personnalisé
   */
  private generateFeedback(score: number, errors: GrammarError[], text: string): string {
    if (score >= 90) {
      return "Excellent ! Votre expression orale est très claire et grammaticalement correcte. Continuez à ce niveau.";
    } else if (score >= 75) {
      const mainError = errors[0];
      return `Très bien ! Quelques petites améliorations possibles, notamment sur : ${mainError?.type.replace(/_/g, " ")}. ${mainError?.explanation}`;
    } else if (score >= 60) {
      return `Bon effort ! Concentrez-vous sur l"amélioration de ${errors.length} points grammaticaux. Voyez les explications ci-dessous.`;
    } else if (score >= 40) {
      return "Vous progressez. Il y a plusieurs points à améliorer. Pratiquez les exercices suggérés pour renforcer vos bases.";
    } else {
      return "Continuez à pratiquer ! La grammaire de base nécessite plus d'attention. Commencez par les exercices de niveau A2.";
    }
  }

  /**
   * Génère des recommandations personnalisées
   */
  private generateRecommendations(
    errors: GrammarError[],
    fluency: number,
    pronunciation: number
  ): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      const errorTypes = new Set(errors.map((e) => e.type));
      errorTypes.forEach((type) => {
        recommendations.push(`Révisez les règles de : ${type.replace(/_/g, " ")}`);
      });
    }

    if (fluency < 60) {
      recommendations.push("Pratiquez en parlant plus longuement pour améliorer votre fluidité");
    }

    if (pronunciation < 70) {
      recommendations.push("Travaillez votre prononciation en répétant après des locuteurs natifs");
    }

    if (recommendations.length === 0) {
      recommendations.push("Excellent travail ! Essayez des exercices de niveau supérieur");
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Génère des exercices de speaking personnalisés
   */
  private generateSpeakingExercises(
    errors: GrammarError[],
    level: LanguageLevel
  ): SpeakingExercise[] {
    const exercises: SpeakingExercise[] = [];
    const errorTypes = new Set(errors.map((e) => e.type));

    // Exercices basés sur les erreurs détectées
    let exerciseIndex = 0;
    errorTypes.forEach((type) => {
      const exercise = this.createExerciseForErrorType(type, level, exerciseIndex);
      if (exercise) {
        exercises.push(exercise);
        exerciseIndex++;
      }
    });

    // Ajouter des exercices généraux si moins de 3 exercices
    while (exercises.length < 3) {
      exercises.push(this.createGeneralExercise(level, exercises.length));
    }

    return exercises.slice(0, 5);
  }

  /**
   * Crée un exercice pour un type d'erreur spécifique
   */
  private createExerciseForErrorType(
    errorType: string,
    level: LanguageLevel,
    index: number
  ): SpeakingExercise | null {
    const exerciseTemplates: { [key: string]: any } = {
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
          "Énumérez 5 objets dans votre pièce en utilisant \"a\" ou \"an\". Exemple: \"I see an apple and a book.\"",
        focusAreas: ["indefinite articles", "pronunciation"],
      },
      quantifier: {
        type: "grammar",
        title: "Quantificateurs much/many",
        prompt:
          "Décrivez ce que vous avez dans votre cuisine en utilisant \"much\" et \"many\". Exemple: \"I have many apples but not much milk.\"",
        focusAreas: ["countable/uncountable nouns", "quantifiers"],
      },
      double_negative: {
        type: "grammar",
        title: "Négation au passé",
        prompt:
          "Racontez ce que vous n'avez pas fait hier en utilisant \"didn't\". Exemple: \"I didn't go to the gym yesterday.\"",
        focusAreas: ["past simple negative", "base form"],
      },
    };

    const template = exerciseTemplates[errorType];
    if (!template) return null;

    return {
      id: `speaking_${errorType}_${level}_${index}`,
      level,
      type: template.type,
      title: template.title,
      prompt: template.prompt,
      duration: this.getDurationForLevel(level),
      difficulty: this.getDifficultyForLevel(level),
      focusAreas: template.focusAreas,
    };
  }

  /**
   * Crée un exercice général
   */
  private createGeneralExercise(level: LanguageLevel, index: number): SpeakingExercise {
    const generalExercises = [
      {
        type: "fluency" as const,
        title: "Description libre",
        prompt: "Décrivez votre journée idéale en détail. Parlez pendant au moins 30 secondes.",
        focusAreas: ["fluency", "vocabulary", "present simple"],
      },
      {
        type: "pronunciation" as const,
        title: "Prononciation des verbes irréguliers",
        prompt: "Conjuguez ces verbes au passé à voix haute: go, see, eat, take, make",
        focusAreas: ["irregular verbs", "past simple", "pronunciation"],
      },
      {
        type: "vocabulary" as const,
        title: "Vocabulaire technique IT",
        prompt:
          "Expliquez ce qu'est le cloud computing comme si vous parliez à quelqu'un qui ne connaît pas l'informatique.",
        focusAreas: ["technical vocabulary", "explanation skills"],
      },
    ];

    const exercise = generalExercises[index % generalExercises.length];

    return {
      id: `speaking_general_${level}_${index}`,
      level,
      ...exercise,
      duration: this.getDurationForLevel(level),
      difficulty: this.getDifficultyForLevel(level),
    };
  }

  // === Fonctions utilitaires ===

  private conjugateThirdPerson(verb: string): string {
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

  private removeThirdPersonS(verb: string): string {
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

  private getBaseForm(verb: string): string {
    const irregularVerbs: { [key: string]: string } = {
      went: "go",
      had: "have",
      was: "be",
      were: "be",
      did: "do",
    };

    return irregularVerbs[verb.toLowerCase()] || verb;
  }

  private determineSeverity(type: string): "low" | "medium" | "high" {
    const highSeverity = [
      "subject_verb_agreement",
      "double_negative",
      "sentence_structure",
      "pronoun_repetition",
      "word_repetition",
    ];
    const mediumSeverity = ["article", "quantifier", "redundant_preposition", "spelling"];
    const lowSeverity = ["preposition_repetition", "conjunction_repetition", "article_repetition"];

    if (highSeverity.includes(type)) return "high";
    if (mediumSeverity.includes(type)) return "medium";
    if (lowSeverity.includes(type)) return "low";
    return "medium"; // Par défaut
  }

  private getDurationForLevel(level: LanguageLevel): number {
    const durations: { [key in LanguageLevel]: number } = {
      A1: 20,
      A2: 30,
      B1: 45,
      B2: 60,
      C1: 90,
    };
    return durations[level] || 30;
  }

  private getDifficultyForLevel(level: LanguageLevel): number {
    const difficulties: { [key in LanguageLevel]: number } = {
      A1: 1,
      A2: 2,
      B1: 3,
      B2: 4,
      C1: 5,
    };
    return difficulties[level] || 3;
  }
}

export const speakingAgent = new SpeakingAgent();
