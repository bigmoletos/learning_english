/**
 * Serveur principal - AI English Trainer Backend
 * @version 1.0.0
 * @date 31-10-2025
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const metrics = require('./utils/metrics');
const setupSequelizeMetrics = require('./utils/dbMonitoring');

// Charger les variables d'environnement
// Chercher le fichier .env dans le répertoire parent (racine du projet)
const path = require('path');
const fs = require('fs');

let envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  // Fallback : chercher dans le répertoire courant
  envPath = path.resolve(__dirname, '.env');
}

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  logger.info(`Variables d'environnement chargées depuis: ${envPath}`);
} else {
  logger.warn('Fichier .env non trouvé. Variables d\'environnement par défaut utilisées.');
  dotenv.config(); // Tentative de chargement depuis le répertoire courant
}

// Vérifier les variables critiques
if (!process.env.JWT_SECRET) {
  logger.error('ERREUR: JWT_SECRET non défini dans .env');
  logger.error('Le serveur ne pourra pas générer de tokens JWT.');
  logger.error('Ajoutez JWT_SECRET dans votre fichier .env');
}

if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  logger.warn('SMTP_USER ou SMTP_PASSWORD non défini - les emails ne fonctionneront pas');
}

const app = express();
const PORT = process.env.PORT || 5000;

// ==================================
// MIDDLEWARES DE SÉCURITÉ
// ==================================

// Helmet - Protection des headers HTTP
app.use(helmet());

// CORS - Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? true // Accepte toutes les origines en développement
    : (process.env.CORS_ORIGIN || 'http://localhost:3000'),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - Protection contre les attaques
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate limiting spécifique pour l'authentification (plus strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
});

// Rate limiting plus permissif pour la vérification d'email
const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 tentatives max (pour gérer les clics multiples)
  message: 'Trop de tentatives de verification. Veuillez attendre quelques minutes.',
  skip: (req) => {
    // Skip rate limiting si c'est une requête GET (redirection depuis email)
    return req.method === 'GET';
  }
});

// ==================================
// MIDDLEWARES GÉNÉRAUX
// ==================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression des réponses
app.use(compression());

// Middleware de métriques Prometheus (avant les routes)
app.use(metrics.middleware);

// Logging HTTP avec Winston
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// ==================================
// BASE DE DONNÉES
// ==================================

const db = require('./database/connection');

// Configurer le monitoring de la base de données
setupSequelizeMetrics(db);

// Initialiser la base de données
db.sync()
  .then(() => {
    logger.info('Base de données connectée et synchronisée');
    metrics.metrics.db.connectionsActive.set(1);
  })
  .catch((err) => {
    logger.error('Erreur de connexion à la base de données', { error: err.message, stack: err.stack });
    metrics.metrics.app.errorsTotal.inc({ type: 'database', severity: 'critical' });
  });

// ==================================
// ROUTES
// ==================================

// Route de métriques Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    const metricsData = await metrics.getMetrics();
    res.end(metricsData);
  } catch (err) {
    logger.error('Erreur lors de la récupération des métriques', { error: err.message });
    res.status(500).end();
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API AI English Trainer opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API AI English Trainer - Backend',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verifyEmail: 'GET /api/auth/verify-email/:token',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password/:token'
      },
      users: {
        profile: 'GET /api/users/me',
        updateProfile: 'PUT /api/users/me'
      },
      progress: {
        save: 'POST /api/progress',
        get: 'GET /api/progress',
        stats: 'GET /api/progress/stats'
      },
      admin: {
        users: 'GET /api/admin/users',
        stats: 'GET /api/admin/stats'
      }
    },
    documentation: 'Voir README.md ou BACKEND.md'
  });
});

// Routes API
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// ==================================
// GESTION DES ERREURS
// ==================================

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  // Logger l'erreur
  logger.error('Erreur serveur', {
    error: message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method
  });

  // Incrémenter les métriques d'erreur
  metrics.metrics.app.errorsTotal.inc({
    type: err.name || 'UnknownError',
    severity: statusCode >= 500 ? 'critical' : 'warning'
  });

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================================
// DÉMARRAGE DU SERVEUR
// ==================================

const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  logger.info('Serveur backend démarré', {
    port: PORT,
    host: HOST,
    url: `http://localhost:${PORT}`,
    networkUrl: `http://${HOST}:${PORT}`,
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
    console.log(`📍 URL locale: http://localhost:${PORT}`);
    console.log(`🌐 URL réseau: http://${HOST}:${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
    console.log(`🔒 CORS autorisé depuis: ${process.env.CORS_ORIGIN}`);
    console.log(`📊 Métriques disponibles sur: http://localhost:${PORT}/metrics`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Routes disponibles:');
    console.log('  GET  /health            - Vérifier l\'état du serveur');
    console.log('  GET  /metrics           - Métriques Prometheus');
    console.log('  POST /api/auth/register - Inscription');
    console.log('  POST /api/auth/login    - Connexion');
    console.log('  POST /api/auth/verify   - Vérification email');
    console.log('  GET  /api/users/me      - Profil utilisateur');
    console.log('');
  }
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux du serveur...');
  server.close(() => {
    logger.info('Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu (Ctrl+C), arrêt gracieux du serveur...');
  server.close(() => {
    logger.info('Serveur arrêté proprement');
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  metrics.metrics.app.errorsTotal.inc({ type: 'unhandledRejection', severity: 'critical' });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  metrics.metrics.app.errorsTotal.inc({ type: 'uncaughtException', severity: 'critical' });
  process.exit(1);
});

module.exports = app;

