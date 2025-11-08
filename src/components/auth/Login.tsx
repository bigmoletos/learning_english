/**
 * Composant de connexion avec Firebase Auth
 * @version 2.0.0
 * @date 2025-11-06
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Link, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { loginUser } from "../../firebase/authService";

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
      const result = await loginUser(email, password);

      if (result.success && result.user) {
        // Convertir l'utilisateur Firebase en format attendu par le contexte
        const firebaseUser = result.user;
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Utilisateur",
          emailVerified: firebaseUser.emailVerified,
          currentLevel: "B1", // Niveau par défaut
          targetLevel: "C1",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        // Utiliser l'ID token Firebase comme token
        const token = await firebaseUser.getIdToken();

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("firebaseUser", JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        }));

        onSuccess(token, userData);
      } else {
        setError(result.message || "Erreur de connexion");
      }
    } catch (err: any) {
      console.error("Erreur de connexion Firebase:", err);

      let errorMessage = "Erreur de connexion. Vérifiez vos identifiants.";

      // Gérer les erreurs Firebase spécifiques
      if (err.code) {
        switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "Aucun compte trouvé avec cet email. Créez un compte pour commencer.";
          break;
        case "auth/wrong-password":
          errorMessage = "Mot de passe incorrect.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.";
          break;
        case "auth/invalid-email":
          errorMessage = "Adresse email invalide.";
          break;
        case "auth/user-disabled":
          errorMessage = "Ce compte a été désactivé.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
          break;
        default:
          errorMessage = err.message || "Erreur de connexion. Veuillez réessayer.";
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
              autoComplete="email"
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
              autoComplete="current-password"
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

