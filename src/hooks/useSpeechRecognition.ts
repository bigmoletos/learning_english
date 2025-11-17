/**
 * Hook personnalisé pour la reconnaissance vocale native Web Speech API
 * Optimisé pour Android mobile
 * @version 2.0.0
 * @date 04-11-2025
 */

import { useEffect, useState, useCallback, useRef } from "react";

export interface UseSpeechRecognitionReturn {
  transcript: string;
  listening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  confidence: number;
  error: string | null;
  permissionGranted: boolean;
}

// Types pour Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Détection Android
const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

// Vérification HTTPS (requis pour Web Speech API)
const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === "https:" ||
         window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
};

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState<string>("");
  const [listening, setListening] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const browserSupportsSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) &&
    isSecureContext();

  // Vérifier les permissions microphone
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Pour Android, on doit demander explicitement la permission via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Arrêter le stream immédiatement
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Permission microphone refusée. Veuillez autoriser l'accès au microphone.");
      } else if (err.name === "NotFoundError") {
        setError("Aucun microphone détecté sur votre appareil.");
      } else {
        setError("Erreur d'accès au microphone.");
      }
      setPermissionGranted(false);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        if (!isSecureContext()) {
          setError("HTTPS requis pour la reconnaissance vocale. Veuillez utiliser une connexion sécurisée.");
        } else {
          setError("Votre navigateur ne supporte pas la reconnaissance vocale.");
        }
      }, 0);
      return () => clearTimeout(timer);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuration optimisée pour Android
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    // Pour Android, on limite la reconnaissance pour éviter les timeouts
    if (isAndroid()) {
      recognition.continuous = false; // Mode non-continu pour Android
    }

    recognition.onresult = (event: any) => {
      console.log("[SpeechRecognition] onresult event:", event);
      let interimTranscript = "";
      let finalTranscript = "";

      // Parcourir TOUS les résultats pour reconstruire le transcript complet
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        console.log("[SpeechRecognition] Transcript part:", transcriptPart, "isFinal:", event.results[i].isFinal);
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + " ";
          const conf = event.results[i][0].confidence;
          // Android peut ne pas fournir de confidence, on met 80 par défaut
          setConfidence(conf ? Math.round(conf * 100) : 80);
        } else {
          interimTranscript += transcriptPart + " ";
        }
      }

      console.log("[SpeechRecognition] Final transcript:", finalTranscript, "Interim:", interimTranscript);

      // Mise à jour du transcript: final + interim (sans accumuler avec prev)
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript.trim());

      // Sur Android, redémarrer automatiquement si en mode continu simulé
      if (isAndroid() && finalTranscript && listening) {
        // Redémarrer après un court délai
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // Ignore si déjà démarré
          }
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      // Gestion des erreurs spécifiques Android
      switch (event.error) {
      case "network":
        setError("Erreur réseau. Vérifiez votre connexion Internet.");
        setListening(false);
        break;
      case "not-allowed":
        setError("Permission microphone refusée.");
        setPermissionGranted(false);
        setListening(false);
        break;
      case "no-speech":
        // Ne pas afficher d'erreur pour "no-speech", juste logger
        console.log("[SpeechRecognition] Aucune parole détectée, en attente...");
        // Ne pas arrêter l'écoute
        break;
      case "audio-capture":
        setError("Impossible d'accéder au microphone.");
        setListening(false);
        break;
      case "aborted":
        // Ignore, c'est un arrêt volontaire
        console.log("[SpeechRecognition] Reconnaissance arrêtée (aborted)");
        break;
      default:
        setError(`Erreur de reconnaissance: ${event.error}`);
        setListening(false);
      }
    };

    recognition.onstart = () => {
      console.log("[SpeechRecognition] Recognition started (onstart event)");
      setError(null);
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [browserSupportsSpeechRecognition, listening]);

  const startListening = useCallback(async () => {
    console.log("[SpeechRecognition] startListening called", {
      hasRecognition: !!recognitionRef.current,
      isListening: listening
    });

    if (!recognitionRef.current || listening) {
      console.log("[SpeechRecognition] startListening skipped", {
        reason: !recognitionRef.current ? "no recognition" : "already listening"
      });
      return;
    }

    // Vérifier la permission avant de commencer
    console.log("[SpeechRecognition] Checking microphone permission...");
    const hasPermission = await checkMicrophonePermission();
    console.log("[SpeechRecognition] Permission result:", hasPermission);
    if (!hasPermission) return;

    try {
      // S'assurer que la reconnaissance est arrêtée avant de recommencer
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }

      // Petit délai pour Android
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("[SpeechRecognition] Starting recognition...");
      recognitionRef.current.start();
      setListening(true);
      setError(null);
      console.log("[SpeechRecognition] Recognition started successfully");
    } catch (error: any) {
      console.error("[SpeechRecognition] Error starting recognition:", error);
      if (error.name === "InvalidStateError") {
        // Déjà en cours, on réessaie après un arrêt
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
          }, 200);
        } catch (e) {
          setError("Impossible de démarrer la reconnaissance vocale.");
        }
      } else {
        setError("Erreur lors du démarrage de la reconnaissance vocale.");
      }
      setListening(false);
    }
  }, [listening, checkMicrophonePermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
        setListening(false);
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, [listening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setConfidence(0);
    setError(null);
  }, []);

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    confidence,
    error,
    permissionGranted
  };
};
