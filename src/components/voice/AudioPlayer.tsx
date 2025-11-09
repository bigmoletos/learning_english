/**
 * Composant AudioPlayer - Lecteur audio avec synthèse vocale
 * @version 1.0.0
 * @date 31-10-2025
 */

import React from "react";
import { Box, IconButton, Tooltip, Typography, Alert, Select, MenuItem, FormControl, InputLabel, Chip } from "@mui/material";
import { PlayArrow, Stop, VolumeUp, RecordVoiceOver, Cloud, CloudOff } from "@mui/icons-material";
import { useGoogleTTS } from "../../hooks/useGoogleTTS";

interface AudioPlayerProps {
  text: string;
  lang?: string;
  title?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  voice?: string; // Voix sélectionnée depuis l'extérieur (optionnel)
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  lang = "en-US",
  title,
  showControls = true,
  autoPlay = false,
  voice: externalVoice
}) => {
  const { speak, stop, isSpeaking, isLoading, error, isGoogleTTSAvailable } = useGoogleTTS();
  const [selectedVoice, setSelectedVoice] = React.useState<string>(
    externalVoice || (lang.startsWith("en-US") ? "en-US-Neural2-F" : "en-GB-Neural2-A")
  );

  // Synchroniser avec la voix externe si fournie
  React.useEffect(() => {
    if (externalVoice && externalVoice !== selectedVoice) {
      console.log("[AudioPlayer] Synchronisation avec voix externe:", externalVoice);
      setSelectedVoice(externalVoice);
    }
  }, [externalVoice]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (autoPlay && text) {
      speak(text, lang, selectedVoice);
    }
    // Nettoyage : arrêter la lecture quand le composant est démonté
    return () => {
      stop();
    };
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = () => {
    console.log("🎵 [AudioPlayer] handlePlay appelé:", {
      isSpeaking,
      isLoading,
      voice: selectedVoice,
      lang: lang,
      textLength: text.length
    });

    if (isSpeaking || isLoading) {
      console.log("🎵 [AudioPlayer] Arrêt de la lecture");
      stop();
    } else {
      console.log("🎵 [AudioPlayer] Démarrage lecture avec voix sélectionnée:", {
        voice: selectedVoice,
        lang: lang,
        textLength: text.length,
        textPreview: text.substring(0, 50)
      });
      speak(text, lang, selectedVoice);
    }
  };

  const handleVoiceChange = (event: any) => {
    const newVoice = event.target.value;
    console.log("[AudioPlayer] Changement de voix:", {
      ancienne: selectedVoice,
      nouvelle: newVoice
    });
    setSelectedVoice(newVoice);
  };

  // Voix Google Cloud TTS disponibles
  const googleVoices = [
    { name: "en-US-Neural2-A", label: "US Female - Emma", lang: "en-US" },
    { name: "en-US-Neural2-C", label: "US Female - Sarah", lang: "en-US" },
    { name: "en-US-Neural2-D", label: "US Male - David", lang: "en-US" },
    { name: "en-US-Neural2-F", label: "US Female - Michelle", lang: "en-US" },
    { name: "en-US-Neural2-I", label: "US Male - Alex", lang: "en-US" },
    { name: "en-GB-Neural2-A", label: "UK Female - Emma", lang: "en-GB" },
    { name: "en-GB-Neural2-B", label: "UK Male - George", lang: "en-GB" },
    { name: "en-GB-Neural2-C", label: "UK Female - Charlotte", lang: "en-GB" },
    { name: "en-GB-Neural2-D", label: "UK Male - Oliver", lang: "en-GB" },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: "primary.light", borderRadius: 2, border: 2, borderColor: "primary.main" }}>
      {title && (
        <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <VolumeUp sx={{ fontSize: 30, color: "white" }} />
        <Box sx={{ flexGrow: 1, p: 2, bgcolor: "white", borderRadius: 1 }}>
          <Typography variant="body1" sx={{ fontStyle: "italic" }}>
            {text}
          </Typography>
        </Box>
        <Tooltip title={isSpeaking ? "Arrêter" : "Écouter"}>
          <IconButton
            onClick={handlePlay}
            sx={{
              bgcolor: "white",
              "&:hover": { bgcolor: "grey.200" },
              width: 56,
              height: 56
            }}
          >
            {isSpeaking ? <Stop sx={{ fontSize: 28 }} /> : <PlayArrow sx={{ fontSize: 28 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Badge statut Google TTS */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {isGoogleTTSAvailable ? (
          <Chip
            icon={<Cloud />}
            label="Google Cloud TTS - Voix Neural"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<CloudOff />}
            label="Fallback: Web Speech API"
            color="warning"
            size="small"
          />
        )}
        {isLoading && (
          <Chip
            label="Chargement..."
            color="info"
            size="small"
          />
        )}
      </Box>

      {showControls && (
        <Box sx={{ bgcolor: "white", p: 2, borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <RecordVoiceOver sx={{ color: "text.secondary" }} />
            <FormControl fullWidth size="small">
              <InputLabel id="voice-select-label">Voix anglaise (Neural)</InputLabel>
              <Select
                labelId="voice-select-label"
                value={selectedVoice}
                label="Voix anglaise (Neural)"
                onChange={handleVoiceChange}
                disabled={isSpeaking || isLoading}
              >
                {googleVoices.map((voice) => (
                  <MenuItem key={voice.name} value={voice.name}>
                    {voice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      <Typography variant="caption" sx={{ display: "block", mt: 1, color: "white" }}>
        💡 Cliquez sur le bouton lecture pour entendre le texte en anglais
        {showControls && " • Sélectionnez une voix Neural haute qualité"}
        {isGoogleTTSAvailable && " • Audio mis en cache pour lecture rapide"}
      </Typography>
    </Box>
  );
};
