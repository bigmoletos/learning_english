# 🔌 MCP Servers Setup Guide

## Qu'est-ce que MCP ?

**Model Context Protocol** permet à Claude Code de se connecter à des services externes pour des opérations optimisées et spécialisées.

## 📦 Installation Globale

### Localisation du fichier config

**Linux/WSL:**
```bash
~/.config/claude-code/config.json
```

**Windows:**
```
%APPDATA%/claude-code/config.json
```

**macOS:**
```bash
~/Library/Application Support/claude-code/config.json
```

### Créer le fichier config

```bash
mkdir -p ~/.config/claude-code
nano ~/.config/claude-code/config.json
```

## 🚀 MCP Servers Recommandés

### 1. Filesystem MCP (Essentiel)

Accès optimisé au système de fichiers.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/mnt/c/programmation/learning_english"
      ],
      "description": "File system access for the project"
    }
  }
}
```

**Avantages:**
- Lecture/écriture optimisée
- Moins de tokens consommés
- Opérations batch sur fichiers

### 2. Git MCP (Recommandé)

Opérations Git avancées.

```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "env": {
        "GIT_DIR": "/mnt/c/programmation/learning_english/.git"
      },
      "description": "Git operations and history"
    }
  }
}
```

**Avantages:**
- Git log optimisé
- Blame, diff avancés
- History analysis

### 3. GitHub MCP (Si GitHub)

Intégration complète GitHub.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "description": "GitHub API access"
    }
  }
}
```

**Setup du token:**
```bash
# Créer un token: https://github.com/settings/tokens
# Permissions: repo, workflow, read:org

# Ajouter au .bashrc ou .zshrc
export GITHUB_TOKEN="ghp_your_token_here"
```

**Avantages:**
- Créer issues/PR
- Review PR
- Manage labels
- CI/CD status

### 4. Firebase MCP (Pour ce Projet)

Gestion Firebase.

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"],
      "env": {
        "FIREBASE_PROJECT_ID": "your-project-id",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
      },
      "description": "Firebase operations"
    }
  }
}
```

**Setup:**
```bash
# Télécharger service account key depuis Firebase Console
# Project Settings > Service Accounts > Generate new private key

export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

**Avantages:**
- Firestore queries
- Auth management
- Cloud Functions
- Storage operations

### 5. Postgres/SQLite MCP (Backend DB)

Pour les opérations de base de données.

**SQLite (ce projet):**
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite"],
      "env": {
        "DATABASE_PATH": "/mnt/c/programmation/learning_english/backend/database/development.sqlite"
      },
      "description": "SQLite database access"
    }
  }
}
```

**Avantages:**
- Queries optimisées
- Schema inspection
- Migrations helper

### 6. Brave Search MCP (Recherche Web)

Alternative à Google Search.

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      },
      "description": "Web search capabilities"
    }
  }
}
```

**Setup:**
```bash
# Obtenir API key: https://brave.com/search/api/
export BRAVE_API_KEY="your_api_key"
```

### 7. Slack MCP (Si équipe Slack)

Intégration Slack.

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
      },
      "description": "Slack integration"
    }
  }
}
```

**Avantages:**
- Envoyer notifications
- Lire messages
- Create channels

## 📝 Configuration Complète Exemple

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
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"],
      "env": {
        "FIREBASE_PROJECT_ID": "ai-english-trainer",
        "GOOGLE_APPLICATION_CREDENTIALS": "${HOME}/.config/firebase/service-account.json"
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite"],
      "env": {
        "DATABASE_PATH": "/mnt/c/programmation/learning_english/backend/database/development.sqlite"
      }
    }
  },
  "mcpTimeout": 30000,
  "mcpRetries": 3
}
```

## 🔧 Vérification & Test

### Vérifier la configuration

```bash
# Vérifier le fichier JSON
cat ~/.config/claude-code/config.json | jq .

# Tester un MCP server manuellement
npx -y @modelcontextprotocol/server-filesystem --help
```

### Redémarrer Claude Code

Après modification du config, redémarrer Claude Code pour charger les MCP servers.

### Logs de debug

```bash
# Logs Claude Code (vérifier si MCP servers chargent)
tail -f ~/.local/state/claude-code/logs/main.log
```

## 💡 Best Practices

### Sécurité

1. **Tokens dans variables d'env**
   ```bash
   # .bashrc ou .zshrc
   export GITHUB_TOKEN="ghp_xxx"
   export BRAVE_API_KEY="xxx"
   export FIREBASE_PROJECT_ID="xxx"
   ```

2. **Pas de tokens hardcodés** dans config.json

3. **Permissions minimales** pour les tokens

### Performance

1. **Charger seulement ce qui est nécessaire**
   - Ne pas activer 20 MCP servers
   - Commencer avec filesystem + git

2. **Timeout approprié**
   ```json
   "mcpTimeout": 30000  // 30 secondes
   ```

3. **Retries**
   ```json
   "mcpRetries": 3
   ```

## 🐛 Troubleshooting

### MCP server ne charge pas

```bash
# Vérifier les logs
cat ~/.local/state/claude-code/logs/main.log | grep -i "mcp"

# Tester manuellement
npx -y @modelcontextprotocol/server-git
```

### Erreur de permissions

```bash
# Vérifier les permissions du config
ls -la ~/.config/claude-code/config.json

# Doit être readable par l'utilisateur
chmod 600 ~/.config/claude-code/config.json
```

### Variables d'env non reconnues

```bash
# Vérifier qu'elles sont exportées
echo $GITHUB_TOKEN

# Relancer le shell ou source
source ~/.bashrc
```

## 📚 Ressources

- MCP Protocol: https://modelcontextprotocol.io/
- MCP Servers: https://github.com/modelcontextprotocol/servers
- Claude Code Docs: https://docs.claude.com/en/docs/claude-code/mcp

## 🎯 Recommandations pour ce Projet

**Setup minimal:**
1. Filesystem MCP ✅
2. Git MCP ✅

**Setup recommandé:**
1. Filesystem MCP ✅
2. Git MCP ✅
3. GitHub MCP ✅
4. Firebase MCP ✅

**Setup complet:**
1. Filesystem MCP ✅
2. Git MCP ✅
3. GitHub MCP ✅
4. Firebase MCP ✅
5. SQLite MCP ✅
6. Brave Search MCP (optionnel)

**Démarrer avec le setup minimal, puis ajouter au besoin !**
