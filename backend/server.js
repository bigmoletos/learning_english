/**
 * Serveur principal - AI English Trainer Backend
 * @version 1.0.0
 * @date 31-10-2025
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// Charger les variables d'environnement
// Chercher le fichier .env dans le répertoire parent (racine du projet)
const path = require("path");
const fs = require("fs");

let envPath = path.resolve(__dirname, "../.env");
if (!fs.existsSync(envPath)) {
  // Fallback : chercher dans le répertoire courant
  envPath = path.resolve(__dirname, ".env");
}

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ Variables d'environnement chargées depuis: ${envPath}`);
} else {
  console.warn("⚠️  Fichier .env non trouvé. Variables d'environnement par défaut utilisées.");
  dotenv.config(); // Tentative de chargement depuis le répertoire courant
}

// ===================================
// VALIDATION DES VARIABLES D'ENVIRONNEMENT
// ===================================
const requiredEnvVars = ["JWT_SECRET", "NODE_ENV"];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error("❌ ERREUR: Variables d'environnement requises manquantes:");
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error("\n💡 Copiez .env.example vers .env et configurez les valeurs");
  process.exit(1);
}

// Vérifier JWT_SECRET strength en production
if (process.env.NODE_ENV === "production") {
  if (process.env.JWT_SECRET.length < 32) {
    console.error("❌ ERREUR: JWT_SECRET trop court en production (minimum 32 caractères)");
    console.error("   Générez un secret fort avec: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
    process.exit(1);
  }
}

// Warnings pour variables optionnelles
if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.warn("⚠️  SMTP_USER ou SMTP_PASSWORD non défini - les emails ne fonctionneront pas");
}

if (!process.env.CORS_ORIGIN && process.env.NODE_ENV === "production") {
  console.warn("⚠️  CORS_ORIGIN non défini en production - utilisation des valeurs par défaut");
}

const app = express();
const PORT = process.env.PORT || 5000;

// ==================================
// MIDDLEWARES DE SÉCURITÉ
// ==================================

// HTTPS Enforcement en production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Vérifier si la requête est en HTTPS
    if (req.header("x-forwarded-proto") !== "https" && req.header("host") !== "localhost") {
      return res.redirect(301, `https://${req.header("host")}${req.url}`);
    }
    next();
  });
}

// Helmet - Protection des headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // React needs unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://firebasestorage.googleapis.com", "https://*.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Pour compatibilité avec certains services tiers
}));

// CORS - Configuration sécurisée
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === "development") {
    // En développement, autoriser localhost sur différents ports
    return ["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:3000"];
  }

  // En production, utiliser CORS_ORIGIN depuis .env (supports multiple origins separated by comma)
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(",").map(origin => origin.trim());
  }

  // Fallback (ne devrait pas arriver grâce à la validation)
  return ["http://localhost:3000"];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));

// Rate Limiting - Protection contre les attaques
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Rate limiting spécifique pour l'authentification (plus strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes."
});

// Rate limiting plus permissif pour la vérification d'email
const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 tentatives max (pour gérer les clics multiples)
  message: "Trop de tentatives de verification. Veuillez attendre quelques minutes.",
  skip: (req) => {
    // Skip rate limiting si c'est une requête GET (redirection depuis email)
    return req.method === "GET";
  }
});

// ==================================
// MIDDLEWARES GÉNÉRAUX
// ==================================

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Compression des réponses
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ==================================
// BASE DE DONNÉES
// ==================================

const db = require("./database/connection");

// Initialiser la base de données
db.sync()
  .then(() => {
    console.log("✅ Base de données connectée et synchronisée");
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à la base de données:", err);
  });

// ==================================
// ROUTES
// ==================================

// Route de santé
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API AI English Trainer opérationnelle",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route racine
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API AI English Trainer - Backend",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        verifyEmail: "GET /api/auth/verify-email/:token",
        forgotPassword: "POST /api/auth/forgot-password",
        resetPassword: "POST /api/auth/reset-password/:token"
      },
      users: {
        profile: "GET /api/users/me",
        updateProfile: "PUT /api/users/me"
      },
      progress: {
        save: "POST /api/progress",
        get: "GET /api/progress",
        stats: "GET /api/progress/stats"
      },
      admin: {
        users: "GET /api/admin/users",
        stats: "GET /api/admin/stats"
      }
    },
    documentation: "Voir README.md ou BACKEND.md"
  });
});

// Routes API
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/exercises", require("./routes/exercises"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/text-to-speech", require("./routes/textToSpeech"));
app.use("/api/conversation", require("./routes/conversation"));
app.use("/api/translation", require("./routes/translation"));
app.use("/api/speaking-agent", require("./routes/speakingAgent"));
app.use("/api/speech-to-text", require("./routes/speechToText"));

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée"
  });
});

// ==================================
// GESTION DES ERREURS
// ==================================

app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ==================================
// DÉMARRAGE DU SERVEUR
// ==================================

const HOST = process.env.HOST || "0.0.0.0";
const server = app.listen(PORT, HOST, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL locale: http://localhost:${PORT}`);
  console.log(`🌐 URL réseau: http://${HOST}:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS autorisé depuis: ${process.env.CORS_ORIGIN}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("Routes disponibles:");
  console.log("  GET  /health           - Vérifier l'état du serveur");
  console.log("  POST /api/auth/register - Inscription");
  console.log("  POST /api/auth/login    - Connexion");
  console.log("  POST /api/auth/verify   - Vérification email");
  console.log("  GET  /api/users/me      - Profil utilisateur");
  console.log("");
  console.log("💡 Accès smartphone: http://21.0.0.112:5000");
  console.log("");
});

// Gestion de l'arrêt gracieux
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM reçu, arrêt gracieux du serveur...");
  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT reçu (Ctrl+C), arrêt gracieux du serveur...");
  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    process.exit(0);
  });
});

module.exports = app;

