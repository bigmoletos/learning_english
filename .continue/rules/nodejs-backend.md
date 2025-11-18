---
description: Rules for Node.js backend development
alwaysApply: false
---

# Règles Node.js & Backend

## Structure du Projet

```
backend/
├── routes/          # Routes Express
├── models/          # Modèles Sequelize
├── middleware/      # Middlewares Express
├── services/        # Services métier
├── utils/           # Utilitaires
├── database/        # Configuration DB
└── tests/           # Tests backend
```

## Express.js

### Routes
```javascript
// ✅ Bon - Routes modulaires
const express = require('express');
const router = express.Router();

router.post('/api/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ❌ Mauvais - Logique métier dans les routes
router.post('/api/users', (req, res) => {
  // Logique complexe ici ❌
});
```

### Middleware
- Utiliser des middlewares pour l'authentification, validation, logging
- Gérer les erreurs avec un middleware d'erreur centralisé
- Rate limiting sur les routes sensibles

### Validation
- Toujours valider les entrées avec `express-validator`
- Valider les types, formats, et contraintes
- Retourner des erreurs claires et structurées

## Sequelize (ORM)

### Modèles
```javascript
// ✅ Bon - Modèle avec validation
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  }
});

// ❌ Mauvais - Pas de validation
const User = sequelize.define('User', {
  email: DataTypes.STRING
});
```

### Requêtes
- Utiliser des transactions pour les opérations multiples
- Éviter les N+1 queries avec `include` et `attributes`
- Utiliser des indexes pour les colonnes fréquemment recherchées

## Sécurité

### Authentification
- JWT avec secret fort (>= 32 caractères)
- Tokens avec expiration
- Refresh tokens pour la sécurité

### Headers
- Utiliser Helmet.js pour les headers de sécurité
- CORS configuré avec origines spécifiques
- Rate limiting sur les routes d'authentification

### Validation
- Sanitizer les entrées utilisateur
- Valider les types et formats
- Protection contre les injections SQL (Sequelize le fait automatiquement)

## Logging (Winston)

```javascript
// ✅ Bon - Logging structuré
const logger = require('./utils/logger');

logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database error', { error: err.message, stack: err.stack });

// ❌ Mauvais - console.log en production
console.log('User created'); // ❌
```

## Tests Backend

- Utiliser Jest pour les tests unitaires
- Utiliser Supertest pour les tests d'intégration
- Mocker les dépendances externes (DB, APIs)
- Tests isolés et indépendants

## Gestion des Erreurs

```javascript
// ✅ Bon - Middleware d'erreur centralisé
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});
```

## Performance & Frugalité

### Optimisation Mémoire

```javascript
// ✅ Bon - Limiter la taille des caches
const cache = new Map();
const MAX_CACHE_SIZE = 100;

function setCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

// ✅ Bon - Nettoyage des connexions
process.on('SIGTERM', () => {
  server.close(() => {
    sequelize.close();
    process.exit(0);
  });
});
```

### Optimisation Requêtes

```javascript
// ✅ Bon - Pagination pour éviter de charger trop de données
router.get('/api/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const users = await User.findAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: ['id', 'email', 'name'] // Seulement les champs nécessaires
  });

  res.json({ users, page, limit });
});

// ❌ Mauvais - Charger toutes les données
const users = await User.findAll(); // ❌
```

### Monitoring

```javascript
// ✅ Bon - Monitoring de la mémoire
setInterval(() => {
  const usage = process.memoryUsage();
  logger.info('Memory usage', {
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`
  });
}, 60000); // Toutes les minutes
```

