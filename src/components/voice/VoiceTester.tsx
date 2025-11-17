/**
 * Composant VoiceTester - Testeur de voix pour vérifier la sélection des différentes voix
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Chip
} from "@mui/material";
import { VolumeUp } from "@mui/icons-material";
import { AudioPlayer } from "./AudioPlayer";

const TEST_SENTENCES = [
  "Hello, this is a test of the voice selection system.",
  "The system was deployed yesterday using continuous integration.",
  "Machine learning models require careful monitoring and validation.",
  "Cybersecurity is essential for protecting sensitive data.",
  "DevOps practices improve software delivery speed and quality."
];

const GOOGLE_VOICES = [
  { value: "en-US-Neural2-F", label: "US English - Female (Neural2-F)" },
  { value: "en-US-Neural2-D", label: "US English - Male (Neural2-D)" },
  { value: "en-US-Neural2-C", label: "US English - Female (Neural2-C)" },
  { value: "en-US-Neural2-A", label: "US English - Female (Neural2-A)" },
  { value: "en-US-Neural2-B", label: "US English - Male (Neural2-B)" },
  { value: "en-GB-Neural2-A", label: "GB English - Female (Neural2-A)" },
  { value: "en-GB-Neural2-B", label: "GB English - Male (Neural2-B)" },
  { value: "en-GB-Neural2-C", label: "GB English - Female (Neural2-C)" },
  { value: "en-GB-Neural2-D", label: "GB English - Male (Neural2-D)" }
];

export const VoiceTester: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<string>("en-US-Neural2-F");
  const [selectedSentence, setSelectedSentence] = useState<string>(TEST_SENTENCES[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceChange = (event: any) => {
    const newVoice = event.target.value;
    console.log("[VoiceTester] Changement de voix:", {
      ancienne: selectedVoice,
      nouvelle: newVoice
    });
    setSelectedVoice(newVoice);
    setIsPlaying(false);
  };

  const handleSentenceChange = (event: any) => {
    setSelectedSentence(event.target.value);
    setIsPlaying(false);
  };

  return (
    <Card elevation={3} sx={{ p: 3, mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VolumeUp color="primary" />
            Testeur de Voix TTS
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Testez différentes voix Google Cloud TTS et vérifiez leur sélection dans les logs du navigateur.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Voix Google Cloud TTS</InputLabel>
              <Select
                value={selectedVoice}
                label="Voix Google Cloud TTS"
                onChange={handleVoiceChange}
              >
                {GOOGLE_VOICES.map((voice) => (
                  <MenuItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Phrase de test</InputLabel>
              <Select
                value={selectedSentence}
                label="Phrase de test"
                onChange={handleSentenceChange}
              >
                {TEST_SENTENCES.map((sentence, index) => (
                  <MenuItem key={index} value={sentence}>
                    {sentence.substring(0, 50)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "divider" }}>
              <Typography variant="subtitle2" gutterBottom>
                Phrase sélectionnée :
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
                "{selectedSentence}"
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  label={`Voix: ${selectedVoice}`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={isPlaying ? "Lecture en cours" : "Prêt"}
                  color={isPlaying ? "success" : "default"}
                  size="small"
                />
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="caption">
                  Ouvrez la console du navigateur (F12) pour voir les logs détaillés de sélection de voix.
                </Typography>
              </Alert>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <AudioPlayer
            text={selectedSentence}
            lang={selectedVoice.startsWith("en-GB") ? "en-GB" : "en-US"}
            title="Test de voix"
            showControls={true}
            autoPlay={false}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Instructions pour tester :
          </Typography>
          <Typography variant="body2" component="div">
            <ol>
              <li>Ouvrez la console du navigateur (F12 → Console)</li>
              <li>Sélectionnez une voix dans le menu déroulant</li>
              <li>Cliquez sur le bouton de lecture dans le lecteur audio</li>
              <li>Vérifiez dans les logs :
                <ul>
                  <li><code>[AudioPlayer] Changement de voix</code></li>
                  <li><code>[GoogleTTS] Mapping voix</code></li>
                  <li><code>[GoogleTTS] Voix mappée trouvée</code></li>
                  <li><code>[GoogleTTS] Voix US disponibles</code></li>
                </ul>
              </li>
              <li>Testez différentes voix pour vérifier que chaque sélection utilise bien une voix différente</li>
            </ol>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

