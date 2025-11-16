# Correction du problème GitHub Pages

> Le site affiche le README.md au lieu de l'application React

---

## 🔍 Diagnostic

Le problème vient probablement de la configuration GitHub Pages qui sert depuis la branche `main` au lieu de `gh-pages`.

---

## ✅ Solution

### Étape 1 : Vérifier le workflow GitHub Actions

1. Aller sur : `https://github.com/bigmoletos/learning_english/actions`
2. Vérifier que le workflow **"CI/CD Pipeline"** s'est bien exécuté après le dernier push
3. Vérifier que le job **"🚀 Deploy to GitHub Pages"** a réussi
4. Si le workflow a échoué, vérifier les logs pour identifier l'erreur

### Étape 2 : Vérifier la branche gh-pages

1. Aller sur : `https://github.com/bigmoletos/learning_english/branches`
2. Vérifier si la branche `gh-pages` existe
3. Si elle n'existe pas, le workflow n'a pas encore été exécuté ou a échoué

### Étape 3 : Configurer GitHub Pages correctement

1. Aller sur : `https://github.com/bigmoletos/learning_english/settings/pages`
2. Vérifier la configuration :
   - **Source** : `Deploy from a branch`
   - **Branch** : `gh-pages` (pas `main` !)
   - **Folder** : `/ (root)`
3. Si la branche est sur `main`, changer pour `gh-pages`
4. Cliquer sur **Save**

### Étape 4 : Si le workflow n'a pas été exécuté

Si le workflow n'a pas été exécuté automatiquement :

1. Aller sur : `https://github.com/bigmoletos/learning_english/actions`
2. Sélectionner le workflow **"CI/CD Pipeline"**
3. Cliquer sur **"Run workflow"**
4. Sélectionner la branche `main`
5. Cliquer sur **"Run workflow"**

### Étape 5 : Attendre le déploiement

1. Attendre que le workflow se termine (5-10 minutes)
2. Attendre quelques minutes supplémentaires pour la propagation GitHub Pages
3. Vérifier que `https://learning-english.iaproject.fr` affiche maintenant l'application React

---

## 🐛 Si le workflow échoue

### Erreur : "Permission denied" ou "403"

**Solution** :
1. Vérifier que GitHub Pages est activé dans Settings → Pages
2. Vérifier que le workflow a la permission `contents: write`
3. Vérifier que le token `GITHUB_TOKEN` est disponible (automatique)

### Erreur : "Build failed"

**Solution** :
1. Vérifier les logs du job `🏗️ Build Frontend`
2. Vérifier que toutes les variables d'environnement sont définies
3. Vérifier qu'il n'y a pas d'erreurs TypeScript ou de dépendances manquantes

### Erreur : "No such file or directory: build"

**Solution** :
1. Vérifier que le build a réussi avant le déploiement
2. Vérifier que le dossier `build/` existe après le build
3. Vérifier que le chemin `publish_dir: ./build` est correct

---

## 🔄 Solution alternative : Déployer manuellement

Si le workflow ne fonctionne pas, vous pouvez déployer manuellement :

```bash
# 1. Build localement
npm run build

# 2. Créer/checkout la branche gh-pages
git checkout --orphan gh-pages
git rm -rf .

# 3. Copier le contenu du build
cp -r build/* .

# 4. Créer le fichier CNAME
echo "learning-english.iaproject.fr" > CNAME

# 5. Commit et push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# 6. Revenir sur main
git checkout main
```

**⚠️ Attention** : Cette méthode remplace complètement la branche `gh-pages`. Utilisez-la seulement si le workflow ne fonctionne pas.

---

## ✅ Vérification finale

Une fois corrigé, vérifier que :

1. ✅ La branche `gh-pages` existe et contient les fichiers du build
2. ✅ GitHub Pages est configuré pour servir depuis `gh-pages`
3. ✅ `https://learning-english.iaproject.fr` affiche l'application React (pas le README)
4. ✅ Les fichiers JavaScript et CSS se chargent correctement
5. ✅ Le fichier `CNAME` est présent dans `gh-pages`

---

## 📚 Ressources

- [GitHub Pages Settings](https://github.com/bigmoletos/learning_english/settings/pages)
- [GitHub Actions](https://github.com/bigmoletos/learning_english/actions)
- [Branches](https://github.com/bigmoletos/learning_english/branches)

---

**Auteur** : Bigmoletos  
**Date** : 2025-01-XX  
**Version** : 1.0.0

