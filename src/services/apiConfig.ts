/**
 * Configuration centralisée de l'URL de l'API backend
 * @version 1.0.0
 * @date 2025-01-XX
 *
 * Gère automatiquement l'URL de base selon l'environnement :
 * - Développement : utilise le proxy (endpoints relatifs)
 * - Production : utilise REACT_APP_API_URL ou l'URL par défaut
 */

const getApiBaseUrl = (): string => {
  // En développement, utiliser le proxy (endpoints relatifs)
  const isDev = process.env.NODE_ENV === "development" || 
                (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));
  
  if (isDev) {
    return ""; // Endpoints relatifs, proxy gère la redirection
  }

  // En production, utiliser la variable d'environnement ou l'URL par défaut
  const apiUrl = process.env.REACT_APP_API_URL;

  if (apiUrl) {
    // Nettoyer l'URL : retirer le slash final et /api si présent
    let cleanedUrl = apiUrl.replace(/\/$/, "");
    // Si l'URL se termine par /api, la retirer car buildApiUrl ajoute déjà /api
    if (cleanedUrl.endsWith("/api")) {
      cleanedUrl = cleanedUrl.replace(/\/api$/, "");
    }
    
    // Validation : ne pas utiliser localhost en production
    if (cleanedUrl.includes("localhost") || cleanedUrl.includes("127.0.0.1")) {
      console.warn("[API Config] ⚠️ REACT_APP_API_URL pointe vers localhost en production, utilisation de l'URL par défaut");
      return "https://backend.learning-english.iaproject.fr";
    }
    
    return cleanedUrl;
  }

  // Fallback : URL de production par défaut
  // Si vous déployez sur backend.learning-english.iaproject.fr
  return "https://backend.learning-english.iaproject.fr";
};

/**
 * URL de base de l'API backend
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Construit l'URL complète d'un endpoint API
 * @param endpoint - Chemin de l'endpoint (ex: "/api/auth/login")
 * @returns URL complète
 */
export const buildApiUrl = (endpoint: string): string => {
  // S'assurer que l'endpoint commence par /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Si pas d'URL de base (dev avec proxy), retourner l'endpoint tel quel
  if (!API_BASE_URL) {
    return normalizedEndpoint;
  }

  // En production, combiner l'URL de base et l'endpoint
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * Configuration pour les différents environnements
 */
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Log uniquement en développement pour éviter le bruit en production
// Vérifier à la fois NODE_ENV et l'hostname pour être sûr
if (typeof window !== "undefined") {
  const isDev = process.env.NODE_ENV === "development" || 
                window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1";

  if (isDev) {
    console.log("[API Config] Configuration chargée:", {
      baseUrl: API_BASE_URL || "(proxy local)",
      environment: process.env.NODE_ENV,
      reactAppApiUrl: process.env.REACT_APP_API_URL || "(non défini)",
      hostname: window.location.hostname,
    });
  } else if (API_BASE_URL && (API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1"))) {
    // Avertissement si on détecte localhost en production
    console.error("[API Config] ❌ ERREUR: URL de l'API pointe vers localhost en production!", {
      baseUrl: API_BASE_URL,
      reactAppApiUrl: process.env.REACT_APP_API_URL,
      hostname: window.location.hostname,
    });
  }
}

