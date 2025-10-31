/**
 * Composant VoiceRecorder - Reconnaissance vocale pour l'entraînement oral
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardContent, Typography, Alert, CircularProgress, Chip
} from "@mui/material";
import { Mic, Stop, Replay, VolumeUp } from "@mui/icons-material";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

interface VoiceRecorderProps {
  expectedText?: string;
  onTranscriptComplete?: (transcript: string, confidence: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  expectedText,
  onTranscriptComplete
}) => {
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    confidence
  } = useSpeechRecognition();

  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    if (!listening && hasRecorded && transcript) {
      onTranscriptComplete?.(transcript, confidence);
    }
  }, [listening, hasRecorded, transcript, confidence, onTranscriptComplete]);

  const handleStart = () => {
    resetTranscript();
    setHasRecorded(false);
    startListening();
  };

  const handleStop = () => {
    stopListening();
    setHasRecorded(true);
  };

  const handleReset = () => {
    resetTranscript();
    setHasRecorded(false);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <Alert severity="error">
        Votre navigateur ne supporte pas la reconnaissance vocale.
        Utilisez Chrome ou Edge pour cette fonctionnalité.
      </Alert>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Entraînement oral
        </Typography>

        {expectedText && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Texte à lire :
              </Typography>
              <Button
                size="small"
                startIcon={<VolumeUp />}
                onClick={() => speakText(expectedText)}
              >
                Écouter
              </Button>
            </Box>
            <Typography variant="body1">
              {expectedText}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: "center" }}>
          {!listening ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Mic />}
              onClick={handleStart}
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
            >
              Réessayer
            </Button>
          )}
        </Box>

        {listening && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="primary">
              Enregistrement en cours... Parlez maintenant !
            </Typography>
          </Box>
        )}

        {transcript && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Votre transcription :
              </Typography>
              {hasRecorded && (
                <Chip
                  label={`Confiance: ${confidence}%`}
                  color={confidence >= 75 ? "success" : "warning"}
                  size="small"
                />
              )}
            </Box>
            <Box sx={{ p: 2, bgcolor: "primary.light", borderRadius: 2, color: "white" }}>
              <Typography variant="body1">
                {transcript}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

