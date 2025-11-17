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
  if (process.env.NODE_ENV === "development") {
    return ""; // Endpoints relatifs, proxy gère la redirection
  }

  // En production, utiliser la variable d'environnement ou l'URL par défaut
  const apiUrl = process.env.REACT_APP_API_URL;

  if (apiUrl) {
    // Retirer le slash final s'il existe
    return apiUrl.replace(/\/$/, "");
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
if (process.env.NODE_ENV === "development") {
  console.log("[API Config] Configuration chargée:", {
    baseUrl: API_BASE_URL || "(proxy local)",
    environment: process.env.NODE_ENV,
    reactAppApiUrl: process.env.REACT_APP_API_URL || "(non défini)",
  });
}

