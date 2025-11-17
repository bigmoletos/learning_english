/**
 * Composant LevelAssessment - Test d'évaluation du niveau initial
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import { CheckCircle, School } from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { LanguageLevel } from "../../types";

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  level: LanguageLevel;
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "q1",
    question: "What ___ you do yesterday?",
    options: ["do", "did", "does", "doing"],
    correctAnswer: "did",
    level: "A2",
  },
  {
    id: "q2",
    question: "I ___ English for 5 years.",
    options: ["study", "studied", "have studied", "am studying"],
    correctAnswer: "have studied",
    level: "B1",
  },
  {
    id: "q3",
    question: "The application ___ by the development team last week.",
    options: ["deployed", "was deployed", "has deployed", "is deploying"],
    correctAnswer: "was deployed",
    level: "B2",
  },
  {
    id: "q4",
    question: "Technical debt accumulates when teams choose quick solutions ___ better approaches.",
    options: ["instead of", "instead", "rather", "than"],
    correctAnswer: "instead of",
    level: "B2",
  },
  {
    id: "q5",
    question: "Had I known about the vulnerability earlier, I ___ the patch immediately.",
    options: ["would apply", "will apply", "would have applied", "applied"],
    correctAnswer: "would have applied",
    level: "C1",
  },
  {
    id: "q6",
    question: "Not only ___ the system more secure, but it also improved performance.",
    options: ["it made", "made it", "did it make", "it did make"],
    correctAnswer: "did it make",
    level: "C1",
  },
];

export const LevelAssessment: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);
  const [assessedLevel, setAssessedLevel] = useState<LanguageLevel | null>(null);
  const { user, setUser } = useUser();

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      calculateLevel();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const calculateLevel = () => {
    let score = 0;
    let maxScore = 0;

    assessmentQuestions.forEach((q) => {
      maxScore++;
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = (score / maxScore) * 100;

    let level: LanguageLevel;
    if (percentage >= 85) level = "C1";
    else if (percentage >= 70) level = "B2";
    else if (percentage >= 50) level = "B1";
    else level = "A2";

    setAssessedLevel(level);
    setCompleted(true);

    if (user) {
      setUser({
        ...user,
        currentLevel: level,
        lastActivity: new Date(),
      });
    }
  };

  const currentQuestion = assessmentQuestions[currentStep];
  const isAnswered = answers[currentQuestion?.id] !== undefined;

  if (completed && assessedLevel) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 3 }} />

            <Typography variant="h4" gutterBottom>
              Évaluation terminée !
            </Typography>

            <Box sx={{ my: 4, p: 3, bgcolor: "primary.light", borderRadius: 2 }}>
              <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
                Votre niveau estimé :
              </Typography>
              <Typography variant="h2" sx={{ color: "white", fontWeight: "bold" }}>
                {assessedLevel}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body2">
                <strong>Résultats :</strong>{" "}
                {
                  Object.values(answers).filter(
                    (a, i) => a === assessmentQuestions[i].correctAnswer
                  ).length
                }{" "}
                / {assessmentQuestions.length} bonnes réponses
              </Typography>
            </Alert>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Les exercices seront adaptés à votre niveau. Vous pouvez commencer dès maintenant !
            </Typography>

            <Button variant="contained" size="large" onClick={onComplete} startIcon={<School />}>
              Commencer les exercices
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Évaluation de votre niveau
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        Répondez aux 6 questions suivantes pour déterminer votre niveau actuel en anglais technique.
        Cela nous permettra de vous proposer des exercices adaptés.
      </Alert>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {assessmentQuestions.map((q, index) => (
          <Step key={q.id}>
            <StepLabel>Question {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card elevation={3}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Question {currentStep + 1} / {assessmentQuestions.length}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, mb: 3 }}>
              {currentQuestion.question}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: 1,
                      borderColor: "grey.300",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button onClick={handleBack} disabled={currentStep === 0}>
              Précédent
            </Button>

            <Button variant="contained" onClick={handleNext} disabled={!isAnswered}>
              {currentStep === assessmentQuestions.length - 1 ? "Terminer" : "Suivant"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
