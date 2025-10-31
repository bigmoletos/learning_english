# Backend & Scripts - Guide Complet

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 🎯 Vue d'ensemble

**Backend** : API REST Node.js/Express avec authentification JWT et base SQLite.

**Technologies** :
- Express.js 4.18
- Sequelize ORM
- JWT + bcrypt
- Nodemailer
- SQLite (→ PostgreSQL en production)

---

## 📦 Installation

```bash
cd backend
npm install
```

---

## ⚙️ Configuration (.env)

Créer `.env` à la racine du projet :

```env
# Serveur
PORT=5000
NODE_ENV=development

# JWT (générer avec: openssl rand -base64 32)
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=admin@learning-english.local
ADMIN_PASSWORD=VotreMotDePasseSecurise123!

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@learning-english.local

# Base de données
DATABASE_URL=./database/learning_english.db
```

---

## 🚀 Démarrage

### Créer le compte admin (première fois)

```bash
cd backend
node database/seed.js
```

### Démarrer le serveur

```bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm start
```

**API disponible sur** : http://localhost:5000

---

## 📜 Scripts Disponibles

### Script 1 : `start-app.sh` (Frontend uniquement)

```bash
./start-app.sh start    # Démarrer
./start-app.sh stop     # Arrêter
./start-app.sh status   # Statut
```

### Script 2 : `start_frontend_backend.sh` (Full-Stack)

```bash
./start_frontend_backend.sh start         # Tout démarrer
./start_frontend_backend.sh stop          # Tout arrêter
./start_frontend_backend.sh restart       # Redémarrer
./start_frontend_backend.sh status        # Statut
./start_frontend_backend.sh logs-backend  # Logs backend
./start_frontend_backend.sh logs-frontend # Logs frontend
```

---

## 🔐 Routes API

### Authentification (publiques)

```bash
# Inscription
POST /api/auth/register
Body: {"email","password","firstName","lastName"}

# Connexion
POST /api/auth/login
Body: {"email","password"}
# Retourne: {token, user}

# Vérification email
GET /api/auth/verify-email/:token

# Reset password
POST /api/auth/forgot-password
Body: {"email"}

POST /api/auth/reset-password/:token
Body: {"password"}
```

### Utilisateurs (authentifiées)

```bash
# Profil
GET /api/users/me
Headers: Authorization: Bearer <token>

# Mise à jour profil
PUT /api/users/me
Body: {"firstName","lastName","currentLevel","targetLevel"}
```

### Progression (authentifiées)

```bash
# Sauvegarder progression
POST /api/progress
Body: {exerciseId, questionId, userAnswer, isCorrect, timeSpent}

# Récupérer progression
GET /api/progress

# Statistiques
GET /api/progress/stats
```

### Admin (admin uniquement)

```bash
# Liste utilisateurs
GET /api/admin/users

# Statistiques
GET /api/admin/stats

# Désactiver utilisateur
PUT /api/admin/users/:id/deactivate
```

---

## 🗄️ Modèles de Données

### User
- id (UUID)
- email (unique)
- password (hashé bcrypt)
- role (user/admin)
- currentLevel (A2/B1/B2/C1)
- isEmailVerified
- lastLogin

### UserProgress
- userId
- exerciseId
- questionId
- userAnswer
- isCorrect
- timeSpent
- score

### AssessmentResult
- userId
- totalQuestions
- correctAnswers
- listeningScore, readingScore, writingScore
- assessedLevel
- weakAreas (JSON)

### LearningPlan
- userId
- title, description
- priority (high/medium/low)
- progress (0-100)
- isAutoAdapted

---

## 🧪 Tests API

```bash
# Health check
curl http://localhost:5000/health

# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@","firstName":"John"}'

# Connexion (récupérer le token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@"}' \
  | jq -r '.token')

# Profil
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Progression
curl http://localhost:5000/api/progress/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 Sécurité Implémentée

- ✅ **Helmet** : Protection headers HTTP
- ✅ **CORS** : Contrôle d'accès
- ✅ **Rate Limiting** : 100 req/15min (global), 5 req/15min (auth)
- ✅ **Bcrypt** : Hashage passwords (10 rounds)
- ✅ **JWT** : Tokens sécurisés (7 jours)
- ✅ **Validation** : express-validator
- ✅ **RGPD** : Conformité intégrée

---

## 📂 Structure Backend

```
backend/
├── server.js              # Serveur principal
├── package.json
├── database/
│   ├── connection.js      # Config DB
│   └── seed.js            # Données initiales
├── models/
│   ├── User.js
│   ├── UserProgress.js
│   ├── AssessmentResult.js
│   └── LearningPlan.js
├── routes/
│   ├── auth.js            # Authentification
│   ├── users.js           # Utilisateurs
│   ├── progress.js        # Progression
│   └── admin.js           # Administration
├── middleware/
│   └── auth.js            # JWT & Admin
└── utils/
    └── emailService.js    # Envoi emails
```

---

## 🐛 Dépannage

### Port 5000 occupé
```bash
lsof -i :5000
kill -9 <PID>
```

### Base de données corrompue
```bash
rm ../database/learning_english.db
npm run seed
```

### Emails non envoyés
- Vérifier `SMTP_USER` et `SMTP_PASSWORD` dans `.env`
- Pour Gmail : utiliser un "App Password"
- Tester : `node utils/testEmail.js`

### Erreur JWT
```bash
# Générer nouvelle clé
openssl rand -base64 32
# Mettre à jour JWT_SECRET dans .env
```

---

## 🚀 Production

### Migration vers PostgreSQL

```javascript
// backend/database/connection.js
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});
```

```env
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/learning_english
```

### Variables d'environnement production

```env
NODE_ENV=production
JWT_SECRET=<clé forte générée>
COOKIE_SECURE=true
CORS_ORIGIN=https://your-domain.com
```

### Déploiement

- **Heroku** : `git push heroku main`
- **Railway** : Connecter repo GitHub
- **DigitalOcean** : App Platform
- **AWS** : Elastic Beanstalk

---

## 📊 Logs

```bash
# Logs backend
tail -f /tmp/backend_api.log

# Ou avec le script
./start_frontend_backend.sh logs-backend

# Logs en production (avec winston)
tail -f logs/app.log
```

---

## ✅ Checklist Backend

- [ ] Node.js 18+ installé
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` créé
- [ ] JWT_SECRET généré
- [ ] ADMIN_PASSWORD défini
- [ ] Email SMTP configuré
- [ ] Compte admin créé (`npm run seed`)
- [ ] Serveur démarré (`npm run dev`)
- [ ] Health check OK (`curl http://localhost:5000/health`)
- [ ] Test inscription OK
- [ ] Test connexion OK

---

**💡 Astuce** : Créez un alias dans `~/.bashrc` :

```bash
alias start-backend='cd /path/to/learning_english/backend && npm run dev'
alias logs-backend='tail -f /tmp/backend_api.log'
```

