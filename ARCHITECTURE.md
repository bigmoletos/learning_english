# Architecture Technique

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 🏗️ Vue d'ensemble

**Monorepo** avec Frontend (React/TypeScript) et Backend (Node.js/Express) séparés.

```
┌─────────────────────────────────────────┐
│     AI English Trainer (Monorepo)      │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (React/TS)  ←──HTTP──→  Backend (Node.js)
│  Port 3000                         Port 5010
│                                         │
│                                    Database (SQLite)
└─────────────────────────────────────────┘
```

---

## 📦 Deux `package.json` - Pourquoi ?

### 1. Frontend (`/package.json`)

**Langage** : TypeScript
**Framework** : React 18.2
**UI** : Material-UI 5

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "@mui/material": "^5.14.10",
    "react-router-dom": "^6.18.0"
  }
}
```

**Rôle** : Interface utilisateur, exercices, visualisation

**Démarrage** : `npm start` → http://localhost:3000

---

### 2. Backend (`/backend/package.json`)

**Langage** : JavaScript (Node.js)
**Framework** : Express.js 4.18
**ORM** : Sequelize

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  }
}
```

**Rôle** : API REST, authentification JWT, base de données

**Démarrage** : `cd backend && npm start` → http://localhost:5010

---

## 📁 Structure Projet

```
learning_english/
│
├── package.json                    # Frontend (React/TypeScript)
├── src/                            # Code frontend
│   ├── components/                 # Composants React
│   ├── contexts/                   # Context API (état global)
│   ├── hooks/                      # Custom hooks
│   ├── agents/                     # Agents IA
│   └── types/                      # Types TypeScript
│
├── public/
│   ├── data/exercises/             # 400 exercices JSON
│   └── corpus/                     # Ressources pédagogiques
│       ├── technical/              # 100 docs techniques
│       ├── grammar/                # 20 leçons
│       ├── dictionaries/           # 8000 mots
│       ├── listening/              # 100 textes écoute
│       ├── reading/                # 100 textes lecture
│       └── toeic_toefl/            # Matériel examen
│
├── backend/                        # Backend (Node.js/Express)
│   ├── package.json                # Dépendances backend
│   ├── server.js                   # Serveur principal
│   ├── database/
│   │   ├── connection.js           # Config Sequelize
│   │   └── seed.js                 # Données initiales
│   ├── models/                     # Modèles Sequelize
│   │   ├── User.js
│   │   ├── UserProgress.js
│   │   ├── AssessmentResult.js
│   │   └── LearningPlan.js
│   ├── routes/                     # Routes API
│   │   ├── auth.js                 # Authentification
│   │   ├── users.js                # Utilisateurs
│   │   ├── progress.js             # Progression
│   │   └── admin.js                # Administration
│   ├── middleware/
│   │   └── auth.js                 # JWT middleware
│   └── utils/
│       └── emailService.js         # Emails (nodemailer)
│
├── database/
│   └── learning_english.db         # SQLite
│
├── .env                            # Variables d'environnement
├── start_frontend_backend.sh       # Script complet
├── start-app.sh                    # Script frontend uniquement
│
└── README.md
```

---

## 🔄 Communication Frontend ↔ Backend

### Flow
```
1. Frontend envoie requête HTTP
   ↓
2. Backend vérifie JWT (si authentifié)
   ↓
3. Backend traite la requête
   ↓
4. Backend accède à la DB
   ↓
5. Backend retourne JSON
   ↓
6. Frontend met à jour l'UI
```

### Exemple

```typescript
// Frontend (TypeScript)
import axios from 'axios';

const API_URL = 'http://localhost:5010/api';

// Login
const response = await axios.post(`${API_URL}/auth/login`, {
  email: 'user@example.com',
  password: 'Password123!'
});

const { token, user } = response.data;
localStorage.setItem('token', token);

// Récupérer profil (avec JWT)
const profile = await axios.get(`${API_URL}/users/me`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

```javascript
// Backend (JavaScript)
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !await user.comparePassword(password)) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ success: true, token, user });
});
```

---

## 🗄️ Base de Données

### Tables (Sequelize)

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs + authentification |
| `user_progress` | Progression par exercice |
| `assessment_results` | Résultats d'évaluation |
| `learning_plans` | Plans d'apprentissage |

### Schéma Simplifié

```
users (1) ──< (N) user_progress
users (1) ──< (N) assessment_results
users (1) ──< (N) learning_plans
```

---

## 🌐 Ports & URLs

| Service | Port | URL | Rôle |
|---------|------|-----|------|
| **Frontend** | 3000 | http://localhost:3000 | Interface React |
| **Backend** | 5010 | http://localhost:5010 | API REST |
| **Database** | - | `database/learning_english.db` | SQLite |

---

## 🚀 Démarrage

### Option 1 : Tout en Une Commande

```bash
./start_frontend_backend.sh start
```

### Option 2 : Séparé (2 terminaux)

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm start
```

---

## 🔐 Flux d'Authentification

```
1. Utilisateur → Login Form
   ↓
2. Frontend → POST /api/auth/login
   ↓
3. Backend → Vérifier email/password (bcrypt)
   ↓
4. Backend → Générer JWT (7 jours)
   ↓
5. Frontend ← Reçoit {token, user}
   ↓
6. Frontend → Stocke token (localStorage)
   ↓
7. Toutes requêtes → Header: Authorization: Bearer <token>
   ↓
8. Backend → Middleware vérifie JWT
   ↓
9. Backend → Autorise ou Refuse (401)
```

---

## 🔒 Sécurité

- ✅ **JWT** : Tokens signés (7 jours)
- ✅ **Bcrypt** : Hashage mot de passe (10 rounds)
- ✅ **Helmet** : Protection headers HTTP
- ✅ **CORS** : Contrôle d'accès cross-origin
- ✅ **Rate Limiting** : 100 req/15min (global), 5 req/15min (auth)
- ✅ **Validation** : express-validator sur toutes les entrées
- ✅ **HTTPS** : Recommandé en production

---

## 🧪 Tests

### Backend
```bash
cd backend
npm test          # Jest + Supertest
```

### Frontend
```bash
npm test          # Jest + React Testing Library
```

---

## 📦 Build & Déploiement

### Frontend (Build Statique)

```bash
npm run build
# Génère : build/
# Déployer sur : Netlify, Vercel, GitHub Pages
```

### Backend (Serveur Node.js)

```bash
cd backend
npm start
# Déployer sur : Heroku, Railway, DigitalOcean, AWS
```

### Production

```env
# .env (production)
NODE_ENV=production
JWT_SECRET=<clé forte>
DATABASE_URL=postgresql://...  # PostgreSQL
CORS_ORIGIN=https://your-domain.com
COOKIE_SECURE=true
```

---

## 🎯 Technologies

| Composant | Frontend | Backend |
|-----------|----------|---------|
| **Langage** | TypeScript | JavaScript |
| **Framework** | React 18 | Express 4 |
| **UI** | Material-UI | - |
| **État** | Context API + Hooks | - |
| **HTTP** | Axios | - |
| **Routing** | React Router | Express Router |
| **Auth** | JWT (localStorage) | JWT + bcrypt |
| **Database** | - | Sequelize + SQLite |
| **Email** | - | Nodemailer |
| **Validation** | - | express-validator |
| **Logging** | - | Winston |

---

## 📚 Documentation

- **README.md** - Vue d'ensemble projet
- **GETTING_STARTED.md** - Installation & démarrage
- **ARCHITECTURE.md** - Ce fichier
- **BACKEND.md** - Backend & scripts détaillés
- **FEATURES.md** - Fonctionnalités complètes

---

## ✅ Avantages Architecture Monorepo

1. **Code partagé** : Types, constantes, utils
2. **Indépendance** : Frontend et backend déployables séparément
3. **Évolutivité** : Ajout facile d'apps (mobile, admin panel)
4. **Dépendances isolées** : Pas de conflits de versions
5. **Développement parallèle** : Équipes frontend/backend autonomes

---

**🎉 Architecture moderne, scalable et sécurisée !**
