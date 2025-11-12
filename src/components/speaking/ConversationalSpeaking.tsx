/**
 * Composant de conversation speech-to-speech en temps réel
 * Corrige la prononciation, l'orthographe et la grammaire en direct
 * @version 1.0.0
 * @date 11-11-2025
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Paper,
  Slider,
  Typography as MuiTypography,
} from "@mui/material";
import {
  Mic,
  Stop,
  VolumeUp,
  CheckCircle,
  Error as ErrorIcon,
  TrendingUp,
  Pause,
  PlayArrow,
} from "@mui/icons-material";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { textToSpeechService } from "../../services/textToSpeechService";
import { speakingAgent, SpeakingAnalysis } from "../../agents/speakingAgent";
import { conversationService } from "../../services/conversationService";
import { LanguageLevel } from "../../types";

interface ConversationalSpeakingProps {
  level?: LanguageLevel;
  onComplete?: (stats: ConversationStats) => void;
}

interface ConversationStats {
  totalSentences: number;
  totalErrors: number;
  averageScore: number;
  duration: number;
  improvements: string[];
}

interface AnalysisHistory {
  timestamp: number;
  transcript: string;
  analysis: SpeakingAnalysis;
  correctionSpoken: boolean;
}

export const ConversationalSpeaking: React.FC<ConversationalSpeakingProps> = ({
  level = "B1",
  onComplete,
}) => {
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    confidence,
    error: speechError,
    permissionGranted,
  } = useSpeechRecognition();

  const [isConversing, setIsConversing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCoachResponding, setIsCoachResponding] = useState(false);
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false); // Indique si le coach est en train de parler
  const [currentAnalysis, setCurrentAnalysis] = useState<SpeakingAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [coachMessages, setCoachMessages] = useState<Array<{ role: "user" | "coach"; content: string; timestamp: number }>>([]);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [speakCorrections, setSpeakCorrections] = useState(true);
  const [coachMode, setCoachMode] = useState(true); // Mode conversation avec coach activé par défaut
  const [explanationLevel, setExplanationLevel] = useState(5); // Niveau d'explication 0-10
  const [error, setError] = useState<string | null>(null);
  const [conversationStats, setConversationStats] = useState<ConversationStats>({
    totalSentences: 0,
    totalErrors: 0,
    averageScore: 0,
    duration: 0,
    improvements: [],
  });

  const startTimeRef = useRef<number>(0);
  const lastTranscriptRef = useRef<string>("");
  const processingRef = useRef<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Démarre la conversation
   */
  const startConversation = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      setError("Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    try {
      resetTranscript();
      setHistory([]);
      setCurrentAnalysis(null);
      setCoachMessages([]);
      setError(null);
      startTimeRef.current = Date.now();
      setConversationStats({
        totalSentences: 0,
        totalErrors: 0,
        averageScore: 0,
        duration: 0,
        improvements: [],
      });

      // Initialiser la conversation avec le coach
      if (coachMode) {
        conversationService.initializeConversation(level);
      }

      // Message de bienvenue
      // En mode coach, le coach doit TOUJOURS parler pour démarrer la conversation
      // En mode simple, seulement si speakCorrections est activé
      const welcomeMessage = coachMode
        ? "Hello! I'm your English coach. Let's have a conversation! I'll help you improve your English and correct any mistakes. What would you like to talk about?"
        : "Hello! Start speaking in English, and I will help you improve your pronunciation and grammar in real time.";

      // Réinitialiser le transcript AVANT que le coach parle (si mode coach)
      if (coachMode) {
        resetTranscript();
        lastTranscriptRef.current = "";
      }

      // Toujours parler en mode coach, sinon seulement si speakCorrections est activé
      if (coachMode || speakCorrections) {
        await speakText(welcomeMessage);
      }

      // Ajouter le message du coach à l'historique (toujours en mode coach)
      if (coachMode) {
        setCoachMessages([{
          role: "coach",
          content: welcomeMessage,
          timestamp: Date.now(),
        }]);
      }

      // Démarrer l'écoute APRÈS que le coach ait fini de parler
      await startListening();
      setIsConversing(true);
    } catch (err: any) {
      console.error("[ConversationalSpeaking] Erreur démarrage:", err);
      setError(err.message || "Erreur lors du démarrage de la conversation");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserSupportsSpeechRecognition, startListening, resetTranscript, speakCorrections, coachMode, level]);

  /**
   * Met en pause / reprend la conversation
   */
  const togglePause = useCallback(() => {
    if (isPaused) {
      // Reprendre
      startListening();
      setIsPaused(false);
    } else {
      // Mettre en pause
      stopListening();
      setIsPaused(true);
    }
  }, [isPaused, startListening, stopListening]);

  /**
   * Arrête la conversation
   */
  const stopConversation = useCallback(() => {
    stopListening();
    setIsConversing(false);
    setIsPaused(false);

    // Nettoyer les timers
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalStats = {
      ...conversationStats,
      duration,
    };
    setConversationStats(finalStats);

    if (onComplete) {
      onComplete(finalStats);
    }

    // Arrêter l'audio en cours
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
  }, [stopListening, conversationStats, onComplete]);

  /**
   * Prononce un texte en anglais
   */
  const speakText = useCallback(async (text: string, rate = 1.0) => {
    try {
      // Arrêter la reconnaissance vocale pendant que le coach parle
      setIsCoachSpeaking(true);
      if (listening) {
        stopListening();
      }

      // Réinitialiser le transcript pour éviter de capturer ce que dit le coach
      resetTranscript();
      lastTranscriptRef.current = "";

      // Arrêter l'audio en cours
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }

      const audioUrl = await textToSpeechService.synthesize({
        text,
        lang: "en-US",
        rate,
      });

      // Si le service TTS n'est pas disponible, ne pas bloquer
      if (!audioUrl) {
        console.warn("[ConversationalSpeaking] Service TTS non disponible, audio ignoré");
        setIsCoachSpeaking(false);
        // Reprendre l'écoute si on était en conversation
        if (isConversing && !isPaused) {
          await startListening();
        }
        return;
      }

      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      // Reprendre l'écoute après la fin de la lecture
      audio.onended = () => {
        audioPlayerRef.current = null;
        setIsCoachSpeaking(false);
        // Reprendre l'écoute si on était en conversation
        if (isConversing && !isPaused) {
          startListening();
        }
      };

      await audio.play();
    } catch (err) {
      console.error("[ConversationalSpeaking] Erreur TTS:", err);
      setIsCoachSpeaking(false);
      // Reprendre l'écoute en cas d'erreur
      if (isConversing && !isPaused) {
        startListening();
      }
    }
  }, [listening, stopListening, startListening, isConversing, isPaused]);

  /**
   * Analyse la parole et donne un feedback
   */
  const analyzeAndCorrect = useCallback(async (text: string) => {
    if (!text || text.trim().length < 3 || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setIsAnalyzing(true);

    try {
      // Liste complète des phrases possibles du coach à filtrer (plus exhaustive)
      // IMPORTANT: Les patterns avec .* à la fin doivent être en dernier pour éviter de capturer trop
      const coachPhrases = [
        // Patterns spécifiques d'abord (sans .*)
        /excellent keep going/gi,
        /keep going excellent/gi,
        /excellent.*keep going/gi,
        /keep going.*excellent/gi,
        /Translation:/gi,
        /I've translated/gi,
        /I found \d+ mistake/gi,
        /The correct sentence is:/gi,
        /That's great/gi,
        /Good job/gi,
        /Well done/gi,
        /Keep practicing/gi,
        // Patterns avec .* en dernier (plus généraux)
        /hello start speaking in English and I will help you improve your pronunciation and grammar in real time/gi,
        /start speaking in English and I will help you improve your pronunciation and grammar in real time/gi,
        /hello start speaking in English and I will help you.*/gi,
        /start speaking in English and I will help you.*/gi,
        /I will help you improve your pronunciation and grammar.*/gi,
        /improve your pronunciation and grammar.*/gi,
        /help you improve your pronunciation.*/gi,
        /pronunciation and grammar in real time/gi,
        /pronunciation and grammar in Real-Time/gi,
        /I'm your English coach.*/gi,
        /Let's have a conversation.*/gi,
        /I'll help you improve.*/gi,
        /What would you like to talk about\?/gi,
        /You said.*but the correct form is.*/gi,
      ];

      // Filtrer les messages du coach du transcript
      let userText = text;
      const originalText = text;

      // Trouver toutes les positions des phrases du coach dans le transcript
      const coachMatches: Array<{ start: number; end: number; text: string }> = [];
      coachPhrases.forEach(phrase => {
        const regex = new RegExp(phrase.source, "gi");
        // Réinitialiser lastIndex pour chaque pattern
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(originalText)) !== null) {
          // À ce stade, match n'est pas null grâce à la condition du while
          const currentMatch: RegExpExecArray = match;
          // Éviter les doublons
          const isDuplicate = coachMatches.some(m =>
            m.start === currentMatch.index && m.end === currentMatch.index + currentMatch[0].length
          );
          if (!isDuplicate) {
            coachMatches.push({
              start: currentMatch.index,
              end: currentMatch.index + currentMatch[0].length,
              text: currentMatch[0]
            });
          }
        }
      });

      // Trier les matches par position de début (décroissant pour supprimer de la fin)
      coachMatches.sort((a, b) => b.start - a.start);

      // Supprimer les phrases du coach du transcript (de la fin vers le début pour ne pas décaler les indices)
      coachMatches.forEach(match => {
        userText = userText.substring(0, match.start) + " " + userText.substring(match.end);
      });

      // Nettoyer les espaces multiples et trim
      userText = userText.replace(/\s+/g, " ").trim();

      // Vérifier si le transcript ne contient que des phrases du coach
      if (!userText || userText.length < 2) {
        console.log("[ConversationalSpeaking] ❌ Transcript ignoré (contient uniquement des phrases du coach):", originalText);
        resetTranscript();
        lastTranscriptRef.current = "";
        setIsAnalyzing(false);
        processingRef.current = false;
        return;
      }

      console.log("[ConversationalSpeaking] ✅ Transcript utilisateur filtré:", userText, "| ❌ Original (avec coach):", originalText);

      // Analyse avec le speaking agent
      const analysis = await speakingAgent.analyzeSpeaking(
        userText,
        confidence,
        level
      );

      setCurrentAnalysis(analysis);

      // Mettre à jour les statistiques
      const totalErrors = conversationStats.totalErrors + analysis.errors.length;
      const totalSentences = conversationStats.totalSentences + 1;
      const averageScore = Math.round(
        ((conversationStats.averageScore * conversationStats.totalSentences) + analysis.score) /
        totalSentences
      );

      setConversationStats({
        ...conversationStats,
        totalSentences,
        totalErrors,
        averageScore,
      });

      // Ajouter à l'historique
      const historyEntry: AnalysisHistory = {
        timestamp: Date.now(),
        transcript: userText,
        analysis,
        correctionSpoken: false,
      };

      setHistory(prev => [...prev, historyEntry]);

      // Ajouter le message de l'utilisateur à l'historique de conversation
      if (coachMode) {
        setCoachMessages(prev => [...prev, {
          role: "user",
          content: userText,
          timestamp: Date.now(),
        }]);
      }

      // Vérifier si c'est une demande de traduction
      const isTranslationRequest = /translate|traduis|traduction|en français|in english|to french|to english/i.test(userText);

      if (isTranslationRequest && coachMode) {
        // Extraire le texte à traduire
        const textToTranslate = userText.replace(/translate|traduis|traduction|en français|in english|to french|to english/gi, "").trim();
        if (textToTranslate) {
          const targetLang = /en français|to french|français/i.test(userText) ? "fr" : "en";
          setIsCoachResponding(true);

          try {
            const translationResult = await conversationService.translate(textToTranslate, targetLang);
            if (translationResult.success) {
              const coachResponse = `Translation: "${translationResult.translatedText}"`;
              setCoachMessages(prev => [...prev, {
                role: "coach",
                content: coachResponse,
                timestamp: Date.now(),
              }]);

              if (speakCorrections) {
                await speakText(coachResponse, 0.9);
              }
            }
          } catch (err) {
            console.error("[ConversationalSpeaking] Erreur traduction:", err);
          } finally {
            setIsCoachResponding(false);
          }
        }
      } else if (coachMode) {
        // Mode conversation avec coach : obtenir une réponse du coach
        // Le coach doit TOUJOURS répondre en mode coach, même s'il n'y a pas d'erreurs
        console.log("[ConversationalSpeaking] Demande de réponse au coach pour:", userText, "| Erreurs:", analysis.errors.length);

        // Arrêter la reconnaissance vocale et réinitialiser le transcript AVANT que le coach réponde
        if (listening) {
          stopListening();
        }
        resetTranscript();
        lastTranscriptRef.current = "";

        setIsCoachResponding(true);

        try {
          const coachResponse = await conversationService.sendMessage(userText, level, analysis.errors, explanationLevel);
          console.log("[ConversationalSpeaking] Réponse du coach reçue:", coachResponse);

          if (coachResponse.success && coachResponse.message) {
            // Vérifier si le dernier message du coach est identique (éviter les répétitions exactes)
            const lastCoachMessage = coachMessages.length > 0
              ? coachMessages[coachMessages.length - 1]?.content
              : "";

            // Ne pas ajouter si c'est exactement le même message
            if (coachResponse.message !== lastCoachMessage) {
              // Ajouter la réponse du coach à l'historique
              setCoachMessages(prev => [...prev, {
                role: "coach",
                content: coachResponse.message,
                timestamp: Date.now(),
              }]);

              // Parler la réponse du coach à l'oral (TOUJOURS en mode coach, indépendamment de speakCorrections)
              // En mode coach, le coach doit toujours parler pour avoir une vraie conversation
              await speakText(coachResponse.message, 0.9);

              // Si le coach a fourni des corrections, les afficher
              if (coachResponse.explanation) {
                console.log("[ConversationalSpeaking] Explication du coach:", coachResponse.explanation);
              }
            } else {
              console.log("[ConversationalSpeaking] Message du coach ignoré (répétition exacte)");
            }
          }
        } catch (err) {
          console.error("[ConversationalSpeaking] Erreur conversation coach:", err);
        } finally {
          setIsCoachResponding(false);
        }
      } else {
        // Mode correction simple (sans coach)
        if (speakCorrections && autoCorrect && analysis.errors.length > 0) {
          let correctionText = "";

          if (analysis.errors.length === 1) {
            const err = analysis.errors[0];
            correctionText = `You said "${err.original}", but the correct form is "${err.corrected}". ${err.explanation}`;
          } else {
            correctionText = `I found ${analysis.errors.length} mistakes. `;
            correctionText += `The correct sentence is: ${analysis.correctedSentence}`;
          }

          await speakText(correctionText, 0.9);

          // Marquer comme corrigé
          historyEntry.correctionSpoken = true;
          setHistory(prev =>
            prev.map(h => h.timestamp === historyEntry.timestamp ? historyEntry : h)
          );
        } else if (speakCorrections && analysis.score >= 90) {
          await speakText("Excellent! Keep going.", 1.0);
        }
      }

      // Réinitialiser la transcription pour la prochaine phrase
      resetTranscript();
      lastTranscriptRef.current = "";
    } catch (err: any) {
      console.error("[ConversationalSpeaking] Erreur analyse:", err);
      setError(err.message || "Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
      processingRef.current = false;
    }
  }, [
    confidence,
    level,
    conversationStats,
    speakCorrections,
    autoCorrect,
    resetTranscript,
    speakText,
    coachMode,
  ]);

  /**
   * Détecte une fin de phrase et analyse
   */
  useEffect(() => {
    // Ne pas analyser si le coach est en train de parler
    if (!isConversing || isPaused || isCoachSpeaking || !transcript) return;

    // Nettoyer le timer existant
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    // Ignorer si déjà en cours de traitement ou si c'est le même transcript
    if (processingRef.current || transcript === lastTranscriptRef.current) {
      return;
    }

    // Minimum 3 caractères pour analyser
    if (transcript.trim().length < 3) {
      return;
    }

    // Détecter une fin de phrase (point, point d'interrogation, etc.)
    const endsWithPunctuation = /[.!?]$/.test(transcript.trim());

    if (endsWithPunctuation) {
      // Analyse immédiate si ponctuation détectée
      lastTranscriptRef.current = transcript;
      setTimeout(() => {
        if (transcript === lastTranscriptRef.current && !processingRef.current) {
          analyzeAndCorrect(transcript.trim());
        }
      }, 500);
    } else {
      // Détection de pause : analyser si le transcript reste stable pendant 2 secondes
      pauseTimerRef.current = setTimeout(() => {
        if (
          transcript === lastTranscriptRef.current ||
          (transcript && transcript.trim().length >= 3 && !processingRef.current)
        ) {
          lastTranscriptRef.current = transcript;
          analyzeAndCorrect(transcript.trim());
        }
      }, 2000); // 2 secondes de pause
    }
  }, [transcript, isConversing, analyzeAndCorrect]);

  /**
   * Nettoyage
   */
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Votre navigateur ne supporte pas la reconnaissance vocale.
            Veuillez utiliser Chrome, Edge ou Safari.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Mode Conversationnel Speech-to-Speech
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Parlez en anglais et recevez des corrections instantanées de votre prononciation,
            grammaire et orthographe. Le système vous corrige en temps réel et vous aide à vous améliorer.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Chip
              icon={<TrendingUp />}
              label={`Niveau ${level}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`${conversationStats.totalSentences} phrases`}
              size="small"
            />
            <Chip
              label={`Score moyen: ${conversationStats.averageScore}%`}
              size="small"
              color={
                conversationStats.averageScore >= 75
                  ? "success"
                  : conversationStats.averageScore >= 50
                    ? "warning"
                    : "error"
              }
            />
          </Box>

          {/* Paramètres */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", flexDirection: "column" }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={coachMode}
                    onChange={(e) => setCoachMode(e.target.checked)}
                    disabled={isConversing}
                  />
                }
                label="Mode Coach IA"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCorrect}
                    onChange={(e) => setAutoCorrect(e.target.checked)}
                    disabled={isConversing}
                  />
                }
                label="Correction automatique"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={speakCorrections}
                    onChange={(e) => setSpeakCorrections(e.target.checked)}
                    disabled={isConversing}
                  />
                }
                label="Feedback vocal"
              />
            </Box>

            {/* Niveau d'explication */}
            <Box sx={{ width: "100%", maxWidth: 500, mt: 1 }}>
              <MuiTypography variant="body2" gutterBottom>
                Niveau d'explication du coach : {explanationLevel}/10
                {explanationLevel === 0 && " (Aucune explication)"}
                {explanationLevel > 0 && explanationLevel <= 3 && " (Minimal)"}
                {explanationLevel > 3 && explanationLevel <= 7 && " (Modéré)"}
                {explanationLevel > 7 && " (Détaillé)"}
              </MuiTypography>
              <Slider
                value={explanationLevel}
                onChange={(e, value) => setExplanationLevel(value as number)}
                min={0}
                max={10}
                step={1}
                marks={[
                  { value: 0, label: "0" },
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                ]}
                disabled={isConversing}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {/* Contrôles */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {!isConversing ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Mic />}
                onClick={startConversation}
                disabled={!permissionGranted && speechError !== null}
              >
                Démarrer la conversation
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color={isPaused ? "success" : "warning"}
                  size="large"
                  startIcon={isPaused ? <PlayArrow /> : <Pause />}
                  onClick={togglePause}
                >
                  {isPaused ? "Reprendre" : "Pause"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Stop />}
                  onClick={stopConversation}
                >
                  Arrêter
                </Button>
              </>
            )}

            {listening && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="primary">
                  Écoute en cours...
                </Typography>
              </Box>
            )}

            {isAnalyzing && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Analyse...
                </Typography>
              </Box>
            )}

            {isCoachResponding && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="primary">
                  Le coach répond...
                </Typography>
              </Box>
            )}

            {isCoachSpeaking && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="warning.main">
                  Le coach parle... (écoute désactivée)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Erreurs */}
          {(error || speechError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error || speechError}
            </Alert>
          )}

          {/* Debug Panel - État du microphone */}
          <Paper
            elevation={1}
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              État du système (Debug)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ minWidth: 180 }}>
                  Navigateur compatible:
                </Typography>
                <Chip
                  size="small"
                  label={browserSupportsSpeechRecognition ? "OUI" : "NON"}
                  color={browserSupportsSpeechRecognition ? "success" : "error"}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ minWidth: 180 }}>
                  Permission microphone:
                </Typography>
                <Chip
                  size="small"
                  label={permissionGranted ? "ACCORDÉE" : "NON ACCORDÉE"}
                  color={permissionGranted ? "success" : "warning"}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ minWidth: 180 }}>
                  Écoute active:
                </Typography>
                <Chip
                  size="small"
                  label={listening ? "OUI" : "NON"}
                  color={listening ? "success" : "default"}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" sx={{ minWidth: 180 }}>
                  Confiance reconnaissance:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {confidence}%
                </Typography>
              </Box>
              {transcript && !isCoachSpeaking && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Transcript en direct:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1, bgcolor: "background.paper" }}
                  >
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      {transcript || "(vide)"}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {isCoachSpeaking && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "warning.main" }}>
                    ⚠️ Le coach parle - transcript masqué
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Transcription en cours - Ne pas afficher si le coach parle */}
      {transcript && isConversing && !isCoachSpeaking && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>
            Vous dites :
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: "italic" }}>
            {transcript}
          </Typography>
        </Paper>
      )}

      {/* Message quand le coach parle */}
      {isCoachSpeaking && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: "primary.50" }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Le coach parle... (écoute désactivée temporairement)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Le microphone est désactivé pendant que le coach parle pour éviter de capturer sa voix.
          </Typography>
        </Paper>
      )}

      {/* Analyse actuelle */}
      {currentAnalysis && (
        <Card sx={{ mb: 3, bgcolor: "background.paper" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dernière analyse
            </Typography>

            {/* Scores */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption">Score global</Typography>
                <Typography variant="caption">{currentAnalysis.score}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={currentAnalysis.score}
                sx={{ height: 8, borderRadius: 1, mb: 2 }}
                color={
                  currentAnalysis.score >= 75
                    ? "success"
                    : currentAnalysis.score >= 50
                      ? "warning"
                      : "error"
                }
              />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  label={`Grammaire: ${currentAnalysis.grammarScore}%`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={`Prononciation: ${currentAnalysis.pronunciationScore}%`}
                  size="small"
                  color="secondary"
                />
                <Chip
                  label={`Fluidité: ${currentAnalysis.fluencyScore}%`}
                  size="small"
                  color="success"
                />
              </Box>
            </Box>

            {/* Phrase corrigée */}
            {currentAnalysis.correctedSentence && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Correction :</Typography>
                <Typography variant="body2">
                  {currentAnalysis.correctedSentence}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => speakText(currentAnalysis.correctedSentence || "", 0.8)}
                  sx={{ ml: 1 }}
                >
                  <VolumeUp fontSize="small" />
                </IconButton>
              </Alert>
            )}

            {/* Feedback */}
            <Alert
              severity={
                currentAnalysis.score >= 75
                  ? "success"
                  : currentAnalysis.score >= 50
                    ? "warning"
                    : "error"
              }
              sx={{ mb: 2 }}
            >
              {currentAnalysis.feedback}
            </Alert>

            {/* Erreurs */}
            {currentAnalysis.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Erreurs détectées ({currentAnalysis.errors.length})
                </Typography>
                <List dense>
                  {currentAnalysis.errors.map((err, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              component="span"
                              sx={{
                                textDecoration: "line-through",
                                color: "error.main",
                                mr: 1,
                              }}
                            >
                              {err.original}
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "success.main" }}
                            >
                              → {err.corrected}
                            </Typography>
                          </Box>
                        }
                        secondary={err.explanation}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversation avec le coach */}
      {coachMode && coachMessages.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conversation avec le coach
            </Typography>
            <List>
              {coachMessages.map((msg, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Divider />}
                  <ListItem alignItems="flex-start">
                    <Box sx={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Chip
                            label={msg.role === "coach" ? "🤖 Coach IA" : "👤 Vous"}
                            size="small"
                            color={msg.role === "coach" ? "primary" : "success"}
                            sx={{ fontWeight: "bold" }}
                          />
                        </Box>
                        <Paper
                          elevation={0}
                          component="div"
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: msg.role === "coach" ? "primary.50" : "success.50",
                            borderLeft: `4px solid ${msg.role === "coach" ? "primary.main" : "success.main"}`,
                          }}
                        >
                          <Typography variant="body1" component="div">
                            {msg.content}
                          </Typography>
                        </Paper>
                      </Box>
                      {msg.role === "coach" && (
                        <IconButton
                          size="small"
                          onClick={() => speakText(msg.content, 0.9)}
                          sx={{ mt: 1 }}
                        >
                          <VolumeUp fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {history.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Historique de la conversation
            </Typography>
            <List>
              {history.slice().reverse().map((item, idx) => (
                <React.Fragment key={item.timestamp}>
                  {idx > 0 && <Divider />}
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">
                            {item.transcript}
                          </Typography>
                          {item.analysis.errors.length === 0 ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Score: {item.analysis.score}% | {item.analysis.errors.length} erreur(s)
                          </Typography>
                          {item.analysis.correctedSentence && (
                            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                              → {item.analysis.correctedSentence}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
