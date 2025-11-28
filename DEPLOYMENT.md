# 🚀 Guide de Déploiement Complet

**Date** : 2025-11-27
**Projet** : learning-english
**Architecture** : Frontend (Cloudflare Pages) + Backend (Firebase Functions)

---

## 📊 Vue d'Ensemble

```
Frontend (React) → Cloudflare Pages ✅
Backend (API) → Firebase Functions ⚠️ (à déployer)
Base de données → Firestore (Firebase)
Authentification → Firebase Auth
```

**URLs** :
- Frontend : `https://learning-english.iaproject.fr` (Cloudflare Pages) ✅
- Backend : `https://europe-west1-ia-project-91c03.cloudfunctions.net/api` (Firebase Functions) ✅
- Backend (domaine personnalisé) : `https://backend.learning-english.iaproject.fr` (à configurer)

---

## ✅ État Actuel du Déploiement

### Frontend (Cloudflare Pages) ✅

- [x] Projet créé et déployé : `https://learning-english-b7d.pages.dev`
- [x] Domaine personnalisé : `learning-english.iaproject.fr`
- [x] Variables d'environnement configurées (voir `ENV_VARS.txt`)
- [x] Bug Firebase double initialisation corrigé

### Backend (Firebase Functions) ✅

- [x] Backend déployé : `https://europe-west1-ia-project-91c03.cloudfunctions.net/api`
- [x] Health check fonctionne (`/health`)
- [x] CORS configuré pour Cloudflare Pages
- [x] Plan Blaze activé
- [ ] Routes SQLite à adapter pour Firestore (prochaine étape)

---

## 🔥 Partie 1 : Backend Firebase Functions

### Étape 1 : Vérifier la Connexion Firebase

```powershell
cd C:\programmation\learning_english
firebase login:list
firebase --version
```

**Si pas connecté** : `firebase login`

### Étape 2 : Sélectionner le Projet Firebase

```powershell
firebase use ia-project-91c03
```

**Si erreur** : Vérifier que le projet existe sur https://console.firebase.google.com/

### Étape 3 : Configurer les Variables d'Environnement

Voir **`ENV_VARS.txt`** (section Firebase Functions) pour les commandes complètes.

```powershell
firebase functions:config:set `
  jwt.secret="6e7fd6d08c6a9784dc934342be5266a1b4f500402263e4956a6d6c60c1f738fb" `
  jwt.expires_in="7d" `
  cors.origin="https://learning-english.iaproject.fr,https://learning-english-b7d.pages.dev,https://bigmoletos.github.io" `
  frontend.url="https://learning-english.iaproject.fr"
```

### Étape 4 : Adapter les Routes pour Firestore

**⚠️ IMPORTANT** : Les routes actuelles utilisent SQLite (Sequelize). Il faut les adapter pour Firestore.

**Exemple d'adaptation** : `functions/routes/auth.js`

**Avant** (SQLite) :
```javascript
const sequelize = require("../database/connection");
const User = require("../models/User");
const user = await User.findOne({ where: { email } });
```

**Après** (Firestore) :
```javascript
const admin = require("firebase-admin");
const snapshot = await admin.firestore()
  .collection("users")
  .where("email", "==", email)
  .get();
```

**Option temporaire** : Créer une version minimale avec seulement `/health` pour tester le déploiement.

### Étape 5 : Déployer

```powershell
firebase deploy --only functions
```

**URL générée** : `https://europe-west1-ia-project-91c03.cloudfunctions.net/api`

### Étape 6 : Tester

**Vérifier que le backend est déployé** :

```powershell
# Lister les fonctions déployées
firebase functions:list

# Tester le health check
curl https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T...",
  "service": "firebase-functions",
  "project": "ia-project-91c03"
}
```

**Vérifier les logs** :

```powershell
# Voir les logs en temps réel
firebase functions:log --only api

# Voir les logs des dernières 24h
firebase functions:log --only api --limit 50
```

**Tester la route TTS** :

```powershell
# Via PowerShell (nécessite Invoke-WebRequest)
$body = @{
    text = "Hello, this is a test"
    languageCode = "en-US"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://europe-west1-ia-project-91c03.cloudfunctions.net/api/text-to-speech" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Vérifier dans la console Firebase** :

1. Aller sur https://console.firebase.google.com/project/ia-project-91c03/functions
2. Vérifier que la fonction `api` est déployée et active
3. Cliquer sur la fonction pour voir les métriques (invocations, erreurs, latence)
4. Vérifier les logs dans l'onglet "Logs"

### Étape 7 : Mettre à Jour le Frontend pour Utiliser le Backend

**⚠️ IMPORTANT** : Firebase Functions ne supporte pas directement les domaines personnalisés. Utilisez l'URL Firebase directement.

**Dans Cloudflare Pages** :
1. **Dashboard** → **Workers & Pages** → **Pages** → **learning-english**
2. **Settings** → **Environment variables**
3. **Modifier** `REACT_APP_API_URL` :
   ```
   https://europe-west1-ia-project-91c03.cloudfunctions.net/api
   ```
4. **Sauvegarder** (Cloudflare redéploiera automatiquement)

**Note** : Si vous voulez un domaine personnalisé (`backend.learning-english.iaproject.fr`), il faut utiliser Firebase Hosting comme proxy (voir section "Domaine Personnalisé" ci-dessous)

---

## ☁️ Partie 2 : Frontend Cloudflare Pages

### Configuration Actuelle ✅

**URL** : `https://learning-english-b7d.pages.dev`
**Domaine** : `learning-english.iaproject.fr`

### Variables d'Environnement (Cloudflare Pages)

Dans **Cloudflare Dashboard** → **Pages** → **Settings** → **Environment variables**, ajouter toutes les variables depuis **`ENV_VARS.txt`** (section Cloudflare Pages).

**⚠️ IMPORTANT** : `CI=false` et `DISABLE_ESLINT_PLUGIN=true` sont **obligatoires** pour éviter les erreurs de build ESLint.

### Build Configuration

- **Framework preset** : `Create React App`
- **Build command** : `npm run build`
- **Build output directory** : `build`
- **Root directory** : `/`

### Déploiement Automatique

Cloudflare Pages déploie automatiquement à chaque push sur `main`.

---

## 🐛 Bugs et Solutions

### 1. Firebase Initialisé Deux Fois ✅ CORRIGÉ

**Erreur** : `Firebase App named '[DEFAULT]' already exists`

**Solution** : Vérification de l'app existante avant initialisation dans `src/services/firebase/config.ts`

### 2. Backend Non Déployé ⚠️ EN COURS

**Erreur** : `ERR_CERT_COMMON_NAME_INVALID` pour `backend.learning-english.iaproject.fr`

**Solution** : Déployer le backend sur Firebase Functions (voir Partie 1)

### 3. Permission Microphone Refusée ⚠️

**Erreur** : `Permission result: false`

**Solutions** :
1. Autoriser la permission dans les paramètres du navigateur
2. Désactiver les bloqueurs de pub temporairement
3. Vérifier HTTPS (Cloudflare Pages utilise HTTPS ✅)

### 4. Firestore Bloqué par Bloqueur de Pub ⚠️

**Erreur** : `ERR_BLOCKED_BY_CLIENT` pour `firestore.googleapis.com`

**Solution** : Désactiver le bloqueur de pub pour `learning-english.iaproject.fr` ou utiliser un autre navigateur

---

## 📋 Checklist Complète

### Backend Firebase Functions

- [x] Structure créée (`.firebaserc`, `firebase.json`, `functions/`)
- [x] Routes copiées depuis `backend/routes/`
- [x] Dépendances installées
- [ ] Projet Firebase sélectionné (`firebase use ia-project-91c03`)
- [ ] Variables d'environnement configurées
- [ ] Routes adaptées pour Firestore
- [ ] Functions déployées
- [ ] Endpoint `/health` testé
- [ ] Domaine personnalisé configuré

### Frontend Cloudflare Pages

- [x] Projet créé sur Cloudflare Pages
- [x] Dépôt GitHub connecté
- [x] Build configuré
- [x] Variables d'environnement ajoutées
- [x] Déploiement réussi
- [x] Domaine personnalisé configuré
- [x] Bug Firebase double initialisation corrigé

---

## 🔧 Dépannage

### Erreur : "Failed to list Firebase projects"

**Solutions** :
1. Vérifier la connexion : `firebase login:list`
2. Réessayer : `firebase login`
3. Utiliser directement : `firebase use ia-project-91c03 --force`

### Erreur : Build failed (ESLint)

**Erreur** : `Treating warnings as errors because process.env.CI = true`

**Solution** : Ajouter dans Cloudflare Pages :
```
CI=false
DISABLE_ESLINT_PLUGIN=true
```

### Erreur : Routes ne fonctionnent pas

**Cause** : Les routes utilisent Sequelize/SQLite qui n'est pas disponible dans Firebase Functions.

**Solution** : Adapter les routes pour Firestore (voir Étape 4 de la Partie 1)

### Erreur : Module not found

**Solution** :
```powershell
cd functions
npm install [nom-du-module]
```

---

## 📚 Structure des Fichiers

### Firebase Functions

```
functions/
├── index.js              # Point d'entrée
├── package.json          # Dépendances
├── .eslintrc.js          # Configuration ESLint
├── routes/               # Routes API (à adapter pour Firestore)
│   ├── auth.js
│   ├── exercises.js
│   ├── progress.js
│   └── ...
├── middleware/           # Middleware Express
├── services/            # Services (Firebase Admin, etc.)
└── utils/               # Utilitaires
```

### Configuration Firebase

```
.firebaserc              # Projet Firebase sélectionné
firebase.json            # Configuration Functions
```

---

## 🎯 Prochaines Actions

1. **Sélectionner le projet Firebase** : `firebase use ia-project-91c03`
2. **Configurer les variables** : `firebase functions:config:set ...`
3. **Adapter les routes** pour Firestore (ou créer une version minimale)
4. **Déployer** : `firebase deploy --only functions`
5. **Tester** : `curl https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health`
6. **Configurer le domaine** : `backend.learning-english.iaproject.fr`

---

## 💰 Coûts

- **Cloudflare Pages** : Gratuit (illimité)
- **Firebase Functions** : Gratuit (2M invocations/mois)
- **Firestore** : Gratuit (1GB storage, 50K reads/jour)
- **Firebase Auth** : Gratuit (jusqu'à 50K utilisateurs)

**Total** : **€0/mois** 🎉

---

## 📞 Support

- **Firebase Console** : https://console.firebase.google.com/project/ia-project-91c03
- **Cloudflare Dashboard** : https://dash.cloudflare.com/
- **Documentation Firebase** : https://firebase.google.com/docs/functions
- **Documentation Cloudflare** : https://developers.cloudflare.com/pages/
- **Variables d'environnement** : Voir `ENV_VARS.txt`
- **Checklist production** : Voir `PRODUCTION_CHECKLIST.md`

---

## 🧪 Tests et Validation

### Vérifier le Déploiement Frontend

1. **Vérifier GitHub Pages** :
   - Aller sur `https://github.com/bigmoletos/learning_english/settings/pages`
   - Vérifier : Source = `Deploy from a branch`, Branch = `gh-pages`
   - Vérifier que le domaine `learning-english.iaproject.fr` est configuré

2. **Tester l'accès** :
   ```powershell
   curl -I https://learning-english.iaproject.fr
   # Devrait retourner : HTTP/2 200
   ```

3. **Vérifier dans le navigateur** :
   - Ouvrir `https://learning-english.iaproject.fr`
   - Ouvrir la console développeur (F12)
   - Vérifier qu'il n'y a pas d'erreurs critiques

### Vérifier le Déploiement Backend

```powershell
# Health check
curl https://backend.learning-english.iaproject.fr/health
# Devrait retourner : {"status":"ok","timestamp":"..."}

# Ou avec l'URL Firebase Functions
curl https://europe-west1-ia-project-91c03.cloudfunctions.net/api/health
```

### Tests Complets

1. **Frontend** : Ouvrir `https://learning-english.iaproject.fr` et vérifier qu'il charge
2. **Backend** : Vérifier que `/health` répond
3. **Intégration** : Tester une fonctionnalité qui appelle l'API (ex: connexion)
4. **CORS** : Vérifier qu'il n'y a pas d'erreurs CORS dans la console

---

## 🔧 Dépannage Avancé

### Problème : GitHub Pages affiche le README au lieu de l'app

**Cause** : GitHub Pages sert depuis `main` au lieu de `gh-pages`

**Solution** :
1. Aller sur `https://github.com/bigmoletos/learning_english/settings/pages`
2. Vérifier : Branch = `gh-pages` (pas `main`)
3. Si la branche `gh-pages` n'existe pas :
   - Vérifier que le workflow GitHub Actions a réussi
   - Ou déclencher manuellement : Actions → CI/CD Pipeline → Run workflow

### Problème : Secrets GitHub non disponibles

**Solution** :
1. Aller sur `https://github.com/bigmoletos/learning_english/settings/secrets/actions`
2. Vérifier que tous les secrets sont configurés (voir `ENV_VARS.txt`)
3. Vérifier que les noms correspondent exactement (sensible à la casse)

### Problème : Build échoue avec "REACT_APP_* is not defined"

**Solution** :
1. Vérifier que tous les secrets Firebase sont configurés dans GitHub
2. Vérifier les logs du workflow pour voir quels secrets manquent
3. Vérifier que le workflow utilise `${{ secrets.NOM_DU_SECRET }}`

### Problème : DNS ne fonctionne pas

**Solution** :
1. Vérifier la propagation : `nslookup learning-english.iaproject.fr`
2. Attendre jusqu'à 48h pour la propagation complète
3. Vérifier que le CNAME dans OVH pointe vers le bon service

---

## 🚂 Alternative : Backend sur Railway (si Firebase Functions ne convient pas)

### Option A : Railway (Recommandé)

1. **Créer un compte** : https://railway.app
2. **Déployer depuis GitHub** : Sélectionner le dépôt et le dossier `backend/`
3. **Configurer les variables** : Voir `ENV_VARS.txt` (section Railway)
4. **Configurer le domaine** : `backend.learning-english.iaproject.fr`
5. **Mettre à jour DNS OVH** : CNAME → Railway CNAME

**Avantages** :
- Configuration simple
- HTTPS automatique
- Déploiement automatique depuis GitHub
- Logs en temps réel

### Option B : Render (Gratuit)

1. **Créer un compte** : https://render.com
2. **Créer un Web Service** : Connecter le dépôt GitHub
3. **Configurer** : Root Directory = `backend`, Start Command = `npm start`
4. **Variables d'environnement** : Voir `ENV_VARS.txt`
5. **Domaine personnalisé** : `backend.learning-english.iaproject.fr`

---

## 📚 Fichiers de Documentation

- **`DEPLOYMENT.md`** (ce fichier) - Guide complet de déploiement
- **`PRODUCTION_CHECKLIST.md`** - Checklist de production
- **`ENV_VARS.txt`** - Toutes les variables d'environnement consolidées
- **`DEVELOPMENT.md`** - Guide développeur
- **`SECURITY.md`** - Politique de sécurité

---

**✅ Frontend déployé, backend en cours de déploiement !**
