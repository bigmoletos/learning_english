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
} from "@mui/material";
import {
  Mic,
  Stop,
  VolumeUp,
  CheckCircle,
  Error as ErrorIcon,
  TrendingUp,
} from "@mui/icons-material";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { textToSpeechService } from "../../services/textToSpeechService";
import { speakingAgent, SpeakingAnalysis } from "../../agents/speakingAgent";
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<SpeakingAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [speakCorrections, setSpeakCorrections] = useState(true);
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
      setError(null);
      startTimeRef.current = Date.now();
      setConversationStats({
        totalSentences: 0,
        totalErrors: 0,
        averageScore: 0,
        duration: 0,
        improvements: [],
      });

      await startListening();
      setIsConversing(true);

      // Message de bienvenue
      if (speakCorrections) {
        await speakText("Hello! Start speaking in English, and I will help you improve your pronunciation and grammar in real time.");
      }
    } catch (err: any) {
      console.error("[ConversationalSpeaking] Erreur démarrage:", err);
      setError(err.message || "Erreur lors du démarrage de la conversation");
    }
  }, [browserSupportsSpeechRecognition, startListening, resetTranscript, speakCorrections, speakText]);

  /**
   * Arrête la conversation
   */
  const stopConversation = useCallback(() => {
    stopListening();
    setIsConversing(false);

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
      // Arrêter l'audio en cours
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }

      const audioUrl = await textToSpeechService.synthesize({
        text,
        lang: "en-US",
        rate,
      });

      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      await audio.play();

      // Nettoyer après lecture
      audio.onended = () => {
        audioPlayerRef.current = null;
      };
    } catch (err) {
      console.error("[ConversationalSpeaking] Erreur TTS:", err);
      // Ne pas bloquer sur une erreur TTS
    }
  }, []);

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
      // Analyse avec le speaking agent
      const analysis = await speakingAgent.analyzeSpeaking(
        text,
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
        transcript: text,
        analysis,
        correctionSpoken: false,
      };

      setHistory(prev => [...prev, historyEntry]);

      // Feedback vocal si activé
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
  ]);

  /**
   * Détecte une fin de phrase et analyse
   */
  useEffect(() => {
    if (!isConversing || !transcript) return;

    // Détecter une fin de phrase (point, point d'interrogation, etc.)
    const endsWithPunctuation = /[.!?]$/.test(transcript.trim());

    // Ou si le transcript est stable pendant 2 secondes (détection de pause)
    if (
      endsWithPunctuation &&
      transcript !== lastTranscriptRef.current &&
      !processingRef.current
    ) {
      lastTranscriptRef.current = transcript;

      // Analyser après un petit délai pour s'assurer que la phrase est complète
      setTimeout(() => {
        if (transcript === lastTranscriptRef.current && !processingRef.current) {
          analyzeAndCorrect(transcript.trim());
        }
      }, 500);
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
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
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
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Stop />}
                onClick={stopConversation}
              >
                Arrêter
              </Button>
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
              {transcript && (
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
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Transcription en cours */}
      {transcript && isConversing && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>
            Vous dites :
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: "italic" }}>
            {transcript}
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
