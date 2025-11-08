/**
 * Composant ClozeExercise - Exercices de texte à trous
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState, useRef } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Chip
} from "@mui/material";
import { CheckCircle, Cancel, Lightbulb } from "@mui/icons-material";
import { Question } from "../../types";

interface ClozeExerciseProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  showExplanation?: boolean;
}

export const ClozeExercise: React.FC<ClozeExerciseProps> = ({
  question,
  onAnswer,
  showExplanation = true
}) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());

  const handleSubmit = () => {
    const correctAnswer = Array.isArray(question.correctAnswer)
      ? question.correctAnswer[0]
      : question.correctAnswer;

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    setSubmitted(true);
    onAnswer(userAnswer, isCorrect, timeSpent);
  };

  const isCorrect = submitted && userAnswer.trim().toLowerCase() ===
    (Array.isArray(question.correctAnswer)
      ? question.correctAnswer[0]
      : question.correctAnswer
    ).toLowerCase();

  const renderTextWithBlanks = (text: string) => {
    const parts = text.split("___");

    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && (
          <TextField
            size="small"
            variant="outlined"
            disabled={submitted}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            sx={{
              mx: 1,
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                bgcolor: submitted
                  ? isCorrect
                    ? "success.light"
                    : "error.light"
                  : "white"
              }
            }}
          />
        )}
      </React.Fragment>
    ));
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Complétez le texte à trous
          </Typography>

          {question.grammarFocus && question.grammarFocus.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, mb: 3, flexWrap: "wrap" }}>
              {question.grammarFocus.map((focus, idx) => (
                <Chip
                  key={idx}
                  label={focus}
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<Lightbulb />}
                />
              ))}
            </Box>
          )}

          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderRadius: 2,
              fontSize: "1.1rem",
              lineHeight: 2
            }}
          >
            <Typography component="div" variant="body1">
              {renderTextWithBlanks(question.text)}
            </Typography>
          </Box>
        </Box>

        {!submitted && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
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
              {!isCorrect && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  La réponse correcte était : <strong>{question.correctAnswer}</strong>
                </Typography>
              )}
            </Alert>

            {showExplanation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Explication :
                </Typography>
                <Typography variant="body2">
                  {question.explanation}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

