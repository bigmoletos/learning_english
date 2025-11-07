/**
 * Composant de connexion
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Link, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

interface LoginProps {
  onSuccess: (token: string, user: any) => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToSignup, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        onSuccess(token, user);
      } else {
        setError(response.data.message || "Erreur de connexion");
      }
    } catch (err: any) {
      // Gérer les différents types d'erreurs
      let errorMessage = "Erreur de connexion. Vérifiez vos identifiants.";

      // Erreur réseau (backend non accessible)
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
        errorMessage = "Erreur réseau : Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 5001.";
        console.error("Erreur réseau:", err);
      } else if (err.response?.data) {
        // Erreur du backend avec structure détaillée
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          // Erreurs de validation (array)
          const firstError = err.response.data.errors[0];
          if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else if (firstError.msg) {
            errorMessage = firstError.msg;
          } else if (firstError.message) {
            errorMessage = firstError.message;
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Messages d'erreur spécifiques
      if (errorMessage.includes("Email ou mot de passe incorrect")) {
        errorMessage = "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.";
      } else if (errorMessage.includes("Email invalide") || errorMessage.includes("invalid email")) {
        // Vérifier si c'est vraiment un problème d'email ou de validation
        // Si l'email est bien formaté côté frontend, c'est probablement un problème de validation backend
        errorMessage = "L'adresse email n'est pas valide. Veuillez vérifier le format de votre email.";
      } else if (errorMessage.includes("Ce compte a ete desactive")) {
        errorMessage = "Ce compte a été désactivé. Contactez l'administrateur.";
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
        bgcolor: "grey.100"
      }}
    >
      <Card sx={{ maxWidth: 450, width: "100%", m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, fontWeight: "bold" }}>
            🎓 AI English Trainer
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Connectez-vous pour accéder à votre programme d'apprentissage
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
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
              {loading ? <CircularProgress size={24} /> : "Se connecter"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pas encore de compte ?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToSignup}
                  sx={{ cursor: "pointer" }}
                >
                  S'inscrire
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToForgotPassword}
                  sx={{ cursor: "pointer" }}
                >
                  Mot de passe oublié ?
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

