/**
 * Composant ListeningExercise - Exercices de compréhension orale
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Question } from "../../types";

interface ListeningExerciseProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  audioUrl?: string;
  transcript?: string;
  showExplanation?: boolean;
}

export const ListeningExercise: React.FC<ListeningExerciseProps> = ({
  question,
  onAnswer,
  audioUrl,
  transcript,
  showExplanation = true,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    setSubmitted(true);
    onAnswer(selectedAnswer, isCorrect, timeSpent);
  };

  const isCorrect = submitted && selectedAnswer === question.correctAnswer;

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {question.text}
          </Typography>

          {question.grammarFocus && question.grammarFocus.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              {question.grammarFocus.map((focus, idx) => (
                <Chip key={idx} label={focus} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          )}

          {audioUrl && (
            <Box
              sx={{
                mt: 3,
                mb: 2,
                p: 2,
                bgcolor: "primary.light",
                borderRadius: 2,
                border: 2,
                borderColor: "primary.main",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ color: "white", flexGrow: 1 }}>
                  Audio
                </Typography>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  style={{ flexGrow: 1, maxWidth: "400px" }}
                />
              </Box>
              <Typography variant="caption" sx={{ display: "block", mt: 1, color: "white" }}>
                💡 Écoutez attentivement l'audio avant de répondre
              </Typography>
            </Box>
          )}

          {transcript && !submitted && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Conseil :</strong> Écoutez l'audio attentivement. La transcription sera
                disponible après avoir répondu.
              </Typography>
            </Alert>
          )}

          {transcript && submitted && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Transcription :
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {transcript}
              </Typography>
            </Box>
          )}
        </Box>

        <FormControl component="fieldset" fullWidth disabled={submitted}>
          <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
            {question.options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>{option}</Typography>
                    {submitted && option === question.correctAnswer && (
                      <CheckCircle color="success" fontSize="small" />
                    )}
                    {submitted &&
                      option === selectedAnswer &&
                      option !== question.correctAnswer && (
                        <Cancel color="error" fontSize="small" />
                      )}
                  </Box>
                }
                sx={{
                  p: 2,
                  mb: 1,
                  border: 1,
                  borderColor:
                    submitted && option === question.correctAnswer
                      ? "success.main"
                      : submitted && option === selectedAnswer
                        ? "error.main"
                        : "grey.300",
                  borderRadius: 2,
                  bgcolor:
                    submitted && option === question.correctAnswer
                      ? "success.light"
                      : submitted && option === selectedAnswer
                        ? "error.light"
                        : "transparent",
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {!submitted && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            sx={{ mt: 3 }}
          >
            Valider la réponse
          </Button>
        )}

        {submitted && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity={isCorrect ? "success" : "error"}
              icon={isCorrect ? <CheckCircle /> : <Cancel />}
            >
              <Typography variant="subtitle2">
                {isCorrect ? "Bonne réponse !" : "Réponse incorrecte"}
              </Typography>
            </Alert>

            {showExplanation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Explication :
                </Typography>
                <Typography variant="body2">{question.explanation}</Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
