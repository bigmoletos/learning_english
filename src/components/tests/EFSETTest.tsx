/**
 * Composant EFSETTest - Test EF SET complet (4 compétences)
 * Inspiré de https://www.efset.org/fr/4-skill/launch/
 * Test adaptatif avec Reading, Listening, Writing, Speaking
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, LinearProgress, Alert, Stepper,
  Step, StepLabel, Chip, Grid, TextField
} from "@mui/material";
import { Headphones, MenuBook, Edit, Mic, Timer, Stop } from "@mui/icons-material";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { LanguageLevel } from "../../types";

interface EFSETTestData {
  id: string;
  type: string;
  level?: LanguageLevel;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  adaptive: boolean;
  sections: EFSETSection[];
}

interface EFSETSection {
  id: string;
  name: string;
  type: "reading" | "listening" | "writing" | "speaking";
  points: number;
  timeLimit: number;
  adaptive?: boolean;
  initialLevel?: LanguageLevel;
  questions: EFSETQuestion[];
}

interface EFSETQuestion {
  id: string;
  level: LanguageLevel;
  text: string;
  audioText?: string;
  type?: "essay" | "speaking";
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  points: number;
  nextLevel?: LanguageLevel;
  wrongLevel?: LanguageLevel;
  rubric?: {
    content?: number;
    organization?: number;
    language?: number;
    vocabulary?: number;
    fluency?: number;
    pronunciation?: number;
    grammar?: number;
  };
}

interface EFSETTestProps {
  testId?: string;
  level?: LanguageLevel;
  onComplete?: (scores: { reading: number; listening: number; writing: number; speaking: number; total: number; level: LanguageLevel }) => void;
}

export const EFSETTest: React.FC<EFSETTestProps> = ({ testId = "efset_b2", level, onComplete }) => {
  const [testData, setTestData] = useState<EFSETTestData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<LanguageLevel>("B2");
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ reading: number; listening: number; writing: number; speaking: number; total: number }>({
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
    total: 0
  });
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const { speak, isSpeaking, stop } = useTextToSpeech();
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const response = await fetch("/data/toeic_toefl/efset_all_levels.json");
        const data = await response.json();

        // Chercher le test par niveau si fourni, sinon par testId
        let test: EFSETTestData;
        if (level) {
          test = data.tests.find((t: EFSETTestData) => t.level === level);
        } else {
          test = data.tests.find((t: EFSETTestData) => t.id === testId);
        }

        if (!test) {
          test = data.tests[0]; // Fallback au premier test
        }

        setTestData(test);
        if (test.sections[0]?.initialLevel) {
          setCurrentLevel(test.sections[0].initialLevel);
        } else if (test.level) {
          setCurrentLevel(test.level);
        }
      } catch (error) {
        console.error("Erreur chargement test EF SET:", error);
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

  const getAvailableQuestions = () => {
    if (!testData) return [];

    const section = testData.sections[currentSectionIndex];
    if (!section.adaptive) {
      return section.questions;
    }

    // Test adaptatif : filtrer les questions par niveau actuel
    return section.questions.filter(q => q.level === currentLevel);
  };

  const availableQuestions = getAvailableQuestions();
  const currentSection = testData?.sections[currentSectionIndex];
  const currentQuestion = availableQuestions[currentQuestionIndex];
  const totalQuestions = testData?.sections.reduce((sum, section) => {
    if (section.adaptive) {
      // Pour les sections adaptatives, on estime le nombre de questions
      return sum + (section.questions.length / 2);
    }
    return sum + section.questions.length;
  }, 0) || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Test adaptatif : ajuster le niveau selon la réponse
    if (currentQuestion && currentQuestion.options) {
      const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer?.toLowerCase().trim();
      if (currentSection?.adaptive) {
        if (isCorrect && currentQuestion.nextLevel) {
          // Augmenter le niveau si la réponse est correcte
          setCurrentLevel(currentQuestion.nextLevel);
        } else if (!isCorrect && currentQuestion.wrongLevel) {
          // Diminuer le niveau si la réponse est incorrecte
          setCurrentLevel(currentQuestion.wrongLevel);
        }
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion && currentQuestionIndex < availableQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < testData!.sections.length - 1) {
      // Passer à la section suivante et réinitialiser le niveau si adaptatif
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      const nextSection = testData!.sections[currentSectionIndex + 1];
      if (nextSection.initialLevel) {
        setCurrentLevel(nextSection.initialLevel);
      }
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
      const prevQuestions = prevSection.adaptive
        ? prevSection.questions.filter(q => q.level === currentLevel)
        : prevSection.questions;
      setCurrentQuestionIndex(prevQuestions.length - 1);
    }
  };

  const calculateScores = () => {
    if (!testData) return;

    let readingScore = 0;
    let listeningScore = 0;
    let writingScore = 0;
    let speakingScore = 0;

    testData.sections.forEach(section => {
      section.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (question.type === "essay" || question.type === "speaking") {
          // Pour les questions d'essai/speaking, on donne une note basique
          if (userAnswer && userAnswer.length > 50) {
            if (section.id === "writing") {
              writingScore += question.points * 0.7; // Score approximatif
            } else if (section.id === "speaking") {
              speakingScore += question.points * 0.7; // Score approximatif
            }
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

    const totalScore = readingScore + listeningScore + writingScore + speakingScore;
    const newScores = { reading: readingScore, listening: listeningScore, writing: writingScore, speaking: speakingScore, total: totalScore };
    setScores(newScores);
    setCompleted(true);

    // Déterminer le niveau basé sur le score total (aligné CECR comme EF SET)
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

  const handleStartSpeaking = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!testData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Chargement du test EF SET...</Typography>
      </Box>
    );
  }

  if (completed) {
    const readingPercentage = (scores.reading / testData.sections[0].points) * 100;
    const listeningPercentage = (scores.listening / testData.sections[1].points) * 100;
    const writingPercentage = (scores.writing / testData.sections[2].points) * 100;
    const speakingPercentage = (scores.speaking / testData.sections[3].points) * 100;
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
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Test EF SET - 4 Compétences
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <MenuBook sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
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

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Headphones sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
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

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Edit sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
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

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center" }}>
                    <Mic sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      SPEAKING
                    </Typography>
                    <Typography variant="h3" color="warning.main">
                      {scores.speaking.toFixed(1)} / {testData.sections[3].points} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {speakingPercentage.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: "primary.light", mb: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  NIVEAU CECR
                </Typography>
                <Chip
                  label={level}
                  color="primary"
                  sx={{ fontSize: "2rem", height: "auto", py: 2, px: 3 }}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total: {scores.total.toFixed(1)} / {testData.totalPoints} pts ({totalPercentage.toFixed(1)}%)
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Temps total: {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} sec
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const isAnswered = currentQuestion && (
    currentQuestion.type === "essay" || currentQuestion.type === "speaking"
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
            {currentSection?.adaptive && (
              <Chip
                label={`Niveau actuel: ${currentLevel}`}
                color="info"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2">
              {answeredQuestions} / ~{Math.round(totalQuestions)}
            </Typography>
            <Chip
              icon={<Timer />}
              label={`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, "0")}`}
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
                        currentSection?.type === "writing" ? <Edit /> :
                          currentSection?.type === "speaking" ? <Mic /> : <MenuBook />
                    }
                    label={`Question ${currentQuestionIndex + 1} / ${availableQuestions.length}`}
                    color="primary"
                  />
                  <Chip
                    label={`${currentQuestion.points} points (${currentQuestion.level})`}
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
                    placeholder="Écrivez votre réponse ici (minimum 150 mots recommandé)..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ) : currentQuestion.type === "speaking" ? (
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant={listening ? "contained" : "outlined"}
                      startIcon={<Mic />}
                      onClick={handleStartSpeaking}
                      sx={{ mb: 2 }}
                      color={listening ? "error" : "primary"}
                    >
                      {listening ? "Arrêter l'enregistrement" : "Commencer à parler"}
                    </Button>
                    {transcript && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Transcription :</strong> {transcript}
                        </Typography>
                      </Alert>
                    )}
                    {currentQuestion.audioText && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Consigne :</strong> {currentQuestion.audioText}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
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
              {answeredQuestions >= totalQuestions ? "Terminer le test" : "Suivant"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

