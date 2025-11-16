# Configuration des domaines personnalisés

> Guide pour configurer `learning-english.iaproject.fr` et `backend.learning-english.iaproject.fr`

---

## 📋 État actuel

Vous avez créé les enregistrements DNS suivants dans OVH :

- **Frontend** : `learning-english.iaproject.fr` → CNAME `bigmoletos.github.io`
- **Backend** : `backend.learning-english.iaproject.fr` → CNAME `bigmoletos.github.io`

---

## ⚠️ Problème identifié

**GitHub Pages ne peut servir qu'un seul site statique par dépôt.**

Les deux CNAME pointent vers le même dépôt GitHub Pages (`bigmoletos.github.io`), ce qui signifie :
- ✅ Le frontend peut être hébergé sur GitHub Pages
- ❌ Le backend **ne peut pas** être hébergé sur GitHub Pages (il nécessite un serveur Node.js)

---

## ✅ Solutions recommandées

### Option 1 : Backend sur un service d'hébergement séparé (RECOMMANDÉ)

#### Hébergement du backend sur Railway, Render ou Vercel

1. **Railway** (recommandé pour Node.js) :
   ```bash
   # Installer Railway CLI
   npm i -g @railway/cli

   # Se connecter
   railway login

   # Initialiser le projet
   cd backend
   railway init

   # Déployer
   railway up
   ```

2. **Render** :
   - Créer un compte sur https://render.com
   - Créer un nouveau "Web Service"
   - Connecter le dépôt GitHub
   - Configurer :
     - Build Command : `cd backend && npm install`
     - Start Command : `cd backend && npm start`
     - Root Directory : `backend`

3. **Vercel** :
   ```bash
   # Installer Vercel CLI
   npm i -g vercel

   # Déployer le backend
   cd backend
   vercel --prod
   ```

#### Configuration DNS après déploiement

Une fois le backend déployé, mettre à jour le CNAME dans OVH :

```
backend.learning-english IN CNAME [URL_RAILWAY_OU_RENDER]
```

Exemple pour Railway :
```
backend.learning-english IN CNAME your-app.up.railway.app
```

---

### Option 2 : Backend sur un VPS avec Nginx (avancé)

Si vous avez un VPS, vous pouvez :

1. Installer Node.js et PM2 sur le VPS
2. Configurer Nginx comme reverse proxy
3. Mettre à jour le CNAME pour pointer vers l'IP du VPS

**Configuration Nginx** (`/etc/nginx/sites-available/backend.learning-english.iaproject.fr`) :

```nginx
server {
    listen 80;
    server_name backend.learning-english.iaproject.fr;

    location / {
        proxy_pass http://localhost:5010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 Configuration du projet

### 1. Variables d'environnement

Créer `.env.production` à la racine :

```bash
# URL du backend en production
REACT_APP_API_URL=https://backend.learning-english.iaproject.fr

# CORS - Autoriser le frontend
CORS_ORIGIN=https://learning-english.iaproject.fr,https://bigmoletos.github.io
```

### 2. Configuration du backend

Dans `backend/.env` (ou variables d'environnement du service d'hébergement) :

```bash
NODE_ENV=production
PORT=5010
CORS_ORIGIN=https://learning-english.iaproject.fr,https://bigmoletos.github.io
FRONTEND_URL=https://learning-english.iaproject.fr
```

### 3. Configuration GitHub Pages

Créer `.github/workflows/deploy-frontend.yml` :

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          REACT_APP_API_URL: https://backend.learning-english.iaproject.fr
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... autres variables

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

---

## 🧪 Tests locaux avec les URLs personnalisées

### Option A : Modifier `/etc/hosts` (Windows : `C:\Windows\System32\drivers\etc\hosts`)

```
127.0.0.1 learning-english.iaproject.fr
127.0.0.1 backend.learning-english.iaproject.fr
```

Puis démarrer le frontend et le backend :

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

Accéder à : `http://learning-english.iaproject.fr:3000`

### Option B : Utiliser les variables d'environnement

Créer `.env.local` :

```bash
REACT_APP_API_URL=http://backend.learning-english.iaproject.fr:5010
```

---

## ✅ Checklist de déploiement

### Frontend (GitHub Pages)
- [ ] Build avec `REACT_APP_API_URL` configuré
- [ ] Déployer sur GitHub Pages
- [ ] Vérifier que `learning-english.iaproject.fr` fonctionne
- [ ] Tester les appels API depuis le frontend

### Backend (Railway/Render/Vercel)
- [ ] Déployer le backend sur le service choisi
- [ ] Configurer les variables d'environnement (CORS_ORIGIN, etc.)
- [ ] Mettre à jour le CNAME DNS pour `backend.learning-english.iaproject.fr`
- [ ] Vérifier que `https://backend.learning-english.iaproject.fr/health` répond
- [ ] Tester les endpoints depuis le frontend

### Sécurité
- [ ] HTTPS activé (certificat SSL valide)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Variables d'environnement sécurisées (pas de secrets dans le code)

---

## 🆘 Dépannage

### Le frontend ne peut pas joindre le backend

1. Vérifier que `REACT_APP_API_URL` est bien défini dans le build
2. Vérifier les logs du backend (CORS errors ?)
3. Vérifier que le DNS est propagé : `nslookup backend.learning-english.iaproject.fr`

### Erreur CORS

Ajouter l'origine dans `CORS_ORIGIN` du backend :
```bash
CORS_ORIGIN=https://learning-english.iaproject.fr,https://bigmoletos.github.io,http://localhost:3000
```

### Le backend ne démarre pas

Vérifier les variables d'environnement requises :
- `PORT`
- `JWT_SECRET`
- `DATABASE_PATH` ou `DATABASE_URL`

---

## 📚 Ressources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

**Auteur** : Bigmoletos
**Date** : 2025-01-XX
**Version** : 1.0.0

