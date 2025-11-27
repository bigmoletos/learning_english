/**
 * Configuration du système de logging avec Winston
 * @version 1.0.0
 * @date 2025-11-05
 * @description Logging structuré avec rotation des fichiers et formats JSON
 */

const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Format pour la console (plus lisible)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configuration des transports
const transports = [
  // Console (tous les logs en développement)
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
    handleExceptions: true,
    handleRejections: true
  }),

  // Fichier pour tous les logs
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    level: "info",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  }),

  // Fichier pour les erreurs uniquement
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10,
    tailable: true
  }),

  // Fichier pour les logs d'accès HTTP (si nécessaire)
  new winston.transports.File({
    filename: path.join(logsDir, "access.log"),
    level: "info",
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  })
];

// Créer le logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: logFormat,
  defaultMeta: {
    service: "ai-english-trainer-backend",
    environment: process.env.NODE_ENV || "development"
  },
  transports: transports,
  exitOnError: false
});

// Logger pour les requêtes HTTP (morgan-like)
logger.http = (message, meta = {}) => {
  logger.info(message, { ...meta, type: "http" });
};

// Logger pour les requêtes de base de données
logger.db = (message, meta = {}) => {
  logger.debug(message, { ...meta, type: "database" });
};

// Logger pour les métriques
logger.metrics = (message, meta = {}) => {
  logger.info(message, { ...meta, type: "metrics" });
};

// Logger pour les alertes
logger.alert = (message, meta = {}) => {
  logger.error(message, { ...meta, type: "alert", severity: meta.severity || "warning" });
};

module.exports = logger;




