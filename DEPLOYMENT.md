# Guide de déploiement

> Production, build APK et hébergement

---

## 🏭 Build Production Web

### 1. Préparer le build

```bash
# Nettoyer les anciens builds
rm -rf build/

# Vérifier les tests
npm test

# Vérifier le linting
npm run lint

# Build optimisé
npm run build
```

### 2. Analyser le build

```bash
# Analyser la taille des bundles
npm run analyze

# Vérifier les warnings
cat build/static/js/*.map
```

### 3. Variables d'environnement production

Créer `.env.production` :

```bash
REACT_APP_FIREBASE_API_KEY=production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=prod-project-id
# ... autres variables
NODE_ENV=production
```

---

## 📱 Build Android (APK)

### Prérequis

- Android Studio installé
- JDK 11 ou supérieur
- Gradle configuré

### Étape 1 : Synchroniser avec Capacitor

```bash
# Build React en mode production
npm run build

# Synchroniser avec Android
npx cap sync android

# Copier les assets
npx cap copy android
```

### Étape 2 : Configurer le signing (release)

Créer `android/key.properties` :

```properties
storePassword=votre_mot_de_passe
keyPassword=votre_mot_de_passe_key
keyAlias=learning_english
storeFile=/chemin/vers/keystore.jks
```

Générer le keystore :

```bash
keytool -genkey -v -keystore learning_english.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias learning_english
```

### Étape 3 : Build APK

```bash
cd android

# Debug APK
./gradlew assembleDebug
# Fichier : android/app/build/outputs/apk/debug/app-debug.apk

# Release APK (signé)
./gradlew assembleRelease
# Fichier : android/app/build/outputs/apk/release/app-release.apk
```

### Étape 4 : Tester l'APK

```bash
# Installer sur un appareil Android connecté
adb install -r app/build/outputs/apk/release/app-release.apk

# Vérifier les logs
adb logcat | grep "LearningEnglish"
```

### Étape 5 : Build AAB (pour Play Store)

```bash
# Android App Bundle
./gradlew bundleRelease

# Fichier : android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🚀 Déploiement Firebase Hosting

### Étape 1 : Installer Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Étape 2 : Initialiser Firebase

```bash
firebase init hosting

# Sélectionner :
# - Public directory: build
# - Configure as single-page app: Yes
# - Automatic builds with GitHub: No (optionnel)
```

### Étape 3 : Déployer

```bash
# Build + Deploy
npm run build
firebase deploy --only hosting

# URL de production :
# https://votre-projet.web.app
```

### Étape 4 : Domaine personnalisé

```bash
# Ajouter un domaine
firebase hosting:channel:deploy production --expires 30d

# Configurer DNS :
# CNAME www -> votre-projet.web.app
# A @ -> IP Firebase Hosting
```

---

## 🐳 Déploiement Docker

### Dockerfile

Créer `Dockerfile` :

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Créer `docker-compose.yml` :

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "5010:5010"
    environment:
      - NODE_ENV=production
      - PORT=5010
    volumes:
      - ./backend/database:/app/database
    restart: unless-stopped
```

### Build et démarrer

```bash
# Build les images
docker-compose build

# Démarrer
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

---

## ☁️ Déploiement Cloud

### Google Cloud Platform (GCP)

```bash
# Installer gcloud CLI
curl https://sdk.cloud.google.com | bash

# Initialiser
gcloud init

# Déployer App Engine
gcloud app deploy app.yaml

# Ou Cloud Run
gcloud run deploy learning-english \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### AWS (Elastic Beanstalk)

```bash
# Installer EB CLI
pip install awsebcli

# Initialiser
eb init -p node.js learning-english

# Créer l'environnement
eb create production

# Déployer
eb deploy
```

### Heroku

```bash
# Login
heroku login

# Créer l'app
heroku create learning-english-app

# Déployer
git push heroku main

# Configurer les variables
heroku config:set REACT_APP_FIREBASE_API_KEY=xxx
```

---

## 🔒 Checklist pré-production

### Sécurité

- [ ] Toutes les API keys sont en variables d'environnement
- [ ] Firebase Rules configurées en mode production
- [ ] CORS configuré avec les domaines de production
- [ ] Rate limiting activé sur toutes les routes sensibles
- [ ] HTTPS activé (certificat SSL valide)
- [ ] Helmet configuré dans Express
- [ ] JWT_SECRET fort (>= 64 caractères)

### Performance

- [ ] Build React optimisé (npm run build)
- [ ] Code splitting activé
- [ ] Lazy loading des routes
- [ ] Images optimisées (WebP, compression)
- [ ] Cache configuré (Service Worker)
- [ ] CDN configuré pour les assets statiques
- [ ] Gzip/Brotli activé

### Fonctionnel

- [ ] Tests unitaires passent (npm test)
- [ ] Tests E2E passent (npm run test:e2e)
- [ ] Tous les environnements testés (dev, staging, prod)
- [ ] Firebase Auth fonctionne
- [ ] Google Cloud TTS fonctionne
- [ ] Reconnaissance vocale fonctionne (Chrome, Edge)
- [ ] APK Android testé sur plusieurs appareils

### Monitoring

- [ ] Logs configurés (Winston)
- [ ] Sentry ou équivalent pour error tracking
- [ ] Google Analytics ou équivalent
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Alertes configurées (email, Slack)

### Documentation

- [ ] README.md à jour
- [ ] CHANGELOG.md à jour
- [ ] Variables d'environnement documentées
- [ ] API documentée (si publique)

---

## 📊 Monitoring en production

### Firebase Analytics

```typescript
// Tracker les événements
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'exercise_completed', {
  exercise_id: 'grammar_01',
  score: 85,
  level: 'B1'
});
```

### Logs Backend

```bash
# Voir les logs en temps réel
tail -f backend/logs/app.log

# Chercher les erreurs
grep "ERROR" backend/logs/app.log

# Analyser les requêtes
grep "POST /api/auth/login" backend/logs/app.log | wc -l
```

### Health Checks

```bash
# Check backend
curl https://api.votre-domaine.com/health

# Check frontend
curl -I https://votre-domaine.com

# Check TTS
curl https://api.votre-domaine.com/api/text-to-speech/health
```

---

## 🔄 CI/CD (optionnel)

### GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: votre-projet-id
```

---

## 📦 Versions et releases

### Créer une release

```bash
# Mettre à jour package.json
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Créer un tag Git
git tag -a v1.0.1 -m "Release 1.0.1 - Bug fixes"
git push origin v1.0.1

# Build APK de release
cd android && ./gradlew assembleRelease
```

### Distribuer l'APK

1. **Google Play Store** :
   - Build AAB : `./gradlew bundleRelease`
   - Upload sur Play Console
   - Review (24-48h)

2. **Distribution directe** :
   - Héberger l'APK sur votre serveur
   - Fournir le lien de téléchargement
   - Utilisateurs doivent activer "Sources inconnues"

---

## 🆘 Rollback

### Firebase Hosting

```bash
# Voir les versions
firebase hosting:channel:list

# Revenir à une version précédente
firebase hosting:rollback
```

### Docker

```bash
# Redémarrer avec l'ancienne image
docker-compose down
docker-compose up -d --build --force-recreate
```

### Git

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main
```

---

## 📞 Support production

- **Incidents** : admin@iaproject.fr
- **Status page** : https://status.votre-domaine.com (à configurer)
- **Monitoring** : Firebase Console + Logs
- **Documentation** : [DEVELOPMENT.md](DEVELOPMENT.md)
