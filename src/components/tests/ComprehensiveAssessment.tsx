/**
 * Composant ComprehensiveAssessment - Test d'évaluation complet (Listening, Reading, Writing)
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, Alert,
  TextField, LinearProgress, Chip, IconButton, Tooltip
} from "@mui/material";
import { CheckCircle, Headphones, MenuBook, Edit, PlayArrow, Stop, VolumeUp } from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { LanguageLevel } from "../../types";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

interface AssessmentQuestion {
  id: string;
  section: "listening" | "reading" | "writing";
  question: string;
  audioText?: string; // Texte à lire (simulant l'audio)
  readingText?: string;
  options?: string[];
  correctAnswer: string | string[];
  level: LanguageLevel;
  points: number;
}

const assessmentQuestions: AssessmentQuestion[] = [
  // SECTION LISTENING (6 questions)
  {
    id: "l1",
    section: "listening",
    question: "Listen to the audio: 'The system was deployed yesterday.' What tense is used?",
    audioText: "The system was deployed yesterday.",
    options: ["Present Simple", "Past Simple", "Present Perfect", "Past Perfect"],
    correctAnswer: "Past Simple",
    level: "B1",
    points: 1
  },
  {
    id: "l2",
    section: "listening",
    question: "Listen: 'We have been working on this project for three months.' What does this indicate?",
    audioText: "We have been working on this project for three months.",
    options: [
      "The project is finished",
      "The project started in the past and continues now",
      "The project will start in three months",
      "The project lasted only three months"
    ],
    correctAnswer: "The project started in the past and continues now",
    level: "B2",
    points: 2
  },
  {
    id: "l3",
    section: "listening",
    question: "Listen: 'The vulnerability could have been prevented.' What is the meaning?",
    audioText: "The vulnerability could have been prevented.",
    options: [
      "It was prevented",
      "It will be prevented",
      "It was possible to prevent it but it wasn't done",
      "It cannot be prevented"
    ],
    correctAnswer: "It was possible to prevent it but it wasn't done",
    level: "C1",
    points: 3
  },
  {
    id: "l4",
    section: "listening",
    question: "Listen: 'By implementing CI/CD, deployment time has decreased significantly.' What happened?",
    audioText: "By implementing CI/CD, deployment time has decreased significantly.",
    options: [
      "Deployment takes more time now",
      "Deployment time stayed the same",
      "Deployment became much faster",
      "CI/CD was not implemented"
    ],
    correctAnswer: "Deployment became much faster",
    level: "B2",
    points: 2
  },
  {
    id: "l5",
    section: "listening",
    question: "Listen: 'Had the team followed best practices, the security breach would not have occurred.' What does this mean?",
    audioText: "Had the team followed best practices, the security breach would not have occurred.",
    options: [
      "The team followed best practices",
      "The team didn't follow best practices and there was a breach",
      "There was no security breach",
      "Best practices are not important"
    ],
    correctAnswer: "The team didn't follow best practices and there was a breach",
    level: "C1",
    points: 3
  },
  {
    id: "l6",
    section: "listening",
    question: "Listen: 'The application is being tested by the QA team.' What is the current status?",
    audioText: "The application is being tested by the QA team.",
    options: [
      "Testing is complete",
      "Testing will start soon",
      "Testing is happening right now",
      "Testing was cancelled"
    ],
    correctAnswer: "Testing is happening right now",
    level: "B2",
    points: 2
  },

  // SECTION READING (6 questions)
  {
    id: "r1",
    section: "reading",
    question: "What is the main topic of this text?",
    readingText: "Technical debt occurs when developers choose quick solutions over better approaches. While these shortcuts save time initially, they accumulate interest in the form of increased maintenance costs and reduced code quality. Managing technical debt requires regular refactoring and prioritization.",
    options: [
      "Quick coding techniques",
      "Managing shortcuts in software development",
      "Cost reduction strategies",
      "Code quality standards"
    ],
    correctAnswer: "Managing shortcuts in software development",
    level: "B2",
    points: 2
  },
  {
    id: "r2",
    section: "reading",
    question: "According to the text, what is the consequence of technical debt?",
    readingText: "Technical debt occurs when developers choose quick solutions over better approaches. While these shortcuts save time initially, they accumulate interest in the form of increased maintenance costs and reduced code quality. Managing technical debt requires regular refactoring and prioritization.",
    options: [
      "Faster development",
      "Better code quality",
      "Increased maintenance costs",
      "No consequences"
    ],
    correctAnswer: "Increased maintenance costs",
    level: "B2",
    points: 2
  },
  {
    id: "r3",
    section: "reading",
    question: "What does RAG stand for in AI systems?",
    readingText: "Retrieval-Augmented Generation (RAG) is an AI framework that combines the power of large language models with external knowledge retrieval. Rather than relying solely on pre-trained knowledge, RAG systems query a database or document corpus to retrieve relevant information, which is then used to generate more accurate and contextually appropriate responses.",
    options: [
      "Rapid Application Generation",
      "Retrieval-Augmented Generation",
      "Random Access Gateway",
      "Real-time Analytics Generator"
    ],
    correctAnswer: "Retrieval-Augmented Generation",
    level: "C1",
    points: 3
  },
  {
    id: "r4",
    section: "reading",
    question: "How does RAG improve AI responses?",
    readingText: "Retrieval-Augmented Generation (RAG) is an AI framework that combines the power of large language models with external knowledge retrieval. Rather than relying solely on pre-trained knowledge, RAG systems query a database or document corpus to retrieve relevant information, which is then used to generate more accurate and contextually appropriate responses.",
    options: [
      "By using only pre-trained data",
      "By accessing external knowledge sources",
      "By generating random responses",
      "By reducing computation time"
    ],
    correctAnswer: "By accessing external knowledge sources",
    level: "C1",
    points: 3
  },
  {
    id: "r5",
    section: "reading",
    question: "What is the primary purpose of MLOps?",
    readingText: "MLOps (Machine Learning Operations) applies DevOps principles to machine learning workflows. It encompasses the practices, tools, and cultural philosophies necessary to deploy, monitor, and maintain ML models in production. Key aspects include automated testing, continuous integration/continuous deployment (CI/CD), model versioning, and performance monitoring.",
    options: [
      "To replace DevOps engineers",
      "To deploy and maintain ML models in production",
      "To train machine learning models",
      "To reduce computational costs"
    ],
    correctAnswer: "To deploy and maintain ML models in production",
    level: "B2",
    points: 2
  },
  {
    id: "r6",
    section: "reading",
    question: "Which is NOT mentioned as a key aspect of MLOps?",
    readingText: "MLOps (Machine Learning Operations) applies DevOps principles to machine learning workflows. It encompasses the practices, tools, and cultural philosophies necessary to deploy, monitor, and maintain ML models in production. Key aspects include automated testing, continuous integration/continuous deployment (CI/CD), model versioning, and performance monitoring.",
    options: [
      "Automated testing",
      "Model versioning",
      "Manual deployment",
      "Performance monitoring"
    ],
    correctAnswer: "Manual deployment",
    level: "B2",
    points: 2
  },

  // SECTION WRITING (6 questions)
  {
    id: "w1",
    section: "writing",
    question: "Complete the sentence: The bug ___ fixed by the developer yesterday.",
    correctAnswer: ["was"],
    level: "B1",
    points: 1
  },
  {
    id: "w2",
    section: "writing",
    question: "Complete: We have ___ implementing microservices for two years.",
    correctAnswer: ["been"],
    level: "B2",
    points: 2
  },
  {
    id: "w3",
    section: "writing",
    question: "Complete: Technical debt accumulates when teams choose quick solutions ___ of better approaches.",
    correctAnswer: ["instead"],
    level: "B2",
    points: 2
  },
  {
    id: "w4",
    section: "writing",
    question: "Complete: Had the team ___ the security audit, the breach would not have occurred.",
    correctAnswer: ["conducted", "performed", "done", "completed"],
    level: "C1",
    points: 3
  },
  {
    id: "w5",
    section: "writing",
    question: "Complete: Not only ___ the system more secure, but it also improved performance.",
    correctAnswer: ["did it make", "did we make"],
    level: "C1",
    points: 3
  },
  {
    id: "w6",
    section: "writing",
    question: "Complete: The application ___ currently ___ tested by the QA team.",
    correctAnswer: ["is being"],
    level: "B2",
    points: 2
  }
];

export const ComprehensiveAssessment: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState<"listening" | "reading" | "writing">("listening");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);
  const [assessedLevel, setAssessedLevel] = useState<LanguageLevel | null>(null);
  const { user, setUser } = useUser();
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  const sectionQuestions = assessmentQuestions.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const playAudio = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, "en-US");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Passer à la section suivante
      if (currentSection === "listening") {
        setCurrentSection("reading");
        setCurrentQuestionIndex(0);
      } else if (currentSection === "reading") {
        setCurrentSection("writing");
        setCurrentQuestionIndex(0);
      } else {
        calculateLevel();
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSection === "reading") {
      setCurrentSection("listening");
      setCurrentQuestionIndex(assessmentQuestions.filter(q => q.section === "listening").length - 1);
    } else if (currentSection === "writing") {
      setCurrentSection("reading");
      setCurrentQuestionIndex(assessmentQuestions.filter(q => q.section === "reading").length - 1);
    }
  };

  const calculateLevel = () => {
    let totalPoints = 0;
    let maxPoints = 0;

    assessmentQuestions.forEach(q => {
      maxPoints += q.points;
      const userAnswer = answers[q.id]?.toLowerCase().trim();
      
      if (Array.isArray(q.correctAnswer)) {
        // Pour les questions writing
        if (q.correctAnswer.some(ans => userAnswer === ans.toLowerCase())) {
          totalPoints += q.points;
        }
      } else {
        // Pour les QCM
        if (userAnswer === q.correctAnswer.toLowerCase()) {
          totalPoints += q.points;
        }
      }
    });

    const percentage = (totalPoints / maxPoints) * 100;
    
    let level: LanguageLevel;
    if (percentage >= 80) level = "C1";
    else if (percentage >= 65) level = "B2";
    else if (percentage >= 45) level = "B1";
    else level = "A2";

    setAssessedLevel(level);
    setCompleted(true);

    if (user) {
      setUser({
        ...user,
        currentLevel: level,
        lastActivity: new Date()
      });
    }
  };

  const isAnswered = answers[currentQuestion?.id] !== undefined;

  if (completed && assessedLevel) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 3 }} />
            
            <Typography variant="h4" gutterBottom>
              Évaluation complète terminée !
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
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Résultats détaillés :</strong>
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "space-around" }}>
                <Box>
                  <Headphones sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  <Typography variant="caption">
                    Listening: {assessmentQuestions.filter(q => q.section === "listening" && 
                      answers[q.id]?.toLowerCase() === (Array.isArray(q.correctAnswer) ? 
                        q.correctAnswer[0] : q.correctAnswer).toLowerCase()).length}/6
                  </Typography>
                </Box>
                <Box>
                  <MenuBook sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  <Typography variant="caption">
                    Reading: {assessmentQuestions.filter(q => q.section === "reading" && 
                      answers[q.id]?.toLowerCase() === (Array.isArray(q.correctAnswer) ? 
                        q.correctAnswer[0] : q.correctAnswer).toLowerCase()).length}/6
                  </Typography>
                </Box>
                <Box>
                  <Edit sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  <Typography variant="caption">
                    Writing: {assessmentQuestions.filter(q => q.section === "writing" && 
                      Array.isArray(q.correctAnswer) && q.correctAnswer.some(ans => 
                        answers[q.id]?.toLowerCase().trim() === ans.toLowerCase())).length}/6
                  </Typography>
                </Box>
              </Box>
            </Alert>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Les exercices seront adaptés à votre niveau. Vous pouvez commencer dès maintenant !
            </Typography>

            <Button 
              variant="contained" 
              size="large"
              onClick={onComplete}
            >
              Commencer les exercices
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Évaluation complète de niveau
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cette évaluation comporte 18 questions réparties en 3 sections : 
        <strong> Listening (compréhension orale)</strong>, 
        <strong> Reading (compréhension écrite)</strong>, et 
        <strong> Writing (expression écrite)</strong>.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progression globale : {answeredCount}/{totalQuestions} questions
          </Typography>
          <Typography variant="body2" color="primary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Chip 
          icon={<Headphones />}
          label="Listening"
          color={currentSection === "listening" ? "primary" : "default"}
          variant={currentSection === "listening" ? "filled" : "outlined"}
        />
        <Chip 
          icon={<MenuBook />}
          label="Reading"
          color={currentSection === "reading" ? "primary" : "default"}
          variant={currentSection === "reading" ? "filled" : "outlined"}
        />
        <Chip 
          icon={<Edit />}
          label="Writing"
          color={currentSection === "writing" ? "primary" : "default"}
          variant={currentSection === "writing" ? "filled" : "outlined"}
        />
      </Box>

      <Card elevation={3}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary">
              {currentSection.toUpperCase()} - Question {currentQuestionIndex + 1} / {sectionQuestions.length}
            </Typography>

            {currentSection === "listening" && currentQuestion.audioText && (
              <Box sx={{ my: 2, p: 3, bgcolor: "primary.light", borderRadius: 2, border: 2, borderColor: "primary.main" }}>
                {!isSupported && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Votre navigateur ne supporte pas la synthèse vocale. Veuillez utiliser Chrome, Edge ou Safari.
                  </Alert>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <VolumeUp sx={{ fontSize: 40, color: "white" }} />
                  <Typography variant="h6" sx={{ color: "white", flexGrow: 1 }}>
                    Section d'écoute
                  </Typography>
                  <Tooltip title={isSpeaking ? "Arrêter" : "Écouter"}>
                    <IconButton
                      onClick={() => playAudio(currentQuestion.audioText!)}
                      disabled={!isSupported}
                      sx={{ 
                        bgcolor: "white", 
                        "&:hover": { bgcolor: "grey.200" },
                        width: 60,
                        height: 60
                      }}
                    >
                      {isSpeaking ? <Stop sx={{ fontSize: 30 }} /> : <PlayArrow sx={{ fontSize: 30 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.primary" }}>
                    "{currentQuestion.audioText}"
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ display: "block", mt: 1, color: "white" }}>
                  💡 Cliquez sur le bouton lecture pour entendre le texte en anglais
                </Typography>
              </Box>
            )}

            {currentSection === "reading" && currentQuestion.readingText && (
              <Box sx={{ my: 2, p: 3, bgcolor: "grey.50", borderRadius: 2, border: 1, borderColor: "grey.300" }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {currentQuestion.readingText}
                </Typography>
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
              {currentQuestion.question}
            </Typography>

            {currentSection === "writing" ? (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Entrez votre réponse ici..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                multiline={false}
                sx={{ mb: 2 }}
              />
            ) : (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                >
                  {currentQuestion.options?.map((option, index) => (
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
                        "&:hover": { bgcolor: "grey.50" }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={currentSection === "listening" && currentQuestionIndex === 0}
            >
              Précédent
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isAnswered}
            >
              {currentSection === "writing" && currentQuestionIndex === sectionQuestions.length - 1
                ? "Terminer l'évaluation"
                : "Suivant"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

