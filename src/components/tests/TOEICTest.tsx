/**
 * Composant TOEICTest - Test TOEIC complet
 * Inspiré de psality.com - Tests complets avec scoring par section
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
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
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import { Headphones, MenuBook, CheckCircle, Timer, Stop } from "@mui/icons-material";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";
import { LanguageLevel } from "../../types";
import { generateComprehensionAnalysis } from "../../utils/comprehensionAnalysis";

interface TOEICTestData {
  id: string;
  type: string;
  level: LanguageLevel;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  sections: TOEICSection[];
}

interface TOEICSection {
  id: string;
  name: string;
  type: "reading" | "listening";
  points: number;
  timeLimit: number;
  questions: TOEICQuestion[];
}

interface TOEICQuestion {
  id: string;
  text: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  grammarFocus?: string[];
  vocabularyFocus?: string[];
  points: number;
  level?: LanguageLevel;
}

interface TOEICTestProps {
  testId?: string;
  level?: LanguageLevel;
  onComplete?: (scores: {
    grammar: number;
    listening: number;
    total: number;
    level: LanguageLevel;
  }) => void;
}

export const TOEICTest: React.FC<TOEICTestProps> = ({ testId = "toeic_b2", level, onComplete }) => {
  const [testData, setTestData] = useState<TOEICTestData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ grammar: number; listening: number; total: number }>({
    grammar: 0,
    listening: 0,
    total: 0,
  });
  const [completed, setCompleted] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const { speak, isSpeaking, stop } = useTextToSpeech();

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const response = await fetch("/data/toeic_toefl/toeic_all_levels.json");
        const data = await response.json();

        // Chercher le test par niveau si fourni, sinon par testId
        let test: TOEICTestData;
        if (level) {
          test = data.tests.find((t: TOEICTestData) => t.level === level);
        } else {
          test = data.tests.find((t: TOEICTestData) => t.id === testId);
        }

        if (!test) {
          test = data.tests[0]; // Fallback au premier test
        }

        setTestData(test);
      } catch (error) {
        console.error("Erreur chargement test TOEIC:", error);
      }
    };

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

  const currentSection = testData?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions =
    testData?.sections.reduce((sum, section) => sum + section.questions.length, 0) || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion && currentQuestionIndex < currentSection!.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSectionIndex < testData!.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      calculateScores();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      const prevSection = testData!.sections[currentSectionIndex - 1];
      setCurrentQuestionIndex(prevSection.questions.length - 1);
    }
  };

  const calculateScores = () => {
    if (!testData) return;

    let grammarScore = 0;
    let listeningScore = 0;

    testData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        if (
          userAnswer &&
          userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        ) {
          if (section.id === "grammar") {
            grammarScore += question.points;
          } else if (section.id === "listening") {
            listeningScore += question.points;
          }
        }
      });
    });

    const totalScore = grammarScore + listeningScore;
    const newScores = { grammar: grammarScore, listening: listeningScore, total: totalScore };
    setScores(newScores);
    setCompleted(true);

    // Déterminer le niveau basé sur le score (similaire à psality.com)
    const grammarPercentage = (grammarScore / testData.sections[0].points) * 100;
    const listeningPercentage = (listeningScore / testData.sections[1].points) * 100;
    const totalPercentage = (totalScore / testData.totalPoints) * 100;

    let level: LanguageLevel;
    if (totalPercentage >= 85 && grammarPercentage >= 70 && listeningPercentage >= 80) {
      level = "C1";
    } else if (totalPercentage >= 70 && grammarPercentage >= 60 && listeningPercentage >= 70) {
      level = "B2";
    } else if (totalPercentage >= 50 && grammarPercentage >= 50 && listeningPercentage >= 50) {
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
        <Typography variant="h6">Chargement du test TOEIC...</Typography>
      </Box>
    );
  }

  if (completed) {
    const grammarPercentage = (scores.grammar / testData.sections[0].points) * 100;
    const listeningPercentage = (scores.listening / testData.sections[1].points) * 100;
    const totalPercentage = (scores.total / testData.totalPoints) * 100;

    let level: LanguageLevel;
    if (totalPercentage >= 85 && grammarPercentage >= 70 && listeningPercentage >= 80) {
      level = "C1";
    } else if (totalPercentage >= 70 && grammarPercentage >= 60 && listeningPercentage >= 70) {
      level = "B2";
    } else if (totalPercentage >= 50 && grammarPercentage >= 50 && listeningPercentage >= 50) {
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
                      GRAMMAIRE
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {scores.grammar} / {testData.sections[0].points} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {grammarPercentage.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      COMPREHENSION AUDIO
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {scores.listening} / {testData.sections[1].points} pts
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
                      TOTAL
                    </Typography>
                    <Typography variant="h3" color="secondary.main">
                      {scores.total} / {testData.totalPoints} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {totalPercentage.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: "primary.light", mb: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
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

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Temps total: {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} sec
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAnalysis(true)}
                sx={{ mt: 2 }}
              >
                Voir les analyses détaillées
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Écran d'analyse détaillée
  if (showAnalysis && testData) {
    return (
      <Box sx={{ p: 3 }}>
        <Button variant="text" onClick={() => setShowAnalysis(false)} sx={{ mb: 2 }}>
          ← Retour aux résultats
        </Button>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
              📊 Analyses de Compréhension Détaillées
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Test : {testData.title}
            </Typography>

            {testData.sections.map((section, _sectionIdx) => (
              <Box key={section.id} sx={{ mb: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  {section.name}
                </Typography>

                {section.questions.map((question, qIdx) => {
                  const userAnswer = answers[question.id];
                  const isCorrect =
                    userAnswer && question.correctAnswer
                      ? userAnswer.toLowerCase().trim() ===
                        question.correctAnswer.toLowerCase().trim()
                      : false;

                  return (
                    <Card key={question.id} variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Chip
                            label={`Question ${qIdx + 1}`}
                            color={isCorrect ? "success" : "error"}
                            variant={isCorrect ? "filled" : "outlined"}
                          />
                          <Chip label={`${question.points} points`} variant="outlined" />
                        </Box>

                        <Typography variant="h6" gutterBottom>
                          {question.text}
                        </Typography>

                        {section.type === "listening" && question.audioText && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Audio :</strong> {question.audioText}
                            </Typography>
                          </Alert>
                        )}

                        {question.options && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Options :
                            </Typography>
                            {question.options.map((option, optIdx) => (
                              <Typography
                                key={optIdx}
                                variant="body2"
                                sx={{
                                  p: 1,
                                  mb: 0.5,
                                  bgcolor:
                                    option === question.correctAnswer
                                      ? "success.light"
                                      : option === userAnswer && !isCorrect
                                        ? "error.light"
                                        : "grey.50",
                                  borderRadius: 1,
                                }}
                              >
                                {option === question.correctAnswer && "✅ "}
                                {option === userAnswer && !isCorrect && "❌ "}
                                {option}
                              </Typography>
                            ))}
                          </Box>
                        )}

                        {/* Toujours afficher les corrections détaillées */}
                        {generateComprehensionAnalysis({
                          questionId: question.id,
                          level: question.level || testData.level || "B2",
                          isCorrect: userAnswer ? isCorrect : false,
                          questionText: question.text,
                          userAnswer: userAnswer || "",
                          correctAnswer: question.correctAnswer,
                          grammarFocus: question.grammarFocus,
                          vocabularyFocus: question.vocabularyFocus,
                          customExplanation: question.explanation,
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

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
              label={`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, "0")}`}
              color="primary"
            />
          </Box>

          <Stepper activeStep={currentSectionIndex} sx={{ mb: 3 }}>
            {testData.sections.map((section, _index) => (
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
                    icon={currentSection?.type === "listening" ? <Headphones /> : <MenuBook />}
                    label={`Question ${currentQuestionIndex + 1} / ${currentSection!.questions.length}`}
                    color="primary"
                  />
                  <Chip label={`${currentQuestion.points} points`} variant="outlined" />
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

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  >
                    {currentQuestion.options.map((option, _index) => (
                      <FormControlLabel
                        key={_index}
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
                            bgcolor: "grey.50",
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
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
              endIcon={answeredQuestions === totalQuestions ? <CheckCircle /> : undefined}
            >
              {answeredQuestions === totalQuestions ? "Terminer le test" : "Suivant"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
