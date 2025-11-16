# Guide de déploiement du backend

> Déploiement du backend sur Railway, Render ou Vercel pour `backend.learning-english.iaproject.fr`

---

## 🚀 Option 1 : Railway (RECOMMANDÉ)

### Avantages
- ✅ Configuration simple
- ✅ HTTPS automatique
- ✅ Variables d'environnement faciles
- ✅ Logs en temps réel
- ✅ Déploiement automatique depuis GitHub

### Étapes de déploiement

#### 1. Créer un compte Railway

1. Aller sur https://railway.app
2. Se connecter avec GitHub
3. Autoriser l'accès au dépôt `bigmoletos/learning_english`

#### 2. Créer un nouveau projet

1. Cliquer sur **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Choisir le dépôt `learning_english`
4. Railway détecte automatiquement le dossier `backend/`

#### 3. Configurer les variables d'environnement

Dans les **Settings** du service, ajouter les variables suivantes :

```bash
# Environnement
NODE_ENV=production
PORT=5010

# Base de données
DATABASE_PATH=/app/database/production.sqlite
# OU pour PostgreSQL (recommandé en production)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=[Générer avec: openssl rand -base64 32]
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=[Générer avec: openssl rand -base64 32]
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS - IMPORTANT pour le frontend
CORS_ORIGIN=https://learning-english.iaproject.fr,https://bigmoletos.github.io
FRONTEND_URL=https://learning-english.iaproject.fr

# Google Cloud TTS (si utilisé)
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-tts-service-account.json
# OU uploader le fichier JSON dans Railway

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

#### 4. Configurer le domaine personnalisé

1. Dans **Settings** → **Networking**
2. Cliquer sur **"Custom Domain"**
3. Ajouter : `backend.learning-english.iaproject.fr`
4. Railway fournira un enregistrement CNAME à ajouter dans OVH

#### 5. Mettre à jour le DNS dans OVH

Dans OVH, remplacer le CNAME actuel par celui fourni par Railway :

```
backend.learning-english IN CNAME [URL_RAILWAY].up.railway.app
```

#### 6. Vérifier le déploiement

```bash
# Vérifier que le backend répond
curl https://backend.learning-english.iaproject.fr/health

# Devrait retourner : {"status":"ok","timestamp":"..."}
```

---

## 🚀 Option 2 : Render

### Avantages
- ✅ Plan gratuit disponible
- ✅ HTTPS automatique
- ✅ Déploiement automatique depuis GitHub

### Étapes de déploiement

#### 1. Créer un compte Render

1. Aller sur https://render.com
2. Se connecter avec GitHub
3. Autoriser l'accès au dépôt

#### 2. Créer un nouveau Web Service

1. Cliquer sur **"New +"** → **"Web Service"**
2. Connecter le dépôt `learning_english`
3. Configurer :
   - **Name** : `learning-english-backend`
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free (ou Paid pour plus de ressources)

#### 3. Configurer les variables d'environnement

Dans **Environment**, ajouter les mêmes variables que pour Railway (voir Option 1).

#### 4. Configurer le domaine personnalisé

1. Dans **Settings** → **Custom Domain**
2. Ajouter : `backend.learning-english.iaproject.fr`
3. Render fournira un enregistrement CNAME

#### 5. Mettre à jour le DNS dans OVH

```
backend.learning-english IN CNAME [URL_RENDER].onrender.com
```

---

## 🚀 Option 3 : Vercel

### Avantages
- ✅ Excellent pour les fonctions serverless
- ✅ Edge Network global
- ✅ Configuration via `vercel.json`

### Étapes de déploiement

#### 1. Installer Vercel CLI

```bash
npm i -g vercel
```

#### 2. Créer `vercel.json` dans `backend/`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. Déployer

```bash
cd backend
vercel login
vercel --prod
```

#### 4. Configurer les variables d'environnement

Dans le dashboard Vercel :
1. Aller dans **Settings** → **Environment Variables**
2. Ajouter toutes les variables nécessaires

#### 5. Configurer le domaine

1. Dans **Settings** → **Domains**
2. Ajouter : `backend.learning-english.iaproject.fr`
3. Suivre les instructions DNS

---

## 📋 Checklist de déploiement

### Avant le déploiement
- [ ] Toutes les variables d'environnement sont définies
- [ ] `CORS_ORIGIN` inclut `https://learning-english.iaproject.fr`
- [ ] `JWT_SECRET` et `REFRESH_TOKEN_SECRET` sont générés et sécurisés
- [ ] Les credentials Google Cloud TTS sont configurés (si utilisé)
- [ ] La base de données est configurée (SQLite ou PostgreSQL)

### Après le déploiement
- [ ] Le backend répond sur `/health`
- [ ] Le domaine personnalisé est configuré
- [ ] Le DNS CNAME est mis à jour dans OVH
- [ ] HTTPS fonctionne (certificat SSL valide)
- [ ] Les logs sont accessibles
- [ ] Le frontend peut communiquer avec le backend (test CORS)

### Tests de validation

```bash
# 1. Health check
curl https://backend.learning-english.iaproject.fr/health

# 2. Test CORS depuis le frontend
# Ouvrir la console du navigateur sur https://learning-english.iaproject.fr
# Vérifier qu'il n'y a pas d'erreurs CORS

# 3. Test d'un endpoint API
curl -X POST https://backend.learning-english.iaproject.fr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

---

## 🔒 Sécurité

### Variables sensibles
- ✅ Ne jamais commiter les secrets dans Git
- ✅ Utiliser les variables d'environnement du service d'hébergement
- ✅ Régénérer `JWT_SECRET` et `REFRESH_TOKEN_SECRET` pour la production

### CORS
- ✅ Limiter `CORS_ORIGIN` aux domaines autorisés uniquement
- ✅ Ne pas utiliser `*` en production

### Rate Limiting
- ✅ Activer le rate limiting sur toutes les routes sensibles
- ✅ Configurer des limites appropriées selon l'usage

---

## 🆘 Dépannage

### Le backend ne démarre pas

1. Vérifier les logs dans le dashboard du service
2. Vérifier que toutes les variables d'environnement sont définies
3. Vérifier que le port est correctement configuré

### Erreur CORS

1. Vérifier que `CORS_ORIGIN` inclut le domaine du frontend
2. Vérifier que le domaine est en HTTPS
3. Vérifier les headers dans la réponse du backend

### Le domaine personnalisé ne fonctionne pas

1. Vérifier que le CNAME DNS est correctement configuré
2. Attendre la propagation DNS (peut prendre jusqu'à 48h)
3. Vérifier le certificat SSL dans le dashboard du service

---

## 📚 Ressources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [OVH DNS Management](https://www.ovh.com/manager/web/#/domain)

---

**Auteur** : Bigmoletos
**Date** : 2025-01-XX
**Version** : 1.0.0

