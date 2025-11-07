/**
 * Composant AudioPlayer - Lecteur audio avec synthèse vocale
 * @version 1.0.0
 * @date 31-10-2025
 */

import React from "react";
import { Box, IconButton, Tooltip, Typography, Slider, Alert } from "@mui/material";
import { PlayArrow, Stop, VolumeUp, Speed } from "@mui/icons-material";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";
import { Capacitor } from "@capacitor/core";

/**
 * Détecte si on est sur une plateforme native Capacitor
 */
const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

interface AudioPlayerProps {
  text: string;
  lang?: string;
  title?: string;
  showControls?: boolean;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  lang = "en-US",
  title,
  showControls = true,
  autoPlay = false
}) => {
  const { speak, stop, isSpeaking, isSupported, setRate, setVolume } = useTextToSpeech();
  const [speed, setSpeed] = React.useState(1.0);
  const [volume, setVolumeState] = React.useState(1.0);

  React.useEffect(() => {
    if (autoPlay && isSupported && text) {
      speak(text, lang);
    }
    // Nettoyage : arrêter la lecture quand le composant est démonté
    return () => {
      stop();
    };
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, lang);
    }
  };

  const handleSpeedChange = (_event: Event, newValue: number | number[]) => {
    const newSpeed = newValue as number;
    setSpeed(newSpeed);
    setRate(newSpeed);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  if (!isSupported && !isNativePlatform()) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        <Typography variant="body2">
          Votre navigateur ne supporte pas la synthèse vocale.
          {isNativePlatform()
            ? " La fonctionnalité native sera utilisée sur mobile."
            : " Veuillez utiliser Chrome, Edge ou Safari."}
        </Typography>
      </Alert>
    );
  }

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

      {showControls && (
        <Box sx={{ bgcolor: "white", p: 2, borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Speed sx={{ color: "text.secondary" }} />
            <Typography variant="body2" sx={{ minWidth: 100 }}>
              Vitesse: {speed.toFixed(1)}x
            </Typography>
            <Slider
              value={speed}
              onChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              sx={{ flexGrow: 1 }}
              disabled={isSpeaking}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <VolumeUp sx={{ color: "text.secondary" }} />
            <Typography variant="body2" sx={{ minWidth: 100 }}>
              Volume: {Math.round(volume * 100)}%
            </Typography>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              sx={{ flexGrow: 1 }}
              disabled={isSpeaking}
            />
          </Box>
        </Box>
      )}

      <Typography variant="caption" sx={{ display: "block", mt: 1, color: "white" }}>
        💡 Cliquez sur le bouton lecture pour entendre le texte en anglais
        {showControls && " • Ajustez la vitesse et le volume selon vos besoins"}
      </Typography>
    </Box>
  );
};

