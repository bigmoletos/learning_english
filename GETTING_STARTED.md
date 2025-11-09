# Guide de Démarrage Rapide

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 🎯 Installation en 5 Minutes

### Prérequis
- Node.js ≥ 18
- npm ≥ 9
- Git

### Installation Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/bigmoletos/learning_english.git
cd learning_english

# 2. Installer les dépendances
npm install
cd backend && npm install && cd ..

# 3. Configurer l'environnement
cp ENV_TEMPLATE.txt .env
nano .env  # Définir ADMIN_PASSWORD et JWT_SECRET

# 4. Créer le compte admin
cd backend && npm run seed && cd ..

# 5. Démarrer l'application
./start_frontend_backend.sh start
```

**🌐 Ouvrir** : http://localhost:3000

---

## 🚀 Commandes Essentielles

### Démarrage

```bash
# Tout démarrer (Frontend + Backend)
./start_frontend_backend.sh start

# Frontend uniquement
./start-app.sh start

# Backend uniquement
cd backend && npm run dev
```

### Statut & Logs

```bash
# Vérifier l'état
./start_frontend_backend.sh status

# Logs backend
tail -f /tmp/backend_api.log

# Logs frontend
tail -f /tmp/frontend_react.log
```

### Arrêt

```bash
# Arrêter tout
./start_frontend_backend.sh stop

# Ou manuellement
pkill -f "react-scripts"
pkill -f "node.*server.js"
```

---

## ⚙️ Configuration Backend

### 1. Fichier `.env` (obligatoire)

```env
# Sécurité
JWT_SECRET=your_super_secret_key_here
ADMIN_PASSWORD=YourSecurePassword123!

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Base de données
DATABASE_URL=./database/learning_english.db
```

### 2. Générer des clés sécurisées

```bash
# JWT Secret
openssl rand -base64 32

# Refresh Token Secret
openssl rand -base64 32
```

### 3. Configuration Gmail

1. Activer la validation en 2 étapes
2. Aller dans **Mots de passe d'application**
3. Créer un mot de passe pour "Application personnalisée"
4. Copier dans `.env` → `SMTP_PASSWORD`

---

## 🗄️ Base de Données

### Auto-création
La base SQLite est créée automatiquement au premier démarrage dans `database/learning_english.db`.

### Commandes Utiles

```bash
cd backend

# Créer le compte admin
npm run seed

# Réinitialiser la base
rm ../database/learning_english.db
npm run seed
```

---

## 🧪 Tests

### Vérifier que tout fonctionne

```bash
# 1. Backend
curl http://localhost:5010/health
# Devrait retourner: {"status":"OK",...}

# 2. Inscription
curl -X POST http://localhost:5010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@"}'

# 3. Connexion
curl -X POST http://localhost:5010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@"}'
```

### Frontend
Ouvrir http://localhost:3000 et :
1. Compléter l'évaluation de niveau
2. Consulter le tableau de bord
3. Essayer un exercice QCM

---

## 🐛 Dépannage Rapide

### Port déjà utilisé
```bash
lsof -i :3000  # Frontend
lsof -i :5010  # Backend
kill -9 <PID>
```

### Erreurs de compilation
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend ne démarre pas
```bash
# Vérifier .env
ls -la .env

# Réinstaller
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Base de données corrompue
```bash
rm database/learning_english.db
cd backend && npm run seed
```

---

## 📚 Documentation Complète

- **README.md** - Vue d'ensemble du projet
- **ARCHITECTURE.md** - Architecture technique
- **BACKEND.md** - Configuration backend détaillée
- **FEATURES.md** - Fonctionnalités disponibles

---

## ✅ Checklist Première Installation

- [ ] Node.js 18+ installé (`node -v`)
- [ ] Dépendances frontend installées (`npm install`)
- [ ] Dépendances backend installées (`cd backend && npm install`)
- [ ] Fichier `.env` créé et configuré
- [ ] Clés JWT générées
- [ ] Compte admin créé (`cd backend && npm run seed`)
- [ ] Backend démarré (port 5010)
- [ ] Frontend démarré (port 3000)
- [ ] Test backend OK (`curl http://localhost:5010/health`)
- [ ] Application accessible (`http://localhost:3000`)

---

**🎉 Vous êtes prêt !** Consultez **FEATURES.md** pour découvrir toutes les fonctionnalités.

