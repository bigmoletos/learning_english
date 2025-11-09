/**
 * Composant App - Point d'entrée principal de l'application
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
import {
  Box, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar,
  Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Container, IconButton, Grid, Card, CardContent, Button
} from "@mui/material";
import {
  Dashboard as DashboardIcon, School, Psychology, Assessment,
  Menu as MenuIcon, VolumeUp, ExitToApp
} from "@mui/icons-material";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Dashboard } from "./components/layout/Dashboard";
import { ProgressTracker } from "./components/progress/ProgressTracker";
import { ExerciseList } from "./components/exercises/ExerciseList";
import { ComprehensiveAssessment } from "./components/tests/ComprehensiveAssessment";
import { AdaptiveLearningPlan } from "./components/learning/AdaptiveLearningPlan";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { EmailVerification } from "./components/auth/EmailVerification";
import { TOEICTest } from "./components/tests/TOEICTest";
import { TOEFLTest } from "./components/tests/TOEFLTest";
import { EFSETTest } from "./components/tests/EFSETTest";
import { TestLevelSelector } from "./components/tests/TestLevelSelector";
import { LanguageLevel } from "./types";
import { runInitializationChecks } from "./utils/initializationCheck";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2"
    },
    secondary: {
      main: "#dc004e"
    },
    success: {
      main: "#2e7d32"
    }
  },
  typography: {
    fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
    h4: {
      fontWeight: 600,
      fontSize: "clamp(1.5rem, 5vw, 2.125rem)" // Responsive
    },
    h5: {
      fontWeight: 600,
      fontSize: "clamp(1.25rem, 4vw, 1.5rem)" // Responsive
    },
    h6: {
      fontWeight: 500,
      fontSize: "clamp(1rem, 3vw, 1.25rem)" // Responsive
    },
    body1: {
      fontSize: "clamp(0.875rem, 2vw, 1rem)" // Responsive
    },
    button: {
      textTransform: "none", // Pas de majuscules automatiques
      fontSize: "clamp(0.875rem, 2.5vw, 1rem)" // Responsive
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Taille minimale pour zones tactiles (44x44px recommandé)
          minHeight: 44,
          minWidth: 44,
          borderRadius: 8,
          padding: "10px 20px",
          // Amélioration du feedback tactile
          "@media (hover: none)": {
            "&:active": {
              transform: "scale(0.98)",
              transition: "transform 0.1s"
            }
          }
        },
        sizeLarge: {
          minHeight: 56,
          padding: "14px 28px",
          fontSize: "1.1rem"
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Taille minimale pour zones tactiles
          minHeight: 44,
          minWidth: 44,
          padding: 12
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined"
      },
      styleOverrides: {
        root: {
          // Zones de saisie plus grandes sur mobile
          "& .MuiInputBase-input": {
            fontSize: "clamp(0.875rem, 2vw, 1rem)",
            padding: "14px"
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          // Pas d'ombre excessive sur mobile
          "@media (max-width: 600px)": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 32,
          fontSize: "clamp(0.75rem, 2vw, 0.875rem)"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          // Meilleure gestion sur mobile
          "@media (max-width: 600px)": {
            width: "75vw",
            maxWidth: 280
          }
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  }
});

type ViewType = "dashboard" | "exercises" | "progress" | "tests" | "learning" | "toeic" | "toefl" | "efset";

const AppContent: React.FC = () => {
  const { isAuthenticated, login, logout, user } = useUser();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<"efset" | "toeic" | "toefl" | null>(null);
  const [selectedTestLevel, setSelectedTestLevel] = useState<LanguageLevel | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAssessment, setShowAssessment] = useState(() => {
    return !localStorage.getItem("levelAssessed");
  });

  // Vérification de l'initialisation au démarrage
  React.useEffect(() => {
    runInitializationChecks();
  }, []);

  // Vérifier si on est sur une route de vérification d'email
  const path = window.location.pathname;
  const isEmailVerificationRoute = path.includes("/verify-email/");

  // Afficher EmailVerification si on est sur la route de vérification
  if (isEmailVerificationRoute) {
    return (
      <EmailVerification
        onSuccess={(token, user) => {
          login(token, user);
        }}
        onSwitchToLogin={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  // Afficher Login/Signup/ForgotPassword si non authentifié
  if (!isAuthenticated) {
    if (showForgotPassword) {
      return (
        <ForgotPassword
          onSwitchToLogin={() => setShowForgotPassword(false)}
          onSuccess={() => {
            setShowForgotPassword(false);
          }}
        />
      );
    }
    if (showSignup) {
      return (
        <Signup
          onSuccess={(newToken, userData) => {
            login(newToken, userData);
            setShowSignup(false);
          }}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <Login
        onSuccess={(newToken, userData) => {
          login(newToken, userData);
        }}
        onSwitchToSignup={() => setShowSignup(true)}
        onSwitchToForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Tableau de bord", icon: <DashboardIcon /> },
    { id: "learning" as ViewType, label: "Mon Programme", icon: <Assessment /> },
    { id: "exercises" as ViewType, label: "Exercices", icon: <School /> },
    { id: "progress" as ViewType, label: "Progression", icon: <Assessment /> },
    { id: "tests" as ViewType, label: "Tests TOEIC/TOEFL", icon: <Psychology /> }
  ];

  const handleAssessmentComplete = () => {
    localStorage.setItem("levelAssessed", "true");
    setShowAssessment(false);
    setCurrentView("learning");
  };

  const handleStartAssessment = () => {
    localStorage.removeItem("levelAssessed");
    setShowAssessment(true);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
  };

  const handleTestLevelSelected = (level: LanguageLevel) => {
    setSelectedTestLevel(level);

    // Déterminer quelle vue afficher selon le type de test (avant de réinitialiser)
    const testType = selectedTestType;
    setSelectedTestType(null); // Fermer le sélecteur

    // Déterminer quelle vue afficher selon le type de test
    if (testType === "efset") {
      setCurrentView("efset");
    } else if (testType === "toeic") {
      setCurrentView("toeic");
    } else if (testType === "toefl") {
      setCurrentView("toefl");
    }
  };

  const renderView = () => {
    if (showAssessment) {
      return <ComprehensiveAssessment onComplete={handleAssessmentComplete} />;
    }

    // Afficher le sélecteur de niveau si un type de test est sélectionné
    if (selectedTestType && !selectedTestLevel) {
      return (
        <TestLevelSelector
          testType={selectedTestType}
          onSelectLevel={handleTestLevelSelected}
          onCancel={() => {
            setSelectedTestType(null);
            setCurrentView("tests");
          }}
        />
      );
    }

    switch (currentView) {
    case "dashboard":
      return (
        <Dashboard
          onStartAssessment={handleStartAssessment}
          onNavigate={handleNavigate}
        />
      );
    case "learning":
      return <AdaptiveLearningPlan onNavigate={handleNavigate} />;
    case "progress":
      return <ProgressTracker />;
    case "exercises":
      return <ExerciseList />;
    case "tests":
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Tests d&apos;Évaluation
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    EF SET - 4 Skills
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Test adaptatif complet inspiré d&apos;EF SET : Reading, Listening, Writing, Speaking (90 min).
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    onClick={() => setSelectedTestType("efset")}
                  >
                    Passer le test EF SET
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test TOEIC
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Testez votre niveau d&apos;anglais avec un test TOEIC complet (Grammaire + Compréhension audio).
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setSelectedTestType("toeic")}
                  >
                    Passer le test TOEIC
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Test TOEFL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Testez votre niveau d&apos;anglais avec un test TOEFL avancé (Reading + Listening + Writing).
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setSelectedTestType("toefl")}
                  >
                    Passer le test TOEFL
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    case "efset":
      return (
        <Box sx={{ p: 0 }}>
          <Button
            variant="text"
            onClick={() => setCurrentView("tests")}
            sx={{ mb: 2 }}
          >
            ← Retour aux tests
          </Button>
          <EFSETTest
            level={selectedTestLevel || undefined}
            onComplete={(scores) => {
              if (user) {
                // Mettre à jour le niveau de l'utilisateur avec le résultat du test EF SET
                const updatedUser = {
                  ...user,
                  currentLevel: scores.level,
                  lastActivity: new Date()
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                // Sauvegarder les résultats dans localStorage
                localStorage.setItem("efsetResults", JSON.stringify(scores));
                localStorage.setItem("lastTestType", "efset");
                // Rafraîchir le contexte utilisateur
                window.location.reload(); // Simple refresh pour mettre à jour
              }
              // Retourner aux tests après 5 secondes
              setTimeout(() => setCurrentView("tests"), 5000);
            }}
          />
        </Box>
      );
    case "toeic":
      return (
        <Box sx={{ p: 0 }}>
          <Button
            variant="text"
            onClick={() => setCurrentView("tests")}
            sx={{ mb: 2 }}
          >
            ← Retour aux tests
          </Button>
          <TOEICTest
            level={selectedTestLevel || undefined}
            onComplete={(scores) => {
              if (user) {
                // Mettre à jour le niveau de l'utilisateur avec le résultat du test TOEIC
                const updatedUser = {
                  ...user,
                  currentLevel: scores.level,
                  lastActivity: new Date()
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                // Sauvegarder les résultats dans localStorage
                localStorage.setItem("toeicResults", JSON.stringify(scores));
                localStorage.setItem("lastTestType", "toeic");
                // Rafraîchir le contexte utilisateur
                window.location.reload(); // Simple refresh pour mettre à jour
              }
              // Retourner aux tests après 5 secondes
              setSelectedTestLevel(null);
              setTimeout(() => setCurrentView("tests"), 5000);
            }}
          />
        </Box>
      );
    case "toefl":
      return (
        <Box sx={{ p: 0 }}>
          <Button
            variant="text"
            onClick={() => setCurrentView("tests")}
            sx={{ mb: 2 }}
          >
            ← Retour aux tests
          </Button>
          <TOEFLTest
            level={selectedTestLevel || undefined}
            onComplete={(scores) => {
              if (user) {
                // Mettre à jour le niveau de l'utilisateur avec le résultat du test TOEFL
                const updatedUser = {
                  ...user,
                  currentLevel: scores.level,
                  lastActivity: new Date()
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                // Sauvegarder les résultats dans localStorage
                localStorage.setItem("toeflResults", JSON.stringify(scores));
                localStorage.setItem("lastTestType", "toefl");
                // Rafraîchir le contexte utilisateur
                window.location.reload(); // Simple refresh pour mettre à jour
              }
              // Retourner aux tests après 5 secondes
              setSelectedTestLevel(null);
              setTimeout(() => setCurrentView("tests"), 5000);
            }}
          />
        </Box>
      );
    default:
      return (
        <Dashboard
          onStartAssessment={handleStartAssessment}
          onNavigate={handleNavigate}
        />
      );
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          // Ajouter un padding-top pour éviter le chevauchement avec la barre de statut système
          paddingTop: {
            xs: "env(safe-area-inset-top, 24px)", // iOS safe area ou 24px par défaut
            sm: "env(safe-area-inset-top, 0px)" // Sur desktop, pas de padding supplémentaire
          },
          // Sur Android, la barre de statut fait généralement 24-28px
          "@media (max-width: 600px)": {
            paddingTop: "max(env(safe-area-inset-top, 0px), 24px)"
          }
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "56px !important", sm: "64px !important" } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <VolumeUp sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                AI English Trainer for IT Professionals
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2, fontStyle: "italic" }}>
              {user.name}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mr: 2, fontStyle: "italic" }}>
                B2 → C1
          </Typography>
          <IconButton
            color="inherit"
            onClick={logout}
            title="Déconnexion"
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            mt: {
              xs: "calc(64px + env(safe-area-inset-top, 24px))", // AppBar height + safe area
              sm: 8 // Desktop: AppBar height seulement
            }
          }
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.id}
              selected={currentView === item.id}
              onClick={() => setCurrentView(item.id)}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.light"
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: currentView === item.id ? "primary.main" : "inherit" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            mt: {
              xs: "calc(64px + env(safe-area-inset-top, 24px))", // AppBar height + safe area
              sm: 8 // Desktop: AppBar height seulement
            }
          }
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.id}
              selected={currentView === item.id}
              onClick={() => {
                setCurrentView(item.id);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: {
            xs: "calc(64px + env(safe-area-inset-top, 24px))", // AppBar height + safe area
            sm: 8 // Desktop: AppBar height seulement
          },
          bgcolor: "grey.50"
        }}
      >
        <Container maxWidth="xl">
          {renderView()}
        </Container>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;

