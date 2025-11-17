/**
 * Liste des exercices de speaking pour réunions informatiques
 * @version 1.0.0
 * @date 09-11-2025
 */

import React, { useState } from "react";
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
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Groups,
  Support,
  Psychology,
  Gavel,
  Mic,
} from "@mui/icons-material";
import { SpeakingExercise } from "./SpeakingExercise";
import { LanguageLevel } from "../../types";
import {
  meetingSpeakingExercises,
  MeetingSpeakingExercise,
} from "../../data/exercises/meetingSpeakingExercises";

export const MeetingSpeakingExerciseList: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>("B1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] =
    useState<MeetingSpeakingExercise | null>(null);

  const handleLevelChange = (
    _event: React.SyntheticEvent,
    newValue: LanguageLevel
  ) => {
    setSelectedLevel(newValue);
    setSelectedExercise(null);
  };

  const handleCategoryChange = (
    _event: React.MouseEvent<HTMLElement>,
    newCategory: string
  ) => {
    if (newCategory !== null) {
      setSelectedCategory(newCategory);
    }
  };

  const handleExerciseSelect = (exercise: MeetingSpeakingExercise) => {
    setSelectedExercise(exercise);
  };

  const handleExerciseComplete = (analysis: any) => {
    console.log("[MeetingSpeakingExercise] Exercice complété:", analysis);
  };

  // Filtrer les exercices
  const filteredExercises = meetingSpeakingExercises.filter((ex) => {
    const levelMatch = ex.level === selectedLevel;
    const categoryMatch =
      selectedCategory === "all" || ex.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  // Catégories avec icônes
  const categories = [
    { id: "all", label: "Tous", icon: <Mic /> },
    { id: "team_meeting", label: "Réunion d'équipe", icon: <Groups /> },
    { id: "client_support", label: "Support client", icon: <Support /> },
    { id: "problem_solving", label: "Résolution de problèmes", icon: <Psychology /> },
    { id: "decision_making", label: "Prise de décision", icon: <Gavel /> },
  ];

  if (selectedExercise) {
    return (
      <Box>
        <Button
          onClick={() => setSelectedExercise(null)}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          ← Retour à la liste
        </Button>
        <SpeakingExercise
          exercise={{
            id: selectedExercise.id,
            level: selectedExercise.level,
            type: "fluency",
            title: selectedExercise.title,
            prompt: `**Scénario** : ${selectedExercise.scenario}\n\n**Votre mission** : ${selectedExercise.prompt}`,
            duration: selectedExercise.duration,
            difficulty: selectedExercise.difficulty,
            focusAreas: selectedExercise.focusAreas,
          }}
          onComplete={handleExerciseComplete}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exercices de Speaking - Réunions IT
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Pratiquez votre anglais technique dans des situations réelles de
        réunions : support client, réunions d'équipe, résolution de problèmes et
        prises de décision.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          💡 <strong>Conseils</strong> : Écoutez votre enregistrement, notez les
          phrases clés, et réessayez jusqu'à être à l'aise. Les phrases cibles
          sont affichées après chaque exercice.
        </Typography>
      </Alert>

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

      {/* Filtre par catégorie */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Catégorie
        </Typography>
        <ToggleButtonGroup
          value={selectedCategory}
          exclusive
          onChange={handleCategoryChange}
          aria-label="Catégorie d'exercice"
          sx={{ flexWrap: "wrap" }}
        >
          {categories.map((cat) => (
            <ToggleButton key={cat.id} value={cat.id}>
              {cat.icon}
              <Box sx={{ ml: 1 }}>{cat.label}</Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Liste des exercices */}
      {filteredExercises.length === 0 ? (
        <Alert severity="info">
          Aucun exercice disponible pour le niveau {selectedLevel} dans cette
          catégorie.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredExercises.map((exercise) => (
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
                    <Chip
                      label={exercise.level}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={
                        exercise.category === "team_meeting"
                          ? "Réunion d'équipe"
                          : exercise.category === "client_support"
                            ? "Support client"
                            : exercise.category === "problem_solving"
                              ? "Résolution de problèmes"
                              : "Prise de décision"
                      }
                      size="small"
                      color="secondary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${exercise.duration}s`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{ fontStyle: "italic" }}
                  >
                    <strong>Scénario :</strong> {exercise.scenario}
                  </Typography>

                  {exercise.focusAreas.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Focus :
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
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
                    </Box>
                  )}

                  {exercise.targetPhrases.length > 0 && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phrases clés à utiliser :
                      </Typography>
                      {exercise.targetPhrases.slice(0, 2).map((phrase, idx) => (
                        <Typography
                          key={idx}
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          • {phrase}
                        </Typography>
                      ))}
                      {exercise.targetPhrases.length > 2 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          +{exercise.targetPhrases.length - 2} autres...
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<Mic />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
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

