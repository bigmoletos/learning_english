/**
 * Agent IA pour l'analyse des réponses et la progression personnalisée
 * @version 1.0.0
 * @date 31-10-2025
 * @author AI English Trainer
 *
 * Fonctionnalités :
 * - Analyse grammaticale et vocabulaire technique
 * - Détection des faiblesses (grammaire, termes techniques, prononciation)
 * - Suggestions d'exercices ciblés basées sur l'analyse
 * - Système de scoring adaptatif
 */

import { UserResponse, ProgressAnalysis, Exercise, LanguageLevel, UserProfile } from "../types";

// Simple tokenizer for browser (replaces natural.js tokenize)
const tokenize = (text: string): string[] => {
  return text.toLowerCase().match(/\b\w+\b/g) || [];
};

export class ProgressAgent {
  private readonly GRAMMAR_KEYWORDS = [
    "present_perfect", "past_simple", "future_continuous",
    "conditional", "passive_voice", "relative_clauses",
    "prepositions", "articles", "modal_verbs"
  ];

  private readonly TECH_VOCAB = [
    "technical_debt", "memory_leak", "ci_cd", "mlops",
    "rag_system", "gdpr", "ai_act", "angular", "devops",
    "cybersecurity", "vibe_coding", "cursor", "pipeline"
  ];

  /**
   * Analyse une liste de réponses utilisateur et retourne un rapport de progression
   */
  public analyzeProgress(
    responses: UserResponse[],
    exercises: Exercise[],
    userProfile: UserProfile
  ): ProgressAnalysis {
    const grammarScore = this.calculateGrammarScore(responses, exercises);
    const vocabularyScore = this.calculateVocabularyScore(responses, exercises);
    const overallScore = (grammarScore + vocabularyScore) / 2;

    const weakAreas = this.identifyWeakAreas(responses, exercises);
    const strongAreas = this.identifyStrongAreas(responses, exercises);
    const recommendedExercises = this.recommendExercises(weakAreas, userProfile);
    const nextLevel = this.determineNextLevel(overallScore, userProfile.currentLevel);

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      grammarScore: Math.round(grammarScore * 100) / 100,
      vocabularyScore: Math.round(vocabularyScore * 100) / 100,
      weakAreas,
      strongAreas,
      recommendedExercises,
      nextLevel
    };
  }

  /**
   * Calcule le score grammatical basé sur les réponses
   */
  private calculateGrammarScore(responses: UserResponse[], exercises: Exercise[]): number {
    const grammarResponses = responses.filter(r => {
      const exercise = exercises.find(e => e.id === r.exerciseId);
      return exercise?.questions.some(q => q.grammarFocus && q.grammarFocus.length > 0);
    });

    if (grammarResponses.length === 0) return 0;

    const correctCount = grammarResponses.filter(r => r.isCorrect).length;
    return (correctCount / grammarResponses.length) * 100;
  }

  /**
   * Calcule le score de vocabulaire technique
   */
  private calculateVocabularyScore(responses: UserResponse[], exercises: Exercise[]): number {
    const vocabResponses = responses.filter(r => {
      const exercise = exercises.find(e => e.id === r.exerciseId);
      return exercise?.questions.some(q => q.vocabularyFocus && q.vocabularyFocus.length > 0);
    });

    if (vocabResponses.length === 0) return 0;

    const correctCount = vocabResponses.filter(r => r.isCorrect).length;
    return (correctCount / vocabResponses.length) * 100;
  }

  /**
   * Identifie les domaines faibles nécessitant un travail supplémentaire
   */
  private identifyWeakAreas(responses: UserResponse[], exercises: Exercise[]): string[] {
    const weaknessMap = new Map<string, number>();

    responses.forEach(response => {
      if (!response.isCorrect) {
        const exercise = exercises.find(e => e.id === response.exerciseId);
        const question = exercise?.questions.find(q => q.id === response.questionId);

        if (question?.grammarFocus) {
          question.grammarFocus.forEach(focus => {
            weaknessMap.set(focus, (weaknessMap.get(focus) || 0) + 1);
          });
        }

        if (question?.vocabularyFocus) {
          question.vocabularyFocus.forEach(focus => {
            weaknessMap.set(focus, (weaknessMap.get(focus) || 0) + 1);
          });
        }

        if (exercise?.domain) {
          weaknessMap.set(exercise.domain, (weaknessMap.get(exercise.domain) || 0) + 1);
        }
      }
    });

    return Array.from(weaknessMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area]) => area);
  }

  /**
   * Identifie les domaines forts de l'utilisateur
   */
  private identifyStrongAreas(responses: UserResponse[], exercises: Exercise[]): string[] {
    const strengthMap = new Map<string, { correct: number; total: number }>();

    responses.forEach(response => {
      const exercise = exercises.find(e => e.id === response.exerciseId);
      const question = exercise?.questions.find(q => q.id === response.questionId);

      const areas = [
        ...(question?.grammarFocus || []),
        ...(question?.vocabularyFocus || []),
        exercise?.domain
      ].filter(Boolean) as string[];

      areas.forEach(area => {
        const stats = strengthMap.get(area) || { correct: 0, total: 0 };
        stats.total += 1;
        if (response.isCorrect) stats.correct += 1;
        strengthMap.set(area, stats);
      });
    });

    return Array.from(strengthMap.entries())
      .filter(([, stats]) => stats.total >= 3 && (stats.correct / stats.total) >= 0.8)
      .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
      .slice(0, 5)
      .map(([area]) => area);
  }

  /**
   * Recommande des exercices ciblés basés sur les faiblesses identifiées
   */
  private recommendExercises(weakAreas: string[], userProfile: UserProfile): string[] {
    const recommendations: string[] = [];

    weakAreas.forEach(area => {
      if (this.GRAMMAR_KEYWORDS.includes(area)) {
        recommendations.push(`grammar_${area}_${userProfile.currentLevel}`);
      } else if (this.TECH_VOCAB.some(vocab => area.includes(vocab))) {
        recommendations.push(`vocab_${area}_${userProfile.currentLevel}`);
      } else {
        recommendations.push(`mixed_${area}_${userProfile.currentLevel}`);
      }
    });

    return recommendations.slice(0, 3);
  }

  /**
   * Détermine le niveau suivant recommandé basé sur les performances
   */
  private determineNextLevel(score: number, currentLevel: LanguageLevel): LanguageLevel | undefined {
    const levelProgression: LanguageLevel[] = ["A2", "B1", "B2", "C1"];
    const currentIndex = levelProgression.indexOf(currentLevel);

    if (score >= 85 && currentIndex < levelProgression.length - 1) {
      return levelProgression[currentIndex + 1];
    }

    return undefined;
  }

  /**
   * Analyse une réponse écrite et fournit un feedback détaillé
   */
  public analyzeWrittenResponse(
    userAnswer: string,
    expectedAnswer: string,
    grammarFocus: string[]
  ): { score: number; feedback: string; suggestions: string[] } {
    const userTokens = tokenize(userAnswer.toLowerCase());
    const expectedTokens = tokenize(expectedAnswer.toLowerCase());

    const similarity = this.calculateSimilarity(userTokens, expectedTokens);
    const score = Math.max(0, Math.min(100, similarity * 100));

    const feedback = this.generateFeedback(score, grammarFocus);
    const suggestions = this.generateSuggestions(userAnswer, expectedAnswer, grammarFocus);

    return { score, feedback, suggestions };
  }

  /**
   * Calcule la similarité entre deux ensembles de tokens
   */
  private calculateSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Génère un feedback textuel basé sur le score
   */
  private generateFeedback(score: number, grammarFocus: string[]): string {
    if (score >= 90) {
      return "Excellent travail ! Votre réponse démontre une maîtrise solide des concepts.";
    } else if (score >= 75) {
      return `Bonne réponse ! Quelques points à améliorer sur : ${grammarFocus.join(", ")}.`;
    } else if (score >= 60) {
      return `Réponse correcte mais nécessite des améliorations. Concentrez-vous sur : ${grammarFocus.join(", ")}.`;
    } else {
      return `Réponse à retravailler. Revoyez les règles concernant : ${grammarFocus.join(", ")}.`;
    }
  }

  /**
   * Génère des suggestions d'amélioration
   */
  private generateSuggestions(
    userAnswer: string,
    expectedAnswer: string,
    grammarFocus: string[]
  ): string[] {
    const suggestions: string[] = [];

    if (userAnswer.length < expectedAnswer.length * 0.7) {
      suggestions.push("Votre réponse est trop courte. Développez davantage vos arguments.");
    }

    if (!userAnswer.includes(".") && expectedAnswer.includes(".")) {
      suggestions.push("N'oubliez pas la ponctuation pour structurer vos phrases.");
    }

    grammarFocus.forEach(focus => {
      suggestions.push(`Révisez les règles de : ${focus}`);
    });

    return suggestions.slice(0, 3);
  }
}

export const progressAgent = new ProgressAgent();

/**
 * Fonction utilitaire pour analyser la progression utilisateur
 * (wrapper simplifié autour de ProgressAgent)
 */
export const analyzeUserProgress = (responses: UserResponse[]): ProgressAnalysis => {
  if (responses.length === 0) {
    return {
      overallScore: 0,
      grammarScore: 0,
      vocabularyScore: 0,
      weakAreas: [],
      strongAreas: [],
      recommendedExercises: []
    };
  }

  const correctAnswers = responses.filter(r => r.isCorrect).length;
  const overallScore = Math.round((correctAnswers / responses.length) * 100);

  // Analyser les patterns d'erreurs
  const incorrectResponses = responses.filter(r => !r.isCorrect);
  const weakAreas: string[] = [];

  // Détecter les domaines faibles
  if (incorrectResponses.length > responses.length * 0.3) {
    weakAreas.push("Grammaire générale");
  }
  if (incorrectResponses.length > responses.length * 0.4) {
    weakAreas.push("Vocabulaire technique");
  }
  if (incorrectResponses.length > responses.length * 0.5) {
    weakAreas.push("Compréhension globale");
  }

  const strongAreas: string[] = [];
  if (overallScore >= 80) {
    strongAreas.push("Compréhension globale");
  }
  if (overallScore >= 90) {
    strongAreas.push("Maîtrise technique");
  }

  return {
    overallScore,
    grammarScore: overallScore,
    vocabularyScore: overallScore,
    weakAreas,
    strongAreas,
    recommendedExercises: ["qcm_001", "cloze_001"]
  };
};

