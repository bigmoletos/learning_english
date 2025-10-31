#!/bin/bash

# Script de test d'envoi d'emails
# AI English Trainer - Version 1.0.0
#
# Usage: ./testEmail.sh [email]
# Exemple: ./testEmail.sh test@example.com

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$(cd "$BACKEND_DIR/.." && pwd)"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

# Vérifier que .env existe
if [ ! -f "$PROJECT_DIR/.env" ]; then
    log_error "Fichier .env introuvable dans $PROJECT_DIR"
    log_info "Créez-le à partir de ENV_TEMPLATE.txt"
    exit 1
fi

# Vérifier que node_modules existe
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    log_warning "node_modules introuvable, installation des dépendances..."
    cd "$BACKEND_DIR"
    npm install
fi

# Exécuter le script de test
log_info "Exécution du script de test d'email..."
echo ""

cd "$BACKEND_DIR"
node scripts/testEmail.js "$@"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    log_success "Test réussi !"
    echo ""
    log_info "Consultez votre boîte email (et dossier spam) pour voir l'email de test"
else
    echo ""
    log_error "Test échoué. Vérifiez la configuration dans .env"
    echo ""
    log_info "Documentation: backend/GMAIL_SETUP.md"
fi

exit $exit_code

