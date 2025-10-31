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

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================================
// MIDDLEWARES DE SÉCURITÉ
// ==================================

// Helmet - Protection des headers HTTP
app.use(helmet());

// CORS - Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================================
// BASE DE DONNÉES
// ==================================

const db = require('./database/connection');

// Initialiser la base de données
db.sync()
  .then(() => {
    console.log('✅ Base de données connectée et synchronisée');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données:', err);
  });

// ==================================
// ROUTES
// ==================================

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
  console.error('Erreur serveur:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================================
// DÉMARRAGE DU SERVEUR
// ==================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS autorisé depuis: ${process.env.CORS_ORIGIN}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('Routes disponibles:');
  console.log('  GET  /health           - Vérifier l\'état du serveur');
  console.log('  POST /api/auth/register - Inscription');
  console.log('  POST /api/auth/login    - Connexion');
  console.log('  POST /api/auth/verify   - Vérification email');
  console.log('  GET  /api/users/me      - Profil utilisateur');
  console.log('');
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt gracieux du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT reçu (Ctrl+C), arrêt gracieux du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;

