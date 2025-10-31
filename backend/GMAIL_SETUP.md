# Configuration Gmail pour l'Envoi d'Emails

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 📧 Configuration Gmail SMTP

Pour que l'application puisse envoyer des emails (vérification d'inscription, reset password), configurez Gmail avec un **"App Password"**.

---

## 🔐 Étapes de Configuration

### 1. Activer la Validation en 2 Étapes

1. Allez sur : https://myaccount.google.com/security
2. Dans **"Connexion à Google"**, cliquez sur **"Validation en 2 étapes"**
3. Suivez les instructions pour l'activer
   - **Important** : La validation en 2 étapes doit être activée pour créer un App Password

---

### 2. Créer un Mot de Passe d'Application

1. Toujours sur : https://myaccount.google.com/security
2. Cherchez **"Mots de passe d'application"** (ou **"App passwords"**)
3. Si vous ne voyez pas cette option :
   - Vérifiez que la validation en 2 étapes est bien activée
   - Réessayez après quelques minutes
4. Cliquez sur **"Mots de passe d'application"**
5. Sélectionnez :
   - **Application** : "Application personnalisée" (ou "Autre")
   - **Nom** : "AI English Trainer" (ou autre nom)
6. Cliquez sur **"Générer"**
7. **Copiez le mot de passe généré** (16 caractères, espacés en groupes de 4)

---

### 3. Configurer le fichier `.env`

Ouvrez `.env` à la racine du projet et ajoutez/modifiez :

```env
# Email Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@learning-english.local
EMAIL_FROM_NAME=AI English Trainer
```

**⚠️ IMPORTANT** :
- `SMTP_USER` : Votre adresse Gmail complète
- `SMTP_PASSWORD` : Le mot de passe d'application (16 caractères générés)
  - Vous pouvez copier les espaces ou les retirer, les deux fonctionnent
  - Exemple : `abcd efgh ijkl mnop` ou `abcdefghijklmnop`

---

## 🧪 Tester la Configuration

### Méthode 1 : Script de Test Automatique

```bash
cd /media/franck/M2_2To_990_windows/programmation/learning_english/backend
node scripts/testEmail.js test@example.com
```

Le script va :
1. ✅ Vérifier la configuration `.env`
2. ✅ Tester la connexion SMTP
3. ✅ Envoyer un email de test
4. ✅ Afficher les résultats

### Méthode 2 : Test Manuel

```bash
# Vérifier que le backend démarre sans erreur email
cd backend
npm start

# Dans les logs, vous devriez voir :
# ✅ Service email prêt
```

---

## 📝 Exemple de Configuration `.env` Complète

```env
# ==================================
# ENVOI D'EMAILS (Gmail)
# ==================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mon-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=noreply@learning-english.local
EMAIL_FROM_NAME=AI English Trainer
```

---

## 🔍 Dépannage

### Erreur : "EAUTH" ou "Authentication failed"

**Problème** : Identifiants incorrects

**Solution** :
1. Vérifiez que vous utilisez un **App Password** (pas votre mot de passe Gmail)
2. Vérifiez que la validation en 2 étapes est activée
3. Régénérez un App Password si nécessaire
4. Vérifiez les espaces dans `SMTP_PASSWORD`

### Erreur : "ECONNREFUSED"

**Problème** : Connexion au serveur SMTP impossible

**Solution** :
1. Vérifiez votre connexion internet
2. Vérifiez `SMTP_HOST` (doit être `smtp.gmail.com`)
3. Vérifiez `SMTP_PORT` (doit être `587` pour Gmail)

### Erreur : "EENVELOPE" ou "Invalid recipient"

**Problème** : Adresse email invalide

**Solution** :
1. Vérifiez le format de l'adresse email
2. Testez avec votre propre email Gmail

---

## ✅ Vérification Rapide

```bash
# 1. Vérifier que .env existe et contient les bonnes variables
cat .env | grep SMTP

# 2. Tester l'envoi d'email
cd backend
node scripts/testEmail.js votre-email@gmail.com

# 3. Vérifier votre boîte de réception (et spam)
```

---

## 📧 Types d'Emails Envoyés

Une fois configuré, l'application enverra automatiquement :

1. **Email de vérification** - Lors de l'inscription
   - Lien : `http://localhost:3000/verify-email/:token`
   - Expiration : 24 heures

2. **Email de réinitialisation** - Pour reset password
   - Lien : `http://localhost:3000/reset-password/:token`
   - Expiration : 1 heure

3. **Email de bienvenue** - Après vérification (optionnel)

---

## 🔗 Liens Utiles

- **Gestion des App Passwords** : https://myaccount.google.com/apppasswords
- **Sécurité Google** : https://myaccount.google.com/security
- **Documentation Nodemailer** : https://nodemailer.com/about/

---

**💡 Conseil** : Testez toujours avec `node scripts/testEmail.js` avant de tester l'inscription complète !

