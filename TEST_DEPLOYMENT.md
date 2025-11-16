# Guide de test du déploiement

> Vérifier que le déploiement fonctionne correctement

---

## 🚀 Déclencher le premier déploiement

### Option 1 : Push sur la branche main (automatique)

Le workflow se déclenche automatiquement à chaque push sur `main` :

```bash
# Vérifier que vous êtes sur la branche main
git branch

# Si vous avez des changements non commités
git add .
git commit -m "chore: configuration GitHub Pages et domaines personnalisés"
git push origin main
```

### Option 2 : Déclencher manuellement depuis GitHub

1. Aller sur `https://github.com/bigmoletos/learning_english/actions`
2. Sélectionner le workflow **"CI/CD Pipeline"**
3. Cliquer sur **"Run workflow"**
4. Sélectionner la branche `main`
5. Cliquer sur **"Run workflow"**

---

## ✅ Vérifier le déploiement

### Étape 1 : Vérifier le workflow GitHub Actions

1. Aller sur `https://github.com/bigmoletos/learning_english/actions`
2. Cliquer sur le dernier workflow en cours/exécuté
3. Vérifier que tous les jobs passent :
   - ✅ 🔍 Lint & TypeCheck
   - ✅ 🧪 Test Frontend
   - ✅ 🔧 Test Backend
   - ✅ 🏗️ Build Frontend
   - ✅ 🔒 Security Audit
   - ✅ 🚀 Deploy to GitHub Pages

**Si un job échoue** :
- Cliquer sur le job pour voir les logs
- Vérifier les erreurs dans les logs
- Corriger et recommencer

---

### Étape 2 : Vérifier GitHub Pages

1. Aller sur `https://github.com/bigmoletos/learning_english/settings/pages`
2. Vérifier que :
   - ✅ Source : `Deploy from a branch`
   - ✅ Branch : `gh-pages` (créé automatiquement)
   - ✅ Custom domain : `learning-english.iaproject.fr` (si configuré)

**Note** : La branche `gh-pages` est créée automatiquement par l'action `peaceiris/actions-gh-pages@v3`

---

### Étape 3 : Vérifier le DNS

```bash
# Vérifier la résolution DNS
nslookup learning-english.iaproject.fr

# Devrait retourner :
# learning-english.iaproject.fr canonical name = bigmoletos.github.io
```

**Sur Windows PowerShell** :
```powershell
Resolve-DnsName learning-english.iaproject.fr
```

---

### Étape 4 : Tester l'accès au site

#### Test 1 : Vérifier que le site charge

```bash
# Test HTTP
curl -I https://learning-english.iaproject.fr

# Devrait retourner :
# HTTP/2 200
# Content-Type: text/html
```

**Dans le navigateur** :
1. Ouvrir `https://learning-english.iaproject.fr`
2. Vérifier que la page charge
3. Ouvrir la console développeur (F12)
4. Vérifier qu'il n'y a pas d'erreurs critiques

#### Test 2 : Vérifier le fichier CNAME

```bash
curl https://learning-english.iaproject.fr/CNAME

# Devrait retourner :
# learning-english.iaproject.fr
```

#### Test 3 : Vérifier les assets statiques

```bash
# Vérifier qu'un fichier JS est accessible
curl -I https://learning-english.iaproject.fr/static/js/main.*.js

# Devrait retourner :
# HTTP/2 200
# Content-Type: application/javascript
```

---

### Étape 5 : Vérifier la configuration API

#### Test 1 : Vérifier dans le code source

1. Ouvrir `https://learning-english.iaproject.fr` dans le navigateur
2. Ouvrir la console développeur (F12)
3. Aller dans l'onglet **Network**
4. Recharger la page
5. Vérifier que les requêtes API pointent vers :
   - `https://backend.learning-english.iaproject.fr/api/...`

**Note** : Si le backend n'est pas encore déployé, vous verrez des erreurs 404 ou CORS. C'est normal.

#### Test 2 : Vérifier dans le build

Le build devrait contenir l'URL de l'API dans les fichiers JavaScript :

```bash
# Télécharger un fichier JS du build
curl https://learning-english.iaproject.fr/static/js/main.*.js | grep -o "backend.learning-english.iaproject.fr" | head -1

# Devrait retourner :
# backend.learning-english.iaproject.fr
```

---

## 🐛 Dépannage

### Le workflow échoue

#### Erreur : "Secrets not found"

**Solution** :
1. Vérifier que tous les secrets sont configurés dans GitHub
2. Vérifier que les noms des secrets correspondent exactement
3. Vérifier les logs du workflow pour voir quels secrets manquent

#### Erreur : "Build failed"

**Solution** :
1. Vérifier les logs du job `🏗️ Build Frontend`
2. Vérifier que toutes les dépendances sont installées
3. Vérifier qu'il n'y a pas d'erreurs TypeScript ou ESLint

#### Erreur : "Deploy failed" - Permission denied

**Solution** :
1. Vérifier que GitHub Pages est activé dans les settings
2. Vérifier que le workflow a la permission `contents: write`
3. Vérifier que le token `GITHUB_TOKEN` est disponible

---

### Le site ne charge pas

#### Erreur : "404 Not Found"

**Causes possibles** :
1. Le déploiement n'est pas terminé (attendre quelques minutes)
2. La branche `gh-pages` n'existe pas encore
3. Le DNS n'est pas propagé

**Solution** :
1. Vérifier que le workflow a réussi
2. Vérifier que la branche `gh-pages` existe
3. Attendre la propagation DNS (jusqu'à 48h)

#### Erreur : "SSL Certificate Error"

**Solution** :
1. Vérifier que le CNAME DNS est correctement configuré
2. Attendre que GitHub génère le certificat SSL (peut prendre quelques heures)
3. Vérifier dans GitHub Settings → Pages → Custom domain

---

### Les appels API échouent

#### Erreur : "CORS policy"

**Cause** : Le backend n'est pas encore déployé ou CORS mal configuré

**Solution** :
1. Vérifier que le backend est déployé
2. Vérifier que `CORS_ORIGIN` inclut `https://learning-english.iaproject.fr`
3. Vérifier que le backend répond sur `/health`

#### Erreur : "Network Error" ou "Failed to fetch"

**Cause** : Le backend n'est pas accessible

**Solution** :
1. Vérifier que `https://backend.learning-english.iaproject.fr/health` répond
2. Vérifier que le DNS du backend est configuré
3. Vérifier que le backend est démarré

---

## 📊 Checklist de validation

### Frontend (GitHub Pages)
- [ ] Workflow GitHub Actions réussi
- [ ] Branche `gh-pages` créée automatiquement
- [ ] `https://learning-english.iaproject.fr` accessible
- [ ] Le site charge correctement
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Les assets statiques (JS, CSS) se chargent
- [ ] Le fichier CNAME est présent

### Configuration API
- [ ] L'URL de l'API dans le build est correcte (`https://backend.learning-english.iaproject.fr`)
- [ ] Les appels API pointent vers le bon domaine
- [ ] Pas d'erreurs CORS (si le backend est déployé)

### DNS
- [ ] DNS résolu correctement (`nslookup learning-english.iaproject.fr`)
- [ ] HTTPS fonctionne (certificat SSL valide)
- [ ] Pas d'avertissements de sécurité dans le navigateur

---

## 🎯 Prochaines étapes

Une fois le frontend déployé et fonctionnel :

1. **Déployer le backend** (voir `BACKEND_DEPLOYMENT.md`)
   - Choisir Railway, Render ou Vercel
   - Configurer les variables d'environnement
   - Configurer le domaine `backend.learning-english.iaproject.fr`

2. **Mettre à jour le DNS OVH** pour le backend
   - Remplacer le CNAME actuel par celui fourni par le service d'hébergement

3. **Tester l'intégration complète**
   - Vérifier que le frontend peut communiquer avec le backend
   - Tester les fonctionnalités principales

---

## 📚 Ressources

- [GitHub Actions Logs](https://github.com/bigmoletos/learning_english/actions)
- [GitHub Pages Settings](https://github.com/bigmoletos/learning_english/settings/pages)
- [GitHub Secrets](https://github.com/bigmoletos/learning_english/settings/secrets/actions)

---

**Auteur** : Bigmoletos
**Date** : 2025-01-XX
**Version** : 1.0.0

