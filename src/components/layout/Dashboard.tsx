/**
 * Composant Dashboard - Vue principale de l'application
 * @version 1.0.0
 * @date 31-10-2025
 */

import React from "react";
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress, Chip
} from "@mui/material";
import {
  TrendingUp, School, Timer, EmojiEvents, MenuBook, Psychology
} from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";

export const Dashboard: React.FC = () => {
  const { user, stats } = useUser();

  if (!user) return null;

  const progressToNextLevel = Math.min(100, (stats.averageScore / 85) * 100);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
        Tableau de bord
      </Typography>

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

