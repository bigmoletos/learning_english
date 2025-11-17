/**
 * Composant VoiceRecorder - Reconnaissance vocale pour l'entraînement oral
 * Optimisé pour Android mobile
 * @version 2.0.0
 * @date 04-11-2025
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Mic, Stop, Replay, VolumeUp, Warning } from "@mui/icons-material";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

interface VoiceRecorderProps {
  expectedText?: string;
  onTranscriptComplete?: (transcript: string, confidence: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  expectedText,
  onTranscriptComplete,
}) => {
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    confidence,
    error: recognitionError,
    permissionGranted,
  } = useSpeechRecognition();

  const { speak, isSpeaking, error: speechError } = useTextToSpeech();

  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    if (!listening && hasRecorded && transcript) {
      onTranscriptComplete?.(transcript, confidence);
    }
  }, [listening, hasRecorded, transcript, confidence, onTranscriptComplete]);

  const handleStart = async () => {
    resetTranscript();
    setHasRecorded(false);
    await startListening();
  };

  const handleStop = () => {
    stopListening();
    setHasRecorded(true);
  };

  const handleReset = () => {
    resetTranscript();
    setHasRecorded(false);
  };

  const speakText = async (text: string) => {
    await speak(text, "en-US");
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <Alert severity="error" icon={<Warning />}>
        <Typography variant="body2" gutterBottom>
          Votre navigateur ne supporte pas la reconnaissance vocale.
        </Typography>
        <Typography variant="caption">
          Utilisez Chrome sur Android ou vérifiez que vous êtes sur une connexion HTTPS.
        </Typography>
      </Alert>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Entraînement oral
        </Typography>

        {/* Affichage des erreurs */}
        {recognitionError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {recognitionError}
          </Alert>
        )}

        {speechError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {speechError}
          </Alert>
        )}

        {/* Avertissement permission */}
        {!permissionGranted && !recognitionError && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<Warning />}>
            L'application a besoin d'accéder à votre microphone. Autorisez l'accès lorsque demandé.
          </Alert>
        )}

        {expectedText && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Texte à lire :
              </Typography>
              <Button
                size="large"
                variant="outlined"
                startIcon={<VolumeUp />}
                onClick={() => speakText(expectedText)}
                disabled={isSpeaking}
                sx={{
                  minHeight: 44,
                  minWidth: 44,
                  px: 2,
                }}
              >
                {isSpeaking ? "Lecture..." : "Écouter"}
              </Button>
            </Box>
            <Typography variant="body1" sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}>
              {expectedText}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {!listening ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Mic />}
              onClick={handleStart}
              sx={{
                minHeight: 56,
                minWidth: { xs: "100%", sm: "auto" },
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
              }}
            >
              Commencer l'enregistrement
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<Stop />}
              onClick={handleStop}
              sx={{
                minHeight: 56,
                minWidth: { xs: "100%", sm: "auto" },
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
              }}
            >
              Arrêter
            </Button>
          )}

          {hasRecorded && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<Replay />}
              onClick={handleReset}
              sx={{
                minHeight: 56,
                minWidth: { xs: "100%", sm: "auto" },
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
              }}
            >
              Réessayer
            </Button>
          )}
        </Box>

        {listening && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              p: 2,
              bgcolor: "primary.light",
              borderRadius: 2,
            }}
          >
            <CircularProgress size={28} sx={{ mr: 2, color: "white" }} />
            <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
              Enregistrement en cours... Parlez maintenant !
            </Typography>
          </Box>
        )}

        {transcript && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Votre transcription :
              </Typography>
              {hasRecorded && (
                <Chip
                  label={`Confiance: ${confidence}%`}
                  color={confidence >= 75 ? "success" : "warning"}
                  size="medium"
                  sx={{ fontSize: "0.9rem", height: 32 }}
                />
              )}
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.light",
                borderRadius: 2,
                color: "white",
                minHeight: 60,
              }}
            >
              <Typography variant="body1" sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                {transcript}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
