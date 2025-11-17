/**
 * Hook pour utiliser Google Cloud Text-to-Speech avec fallback Web Speech API
 * @version 1.0.0
 * @date 08-11-2025
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { textToSpeechService } from "../services/textToSpeechService";
import { Capacitor } from "@capacitor/core";

interface UseGoogleTTSReturn {
  speak: (text: string, lang?: string, voice?: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  isGoogleTTSAvailable: boolean;
}

/**
 * Mappe un nom de voix Google Cloud TTS vers une voix du navigateur disponible
 * @param googleVoiceName Nom de la voix Google Cloud TTS (ex: "en-US-Neural2-F")
 * @param lang Code langue (ex: "en-US")
 * @returns Voix du navigateur correspondante ou null
 */
const mapGoogleVoiceToBrowserVoice = (
  googleVoiceName: string,
  lang: string
): SpeechSynthesisVoice | null => {
  if (!("speechSynthesis" in window)) {
    return null;
  }

  // S'assurer que les voix sont chargées
  let voices = window.speechSynthesis.getVoices();

  // Si aucune voix n'est disponible, réessayer plusieurs fois rapidement
  // (les voix peuvent être chargées de manière asynchrone)
  if (voices.length === 0) {
    console.log("[GoogleTTS] Aucune voix encore chargée, réessai...");
    // Réessayer jusqu'à 5 fois rapidement
    for (let i = 0; i < 5; i++) {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        break;
      }
      // Petit délai non-bloquant
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Attendre 10ms
      }
    }
  }

  if (voices.length === 0) {
    console.warn("[GoogleTTS] Aucune voix disponible dans le navigateur après attente");
    return null;
  }

  console.log(`[GoogleTTS] ${voices.length} voix disponibles dans le navigateur`);
  console.log("[GoogleTTS] Liste complète des voix:", voices.map(v => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService
  })));

  // Extraire le genre et la région du nom de voix Google
  // Format: "en-US-Neural2-F" ou "en-GB-Neural2-A"
  // Les lettres indiquent le genre : F, A, C = Female; D, B, I = Male
  const isFemale = googleVoiceName.endsWith("-F") ||
                   googleVoiceName.endsWith("-A") ||
                   googleVoiceName.endsWith("-C") ||
                   googleVoiceName.includes("-F") ||
                   googleVoiceName.includes("-A") ||
                   googleVoiceName.includes("-C");
  const isMale = googleVoiceName.endsWith("-D") ||
                 googleVoiceName.endsWith("-B") ||
                 googleVoiceName.endsWith("-I") ||
                 googleVoiceName.includes("-D") ||
                 googleVoiceName.includes("-B") ||
                 googleVoiceName.includes("-I");

  const isUS = googleVoiceName.includes("en-US") || lang.startsWith("en-US");
  const isGB = googleVoiceName.includes("en-GB") || lang.startsWith("en-GB");

  console.log("[GoogleTTS] Mapping voix:", {
    googleVoiceName,
    lang,
    isFemale,
    isMale,
    isUS,
    isGB,
    availableVoices: voices.length
  });

  // Priorité 1: Chercher une voix correspondant exactement à la langue et au genre
  let selectedVoice: SpeechSynthesisVoice | null = null;

  if (isUS) {
    // Chercher une voix US
    const usVoices = voices.filter(v =>
      v.lang.startsWith("en-US") &&
      !v.name.toLowerCase().includes("french")
    );

    console.log("[GoogleTTS] Voix US disponibles:", usVoices.map(v => v.name));

    if (isFemale) {
      // Chercher une voix féminine US - ordre de priorité
      // 1. Voix avec "female" dans le nom
      selectedVoice = usVoices.find(v => v.name.toLowerCase().includes("female")) ?? null;

      // 2. Voix spécifiques connues comme féminines
      if (!selectedVoice) {
        selectedVoice = usVoices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("susan") ||
          v.name.toLowerCase().includes("michelle") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("karen") ||
          v.name.toLowerCase().includes("linda")
        ) ?? null;
      }

      // 3. Éviter les voix masculines connues
      if (!selectedVoice) {
        const femaleCandidates = usVoices.filter(v =>
          !v.name.toLowerCase().includes("male") &&
          !v.name.toLowerCase().includes("david") &&
          !v.name.toLowerCase().includes("mark") &&
          !v.name.toLowerCase().includes("alex") &&
          !v.name.toLowerCase().includes("daniel")
        );
        if (femaleCandidates.length > 0) {
          // Prendre la première voix qui n'est pas explicitement masculine
          selectedVoice = femaleCandidates[0];
        }
      }

      // 4. Si plusieurs voix disponibles, utiliser une stratégie d'alternance basée sur le nom de la voix Google
      if (!selectedVoice && usVoices.length > 1) {
        // Extraire un index du nom de la voix Google pour alterner entre les voix disponibles
        // Utiliser plusieurs caractères pour avoir une meilleure distribution
        const hash = googleVoiceName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const voiceIndex = hash % usVoices.length;
        selectedVoice = usVoices[voiceIndex];
        console.log("[GoogleTTS] Sélection par index alternatif (féminin):", {
          googleVoice: googleVoiceName,
          hash,
          index: voiceIndex,
          totalVoices: usVoices.length,
          selectedVoice: selectedVoice.name,
          allVoices: usVoices.map(v => v.name)
        });
      } else if (!selectedVoice && usVoices.length === 1) {
        // Si une seule voix, l'utiliser mais essayer de varier le pitch/rate selon le genre
        selectedVoice = usVoices[0];
        console.log("[GoogleTTS] Une seule voix disponible (féminin):", selectedVoice.name);
      }
    } else if (isMale) {
      // Chercher une voix masculine US - ordre de priorité
      // 1. Voix avec "male" dans le nom
      selectedVoice = usVoices.find(v => v.name.toLowerCase().includes("male")) ?? null;

      // 2. Voix spécifiques connues comme masculines
      if (!selectedVoice) {
        selectedVoice = usVoices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("alex") ||
          v.name.toLowerCase().includes("daniel")
        ) ?? null;
      }

      // 3. Si plusieurs voix disponibles, utiliser une stratégie d'alternance basée sur le nom de la voix Google
      if (!selectedVoice && usVoices.length > 1) {
        // Extraire un index du nom de la voix Google pour alterner entre les voix disponibles
        // Utiliser plusieurs caractères pour avoir une meilleure distribution
        const hash = googleVoiceName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const voiceIndex = hash % usVoices.length;
        selectedVoice = usVoices[voiceIndex];
        console.log("[GoogleTTS] Sélection par index alternatif (masculin):", {
          googleVoice: googleVoiceName,
          hash,
          index: voiceIndex,
          totalVoices: usVoices.length,
          selectedVoice: selectedVoice.name,
          allVoices: usVoices.map(v => v.name)
        });
      } else if (!selectedVoice && usVoices.length === 1) {
        // Si une seule voix, l'utiliser mais essayer de varier le pitch/rate selon le genre
        selectedVoice = usVoices[0];
        console.log("[GoogleTTS] Une seule voix disponible (masculin):", selectedVoice.name);
      }
    }

    // Si pas trouvé, prendre la première voix US
    if (!selectedVoice && usVoices.length > 0) {
      selectedVoice = usVoices[0];
    }
  } else if (isGB) {
    // Chercher une voix GB
    const gbVoices = voices.filter(v =>
      v.lang.startsWith("en-GB") &&
      !v.name.toLowerCase().includes("french")
    );

    if (isFemale) {
      // Chercher une voix féminine GB
      selectedVoice = gbVoices.find(v =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("hazel") ||
        v.name.toLowerCase().includes("susan") ||
        v.name.toLowerCase().includes("kate")
      ) ?? gbVoices.find(v =>
        !v.name.toLowerCase().includes("male") &&
        !v.name.toLowerCase().includes("george")
      ) ?? null;
    } else if (isMale) {
      // Chercher une voix masculine GB
      selectedVoice = gbVoices.find(v =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("george") ||
        v.name.toLowerCase().includes("daniel")
      ) ?? gbVoices.find(v => v.name.toLowerCase().includes("male")) ?? null;
    }

    // Si pas trouvé, prendre la première voix GB
    if (!selectedVoice && gbVoices.length > 0) {
      selectedVoice = gbVoices[0];
    }
  }

  // Priorité 2: Si pas trouvé, chercher n'importe quelle voix anglaise
  if (!selectedVoice) {
    const englishVoices = voices.filter(v =>
      v.lang.startsWith("en-") &&
      !v.name.toLowerCase().includes("french")
    );

    if (englishVoices.length > 0) {
      selectedVoice = englishVoices[0];
    }
  }

  if (selectedVoice) {
    console.log("[GoogleTTS] Voix mappée trouvée:", {
      googleVoice: googleVoiceName,
      browserVoice: selectedVoice.name,
      lang: selectedVoice.lang
    });
  } else {
    console.warn("[GoogleTTS] Aucune voix correspondante trouvée pour:", googleVoiceName);
  }

  return selectedVoice;
};

export const useGoogleTTS = (): UseGoogleTTSReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleTTSAvailable, setIsGoogleTTSAvailable] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Vérifier si Google TTS est disponible au montage
  useEffect(() => {
    const checkGoogleTTS = async () => {
      try {
        // Test simple en appelant l'endpoint (utiliser URL relative comme le service)
        const response = await fetch("/api/text-to-speech/voices?lang=en-US");
        const contentType = response.headers.get("content-type");
        const isAvailable: boolean = response.ok && contentType !== null && contentType.includes("application/json");
        setIsGoogleTTSAvailable(isAvailable);

        if (!isAvailable) {
          console.warn("[GoogleTTS] Service non disponible, fallback vers Web Speech API", {
            status: response.status,
            contentType: response.headers.get("content-type"),
            url: response.url
          });
          console.log("[GoogleTTS] Note: Les voix seront différenciées par pitch et rate même sans Google Cloud TTS");
        } else {
          console.log("[GoogleTTS] Google Cloud TTS disponible");
        }
      } catch (err: any) {
        console.warn("[GoogleTTS] Impossible de contacter le backend, fallback vers Web Speech API", err.message);
        console.log("[GoogleTTS] Note: Les voix seront différenciées par pitch et rate même sans Google Cloud TTS");
        setIsGoogleTTSAvailable(false);
      }
    };

    // Sur les plateformes natives, toujours utiliser Web Speech API (ou plugin natif)
    if (!Capacitor.isNativePlatform()) {
      checkGoogleTTS();
    } else {
      setIsGoogleTTSAvailable(false);
    }
  }, []);

  const speak = useCallback(async (text: string, lang = "en-US", voice?: string) => {
    console.log("🔊 [GoogleTTS] speak() appelé:", {
      text: text.substring(0, 50),
      lang,
      voice: voice || "non spécifiée",
      isGoogleTTSAvailable,
      voiceType: voice ? (voice.includes("Neural2") ? "Google Cloud TTS" : "Browser Voice") : "undefined"
    });

    if (!text) {
      setError("Texte vide");
      return;
    }

    // Arrêter toute lecture en cours
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Petit délai pour s'assurer que cancel() est effectif avant de démarrer une nouvelle lecture
    await new Promise(resolve => setTimeout(resolve, 50));

    setError(null);
    setIsLoading(true);

    try {
      if (isGoogleTTSAvailable) {
        // Essayer Google Cloud TTS
        console.log("[GoogleTTS] Utilisation de Google Cloud TTS avec voix:", voice || "défaut");
        const audioUrl = await textToSpeechService.synthesize({
          text,
          lang,
          voice,
          rate: 1.0,
          pitch: 0
        });

        // Vérifier si le service TTS est disponible
        if (!audioUrl) {
          console.warn("[GoogleTTS] Service TTS non disponible, audio ignoré");
          setIsLoading(false);
          return;
        }

        console.log("[GoogleTTS] Audio généré avec succès, URL:", audioUrl.substring(0, 50) + "...");

        // Créer et jouer l'audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onloadeddata = () => {
          console.log("[GoogleTTS] Audio chargé, lecture...");
          setIsLoading(false);
          setIsSpeaking(true);
        };

        audio.onended = () => {
          console.log("[GoogleTTS] Lecture terminée");
          setIsSpeaking(false);
        };

        audio.onerror = (e) => {
          console.error("[GoogleTTS] Erreur lecture audio:", e);
          setError("Erreur lors de la lecture audio");
          setIsSpeaking(false);
          setIsLoading(false);
        };

        await audio.play();

      } else {
        // Fallback vers Web Speech API
        console.log("⚠️ [GoogleTTS] Fallback vers Web Speech API (backend non disponible)");
        setIsLoading(false);

        if (!("speechSynthesis" in window)) {
          throw new Error("Web Speech API non supportée");
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // Sélectionner une voix si disponible
        console.log("[GoogleTTS] Paramètres initiaux:", { voice, lang, textLength: text.length });

        if (voice) {
          // Si c'est un nom de voix Google Cloud TTS, mapper vers une voix du navigateur
          const selectedVoice = voice.includes("Neural2") || voice.includes("en-")
            ? mapGoogleVoiceToBrowserVoice(voice, lang)
            : window.speechSynthesis.getVoices().find(v => v.name === voice);

          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("[GoogleTTS] Voix sélectionnée pour Web Speech API:", selectedVoice.name);

            // Même si la voix a le même nom, différencier par pitch et rate selon la sélection Google
            // Cela permet d'avoir des variations même avec une seule voix disponible
            const isNeuralVoice = voice && typeof voice === "string" && (voice.includes("Neural") || voice.includes("en-US") || voice.includes("en-GB"));
            console.log("[GoogleTTS] Vérification voix Neural:", { voice, isNeuralVoice, type: typeof voice });

            if (isNeuralVoice) {
              // Extraire des indices du nom de la voix Google pour varier pitch et rate
              const hash = voice.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
              console.log("[GoogleTTS] Hash calculé pour la voix:", { voice, hash });

              // Varier le pitch selon le genre et l'index de la voix
              let pitchValue: number;
              if (voice.includes("-F") || voice.includes("-A") || voice.includes("-C")) {
                // Voix féminine : pitch plus élevé
                pitchValue = 1.2 + (hash % 10) * 0.05; // Entre 1.2 et 1.7
                console.log("[GoogleTTS] Voix féminine détectée");
              } else if (voice.includes("-D") || voice.includes("-B") || voice.includes("-I")) {
                // Voix masculine : pitch plus bas
                pitchValue = 0.8 - (hash % 10) * 0.03; // Entre 0.5 et 0.8
                console.log("[GoogleTTS] Voix masculine détectée");
              } else {
                // Neutre
                pitchValue = 1.0 + (hash % 10) * 0.02 - 0.1; // Entre 0.9 et 1.1
                console.log("[GoogleTTS] Voix neutre détectée");
              }

              // Varier légèrement le rate selon la voix pour plus de différenciation
              const rateValue = 1.0 + (hash % 7) * 0.02 - 0.06; // Entre 0.94 et 1.08

              utterance.pitch = pitchValue;
              utterance.rate = rateValue;

              console.log("[GoogleTTS] ✅ Paramètres audio ajustés:", {
                browserVoice: selectedVoice.name,
                googleVoice: voice,
                pitch: pitchValue.toFixed(2),
                rate: rateValue.toFixed(2),
                hash: hash
              });
            } else {
              console.warn("[GoogleTTS] ⚠️ Voix non-Neural, pas d'ajustement de pitch/rate:", voice);
            }
          } else {
            console.warn("[GoogleTTS] Voix non trouvée, utilisation de la voix par défaut");
          }
        } else {
          console.log("[GoogleTTS] Aucune voix spécifiée, utilisation des paramètres par défaut");
        }

        utterance.onstart = () => {
          console.log("[GoogleTTS] Web Speech API - Lecture démarrée");
          setIsSpeaking(true);
          setError(null); // Effacer toute erreur précédente
        };

        utterance.onend = () => {
          console.log("[GoogleTTS] Web Speech API - Lecture terminée");
          setIsSpeaking(false);
        };

        utterance.onerror = (e) => {
          // L'erreur "interrupted" n'est pas critique - elle se produit quand cancel() est appelé
          if (e.error === "interrupted" || e.error === "canceled") {
            console.log("[GoogleTTS] Lecture interrompue/annulée (normal)");
            setIsSpeaking(false);
            setError(null); // Ne pas afficher d'erreur pour les interruptions normales
            return;
          }

          console.error("[GoogleTTS] Web Speech API - Erreur:", e);
          setError(`Erreur: ${e.error}`);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      }

    } catch (err: any) {
      console.error("[GoogleTTS] Erreur:", err);

      // Si Google TTS échoue, marquer comme indisponible et utiliser Web Speech API directement
      if (isGoogleTTSAvailable && err.message && !err.message.includes("Web Speech API")) {
        console.warn("[GoogleTTS] Erreur Google TTS, basculement vers Web Speech API");
        setIsGoogleTTSAvailable(false);

        // Utiliser Web Speech API directement au lieu de réessayer avec speak() (évite la récursion)
        if ("speechSynthesis" in window) {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;

            // Mapper la voix si fournie
            if (voice) {
              const selectedVoice = voice.includes("Neural2") || voice.includes("en-")
                ? mapGoogleVoiceToBrowserVoice(voice, lang)
                : window.speechSynthesis.getVoices().find(v => v.name === voice);

              if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log("[GoogleTTS] Voix sélectionnée (fallback):", selectedVoice.name);
              }
            }

            utterance.onstart = () => {
              setIsSpeaking(true);
              setError(null);
            };

            utterance.onend = () => {
              setIsSpeaking(false);
            };

            utterance.onerror = (e) => {
              if (e.error === "interrupted" || e.error === "canceled") {
                setIsSpeaking(false);
                setError(null);
                return;
              }
              setError(`Erreur: ${e.error}`);
              setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
            setIsLoading(false);
            return; // Sortir de la fonction pour éviter de définir l'erreur
          } catch (fallbackErr: any) {
            // Si meme le fallback echoue, alors afficher l'erreur
            setError(fallbackErr?.message || "Erreur lors de la synthese vocale");
          }
        }
      } else {
        setError(err.message || "Erreur lors de la synthese vocale");
      }

      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [isGoogleTTSAvailable]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
    isGoogleTTSAvailable
  };
};
