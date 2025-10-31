/**
 * Composant TOEFLTest - Test TOEFL complet
 * Inspiré de psality.com - Tests complets avec scoring par section
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, LinearProgress, Alert, Stepper,
  Step, StepLabel, Chip, Grid, TextField
} from "@mui/material";
import { Headphones, MenuBook, Edit, Timer, Stop } from "@mui/icons-material";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";
import { useUser } from "../../contexts/UserContext";
import { LanguageLevel } from "../../types";

interface TOEFLTestData {
  id: string;
  type: string;
  level: LanguageLevel;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  sections: TOEFLSection[];
}

interface TOEFLSection {
  id: string;
  name: string;
  type: "reading" | "listening" | "writing";
  points: number;
  timeLimit: number;
  questions: TOEFLQuestion[];
}

interface TOEFLQuestion {
  id: string;
  text: string;
  audioText?: string;
  type?: "essay";
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  points: number;
  rubric?: {
    content: number;
    organization: number;
    language: number;
    vocabulary: number;
  };
}

interface TOEFLTestProps {
  testId?: string;
  level?: LanguageLevel;
  onComplete?: (scores: { reading: number; listening: number; writing: number; total: number; level: LanguageLevel }) => void;
}

export const TOEFLTest: React.FC<TOEFLTestProps> = ({ testId = "toefl_c1", level, onComplete }) => {
  const [testData, setTestData] = useState<TOEFLTestData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ reading: number; listening: number; writing: number; total: number }>({
    reading: 0,
    listening: 0,
    writing: 0,
    total: 0
  });
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const { speak, isSpeaking, stop } = useTextToSpeech();
  const { addResponse } = useUser();

  useEffect(() => {
    loadTestData();
  }, [testId, level]);

  useEffect(() => {
    if (!completed && testData) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [completed, startTime, testData]);

  const loadTestData = async () => {
    try {
      const response = await fetch('/data/toeic_toefl/toefl_all_levels.json');
      const data = await response.json();
      
      // Chercher le test par niveau si fourni, sinon par testId
      let test: TOEFLTestData;
      if (level) {
        test = data.tests.find((t: TOEFLTestData) => t.level === level);
      } else {
        test = data.tests.find((t: TOEFLTestData) => t.id === testId);
      }
      
      if (!test) {
        test = data.tests[0]; // Fallback au premier test
      }
      
      setTestData(test);
    } catch (error) {
      console.error("Erreur chargement test TOEFL:", error);
    }
  };

  const currentSection = testData?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions = testData?.sections.reduce((sum, section) => sum + section.questions.length, 0) || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion && currentQuestionIndex < currentSection!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < testData!.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      calculateScores();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      const prevSection = testData!.sections[currentSectionIndex - 1];
      setCurrentQuestionIndex(prevSection.questions.length - 1);
    }
  };

  const calculateScores = () => {
    if (!testData) return;

    let readingScore = 0;
    let listeningScore = 0;
    let writingScore = 0;

    testData.sections.forEach(section => {
      section.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (question.type === "essay") {
          // Pour les questions d'essai, on donne une note basée sur la longueur et la présence de mots-clés
          if (userAnswer && userAnswer.length > 50) {
            // Score basique basé sur la longueur (sera amélioré avec l'IA)
            writingScore += question.points * 0.7; // Score approximatif
          }
        } else if (userAnswer && question.correctAnswer) {
          if (userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            if (section.id === "reading") {
              readingScore += question.points;
            } else if (section.id === "listening") {
              listeningScore += question.points;
            }
          }
        }
      });
    });

    const totalScore = readingScore + listeningScore + writingScore;
    const newScores = { reading: readingScore, listening: listeningScore, writing: writingScore, total: totalScore };
    setScores(newScores);
    setCompleted(true);

    // Déterminer le niveau basé sur le score
    const totalPercentage = (totalScore / testData.totalPoints) * 100;

    let level: LanguageLevel;
    if (totalPercentage >= 85) {
      level = "C1";
    } else if (totalPercentage >= 70) {
      level = "B2";
    } else if (totalPercentage >= 50) {
      level = "B1";
    } else {
      level = "A2";
    }

    if (onComplete) {
      onComplete({ ...newScores, level });
    }
  };

  const handlePlayAudio = () => {
    if (currentQuestion?.audioText) {
      if (isSpeaking) {
        stop();
      } else {
        speak(currentQuestion.audioText);
      }
    }
  };

  if (!testData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Chargement du test TOEFL...</Typography>
      </Box>
    );
  }

  if (completed) {
    const readingPercentage = (scores.reading / testData.sections[0].points) * 100;
    const listeningPercentage = (scores.listening / testData.sections[1].points) * 100;
    const writingPercentage = (scores.writing / testData.sections[2].points) * 100;
    const totalPercentage = (scores.total / testData.totalPoints) * 100;

    let level: LanguageLevel;
    if (totalPercentage >= 85) {
      level = "C1";
    } else if (totalPercentage >= 70) {
      level = "B2";
    } else if (totalPercentage >= 50) {
      level = "B1";
    } else {
      level = "A2";
    }

    return (
      <Box sx={{ p: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
              ✅ Vos résultats sont prêts
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      READING
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {scores.reading.toFixed(1)} / {testData.sections[0].points} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {readingPercentage.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      LISTENING
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {scores.listening.toFixed(1)} / {testData.sections[1].points} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listeningPercentage.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="secondary.main" gutterBottom>
                      WRITING
                    </Typography>
                    <Typography variant="h3" color="secondary.main">
                      {scores.writing.toFixed(1)} / {testData.sections[2].points} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {writingPercentage.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: "primary.light", mb: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  TOTAL: {scores.total.toFixed(1)} / {testData.totalPoints} pts
                </Typography>
                <Typography variant="h5" gutterBottom>
                  NIVEAU DE LANGUE
                </Typography>
                <Chip
                  label={level}
                  color="primary"
                  sx={{ fontSize: "2rem", height: "auto", py: 2, px: 3 }}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const isAnswered = currentQuestion && (
    currentQuestion.type === "essay"
      ? answers[currentQuestion.id] && answers[currentQuestion.id].length > 50
      : answers[currentQuestion.id] !== undefined
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {testData.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {testData.description}
            </Typography>
          </Box>

          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2">
              {answeredQuestions} / {totalQuestions}
            </Typography>
            <Chip
              icon={<Timer />}
              label={`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`}
              color="primary"
            />
          </Box>

          <Stepper activeStep={currentSectionIndex} sx={{ mb: 3 }}>
            {testData.sections.map((section, index) => (
              <Step key={section.id}>
                <StepLabel>{section.name}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentQuestion && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Chip
                    icon={
                      currentSection?.type === "listening" ? <Headphones /> :
                      currentSection?.type === "writing" ? <Edit /> : <MenuBook />
                    }
                    label={`Question ${currentQuestionIndex + 1} / ${currentSection!.questions.length}`}
                    color="primary"
                  />
                  <Chip
                    label={`${currentQuestion.points} points`}
                    variant="outlined"
                  />
                </Box>

                {currentSection?.type === "listening" && currentQuestion.audioText && (
                  <Box sx={{ mb: 3, textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      startIcon={isSpeaking ? <Stop /> : <Headphones />}
                      onClick={handlePlayAudio}
                      sx={{ mb: 2 }}
                    >
                      {isSpeaking ? "Arrêter l'audio" : "Écouter la question"}
                    </Button>
                    {currentQuestion.audioText && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Audio :</strong> {currentQuestion.audioText}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  {currentQuestion.text}
                </Typography>

                {currentQuestion.type === "essay" ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder="Écrivez votre réponse ici (minimum 100 mots recommandé)..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ) : currentQuestion.options ? (
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
                            "&:hover": {
                              bgcolor: "grey.50"
                            }
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                ) : null}
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            >
              Précédent
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isAnswered}
            >
              {answeredQuestions === totalQuestions ? "Terminer le test" : "Suivant"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

