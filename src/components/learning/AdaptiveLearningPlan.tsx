/**
 * Composant AdaptiveLearningPlan - Programme d'apprentissage adaptatif
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Button, Chip, LinearProgress,
  Alert, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Tooltip
} from "@mui/material";
import {
  School, TrendingUp, Edit, Refresh, CheckCircle, Warning,
  Timeline, PlayArrow, Remove, Add
} from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { LanguageLevel, ExerciseType, TechnicalDomain } from "../../types";
import { analyzeUserProgress } from "../../agents/progressAgent";

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  targetLevel: LanguageLevel;
  estimatedWeeks: number;
  progress: number;
  exerciseTypes: ExerciseType[];
  domains: TechnicalDomain[];
  completed: boolean;
}

interface WeaknessArea {
  area: string;
  severity: "critical" | "moderate" | "minor";
  occurrences: number;
  recommendedExercises: number;
}

interface AdaptiveLearningPlanProps {
  onNavigate?: (view: string) => void;
}

export const AdaptiveLearningPlan: React.FC<AdaptiveLearningPlanProps> = ({ onNavigate }) => {
  const { user, responses } = useUser();
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessArea[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [autoAdapt, setAutoAdapt] = useState(true);

  useEffect(() => {
    generateAdaptivePlan();
  }, [responses, user]);

  const generateAdaptivePlan = () => {
    if (!user) return;

    // Analyser les réponses pour détecter les faiblesses
    const analysis = analyzeUserProgress(responses);
    
    // Identifier les points faibles
    const detectedWeaknesses: WeaknessArea[] = [
      ...analysis.weakAreas.map((area: string) => ({
        area,
        severity: "moderate" as const,
        occurrences: responses.filter((r: any) => !r.isCorrect).length,
        recommendedExercises: 10
      }))
    ];

    setWeaknesses(detectedWeaknesses);

    // Générer les objectifs d'apprentissage adaptatifs
    const goals: LearningGoal[] = [];
    const currentLevel = user.currentLevel;
    const targetLevel = user.targetLevel;

    // Objectif 1 : Consolider le niveau actuel
    goals.push({
      id: "consolidate",
      title: `Consolider le niveau ${currentLevel}`,
      description: "Maîtriser les fondamentaux de votre niveau actuel",
      priority: "high",
      targetLevel: currentLevel,
      estimatedWeeks: 2,
      progress: calculateProgress(currentLevel, responses),
      exerciseTypes: ["qcm", "cloze"],
      domains: getPriorityDomains(responses),
      completed: false
    });

    // Objectif 2 : Améliorer les points faibles
    if (detectedWeaknesses.length > 0) {
      goals.push({
        id: "weaknesses",
        title: "Améliorer les points faibles",
        description: `Travailler sur : ${detectedWeaknesses.map(w => w.area).join(", ")}`,
        priority: "high",
        targetLevel: currentLevel,
        estimatedWeeks: 3,
        progress: 0,
        exerciseTypes: ["cloze", "writing"],
        domains: ["ai", "devops"],
        completed: false
      });
    }

    // Objectif 3 : Préparer le niveau supérieur
    if (currentLevel !== "C1") {
      const nextLevel = getNextLevel(currentLevel);
      goals.push({
        id: "next_level",
        title: `Progresser vers le niveau ${nextLevel}`,
        description: "Introduction aux concepts du niveau supérieur",
        priority: "medium",
        targetLevel: nextLevel,
        estimatedWeeks: 4,
        progress: 0,
        exerciseTypes: ["qcm", "reading"],
        domains: ["ai", "cybersecurity"],
        completed: false
      });
    }

    // Objectif 4 : Préparation TOEIC/TOEFL
    goals.push({
      id: "exam_prep",
      title: "Préparation TOEIC/TOEFL",
      description: `Entraînement ciblé pour le niveau ${targetLevel}`,
      priority: "low",
      targetLevel: targetLevel,
      estimatedWeeks: 6,
      progress: 0,
      exerciseTypes: ["listening", "reading"],
      domains: ["ai", "devops", "cybersecurity"],
      completed: false
    });

    setLearningGoals(goals);
  };

  const calculateProgress = (level: LanguageLevel, responses: any[]): number => {
    const levelResponses = responses.filter((r: any) => r.exerciseLevel === level);
    if (levelResponses.length === 0) return 0;
    const correct = levelResponses.filter((r: any) => r.isCorrect).length;
    return Math.round((correct / levelResponses.length) * 100);
  };

  const getPriorityDomains = (responses: any[]): TechnicalDomain[] => {
    // Analyser les domaines les plus échoués
    return ["ai", "angular", "devops"];
  };

  const getNextLevel = (current: LanguageLevel): LanguageLevel => {
    const levels: LanguageLevel[] = ["A2", "B1", "B2", "C1"];
    const index = levels.indexOf(current);
    return levels[Math.min(index + 1, levels.length - 1)];
  };

  const handleEditGoal = (goal: LearningGoal) => {
    setSelectedGoal(goal);
    setEditDialogOpen(true);
  };

  const handleSaveGoal = () => {
    if (!selectedGoal) return;
    
    setLearningGoals(prev =>
      prev.map(g => (g.id === selectedGoal.id ? selectedGoal : g))
    );
    setEditDialogOpen(false);
    setSelectedGoal(null);
  };

  const handleRemoveGoal = (goalId: string) => {
    setLearningGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleRefreshPlan = () => {
    generateAdaptivePlan();
  };

  const handleStartGoal = useCallback((goal: LearningGoal) => {
    console.log("🔄 Clic sur 'Commencer' pour l'objectif:", goal.id, goal.title);
    console.log("📋 Objectif complet:", goal);
    
    if (goal.completed) {
      console.warn("⚠️ Objectif déjà complété");
      return;
    }

    // Rediriger vers la vue des exercices avec filtres basés sur l'objectif
    if (onNavigate) {
      console.log("✅ Navigation vers la vue exercices avec filtres:", {
        level: goal.targetLevel,
        types: goal.exerciseTypes,
        domains: goal.domains
      });
      
      // Sauvegarder les filtres dans localStorage pour les appliquer dans ExerciseList
      localStorage.setItem('goalFilters', JSON.stringify({
        level: goal.targetLevel,
        types: goal.exerciseTypes,
        domains: goal.domains,
        goalId: goal.id
      }));
      
      onNavigate("exercises");
    } else {
      console.error("❌ Erreur: onNavigate non défini");
      // Fallback: redirection par hash ou window.location
      window.location.hash = "#exercises";
    }
  }, [onNavigate]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "error";
      case "moderate": return "warning";
      case "minor": return "info";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  if (!user) {
    return (
      <Alert severity="info">
        Veuillez d'abord compléter l'évaluation de niveau.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">
          Programme d'apprentissage adaptatif
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Réactualiser le programme">
            <Button
              startIcon={<Refresh />}
              onClick={handleRefreshPlan}
              variant="outlined"
            >
              Actualiser
            </Button>
          </Tooltip>
          <Chip
            label={autoAdapt ? "Adaptation auto : ON" : "Adaptation auto : OFF"}
            color={autoAdapt ? "success" : "default"}
            onClick={() => setAutoAdapt(!autoAdapt)}
            sx={{ cursor: "pointer" }}
          />
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Ce programme s'adapte automatiquement en fonction de vos réponses aux exercices.
          Vous pouvez le modifier à tout moment en cliquant sur les boutons d'édition.
        </Typography>
      </Alert>

      {/* Progression globale */}
      <Card sx={{ mb: 3, bgcolor: "primary.light" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Timeline sx={{ fontSize: 40, color: "white" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ color: "white" }}>
                Niveau actuel : {user.currentLevel}
              </Typography>
              <Typography variant="body2" sx={{ color: "white", opacity: 0.9 }}>
                Objectif : {user.targetLevel} • {responses.length} exercices complétés
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateProgress(user.currentLevel, responses)}
            sx={{ height: 8, borderRadius: 1, bgcolor: "rgba(255,255,255,0.3)" }}
          />
        </CardContent>
      </Card>

      {/* Points faibles détectés */}
      {weaknesses.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Warning color="warning" />
              Points à améliorer
            </Typography>
            <Grid container spacing={2}>
              {weaknesses.map((weakness, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Chip
                        label={weakness.severity}
                        color={getSeverityColor(weakness.severity) as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="subtitle2" gutterBottom>
                        {weakness.area}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {weakness.occurrences} erreurs • {weakness.recommendedExercises} exercices recommandés
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Objectifs d'apprentissage */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Vos objectifs d'apprentissage
      </Typography>

      <Grid container spacing={3}>
        {learningGoals.map((goal) => (
          <Grid item xs={12} md={6} key={goal.id}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Chip
                    label={goal.priority}
                    color={getPriorityColor(goal.priority) as any}
                    size="small"
                  />
                  <Box>
                    <IconButton size="small" onClick={() => handleEditGoal(goal)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemoveGoal(goal.id)}>
                      <Remove fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {goal.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {goal.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progression
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {goal.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  <Chip label={`Niveau ${goal.targetLevel}`} size="small" variant="outlined" />
                  <Chip label={`~${goal.estimatedWeeks} semaines`} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {goal.exerciseTypes.map((type, idx) => (
                    <Chip key={idx} label={type} size="small" />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrow />}
                  disabled={goal.completed}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🖱️ ÉVÉNEMENT CLIC DÉTECTÉ pour l'objectif:", goal.id, goal.title);
                    handleStartGoal(goal);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    console.log("🖱️ MouseDown détecté pour l'objectif:", goal.id);
                  }}
                  sx={{
                    cursor: goal.completed ? "not-allowed" : "pointer",
                    "&:hover": {
                      backgroundColor: goal.completed ? "action.disabled" : "primary.dark"
                    }
                  }}
                >
                  {goal.completed ? "Complété" : "Commencer"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog d'édition */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'objectif</DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Titre"
                fullWidth
                value={selectedGoal.title}
                onChange={(e) =>
                  setSelectedGoal({ ...selectedGoal, title: e.target.value })
                }
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={selectedGoal.description}
                onChange={(e) =>
                  setSelectedGoal({ ...selectedGoal, description: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={selectedGoal.priority}
                  label="Priorité"
                  onChange={(e) =>
                    setSelectedGoal({
                      ...selectedGoal,
                      priority: e.target.value as "high" | "medium" | "low"
                    })
                  }
                >
                  <MenuItem value="high">Haute</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="low">Basse</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Durée estimée (semaines)"
                type="number"
                fullWidth
                value={selectedGoal.estimatedWeeks}
                onChange={(e) =>
                  setSelectedGoal({
                    ...selectedGoal,
                    estimatedWeeks: parseInt(e.target.value) || 0
                  })
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSaveGoal} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

