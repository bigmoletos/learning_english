# Architecture de Persistance Multi-Plateforme

## 📋 Vue d'ensemble

Cette architecture garantit la persistance des comptes et des données sur **Web**, **Android** et **Backend** avec une synchronisation automatique via Firebase.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION (Web/Android)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  Firebase    │      │   Storage    │                    │
│  │    Auth      │◄─────►│   Service    │                    │
│  │ (Persistent) │      │  (Unified)    │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                     │                             │
│         │                     │                             │
│  ┌──────▼─────────────────────▼───────┐                    │
│  │      Firestore (Offline Cache)     │                    │
│  │    Source de vérité unique          │                    │
│  └──────────────┬──────────────────────┘                    │
│                 │                                            │
└─────────────────┼──────────────────────────────────────────┘
                   │
                   │ Synchronisation
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────┐                   │
│  │    Firebase Admin SDK                 │                   │
│  │  - Accès aux données Firestore        │                   │
│  │  - Gestion des utilisateurs           │                   │
│  │  - Validation des tokens               │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Composants

### 1. Service de Stockage Unifié (`storageService.ts`)

**Fonctionnalités** :
- ✅ Détection automatique de la plateforme (Web/Android)
- ✅ **Web** : Utilise `localStorage`
- ✅ **Android** : Utilise `Capacitor Preferences`
- ✅ API unifiée pour les deux plateformes
- ✅ Migration automatique depuis localStorage vers Preferences

**Utilisation** :
```typescript
import { storageService, StorageKeys } from "../utils/storageService";

// Lire
const user = await storageService.get(StorageKeys.USER);

// Écrire
await storageService.set(StorageKeys.USER, userData);

// Supprimer
await storageService.remove(StorageKeys.TOKEN);
```

### 2. Firebase Auth Persistance

**Configuration** :
- ✅ **Web** : `browserLocalPersistence` (session persistante)
- ✅ **Android** : Persistance automatique via Firebase SDK
- ✅ Les utilisateurs restent connectés même après fermeture de l'app

**Fichier** : `src/firebase/config.ts`

### 3. Firestore Offline Cache

**Configuration** :
- ✅ Cache IndexedDB illimité
- ✅ Synchronisation automatique en arrière-plan
- ✅ Fonctionne offline avec synchronisation différée
- ✅ Résolution automatique des conflits

**Fichier** : `src/firebase/config.ts`

### 4. Backend Firebase Admin SDK

**Fonctionnalités** :
- ✅ Accès aux mêmes données que le frontend
- ✅ Validation des tokens Firebase
- ✅ Gestion des utilisateurs côté serveur
- ✅ Pas besoin de base de données séparée

## 📦 Installation Backend

### Étape 1 : Installer Firebase Admin SDK

```bash
cd backend
npm install firebase-admin
```

### Étape 2 : Configurer les credentials Firebase

1. Aller dans Firebase Console > Project Settings > Service Accounts
2. Cliquer sur "Generate new private key"
3. Télécharger le fichier JSON
4. Placer le fichier dans `backend/config/firebase-service-account.json` (à ajouter au `.gitignore`)

### Étape 3 : Créer le service Firebase Admin

Créer `backend/services/firebaseAdmin.js` :

```javascript
const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

## 🔄 Migration des Données

### Migration depuis localStorage vers Capacitor Preferences

Le service de stockage effectue automatiquement la migration lors du premier lancement sur mobile :

```typescript
import { migrateFromLocalStorage } from "../utils/storageService";

// Appeler au démarrage de l'app
await migrateFromLocalStorage();
```

### Migration du Backend vers Firebase

1. **Exporter les données SQLite** :
```bash
cd backend
node scripts/export-to-json.js
```

2. **Importer dans Firestore** :
```bash
node scripts/import-to-firestore.js
```

## 📝 Utilisation

### Frontend (Web/Android)

#### Stockage local
```typescript
import { storageService, StorageKeys } from "../utils/storageService";

// Sauvegarder les données utilisateur
await storageService.set(StorageKeys.USER, userData);

// Lire les données
const user = await storageService.get(StorageKeys.USER);
```

#### Synchronisation Firestore
```typescript
import { syncUser, syncProgress } from "../services/firebase/syncService";

// Synchroniser l'utilisateur
await syncUser(userProfile);

// Synchroniser la progression
await syncProgress(userId, response, exerciseId, exerciseType, level);
```

### Backend

#### Accéder aux données Firestore
```javascript
const { db } = require('./services/firebaseAdmin');

// Lire un utilisateur
const userRef = db.collection('users').doc(userId);
const userDoc = await userRef.get();
const userData = userDoc.data();

// Écrire des données
await db.collection('users').doc(userId).set(userData);
```

#### Valider un token Firebase
```javascript
const { auth } = require('./services/firebaseAdmin');

async function verifyToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Token invalide');
  }
}
```

## 🔐 Sécurité

### Règles Firestore

Configurer les règles dans `firestore.rules` :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs : lecture/écriture uniquement pour le propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Progression : lecture/écriture uniquement pour le propriétaire
    match /progress/{progressId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

Déployer les règles :
```bash
firebase deploy --only firestore:rules
```

## 📊 Avantages de cette Architecture

### ✅ Multi-plateforme
- Même code pour Web et Android
- Persistance adaptée à chaque plateforme
- Synchronisation automatique

### ✅ Offline-first
- Fonctionne sans connexion
- Synchronisation différée
- Pas de perte de données

### ✅ Scalabilité
- Firestore gère automatiquement la scalabilité
- Pas de maintenance de base de données
- Backend simplifié

### ✅ Sécurité
- Authentification Firebase intégrée
- Règles de sécurité Firestore
- Tokens sécurisés

## 🚀 Déploiement

### Frontend

1. **Build** :
```bash
npm run build
```

2. **Sync Capacitor** :
```bash
npm run cap:sync
```

3. **Build Android** :
```bash
npm run cap:open
```

### Backend

1. **Variables d'environnement** :
```env
FIREBASE_PROJECT_ID=ia-project-91c03
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

2. **Démarrer** :
```bash
npm start
```

## 🔍 Dépannage

### Problème : Données non synchronisées

**Solution** :
1. Vérifier la connexion internet
2. Vérifier les règles Firestore
3. Vérifier l'authentification Firebase

### Problème : Cache Firestore non activé

**Solution** :
- Vérifier que `enableIndexedDbPersistence` est appelé
- Vérifier la console pour les erreurs
- Sur mobile, le cache est automatique

### Problème : Migration échouée

**Solution** :
- Vérifier les permissions Capacitor
- Vérifier l'espace de stockage disponible
- Vérifier les logs de migration

## 📚 Documentation Complémentaire

- [Firebase Auth Persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Firestore Offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Date** : 2025-11-06
**Version** : 1.0.0

