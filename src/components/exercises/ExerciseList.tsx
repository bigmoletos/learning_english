/**
 * Composant ExerciseList - Liste tous les exercices disponibles
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, FormControl,
  InputLabel, Select, MenuItem, SelectChangeEvent, Alert
} from "@mui/material";
import { School, Timer, TrendingUp } from "@mui/icons-material";
import { Exercise, LanguageLevel, ExerciseType } from "../../types";
import { QCMExercise } from "./QCMExercise";
import { ClozeExercise } from "./ClozeExercise";
import { useUser } from "../../contexts/UserContext";

export const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filterLevel, setFilterLevel] = useState<LanguageLevel | "all">("all");
  const [filterType, setFilterType] = useState<ExerciseType | "all">("all");
  const [incompleteFiltered, setIncompleteFiltered] = useState<number>(0);
  const { addResponse } = useUser();

  useEffect(() => {
    loadExercises();
  }, []);

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
          /^explanation about/i
        ];

        for (const option of question.options) {
          if (placeholderPatterns.some(pattern => pattern.test(option))) {
            return false; // Exercice incomplet trouvé
          }
        }
      }

      // Vérifier si la bonne réponse est un placeholder
      if (typeof question.correctAnswer === 'string') {
        if (/^primary use of|^correct statement about|^explanation about/i.test(question.correctAnswer)) {
          return false;
        }
      }

      // Vérifier si l'explication est un placeholder
      if (question.explanation && /^explanation about|^this is correct because/i.test(question.explanation)) {
        return false;
      }

      // Vérifier si le texte de la question est valide
      if (!question.text || question.text.trim().length < 10) {
        return false;
      }
    }

    return true;
  };

  const loadExercises = async () => {
    try {
      // Charger tous les QCM (200 exercices complets à 100%)
      const qcmResponse = await fetch('/data/exercises/all_qcm_200.json');
      const qcmData = await qcmResponse.json();
      
      // Charger tous les textes à trous (200 exercices complets à 100%)
      const clozeResponse = await fetch('/data/exercises/all_cloze_200.json');
      const clozeData = await clozeResponse.json();
      
      let allExercises = [
        ...(qcmData.exercises || qcmData || []),
        ...(clozeData.exercises || clozeData || [])
      ];

      // Double validation : s'assurer que tous les exercices sont complets à 100%
      const validExercises = allExercises.filter((ex: Exercise) => isValidExercise(ex));
      const invalidCount = allExercises.length - validExercises.length;

      if (invalidCount > 0) {
        console.warn(`⚠️ ${invalidCount} exercices incomplets filtrés (contiennent des placeholders)`);
        setIncompleteFiltered(invalidCount);
      }

      console.log(`✅ Chargé ${validExercises.length} exercices complets à 100% (${invalidCount} incomplets filtrés)`);
      setExercises(validExercises);
    } catch (error) {
      console.error("Erreur chargement exercices:", error);
      // Fallback: charger les petits fichiers (qui contiennent du vrai contenu validé)
      try {
        const qcmSmall = await fetch('/data/exercises/qcm_exercises.json');
        const clozeSmall = await fetch('/data/exercises/cloze_exercises.json');
        const qcmSmallData = await qcmSmall.json();
        const clozeSmallData = await clozeSmall.json();
        let fallbackExercises = [
          ...(qcmSmallData.exercises || []),
          ...(clozeSmallData.exercises || [])
        ];

        // Filtrer aussi les exercices incomplets dans le fallback
        const validFallbackExercises = fallbackExercises.filter((ex: Exercise) => isValidExercise(ex));
        console.log(`✅ Chargé ${validFallbackExercises.length} exercices fallback complets`);
        setExercises(validFallbackExercises);
      } catch (fallbackError) {
        console.error("Erreur chargement fallback:", fallbackError);
        setExercises([]);
      }
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const levelMatch = filterLevel === "all" || ex.level === filterLevel;
    const typeMatch = filterType === "all" || ex.type === filterType;
    return levelMatch && typeMatch;
  });

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleAnswer = (questionId: string, answer: string, isCorrect: boolean, timeSpent: number) => {
    if (selectedExercise) {
      addResponse({
        exerciseId: selectedExercise.id,
        questionId,
        answer,
        isCorrect,
        timeSpent,
        timestamp: new Date()
      });
    }
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
  };

  if (selectedExercise) {
    return (
      <Box sx={{ p: 3 }}>
        <Button onClick={handleBackToList} sx={{ mb: 3 }}>
          ← Retour aux exercices
        </Button>
        
        {selectedExercise.type === "qcm" ? (
          <Box>
            <Typography variant="h5" gutterBottom>{selectedExercise.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedExercise.description}
            </Typography>
            {selectedExercise.questions.map((question) => (
              <QCMExercise
                key={question.id}
                question={question}
                onAnswer={(answer, isCorrect, timeSpent) => 
                  handleAnswer(question.id, answer, isCorrect, timeSpent)
                }
              />
            ))}
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom>{selectedExercise.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selectedExercise.description}
            </Typography>
            {selectedExercise.questions.map((question) => (
              <ClozeExercise
                key={question.id}
                question={question}
                onAnswer={(answer, isCorrect, timeSpent) => 
                  handleAnswer(question.id, answer, isCorrect, timeSpent)
                }
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {incompleteFiltered > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note :</strong> {incompleteFiltered} exercice(s) incomplet(s) ont été automatiquement filtrés 
            car ils contiennent des placeholders au lieu de contenu réel. Seuls les exercices complets sont affichés.
          </Typography>
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Exercices disponibles
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
                      exercise.level === "C1" ? "error" : 
                      exercise.level === "B2" ? "warning" : 
                      exercise.level === "B1" ? "info" : "success"
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
                    <Typography variant="caption">
                      ~{exercise.estimatedTime} min
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <TrendingUp fontSize="small" color="action" />
                    <Typography variant="caption">
                      Niveau {exercise.difficulty}/5
                    </Typography>
                  </Box>
                </Box>

                <Chip 
                  label={exercise.domain} 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => handleExerciseClick(exercise)}
                >
                  Commencer
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

