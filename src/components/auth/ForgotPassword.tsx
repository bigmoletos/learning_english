/**
 * Composant de réinitialisation de mot de passe
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Link, CircularProgress, Stepper, Step, StepLabel
} from "@mui/material";
import { Email, Lock, CheckCircle } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface ForgotPasswordProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0); // 0: email, 1: token, 2: password
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Détecter le token depuis l'URL (lien depuis l'email)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token") || window.location.pathname.split("/reset-password/")[1];
    
    if (tokenParam) {
      setToken(tokenParam);
      setStep(2); // Passer directement à l'étape de réinitialisation
      setMessage("Token détecté. Définissez votre nouveau mot de passe.");
    }
  }, []);

  const validatePassword = () => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Le mot de passe doit contenir au moins une minuscule";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)";
    }
    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas";
    }
    return "";
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email
      });

      if (response.data.success) {
        setMessage("Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.");
        setStep(1);
      } else {
        setError(response.data.message || "Erreur lors de la demande de réinitialisation");
      }
    } catch (err: any) {
      // Ne pas révéler si l'email existe
      setMessage("Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password
      });

      if (response.data.success) {
        setMessage("Mot de passe réinitialisé avec succès !");
        setStep(2);
        
        // Rediriger vers la connexion après 2 secondes
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(response.data.message || "Erreur lors de la réinitialisation");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Token invalide ou expiré. Veuillez redemander un lien de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Votre email", "Code de réinitialisation", "Nouveau mot de passe"];

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

          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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

          {step === 0 && (
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
                {loading ? <CircularProgress size={24} /> : "Envoyer le lien"}
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
          )}

          {step === 1 && (
            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Entrez le code de réinitialisation reçu par email.
              </Typography>

              <TextField
                fullWidth
                label="Code de réinitialisation"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                margin="normal"
                required
                placeholder="Coller le token depuis l'email"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                Continuer
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setStep(0)}
                sx={{ mt: 1 }}
              >
                Retour
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Définissez votre nouveau mot de passe.
              </Typography>

              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                helperText="Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: "text.secondary" }} />
                }}
              />

              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: "text.secondary" }} />
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
                {loading ? <CircularProgress size={24} /> : "Réinitialiser"}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setStep(1)}
                sx={{ mt: 1 }}
              >
                Retour
              </Button>
            </Box>
          )}

          {step === 2 && message && message.includes("succès") && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <CheckCircle sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Redirection vers la page de connexion...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

