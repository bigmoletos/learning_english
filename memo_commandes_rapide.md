# 📝 Mémo Commandes Rapides - AI English Trainer

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 🗄️ Gestion Base de Données

### Voir un utilisateur spécifique

```bash
cd backend
node scripts/checkUser.js email@example.com
```

### Voir tous les utilisateurs

```bash
cd backend
node scripts/checkUser.js
```

### Supprimer un compte utilisateur

```bash
cd backend
node -e "const User = require('./models/User'); const sequelize = require('./database/connection'); require('dotenv').config({ path: '../.env' }); (async () => { await sequelize.authenticate(); await User.destroy({ where: { email: 'EMAIL_A_SUPPRIMER' } }); console.log('✅ Compte supprimé'); process.exit(0); })();"
```

**Exemple** :
```bash
cd backend
node -e "const User = require('./models/User'); const sequelize = require('./database/connection'); require('dotenv').config({ path: '../.env' }); (async () => { await sequelize.authenticate(); await User.destroy({ where: { email: 'desmedtfranck@gmail.com' } }); console.log('✅ Compte supprimé'); process.exit(0); })();"
```

⚠️ **Attention** : Cette action est irréversible !

---

## 🔍 Vérification Utilisateurs

### Script automatique (recommandé)

```bash
cd backend
node scripts/checkUser.js email@example.com
```

### Via l'API avec curl

```bash
# Récupérer votre token depuis localStorage dans le navigateur
# localStorage.getItem('token')

# Voir votre profil
curl -X GET http://localhost:5010/api/users/me \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json"
```

---

## 🚀 Démarrage Application

### Démarrer frontend + backend

```bash
./start_frontend_backend.sh start
```

### Voir les logs

```bash
# Backend uniquement
./start_frontend_backend.sh logs-backend

# Frontend uniquement
./start_frontend_backend.sh logs-frontend

# Les deux
./start_frontend_backend.sh logs
```

---

## 📧 Test Email

### Tester l'envoi d'emails

```bash
cd backend/scripts
./testEmail.sh
```

---

## 🔧 Utilitaires

### Voir les logs backend

```bash
tail -50 /tmp/backend_api.log | grep -A 5 "register\|INSERT"
```

### Vérifier le statut des serveurs

```bash
./start_frontend_backend.sh status
```

---

## 📚 Documentation Complète

- **SCRIPTS_COMMANDES.md** - Guide complet des scripts
- **BACKEND.md** - Configuration backend et API
- **GETTING_STARTED.md** - Installation et démarrage
- **README.md** - Vue d'ensemble du projet

---

**💡 Astuce** : Ajoutez cette commande dans votre `~/.bashrc` pour un alias rapide :

```bash
alias delete-user='cd /media/franck/M2_2To_990_windows/programmation/learning_english/backend && node -e "const User = require(\"./models/User\"); const sequelize = require(\"./database/connection\"); require(\"dotenv\").config({ path: \"../.env\" }); (async () => { await sequelize.authenticate(); const email = process.argv[2] || process.env.ADMIN_EMAIL; await User.destroy({ where: { email } }); console.log(\"✅ Compte supprimé\"); process.exit(0); })();"'
```

Ensuite utilisez : `delete-user email@example.com`

