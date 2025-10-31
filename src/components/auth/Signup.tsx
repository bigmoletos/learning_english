/**
 * Composant d'inscription
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Link, InputAdornment, IconButton, CircularProgress, Grid
} from "@mui/material";
import { Email, Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface SignupProps {
  onSuccess: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        onSuccess(token, user);
      } else {
        setError(response.data.message || "Erreur d'inscription");
      }
    } catch (err: any) {
      // Gérer les différents types d'erreurs
      let errorMessage = "Erreur d'inscription. Veuillez réessayer.";
      
      if (err.response?.data) {
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
      if (errorMessage.includes("existe déjà") || errorMessage.includes("already exists")) {
        errorMessage = "Un compte existe déjà avec cet email. Essayez de vous connecter ou utilisez un autre email.";
      } else if (errorMessage.includes("email")) {
        errorMessage = "Email invalide. Veuillez vérifier votre adresse email.";
      } else if (errorMessage.includes("password")) {
        errorMessage = "Le mot de passe ne respecte pas les critères requis (min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial).";
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
      <Card sx={{ maxWidth: 600, width: "100%", m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, fontWeight: "bold" }}>
            🎓 Créer un compte
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Commencez votre parcours vers l'anglais C1
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

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
              helperText="Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial"
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

            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              {loading ? <CircularProgress size={24} /> : "S'inscrire"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Déjà un compte ?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToLogin}
                  sx={{ cursor: "pointer" }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

