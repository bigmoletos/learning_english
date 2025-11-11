/**
 * Composant AudioPlayer - Lecteur audio avec synthèse vocale
 * Optimisé pour Android mobile
 * @version 2.0.0
 * @date 04-11-2025
 */

import React from "react";
import { Box, IconButton, Tooltip, Typography, Slider, Alert } from "@mui/material";
import { PlayArrow, Stop, VolumeUp, Speed, Warning } from "@mui/icons-material";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

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
  const { speak, stop, isSpeaking, isSupported, setRate, setVolume, error } = useTextToSpeech();
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

  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ my: 2 }} icon={<Warning />}>
        <Typography variant="body2" gutterBottom>
          Votre navigateur ne supporte pas la synthèse vocale.
        </Typography>
        <Typography variant="caption">
          Veuillez utiliser <strong>Chrome</strong>, <strong>Edge</strong> ou <strong>Safari</strong>.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{
      p: { xs: 1.5, sm: 2 },
      bgcolor: "primary.light",
      borderRadius: 2,
      border: 2,
      borderColor: "primary.main"
    }}>
      {title && (
        <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
          {title}
        </Typography>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, sm: 2 },
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <VolumeUp sx={{ fontSize: { xs: 24, sm: 30 }, color: "white", display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{
          flexGrow: 1,
          width: '100%',
          p: { xs: 1.5, sm: 2 },
          bgcolor: "white",
          borderRadius: 1
        }}>
          <Typography variant="body1" sx={{
            fontStyle: "italic",
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            {text}
          </Typography>
        </Box>
        <Tooltip title={isSpeaking ? "Arrêter" : "Écouter"}>
          <IconButton
            onClick={handlePlay}
            sx={{
              bgcolor: "white",
              "&:hover": { bgcolor: "grey.200" },
              width: { xs: 52, sm: 56 },
              height: { xs: 52, sm: 56 },
              minWidth: 44,
              minHeight: 44,
              // Feedback tactile pour mobile
              '@media (hover: none)': {
                '&:active': {
                  transform: 'scale(0.95)',
                  transition: 'transform 0.1s'
                }
              }
            }}
          >
            {isSpeaking ? <Stop sx={{ fontSize: { xs: 24, sm: 28 } }} /> : <PlayArrow sx={{ fontSize: { xs: 24, sm: 28 } }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {showControls && (
        <Box sx={{
          bgcolor: "white",
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1
        }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Speed sx={{ color: "text.secondary" }} />
              <Typography variant="body2" sx={{ minWidth: { xs: 80, sm: 100 } }}>
                Vitesse: {speed.toFixed(1)}x
              </Typography>
            </Box>
            <Slider
              value={speed}
              onChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              sx={{
                flexGrow: 1,
                width: { xs: '100%', sm: 'auto' },
                // Curseur plus grand sur mobile
                '& .MuiSlider-thumb': {
                  width: { xs: 24, sm: 20 },
                  height: { xs: 24, sm: 20 }
                },
                '& .MuiSlider-track': {
                  height: { xs: 6, sm: 4 }
                },
                '& .MuiSlider-rail': {
                  height: { xs: 6, sm: 4 }
                }
              }}
              disabled={isSpeaking}
            />
          </Box>

          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <VolumeUp sx={{ color: "text.secondary" }} />
              <Typography variant="body2" sx={{ minWidth: { xs: 80, sm: 100 } }}>
                Volume: {Math.round(volume * 100)}%
              </Typography>
            </Box>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              sx={{
                flexGrow: 1,
                width: { xs: '100%', sm: 'auto' },
                // Curseur plus grand sur mobile
                '& .MuiSlider-thumb': {
                  width: { xs: 24, sm: 20 },
                  height: { xs: 24, sm: 20 }
                },
                '& .MuiSlider-track': {
                  height: { xs: 6, sm: 4 }
                },
                '& .MuiSlider-rail': {
                  height: { xs: 6, sm: 4 }
                }
              }}
              disabled={isSpeaking}
            />
          </Box>
        </Box>
      )}

      <Typography variant="caption" sx={{
        display: "block",
        mt: 1,
        color: "white",
        fontSize: { xs: '0.7rem', sm: '0.75rem' }
      }}>
        💡 Cliquez sur le bouton lecture pour entendre le texte en anglais
        {showControls && " • Ajustez la vitesse et le volume selon vos besoins"}
      </Typography>
    </Box>
  );
};

