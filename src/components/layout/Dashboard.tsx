/**
 * Composant Dashboard - Vue principale de l'application
 * @version 1.1.0
 * @date 31-10-2025
 */

import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  School,
  Timer,
  EmojiEvents,
  MenuBook,
  Psychology,
  Refresh,
  Assessment,
} from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";

interface DashboardProps {
  onStartAssessment?: () => void;
  onNavigate?: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartAssessment, onNavigate }) => {
  const { user, stats } = useUser();

  if (!user) return null;

  const progressToNextLevel = Math.min(100, (stats.averageScore / 85) * 100);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Tableau de bord
        </Typography>
        <Chip
          label={`Niveau ${user.currentLevel} → Objectif ${user.targetLevel}`}
          color="primary"
          sx={{ fontSize: "0.9rem", py: 2 }}
        />
      </Box>

      {/* Alerte pour refaire l'évaluation */}
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" startIcon={<Refresh />} onClick={onStartAssessment}>
            Refaire
          </Button>
        }
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          <strong>Conseil :</strong> Vous pouvez refaire l'évaluation de niveau à tout moment pour
          ajuster votre programme d'apprentissage en fonction de vos progrès.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <School sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Niveau actuel</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {user.currentLevel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Objectif: {user.targetLevel}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressToNextLevel}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <MenuBook sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Exercices</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {stats.completedExercises}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                exercices complétés
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmojiEvents sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h6">Score moyen</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {stats.averageScore.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                sur tous les exercices
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Timer sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h6">Temps d'étude</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {Math.floor(stats.timeSpent / 60)}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.streakDays} jours consécutifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions rapides */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <School sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Exercices</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Accédez à plus de 400 exercices (QCM et textes à trous) pour pratiquer votre anglais
                technique dans les domaines IT, IA, DevOps et Cybersécurité.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                color="primary"
                startIcon={<School />}
                onClick={() => onNavigate?.("exercises")}
                sx={{ mt: 2 }}
              >
                Lancer les exercices
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assessment sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Évaluation de niveau</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Refaites l'évaluation complète (18 questions - Listening, Reading, Writing) pour
                mettre à jour votre niveau et adapter votre programme.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Refresh />}
                onClick={onStartAssessment}
                sx={{ mt: 2 }}
              >
                Refaire l'évaluation
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Programme adaptatif</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Consultez votre programme d'apprentissage personnalisé qui s'adapte automatiquement
                en fonction de vos performances et points faibles.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                color="success"
                onClick={() => onNavigate?.("learning")}
                sx={{ mt: 2 }}
              >
                Voir mon programme
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Psychology sx={{ mr: 1, color: "error.main" }} />
                <Typography variant="h6">Points à améliorer</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {user.weaknesses.length > 0 ? (
                  user.weaknesses.map((weakness, index) => (
                    <Chip
                      key={index}
                      label={weakness}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune faiblesse identifiée pour le moment
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Points forts</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {user.strengths.length > 0 ? (
                  user.strengths.map((strength, index) => (
                    <Chip
                      key={index}
                      label={strength}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Complétez des exercices pour identifier vos forces
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
