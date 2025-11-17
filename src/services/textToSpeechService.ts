/**
 * Service Google Cloud Text-to-Speech
 * @version 1.0.0
 * @date 08-11-2025
 */

interface TTSOptions {
  text: string;
  lang?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
}

import { buildApiUrl } from "./apiConfig";

interface CachedAudio {
  url: string;
  timestamp: number;
}

// Cache in memory (survit au rafraîchissement de la page via localStorage)
const CACHE_KEY_PREFIX = "tts_cache_";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

class TextToSpeechService {
  private apiEndpoint = buildApiUrl("/api/text-to-speech");

  /**
   * Génère une clé de cache unique pour le texte et les options
   */
  private getCacheKey(text: string, lang: string, voice?: string): string {
    const key = `${text}_${lang}_${voice || "default"}`;
    return CACHE_KEY_PREFIX + btoa(key).substring(0, 50);
  }

  /**
   * Récupère l'audio depuis le cache
   */
  private getCachedAudio(cacheKey: string): string | null {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const data: CachedAudio = JSON.parse(cached);

      // Vérifier si le cache est encore valide
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data.url;
    } catch (err) {
      console.error("[TTS] Erreur lecture cache:", err);
      return null;
    }
  }

  /**
   * Stocke l'audio dans le cache
   */
  private setCachedAudio(cacheKey: string, audioUrl: string): void {
    try {
      const data: CachedAudio = {
        url: audioUrl,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.error("[TTS] Erreur écriture cache:", err);
      // Si localStorage est plein, on continue sans cache
    }
  }

  /**
   * Nettoie les anciens fichiers du cache
   */
  public cleanCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedAudio = JSON.parse(cached);
            if (now - data.timestamp > CACHE_DURATION) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (err) {
      console.error("[TTS] Erreur nettoyage cache:", err);
    }
  }

  /**
   * Génère l'audio avec Google Cloud TTS
   * Retourne null si le service n'est pas disponible
   */
  async synthesize(options: TTSOptions): Promise<string | null> {
    const { text, lang = "en-US", voice, rate = 1.0, pitch = 0 } = options;

    // Vérifier le cache d'abord
    const cacheKey = this.getCacheKey(text, lang, voice);
    const cachedUrl = this.getCachedAudio(cacheKey);

    if (cachedUrl) {
      console.log("[TTS] Audio trouvé dans le cache");
      return cachedUrl;
    }

    console.log("[TTS] Appel à Google Cloud TTS avec:", {
      textLength: text.length,
      lang,
      voice: voice || "défaut (sélection automatique)",
      rate,
      pitch
    });

    try {
      const requestBody = {
        text,
        languageCode: lang,
        voiceName: voice,
        speakingRate: rate,
        pitch,
      };
      console.log("[TTS] Requête envoyée au backend:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `TTS API error: ${response.status}`;

        // Si le service n'est pas disponible (503), retourner null au lieu de throw
        if (response.status === 503) {
          console.warn("[TTS] Service TTS non disponible:", errorMessage);
          return null;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // L'API retourne l'audio en base64
      const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;

      // Mettre en cache
      this.setCachedAudio(cacheKey, audioUrl);

      console.log("[TTS] Audio généré avec succès");
      return audioUrl;
    } catch (error: any) {
      console.error("[TTS] Erreur lors de la génération:", error);
      // Si c'est une erreur 503, retourner null au lieu de throw
      if (error.message && error.message.includes("503")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Liste les voix disponibles pour une langue
   */
  async getVoices(languageCode = "en-US"): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/voices?lang=${languageCode}`);
      if (!response.ok) {
        throw new Error(`Voices API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("[TTS] Erreur récupération voix:", error);
      return [];
    }
  }
}

export const textToSpeechService = new TextToSpeechService();

// Nettoyer le cache au démarrage
textToSpeechService.cleanCache();
