/**
 * Service de conversation avec coach IA
 * @version 1.0.0
 * @date 11-11-2025
 *
 * Fonctionnalités :
 * - Conversation bidirectionnelle avec coach IA
 * - Réponses en anglais (écrit et oral)
 * - Correction et explication des erreurs
 * - Traduction français ↔ anglais
 */

import { buildApiUrl } from "./apiConfig";

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  errors?: any[];
  corrections?: string;
}

interface ConversationResponse {
  success: boolean;
  message: string;
  explanation?: string;
  corrections?: any[];
  correctedText?: string;
  error?: string;
}

interface TranslationResponse {
  success: boolean;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  error?: string;
}

class ConversationService {
  private apiEndpoint = buildApiUrl("/api/conversation");
  private translationEndpoint = buildApiUrl("/api/translation");
  private conversationHistory: ConversationMessage[] = [];

  /**
   * Initialise une conversation avec le coach
   */
  initializeConversation(level = "B1"): void {
    this.conversationHistory = [
      {
        role: "system",
        content: `You are a friendly and supportive English teacher and conversation coach. Your student is at ${level} level.
- Always respond in English
- Be encouraging and patient
- Correct errors gently and explain them clearly
- Keep responses concise (2-3 sentences)
- Ask follow-up questions to keep the conversation going
- If the student asks to translate something, provide the translation and explain the grammar`,
        timestamp: Date.now(),
      },
    ];
  }

  /**
   * Envoie un message au coach et reçoit une réponse
   */
  async sendMessage(
    userMessage: string,
    userLevel = "B1",
    errors?: any[],
    explanationLevel = 5
  ): Promise<ConversationResponse> {
    try {
      // Ajouter le message de l'utilisateur à l'historique
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
        errors,
      });

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          level: userLevel,
          userMessage,
          errors: errors || [],
          explanationLevel: explanationLevel || 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la conversation");
      }

      // Ajouter la réponse du coach à l'historique
      this.conversationHistory.push({
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
        corrections: data.corrections,
      });

      return {
        success: true,
        message: data.message,
        explanation: data.explanation,
        corrections: data.corrections,
        correctedText: data.correctedText,
      };
    } catch (error: any) {
      console.error("[ConversationService] Erreur:", error);
      return {
        success: false,
        message: "",
        error: error.message || "Erreur lors de la conversation",
      };
    }
  }

  /**
   * Traduit un texte (français ↔ anglais)
   */
  async translate(
    text: string,
    targetLanguage: "en" | "fr",
    sourceLanguage?: "en" | "fr"
  ): Promise<TranslationResponse> {
    try {
      const response = await fetch(this.translationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLanguage || (targetLanguage === "en" ? "fr" : "en"),
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la traduction");
      }

      return {
        success: true,
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
      };
    } catch (error: any) {
      console.error("[ConversationService] Erreur traduction:", error);
      return {
        success: false,
        translatedText: "",
        sourceLanguage: sourceLanguage || (targetLanguage === "en" ? "fr" : "en"),
        targetLanguage,
        error: error.message || "Erreur lors de la traduction",
      };
    }
  }

  /**
   * Demande une correction détaillée avec explication
   */
  async requestCorrection(
    userText: string,
    errors: any[],
    userLevel = "B1"
  ): Promise<ConversationResponse> {
    const correctionPrompt = `The student said: "${userText}"

Errors found: ${errors.length}
${errors.map((e, i) => `${i + 1}. "${e.original}" → "${e.corrected}" (${e.type})`).join("\n")}

Please:
1. Provide a gentle correction
2. Explain the main errors clearly
3. Give encouragement
4. Suggest how to improve

Keep it concise (3-4 sentences).`;

    return this.sendMessage(correctionPrompt, userLevel, errors);
  }

  /**
   * Réinitialise l'historique de conversation
   */
  resetHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Récupère l'historique de conversation
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }
}

export const conversationService = new ConversationService();

