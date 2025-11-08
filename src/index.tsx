/**
 * Point d'entrée principal de l'application React
 * @version 1.1.0
 * @date 31-10-2025
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// ==================================
// GESTIONNAIRE D'ERREUR GLOBAL
// ==================================
// Filtre les erreurs provenant d'extensions Chrome tierces
// qui peuvent causer des "Extension context invalidated"

const isExtensionError = (error: Error | string): boolean => {
  const errorMessage = typeof error === "string" ? error : error.message;
  const errorStack = typeof error === "string" ? "" : error.stack || "";

  // Erreurs communes provenant d'extensions Chrome tierces
  const extensionErrorPatterns = [
    /Extension context invalidated/i,
    /chrome-extension:/i,
    /moz-extension:/i,
    /Cannot access contents of/i,
    /The message port closed/i,
    /Receiving end does not exist/i,
  ];

  return extensionErrorPatterns.some(
    (pattern) => pattern.test(errorMessage) || pattern.test(errorStack)
  );
};

const isFirestoreAuthError = (error: any): boolean => {
  const errorMessage = typeof error === "string" ? error : error?.message || "";
  const errorString = JSON.stringify(error);

  // Filtrer toutes les erreurs Firestore liées à l'authentification/offline
  const firestoreErrorPatterns = [
    /Opération annulée/i,
    /Utilisateur non authentifié/i,
    /Failed to get document because the client is offline/i,
    /WebChannelConnection RPC.*transport errored/i,
    /400.*Bad Request/i,
    /permission-denied/i,
    /unavailable/i,
    /failed-precondition/i,
  ];

  return firestoreErrorPatterns.some(
    (pattern) => pattern.test(errorMessage) || pattern.test(errorString)
  );
};

const isMUITooltipWarning = (error: any): boolean => {
  const errorMessage = typeof error === "string" ? error : error?.message || "";
  return /MUI.*disabled.*button.*Tooltip/i.test(errorMessage) ||
         /Tooltip.*disabled.*element/i.test(errorMessage);
};

// Gestionnaire d'erreur global pour window.onerror
window.addEventListener("error", (event) => {
  if (isExtensionError(event.error || event.message)) {
    // Ignorer silencieusement les erreurs d'extensions tierces
    event.preventDefault();
    return false;
  }
  // Laisser les autres erreurs être gérées normalement
  return true;
});

// Gestionnaire pour les promesses rejetées non capturées
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (
    reason &&
    (isExtensionError(reason) ||
      (typeof reason === "string" && isExtensionError(reason)))
  ) {
    // Ignorer silencieusement les erreurs d'extensions tierces
    event.preventDefault();
  }
});

// Gestionnaire console.error pour filtrer les erreurs d'extensions et Firestore en développement
if (process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(" ");

    // Filtrer les erreurs d'extensions, Firestore auth/offline, et MUI Tooltip
    if (
      !isExtensionError(errorString) &&
      !isFirestoreAuthError(errorString) &&
      !isMUITooltipWarning(errorString)
    ) {
      originalConsoleError.apply(console, args);
    }
    // Ignorer silencieusement les erreurs filtrées
  };

  // Filtrer aussi console.warn pour les avertissements Firestore
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const warnString = args.join(" ");

    if (!isFirestoreAuthError(warnString)) {
      originalConsoleWarn.apply(console, args);
    }
  };
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Force le rechargement en ajoutant un timestamp (développement uniquement)
if (process.env.NODE_ENV === "development") {
  console.log(`🔄 App chargée à ${new Date().toISOString()}`);
}

