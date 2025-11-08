/**
 * Hook personnalisé pour la synthèse vocale (Text-to-Speech)
 * Optimisé pour Android mobile
 * @version 2.0.0
 * @date 04-11-2025
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface Voice {
  name: string;
  lang: string;
  default: boolean;
}

interface UseTextToSpeechReturn {
  speak: (text: string, lang?: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: Voice[];
  setVoice: (voiceName: string) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  error: string | null;
}

// Détection Android
const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0); // Vitesse (0.1 - 10)
  const [pitch, setPitch] = useState(1.0); // Tonalité (0 - 2)
  const [volume, setVolume] = useState(1.0); // Volume (0 - 1)
  const [error, setError] = useState<string | null>(() =>
    !isSupported ? "La synthèse vocale n'est pas supportée sur votre appareil." : null
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  useEffect(() => {
    // Vérifier si l'API est supportée
    if (isSupported) {

      // Charger les voix disponibles
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();

        // Sur Android, les voix peuvent prendre du temps à charger
        if (availableVoices.length === 0 && !voicesLoadedRef.current) {
          // Réessayer après un délai
          setTimeout(loadVoices, 100);
          return;
        }

        voicesLoadedRef.current = true;
        const formattedVoices = availableVoices.map(v => ({
          name: v.name,
          lang: v.lang,
          default: v.default
        }));
        setVoices(formattedVoices);

        // Sélectionner une voix anglaise par défaut
        // Sur Android, privilégier les voix locales Google
        let englishVoice = availableVoices.find(v =>
          v.lang.startsWith("en-") && v.localService && v.name.toLowerCase().includes("google")
        );

        if (!englishVoice) {
          englishVoice = availableVoices.find(v =>
            v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Microsoft"))
          );
        }

        if (!englishVoice) {
          englishVoice = availableVoices.find(v => v.lang.startsWith("en-"));
        }

        if (englishVoice) {
          setSelectedVoice(englishVoice);
        } else if (availableVoices.length > 0) {
          // En dernier recours, utiliser la première voix disponible
          setSelectedVoice(availableVoices[0]);
        }
      };

      // Charger immédiatement
      loadVoices();

      // Recharger quand les voix changent (Android charge de manière asynchrone)
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Prévention du bug Android: la synthèse peut s'arrêter après 15 secondes
      if (isAndroid()) {
        // Garder la synthèse active en la démarrant périodiquement
        const keepAlive = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000); // Toutes les 10 secondes

        return () => {
          clearInterval(keepAlive);
          window.speechSynthesis.cancel();
        };
      }

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback(async (text: string, lang = "en-US"): Promise<void> => {
    if (!isSupported || !text) {
      setError("Synthèse vocale non supportée ou texte vide.");
      return;
    }

    // Arrêter toute lecture en cours
    window.speechSynthesis.cancel();

    // Petit délai pour Android pour s'assurer que cancel() est effectif
    if (isAndroid()) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Créer une nouvelle utterance (énoncé)
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configurer la voix
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Sur Android, découper les textes longs en morceaux plus petits
    // Android peut avoir des problèmes avec les textes > 200 caractères
    if (isAndroid() && text.length > 200) {
      // Diviser en phrases
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

      for (let i = 0; i < sentences.length; i++) {
        const sentenceUtterance = new SpeechSynthesisUtterance(sentences[i]);
        sentenceUtterance.voice = selectedVoice;
        sentenceUtterance.lang = lang;
        sentenceUtterance.rate = rate;
        sentenceUtterance.pitch = pitch;
        sentenceUtterance.volume = volume;

        if (i === 0) {
          sentenceUtterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
            setError(null);
          };
        }

        if (i === sentences.length - 1) {
          sentenceUtterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };
        }

        sentenceUtterance.onerror = (event) => {
          console.error("Erreur de synthèse vocale:", event);
          setError(`Erreur de synthèse: ${event.error}`);
          setIsSpeaking(false);
          setIsPaused(false);
        };

        window.speechSynthesis.speak(sentenceUtterance);
      }

      return;
    }

    // Événements
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("Erreur de synthèse vocale:", event);

      // Gestion des erreurs spécifiques
      switch (event.error) {
      case "network":
        setError("Erreur réseau lors de la synthèse vocale.");
        break;
      case "synthesis-failed":
        setError("Échec de la synthèse vocale.");
        break;
      case "audio-busy":
        setError("Audio occupé. Réessayez.");
        break;
      case "not-allowed":
        setError("Permission audio refusée.");
        break;
      default:
        setError(`Erreur: ${event.error}`);
      }

      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    // Lancer la lecture
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error("Error speaking:", err);
      setError("Impossible de lancer la synthèse vocale.");
      setIsSpeaking(false);
    }
  }, [isSupported, selectedVoice, rate, pitch, volume]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setError(null);
    } catch (err) {
      console.error("Error stopping speech:", err);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch (err) {
      console.error("Error pausing speech:", err);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch (err) {
      console.error("Error resuming speech:", err);
    }
  }, [isSupported]);

  const setVoice = useCallback((voiceName: string) => {
    const voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
      setError(null);
    } else {
      setError("Voix non trouvée.");
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    error
  };
};

