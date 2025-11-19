/**
 * Composant d'inscription avec Firebase Auth
 * @version 2.0.0
 * @date 2025-11-06
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Email, Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import { registerUser } from "../../firebase/authService";
import { VerifyEmail } from "./VerifyEmail";

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
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Debug: Log quand l'erreur change
  React.useEffect(() => {
    if (error) {
      console.log("✅ Erreur dans le state:", error);
    }
  }, [error]);

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
    e.stopPropagation(); // Empêcher la propagation

    // Empêcher les soumissions multiples
    if (loading) {
      return;
    }

    setError("");

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const displayName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
      const result = await registerUser(email, password, displayName);

      if (result.success && result.user) {
        // L'inscription a réussi, Firebase envoie automatiquement un email de vérification
        const firebaseUser = result.user;

        // Afficher le composant de vérification d'email
        setRegisteredEmail(email);
        setShowVerifyEmail(true);
        setError(""); // Pas d'erreur

        // Stocker temporairement les infos utilisateur
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: displayName,
          firstName,
          lastName,
          emailVerified: false,
          currentLevel: "B1",
          targetLevel: "C1",
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("pendingUser", JSON.stringify(userData));
        localStorage.setItem(
          "firebaseUser",
          JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName,
          })
        );
      } else {
        setError(result.message || "Erreur d'inscription");
      }
    } catch (err: any) {
      console.error("Erreur inscription Firebase:", err);

      let errorMessage = "Erreur d'inscription. Veuillez réessayer.";

      // Gérer les erreurs Firebase spécifiques
      if (err.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage = "Un compte existe déjà avec cet email. Essayez de vous connecter.";
            break;
          case "auth/invalid-email":
            errorMessage = "Adresse email invalide.";
            break;
          case "auth/weak-password":
            errorMessage = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "L'inscription par email/mot de passe n'est pas activée. Contactez l'administrateur.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
            break;
          default:
            errorMessage = err.message || "Erreur d'inscription. Veuillez réessayer.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Afficher le composant de vérification d'email si nécessaire
  if (showVerifyEmail) {
    return (
      <VerifyEmail
        email={registeredEmail || email}
        onSwitchToLogin={onSwitchToLogin}
        onResendEmail={async () => {
          // TODO: Implémenter le renvoi d'email
          console.log("Renvoyer l'email de vérification à:", registeredEmail || email);
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "grey.100",
        py: 4,
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
            <Box>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  width: "100%",
                  visibility: "visible",
                  opacity: 1,
                }}
                onClose={() => setError("")}
              >
                <strong>Erreur :</strong> {error}
              </Alert>
            </Box>
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
                    ),
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
                    ),
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
                ),
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
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
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
                ),
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
