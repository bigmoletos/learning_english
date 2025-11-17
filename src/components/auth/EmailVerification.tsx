/**
 * Composant de gestion de la vérification d'email avec Firebase Auth
 * Firebase gère automatiquement la vérification via les liens dans les emails
 * @version 2.0.0
 * @date 2025-11-06
 */

import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { auth } from "../../firebase/config";
import { applyActionCode, checkActionCode, sendEmailVerification } from "firebase/auth";
import { storageService, StorageKeys } from "../../utils/storageService";

interface EmailVerificationProps {
  onSuccess?: (token: string, user: any) => void;
  onSwitchToLogin?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  onSuccess,
  onSwitchToLogin,
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
        // Récupérer le code de vérification depuis l'URL Firebase
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode");
        const actionCode = urlParams.get("oobCode");

        // Si pas de code, vérifier si l'utilisateur est déjà connecté
        if (!actionCode) {
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.emailVerified) {
            setStatus("success");
            setMessage("Votre email est déjà vérifié. Vous êtes connecté.");
            return;
          } else if (currentUser && !currentUser.emailVerified) {
            // Renvoyer un email de vérification
            try {
              await sendEmailVerification(currentUser);
              setStatus("error");
              setError(
                "Un nouvel email de vérification a été envoyé. Vérifiez votre boîte de réception."
              );
            } catch (error: any) {
              setStatus("error");
              setError("Erreur lors de l'envoi de l'email de vérification. Veuillez réessayer.");
            }
            return;
          } else {
            setStatus("error");
            setError(
              "Lien de vérification invalide. Veuillez vous connecter ou demander un nouveau lien."
            );
            return;
          }
        }

        // Vérifier le code d'action Firebase
        if (mode === "verifyEmail" && actionCode) {
          try {
            // Vérifier que le code est valide
            await checkActionCode(auth, actionCode);

            // Appliquer le code pour vérifier l'email
            await applyActionCode(auth, actionCode);

            // Récupérer l'utilisateur actuel ou depuis le storage
            const currentUser = auth.currentUser;
            if (currentUser) {
              // Recharger l'utilisateur pour obtenir l'état de vérification mis à jour
              await currentUser.reload();

              // Récupérer les données utilisateur depuis le storage
              const pendingUser = await storageService.get<any>(StorageKeys.PENDING_USER);
              const firebaseUser = await storageService.get<any>(StorageKeys.FIREBASE_USER);

              if (pendingUser || firebaseUser) {
                const userData = pendingUser || {
                  id: currentUser.uid,
                  email: currentUser.email,
                  name:
                    currentUser.displayName || currentUser.email?.split("@")[0] || "Utilisateur",
                  emailVerified: true,
                  currentLevel: "B1",
                  targetLevel: "C1",
                  createdAt: new Date().toISOString(),
                };

                // Obtenir le token Firebase
                const token = await currentUser.getIdToken();

                // Sauvegarder dans le storage
                await storageService.setMultiple({
                  [StorageKeys.TOKEN]: token,
                  [StorageKeys.USER]: userData,
                  [StorageKeys.FIREBASE_USER]: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                  },
                });

                // Nettoyer le pending user
                await storageService.remove(StorageKeys.PENDING_USER);

                // Connecter l'utilisateur
                if (login) {
                  await login(token, userData);
                }
                if (onSuccess) {
                  onSuccess(token, userData);
                }
              }

              setStatus("success");
              setMessage("Email vérifié avec succès ! Vous êtes maintenant connecté.");
            } else {
              setStatus("error");
              setError("Aucun utilisateur connecté. Veuillez vous connecter.");
            }
          } catch (error: any) {
            console.error("Erreur vérification email Firebase:", error);

            let errorMessage = "Le lien de vérification est invalide ou a expiré.";

            if (error.code === "auth/invalid-action-code") {
              errorMessage = "Le lien de vérification est invalide ou a déjà été utilisé.";
            } else if (error.code === "auth/expired-action-code") {
              errorMessage = "Le lien de vérification a expiré. Veuillez demander un nouveau lien.";
            } else if (error.code === "auth/user-disabled") {
              errorMessage = "Ce compte a été désactivé. Contactez l'administrateur.";
            }

            setStatus("error");
            setError(errorMessage);
          }
        } else {
          setStatus("error");
          setError("Lien de vérification invalide.");
        }
      } catch (err: any) {
        console.error("Erreur vérification email:", err);
        setStatus("error");
        setError(
          err.message || "Une erreur est survenue lors de la vérification. Veuillez réessayer."
        );
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
          bgcolor: "grey.100",
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
          py: 4,
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%", m: 2 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
              ✅ Email vérifié !
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message ||
                "Votre email a été vérifié avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités de l'application."}
            </Alert>
            {onSwitchToLogin && (
              <Button variant="contained" size="large" onClick={onSwitchToLogin} sx={{ mt: 2 }}>
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
        py: 4,
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
              <Button variant="contained" onClick={onSwitchToLogin}>
                Me connecter
              </Button>
            )}
            <Button variant="outlined" onClick={() => (window.location.href = "/signup")}>
              Réessayer l'inscription
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
