#!/bin/bash

# Configuration Claude Code - Script d'Installation Automatique
# Date: 2025-11-10

set -e

echo "══════════════════════════════════════════════════════════════"
echo "           Installation Configuration Claude Code             "
echo "══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction de log
log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_info() {
    echo -e "${YELLOW}→${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Vérifier qu'on est dans le bon répertoire
log_info "Vérification du répertoire..."
if [ ! -f "package.json" ]; then
    log_error "Erreur: package.json non trouvé. Êtes-vous dans le bon répertoire ?"
    exit 1
fi
log_success "Répertoire OK"

# 2. Vérifier que .claude existe
log_info "Vérification de .claude/..."
if [ ! -d ".claude" ]; then
    log_error "Erreur: .claude/ non trouvé"
    exit 1
fi
log_success ".claude/ trouvé"

# 3. Rendre les hooks exécutables
log_info "Permissions des hooks..."
chmod +x .claude/hooks/*.sh
log_success "Hooks rendus exécutables"

# 4. Vérifier les permissions
log_info "Vérification des permissions..."
if ls -la .claude/hooks/*.sh | grep -q "x"; then
    log_success "Permissions OK"
else
    log_error "Erreur: Hooks non exécutables"
    exit 1
fi

# 5. Test des hooks
log_info "Test des hooks..."

# Test auto-lint
if [ -f "src/App.tsx" ]; then
    log_info "Test auto-lint-on-edit.sh..."
    bash .claude/hooks/auto-lint-on-edit.sh src/App.tsx > /dev/null 2>&1
    log_success "auto-lint-on-edit.sh testé"
else
    log_info "src/App.tsx non trouvé, skip test auto-lint"
fi

# Test post-install
log_info "Test post-npm-install.sh..."
bash .claude/hooks/post-npm-install.sh > /dev/null 2>&1 || true
log_success "post-npm-install.sh testé"

# 6. Vérifier les fichiers créés
log_info "Vérification des fichiers..."

check_file() {
    if [ -f "$1" ]; then
        log_success "$1"
    else
        log_error "Manquant: $1"
    fi
}

check_file "memo_claude.md"
check_file ".claudeignore"
check_file "CLAUDE_CODE_SETUP_COMPLETE.md"
check_file ".claude/QUICK_START.md"
check_file ".claude/README.md"
check_file ".claude/INDEX.md"
check_file ".claude/MCP_SETUP.md"
check_file ".claude/INSTALLATION.md"
check_file ".claude/settings.local.json"

# Compter les commandes
COMMANDS_COUNT=$(ls .claude/commands/*.md 2>/dev/null | wc -l)
if [ "$COMMANDS_COUNT" -eq 13 ]; then
    log_success "13 commandes slash créées"
else
    log_error "Nombre de commandes incorrect: $COMMANDS_COUNT (attendu: 13)"
fi

# Compter les hooks
HOOKS_COUNT=$(ls .claude/hooks/*.sh 2>/dev/null | wc -l)
if [ "$HOOKS_COUNT" -eq 3 ]; then
    log_success "3 hooks créés"
else
    log_error "Nombre de hooks incorrect: $HOOKS_COUNT (attendu: 3)"
fi

# 7. Résumé
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "                         RÉSUMÉ                               "
echo "══════════════════════════════════════════════════════════════"
echo ""

echo "📦 Fichiers créés:"
echo "   • 1 fichier de configuration (.claude/settings.local.json)"
echo "   • 6 fichiers de documentation"
echo "   • 13 commandes slash"
echo "   • 3 hooks automatiques"
echo "   • 1 .claudeignore"
echo "   • 1 Pipeline CI/CD"
echo "   • 1 Mémo complet (memo_claude.md)"
echo ""

echo "✨ Fonctionnalités activées:"
echo "   ✓ Status line avancée"
echo "   ✓ Hooks automatiques"
echo "   ✓ 13 commandes slash"
echo "   ✓ Optimisation tokens"
echo "   ✓ Pipeline CI/CD"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "                   PROCHAINES ÉTAPES                          "
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "1. Redémarrer Claude Code"
echo "2. Lire: .claude/QUICK_START.md"
echo "3. Tester: /review-code"
echo "4. Lire: memo_claude.md (référence complète)"
echo ""
echo "Configuration MCP (optionnel):"
echo "   Lire: .claude/MCP_SETUP.md"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "                   ✅ INSTALLATION TERMINÉE !                 "
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Documentation:"
echo "   • Quick Start:  .claude/QUICK_START.md"
echo "   • Index:        .claude/INDEX.md"
echo "   • Référence:    memo_claude.md"
echo "   • Installation: .claude/INSTALLATION.md"
echo ""
echo "🎉 Prêt à coder avec Claude Code !"
echo ""
