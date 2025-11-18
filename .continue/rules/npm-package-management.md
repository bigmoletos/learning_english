---
description: Rules for npm package management
alwaysApply: false
---

# Règles npm & Gestion des Packages

## Installation

### Dépendances de Production
```bash
# ✅ Bon - Version spécifique ou range
npm install express@^4.18.2
npm install react@^18.2.0

# ❌ Mauvais - Version latest ou *
npm install express@latest
npm install react@*
```

### Dépendances de Développement
- Séparer clairement `dependencies` et `devDependencies`
- Ne pas installer de packages de dev en production

### Scripts npm
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Sécurité

### Audit
- Exécuter `npm audit` régulièrement
- Corriger les vulnérabilités critiques et high
- Documenter les vulnérabilités modérates dans SECURITY.md

### Lock Files
- Toujours committer `package-lock.json`
- Ne jamais modifier manuellement `package-lock.json`
- Utiliser `npm ci` en CI/CD pour des builds reproductibles

## Versions

### Semantic Versioning
- `^` (caret) : Mises à jour mineures et patches autorisées
- `~` (tilde) : Seulement les patches autorisées
- Version exacte : Pour les dépendances critiques

### Mises à Jour
- Tester après chaque mise à jour majeure
- Lire les changelogs avant de mettre à jour
- Mettre à jour une dépendance à la fois pour faciliter le debugging

## Scripts d'Installation

### Pre/Post Scripts
```json
{
  "scripts": {
    "postinstall": "npm install sequelize winston || true",
    "pretest": "npm install sequelize winston || true"
  }
}
```

### Installation Backend
- Toujours installer `sequelize` et `winston` pour le backend
- Vérifier que les dépendances sont installées avant les tests

## Best Practices

1. **Ne pas committer `node_modules`**
   - Toujours dans `.gitignore`
   - Utiliser `npm install` pour restaurer

2. **Utiliser `npm ci` en production**
   - Plus rapide et fiable que `npm install`
   - Installe exactement les versions du lock file

3. **Vérifier les dépendances**
   - Utiliser `npm outdated` pour voir les mises à jour disponibles
   - Utiliser `npm ls` pour vérifier l'arbre de dépendances

4. **Nettoyer régulièrement**
   - `npm prune` pour supprimer les packages non utilisés
   - `npm cache clean --force` si nécessaire

