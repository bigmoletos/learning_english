/**
 * Composant ProgressTracker - Suivi détaillé de la progression
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useMemo } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Grid, Chip } from "@mui/material";
import { TrendingUp, Psychology, CheckCircle } from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { progressAgent } from "../../agents/progressAgent";

export const ProgressTracker: React.FC = () => {
  const { user, responses } = useUser();
  const analysis = useMemo(() => {
    if (user && responses.length > 0) {
      return progressAgent.analyzeProgress(responses, [], user);
    }
    return null;
  }, [user, responses]);

  if (!user || !analysis) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analyse de progression
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complétez quelques exercices pour voir votre analyse de progression.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Analyse de progression
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score global
              </Typography>
              <Typography variant="h2" color="primary" sx={{ mb: 2 }}>
                {analysis.overallScore.toFixed(0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={analysis.overallScore}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grammaire
              </Typography>
              <Typography variant="h2" color="success.main" sx={{ mb: 2 }}>
                {analysis.grammarScore.toFixed(0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={analysis.grammarScore}
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vocabulaire
              </Typography>
              <Typography variant="h2" color="info.main" sx={{ mb: 2 }}>
                {analysis.vocabularyScore.toFixed(0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={analysis.vocabularyScore}
                color="info"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Psychology sx={{ mr: 1, color: "error.main" }} />
                <Typography variant="h6">Domaines à améliorer</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {analysis.weakAreas.length > 0 ? (
                  analysis.weakAreas.map((area, index) => (
                    <Chip key={index} label={area} color="error" variant="outlined" size="medium" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun domaine faible identifié
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
                {analysis.strongAreas.length > 0 ? (
                  analysis.strongAreas.map((area, index) => (
                    <Chip
                      key={index}
                      label={area}
                      color="success"
                      variant="outlined"
                      size="medium"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Continuez pour identifier vos forces
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircle sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Exercices recommandés</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Basés sur votre analyse, voici les exercices qui vous aideront le plus :
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {analysis.recommendedExercises.map((exercise, index) => (
                  <Chip
                    key={index}
                    label={exercise}
                    color="primary"
                    variant="filled"
                    size="medium"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {analysis.nextLevel && (
          <Grid item xs={12}>
            <Card elevation={3} sx={{ bgcolor: "success.light" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "success.contrastText" }}>
                  🎉 Félicitations !
                </Typography>
                <Typography variant="body1" sx={{ color: "success.contrastText" }}>
                  Votre niveau actuel vous permet de passer au niveau{" "}
                  <strong>{analysis.nextLevel}</strong>. Continuez votre excellent travail !
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
