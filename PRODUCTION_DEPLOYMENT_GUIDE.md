# 🚀 Guide de Déploiement en Production

**Version:** 2.0.0
**Date:** 2025-11-10
**Status:** ✅ Prêt pour déploiement après configuration

---

## ⚠️ PRÉ-REQUIS CRITIQUES

### ✅ Liste de Vérification Avant Déploiement

- [ ] **Firebase Security Rules déployées** (firestore.rules, storage.rules)
- [ ] **JWT_SECRET généré** (256 bits minimum)
- [ ] **Variables d'environnement configurées** sur la plateforme d'hébergement
- [ ] **Certificat SSL/TLS installé** (HTTPS obligatoire)
- [ ] **SMTP configuré** pour les emails
- [ ] **google-services.json RETIRÉ** de l'historique Git
- [ ] **Tests de sécurité passés**
- [ ] **Backup database configuré**

---

## 1️⃣ DÉPLOIEMENT DES RÈGLES FIREBASE

### Installation Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Initialiser Firebase dans le projet

```bash
# À la racine du projet
firebase init

# Sélectionner:
# - Firestore
# - Storage
# - Hosting (optionnel)

# Utiliser les fichiers existants:
# - firestore.rules
# - storage.rules
```

### Déployer les règles

```bash
# Déployer UNIQUEMENT les règles (rapide)
firebase deploy --only firestore:rules,storage:rules

# Vérifier le déploiement
firebase firestore:rules:list
```

### ⚠️ IMPORTANT: Tester les règles

```bash
# Sur Firebase Console → Firestore → Rules
# Utiliser le simulateur pour tester:

# Test 1: Lecture utilisateur non authentifié
Service: cloud.firestore
Location: /databases/(default)/documents/users/user123
Operation: get
Authenticated: No
Expected: DENY ❌

# Test 2: Lecture utilisateur authentifié (son propre doc)
Service: cloud.firestore
Location: /databases/(default)/documents/users/user123
Operation: get
Authenticated: Yes (uid: user123)
Expected: ALLOW ✅

# Test 3: Lecture d'un autre utilisateur
Service: cloud.firestore
Location: /databases/(default)/documents/users/user456
Operation: get
Authenticated: Yes (uid: user123)
Expected: DENY ❌
```

---

## 2️⃣ GÉNÉRATION DU JWT_SECRET

### Générer un secret fort

```bash
# Méthode 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Méthode 2: OpenSSL
openssl rand -hex 64

# Méthode 3: Python
python3 -c "import secrets; print(secrets.token_hex(64))"
```

**Exemple de sortie:**
```
a7f3e9c2d8b1f4a6e8c3d7b9f2e5a8c4d1e6b3f7a9c2e5d8b4f1a7e3c9d6b2f5
```

### ⚠️ NE JAMAIS:
- Utiliser "secret", "password", "temp"
- Partager le secret
- Committer le secret dans Git
- Utiliser le même secret en dev et prod

---

## 3️⃣ CONFIGURATION DES VARIABLES D'ENVIRONNEMENT

### Backend (.env - NE PAS COMMITTER)

```bash
# Copier le template
cp .env.example .env

# Éditer avec vos valeurs réelles
nano .env
```

### Variables Requises

```env
# CRITICAL - Requis
NODE_ENV=production
JWT_SECRET=<votre-secret-256-bits-généré>
PORT=5000

# CRITICAL - Database
DATABASE_PATH=./database/learning_english.db

# CRITICAL - CORS
CORS_ORIGIN=https://votre-domaine.com,https://www.votre-domaine.com

# CRITICAL - Frontend URL
FRONTEND_URL=https://votre-domaine.com

# IMPORTANT - Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=<votre-sendgrid-api-key>

# CRITICAL - Firebase Admin SDK
FIREBASE_PROJECT_ID=<votre-project-id>
FIREBASE_CLIENT_EMAIL=<votre-service-account-email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<votre-clé-privée>\n-----END PRIVATE KEY-----\n"
```

### Frontend (.env.production)

```env
REACT_APP_API_URL=https://api.votre-domaine.com
REACT_APP_FIREBASE_API_KEY=<votre-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<votre-project>.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=<votre-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<votre-project>.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<votre-sender-id>
REACT_APP_FIREBASE_APP_ID=<votre-app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<votre-measurement-id>
```

---

## 4️⃣ CONFIGURATION SMTP (Email)

### Option A: SendGrid (Recommandé - Free tier 100 emails/jour)

1. Créer un compte sur https://sendgrid.com
2. Créer une API Key:
   - Settings → API Keys → Create API Key
   - Full Access
   - Copier la clé (ne sera montrée qu'une fois!)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option B: Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=<votre-mailgun-password>
```

### Option C: AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<votre-aws-access-key-id>
SMTP_PASSWORD=<votre-aws-secret-access-key>
```

---

## 5️⃣ HÉBERGEMENT BACKEND

### Option A: Railway (Recommandé)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialiser
railway init

# Déployer
railway up

# Configurer les variables d'environnement
railway variables set JWT_SECRET="<votre-secret>"
railway variables set NODE_ENV="production"
# ... etc pour toutes les variables
```

### Option B: Heroku

```bash
# Installer Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer app
heroku create votre-app-backend

# Configurer variables
heroku config:set JWT_SECRET="<votre-secret>"
heroku config:set NODE_ENV="production"

# Déployer
git push heroku main
```

### Option C: Render

1. Créer compte sur https://render.com
2. New → Web Service
3. Connecter Git repo
4. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Environment Variables: Ajouter toutes les variables

---

## 6️⃣ HÉBERGEMENT FRONTEND

### Option A: Vercel (Recommandé pour React)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Configurer variables d'environnement
vercel env add REACT_APP_API_URL production
vercel env add REACT_APP_FIREBASE_API_KEY production
# ... etc

# Production deployment
vercel --prod
```

### Option B: Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod

# Build settings dans netlify.toml:
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  REACT_APP_API_URL = "https://api.votre-domaine.com"
```

### Option C: Firebase Hosting

```bash
# Déjà initialisé avec Firebase CLI
firebase deploy --only hosting
```

---

## 7️⃣ CONFIGURATION SSL/TLS

### Certificats SSL Gratuits

**Let's Encrypt** (gratuit, auto-renew):
```bash
# Avec Certbot
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

**Cloudflare** (gratuit avec CDN):
1. Ajouter domaine sur Cloudflare
2. Changer nameservers
3. SSL automatique activé

### Vérifier SSL

```bash
# Test SSL
curl -I https://votre-domaine.com

# Vérifier grade SSL
# https://www.ssllabs.com/ssltest/analyze.html?d=votre-domaine.com
```

---

## 8️⃣ BACKUP DATABASE

### Script de Backup Automatique

Créer `backend/scripts/backup.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const dbPath = path.join(__dirname, '../../database/learning_english.db');
const backupDir = path.join(__dirname, '../../backups');
const timestamp = new Date().toISOString().replace(/:/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

fs.copyFileSync(dbPath, backupPath);
console.log(`✅ Backup created: ${backupPath}`);

// Supprimer backups > 30 jours
const files = fs.readdirSync(backupDir);
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

files.forEach(file => {
  const filePath = path.join(backupDir, file);
  const stats = fs.statSync(filePath);
  if (stats.mtimeMs < thirtyDaysAgo) {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Deleted old backup: ${file}`);
  }
});
```

### Cron Job (Linux)

```bash
# Éditer crontab
crontab -e

# Ajouter backup quotidien à 2h du matin
0 2 * * * cd /path/to/project && node backend/scripts/backup.js >> backups/backup.log 2>&1
```

### Alternative: PM2 avec cron

```javascript
// pm2.config.js
module.exports = {
  apps: [{
    name: 'ai-english-backend',
    script: 'backend/server.js',
    cron_restart: '0 2 * * *', // Restart à 2h (backup avant)
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 9️⃣ MONITORING & LOGS

### Logging avec Winston (déjà configuré)

```javascript
// backend/utils/logger.js existe déjà
// Les logs sont dans backend/logs/

// Voir les logs en production
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Monitoring avec PM2

```bash
# Installer PM2
npm install -g pm2

# Démarrer avec PM2
pm2 start backend/server.js --name ai-english-backend

# Monitoring
pm2 monit

# Logs
pm2 logs ai-english-backend

# Auto-restart au boot
pm2 startup
pm2 save
```

### Error Tracking: Sentry (Recommandé)

```bash
# Installation
npm install @sentry/node @sentry/integrations

# Configuration dans backend/server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Error handler middleware (ajouter à la fin)
app.use(Sentry.Handlers.errorHandler());
```

---

## 🔟 GÉNÉRATION APK ANDROID DE PRODUCTION

### 1. Préparer le Keystore

```bash
# Générer keystore (SAUVEGARDER PRÉCIEUSEMENT!)
keytool -genkey -v -keystore ai-english-release.keystore \
  -alias ai-english-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Backup du keystore (CRITIQUE!)
cp ai-english-release.keystore ~/backup-secure/
```

### 2. Configurer Android

Créer `android/key.properties`:

```properties
storePassword=<votre-password>
keyPassword=<votre-password>
keyAlias=ai-english-key
storeFile=../ai-english-release.keystore
```

Modifier `android/app/build.gradle`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release

```bash
# Build React production
npm run build

# Sync Capacitor
npx cap sync android

# Build APK Release
cd android
./gradlew assembleRelease

# APK généré dans:
# android/app/build/outputs/apk/release/app-release.apk
```

### 4. Test APK

```bash
# Installer sur device
adb install android/app/build/outputs/apk/release/app-release.apk

# Vérifier signature
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

---

## 1️⃣1️⃣ TESTS PRÉ-PRODUCTION

### Backend Tests

```bash
cd backend
npm test

# Tests de charge
npm install -g artillery
artillery quick --count 10 --num 50 https://api.votre-domaine.com/health
```

### Frontend Tests

```bash
npm test -- --coverage

# E2E Tests avec Cypress
npm run cypress:run
```

### Security Scan

```bash
# NPM Audit
npm audit

# Snyk (optionnel)
npx snyk test

# OWASP Dependency Check
npm install -g dependency-check
dependency-check --project "AI English Trainer" --scan ./
```

---

## 1️⃣2️⃣ CHECKLIST FINALE

### 🔐 Sécurité
- [ ] Firebase Security Rules déployées et testées
- [ ] JWT_SECRET généré (256 bits+)
- [ ] HTTPS configuré et forcé
- [ ] CORS configuré correctement
- [ ] Helmet activé avec CSP
- [ ] Rate limiting actif
- [ ] Input validation sur toutes les routes
- [ ] npm audit clean (0 vulnerabilities)

### 🗄️ Database
- [ ] Backup automatique configuré
- [ ] Backup manuel initial fait
- [ ] Backup testé (restore)
- [ ] Migration SQLite → Firebase planifiée

### 📧 Email
- [ ] SMTP configuré et testé
- [ ] Email de vérification fonctionne
- [ ] Email de reset password fonctionne
- [ ] Templates emails personnalisés

### 🔍 Monitoring
- [ ] Logging configuré (Winston)
- [ ] Error tracking configuré (Sentry)
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Analytics configuré (Google Analytics)

### 🚀 Deployment
- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] DNS configuré
- [ ] SSL actif (grade A+)
- [ ] Firebase Hosting configuré (optionnel)
- [ ] APK Release généré et signé

### 📝 Documentation
- [ ] README mis à jour
- [ ] API documentation créée
- [ ] Privacy Policy ajoutée
- [ ] Terms of Service ajoutés
- [ ] GDPR compliance vérifié

### 🧪 Testing
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Load testing fait
- [ ] Security scan passé

---

## 🆘 TROUBLESHOOTING

### Problème: Firebase Rules non appliquées

**Solution:**
```bash
# Redéployer
firebase deploy --only firestore:rules --force

# Vérifier via Console
# https://console.firebase.google.com/project/[PROJECT_ID]/firestore/rules
```

### Problème: CORS errors en production

**Solution:**
```bash
# Vérifier CORS_ORIGIN dans .env
# Format: https://domain1.com,https://domain2.com
# PAS d'espaces, PAS de trailing slash
```

### Problème: JWT errors

**Solution:**
```bash
# Regénérer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Mettre à jour partout (backend, env vars)
```

### Problème: APK crash au démarrage

**Solution:**
```bash
# Vérifier logs
adb logcat | grep -i "firebase\|error\|exception"

# Vérifier google-services.json
# Package name doit correspondre à build.gradle
```

---

## 📞 SUPPORT

### Ressources
- Firebase Console: https://console.firebase.google.com
- Railway Dashboard: https://railway.app
- Sentry Dashboard: https://sentry.io
- Let's Encrypt: https://letsencrypt.org

### Documentation
- Firebase Rules: https://firebase.google.com/docs/rules
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
- React Production: https://reactjs.org/docs/optimizing-performance.html

---

**🎉 Votre application est prête pour la production !**

Suivez ce guide étape par étape et votre application sera déployée de manière sécurisée et professionnelle.

**Prochaine étape:** Commencer par déployer les Firebase Security Rules !
