# 🚀 Déploiement rapide du backend

> Guide rapide pour déployer le backend sur Railway (recommandé)

---

## ⚠️ Problème actuel

Le CNAME DNS `backend.learning-english.iaproject.fr` pointe vers `bigmoletos.github.io`, ce qui ne peut pas fonctionner car :
- ❌ GitHub Pages ne peut héberger que des sites statiques
- ❌ Le backend nécessite un serveur Node.js

---

## ✅ Solution : Déployer sur Railway (5 minutes)

### Étape 1 : Créer un compte Railway

1. Aller sur https://railway.app
2. Cliquer sur **"Start a New Project"**
3. Se connecter avec **GitHub**
4. Autoriser l'accès au dépôt `bigmoletos/learning_english`

### Étape 2 : Déployer le backend

1. Cliquer sur **"Deploy from GitHub repo"**
2. Sélectionner le dépôt `learning_english`
3. Railway détecte automatiquement le dossier `backend/`
4. Cliquer sur **"Deploy"**

### Étape 3 : Configurer les variables d'environnement

Dans **Settings** → **Variables**, ajouter :

```bash
NODE_ENV=production
PORT=5010
CORS_ORIGIN=https://learning-english.iaproject.fr,https://bigmoletos.github.io
FRONTEND_URL=https://learning-english.iaproject.fr
JWT_SECRET=[Générer avec: openssl rand -base64 32]
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=[Générer avec: openssl rand -base64 32]
REFRESH_TOKEN_EXPIRES_IN=30d
```

**Pour générer les secrets JWT** :
```bash
openssl rand -base64 32
```

### Étape 4 : Configurer le domaine personnalisé

1. Dans **Settings** → **Networking**
2. Cliquer sur **"Custom Domain"**
3. Ajouter : `backend.learning-english.iaproject.fr`
4. Railway affichera un **CNAME** à copier (ex: `xxx.up.railway.app`)

### Étape 5 : Mettre à jour le DNS dans OVH

1. Aller sur https://www.ovh.com/manager/web/
2. Sélectionner le domaine `iaproject.fr`
3. Aller dans **Zone DNS**
4. Trouver l'enregistrement `backend.learning-english IN CNAME bigmoletos.github.io`
5. **Modifier** pour pointer vers le CNAME Railway :
   ```
   backend.learning-english IN CNAME xxx.up.railway.app
   ```
   (Remplacer `xxx.up.railway.app` par le CNAME fourni par Railway)

6. **Sauvegarder**

### Étape 6 : Vérifier le déploiement

Attendre 5-10 minutes pour la propagation DNS, puis :

```bash
# Test du health check
curl https://backend.learning-english.iaproject.fr/health

# Devrait retourner : {"status":"ok","timestamp":"..."}
```

---

## 🔄 Alternative : Render (gratuit)

Si vous préférez Render (plan gratuit disponible) :

1. Aller sur https://render.com
2. Se connecter avec GitHub
3. **New +** → **Web Service**
4. Connecter le dépôt `learning_english`
5. Configurer :
   - **Name** : `learning-english-backend`
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
6. Dans **Environment**, ajouter les mêmes variables que Railway
7. Dans **Settings** → **Custom Domain**, ajouter `backend.learning-english.iaproject.fr`
8. Mettre à jour le CNAME DNS dans OVH avec l'URL Render (ex: `xxx.onrender.com`)

---

## ✅ Checklist

- [ ] Backend déployé sur Railway/Render
- [ ] Variables d'environnement configurées
- [ ] Domaine personnalisé ajouté dans Railway/Render
- [ ] CNAME DNS mis à jour dans OVH (pointe vers Railway/Render, pas GitHub)
- [ ] HTTPS fonctionne (automatique avec Railway/Render)
- [ ] Health check répond : `curl https://backend.learning-english.iaproject.fr/health`

---

## 🆘 Dépannage

### Le backend ne démarre pas
- Vérifier les logs dans Railway/Render
- Vérifier que toutes les variables d'environnement sont définies

### Erreur CORS
- Vérifier que `CORS_ORIGIN` inclut `https://learning-english.iaproject.fr`

### Le domaine ne fonctionne pas
- Attendre la propagation DNS (jusqu'à 48h, généralement 5-10 min)
- Vérifier que le CNAME DNS pointe vers Railway/Render, pas GitHub

---

**Temps estimé** : 10-15 minutes
**Coût** : Gratuit (Railway offre $5/mois, Render offre un plan gratuit)

