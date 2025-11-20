# Guide d'installation et configuration

> Configuration complète de l'environnement de développement

---

## 📋 Prérequis système

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **Compte Firebase** (gratuit)
- **Compte Google Cloud** (TTS nécessite facturation)
- **Android Studio** (optionnel, pour build APK)

**Dépendances backend essentielles** :
```bash
npm install sequelize winston express-rate-limit
```

---

## 🚀 Installation locale

### 1. Cloner le projet

```bash
git clone https://github.com/votre-org/learning_english.git
cd learning_english
```

### 2. Installer les dépendances

```bash
# Frontend
npm install

# Backend
cd backend
npm install
npm install sequelize winston express-rate-limit
cd ..
```

### 3. Configuration des variables d'environnement

Créer le fichier `.env` à la racine :

```bash
# ==================================
# SERVEUR BACKEND
# ==================================
PORT=5010
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ==================================
# JWT
# ==================================
JWT_SECRET=CHANGEZ_CETTE_CLE_SECRETE_SUPER_FORTE_JWT_2025
JWT_EXPIRES_IN=7d

# ==================================
# FIREBASE CONFIGURATION
# ==================================
REACT_APP_FIREBASE_API_KEY=votre_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=votre_projet_id
REACT_APP_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ==================================
# GOOGLE CLOUD TEXT-TO-SPEECH
# ==================================
GOOGLE_APPLICATION_CREDENTIALS=/chemin/vers/credentials.json

# ==================================
# CORS
# ==================================
CORS_ORIGIN=http://localhost:3000
```

---

## 🔥 Configuration Firebase

### Étape 1 : Créer un projet Firebase

1. Aller sur https://console.firebase.google.com
2. Cliquer sur **Ajouter un projet**
3. Nommer le projet : `learning-english-app`
4. Désactiver Google Analytics (optionnel)

### Étape 2 : Activer l'authentification

1. Dans la console Firebase, aller dans **Authentication**
2. Cliquer sur **Commencer**
3. Activer les méthodes :
   - ✅ **Email/Mot de passe**
   - ✅ **Google** (optionnel)

### Étape 3 : Créer une application Web

1. Dans les paramètres du projet, cliquer sur **Web** (icône `</>`)
2. Nommer l'app : `AI English Trainer Web`
3. Cocher **Firebase Hosting** (optionnel)
4. Copier la configuration dans votre `.env`

### Étape 4 : Configurer Firestore

1. Dans la console, aller dans **Firestore Database**
2. Créer une base de données
3. Choisir **Mode test** (pour développement)
4. Sélectionner une région proche (ex: `europe-west1`)

### Étape 5 : Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs authentifiés uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Progression de l'utilisateur
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Conversations
    match /conversations/{convId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🗣️ Configuration Google Cloud TTS

### Étape 1 : Activer l'API

1. Aller sur https://console.cloud.google.com
2. Créer un projet ou sélectionner un projet existant
3. Activer **Cloud Text-to-Speech API**
4. Configurer la facturation (nécessaire même pour l'essai gratuit)

### Étape 2 : Créer un compte de service

1. Aller dans **IAM & Admin** > **Service Accounts**
2. Créer un compte de service : `tts-service-account`
3. Rôle : **Cloud Text-to-Speech User**
4. Créer une clé JSON
5. Télécharger le fichier JSON

### Étape 3 : Configurer les credentials

```bash
# Créer le dossier credentials
mkdir -p backend/credentials

# Copier le fichier JSON téléchargé
cp ~/Downloads/google-tts-key.json backend/credentials/google-tts-service-account.json

# Mettre à jour .env
echo "GOOGLE_APPLICATION_CREDENTIALS=/chemin/absolu/vers/google-tts-service-account.json" >> .env
```

### Tarification TTS

- **1 million de caractères** : $4 (voix standard)
- **1 million de caractères** : $16 (voix WaveNet/Neural2)
- **Essai gratuit** : $300 de crédits pendant 90 jours

---

## 📱 Configuration Android (optionnel)

### Prérequis

- Android Studio
- JDK 11 ou supérieur
- Capacitor CLI : `npm install -g @capacitor/cli`

### Étape 1 : Initialiser Capacitor

```bash
# Déjà configuré dans le projet, vérifier :
npx cap sync android
```

### Étape 2 : Ouvrir dans Android Studio

```bash
npx cap open android
```

### Étape 3 : Configurer le SHA-1 pour Firebase

```bash
# Générer le SHA-1
cd android
./gradlew signingReport

# Copier le SHA-1 et l'ajouter dans Firebase Console >
# Paramètres du projet > Applications > Android
```

Voir [DEPLOYMENT.md](DEPLOYMENT.md#build-android) pour le build APK complet.

---

## 🧪 Vérifier l'installation

### Démarrer les serveurs

```bash
# Terminal 1 : Backend
cd backend
npm run dev

# Terminal 2 : Frontend
npm start
```

### Tests

```bash
# Lancer tous les tests
npm test

# Tests backend
cd backend && npm test

# Tests end-to-end
npm run test:e2e
```

### Vérifications

1. ✅ Backend accessible sur `http://localhost:5010/health`
2. ✅ Frontend accessible sur `http://localhost:3000`
3. ✅ Authentification Firebase fonctionne
4. ✅ Google Cloud TTS fonctionne (tester dans l'app)

---

## 🔧 Dépannage

### Erreur : "Firebase Auth not initialized"

```bash
# Vérifier que les variables REACT_APP_FIREBASE_* sont bien définies
echo $REACT_APP_FIREBASE_API_KEY
```

### Erreur : "Google Cloud TTS credentials not found"

```bash
# Vérifier le chemin absolu
export GOOGLE_APPLICATION_CREDENTIALS="/chemin/absolu/backend/credentials/google-tts-service-account.json"
```

### Port déjà utilisé

```bash
# Changer le port dans .env
PORT=5011

# Ou tuer le processus
lsof -ti:5010 | xargs kill -9
```

### Build Android échoue

```bash
# Nettoyer et rebuild
cd android
./gradlew clean
./gradlew build
```

---

## 📚 Ressources

- [Documentation Firebase](https://firebase.google.com/docs)
- [Google Cloud TTS](https://cloud.google.com/text-to-speech/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app)

---

## 🆘 Besoin d'aide ?

- Ouvrir une issue sur GitHub
- Email : admin@iaproject.fr
- Documentation complète : [DEVELOPMENT.md](DEVELOPMENT.md)
