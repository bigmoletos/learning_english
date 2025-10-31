/**
 * Composant de vérification d'email
 * Affiche le message après inscription demandant de vérifier l'email
 * @version 1.0.0
 */

import React from "react";
import {
  Box, Card, CardContent, Typography, Button, Alert
} from "@mui/material";
import { Email } from "@mui/icons-material";

interface VerifyEmailProps {
  email: string;
  onSwitchToLogin: () => void;
  onResendEmail?: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ 
  email, 
  onSwitchToLogin,
  onResendEmail 
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "grey.100",
        py: 4
      }}
    >
      <Card sx={{ maxWidth: 600, width: "100%", m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Email sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              📧 Vérifiez votre email
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Inscription réussie !</strong>
            </Typography>
            <Typography variant="body2">
              Un email de vérification a été envoyé à : <strong>{email}</strong>
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              Pour activer votre compte, veuillez :
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <li>
                <Typography variant="body2" paragraph>
                  Ouvrir votre boîte de réception (et le dossier spam si nécessaire)
                </Typography>
              </li>
              <li>
                <Typography variant="body2" paragraph>
                  Cliquer sur le lien de vérification dans l'email
                </Typography>
              </li>
              <li>
                <Typography variant="body2" paragraph>
                  Vous serez automatiquement connecté après vérification
                </Typography>
              </li>
            </Box>
          </Box>

          {onResendEmail && (
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Vous n'avez pas reçu l'email ?
              </Typography>
              <Button
                variant="outlined"
                onClick={onResendEmail}
                sx={{ mb: 2 }}
              >
                Renvoyer l'email de vérification
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Déjà vérifié votre email ?
            </Typography>
            <Button
              variant="text"
              onClick={onSwitchToLogin}
              sx={{ textTransform: "none" }}
            >
              Me connecter
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note :</strong> Le lien de vérification expire dans 24 heures.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

