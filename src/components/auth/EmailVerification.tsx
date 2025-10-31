/**
 * Composant de gestion de la vérification d'email
 * Gère les routes /verify-email/:token, /verify-email/success, /verify-email/error
 * @version 1.0.0
 */

import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Alert, CircularProgress
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface EmailVerificationProps {
  onSuccess?: (token: string, user: any) => void;
  onSwitchToLogin?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const { login } = useUser();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Éviter les appels multiples
    if (isVerifying || status !== "loading") {
      return;
    }

    const verifyEmail = async () => {
      setIsVerifying(true);
      try {
        // Récupérer le token depuis l'URL
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const tokenFromPath = path.split("/verify-email/")[1]?.split("/")[0];
        const token = tokenFromPath || searchParams.get("token");
        
        if (!token) {
          setStatus("error");
          setError("Token de vérification manquant");
          return;
        }

        // Vérifier si on est sur la route /verify-email/success
        if (path.includes("/success")) {
          const tokenParam = searchParams.get("token");
          if (tokenParam) {
            // Token JWT reçu après vérification réussie
            try {
              // Vérifier le token avec le backend
              const response = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${tokenParam}` }
              });
              
              if (response.data.success) {
                const user = response.data.user;
                localStorage.setItem("token", tokenParam);
                localStorage.setItem("user", JSON.stringify(user));
                if (login) login(tokenParam, user);
                if (onSuccess) onSuccess(tokenParam, user);
                setStatus("success");
                setMessage("Email vérifié avec succès ! Vous êtes maintenant connecté.");
              } else {
                throw new Error("Token invalide");
              }
            } catch (err: any) {
              setStatus("error");
              setError("Token invalide ou expiré. Veuillez vous connecter.");
            }
          } else {
            setStatus("error");
            setError("Token manquant dans l'URL");
          }
          return;
        }

        // Vérifier si on est sur la route /verify-email/error
        if (path.includes("/error")) {
          const tokenParam = searchParams.get("token");
          setStatus("error");
          setError(
            tokenParam
              ? "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien."
              : "Une erreur est survenue lors de la vérification."
          );
          return;
        }

        // Vérification normale via POST
        const response = await axios.post(`${API_URL}/auth/verify-email/${token}`);
        
        if (response.data.success) {
          const { token: jwtToken, user, alreadyVerified } = response.data;
          localStorage.setItem("token", jwtToken);
          localStorage.setItem("user", JSON.stringify(user));
          if (login) login(jwtToken, user);
          if (onSuccess) onSuccess(jwtToken, user);
          setStatus("success");
          setMessage(
            alreadyVerified 
              ? "Votre email a déjà été vérifié. Vous êtes maintenant connecté." 
              : "Email vérifié avec succès ! Vous êtes maintenant connecté."
          );
        } else {
          throw new Error(response.data.message || "Échec de la vérification");
        }
      } catch (err: any) {
        // Gérer spécifiquement les erreurs 400 (token déjà utilisé) et 429 (rate limit)
        if (err.response?.status === 400) {
          // Vérifier si l'email est peut-être déjà vérifié
          const errorMessage = err.response?.data?.message || err.message;
          if (errorMessage.includes("deja verifie") || errorMessage.includes("déjà vérifié") || errorMessage.includes("already verified")) {
            setStatus("error");
            setError("Votre email a déjà été vérifié. Vous pouvez vous connecter.");
          } else {
            setStatus("error");
            setError("Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien.");
          }
        } else if (err.response?.status === 429) {
          setStatus("error");
          setError("Trop de tentatives. Veuillez attendre quelques instants avant de réessayer.");
        } else {
          setStatus("error");
          setError(
            err.response?.data?.message ||
            err.message ||
            "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien."
          );
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [login, onSuccess, isVerifying, status]);

  if (status === "loading") {
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
        <Card sx={{ maxWidth: 500, width: "100%", m: 2 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Vérification de votre email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Veuillez patienter
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (status === "success") {
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
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
              ✅ Email vérifié !
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message || "Votre email a été vérifié avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités de l'application."}
            </Alert>
            {onSwitchToLogin && (
              <Button
                variant="contained"
                size="large"
                onClick={onSwitchToLogin}
                sx={{ mt: 2 }}
              >
                Continuer
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Status === "error"
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
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
            ❌ Erreur de vérification
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Le lien de vérification est invalide ou a expiré."}
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Que pouvez-vous faire ?
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {onSwitchToLogin && (
              <Button
                variant="contained"
                onClick={onSwitchToLogin}
              >
                Me connecter
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => window.location.href = "/signup"}
            >
              Réessayer l'inscription
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

