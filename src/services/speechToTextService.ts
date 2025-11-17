/**
 * Service Google Cloud Speech-to-Text
 * @version 1.0.0
 * @date 09-11-2025
 */

import { buildApiUrl } from "./apiConfig";

interface STTOptions {
  audioBlob: Blob;
  lang?: string;
  sampleRate?: number;
  encoding?: string;
}

interface STTResponse {
  success: boolean;
  transcript: string;
  confidence: number;
  words?: Array<{
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
  error?: string;
}

class SpeechToTextService {
  private apiEndpoint = buildApiUrl("/api/speech-to-text"); // Endpoint backend

  /**
   * Convertit un Blob audio en base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Détecte le format audio du Blob
   */
  private detectAudioEncoding(mimeType: string): string {
    if (mimeType.includes("webm")) {
      return "WEBM_OPUS";
    } else if (mimeType.includes("mp3")) {
      return "MP3";
    } else if (mimeType.includes("wav")) {
      return "LINEAR16";
    } else if (mimeType.includes("ogg")) {
      return "OGG_OPUS";
    }
    return "WEBM_OPUS"; // Défaut pour navigateurs modernes
  }

  /**
   * Transcrit l'audio avec Google Cloud STT
   */
  async transcribe(options: STTOptions): Promise<STTResponse> {
    const { audioBlob, lang = "en-US", sampleRate = 48000 } = options;

    console.log("[STT] Transcription demandée avec:", {
      blobSize: audioBlob.size,
      mimeType: audioBlob.type,
      lang,
      sampleRate,
    });

    try {
      // Convertir le blob en base64
      const audioContent = await this.blobToBase64(audioBlob);

      // Détecter l'encodage
      const encoding = this.detectAudioEncoding(audioBlob.type);

      const requestBody = {
        audioContent,
        languageCode: lang,
        sampleRateHertz: sampleRate,
        encoding,
      };

      console.log("[STT] Requête envoyée au backend:", {
        languageCode: lang,
        sampleRateHertz: sampleRate,
        encoding,
        audioSize: audioContent.length,
      });

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `STT API error: ${response.status}`);
      }

      const data = await response.json();

      console.log("[STT] Transcription réussie:", {
        transcript: data.transcript,
        confidence: data.confidence,
      });

      return {
        success: true,
        transcript: data.transcript || "",
        confidence: data.confidence || 0,
        words: data.words || [],
      };
    } catch (error) {
      console.error("[STT] Erreur lors de la transcription:", error);
      return {
        success: false,
        transcript: "",
        confidence: 0,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  /**
   * Liste les langues disponibles
   */
  async getLanguages(): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await fetch(`${this.apiEndpoint}/languages`);
      if (!response.ok) {
        throw new Error(`Languages API error: ${response.status}`);
      }
      const data = await response.json();
      return data.languages || [];
    } catch (error) {
      console.error("[STT] Erreur récupération langues:", error);
      return [];
    }
  }

  /**
   * Enregistre de l'audio depuis le microphone
   * Retourne un Blob audio prêt à être transcrit
   */
  async recordAudio(durationMs?: number): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks: Blob[] = [];

      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm;codecs=opus" });
          stream.getTracks().forEach((track) => track.stop());
          resolve(audioBlob);
        };

        mediaRecorder.onerror = (event) => {
          stream.getTracks().forEach((track) => track.stop());
          reject(event);
        };

        mediaRecorder.start();

        // Arrêter automatiquement après durationMs si spécifié
        if (durationMs) {
          setTimeout(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
            }
          }, durationMs);
        }

        // Exposer une méthode pour arrêter manuellement
        (mediaRecorder as any).stopRecording = () => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        };
      });
    } catch (error) {
      console.error("[STT] Erreur lors de l'enregistrement:", error);
      return null;
    }
  }
}

export const speechToTextService = new SpeechToTextService();
