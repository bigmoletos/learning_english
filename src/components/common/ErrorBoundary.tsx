/**
 * Composant ErrorBoundary - Gestion globale des erreurs React
 * @version 1.0.0
 * @date 07-11-2025
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("❌ Erreur capturée par ErrorBoundary:", error);
    console.error("📋 Info:", errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Sur mobile, essayer d'afficher une alerte native si disponible
    if (typeof (window as any).Capacitor !== "undefined") {
      console.error("Erreur sur Capacitor/Android:", error.message);
    }
  }

  handleReload = (): void => {
    // Nettoyer le localStorage en cas de corruption
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Impossible de vider localStorage:", e);
    }

    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 3,
            bgcolor: "#f5f5f5"
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: "center"
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: "error.main",
                mb: 2
              }}
            />

            <Typography variant="h5" gutterBottom color="error">
              Une erreur est survenue
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              L&apos;application a rencontré un problème. Veuillez réessayer.
            </Typography>

            {this.state.error && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: "#fff3f3",
                  textAlign: "left",
                  maxHeight: 200,
                  overflow: "auto"
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                </Typography>
              </Paper>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReload}
              size="large"
            >
              Recharger l&apos;application
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

