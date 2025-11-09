/**
 * Hook personnalisé pour la synthèse vocale (Text-to-Speech)
 * Optimisé pour Android mobile avec support Capacitor natif
 * @version 3.0.0
 * @date 08-11-2025
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

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

// Détection Capacitor native
const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // Sur les plateformes natives Capacitor, considérer comme supporté même si l'API n'est pas encore disponible
  const webSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const isSupported = webSupported || isNativePlatform();
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
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    console.log("🔍 [useTextToSpeech] useEffect - Vérification support:", {
      isSupported,
      isNative: isNativePlatform(),
      hasWindow: typeof window !== "undefined",
      hasSpeechSynthesis: typeof window !== "undefined" && "speechSynthesis" in window
    });

    // Vérifier si l'API est supportée
    if (isSupported) {
      const checkWebSupported = typeof window !== "undefined" && "speechSynthesis" in window;
      console.log("🔍 [useTextToSpeech] checkWebSupported:", checkWebSupported);

      // Sur les plateformes natives, attendre que l'API soit disponible
      if (isNativePlatform() && !checkWebSupported) {
        console.log("⏳ [useTextToSpeech] Plateforme native détectée, attente de speechSynthesis...");
        // Attendre que speechSynthesis soit disponible (peut prendre du temps sur Android)
        let attempts = 0;
        const maxAttempts = 50; // 5 secondes max (50 * 100ms)

        const checkSpeechSynthesis = setInterval(() => {
          attempts++;
          const hasAPI = typeof window !== "undefined" && "speechSynthesis" in window;
          console.log(`🔍 [useTextToSpeech] Tentative ${attempts}/${maxAttempts}:`, {
            hasAPI,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A"
          });

          if (hasAPI) {
            console.log("✅ [useTextToSpeech] speechSynthesis maintenant disponible!");
            clearInterval(checkSpeechSynthesis);
            // Recharger les voix une fois que l'API est disponible
            const loadVoices = () => {
              try {
                const availableVoices = window.speechSynthesis.getVoices();
                console.log(`📢 [useTextToSpeech] ${availableVoices.length} voix disponibles`);

                if (availableVoices.length > 0) {
                  voicesLoadedRef.current = true;
                  const formattedVoices = availableVoices.map(v => ({
                    name: v.name,
                    lang: v.lang,
                    default: v.default
                  }));
                  setVoices(formattedVoices);

                  // Sélectionner une voix anglaise par défaut
                  let englishVoice = availableVoices.find(v =>
                    v.lang.startsWith("en-") && v.localService && v.name.toLowerCase().includes("google")
                  );
                  if (!englishVoice) {
                    englishVoice = availableVoices.find(v => v.lang.startsWith("en-"));
                  }
                  if (englishVoice) {
                    console.log("✅ [useTextToSpeech] Voix anglaise sélectionnée:", englishVoice.name);
                    setSelectedVoice(englishVoice);
                    selectedVoiceRef.current = englishVoice;
                  } else if (availableVoices.length > 0) {
                    console.log("⚠️ [useTextToSpeech] Utilisation de la première voix disponible:", availableVoices[0].name);
                    setSelectedVoice(availableVoices[0]);
                    selectedVoiceRef.current = availableVoices[0];
                  }
                } else {
                  console.warn("⚠️ [useTextToSpeech] Aucune voix disponible");
                }
              } catch (err) {
                console.error("❌ [useTextToSpeech] Erreur lors du chargement des voix:", err);
              }
            };
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged) {
              window.speechSynthesis.onvoiceschanged = loadVoices;
            }
          } else if (attempts >= maxAttempts) {
            console.error("❌ [useTextToSpeech] speechSynthesis non disponible après", maxAttempts, "tentatives");
            clearInterval(checkSpeechSynthesis);
            setError("La synthèse vocale n'est pas disponible sur cet appareil Android.");
          }
        }, 100);

        return () => {
          clearInterval(checkSpeechSynthesis);
        };
      }

      // Charger les voix disponibles (pour les plateformes web ou natives avec API disponible)
      const loadVoices = () => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          console.warn("⚠️ [useTextToSpeech] loadVoices: speechSynthesis non disponible");
          return;
        }

        try {
          const availableVoices = window.speechSynthesis.getVoices();
          console.log(`📢 [useTextToSpeech] loadVoices: ${availableVoices.length} voix trouvées`);

          // Sur Android, les voix peuvent prendre du temps à charger
          if (availableVoices.length === 0 && !voicesLoadedRef.current) {
            console.log("⏳ [useTextToSpeech] Aucune voix encore, réessai dans 100ms...");
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
          console.log("✅ [useTextToSpeech] Voix chargées:", formattedVoices.length);
          setVoices(formattedVoices);

          // Sélectionner la meilleure voix anglaise native
          // Priorité 1: Voix US/UK natives locales (Chrome, Edge)
          let englishVoice = availableVoices.find(v =>
            (v.lang === "en-US" || v.lang === "en-GB") &&
            v.localService &&
            !v.name.toLowerCase().includes("french") &&
            (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural"))
          );

          // Priorité 2: Voix US/UK locales (sans restriction de fournisseur)
          if (!englishVoice) {
            englishVoice = availableVoices.find(v =>
              (v.lang === "en-US" || v.lang === "en-GB") &&
              v.localService &&
              !v.name.toLowerCase().includes("french")
            );
          }

          // Priorité 3: Toute voix anglaise native (US/UK/AU)
          if (!englishVoice) {
            englishVoice = availableVoices.find(v =>
              v.lang.startsWith("en-") &&
              v.localService &&
              !v.name.toLowerCase().includes("french")
            );
          }

          // Priorité 4: Voix anglaise en ligne de qualité (Google/Microsoft)
          if (!englishVoice) {
            englishVoice = availableVoices.find(v =>
              v.lang.startsWith("en-") &&
              !v.name.toLowerCase().includes("french") &&
              (v.name.includes("Google") || v.name.includes("Microsoft"))
            );
          }

          // Priorité 5: N'importe quelle voix anglaise
          if (!englishVoice) {
            englishVoice = availableVoices.find(v =>
              v.lang.startsWith("en-") &&
              !v.name.toLowerCase().includes("french")
            );
          }

          if (englishVoice) {
            console.log("✅ [useTextToSpeech] Voix anglaise sélectionnée:", englishVoice.name, englishVoice.lang, "Local:", englishVoice.localService);
            setSelectedVoice(englishVoice);
            selectedVoiceRef.current = englishVoice;
          } else if (availableVoices.length > 0) {
            // En dernier recours, utiliser la première voix disponible
            console.log("⚠️ [useTextToSpeech] Utilisation de la première voix disponible:", availableVoices[0].name);
            setSelectedVoice(availableVoices[0]);
            selectedVoiceRef.current = availableVoices[0];
          }
        } catch (err) {
          console.error("❌ [useTextToSpeech] Erreur dans loadVoices:", err);
        }
      };

      // Charger immédiatement
      console.log("🔄 [useTextToSpeech] Chargement initial des voix...");
      loadVoices();

      // Recharger quand les voix changent (Android charge de manière asynchrone)
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log("🔄 [useTextToSpeech] onvoiceschanged déclenché");
          loadVoices();
        };
      }

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
    console.log("🔊 [useTextToSpeech] Début speak:", {
      text: text.substring(0, 50) + "...",
      lang,
      isSupported,
      isNative: isNativePlatform(),
      hasWindow: typeof window !== "undefined",
      hasSpeechSynthesis: typeof window !== "undefined" && "speechSynthesis" in window
    });

    if (!isSupported || !text) {
      const errorMsg = !isSupported ? "Synthèse vocale non supportée." : "Texte vide.";
      console.error("❌ [useTextToSpeech]", errorMsg);
      setError(errorMsg);
      return;
    }

    // Sur les plateformes natives, utiliser le plugin Capacitor
    if (isNativePlatform()) {
      console.log("📱 [useTextToSpeech] Utilisation du plugin Capacitor natif");
      try {
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);

        await TextToSpeech.speak({
          text: text,
          lang: lang,
          rate: rate,
          pitch: pitch,
          volume: volume,
          category: "ambient"
        });

        console.log("✅ [useTextToSpeech] Synthèse vocale native terminée");
        setIsSpeaking(false);
        setIsPaused(false);
      } catch (err: any) {
        console.error("❌ [useTextToSpeech] Erreur synthèse native:", err);
        setError(`Erreur de synthèse vocale: ${err.message || "Inconnue"}`);
        setIsSpeaking(false);
        setIsPaused(false);
      }
      return;
    }

    // Vérifier que speechSynthesis est disponible avant d'utiliser
    // Sur Android WebView, l'API peut nécessiter plusieurs tentatives ou une interaction utilisateur
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("⚠️ [useTextToSpeech] speechSynthesis non disponible immédiatement");

      // Sur les plateformes natives, essayer plusieurs fois avec des délais progressifs
      if (isNativePlatform()) {
        console.log("⏳ [useTextToSpeech] Tentative d'activation de l'API sur plateforme native...");

        // Essayer plusieurs fois avec des délais progressifs (jusqu'à 3 secondes)
        let attempts = 0;
        const maxAttempts = 6; // 6 tentatives : 100ms, 200ms, 300ms, 500ms, 1000ms, 2000ms
        const delays = [100, 200, 300, 500, 1000, 2000];

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delays[attempts]));
          attempts++;

          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            console.log(`✅ [useTextToSpeech] speechSynthesis disponible après ${attempts} tentative(s)`);
            break;
          }

          console.log(`⏳ [useTextToSpeech] Tentative ${attempts}/${maxAttempts}...`);
        }

        // Vérification finale
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          console.error("❌ [useTextToSpeech] speechSynthesis toujours non disponible après toutes les tentatives");
          setError("La synthèse vocale n'est pas disponible sur cet appareil Android. L'API peut nécessiter une mise à jour du système ou n'est pas supportée par votre version d'Android.");
          return;
        }
      } else {
        console.error("❌ [useTextToSpeech] Synthèse vocale non supportée sur cette plateforme");
        setError("Synthèse vocale non supportée sur cette plateforme.");
        return;
      }
    }

    // Vérification supplémentaire : s'assurer que l'objet speechSynthesis est fonctionnel
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        // Tester si getVoices() fonctionne (indicateur que l'API est vraiment disponible)
        const testVoices = window.speechSynthesis.getVoices();
        console.log(`✅ [useTextToSpeech] API fonctionnelle, ${testVoices.length} voix disponible(s)`);
      }
    } catch (err) {
      console.warn("⚠️ [useTextToSpeech] Erreur lors du test de l'API:", err);
      // Continuer quand même, l'API peut fonctionner malgré cette erreur
    }

    console.log("🛑 [useTextToSpeech] Arrêt de toute lecture en cours...");
    // Arrêter toute lecture en cours
    try {
      window.speechSynthesis.cancel();
      console.log("✅ [useTextToSpeech] Lecture précédente annulée");
    } catch (err) {
      console.warn("⚠️ [useTextToSpeech] Erreur lors de l'annulation:", err);
    }

    // Petit délai pour Android pour s'assurer que cancel() est effectif
    if (isAndroid()) {
      console.log("⏳ [useTextToSpeech] Délai Android (50ms)...");
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log("📝 [useTextToSpeech] Création de l'utterance...");
    // Créer une nouvelle utterance (énoncé)
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    console.log("✅ [useTextToSpeech] Utterance créée");

    // Configurer la voix - utiliser la ref pour avoir la dernière valeur
    const voiceToUse = selectedVoiceRef.current;
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      console.log("🎤 [useTextToSpeech] Voix utilisée:", voiceToUse.name, voiceToUse.lang);
    } else {
      console.warn("⚠️ [useTextToSpeech] Aucune voix spécifique sélectionnée, utilisation de la voix par défaut");
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
        sentenceUtterance.voice = selectedVoiceRef.current;
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
      console.error("❌ [useTextToSpeech] Erreur de synthèse vocale:", {
        error: event.error,
        type: event.type,
        charIndex: (event as any).charIndex,
        charLength: (event as any).charLength,
        utterance: {
          text: utterance.text.substring(0, 50),
          lang: utterance.lang,
          voice: utterance.voice?.name
        }
      });

      // Gestion des erreurs spécifiques
      let errorMessage = "Erreur de synthèse vocale.";
      switch (event.error) {
      case "network":
        errorMessage = "Erreur réseau lors de la synthèse vocale.";
        break;
      case "synthesis-failed":
        errorMessage = "Échec de la synthèse vocale. Vérifiez que les voix sont installées sur votre appareil.";
        break;
      case "audio-busy":
        errorMessage = "Audio occupé. Réessayez.";
        break;
      case "not-allowed":
        errorMessage = "Permission audio refusée. Vérifiez les paramètres de l'application.";
        break;
      case "interrupted":
        errorMessage = "Synthèse vocale interrompue.";
        break;
      case "canceled":
        errorMessage = "Synthèse vocale annulée.";
        break;
      default:
        errorMessage = `Erreur: ${event.error}`;
      }

      console.error("❌ [useTextToSpeech] Message d'erreur:", errorMessage);
      setError(errorMessage);
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
      console.log("🎤 [useTextToSpeech] Lancement de la synthèse vocale...", {
        textLength: text.length,
        lang: utterance.lang,
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume,
        voiceName: utterance.voice?.name || "défaut"
      });

      window.speechSynthesis.speak(utterance);
      console.log("✅ [useTextToSpeech] speak() appelé avec succès");

      // Vérifier après un court délai si la lecture a vraiment démarré
      setTimeout(() => {
        const currentlySpeaking = window.speechSynthesis.speaking;
        if (currentlySpeaking) {
          console.log("✅ [useTextToSpeech] La lecture a démarré (vérification différée)");
          setIsSpeaking(true);
        } else {
          console.warn("⚠️ [useTextToSpeech] La lecture ne semble pas avoir démarré");
        }
      }, 100);
    } catch (err: any) {
      console.error("❌ [useTextToSpeech] Erreur lors du lancement:", {
        error: err,
        message: err.message,
        stack: err.stack
      });
      setError("Impossible de lancer la synthèse vocale.");
      setIsSpeaking(false);
    }
  }, [isSupported, rate, pitch, volume]); // Retiré selectedVoice car on utilise la ref

  const stop = useCallback(async () => {
    if (!isSupported) return;
    try {
      if (isNativePlatform()) {
        await TextToSpeech.stop();
        console.log("✅ [useTextToSpeech] Stop natif");
      } else {
        window.speechSynthesis.cancel();
      }
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
      if (!isNativePlatform()) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else {
        console.warn("⚠️ [useTextToSpeech] Pause non supportée sur le plugin natif");
      }
    } catch (err) {
      console.error("Error pausing speech:", err);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      if (!isNativePlatform()) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        console.warn("⚠️ [useTextToSpeech] Resume non supporté sur le plugin natif");
      }
    } catch (err) {
      console.error("Error resuming speech:", err);
    }
  }, [isSupported]);

  const setVoice = useCallback((voiceName: string) => {
    console.log("🎤 [useTextToSpeech] setVoice appelé avec:", voiceName);

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.error("❌ [useTextToSpeech] speechSynthesis non disponible");
      setError("Synthèse vocale non disponible.");
      return;
    }

    const availableVoices = window.speechSynthesis.getVoices();
    console.log("📢 [useTextToSpeech] Voix disponibles:", availableVoices.length);

    const voice = availableVoices.find(v => v.name === voiceName);
    if (voice) {
      console.log("✅ [useTextToSpeech] Voix trouvée et sélectionnée:", voice.name, voice.lang);
      setSelectedVoice(voice);
      selectedVoiceRef.current = voice; // Mettre à jour la ref pour la closure
      setError(null);
    } else {
      console.error("❌ [useTextToSpeech] Voix non trouvée:", voiceName);
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

