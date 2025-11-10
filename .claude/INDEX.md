# 🗂️ Index Claude Code Configuration

## 📖 Guide de Navigation Rapide

### 🚀 Démarrage Immédiat

```
1. QUICK_START.md      👈 COMMENCER ICI !
2. Tester: /review-code
3. Observer la status line
4. Lire memo_claude.md pour détails
```

---

## 📚 Documentation par Niveau

### 🟢 Débutant

1. **`.claude/QUICK_START.md`**
   - TL;DR des commandes
   - Workflows recommandés
   - Tips pour économiser tokens

2. **`../CLAUDE_CODE_SETUP_COMPLETE.md`**
   - Vue d'ensemble de tout ce qui a été créé
   - Prochaines étapes
   - Résumé des bénéfices

### 🟡 Intermédiaire

3. **`.claude/README.md`**
   - Documentation complète de la config
   - Détails des hooks
   - Status line expliquée
   - Best practices

4. **`../memo_claude.md`**
   - RÉFÉRENCE COMPLÈTE de toutes les commandes Claude Code
   - Tous les tools expliqués avec exemples
   - Conventions Git
   - Workflows détaillés

### 🔴 Avancé

5. **`.claude/MCP_SETUP.md`**
   - Installation MCP servers
   - Configuration avancée
   - Troubleshooting

6. **`.claude/mcp-config-example.json`**
   - Template de configuration MCP
   - À copier dans ~/.config/claude-code/

---

## 🎯 Documentation par Usage

### 🔍 Je veux...

#### ...réviser du code
```
/review-code
/refactor-suggest
```
📄 Voir: `commands/review-code.md`, `commands/refactor-suggest.md`

#### ...corriger des erreurs
```
/fix-lint
/debug-help
```
📄 Voir: `commands/fix-lint.md`, `commands/debug-help.md`

#### ...vérifier les tests
```
/test-coverage
```
📄 Voir: `commands/test-coverage.md`

#### ...préparer un déploiement
```
/deploy-check
/security-audit
/build-check
/perf-check
```
📄 Voir: `commands/deploy-check.md`, `commands/security-audit.md`

#### ...gérer la base de données
```
/db-migrate
```
📄 Voir: `commands/db-migrate.md`

#### ...créer un composant
```
/gen-component
```
📄 Voir: `commands/gen-component.md`

#### ...documenter l'API
```
/api-doc
```
📄 Voir: `commands/api-doc.md`

#### ...nettoyer Git
```
/git-clean
```
📄 Voir: `commands/git-clean.md`

---

## 📁 Structure des Fichiers

### Configuration Core

```
.claude/
├── settings.local.json         # Config principale (permissions, status line, hooks)
├── mcp-config-example.json     # Template MCP à copier ailleurs
└── [Documentation ci-dessous]
```

### Documentation

```
.claude/
├── QUICK_START.md              # ⭐ COMMENCER ICI
├── README.md                   # Doc complète de la config
├── MCP_SETUP.md                # Guide MCP servers
└── INDEX.md                    # Ce fichier
```

### Commandes Slash (13)

```
.claude/commands/
├── review-code.md              # Revue de code complète
├── fix-lint.md                 # Auto-fix ESLint/Prettier
├── test-coverage.md            # Analyse tests coverage
├── build-check.md              # Analyse bundle
├── deploy-check.md             # Checklist pré-déploiement
├── debug-help.md               # Assistant debugging
├── api-doc.md                  # Génère doc API
├── refactor-suggest.md         # Suggestions refactoring
├── db-migrate.md               # Helper migrations DB
├── perf-check.md               # Analyse performance
├── security-audit.md           # Audit sécurité
├── gen-component.md            # Générateur composant React
└── git-clean.md                # Nettoyage Git
```

### Hooks Automatiques (3)

```
.claude/hooks/
├── auto-lint-on-edit.sh        # Auto ESLint+Prettier après Edit/Write
├── pre-commit-check.sh         # Checks avant commit Git
└── post-npm-install.sh         # Audit après npm install
```

### Fichiers Racine

```
/
├── .claudeignore               # Optimisation tokens (exclut node_modules, etc.)
├── memo_claude.md              # ⭐ RÉFÉRENCE COMPLÈTE toutes commandes
└── CLAUDE_CODE_SETUP_COMPLETE.md  # Vue d'ensemble du setup
```

---

## 🎨 Cheatsheet Visuelle

### Commandes par Catégorie

#### 📝 Qualité de Code
```bash
/review-code          # Review complète
/fix-lint             # Auto-fix lint
/refactor-suggest     # Suggestions refactoring
```

#### 🧪 Tests & Coverage
```bash
/test-coverage        # Analyse coverage
```

#### 🏗️ Build & Performance
```bash
/build-check          # Analyse bundle
/perf-check          # Analyse performance
```

#### 🔒 Sécurité
```bash
/security-audit       # Audit sécurité complet
```

#### 🚀 Déploiement
```bash
/deploy-check         # Checklist GO/NO-GO
```

#### 🛠️ Utilitaires
```bash
/debug-help           # Assistant debug
/api-doc             # Doc API
/db-migrate          # Migrations DB
/gen-component       # Générer composant
/git-clean           # Nettoyage Git
```

### Hooks - Quand ils s'exécutent

| Hook | Trigger | Action |
|------|---------|--------|
| `auto-lint-on-edit.sh` | Edit/Write sur .ts/.tsx/.js/.jsx | ESLint --fix + Prettier |
| `pre-commit-check.sh` | Avant commit Git | TS check + ESLint + console.log detection |
| `post-npm-install.sh` | Après npm install | npm audit + outdated check |

### Status Line - Sections

```
🚀 📁 dir │ 🌿 branch │ ± status │ @ hash │ ⬢ node │ 📦 npm │ 📋 v1.0 │ 🟢 DEV │ 🔧 API │ 🕐 time
└─┬──┘     └────┬────┘   └──┬──┘   └──┬─┘   └──┬─┘   └──┬─┘   └──┬──┘   └──┬─┘   └─┬─┘   └──┬──┘
  │             │            │         │        │        │        │         │       │        │
Icon        Git Branch   Git Status  Commit  Node.js  npm    App Ver   Dev    Backend  Time
                                             Version  Ver             Server  Status
```

---

## 🔧 Personnalisation

### Modifier une Commande

```bash
nano .claude/commands/nom-commande.md
# Éditer et sauvegarder
```

### Créer une Nouvelle Commande

```bash
cat > .claude/commands/ma-commande.md << 'EOF'
Mon Titre de Commande

Description de ce que fait la commande.

Instructions détaillées...
EOF
```

### Modifier un Hook

```bash
nano .claude/hooks/auto-lint-on-edit.sh
chmod +x .claude/hooks/auto-lint-on-edit.sh
```

### Modifier la Status Line

```bash
nano .claude/settings.local.json
# Éditer section "statusLine"
```

---

## 🆘 Aide Rapide

### Problème : Hook ne s'exécute pas

```bash
chmod +x .claude/hooks/*.sh
bash .claude/hooks/auto-lint-on-edit.sh src/test.tsx  # test manuel
```

### Problème : Commande slash non reconnue

```bash
ls .claude/commands/     # vérifier qu'elle existe
cat .claude/commands/ma-commande.md  # vérifier le format
```

### Problème : Status line ne s'affiche pas

1. Vérifier `.claude/settings.local.json` → `"statusLine": { "enabled": true }`
2. Redémarrer Claude Code

### Problème : Trop de tokens consommés

1. Vérifier que `.claudeignore` existe
2. Utiliser commandes slash au lieu de prompts longs
3. Utiliser Grep avant Read
4. Setup MCP servers pour opérations optimisées

---

## 📞 Ressources

### Documentation Locale

| Fichier | Description |
|---------|-------------|
| `.claude/QUICK_START.md` | ⭐ Démarrage rapide |
| `memo_claude.md` | ⭐ Référence complète |
| `.claude/README.md` | Doc configuration |
| `.claude/MCP_SETUP.md` | Setup MCP servers |
| `CLAUDE_CODE_SETUP_COMPLETE.md` | Vue d'ensemble |

### Liens Externes

- 🌐 Claude Code Docs: https://docs.claude.com/en/docs/claude-code
- 🔌 MCP Protocol: https://modelcontextprotocol.io/
- 💻 GitHub CLI: https://cli.github.com/
- 🔥 Firebase: https://firebase.google.com/docs

---

## ✅ Checklist Premier Démarrage

```
□ Lire QUICK_START.md
□ Tester /review-code
□ Vérifier hooks fonctionnent (chmod +x si besoin)
□ Observer la status line
□ Lire memo_claude.md (référence)
□ Configurer MCP servers (optionnel)
□ Personnaliser selon besoins
```

---

## 🎯 Top 5 des Fichiers à Connaître

1. **`.claude/QUICK_START.md`** - Pour démarrer rapidement
2. **`memo_claude.md`** - Référence de toutes les commandes
3. **`.claude/README.md`** - Configuration détaillée
4. **`CLAUDE_CODE_SETUP_COMPLETE.md`** - Vue d'ensemble
5. **`.claude/MCP_SETUP.md`** - MCP servers (avancé)

---

**🚀 Prêt à utiliser Claude Code comme un pro !**

*Dernière mise à jour: 2025-11-10*
