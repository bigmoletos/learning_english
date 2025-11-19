/**
 * Composant QCMExercise - Exercices à choix multiples
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
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

interface QCMExerciseProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  showExplanation?: boolean;
}

export const QCMExercise: React.FC<QCMExerciseProps> = ({
  question,
  onAnswer,
  showExplanation = true,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());

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
        </Box>

        <FormControl component="fieldset" fullWidth disabled={submitted}>
          <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
            {question.options &&
              question.options.map((option, idx) => (
                <FormControlLabel
                  key={idx}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: submitted
                      ? option === question.correctAnswer
                        ? "success.light"
                        : option === selectedAnswer && !isCorrect
                          ? "error.light"
                          : "transparent"
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
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            fullWidth
            sx={{ mt: 3 }}
          >
            Valider
          </Button>
        )}

        {submitted && showExplanation && (
          <Box sx={{ mt: 3 }}>
            {isCorrect ? (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                Correct ! Excellente réponse.
              </Alert>
            ) : (
              <Alert severity="error" icon={<Cancel />} sx={{ mb: 2 }}>
                Incorrect. La bonne réponse est : {question.correctAnswer}
              </Alert>
            )}

            {question.explanation && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">{question.explanation}</Typography>
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
