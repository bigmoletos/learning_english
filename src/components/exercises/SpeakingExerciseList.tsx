/**
 * Liste des exercices de speaking disponibles par niveau (A2-C1)
 * @version 1.0.0
 * @date 09-11-2025
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Mic } from "@mui/icons-material";
import { SpeakingExercise } from "./SpeakingExercise";
import { LanguageLevel } from "../../types";
import { buildApiUrl } from "../../services/apiConfig";

interface SpeakingExerciseData {
  id: string;
  level: LanguageLevel;
  type: "pronunciation" | "fluency" | "grammar" | "vocabulary";
  title: string;
  prompt: string;
  targetSentence?: string;
  duration: number;
  difficulty: number;
  focusAreas: string[];
}

export const SpeakingExerciseList: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>("B1");
  const [exercises, setExercises] = useState<SpeakingExerciseData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<SpeakingExerciseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge les exercices pour le niveau sélectionné
   */
  const loadExercises = async (level: LanguageLevel) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/api/speaking-agent/exercises"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          count: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des exercices");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur lors du chargement");
      }

      setExercises(data.exercises || []);
    } catch (err: any) {
      console.error("[SpeakingExerciseList] Erreur:", err);
      setError(err.message || "Erreur lors du chargement des exercices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises(selectedLevel);
  }, [selectedLevel]);

  const handleLevelChange = (_event: React.SyntheticEvent, newValue: LanguageLevel) => {
    setSelectedLevel(newValue);
    setSelectedExercise(null);
  };

  const handleExerciseSelect = (exercise: SpeakingExerciseData) => {
    setSelectedExercise(exercise);
  };

  const handleExerciseComplete = (analysis: any) => {
    console.log("[SpeakingExerciseList] Exercice complété:", analysis);
    // Ici, on pourrait sauvegarder les résultats dans Firebase ou le backend
  };

  if (selectedExercise) {
    return (
      <Box>
        <Button onClick={() => setSelectedExercise(null)} sx={{ mb: 2 }} variant="outlined">
          ← Retour à la liste
        </Button>
        <SpeakingExercise exercise={selectedExercise} onComplete={handleExerciseComplete} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exercices de Speaking
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Pratiquez votre expression orale avec des exercices adaptés à votre niveau. L'agent IA
        analysera votre prononciation, grammaire et fluidité.
      </Typography>

      {/* Sélecteur de niveau */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedLevel}
          onChange={handleLevelChange as any}
          aria-label="Niveaux de langue"
        >
          <Tab label="A2" value="A2" />
          <Tab label="B1" value="B1" />
          <Tab label="B2" value="B2" />
          <Tab label="C1" value="C1" />
        </Tabs>
      </Box>

      {/* Erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Liste des exercices */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : exercises.length === 0 ? (
        <Alert severity="info">
          Aucun exercice disponible pour le niveau {selectedLevel}. Veuillez réessayer plus tard.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {exercises.map((exercise) => (
            <Grid item xs={12} md={6} key={exercise.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleExerciseSelect(exercise)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h3">
                      {exercise.title}
                    </Typography>
                    <Chip label={exercise.level} color="primary" size="small" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip label={exercise.type} size="small" color="secondary" sx={{ mr: 1 }} />
                    <Chip label={`${exercise.duration}s`} size="small" variant="outlined" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {exercise.prompt}
                  </Typography>

                  {exercise.focusAreas.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {exercise.focusAreas.map((area, idx) => (
                        <Chip
                          key={idx}
                          label={area}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}

                  <Button variant="contained" startIcon={<Mic />} fullWidth sx={{ mt: 2 }}>
                    Commencer l'exercice
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
