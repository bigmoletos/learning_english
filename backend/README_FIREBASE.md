# Configuration Backend avec Firebase Admin SDK

## 📋 Vue d'ensemble

Ce guide explique comment configurer le backend pour utiliser Firebase Admin SDK au lieu de JWT, permettant ainsi d'accéder aux mêmes données que le frontend.

## 🔧 Installation

### Étape 1 : Installer Firebase Admin SDK

```bash
cd backend
npm install firebase-admin
```

### Étape 2 : Obtenir les credentials Firebase

1. Aller dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet (`ia-project-91c03`)
3. Aller dans **Project Settings** > **Service Accounts**
4. Cliquer sur **Generate new private key**
5. Télécharger le fichier JSON

### Étape 3 : Configurer les credentials

1. Créer le dossier `backend/config/` s'il n'existe pas
2. Placer le fichier JSON téléchargé dans `backend/config/firebase-service-account.json`
3. Ajouter à `.gitignore` :
```
backend/config/firebase-service-account.json
```

### Étape 4 : Variables d'environnement

Ajouter dans `backend/.env` :
```env
FIREBASE_PROJECT_ID=ia-project-91c03
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

## 🚀 Utilisation

### Middleware d'authentification

**Option 1 : Utiliser le middleware Firebase (recommandé)**

```javascript
const { auth } = require("./middleware/firebaseAuth");

// Route protégée
app.get("/api/user/profile", auth, async (req, res) => {
  const userId = req.userId; // UID Firebase
  // ...
});
```

**Option 2 : Utiliser directement le service**

```javascript
const { verifyIdToken, getUserDataFromFirestore } = require("./services/firebaseAdmin");

app.get("/api/user/profile", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const decodedToken = await verifyIdToken(token);
  const userData = await getUserDataFromFirestore(decodedToken.uid);
  // ...
});
```

### Accéder aux données Firestore

```javascript
const { db } = require("./services/firebaseAdmin");

// Lire un utilisateur
const userDoc = await db.collection("users").doc(userId).get();
const userData = userDoc.data();

// Écrire des données
await db.collection("users").doc(userId).set({
  name: "John Doe",
  email: "john@example.com"
}, { merge: true });

// Requête avec filtre
const progressSnapshot = await db
  .collection("progress")
  .where("userId", "==", userId)
  .get();
```

## 🔄 Migration depuis JWT

### Avant (JWT)

```javascript
const { auth } = require("./middleware/auth");

app.get("/api/user/profile", auth, async (req, res) => {
  const user = req.user; // Modèle Sequelize
  // ...
});
```

### Après (Firebase)

```javascript
const { auth } = require("./middleware/firebaseAuth");

app.get("/api/user/profile", auth, async (req, res) => {
  const userId = req.userId; // UID Firebase
  const { getUserDataFromFirestore } = require("./services/firebaseAdmin");
  const userData = await getUserDataFromFirestore(userId);
  // ...
});
```

## 📝 Exemple complet

### Route avec authentification Firebase

```javascript
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/firebaseAuth");
const {
  getUserDataFromFirestore,
  saveUserDataToFirestore,
  getUserProgressFromFirestore
} = require("../services/firebaseAdmin");

// Obtenir le profil utilisateur
router.get("/profile", auth, async (req, res) => {
  try {
    const userData = await getUserDataFromFirestore(req.userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

// Mettre à jour le profil
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = req.body;
    await saveUserDataToFirestore(req.userId, updates);

    res.json({
      success: true,
      message: "Profil mis à jour"
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

// Obtenir la progression
router.get("/progress", auth, async (req, res) => {
  try {
    const progress = await getUserProgressFromFirestore(req.userId);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error("Erreur récupération progression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

module.exports = router;
```

## 🔐 Sécurité

### Vérification des tokens

Le middleware `firebaseAuthMiddleware` vérifie automatiquement :
- ✅ Validité du token
- ✅ Expiration du token
- ✅ Signature du token

### Règles Firestore

Assurez-vous que les règles Firestore sont configurées correctement dans `firestore.rules`.

## ⚠️ Mode dégradé

Si Firebase Admin n'est pas configuré, le backend fonctionne en mode dégradé :
- Les routes Firebase retournent une erreur
- Les autres routes continuent de fonctionner
- Un avertissement est affiché au démarrage

## 📚 Documentation

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Admin](https://firebase.google.com/docs/firestore/manage-data/delete-data)
- [Firebase Auth Admin](https://firebase.google.com/docs/auth/admin)

---

**Date** : 2025-11-06
**Version** : 1.0.0

