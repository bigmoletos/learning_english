/**
 * Composant ReadingExercise - Exercices de compréhension écrite
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Radio, RadioGroup,
  FormControlLabel, FormControl, Button, Alert, Chip
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Question } from "../../types";

interface ReadingExerciseProps {
  question: Question;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  text?: string;
  showExplanation?: boolean;
}

export const ReadingExercise: React.FC<ReadingExerciseProps> = ({
  question,
  onAnswer,
  text,
  showExplanation = true
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    setSubmitted(true);
    onAnswer(selectedAnswer, isCorrect, timeSpent);
  };

  const isCorrect = submitted && selectedAnswer === question.correctAnswer;
  const isIncorrect = submitted && selectedAnswer !== question.correctAnswer;

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        {/* Le texte est affiché une seule fois en haut dans ExerciseList, donc on ne l'affiche pas ici */}
        {text && (
          <Box sx={{ mb: 3, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {text}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {question.text}
          </Typography>
          
          {question.grammarFocus && question.grammarFocus.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              {question.grammarFocus.map((focus, idx) => (
                <Chip
                  key={idx}
                  label={focus}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </Box>

        <FormControl component="fieldset" fullWidth disabled={submitted}>
          <RadioGroup
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
          >
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
                    {submitted && option === selectedAnswer && option !== question.correctAnswer && (
                      <Cancel color="error" fontSize="small" />
                    )}
                  </Box>
                }
                sx={{
                  p: 2,
                  mb: 1,
                  border: 1,
                  borderColor: submitted && option === question.correctAnswer
                    ? "success.main"
                    : submitted && option === selectedAnswer
                      ? "error.main"
                      : "grey.300",
                  borderRadius: 2,
                  bgcolor: submitted && option === question.correctAnswer
                    ? "success.light"
                    : submitted && option === selectedAnswer
                      ? "error.light"
                      : "transparent"
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

