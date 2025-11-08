/**
 * Composant de réinitialisation de mot de passe avec Firebase Auth
 * @version 2.0.0
 * @date 2025-11-06
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Link, CircularProgress
} from "@mui/material";
import { Email, CheckCircle } from "@mui/icons-material";
import { resetPassword } from "../../firebase/authService";

interface ForgotPasswordProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setMessage("Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.");
        setEmailSent(true);
      } else {
        setError(result.message || "Erreur lors de la demande de réinitialisation");
      }
    } catch (err: any) {
      console.error("Erreur réinitialisation Firebase:", err);
      
      let errorMessage = "Erreur lors de la demande de réinitialisation.";

      // Gérer les erreurs Firebase spécifiques
      if (err.code) {
        switch (err.code) {
        case "auth/user-not-found":
          // Ne pas révéler si l'email existe (sécurité)
          setMessage("Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception.");
          setEmailSent(true);
          setLoading(false);
          return;
        case "auth/invalid-email":
          errorMessage = "Adresse email invalide.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
          break;
        default:
          errorMessage = err.message || "Erreur lors de la demande de réinitialisation.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      <Card sx={{ maxWidth: 500, width: "100%", m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, fontWeight: "bold" }}>
            🔒 Réinitialisation de mot de passe
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {!emailSent ? (
            <Box component="form" onSubmit={handleRequestReset}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Typography>

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Envoyer le lien de réinitialisation"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToLogin}
                  sx={{ cursor: "pointer" }}
                >
                  Retour à la connexion
                </Link>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Cliquez sur le lien dans l&apos;email pour réinitialiser votre mot de passe.
                Le lien est valide pendant 1 heure.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setMessage("");
                }}
                sx={{ mb: 2 }}
              >
                Envoyer un autre email
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={onSwitchToLogin}
              >
                Retour à la connexion
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

