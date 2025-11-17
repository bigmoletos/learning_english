/**
 * Composant ExerciseList - Liste tous les exercices disponibles
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from "@mui/material";
import { School, Timer, TrendingUp } from "@mui/icons-material";
import { Exercise, LanguageLevel, ExerciseType } from "../../types";
import { QCMExercise } from "./QCMExercise";
import { ClozeExercise } from "./ClozeExercise";
import { ListeningExercise } from "./ListeningExercise";
import { ReadingExercise } from "./ReadingExercise";
import { AudioPlayer } from "../voice/AudioPlayer";
// import { VoiceTester } from "../voice/VoiceTester"; // Commenté - testeur de voix désactivé
import { useUser } from "../../contexts/UserContext";

export const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filterLevel, setFilterLevel] = useState<LanguageLevel | "all">("all");
  const [filterType, setFilterType] = useState<ExerciseType | "all">("all");
  const [incompleteFiltered, setIncompleteFiltered] = useState<number>(0);
  const { addResponse } = useUser();

  // Fonction pour valider si un exercice est complet (pas de placeholders)
  const isValidExercise = (exercise: Exercise): boolean => {
    if (!exercise.questions || exercise.questions.length === 0) {
      return false;
    }

    // Vérifier chaque question
    for (const question of exercise.questions) {
      // Vérifier si les options sont des placeholders
      if (question.options) {
        const placeholderPatterns = [
          /^primary use of/i,
          /^alternative answer \d+$/i,
          /^incorrect statement [a-z]$/i,
          /^correct statement about/i,
          /^explanation about/i,
          /^other \d+$/i, // Ajout du pattern pour "Other 1", "Other 2", etc.
        ];

        for (const option of question.options) {
          if (placeholderPatterns.some((pattern) => pattern.test(option))) {
            return false; // Exercice incomplet trouvé
          }
        }
      }

      // Vérifier si la bonne réponse est un placeholder
      if (typeof question.correctAnswer === "string") {
        if (
          /^primary use of|^correct statement about|^explanation about/i.test(
            question.correctAnswer
          )
        ) {
          return false;
        }
      }

      // Vérifier si l'explication est un placeholder
      if (
        question.explanation &&
        /^explanation about|^this is correct because/i.test(question.explanation)
      ) {
        return false;
      }

      // Vérifier si le texte de la question est valide
      if (!question.text || question.text.trim().length < 10) {
        return false;
      }
    }

    return true;
  };

  // Fonction pour convertir un texte listening en exercice
  const convertListeningToExercise = (listeningText: any): Exercise => {
    if (!listeningText.questions || listeningText.questions.length === 0) {
      return null as any;
    }

    // Convertir toutes les questions au format Question
    const questions = listeningText.questions.map((q: any, idx: number) => ({
      id: q.id || `q${idx + 1}`,
      text: q.text,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: `This question tests your understanding of: ${listeningText.topic || "the listening text"}.`,
      grammarFocus: [],
      vocabularyFocus: [],
    }));

    return {
      id: listeningText.id,
      type: "listening" as ExerciseType,
      level: listeningText.level as LanguageLevel,
      domain: "ai" as any, // Par défaut, peut être amélioré
      title: listeningText.title,
      description: listeningText.topic || "Listening exercise",
      content: listeningText.transcript || "",
      questions: questions,
      estimatedTime: Math.ceil((listeningText.duration || 120) / 60),
      difficulty: 3,
      // Métadonnées supplémentaires pour listening
      audioUrl: listeningText.audioFile
        ? `/corpus/listening/${listeningText.audioFile}`
        : undefined,
      transcript: listeningText.transcript,
      listeningData: listeningText,
    } as any;
  };

  // Fonction pour convertir un texte reading en exercice
  const convertReadingToExercise = (readingText: any): Exercise => {
    if (!readingText.questions || readingText.questions.length === 0) {
      return null as any;
    }

    // Convertir toutes les questions au format Question
    const questions = readingText.questions.map((q: any, idx: number) => ({
      id: q.id || `q${idx + 1}`,
      text: q.text,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: `This question tests your understanding of: ${readingText.topic || "the reading text"}.`,
      grammarFocus: [],
      vocabularyFocus: [],
    }));

    return {
      id: readingText.id,
      type: "reading" as ExerciseType,
      level: readingText.level as LanguageLevel,
      domain: "ai" as any, // Par défaut, peut être amélioré
      title: readingText.title,
      description: readingText.topic || "Reading exercise",
      content: readingText.text || "",
      questions: questions,
      estimatedTime: readingText.readingTime || 5,
      difficulty: 3,
      // Métadonnées supplémentaires pour reading
      readingText: readingText.text,
      readingData: readingText,
    } as any;
  };

  const loadExercises = useCallback(async () => {
    try {
      // Charger tous les QCM (200 exercices complets à 100%)
      const qcmResponse = await fetch("/data/exercises/all_qcm_200.json");
      if (!qcmResponse.ok) {
        throw new Error(`Erreur HTTP ${qcmResponse.status} pour all_qcm_200.json`);
      }
      const qcmData = await qcmResponse.json();

      // Charger tous les textes à trous (200 exercices complets à 100%)
      const clozeResponse = await fetch("/data/exercises/all_cloze_200.json");
      if (!clozeResponse.ok) {
        throw new Error(`Erreur HTTP ${clozeResponse.status} pour all_cloze_200.json`);
      }
      const clozeData = await clozeResponse.json();

      // Charger les exercices listening
      let listeningExercises: Exercise[] = [];
      try {
        const listeningResponse = await fetch("/corpus/listening/all_listening_100.json");
        if (listeningResponse.ok) {
          const listeningData = await listeningResponse.json();
          const listeningTexts = listeningData.texts || [];
          listeningExercises = listeningTexts
            .map((text: any) => convertListeningToExercise(text))
            .filter((ex: Exercise | null) => ex !== null && ex !== undefined);
          console.log(`✅ Chargé ${listeningExercises.length} exercices listening`);
        }
      } catch (err) {
        console.warn("Erreur chargement listening:", err);
      }

      // Charger les exercices reading
      let readingExercises: Exercise[] = [];
      try {
        const readingResponse = await fetch("/corpus/reading/all_reading_100.json");
        if (readingResponse.ok) {
          const readingData = await readingResponse.json();
          const readingTexts = readingData.texts || [];
          readingExercises = readingTexts
            .map((text: any) => convertReadingToExercise(text))
            .filter((ex: Exercise | null) => ex !== null && ex !== undefined);
          console.log(`✅ Chargé ${readingExercises.length} exercices reading`);
        }
      } catch (err) {
        console.warn("Erreur chargement reading:", err);
      }

      // Gérer différents formats de fichiers JSON
      const qcmExercises = Array.isArray(qcmData) ? qcmData : qcmData.exercises || [];
      const clozeExercises = Array.isArray(clozeData) ? clozeData : clozeData.exercises || [];

      const allExercises = [
        ...qcmExercises,
        ...clozeExercises,
        ...listeningExercises,
        ...readingExercises,
      ];

      console.log(
        `📚 Total exercices chargés: ${allExercises.length} (${qcmExercises.length} QCM + ${clozeExercises.length} Cloze + ${listeningExercises.length} Listening + ${readingExercises.length} Reading)`
      );

      // Double validation : s'assurer que tous les exercices sont complets à 100%
      // Filtrer les exercices avec des options de placeholder (comme "Other 1", "Other 2", etc.)
      const validExercises = allExercises.filter((ex: Exercise) => {
        if (!isValidExercise(ex)) {
          return false;
        }
        // Vérifier spécifiquement les exercices listening/reading pour les placeholders "Other"
        if (ex.questions && (ex.type === "listening" || ex.type === "reading")) {
          for (const question of ex.questions) {
            if (question.options) {
              const hasPlaceholder = question.options.some((opt: string) =>
                /^other \d+$/i.test(opt.trim())
              );
              if (hasPlaceholder) {
                console.warn(
                  `⚠️ Exercice ${ex.id} filtré : contient des options placeholder "Other X"`
                );
                return false;
              }
            }
          }
        }
        return true;
      });
      const invalidCount = allExercises.length - validExercises.length;

      if (invalidCount > 0) {
        console.warn(
          `⚠️ ${invalidCount} exercices incomplets filtrés (contiennent des placeholders)`
        );
        setIncompleteFiltered(invalidCount);
      }

      console.log(
        `✅ Chargé ${validExercises.length} exercices complets à 100% (${invalidCount} incomplets filtrés)`
      );
      setExercises(validExercises);
    } catch (error) {
      console.error("Erreur chargement exercices:", error);
      // Fallback: charger les petits fichiers (qui contiennent du vrai contenu validé)
      try {
        const qcmSmall = await fetch("/data/exercises/qcm_exercises.json");
        const clozeSmall = await fetch("/data/exercises/cloze_exercises.json");
        const qcmSmallData = await qcmSmall.json();
        const clozeSmallData = await clozeSmall.json();
        const fallbackExercises = [
          ...(qcmSmallData.exercises || []),
          ...(clozeSmallData.exercises || []),
        ];

        // Filtrer aussi les exercices incomplets dans le fallback
        const validFallbackExercises = fallbackExercises.filter((ex: Exercise) =>
          isValidExercise(ex)
        );
        console.log(`✅ Chargé ${validFallbackExercises.length} exercices fallback complets`);
        setExercises(validFallbackExercises);
      } catch (fallbackError) {
        console.error("Erreur chargement fallback:", fallbackError);
        setExercises([]);
      }
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const filteredExercises = exercises.filter((ex) => {
    const levelMatch = filterLevel === "all" || ex.level === filterLevel;
    const typeMatch = filterType === "all" || ex.type === filterType;
    return levelMatch && typeMatch;
  });

  const handleExerciseClick = useCallback((exercise: Exercise) => {
    console.log("🔄 Clic sur exercice:", exercise.id, exercise.title);
    console.log("📋 Exercice complet:", exercise);
    console.log("📝 Questions:", exercise.questions?.length || 0);

    if (!exercise || !exercise.id) {
      console.error("❌ Erreur: exercice invalide", exercise);
      alert("Erreur: exercice invalide");
      return;
    }

    if (!exercise.questions || exercise.questions.length === 0) {
      console.error("❌ Erreur: l'exercice n'a pas de questions", exercise);
      alert("Cet exercice n'a pas de questions disponibles. Veuillez choisir un autre exercice.");
      return;
    }

    // Créer une copie de l'exercice pour éviter les problèmes de référence
    const exerciseCopy = {
      ...exercise,
      questions: [...exercise.questions],
    };

    console.log("✅ Définition de l'exercice sélectionné:", exerciseCopy.id);
    setSelectedExercise(exerciseCopy);
  }, []);

  const handleAnswer = (
    questionId: string,
    answer: string,
    isCorrect: boolean,
    timeSpent: number
  ) => {
    if (selectedExercise) {
      addResponse({
        exerciseId: selectedExercise.id,
        questionId,
        answer,
        isCorrect,
        timeSpent,
        timestamp: new Date(),
      });
    }
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
  };

  if (selectedExercise) {
    console.log("🎯 Rendu de l'exercice sélectionné:", selectedExercise.id, selectedExercise.title);
    return (
      <Box sx={{ p: 3 }}>
        <Button onClick={handleBackToList} sx={{ mb: 3 }} variant="outlined">
          ← Retour aux exercices
        </Button>

        {selectedExercise.type === "qcm" ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedExercise.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedExercise.description}
            </Typography>
            {selectedExercise.questions && selectedExercise.questions.length > 0 ? (
              selectedExercise.questions.map((question) => (
                <QCMExercise
                  key={question.id}
                  question={question}
                  onAnswer={(answer, isCorrect, timeSpent) =>
                    handleAnswer(question.id, answer, isCorrect, timeSpent)
                  }
                />
              ))
            ) : (
              <Alert severity="error">Aucune question disponible pour cet exercice.</Alert>
            )}
          </Box>
        ) : selectedExercise.type === "cloze" ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedExercise.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedExercise.description}
            </Typography>
            {selectedExercise.questions && selectedExercise.questions.length > 0 ? (
              selectedExercise.questions.map((question) => (
                <ClozeExercise
                  key={question.id}
                  question={question}
                  onAnswer={(answer, isCorrect, timeSpent) =>
                    handleAnswer(question.id, answer, isCorrect, timeSpent)
                  }
                />
              ))
            ) : (
              <Alert severity="error">Aucune question disponible pour cet exercice.</Alert>
            )}
          </Box>
        ) : selectedExercise.type === "listening" ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedExercise.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedExercise.description}
            </Typography>

            {/* Afficher l'audio une seule fois pour tout l'exercice */}
            {/* Utiliser AudioPlayer avec synthèse vocale car les fichiers audio MP3 n'existent pas */}
            {(selectedExercise as any).transcript && (
              <Box sx={{ mb: 3 }}>
                <AudioPlayer
                  text={(selectedExercise as any).transcript}
                  lang="en-US"
                  title="Audio - Écoutez la transcription"
                  showControls={true}
                  autoPlay={false}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Conseil :</strong> Cliquez sur le bouton lecture dans le lecteur audio
                    ci-dessus pour écouter la transcription. La transcription complète sera
                    disponible après avoir répondu aux questions.
                  </Typography>
                </Alert>
              </Box>
            )}

            {selectedExercise.questions && selectedExercise.questions.length > 0 ? (
              <>
                {selectedExercise.questions.map((question, idx) => {
                  console.log(`📝 Question ${idx + 1}:`, question);
                  return (
                    <ListeningExercise
                      key={question.id || `q${idx}`}
                      question={question}
                      onAnswer={(answer, isCorrect, timeSpent) =>
                        handleAnswer(question.id, answer, isCorrect, timeSpent)
                      }
                      audioUrl={undefined} // Pas besoin, l'audio est déjà affiché en haut
                      transcript={undefined} // Pas besoin, la transcription est déjà affichée en haut
                    />
                  );
                })}

                {/* Afficher la transcription complète après toutes les questions */}
                {(selectedExercise as any).transcript && (
                  <Box sx={{ mt: 4, p: 3, bgcolor: "grey.100", borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Transcription complète
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                      {(selectedExercise as any).transcript}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="error">Aucune question disponible pour cet exercice.</Alert>
            )}
          </Box>
        ) : selectedExercise.type === "reading" ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedExercise.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedExercise.description}
            </Typography>

            {/* Afficher le texte de lecture une seule fois en haut */}
            {(selectedExercise as any).readingText || selectedExercise.content ? (
              <Box sx={{ mb: 3, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Texte à lire :
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {(selectedExercise as any).readingText || selectedExercise.content}
                </Typography>
              </Box>
            ) : null}

            {selectedExercise.questions && selectedExercise.questions.length > 0 ? (
              selectedExercise.questions.map((question) => (
                <ReadingExercise
                  key={question.id}
                  question={question}
                  onAnswer={(answer, isCorrect, timeSpent) =>
                    handleAnswer(question.id, answer, isCorrect, timeSpent)
                  }
                  text={undefined} // Pas besoin, le texte est déjà affiché en haut
                />
              ))
            ) : (
              <Alert severity="error">Aucune question disponible pour cet exercice.</Alert>
            )}
          </Box>
        ) : (
          <Alert severity="error">Type d'exercice non supporté: {selectedExercise.type}</Alert>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* <VoiceTester /> */} {/* Commenté - testeur de voix désactivé */}
      {incompleteFiltered > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note :</strong> {incompleteFiltered} exercice(s) incomplet(s) ont été
            automatiquement filtrés car ils contiennent des placeholders au lieu de contenu réel.
            Seuls les exercices complets sont affichés.
          </Typography>
        </Alert>
      )}
      {exercises.length === 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Erreur :</strong> Aucun exercice n'a pu être chargé. Vérifiez la console pour
            plus de détails.
          </Typography>
        </Alert>
      )}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Exercices disponibles
        {exercises.length > 0 && (
          <Chip label={`${exercises.length} exercice(s) au total`} color="primary" sx={{ ml: 2 }} />
        )}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Niveau</InputLabel>
          <Select
            value={filterLevel}
            label="Niveau"
            onChange={(e: SelectChangeEvent) => setFilterLevel(e.target.value as any)}
          >
            <MenuItem value="all">Tous les niveaux</MenuItem>
            <MenuItem value="A2">A2</MenuItem>
            <MenuItem value="B1">B1</MenuItem>
            <MenuItem value="B2">B2</MenuItem>
            <MenuItem value="C1">C1</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e: SelectChangeEvent) => setFilterType(e.target.value as any)}
          >
            <MenuItem value="all">Tous les types</MenuItem>
            <MenuItem value="qcm">QCM</MenuItem>
            <MenuItem value="cloze">Texte à trous</MenuItem>
            <MenuItem value="listening">Listening (Compréhension orale)</MenuItem>
            <MenuItem value="reading">Reading (Compréhension écrite)</MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={`${filteredExercises.length} exercice(s)`}
          color="primary"
          sx={{ ml: "auto", alignSelf: "center" }}
        />
      </Box>
      <Grid container spacing={3}>
        {filteredExercises.map((exercise) => (
          <Grid item xs={12} sm={6} md={4} key={exercise.id}>
            <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Chip
                    label={exercise.level}
                    color={
                      exercise.level === "C1"
                        ? "error"
                        : exercise.level === "B2"
                          ? "warning"
                          : exercise.level === "B1"
                            ? "info"
                            : "success"
                    }
                    size="small"
                  />
                  <Chip
                    label={exercise.type === "qcm" ? "QCM" : "Texte à trous"}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ minHeight: 60 }}>
                  {exercise.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {exercise.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <School fontSize="small" color="action" />
                    <Typography variant="caption">
                      {exercise.questions.length} question(s)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Timer fontSize="small" color="action" />
                    <Typography variant="caption">~{exercise.estimatedTime} min</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <TrendingUp fontSize="small" color="action" />
                    <Typography variant="caption">Niveau {exercise.difficulty}/5</Typography>
                  </Box>
                </Box>

                <Chip label={exercise.domain} size="small" sx={{ mt: 1 }} />
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🖱️ ÉVÉNEMENT CLIC DÉTECTÉ pour:", exercise.id, exercise.title);
                    console.log("🔍 Exercice au moment du clic:", {
                      id: exercise.id,
                      title: exercise.title,
                      questionsCount: exercise.questions?.length || 0,
                      type: exercise.type,
                    });
                    handleExerciseClick(exercise);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    console.log("🖱️ MouseDown détecté pour:", exercise.id);
                  }}
                  disabled={!exercise.questions || exercise.questions.length === 0}
                  sx={{
                    cursor:
                      exercise.questions && exercise.questions.length > 0
                        ? "pointer"
                        : "not-allowed",
                    "&:hover": {
                      backgroundColor:
                        exercise.questions && exercise.questions.length > 0
                          ? "primary.dark"
                          : "action.disabled",
                    },
                  }}
                >
                  {exercise.questions && exercise.questions.length > 0
                    ? "Commencer"
                    : "Indisponible"}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {filteredExercises.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Aucun exercice trouvé pour ces critères
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Essayez de changer les filtres
          </Typography>
        </Box>
      )}
    </Box>
  );
};
