# Configuration des secrets GitHub

> Guide pour configurer les secrets GitHub nécessaires au déploiement automatique

---

## 🔐 Secrets nécessaires

Pour que le workflow CI/CD fonctionne correctement, vous devez configurer les secrets suivants dans GitHub :

### Accès aux secrets

1. Aller sur votre dépôt GitHub : `https://github.com/bigmoletos/learning_english`
2. Cliquer sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquer sur **"New repository secret"**

---

## 📋 Liste des secrets

### 1. REACT_APP_API_URL (Optionnel mais recommandé)

**Nom** : `REACT_APP_API_URL`
**Valeur** : `https://backend.learning-english.iaproject.fr`
**Description** : URL de l'API backend en production

**Note** : Si ce secret n'est pas défini, la valeur par défaut `https://backend.learning-english.iaproject.fr` sera utilisée.

---

### 2. Variables Firebase (Requis si vous utilisez Firebase)

#### REACT_APP_FIREBASE_API_KEY

**Nom** : `REACT_APP_FIREBASE_API_KEY`
**Valeur** : Votre clé API Firebase
**Où trouver** : Firebase Console → Project Settings → General → Your apps → Web app → API Key

#### REACT_APP_FIREBASE_AUTH_DOMAIN

**Nom** : `REACT_APP_FIREBASE_AUTH_DOMAIN`
**Valeur** : `votre-projet.firebaseapp.com`
**Où trouver** : Firebase Console → Project Settings → General → Your apps → Web app → Auth Domain

#### REACT_APP_FIREBASE_PROJECT_ID

**Nom** : `REACT_APP_FIREBASE_PROJECT_ID`
**Valeur** : Votre Project ID Firebase
**Où trouver** : Firebase Console → Project Settings → General → Project ID

#### REACT_APP_FIREBASE_STORAGE_BUCKET

**Nom** : `REACT_APP_FIREBASE_STORAGE_BUCKET`
**Valeur** : `votre-projet.appspot.com`
**Où trouver** : Firebase Console → Project Settings → General → Your apps → Web app → Storage Bucket

#### REACT_APP_FIREBASE_MESSAGING_SENDER_ID

**Nom** : `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
**Valeur** : Votre Sender ID
**Où trouver** : Firebase Console → Project Settings → Cloud Messaging → Sender ID

#### REACT_APP_FIREBASE_APP_ID

**Nom** : `REACT_APP_FIREBASE_APP_ID`
**Valeur** : Votre App ID
**Où trouver** : Firebase Console → Project Settings → General → Your apps → Web app → App ID

#### REACT_APP_FIREBASE_MEASUREMENT_ID (Optionnel)

**Nom** : `REACT_APP_FIREBASE_MEASUREMENT_ID`
**Valeur** : `G-XXXXXXXXXX`
**Où trouver** : Firebase Console → Project Settings → General → Your apps → Web app → Measurement ID

---

## ✅ Checklist de configuration

### Secrets GitHub
- [ ] `REACT_APP_API_URL` configuré (ou valeur par défaut utilisée)
- [ ] `REACT_APP_FIREBASE_API_KEY` configuré
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN` configuré
- [ ] `REACT_APP_FIREBASE_PROJECT_ID` configuré
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET` configuré
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` configuré
- [ ] `REACT_APP_FIREBASE_APP_ID` configuré
- [ ] `REACT_APP_FIREBASE_MEASUREMENT_ID` configuré (optionnel)

### Configuration GitHub Pages
- [ ] GitHub Pages activé dans Settings → Pages
- [ ] Source : `Deploy from a branch`
- [ ] Branch : `gh-pages` (créé automatiquement par l'action)
- [ ] Folder : `/ (root)`

### DNS OVH
- [ ] CNAME `learning-english.iaproject.fr` → `bigmoletos.github.io`
- [ ] Propagation DNS vérifiée (peut prendre jusqu'à 48h)

---

## 🧪 Test du déploiement

### 1. Vérifier que les secrets sont configurés

```bash
# Dans GitHub Actions, vérifier que les variables d'environnement sont disponibles
# Le workflow affichera les variables (masquées) dans les logs
```

### 2. Déclencher un déploiement

```bash
# Push sur la branche main
git push origin main

# OU utiliser workflow_dispatch depuis GitHub Actions
```

### 3. Vérifier le déploiement

1. Aller sur **Actions** dans GitHub
2. Vérifier que le workflow `CI/CD Pipeline` s'exécute
3. Vérifier que le job `🚀 Deploy to GitHub Pages` réussit
4. Attendre quelques minutes pour la propagation
5. Vérifier que `https://learning-english.iaproject.fr` fonctionne

---

## 🆘 Dépannage

### Les secrets ne sont pas disponibles dans le workflow

1. Vérifier que les secrets sont bien définis dans **Settings** → **Secrets and variables** → **Actions**
2. Vérifier que le nom du secret correspond exactement (sensible à la casse)
3. Vérifier que le workflow utilise `${{ secrets.NOM_DU_SECRET }}`

### Le build échoue avec "REACT_APP_* is not defined"

1. Vérifier que tous les secrets Firebase sont configurés
2. Vérifier que les noms des secrets correspondent exactement
3. Vérifier les logs du workflow pour voir quels secrets manquent

### GitHub Pages ne se met pas à jour

1. Vérifier que le workflow a réussi
2. Vérifier que la branche `gh-pages` existe et contient les fichiers
3. Attendre quelques minutes pour la propagation
4. Vider le cache du navigateur (Ctrl+Shift+R)

---

## 📚 Ressources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

**Auteur** : Bigmoletos
**Date** : 2025-01-XX
**Version** : 1.0.0

