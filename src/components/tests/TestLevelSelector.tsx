/**
 * Composant TestLevelSelector - Sélection du niveau de test
 * Permet à l'utilisateur de choisir le niveau de test (A1, A2, B1, B2, C1)
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem
} from "@mui/material";
import { School, Psychology, Assessment } from "@mui/icons-material";
import { LanguageLevel } from "../../types";

interface TestLevelSelectorProps {
  testType: "efset" | "toeic" | "toefl";
  onSelectLevel: (level: LanguageLevel) => void;
  onCancel?: () => void;
}

const LEVELS: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_DESCRIPTIONS: Record<LanguageLevel, string> = {
  A1: "Débutant - Compréhension et expression basiques",
  A2: "Élémentaire - Communication simple sur des sujets familiers",
  B1: "Intermédiaire - Communication dans des situations quotidiennes",
  B2: "Intermédiaire supérieur - Communication fluide sur des sujets complexes",
  C1: "Avancé - Expression fluide et précise sur des sujets techniques"
};

const TEST_TYPE_NAMES = {
  efset: "EF SET",
  toeic: "TOEIC",
  toefl: "TOEFL"
};

export const TestLevelSelector: React.FC<TestLevelSelectorProps> = ({
  testType,
  onSelectLevel,
  onCancel
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel | "">("");

  const handleStartTest = () => {
    if (selectedLevel) {
      onSelectLevel(selectedLevel);
    }
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Psychology sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h5">
            Choisir le niveau de test {TEST_TYPE_NAMES[testType]}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sélectionnez le niveau CECR pour le test {TEST_TYPE_NAMES[testType]}. 
            Le test sera adapté à ce niveau.
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="level-select-label">Niveau CECR</InputLabel>
          <Select
            labelId="level-select-label"
            id="level-select"
            value={selectedLevel}
            label="Niveau CECR"
            onChange={(e) => setSelectedLevel(e.target.value as LanguageLevel)}
          >
            {LEVELS.map((level) => (
              <MenuItem key={level} value={level}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Niveau {level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {LEVEL_DESCRIPTIONS[level]}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedLevel && (
          <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Niveau {selectedLevel} sélectionné
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {LEVEL_DESCRIPTIONS[selectedLevel]}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Niveaux disponibles :
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {LEVELS.map((level) => (
              <Chip
                key={level}
                label={`${level} - ${LEVEL_DESCRIPTIONS[level].split(" - ")[1]}`}
                onClick={() => setSelectedLevel(level)}
                color={selectedLevel === level ? "primary" : "default"}
                variant={selectedLevel === level ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {onCancel && (
          <Button onClick={onCancel} color="inherit">
            Annuler
          </Button>
        )}
        <Button
          onClick={handleStartTest}
          variant="contained"
          disabled={!selectedLevel}
        >
          Commencer le test niveau {selectedLevel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

