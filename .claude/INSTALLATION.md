# 🔧 Installation & Configuration

## ✅ Étapes Obligatoires

### 1. Rendre les Hooks Exécutables

```bash
cd /mnt/c/programmation/learning_english
chmod +x .claude/hooks/*.sh
```

**Vérification:**
```bash
ls -la .claude/hooks/
# Tous les .sh doivent avoir le 'x' dans les permissions
```

### 2. Tester les Hooks

```bash
# Test auto-lint
bash .claude/hooks/auto-lint-on-edit.sh src/App.tsx

# Test pre-commit (si des fichiers sont staged)
bash .claude/hooks/pre-commit-check.sh

# Test post-install
bash .claude/hooks/post-npm-install.sh
```

### 3. Redémarrer Claude Code

Pour charger la nouvelle configuration (status line, hooks, etc.), redémarrer Claude Code.

---

## 🔌 Configuration MCP (Optionnel mais Recommandé)

### Étape 1: Créer le Répertoire Config

```bash
# Linux/WSL
mkdir -p ~/.config/claude-code

# Windows (PowerShell)
mkdir $env:APPDATA\claude-code
```

### Étape 2: Créer le Fichier Config

```bash
# Linux/WSL
nano ~/.config/claude-code/config.json

# Windows
notepad %APPDATA%\claude-code\config.json
```

### Étape 3: Copier la Configuration

Copier le contenu de `.claude/mcp-config-example.json` dans le fichier créé.

**Setup minimal (recommandé pour démarrer):**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/mnt/c/programmation/learning_english"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "env": {
        "GIT_DIR": "/mnt/c/programmation/learning_english/.git"
      }
    }
  },
  "mcpTimeout": 30000,
  "mcpRetries": 3
}
```

### Étape 4: Configuration des Tokens (si GitHub/Firebase)

```bash
# Ajouter dans ~/.bashrc ou ~/.zshrc
export GITHUB_TOKEN="ghp_your_token_here"
export FIREBASE_PROJECT_ID="your-project-id"

# Recharger
source ~/.bashrc
```

### Étape 5: Redémarrer Claude Code

Les MCP servers se chargent au démarrage de Claude Code.

---

## 🧪 Tests Post-Installation

### Test 1: Commandes Slash

Dans Claude Code, taper:
```
/review-code
```

**Résultat attendu:** La commande s'exécute et analyse le code.

### Test 2: Hooks

```bash
# Créer un fichier de test
echo "const test = 'hello'" > /tmp/test.ts

# Éditer via Claude Code ou simuler
bash .claude/hooks/auto-lint-on-edit.sh /tmp/test.ts
```

**Résultat attendu:** ESLint et Prettier s'exécutent.

### Test 3: Status Line

**Résultat attendu:** La status line affiche:
- 📁 Répertoire
- 🌿 Branche Git
- ⬢ Version Node.js
- 🟢/⚫ État serveurs
- etc.

### Test 4: .claudeignore

Demander à Claude Code de lire un fichier dans node_modules.

**Résultat attendu:** Doit être ignoré/exclu automatiquement.

---

## 🔍 Vérifications

### Checklist Complète

```bash
# 1. Hooks exécutables ?
ls -la .claude/hooks/*.sh | grep -q 'x' && echo "✅ OK" || echo "❌ chmod +x manquant"

# 2. Commandes existent ?
[ $(ls .claude/commands/*.md | wc -l) -eq 13 ] && echo "✅ 13 commandes" || echo "❌ Commandes manquantes"

# 3. Documentation existe ?
[ -f memo_claude.md ] && echo "✅ memo_claude.md" || echo "❌ Manquant"
[ -f .claudeignore ] && echo "✅ .claudeignore" || echo "❌ Manquant"

# 4. CI/CD configuré ?
[ -f .github/workflows/ci-cd.yml ] && echo "✅ CI/CD workflow" || echo "❌ Manquant"

# 5. MCP config exemple existe ?
[ -f .claude/mcp-config-example.json ] && echo "✅ MCP template" || echo "❌ Manquant"
```

---

## 🐛 Troubleshooting

### Problème: "Permission denied" sur les hooks

```bash
chmod +x .claude/hooks/*.sh
```

### Problème: Commandes slash non reconnues

1. Vérifier que les fichiers .md existent dans `.claude/commands/`
2. Redémarrer Claude Code
3. Vérifier qu'il n'y a pas d'erreurs de syntaxe dans les .md

### Problème: Status line ne s'affiche pas

1. Vérifier `.claude/settings.local.json`:
   ```json
   {
     "statusLine": {
       "enabled": true,
       ...
     }
   }
   ```
2. Redémarrer Claude Code

### Problème: Hooks ne s'exécutent pas

1. Vérifier les permissions: `ls -la .claude/hooks/`
2. Tester manuellement: `bash .claude/hooks/auto-lint-on-edit.sh src/App.tsx`
3. Vérifier la config dans `.claude/settings.local.json` section `"hooks"`

### Problème: MCP servers ne se chargent pas

1. Vérifier le fichier config: `cat ~/.config/claude-code/config.json`
2. Valider le JSON: `cat ~/.config/claude-code/config.json | jq .`
3. Vérifier les logs: `tail -f ~/.local/state/claude-code/logs/main.log`
4. Tester manuellement: `npx -y @modelcontextprotocol/server-git`

---

## 📊 Résumé de la Configuration

### Fichiers Créés

```
Total: 23 fichiers

.claude/
├── settings.local.json         [1]
├── mcp-config-example.json     [1]
├── INDEX.md                    [1]
├── QUICK_START.md              [1]
├── README.md                   [1]
├── MCP_SETUP.md                [1]
├── INSTALLATION.md             [1] (ce fichier)
├── commands/                   [13 fichiers]
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
│   └── git-clean.md
└── hooks/                      [3 fichiers]
    ├── auto-lint-on-edit.sh
    ├── pre-commit-check.sh
    └── post-npm-install.sh

Racine:
├── memo_claude.md              [1]
├── .claudeignore               [1]
├── CLAUDE_CODE_SETUP_COMPLETE.md [1]
└── .github/workflows/ci-cd.yml [1]
```

### Fonctionnalités Activées

- ✅ **Status Line** avec 11 indicateurs temps réel
- ✅ **Auto-Lint** sur chaque Edit/Write
- ✅ **Pre-Commit Checks** automatiques
- ✅ **Post-Install Audit** automatique
- ✅ **13 Commandes Slash** professionnelles
- ✅ **Optimisation Tokens** (.claudeignore)
- ✅ **Pipeline CI/CD** prêt à l'emploi
- ✅ **Documentation Complète** multi-niveaux
- ✅ **Templates MCP** pour setup avancé

---

## 🎯 Ordre d'Installation Recommandé

### Installation Minimale (5 min)

1. `chmod +x .claude/hooks/*.sh`
2. Redémarrer Claude Code
3. Tester `/review-code`
4. ✅ Prêt !

### Installation Complète (15 min)

1. `chmod +x .claude/hooks/*.sh`
2. Lire `.claude/QUICK_START.md`
3. Configurer MCP (filesystem + git)
4. Redémarrer Claude Code
5. Tester toutes les commandes slash
6. Lire `memo_claude.md`
7. ✅ Setup pro complet !

---

## 📞 Aide

### Si ça ne marche pas

1. Vérifier la checklist ci-dessus
2. Lire la section Troubleshooting
3. Consulter `.claude/README.md`
4. Taper `/help` dans Claude Code

### Ressources

- Quick Start: `.claude/QUICK_START.md`
- Index: `.claude/INDEX.md`
- Référence: `memo_claude.md`
- MCP: `.claude/MCP_SETUP.md`

---

**🎉 Installation terminée ! Bon coding avec Claude Code !**

*Version: 1.0.0*
*Date: 2025-11-10*
