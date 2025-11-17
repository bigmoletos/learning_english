/**
 * Composant pour les exercices de speaking avec analyse IA
 * Compatible Web et Android/Capacitor
 * @version 1.0.0
 * @date 09-11-2025
 */

import React, { useState, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Mic,
  Stop,
} from "@mui/icons-material";
import { speechToTextService } from "../../services/speechToTextService";
import { LanguageLevel } from "../../types";
import { buildApiUrl } from "../../services/apiConfig";

interface SpeakingExerciseProps {
  exercise: {
    id: string;
    level: LanguageLevel;
    type: "pronunciation" | "fluency" | "grammar" | "vocabulary";
    title: string;
    prompt: string;
    targetSentence?: string;
    duration: number;
    difficulty: number;
    focusAreas: string[];
  };
  onComplete?: (analysis: any) => void;
}

interface AnalysisResult {
  originalTranscript: string;
  correctedSentence?: string;
  errors: Array<{
    type: string;
    original: string;
    corrected: string;
    explanation: string;
    exceptions?: string[];
    severity: "low" | "medium" | "high";
  }>;
  score: number;
  fluencyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  feedback: string;
  recommendations: string[];
  suggestedExercises: any[];
}

export const SpeakingExercise: React.FC<SpeakingExerciseProps> = ({
  exercise,
  onComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isNativePlatform = Capacitor.isNativePlatform();

  /**
   * Traite l'enregistrement : transcription + analyse
   */
  const processRecording = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Vérifier qu'il y a des chunks
      if (audioChunksRef.current.length === 0) {
        throw new Error("Aucune donnée audio enregistrée");
      }

      // Créer le blob audio avec le bon type MIME
      const firstChunk = audioChunksRef.current[0];
      const mimeType = firstChunk?.type || "audio/webm;codecs=opus";

      const audioBlob = new Blob(audioChunksRef.current, {
        type: mimeType,
      });

      console.log("[SpeakingExercise] Audio enregistré:", {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      // Étape 1 : Transcription avec Google STT
      const sttResult = await speechToTextService.transcribe({
        audioBlob,
        lang: "en-US",
        sampleRate: 48000,
      });

      if (!sttResult.success || !sttResult.transcript) {
        throw new Error(
          sttResult.error || "Aucune transcription disponible. Réessayez."
        );
      }

      setTranscript(sttResult.transcript);

      console.log("[SpeakingExercise] Transcription:", sttResult.transcript);

      // Étape 2 : Analyse avec l'agent IA
      const analysisResponse = await fetch(buildApiUrl("/api/speaking-agent/analyze"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: sttResult.transcript,
          confidence: sttResult.confidence / 100, // Convertir en 0-1
          targetLevel: exercise.level,
          expectedSentence: exercise.targetSentence,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const analysisData = await analysisResponse.json();

      if (!analysisData.success) {
        throw new Error(analysisData.message || "Erreur lors de l'analyse");
      }

      setAnalysis(analysisData);

      // Appeler le callback si fourni
      if (onComplete) {
        onComplete(analysisData);
      }

      console.log("[SpeakingExercise] Analyse complète:", analysisData);
    } catch (err: any) {
      console.error("[SpeakingExercise] Erreur traitement:", err);
      setError(err.message || "Erreur lors du traitement de l'audio");
    } finally {
      setIsProcessing(false);
    }
  }, [exercise.level, exercise.targetSentence, onComplete]);

  /**
   * Démarre l'enregistrement audio
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript("");
      setAnalysis(null);
      audioChunksRef.current = [];
      setRecordingTime(0);

      // Demander l'accès au microphone
      // Configuration adaptée pour Web et Android
      const audioConstraints = isNativePlatform
        ? {
          // Configuration simplifiée pour Android
          audio: true,
        }
        : {
          // Configuration avancée pour Web
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        };

      const stream = await navigator.mediaDevices.getUserMedia(
        audioConstraints
      );

      streamRef.current = stream;

      // Créer le MediaRecorder avec configuration adaptée
      // Android préfère audio/mp4 ou audio/webm selon le device
      let mimeType = "audio/webm;codecs=opus";

      if (isNativePlatform) {
        // Tester les formats supportés sur Android
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          // Fallback : laisser le navigateur choisir
          console.warn(
            "[SpeakingExercise] Aucun format préféré supporté, utilisation du format par défaut"
          );
        }
      }

      const mediaRecorder = MediaRecorder.isTypeSupported(mimeType)
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Arrêter le stream
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        // Traiter l'audio
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer pour afficher le temps d'enregistrement
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("[SpeakingExercise] Erreur démarrage enregistrement:", err);
      setError(
        err.name === "NotAllowedError"
          ? "Permission microphone refusée. Veuillez autoriser l'accès."
          : "Erreur lors du démarrage de l'enregistrement."
      );
    }
  }, [isNativePlatform, processRecording]);

  /**
   * Arrête l'enregistrement
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);


  /**
   * Réinitialise l'exercice
   */
  const resetExercise = useCallback(() => {
    stopRecording();
    setTranscript("");
    setAnalysis(null);
    setError(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, [stopRecording]);

  // Nettoyage
  React.useEffect(() => {
    return () => {
      // Nettoyer le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Nettoyer le stream audio
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Nettoyer le MediaRecorder
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }

      // Libérer la mémoire des chunks audio
      audioChunksRef.current = [];
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {exercise.title}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Niveau ${exercise.level}`}
            color="primary"
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={exercise.type}
            color="secondary"
            size="small"
            sx={{ mr: 1 }}
          />
          {exercise.focusAreas.map((area, idx) => (
            <Chip
              key={idx}
              label={area}
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {exercise.prompt}
        </Typography>

        {exercise.targetSentence && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Phrase cible :</strong> {exercise.targetSentence}
            </Typography>
          </Alert>
        )}

        {/* Contrôles d'enregistrement */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          {!isRecording && !isProcessing && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Mic />}
              onClick={startRecording}
              size="large"
            >
              Commencer l'enregistrement
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={stopRecording}
                size="large"
              >
                Arrêter ({formatTime(recordingTime)})
              </Button>
              <CircularProgress size={24} />
            </>
          )}

          {isProcessing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2">
                Traitement en cours (transcription + analyse)...
              </Typography>
            </Box>
          )}

          {(transcript || analysis) && (
            <Button variant="outlined" onClick={resetExercise}>
              Réinitialiser
            </Button>
          )}
        </Box>

        {/* Erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Transcription */}
        {transcript && (
          <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transcription :
            </Typography>
            <Typography variant="body1">{transcript}</Typography>
          </Card>
        )}

        {/* Résultats de l'analyse */}
        {analysis && (
          <Box>
            <Divider sx={{ my: 2 }} />

            {/* Scores */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scores
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 150 }}>
                  <Typography variant="caption">Score global</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.score}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="body2">{analysis.score}%</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 150 }}>
                  <Typography variant="caption">Grammaire</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.grammarScore}
                    color="primary"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="body2">
                    {analysis.grammarScore}%
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 150 }}>
                  <Typography variant="caption">Prononciation</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.pronunciationScore}
                    color="secondary"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="body2">
                    {analysis.pronunciationScore}%
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 150 }}>
                  <Typography variant="caption">Fluidité</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.fluencyScore}
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="body2">
                    {analysis.fluencyScore}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Phrase corrigée */}
            {analysis.correctedSentence && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Phrase corrigée :
                </Typography>
                <Typography variant="body1">
                  {analysis.correctedSentence}
                </Typography>
              </Alert>
            )}

            {/* Feedback */}
            <Alert
              severity={
                analysis.score >= 75
                  ? "success"
                  : analysis.score >= 50
                    ? "warning"
                    : "error"
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="body1">{analysis.feedback}</Typography>
            </Alert>

            {/* Erreurs détectées */}
            {analysis.errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Erreurs détectées ({analysis.errors.length})
                </Typography>
                <List>
                  {analysis.errors.map((err, idx) => (
                    <ListItem key={idx} alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              variant="body2"
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
                              variant="body2"
                              component="span"
                              sx={{ color: "success.main" }}
                            >
                              → {err.corrected}
                            </Typography>
                            <Chip
                              label={err.severity}
                              size="small"
                              color={
                                err.severity === "high"
                                  ? "error"
                                  : err.severity === "medium"
                                    ? "warning"
                                    : "default"
                              }
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        primaryTypographyProps={{ component: "div" }}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              {err.explanation}
                            </Typography>
                            {err.exceptions && err.exceptions.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Exceptions :
                                </Typography>
                                <List dense>
                                  {err.exceptions.map((exc, excIdx) => (
                                    <ListItem key={excIdx}>
                                      <Typography variant="caption">
                                        • {exc}
                                      </Typography>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Recommandations */}
            {analysis.recommendations.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recommandations
                </Typography>
                <List dense>
                  {analysis.recommendations.map((rec, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Exercices suggérés */}
            {analysis.suggestedExercises.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Exercices suggérés
                </Typography>
                <List>
                  {analysis.suggestedExercises.map((ex, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={ex.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {ex.prompt}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={ex.level}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip label={ex.type} size="small" />
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

