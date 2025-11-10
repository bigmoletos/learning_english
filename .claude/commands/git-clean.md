Git Repository Cleanup

Nettoie le dépôt Git et optimise l'historique.

**Actions possibles:**

## 1. Informations
```bash
# Taille du repo
du -sh .git/

# Fichiers les plus gros dans l'historique
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | sed -n 's/^blob //p' \
  | sort --numeric-sort --key=2 \
  | tail -n 10

# Branches merged
git branch --merged main
git branch -r --merged origin/main
```

## 2. Nettoyage Standard (Safe)
```bash
# Supprimer branches merged locales
git branch --merged main | grep -v "\* main" | xargs -n 1 git branch -d

# Nettoyer remote tracking branches
git remote prune origin

# Git garbage collection
git gc --aggressive --prune=now

# Supprimer fichiers non trackés
git clean -fd

# Supprimer .gitignore files
git clean -fdX
```

## 3. Nettoyage Avancé (Attention !)
```bash
# Supprimer un fichier de tout l'historique
git filter-branch --tree-filter 'rm -f path/to/file' HEAD

# Ou avec BFG (plus rapide)
java -jar bfg.jar --delete-files filename.ext

# Supprimer dossier de l'historique
git filter-branch --tree-filter 'rm -rf path/to/dir' HEAD

# Après filter-branch
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## 4. Optimisation
```bash
# Repack pour optimiser
git repack -a -d --depth=250 --window=250

# Vérifier intégrité
git fsck --full

# Compresser
git gc --aggressive
```

## 5. Branches Cleanup
```bash
# Lister branches stale (>3 mois)
git for-each-ref --sort=committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'

# Supprimer branches remote merged
git branch -r --merged origin/main | grep -v "main" | sed 's/origin\///' | xargs -n 1 git push --delete origin
```

**⚠️ WARNINGS:**
- Backup avant nettoyage avancé !
- `filter-branch` réécrit l'historique → force push nécessaire
- Coordonner avec l'équipe si repo partagé
- Vérifier après chaque étape

**Checklist avant nettoyage:**
- [ ] Backup du repo (`git clone --mirror`)
- [ ] Coordonné avec l'équipe
- [ ] Pas de branches en cours non pushées
- [ ] Comprendre les conséquences

**Process recommandé:**
1. Analyse (taille, gros fichiers)
2. Nettoyage standard (safe)
3. Décision sur nettoyage avancé
4. Si avancé: backup + filter-branch + gc
5. Vérification (git fsck)
6. Force push si nécessaire (coordonné)

**Résultat attendu:**
- Repo plus léger
- Historique propre
- Pas de branches mortes
- Meilleure performance
