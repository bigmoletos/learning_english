/**
 * Composant App - Point d'entrée principal de l'application
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
import {
  Box, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar,
  Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Container, IconButton
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 500
    }
  }
});

type ViewType = "dashboard" | "exercises" | "progress" | "tests" | "learning";

const AppContent: React.FC = () => {
  const { isAuthenticated, login, logout, user } = useUser();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAssessment, setShowAssessment] = useState(() => {
    return !localStorage.getItem("levelAssessed");
  });

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

  const renderView = () => {
    if (showAssessment) {
      return <ComprehensiveAssessment onComplete={handleAssessmentComplete} />;
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
        return <AdaptiveLearningPlan />;
      case "progress":
        return <ProgressTracker />;
      case "exercises":
        return <ExerciseList />;
      case "tests":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Tests TOEIC/TOEFL
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Section des tests en construction. Bientôt disponible !
            </Typography>
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
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
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
                mt: 8
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
              "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", mt: 8 }
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

          <Box component="main" sx={{ flexGrow: 1, mt: 8, bgcolor: "grey.50" }}>
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

