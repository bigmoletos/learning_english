# 🚀 Quick Start - Claude Code Configuration

## ⚡ TL;DR

```bash
# Dans le terminal Claude Code

# 1. Review du code
/review-code

# 2. Fixer les erreurs de lint
/fix-lint

# 3. Vérifier les tests
/test-coverage

# 4. Check avant déploiement
/deploy-check

# 5. Performance & Lighthouse
/lighthouse

# 6. Aide au debugging
/debug-help
```

## 🎯 Commandes les Plus Utiles (16 commandes)

| Commande | Usage | Quand l'utiliser |
|----------|-------|------------------|
| `/review-code` | Revue complète | Avant PR, après dev |
| `/fix-lint` | Auto-fix ESLint | Erreurs de lint |
| `/test-coverage` | Analyse tests | Manque de tests |
| `/build-check` | Bundle analysis | Problèmes de build |
| `/deploy-check` | Pre-deploy | Avant déploiement |
| `/debug-help` | Assistant debug | Bugs complexes |
| `/api-doc` | Doc API | Documenter l'API |
| `/refactor-suggest` | Suggestions | Code smell |
| `/db-migrate` | Migrations DB | Changements DB |
| `/perf-check` | Performance | Optimisation |
| `/security-audit` | Sécurité | Audit complet |
| `/gen-component` | Générer composant | Nouveau composant |
| `/git-clean` | Nettoyage Git | Optimiser repo |
| `/lighthouse` | **NEW** Audit Lighthouse | Performance Web |
| `/test-gen` | **NEW** Générer tests | Ajouter tests |
| `/changelog` | **NEW** CHANGELOG.md | Release notes |

## 🪝 Hooks Actifs

Les hooks s'exécutent automatiquement :

### ✅ Auto-Lint
**Quand :** Après Edit/Write sur .ts, .tsx, .js, .jsx
**Action :** ESLint --fix + Prettier

### ✅ Pre-Commit Check
**Quand :** Avant commit Git
**Action :** TypeScript check + ESLint + console.log detection

### ✅ Post-Install
**Quand :** Après npm install
**Action :** Security audit + outdated packages

## 📊 Status Line (13 indicateurs)

Affiche en temps réel :

```
🚀 📁 learning_english │ 🌿 feature/my-feature │ ± M │ @ a1b2c3 │ ⬢ 18.17.0 │ 📦 9.6.7 │ 📋 1.0.0 │ 🟢 DEV │ 🔧 API │ ⏱ 2:34:12 │ 🎯 Tokens:N/A │ 🕐 14:32:15
```

**Gauche (5):**
- 🚀 Indicateur projet
- 📁 Répertoire (max 35 chars)
- 🌿 Branche Git
- ± Statut Git (M=modifié)
- @ Commit hash court

**Droite (8):**
- ⬢ Node.js version
- 📦 npm version
- 📋 App version
- 🟢/⚫ Dev server (ON/OFF)
- 🔧 Backend API status
- ⏱ **NEW** Session uptime
- 🎯 **NEW** Token usage (N/A pour l'instant)
- 🕐 Timestamp (HH:mm:ss)

**Refresh:** 5 secondes

## 🎨 Workflows Recommandés

### 🆕 Nouvelle Feature

```bash
# 1. Créer la branche
git checkout -b feature/ma-feature

# 2. Review du code existant
/review-code src/components/

# 3. Développer (auto-lint actif)
# ... coder ...

# 4. Tests
npm test
/test-coverage

# 5. Check final
/build-check
/deploy-check

# 6. Commit (pre-commit hook actif)
git add .
git commit -m "feat: ma nouvelle feature"

# 7. Push & PR
git push -u origin feature/ma-feature
gh pr create --fill
```

### 🐛 Bug Fix

```bash
# 1. Comprendre le bug
/debug-help

# 2. Trouver le code concerné
# Use Grep or Explore agent

# 3. Fixer
# Edit files

# 4. Tester
npm test

# 5. Review
/review-code src/path/to/fixed/file.tsx

# 6. Commit
git commit -m "fix: description du bug"
```

### 🔨 Refactoring

```bash
# 1. Analyser le code
/refactor-suggest

# 2. Planifier le refactoring
# Utiliser TodoWrite

# 3. Refactoriser progressivement
# Edit files

# 4. Tests à chaque étape
npm test

# 5. Vérifier la qualité
/review-code

# 6. Check final
/build-check
npm test -- --coverage
```

## 💡 Tips pour Économiser des Tokens

### ✅ À Faire

1. **Utiliser les commandes slash** au lieu de prompts longs
   ```
   ✅ /review-code
   ❌ "Peux-tu faire une revue de code complète en vérifiant..."
   ```

2. **Utiliser Grep avant Read**
   ```
   ✅ Grep pour trouver → Read fichiers pertinents
   ❌ Read tous les fichiers
   ```

3. **Spécifier les fichiers**
   ```
   ✅ /review-code src/components/MyComponent.tsx
   ❌ /review-code (tout le projet)
   ```

4. **Paralléliser**
   ```
   ✅ Plusieurs Read en un message
   ❌ Read un par un
   ```

### ❌ À Éviter

1. ❌ Lire node_modules (utiliser .claudeignore)
2. ❌ Lire les builds (déjà dans .claudeignore)
3. ❌ Répéter les mêmes questions
4. ❌ Demander des lints manuels (hooks automatiques)

## 🔧 Troubleshooting

### Hooks ne s'exécutent pas

```bash
# Vérifier les permissions
chmod +x .claude/hooks/*.sh

# Tester manuellement
bash .claude/hooks/auto-lint-on-edit.sh src/App.tsx
```

### Status Line ne s'affiche pas

Vérifier dans `.claude/settings.local.json` :
```json
{
  "statusLine": {
    "enabled": true,
    ...
  }
}
```

### Commande slash non reconnue

```bash
# Lister les commandes disponibles
ls -la .claude/commands/

# Vérifier le format du fichier .md
cat .claude/commands/nom-commande.md
```

## 📚 Documentation Complète

- 📘 **Mémo complet :** `memo_claude.md` (toutes les commandes)
- 📁 **Configuration :** `.claude/README.md` (détails de config)
- 🌐 **Docs officielles :** https://docs.claude.com/en/docs/claude-code

## 🎯 Prochaines Étapes

1. Tester les commandes slash
2. Vérifier les hooks fonctionnent
3. Configurer les MCP servers (optionnel)
4. Lire `memo_claude.md` pour les détails
5. Personnaliser selon tes besoins

## 💬 Exemples Concrets

### Scénario 1 : Préparer une PR

```
User: "Je veux créer une PR pour ma feature"
Claude: /review-code
Claude: /test-coverage
Claude: /build-check
Claude: git commit -m "feat: nouvelle feature"
Claude: gh pr create --fill
```

### Scénario 2 : Debugging

```
User: "Mon composant React re-render trop souvent"
Claude: /debug-help
Claude: (Utilise React DevTools, Profiler)
Claude: Suggère useMemo, React.memo
Claude: /refactor-suggest --file src/components/MyComponent.tsx
```

### Scénario 3 : Avant Déploiement

```
User: "On déploie en prod demain"
Claude: /deploy-check
Claude: (Exécute toute la checklist)
Claude: Rapport GO/NO-GO avec les points bloquants
```

---

**Bonne utilisation ! 🚀**
