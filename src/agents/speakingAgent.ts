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
  severity: 'low' | 'medium' | 'high';
  position: { start: number; end: number };
}

export interface SpeakingExercise {
  id: string;
  level: LanguageLevel;
  type: 'pronunciation' | 'fluency' | 'grammar' | 'vocabulary';
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
      type: 'subject_verb_agreement',
      explanation: 'Avec he/she/it, il faut ajouter -s/-es au verbe au présent simple.',
      exceptions: ['Verbes modaux (can, must, should) ne prennent jamais de -s', 'Verbe "to be" : he is, she is, it is']
    },
    {
      pattern: /\b(I|you|we|they)\s+(goes|has|does|says)\b/gi,
      correction: (match: string) => {
        const [subject, verb] = match.toLowerCase().split(/\s+/);
        return `${subject} ${this.removeThirdPersonS(verb)}`;
      },
      type: 'subject_verb_agreement',
      explanation: 'Avec I/you/we/they, le verbe ne prend pas de -s au présent simple.',
      exceptions: ['Sauf avec "have" qui devient "have" pour I/you/we/they']
    },
    {
      pattern: /\b(a)\s+([aeiou]\w+)\b/gi,
      correction: (match: string) => match.replace(/^a\s+/i, 'an '),
      type: 'article',
      explanation: 'Utilisez "an" devant un mot commençant par une voyelle (a, e, i, o, u).',
      exceptions: ['Exception : "a university" (son de "you"), "a European" (son de "eu")']
    },
    {
      pattern: /\b(an)\s+([bcdfghjklmnpqrstvwxyz]\w+)\b/gi,
      correction: (match: string) => match.replace(/^an\s+/i, 'a '),
      type: 'article',
      explanation: 'Utilisez "a" devant un mot commençant par une consonne.',
      exceptions: ['Exception : "an hour" (h muet), "an honest person"']
    },
    {
      pattern: /\bmuch\s+(people|things|cars|books)\b/gi,
      correction: (match: string) => match.replace(/much/i, 'many'),
      type: 'quantifier',
      explanation: '"Much" s\'utilise avec les noms indénombrables. Pour les noms dénombrables, utilisez "many".',
      exceptions: ['Much water, much time (indénombrables) vs many cars, many people (dénombrables)']
    },
    {
      pattern: /\bmany\s+(water|money|information|time)\b/gi,
      correction: (match: string) => match.replace(/many/i, 'much'),
      type: 'quantifier',
      explanation: '"Many" s\'utilise avec les noms dénombrables. Pour les noms indénombrables, utilisez "much".',
      exceptions: []
    },
    {
      pattern: /\bdidn't\s+(went|had|was|were|did)\b/gi,
      correction: (match: string) => {
        const verb = match.split(/\s+/)[1];
        return `didn't ${this.getBaseForm(verb)}`;
      },
      type: 'double_negative',
      explanation: 'Après "didn\'t", utilisez la forme de base du verbe (infinitif sans "to").',
      exceptions: ['didn\'t go (pas "didn\'t went")', 'didn\'t have (pas "didn\'t had")']
    }
  ];

  /**
   * Analyse une phrase prononcée et retourne un rapport détaillé
   */
  public async analyzeSpeaking(
    transcript: string,
    confidence: number,
    targetLevel: LanguageLevel = "B1",
    expectedSentence?: string
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
        suggestedExercises: []
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
      suggestedExercises
    };
  }

  /**
   * Détecte les erreurs grammaticales dans la phrase
   */
  private detectGrammarErrors(text: string): GrammarError[] {
    const errors: GrammarError[] = [];

    this.GRAMMAR_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.pattern);
      let match;
      const tempText = text;

      while ((match = regex.exec(tempText)) !== null) {
        const original = match[0];
        const corrected = pattern.correction(original);

        if (original.toLowerCase() !== corrected.toLowerCase()) {
          errors.push({
            type: pattern.type,
            original,
            corrected,
            explanation: pattern.explanation,
            exceptions: pattern.exceptions,
            severity: this.determineSeverity(pattern.type),
            position: { start: match.index, end: match.index + original.length }
          });
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

    sortedErrors.forEach(error => {
      corrected = corrected.substring(0, error.position.start) +
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
      high: 15,
      medium: 10,
      low: 5
    };

    const totalPenalty = errors.reduce((sum, error) => sum + severityWeight[error.severity], 0);
    const errorRate = (totalPenalty / wordCount) * 100;

    return Math.max(0, 100 - errorRate);
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

    return (lengthScore * 0.3 + confidenceScore * 0.4 + complexityScore * 0.3);
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
      return `Très bien ! Quelques petites améliorations possibles, notamment sur : ${mainError?.type.replace(/_/g, ' ')}. ${mainError?.explanation}`;
    } else if (score >= 60) {
      return `Bon effort ! Concentrez-vous sur l'amélioration de ${errors.length} points grammaticaux. Voyez les explications ci-dessous.`;
    } else if (score >= 40) {
      return `Vous progressez. Il y a plusieurs points à améliorer. Pratiquez les exercices suggérés pour renforcer vos bases.`;
    } else {
      return `Continuez à pratiquer ! La grammaire de base nécessite plus d'attention. Commencez par les exercices de niveau A2.`;
    }
  }

  /**
   * Génère des recommandations personnalisées
   */
  private generateRecommendations(errors: GrammarError[], fluency: number, pronunciation: number): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      const errorTypes = new Set(errors.map(e => e.type));
      errorTypes.forEach(type => {
        recommendations.push(`Révisez les règles de : ${type.replace(/_/g, ' ')}`);
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
  private generateSpeakingExercises(errors: GrammarError[], level: LanguageLevel): SpeakingExercise[] {
    const exercises: SpeakingExercise[] = [];
    const errorTypes = new Set(errors.map(e => e.type));

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
  private createExerciseForErrorType(errorType: string, level: LanguageLevel, index: number): SpeakingExercise | null {
    const exerciseTemplates: { [key: string]: any } = {
      subject_verb_agreement: {
        type: 'grammar',
        title: 'Concordance sujet-verbe',
        prompt: 'Décrivez votre routine quotidienne en utilisant he/she pour parler d\'une personne. Exemple: "She works from 9 to 5."',
        focusAreas: ['third person singular', 'present simple']
      },
      article: {
        type: 'grammar',
        title: 'Articles a/an',
        prompt: 'Énumérez 5 objets dans votre pièce en utilisant "a" ou "an". Exemple: "I see an apple and a book."',
        focusAreas: ['indefinite articles', 'pronunciation']
      },
      quantifier: {
        type: 'grammar',
        title: 'Quantificateurs much/many',
        prompt: 'Décrivez ce que vous avez dans votre cuisine en utilisant "much" et "many". Exemple: "I have many apples but not much milk."',
        focusAreas: ['countable/uncountable nouns', 'quantifiers']
      },
      double_negative: {
        type: 'grammar',
        title: 'Négation au passé',
        prompt: 'Racontez ce que vous n\'avez pas fait hier en utilisant "didn\'t". Exemple: "I didn\'t go to the gym yesterday."',
        focusAreas: ['past simple negative', 'base form']
      }
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
      focusAreas: template.focusAreas
    };
  }

  /**
   * Crée un exercice général
   */
  private createGeneralExercise(level: LanguageLevel, index: number): SpeakingExercise {
    const generalExercises = [
      {
        type: 'fluency' as const,
        title: 'Description libre',
        prompt: 'Décrivez votre journée idéale en détail. Parlez pendant au moins 30 secondes.',
        focusAreas: ['fluency', 'vocabulary', 'present simple']
      },
      {
        type: 'pronunciation' as const,
        title: 'Prononciation des verbes irréguliers',
        prompt: 'Conjuguez ces verbes au passé à voix haute: go, see, eat, take, make',
        focusAreas: ['irregular verbs', 'past simple', 'pronunciation']
      },
      {
        type: 'vocabulary' as const,
        title: 'Vocabulaire technique IT',
        prompt: 'Expliquez ce qu\'est le cloud computing comme si vous parliez à quelqu\'un qui ne connaît pas l\'informatique.',
        focusAreas: ['technical vocabulary', 'explanation skills']
      }
    ];

    const exercise = generalExercises[index % generalExercises.length];

    return {
      id: `speaking_general_${level}_${index}`,
      level,
      ...exercise,
      duration: this.getDurationForLevel(level),
      difficulty: this.getDifficultyForLevel(level)
    };
  }

  // === Fonctions utilitaires ===

  private conjugateThirdPerson(verb: string): string {
    const lowerVerb = verb.toLowerCase();
    if (lowerVerb.endsWith('y') && !/[aeiou]y$/.test(lowerVerb)) {
      return lowerVerb.slice(0, -1) + 'ies';
    }
    if (lowerVerb.endsWith('s') || lowerVerb.endsWith('sh') || lowerVerb.endsWith('ch') ||
        lowerVerb.endsWith('x') || lowerVerb.endsWith('o')) {
      return lowerVerb + 'es';
    }
    return lowerVerb + 's';
  }

  private removeThirdPersonS(verb: string): string {
    const lowerVerb = verb.toLowerCase();
    if (lowerVerb.endsWith('ies')) {
      return lowerVerb.slice(0, -3) + 'y';
    }
    if (lowerVerb.endsWith('es')) {
      return lowerVerb.slice(0, -2);
    }
    if (lowerVerb.endsWith('s')) {
      return lowerVerb.slice(0, -1);
    }
    return lowerVerb;
  }

  private getBaseForm(verb: string): string {
    const irregularVerbs: { [key: string]: string } = {
      'went': 'go',
      'had': 'have',
      'was': 'be',
      'were': 'be',
      'did': 'do'
    };

    return irregularVerbs[verb.toLowerCase()] || verb;
  }

  private determineSeverity(type: string): 'low' | 'medium' | 'high' {
    const highSeverity = ['subject_verb_agreement', 'double_negative'];
    const mediumSeverity = ['article', 'quantifier'];

    if (highSeverity.includes(type)) return 'high';
    if (mediumSeverity.includes(type)) return 'medium';
    return 'low';
  }

  private getDurationForLevel(level: LanguageLevel): number {
    const durations: { [key in LanguageLevel]: number } = {
      'A1': 20,
      'A2': 30,
      'B1': 45,
      'B2': 60,
      'C1': 90
    };
    return durations[level] || 30;
  }

  private getDifficultyForLevel(level: LanguageLevel): number {
    const difficulties: { [key in LanguageLevel]: number } = {
      'A1': 1,
      'A2': 2,
      'B1': 3,
      'B2': 4,
      'C1': 5
    };
    return difficulties[level] || 3;
  }
}

export const speakingAgent = new SpeakingAgent();
