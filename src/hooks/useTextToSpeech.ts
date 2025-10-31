/**
 * Hook personnalisé pour la synthèse vocale (Text-to-Speech)
 * @version 1.0.0
 * @date 31-10-2025
 */

import { useState, useEffect, useCallback } from "react";

interface Voice {
  name: string;
  lang: string;
  default: boolean;
}

interface UseTextToSpeechReturn {
  speak: (text: string, lang?: string) => void;
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
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0); // Vitesse (0.1 - 10)
  const [pitch, setPitch] = useState(1.0); // Tonalité (0 - 2)
  const [volume, setVolume] = useState(1.0); // Volume (0 - 1)

  useEffect(() => {
    // Vérifier si l'API est supportée
    if ("speechSynthesis" in window) {
      setIsSupported(true);

      // Charger les voix disponibles
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const formattedVoices = availableVoices.map(v => ({
          name: v.name,
          lang: v.lang,
          default: v.default
        }));
        setVoices(formattedVoices);

        // Sélectionner une voix anglaise par défaut
        const englishVoice = availableVoices.find(v => 
          v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Microsoft"))
        ) || availableVoices.find(v => v.lang.startsWith("en-"));

        if (englishVoice) {
          setSelectedVoice(englishVoice);
        }
      };

      // Charger immédiatement
      loadVoices();

      // Recharger quand les voix changent (certains navigateurs chargent de manière asynchrone)
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Écouter les événements de fin de lecture
      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback((text: string, lang: string = "en-US") => {
    if (!isSupported || !text) return;

    // Arrêter toute lecture en cours
    window.speechSynthesis.cancel();

    // Créer une nouvelle utterance (énoncé)
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurer la voix
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Événements
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("Erreur de synthèse vocale:", event);
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
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, rate, pitch, volume]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const setVoice = useCallback((voiceName: string) => {
    const voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
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
    setVolume
  };
};

