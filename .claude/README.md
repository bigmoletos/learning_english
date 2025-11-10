# 📚 Configuration Claude Code - AI English Trainer

## 📋 Structure

```
.claude/
├── commands/           # Slash commands personnalisées (16 fichiers)
│   ├── review-code.md
│   ├── fix-lint.md
│   ├── test-coverage.md
│   ├── build-check.md
│   ├── deploy-check.md
│   ├── debug-help.md
│   ├── api-doc.md
│   ├── refactor-suggest.md
│   ├── db-migrate.md
│   ├── perf-check.md
│   ├── security-audit.md
│   ├── gen-component.md
│   ├── git-clean.md
│   ├── lighthouse.md          # NEW
│   ├── test-gen.md            # NEW
│   └── changelog.md           # NEW
├── hooks/             # Automation hooks
│   ├── auto-lint-on-edit.sh
│   ├── pre-commit-check.sh
│   └── post-npm-install.sh
├── settings.local.json  # Configuration Claude Code
└── README.md          # Ce fichier
```

## 🎯 Commandes Disponibles (16 commandes)

### /review-code
Revue de code complète : qualité, performance, sécurité, tests, best practices.

### /fix-lint
Corrige automatiquement les erreurs ESLint et Prettier.

### /test-coverage
Analyse la couverture des tests et identifie les gaps critiques.

### /build-check
Vérifie le build et analyse la taille du bundle.

### /deploy-check
Checklist complète pré-déploiement (GO/NO-GO).

### /debug-help
Assistant de debugging interactif avec suggestions.

### /api-doc
Génère la documentation complète des API (OpenAPI/Swagger).

### /refactor-suggest
Suggestions de refactoring basées sur l'analyse du code.

### /db-migrate
Assistant pour créer et gérer les migrations de base de données.

### /perf-check
Analyse complète des performances (React, Bundle, API, DB).

### /security-audit
Audit de sécurité approfondi (OWASP Top 10, dépendances, code).

### /gen-component
Génère un composant React avec TypeScript et tests.

### /git-clean
Nettoyage et optimisation du dépôt Git.

### /lighthouse ⭐ NEW
Audit Lighthouse complet avec Core Web Vitals (LCP, FID, CLS).

### /test-gen ⭐ NEW
Génère tests automatiquement (Unit, E2E, Integration).

### /changelog ⭐ NEW
Génère CHANGELOG.md depuis l'historique Git.

## 🪝 Hooks Automatiques

### auto-lint-on-edit.sh
**Trigger:** Après Edit ou Write sur fichiers .ts, .tsx, .js, .jsx

**Actions:**
- ESLint avec --fix
- Prettier avec --write

**Bénéfice:** Code toujours formatté et sans erreurs de lint.

### pre-commit-check.sh
**Trigger:** Avant chaque commit Git (user-prompt-submit)

**Checks:**
- TypeScript compilation
- ESLint errors
- console.log dans le code de production
- Compte des TODO/FIXME

**Bénéfice:** Évite les commits avec des erreurs.

### post-npm-install.sh
**Trigger:** Après npm install

**Actions:**
- npm audit (vulnérabilités)
- npm outdated (packages obsolètes)
- Taille de node_modules

**Bénéfice:** Détection précoce des problèmes de sécurité.

## 📊 Status Line

La status line affiche en temps réel :

### Gauche (5 indicateurs):
- 🚀 Indicateur de projet
- 📁 Répertoire actuel (35 chars max)
- 🌿 Branche Git
- ± Statut Git (modifié, staged)
- @ Commit hash court

### Droite (8 indicateurs):
- ⬢ Version Node.js
- 📦 Version npm
- 📋 Version du projet (package.json)
- 🟢 DEV / ⚫ OFF - État du dev server
- 🔧 API - État du backend
- ⏱ **NEW** Session uptime (durée session)
- 🎯 **NEW** Token usage (placeholder)
- 🕐 Timestamp (HH:mm:ss)

**Total: 13 indicateurs**
**Refresh:** Toutes les 5 secondes

## 🔐 Permissions

### Autorisées Automatiquement :
- Tous les npm commands
- Git & GitHub CLI
- ESLint & Prettier
- Capacitor commands
- Gradle (Android)
- Fichiers temporaires
- Scripts du projet

### Bloquées (38 commandes dangereuses):
- **Système:** `rm -rf /`, `rm -rf ~`, `dd`, `mkfs`, fork bomb
- **Git:** `git push --force main/master`, `git branch -D main/master`, `git filter-branch`, `git rm -rf`, `git reflog delete`, etc.
- **Docker:** `docker system prune -a --force`, `docker rm/rmi -f $(all)`, etc.
- **npm:** `npm uninstall -g`, `npm cache clean --force`

## 🎨 Thème

Couleurs personnalisées :
- Primary: #007ACC (bleu VS Code)
- Success: #4CAF50 (vert)
- Warning: #FFC107 (jaune)
- Error: #F44336 (rouge)
- Info: #2196F3 (bleu clair)

## 🚀 MCP Servers Recommandés

### Pour ce Projet

#### 1. Filesystem MCP
Accès optimisé au système de fichiers.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/mnt/c/programmation/learning_english"]
    }
  }
}
```

#### 2. Git MCP
Opérations Git avancées.

```json
{
  "git": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-git"]
  }
}
```

#### 3. GitHub MCP
Intégration GitHub (issues, PR, etc.).

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

#### 4. Firebase MCP (Recommandé pour ce projet)
Gestion Firebase depuis Claude Code.

```json
{
  "firebase": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-firebase"],
    "env": {
      "FIREBASE_PROJECT_ID": "your-project-id"
    }
  }
}
```

#### 5. Sequelize MCP (Pour le Backend)
Opérations de base de données.

```json
{
  "sequelize": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequelize"],
    "env": {
      "DATABASE_URL": "sqlite://backend/database/development.sqlite"
    }
  }
}
```

### Installation des MCP Servers

Ajouter dans `~/.config/claude-code/config.json` (Linux/WSL) ou `%APPDATA%/claude-code/config.json` (Windows) :

```json
{
  "mcpServers": {
    "filesystem": { ... },
    "git": { ... },
    "github": { ... }
  }
}
```

## 📝 Agents Personnalisés

### Agent Code Quality
Agent dédié à la qualité du code.

**Utilisation via Task tool:**
```typescript
Task({
  subagent_type: "general-purpose",
  description: "Code quality analysis",
  prompt: "Analyse la qualité du code dans src/, détecte les code smells, anti-patterns, et suggère des améliorations."
})
```

### Agent Performance Audit
Audit de performance.

```typescript
Task({
  subagent_type: "Explore",
  description: "Performance issues",
  prompt: "Trouve tous les problèmes de performance potentiels : re-renders inutiles, calculs lourds, N+1 queries. Niveau: very thorough"
})
```

### Agent Security Scan
Scan de sécurité.

```typescript
Task({
  subagent_type: "general-purpose",
  description: "Security scan",
  prompt: "Scan de sécurité complet : XSS, SQL injection, secrets hardcodés, CORS misconfiguration, authentication issues."
})
```

## 💡 Tips & Tricks

### Économiser des Tokens

1. **Utiliser .claudeignore**
   Exclure node_modules, build, etc.

2. **Commandes ciblées**
   Utiliser les slash commands au lieu de prompts longs.

3. **Hooks automatiques**
   Évite de demander des lints/checks manuellement.

4. **MCP Servers**
   Opérations optimisées vs commandes Bash.

### Workflow Recommandé

#### Développement
```
1. Créer feature branch
2. /review-code (avant de commencer)
3. Développer avec auto-lint
4. /test-coverage
5. /build-check
6. /deploy-check
7. Create PR
```

#### Bug Fix
```
1. /debug-help
2. Reproduire le bug
3. Fixer
4. Tests
5. /review-code
6. Commit
```

#### Refactoring
```
1. /refactor-suggest
2. Planifier
3. Refactor step by step
4. /test-coverage
5. /build-check
```

## 🔧 Maintenance

### Mettre à jour les Hooks
```bash
cd .claude/hooks
chmod +x *.sh
# Tester individuellement
bash auto-lint-on-edit.sh src/App.tsx
```

### Mettre à jour les Commandes
Éditer les fichiers .md dans `.claude/commands/`

### Mettre à jour la Status Line
Éditer `.claude/settings.local.json` section `statusLine`

## 📞 Support

- Documentation Claude Code: https://docs.claude.com/en/docs/claude-code
- Issues: Utiliser `/help` dans Claude Code
- Memo complet: `memo_claude.md` à la racine du projet

## 🎯 État du Setup

### ✅ Implémenté (v2.0.0)
- ✅ **CI/CD avec GitHub Actions** (3 workflows)
- ✅ **Pre-commit hooks Git natifs** (.pre-commit-config.yaml)
- ✅ **Lighthouse CI** pour performance
- ✅ **Storybook** pour composants
- ✅ **E2E tests avec Playwright**
- ✅ **Docker** pour backend + frontend
- ✅ **Monitoring avec Sentry**

### ✅ Commandes Ajoutées
- ✅ **/lighthouse** - Audit Lighthouse ⭐ NEW
- ✅ **/security-audit** - Scan sécurité approfondi
- ✅ **/gen-component** - Générateur de composants
- ✅ **/test-gen** - Générateur de tests ⭐ NEW
- ✅ **/changelog** - Générer CHANGELOG.md ⭐ NEW

### 🎯 Prochaines Améliorations (Optionnel)
- [ ] MCP servers pré-configurés
- [ ] Dependabot auto-merge
- [ ] Performance budgets enforcement
- [ ] AI-powered code suggestions
- [ ] Auto-fix security vulnerabilities
