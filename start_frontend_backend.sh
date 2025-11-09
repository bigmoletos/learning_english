#!/bin/bash

# ============================================================================
# Script de démarrage complet (Frontend + Backend)
# AI English Trainer - Version 1.0.0
# ============================================================================
#
# DESCRIPTION
# -----------
# Script pour démarrer, arrêter et gérer les serveurs frontend (React)
# et backend (Express) de l'application AI English Trainer.
#
# USAGE
# -----
#   ./start_frontend_backend.sh [COMMANDE]
#
# COMMANDES DISPONIBLES
# ---------------------
#   start           - Démarrer frontend (port 3000) + backend (port 5010)
#   stop            - Arrêter tous les serveurs
#   restart         - Redémarrer tous les serveurs
#   status          - Voir l'état des serveurs (démarrés/arrêtés)
#   logs            - Voir les logs combinés (backend + frontend)
#   logs-backend    - Voir uniquement les logs du backend
#   logs-frontend   - Voir uniquement les logs du frontend
#   help            - Afficher l'aide détaillée avec exemples
#   --help          - Alias pour help
#   -h              - Alias pour help
#
# EXEMPLES D'UTILISATION
# ----------------------
#   # Démarrer l'application complète
#   ./start_frontend_backend.sh start
#
#   # Vérifier le statut des serveurs
#   ./start_frontend_backend.sh status
#
#   # Voir les logs backend en temps réel (dans un terminal séparé)
#   ./start_frontend_backend.sh logs-backend
#
#   # Voir les logs frontend en temps réel
#   ./start_frontend_backend.sh logs-frontend
#
#   # Redémarrer après modification du code
#   ./start_frontend_backend.sh restart
#
#   # Arrêter proprement tous les serveurs
#   ./start_frontend_backend.sh stop
#
#   # Afficher l'aide complète
#   ./start_frontend_backend.sh help
#
# FICHIERS UTILISÉS
# -----------------
#   Logs Backend :  /tmp/backend_api.log
#   Logs Frontend:  /tmp/frontend_react.log
#   PID Backend :   /tmp/backend.pid
#   PID Frontend:   /tmp/frontend.pid
#
# URLS
# ----
#   Frontend: http://localhost:3000
#   Backend : http://localhost:5010
#   Health  : http://localhost:5010/health
#
# NOTES
# -----
#   • Le script vérifie automatiquement si les serveurs sont déjà en cours
#   • Les logs sont accessibles en temps réel avec tail -f
#   • Utilisez Ctrl+C pour quitter la visualisation des logs
#   • Le script gère automatiquement les ports (3000 pour frontend, 5010 pour backend)
#
# ============================================================================

# Détecter automatiquement le répertoire du projet (depuis le script)
# Compatible avec bash et sh (dash)
# Utiliser $0 qui fonctionne avec les deux shells
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
FRONTEND_LOG="/tmp/frontend_react.log"
BACKEND_LOG="/tmp/backend_api.log"
FRONTEND_PID_FILE="/tmp/frontend.pid"
BACKEND_PID_FILE="/tmp/backend.pid"

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
    echo -e "${YELLOW}[AVERTISSEMENT]${NC} $1"
}

# Fonction pour vérifier si un serveur est en cours
is_running() {
    local pid_file=$1
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null; then
            return 0
        fi
    fi
    return 1
}

# Fonction pour arrêter un serveur
stop_server() {
    local name=$1
    local pid_file=$2

    log_info "Arrêt de $name..."
    if is_running "$pid_file"; then
        PID=$(cat "$pid_file")
        kill $PID 2>/dev/null
        sleep 2
        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID 2>/dev/null
        fi
        rm -f "$pid_file"
        log_success "$name arrêté"
    else
        log_info "$name n'est pas en cours d'exécution"
    fi
}

# Fonction pour démarrer le backend
start_backend() {
    log_info "Démarrage du backend..."
    cd "$PROJECT_DIR/backend" || { log_error "Dossier backend introuvable"; exit 1; }

    # Vérifier si .env existe
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log_error "Fichier .env manquant !"
        log_info "Créez-le à partir de ENV_TEMPLATE.txt"
        exit 1
    fi

    # Vérifier si node_modules existe
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances backend..."
        npm install
    fi

    # Démarrer le serveur
    npm start > "$BACKEND_LOG" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"

    # Attendre que le backend soit prêt
    local timeout=30
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -s http://localhost:5010/health > /dev/null 2>&1; then
            log_success "Backend démarré (PID: $(cat $BACKEND_PID_FILE))"
            log_info "API disponible sur http://localhost:5010"
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo -n "."
    done
    echo ""
    log_error "Le backend n'a pas démarré dans le temps imparti"
    return 1
}

# Fonction pour démarrer le frontend
start_frontend() {
    log_info "Démarrage du frontend..."
    cd "$PROJECT_DIR" || { log_error "Dossier projet introuvable"; exit 1; }

    # Vérifier si node_modules existe
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances frontend..."
        npm install
    fi

    # Démarrer le serveur React (forcer PORT=3000)
    PORT=3000 BROWSER=none npm start > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"

    # Attendre la compilation
    local timeout=90
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        # Vérifier si le processus est toujours actif
        if ! ps -p $(cat "$FRONTEND_PID_FILE" 2>/dev/null) > /dev/null 2>&1; then
            log_error "Le processus frontend s'est arrêté prématurément"
            log_info "Voir les logs: tail -f $FRONTEND_LOG"
            return 1
        fi

        # Vérifier plusieurs indicateurs de succès
        if grep -q "Compiled successfully" "$FRONTEND_LOG" 2>/dev/null || \
           grep -q "webpack compiled" "$FRONTEND_LOG" 2>/dev/null || \
           grep -q "Local:" "$FRONTEND_LOG" 2>/dev/null; then
            log_success "Frontend démarré (PID: $(cat $FRONTEND_PID_FILE))"
            log_info "Application disponible sur http://localhost:3000"
            return 0
        fi

        # Vérifier les erreurs
        if grep -q "error\|Error\|ERROR\|failed\|Failed" "$FRONTEND_LOG" 2>/dev/null; then
            log_warning "Erreurs détectées dans les logs frontend"
            log_info "Voir les détails: tail -f $FRONTEND_LOG"
            # Ne pas arrêter, continuer à attendre
        fi

        sleep 3
        elapsed=$((elapsed + 3))
        echo -n "."
    done
    echo ""
    log_error "Le frontend n'a pas démarré dans le temps imparti (${timeout}s)"
    log_info "Consultez les logs pour plus de détails: tail -f $FRONTEND_LOG"
    log_info "Ou utilisez: ./start_frontend_backend.sh logs-frontend"
    return 1
}

# Fonction de statut
status() {
    echo ""
    echo "═══════════════════════════════════════"
    echo "  STATUT DES SERVEURS"
    echo "═══════════════════════════════════════"

    # Backend
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "Backend:  ${GREEN}✓ En cours${NC} (PID: $(cat $BACKEND_PID_FILE))"
        echo "          http://localhost:5010"
    else
        echo -e "Backend:  ${RED}✗ Arrêté${NC}"
    fi

    # Frontend
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "Frontend: ${GREEN}✓ En cours${NC} (PID: $(cat $FRONTEND_PID_FILE))"
        echo "          http://localhost:3000"
    else
        echo -e "Frontend: ${RED}✗ Arrêté${NC}"
    fi

    echo "═══════════════════════════════════════"
    echo ""
}

# Fonction principale
main() {
    case "${1:-start}" in
        start)
            echo ""
            echo "═══════════════════════════════════════"
            echo "  🚀 DÉMARRAGE COMPLET"
            echo "  Frontend (React) + Backend (Express)"
            echo "═══════════════════════════════════════"
            echo ""

            # Vérifier si déjà en cours
            if is_running "$BACKEND_PID_FILE" && is_running "$FRONTEND_PID_FILE"; then
                log_info "Les serveurs sont déjà en cours d'exécution"
                status
                exit 0
            fi

            # Démarrer backend
            if ! is_running "$BACKEND_PID_FILE"; then
                start_backend
            else
                log_info "Backend déjà en cours"
            fi

            # Démarrer frontend
            if ! is_running "$FRONTEND_PID_FILE"; then
                start_frontend
            else
                log_info "Frontend déjà en cours"
            fi

            echo ""
            echo "═══════════════════════════════════════"
            echo -e "  ${GREEN}✅ TOUT EST DÉMARRÉ !${NC}"
            echo "═══════════════════════════════════════"
            echo ""
            echo "🌐 Ouvrez votre navigateur :"
            echo "   http://localhost:3000"
            echo ""
            echo "📊 Logs en temps réel :"
            echo "   Backend : tail -f $BACKEND_LOG"
            echo "   Frontend: tail -f $FRONTEND_LOG"
            echo ""
            echo "🛑 Pour arrêter : ./start_frontend_backend.sh stop"
            echo ""
            ;;

        stop)
            echo ""
            log_info "Arrêt de tous les serveurs..."
            stop_server "Frontend" "$FRONTEND_PID_FILE"
            stop_server "Backend" "$BACKEND_PID_FILE"

            # Nettoyage processus résiduels
            pkill -f "react-scripts" 2>/dev/null
            pkill -f "node.*server.js" 2>/dev/null

            log_success "Tous les serveurs sont arrêtés"
            echo ""
            ;;

        restart)
            "$SCRIPT_DIR/start_frontend_backend.sh" stop
            sleep 2
            "$SCRIPT_DIR/start_frontend_backend.sh" start
            ;;

        status)
            status
            ;;

        logs-backend)
            if [ ! -f "$BACKEND_LOG" ]; then
                log_error "Fichier de log backend introuvable: $BACKEND_LOG"
                exit 1
            fi
            log_info "Logs backend en temps réel (Ctrl+C pour quitter)..."
            echo ""
            tail -f "$BACKEND_LOG"
            ;;

        logs-frontend)
            if [ ! -f "$FRONTEND_LOG" ]; then
                log_error "Fichier de log frontend introuvable: $FRONTEND_LOG"
                exit 1
            fi
            log_info "Logs frontend en temps réel (Ctrl+C pour quitter)..."
            echo ""
            tail -f "$FRONTEND_LOG"
            ;;

        logs)
            # Afficher les logs des deux serveurs dans des terminaux séparés ou en mode split
            log_info "Affichage des logs combinés..."
            if [ -f "$BACKEND_LOG" ] && [ -f "$FRONTEND_LOG" ]; then
                log_info "Backend: $BACKEND_LOG"
                log_info "Frontend: $FRONTEND_LOG"
                echo ""
                log_info "Utilisez 'logs-backend' ou 'logs-frontend' pour un seul service"
                echo ""
                log_info "Logs combinés (alternance):"
                tail -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null || {
                    echo "Backend:"
                    tail -f "$BACKEND_LOG" &
                    echo "Frontend:"
                    tail -f "$FRONTEND_LOG"
                }
            else
                log_error "Fichiers de log introuvables"
                exit 1
            fi
            ;;

        help|--help|-h)
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  Script de Démarrage Complet - Frontend + Backend"
            echo "  AI English Trainer - Version 1.0.0"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "Usage: $0 [COMMANDE]"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  COMMANDES DISPONIBLES"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "  start           Démarrer frontend (port 3000) + backend (port 5010)"
            echo "                  Exemple: $0 start"
            echo "                  • Vérifie automatiquement si les serveurs sont déjà en cours"
            echo "                  • Crée les logs dans /tmp/"
            echo "                  • Affiche les URLs d'accès"
            echo ""
            echo "  stop            Arrêter tous les serveurs (frontend + backend)"
            echo "                  Exemple: $0 stop"
            echo "                  • Arrête proprement tous les processus"
            echo "                  • Nettoie les fichiers PID"
            echo ""
            echo "  restart         Redémarrer tous les serveurs"
            echo "                  Exemple: $0 restart"
            echo "                  • Équivalent à: $0 stop && $0 start"
            echo "                  • Utile après modification du code"
            echo ""
            echo "  status          Voir l'état des serveurs (démarrés/arrêtés)"
            echo "                  Exemple: $0 status"
            echo "                  • Affiche les PIDs des processus"
            echo "                  • Indique les URLs d'accès"
            echo ""
            echo "  logs            Voir les logs combinés (backend + frontend)"
            echo "                  Exemple: $0 logs"
            echo "                  • Affiche les logs des deux services en alternance"
            echo "                  • Note: Utilisez Ctrl+C pour quitter"
            echo ""
            echo "  logs-backend    Voir uniquement les logs du backend"
            echo "                  Exemple: $0 logs-backend"
            echo "                  • Utile pour déboguer les erreurs API"
            echo "                  • Note: Utilisez Ctrl+C pour quitter"
            echo ""
            echo "  logs-frontend   Voir uniquement les logs du frontend"
            echo "                  Exemple: $0 logs-frontend"
            echo "                  • Utile pour déboguer les erreurs React"
            echo "                  • Note: Utilisez Ctrl+C pour quitter"
            echo ""
            echo "  help            Afficher cette aide (ce message)"
            echo "  --help          Alias pour help"
            echo "  -h              Alias pour help"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  EXEMPLES D'UTILISATION"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "  # Démarrer l'application complète"
            echo "  $0 start"
            echo ""
            echo "  # Vérifier le statut des serveurs"
            echo "  $0 status"
            echo ""
            echo "  # Voir les logs backend en temps réel (dans un terminal séparé)"
            echo "  $0 logs-backend"
            echo ""
            echo "  # Voir les logs frontend en temps réel"
            echo "  $0 logs-frontend"
            echo ""
            echo "  # Redémarrer après modification du code"
            echo "  $0 restart"
            echo ""
            echo "  # Arrêter proprement tous les serveurs"
            echo "  $0 stop"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  FICHIERS ET RÉPERTOIRES"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "  Logs Backend :  $BACKEND_LOG"
            echo "  Logs Frontend: $FRONTEND_LOG"
            echo "  PID Backend :  $BACKEND_PID_FILE"
            echo "  PID Frontend: $FRONTEND_PID_FILE"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  URLS D'ACCÈS"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "  Frontend: http://localhost:3000"
            echo "  Backend : http://localhost:5010"
            echo "  Health  : http://localhost:5010/health"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo "  NOTES IMPORTANTES"
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            echo "  • Le script vérifie automatiquement si les serveurs sont déjà en cours"
            echo "  • Les logs sont accessibles en temps réel avec tail -f"
            echo "  • Utilisez Ctrl+C pour quitter la visualisation des logs"
            echo "  • Le script gère automatiquement les ports (3000/5010)"
            echo "  • Le fichier .env doit être configuré pour le backend"
            echo ""
            echo "═══════════════════════════════════════════════════════════"
            echo ""
            exit 0
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|logs-backend|logs-frontend|help}"
            echo ""
            echo "Commandes disponibles :"
            echo "  start          Démarrer frontend + backend"
            echo "  stop           Arrêter tout"
            echo "  restart        Redémarrer tout"
            echo "  status         Voir l'état des serveurs"
            echo "  logs           Voir les logs combinés (backend + frontend)"
            echo "  logs-backend   Voir les logs du backend uniquement"
            echo "  logs-frontend  Voir les logs du frontend uniquement"
            echo "  help           Afficher l'aide détaillée avec exemples"
            echo ""
            echo "Exemple: $0 start"
            echo "Pour plus d'aide: $0 help"
            exit 1
            ;;
    esac
}

main "$@"

