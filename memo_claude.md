# 📘 Mémo Complet Claude Code

## 🎯 Commandes de Base

### Navigation & Exploration
```bash
# Lister les fichiers d'un répertoire
ls -la

# Trouver des fichiers par pattern
find . -name "*.ts"

# Rechercher du code (utiliser Grep tool de préférence)
grep -r "pattern" src/

# Explorer la structure du projet
tree -L 2  # ou utiliser Agent Explore
```

### Gestion du Projet

#### NPM & Dépendances
```bash
# Installer les dépendances
npm install
npm install --legacy-peer-deps  # si conflits

# Ajouter une dépendance
npm install package-name
npm install -D package-name  # dev dependency

# Mettre à jour les packages
npm update
npm outdated  # voir les packages obsolètes

# Audit de sécurité
npm audit
npm audit fix
npm audit fix --force
```

#### Scripts Projet
```bash
# Frontend
npm start                    # Démarrer le dev server
npm run build               # Build de production
npm test                    # Lancer les tests
npm run analyze             # Analyser le bundle

# Backend (dans ./backend)
npm run dev                 # Nodemon en mode dev
npm start                   # Production
npm run migrate            # Migrations DB
npm run seed               # Seed la DB
npm test                   # Tests avec Jest
npm run lint               # ESLint

# Capacitor (Android)
npm run cap:sync           # Build + sync Android
npm run cap:open           # Ouvrir Android Studio
npm run cap:run            # Sync + open
```

### Git & Versioning

#### Commandes Essentielles
```bash
# Status et info
git status
git log --oneline -10
git diff
git diff --staged

# Branches
git branch                          # lister
git branch -a                       # toutes les branches
git checkout -b feature/ma-feature  # créer et switcher
git checkout main                   # switcher
git branch -d feature/old          # supprimer

# Staging & Commit
git add .
git add -p                         # ajouter par chunks
git commit -m "feat: message"
git commit --amend                 # modifier le dernier commit

# Push & Pull
git pull origin main
git push origin feature/ma-feature
git push -u origin feature/nouvelle  # première fois

# Stash (sauvegarder temporairement)
git stash
git stash list
git stash pop
git stash apply stash@{0}

# Reset & Revert
git reset HEAD~1                   # annuler dernier commit (garder les changements)
git reset --hard HEAD~1            # annuler + supprimer les changements
git revert <commit-hash>           # créer un commit inverse
```

#### Pull Requests
```bash
# Créer une PR avec gh CLI
gh pr create --title "Titre" --body "Description"
gh pr create --fill                # auto depuis commits

# Voir les PR
gh pr list
gh pr view 123
gh pr status

# Review
gh pr review 123 --approve
gh pr review 123 --comment -b "Commentaire"

# Merge
gh pr merge 123
gh pr merge 123 --squash
gh pr merge 123 --rebase
```

## 🛠️ Tools Claude Code

### Read - Lire des Fichiers
```typescript
// Lire un fichier entier
Read({ file_path: "/chemin/absolu/fichier.ts" })

// Lire avec offset et limit (gros fichiers)
Read({
  file_path: "/chemin/fichier.ts",
  offset: 100,    // ligne de départ
  limit: 50       // nombre de lignes
})

// Peut lire: code, images (PNG/JPG), PDF, Jupyter notebooks
```

### Edit - Modifier des Fichiers
```typescript
// Remplacement simple
Edit({
  file_path: "/chemin/fichier.ts",
  old_string: "const old = 'value'",
  new_string: "const new = 'newValue'"
})

// Remplacement global (toutes les occurrences)
Edit({
  file_path: "/chemin/fichier.ts",
  old_string: "oldName",
  new_string: "newName",
  replace_all: true
})

// IMPORTANT: Toujours utiliser Read avant Edit!
```

### Write - Créer des Fichiers
```typescript
// Créer un nouveau fichier
Write({
  file_path: "/chemin/nouveau.ts",
  content: "// Contenu du fichier"
})

// ATTENTION: Écrase le fichier s'il existe!
// Toujours préférer Edit pour fichiers existants
```

### Glob - Recherche de Fichiers par Pattern
```typescript
// Trouver tous les fichiers TypeScript
Glob({ pattern: "**/*.ts" })

// Dans un répertoire spécifique
Glob({
  pattern: "**/*.tsx",
  path: "/mnt/c/programmation/learning_english/src"
})

// Patterns multiples
Glob({ pattern: "**/*.{ts,tsx,js,jsx}" })

// Exemples de patterns:
// **/*.ts           - tous les .ts récursivement
// src/**/*.tsx      - tous les .tsx dans src/
// **/*test*.ts      - fichiers avec "test" dans le nom
// src/components/*  - fichiers directs (pas récursif)
```

### Grep - Recherche de Contenu
```typescript
// Recherche simple
Grep({ pattern: "functionName" })

// Case insensitive
Grep({
  pattern: "error",
  "-i": true
})

// Filtrer par type de fichier
Grep({
  pattern: "import.*React",
  type: "tsx"
})

// Avec glob pattern
Grep({
  pattern: "TODO",
  glob: "src/**/*.ts"
})

// Afficher le contenu avec contexte
Grep({
  pattern: "error",
  output_mode: "content",
  "-n": true,    // numéros de ligne
  "-C": 3        // 3 lignes avant/après
})

// Modes de sortie:
// - "files_with_matches" (défaut) - juste les fichiers
// - "content" - afficher les lignes
// - "count" - compter les matches
```

### Bash - Exécuter des Commandes
```typescript
// Commande simple
Bash({
  command: "ls -la",
  description: "Lister les fichiers"
})

// Avec timeout (max 10 minutes)
Bash({
  command: "npm run build",
  description: "Build du projet",
  timeout: 300000  // 5 minutes en ms
})

// En arrière-plan
Bash({
  command: "npm start",
  description: "Démarrer le serveur",
  run_in_background: true
})

// Commandes chaînées (séquentiel)
Bash({
  command: "cd backend && npm install && npm start",
  description: "Setup et démarrage backend"
})

// Parallèle (commandes indépendantes)
// Faire 2 appels Bash dans le même message
```

### Task - Lancer des Agents Spécialisés
```typescript
// Agent Explore - Explorer le codebase
Task({
  subagent_type: "Explore",
  description: "Trouver les routes API",
  prompt: "Trouve tous les endpoints API et explique leur structure. Niveau: thorough"
})

// Agent General-Purpose - Tâches complexes
Task({
  subagent_type: "general-purpose",
  description: "Recherche de bugs",
  prompt: "Recherche tous les console.log et console.error dans le projet et liste-les avec leur contexte"
})

// IMPORTANT:
// - Utiliser Explore pour: patterns de fichiers, mots-clés, questions sur le code
// - Spécifier le niveau: "quick", "medium", "very thorough"
```

### WebSearch - Rechercher sur le Web
```typescript
// Recherche simple
WebSearch({ query: "React hooks best practices 2025" })

// Filtrer par domaines
WebSearch({
  query: "TypeScript generics",
  allowed_domains: ["typescriptlang.org", "stackoverflow.com"]
})

// Bloquer des domaines
WebSearch({
  query: "Material-UI tutorial",
  blocked_domains: ["w3schools.com"]
})
```

### WebFetch - Récupérer le Contenu d'une URL
```typescript
// Fetch et analyser une page
WebFetch({
  url: "https://docs.example.com/api",
  prompt: "Extrais les endpoints API et leurs paramètres"
})

// Pour la doc Claude Code
WebFetch({
  url: "https://docs.claude.com/en/docs/claude-code/hooks",
  prompt: "Explique comment configurer les hooks"
})
```

### TodoWrite - Gestion de Tâches
```typescript
// Créer une todo list
TodoWrite({
  todos: [
    {
      content: "Fixer le bug d'authentification",
      activeForm: "Fixing authentication bug",
      status: "pending"
    },
    {
      content: "Ajouter les tests unitaires",
      activeForm: "Adding unit tests",
      status: "in_progress"
    },
    {
      content: "Déployer en production",
      activeForm: "Deploying to production",
      status: "completed"
    }
  ]
})

// Status possibles: pending, in_progress, completed
// TOUJOURS avoir exactement 1 tâche en in_progress
```

### AskUserQuestion - Poser des Questions
```typescript
// Question simple
AskUserQuestion({
  questions: [{
    question: "Quelle librairie de state management veux-tu utiliser ?",
    header: "State Mgmt",
    multiSelect: false,
    options: [
      { label: "Redux", description: "State management robuste avec DevTools" },
      { label: "Zustand", description: "Léger et simple, hooks-based" },
      { label: "Context API", description: "Solution native React" }
    ]
  }]
})

// Questions multiples
AskUserQuestion({
  questions: [
    {
      question: "Quel framework CSS ?",
      header: "CSS",
      multiSelect: false,
      options: [...]
    },
    {
      question: "Quelles features activer ?",
      header: "Features",
      multiSelect: true,  // sélection multiple
      options: [...]
    }
  ]
})
```

## 🎨 Slash Commands Personnalisées

### Créer une Commande
```bash
# Dans .claude/commands/ma-commande.md
Titre de ma commande

Description de ce que la commande fait.
Peut contenir des instructions complexes.

# Utilisation
/ma-commande
/ma-commande arg1 arg2
```

### Exemples de Commandes Utiles

#### /review-code
```markdown
Code Review

Analyse le code récent et vérifie:
- Qualité et lisibilité
- Respect des patterns du projet
- Performance
- Sécurité
- Tests
```

#### /fix-lint
```markdown
Fix ESLint Errors

1. Exécute ESLint sur le projet
2. Analyse les erreurs
3. Corrige automatiquement ce qui est possible
4. Liste les erreurs manuelles restantes
```

#### /test-coverage
```markdown
Test Coverage Report

1. Lance les tests avec coverage
2. Analyse les fichiers sans tests
3. Suggère des tests à ajouter
```

## 🪝 Hooks (Automatisation)

### Types de Hooks Disponibles

```json
{
  "hooks": {
    "user-prompt-submit": ["echo 'Hook avant requête'"],
    "tool-use": {
      "Edit": ["npm run lint -- {{file_path}}"],
      "Write": ["git add {{file_path}}"]
    },
    "tool-result": {
      "Bash": ["echo 'Commande exécutée: {{command}}'"]
    }
  }
}
```

### Variables Disponibles dans les Hooks
- `{{file_path}}` - chemin du fichier
- `{{command}}` - commande bash
- `{{pattern}}` - pattern de recherche
- `{{url}}` - URL pour WebFetch
- Et d'autres selon le tool

## 📊 Status Line (Barre de Statut)

### Configuration dans settings.local.json
```json
{
  "statusLine": {
    "left": [
      { "type": "git_branch", "icon": "", "color": "blue" },
      { "type": "git_status", "icon": "±", "color": "yellow" },
      { "type": "working_directory", "icon": "📁", "maxLength": 40 }
    ],
    "right": [
      { "type": "timestamp", "icon": "🕐", "format": "HH:mm:ss" },
      { "type": "custom", "command": "node -v", "icon": "⬢", "color": "green" }
    ]
  }
}
```

### Types Disponibles
- `git_branch` - branche Git
- `git_status` - statut Git (modifié, staged, etc.)
- `working_directory` - répertoire actuel
- `timestamp` - heure actuelle
- `custom` - commande personnalisée

## 🔧 MCP (Model Context Protocol) Serveurs

### Serveurs Utiles pour Développement

#### Filesystem MCP
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/chemin/projet"]
    }
  }
}
```

#### Git MCP
```json
{
  "git": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-git"]
  }
}
```

#### Brave Search MCP
```json
{
  "brave-search": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "your_api_key"
    }
  }
}
```

#### GitHub MCP
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_TOKEN": "your_token"
    }
  }
}
```

## 💡 Best Practices & Astuces

### Économiser des Tokens

1. **Utiliser les bons outils**
   - Grep au lieu de Read pour chercher
   - Glob au lieu de Bash find
   - Task/Explore pour exploration large

2. **Lire de manière ciblée**
   - Utiliser offset/limit sur Read pour gros fichiers
   - Grep avec output_mode: "files_with_matches" d'abord
   - Puis Read seulement les fichiers pertinents

3. **Paralléliser**
   - Plusieurs Read en parallèle
   - Plusieurs Bash indépendants en parallèle
   - Plusieurs Task en parallèle

### Workflow Efficace

#### Nouveau Feature
```
1. /plan-feature - Planifier (si commande existe)
2. Task (Explore) - Explorer code existant
3. TodoWrite - Créer la liste de tâches
4. Implémenter - Étape par étape
5. Tests - Ajouter les tests
6. /review-code - Review finale
7. Git commit
8. gh pr create
```

#### Bug Fix
```
1. Grep - Chercher le problème
2. Read - Lire les fichiers concernés
3. TodoWrite - Planifier la correction
4. Edit - Corriger
5. Bash - Tester
6. Git commit avec "fix:"
```

#### Refactoring
```
1. Task (Explore) - Comprendre le code
2. TodoWrite - Planifier le refactoring
3. Edit avec replace_all - Renommer
4. Tests - Vérifier que tout marche
5. Git commit avec "refactor:"
```

### Conventions de Commit

```bash
feat: Nouvelle fonctionnalité
fix: Correction de bug
refactor: Refactoring sans changement de fonctionnalité
docs: Documentation
style: Formatage, lint
test: Ajout/modification de tests
chore: Tâches de maintenance
perf: Amélioration de performance
ci: CI/CD
build: Build system
```

### Debugging

#### Logs & Monitoring
```bash
# Frontend (browser console)
# Chercher les console.log
Grep({ pattern: "console\\.(log|error|warn)", type: "tsx" })

# Backend logs
tail -f backend/logs/app.log

# Process monitoring
ps aux | grep node
lsof -i :3000  # port en écoute
netstat -tulpn | grep :3000
```

#### Tests
```bash
# Frontend
npm test                           # tous les tests
npm test -- --coverage            # avec coverage
npm test -- --watch               # mode watch
npm test -- MyComponent           # test spécifique

# Backend
cd backend
npm test                          # tous les tests
npm test -- --verbose             # verbose
npm test -- routes/api.test.js    # test spécifique
```

## 🚀 CI/CD & Déploiement

### GitHub Actions Workflow Basique

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Commandes Déploiement

```bash
# Build de production
npm run build

# Vérifier le build
npm run analyze

# Android APK
npm run cap:sync
cd android && ./gradlew assembleRelease

# Variables d'environnement
cp .env.example .env
# Éditer .env avec les vraies valeurs
```

## 📚 Ressources

### Documentation Claude Code
- Hooks: https://docs.claude.com/en/docs/claude-code/hooks
- Commands: https://docs.claude.com/en/docs/claude-code/commands
- MCP: https://docs.claude.com/en/docs/claude-code/mcp
- Settings: https://docs.claude.com/en/docs/claude-code/settings

### Outils
- gh CLI: https://cli.github.com/
- MCP Servers: https://github.com/modelcontextprotocol/servers

---

**Raccourcis Rapides**

```bash
# Status rapide
git status && npm test

# Full check
npm run lint && npm test && npm run build

# Clean install
rm -rf node_modules package-lock.json && npm install

# Kill process sur port
lsof -ti:3000 | xargs kill

# Chercher TODO
grep -r "TODO\|FIXME" src/
```
