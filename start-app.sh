#!/bin/bash

##############################################
# Script de démarrage/redémarrage automatique
# AI English Trainer
# Usage: ./start-app.sh [restart]
##############################################

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="/media/franck/M2_2To_990_windows/programmation/learning_english"

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour arrêter le serveur
stop_server() {
    log_info "Arrêt du serveur React..."
    pkill -f "react-scripts" 2>/dev/null
    
    # Attendre que les processus se terminent
    sleep 3
    
    # Vérifier s'il reste des processus
    if pgrep -f "react-scripts" > /dev/null; then
        log_warning "Forçage de l'arrêt..."
        pkill -9 -f "react-scripts"
        sleep 2
    fi
    
    log_success "Serveur arrêté"
}

# Fonction pour démarrer le serveur
start_server() {
    log_info "Démarrage du serveur React..."
    
    # Aller dans le répertoire du projet
    cd "$PROJECT_DIR" || {
        log_error "Impossible d'accéder au répertoire $PROJECT_DIR"
        exit 1
    }
    
    # Vérifier que npm est installé
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Démarrer le serveur
    log_info "Lancement de npm start..."
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  Serveur en cours de démarrage...${NC}"
    echo -e "${GREEN}  URL: http://localhost:3000${NC}"
    echo -e "${GREEN}  Appuyez sur Ctrl+C pour arrêter${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    
    npm start
}

# Fonction pour vérifier l'état du serveur
check_status() {
    if pgrep -f "react-scripts" > /dev/null; then
        log_success "Le serveur est en cours d'exécution"
        echo ""
        echo "URL: http://localhost:3000"
        echo ""
        # Afficher les processus
        ps aux | grep -E "react-scripts" | grep -v grep
    else
        log_warning "Le serveur n'est pas en cours d'exécution"
    fi
}

# Fonction principale
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   AI English Trainer - Start Script   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    case "$1" in
        restart)
            log_info "Mode: REDÉMARRAGE"
            stop_server
            start_server
            ;;
        stop)
            log_info "Mode: ARRÊT"
            stop_server
            ;;
        logs)
            log_info "Mode: LOGS EN TEMPS RÉEL"
            if [ ! -f "/tmp/react_app.log" ]; then
                log_error "Fichier de log introuvable: /tmp/react_app.log"
                log_info "Le serveur doit être lancé en arrière-plan pour avoir des logs"
                exit 1
            fi
            echo ""
            echo -e "${GREEN}═══════════════════════════════════════${NC}"
            echo -e "${GREEN}  Logs en temps réel (Ctrl+C pour quitter)${NC}"
            echo -e "${GREEN}═══════════════════════════════════════${NC}"
            echo ""
            tail -f /tmp/react_app.log
            ;;
        status)
            log_info "Mode: STATUT"
            check_status
            ;;
        help|--help|-h)
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${BLUE}  Script de Démarrage Frontend - AI English Trainer${NC}"
            echo -e "${BLUE}  Version 1.0.0${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "Usage: $0 [COMMANDE]"
            echo ""
            echo "Commandes disponibles :"
            echo ""
            echo -e "${GREEN}  start${NC}           Démarrer le serveur React (port 3000)"
            echo "                  Exemple: $0 start"
            echo "                  Note: Si un serveur est déjà en cours, vous sera demandé"
            echo "                        si vous voulez le redémarrer"
            echo ""
            echo -e "${GREEN}  restart${NC}         Redémarrer le serveur React"
            echo "                  Exemple: $0 restart"
            echo ""
            echo -e "${GREEN}  stop${NC}            Arrêter le serveur React"
            echo "                  Exemple: $0 stop"
            echo ""
            echo -e "${GREEN}  status${NC}          Vérifier si le serveur est en cours d'exécution"
            echo "                  Exemple: $0 status"
            echo ""
            echo -e "${GREEN}  logs${NC}            Voir les logs en temps réel"
            echo "                  Exemple: $0 logs"
            echo "                  Note: Utilisez Ctrl+C pour quitter"
            echo "                  Note: Nécessite que le serveur soit lancé en arrière-plan"
            echo ""
            echo -e "${GREEN}  help${NC}            Afficher cette aide"
            echo -e "${GREEN}  --help${NC}          Alias pour help"
            echo -e "${GREEN}  -h${NC}              Alias pour help"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "Exemples d'utilisation :"
            echo ""
            echo "  # Démarrer le frontend"
            echo "  $0 start"
            echo ""
            echo "  # Démarrer (sans argument = start par défaut)"
            echo "  $0"
            echo ""
            echo "  # Redémarrer le serveur"
            echo "  $0 restart"
            echo ""
            echo "  # Vérifier le statut"
            echo "  $0 status"
            echo ""
            echo "  # Voir les logs en temps réel"
            echo "  $0 logs"
            echo ""
            echo "  # Arrêter le serveur"
            echo "  $0 stop"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "Fichiers :"
            echo "  Logs : /tmp/react_app.log"
            echo ""
            echo "URL :"
            echo "  Frontend: http://localhost:3000"
            echo ""
            echo "Note :"
            echo "  Ce script démarre uniquement le FRONTEND."
            echo "  Pour démarrer frontend + backend ensemble, utilisez :"
            echo "  ./start_frontend_backend.sh start"
            echo ""
            exit 0
            ;;
        *)
            # Vérifier si c'est une demande d'aide ou aucun argument
            if [[ "$1" == "" ]] || [[ "$1" == "help" ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
                # Si aucun argument ou argument invalide, vérifier si serveur en cours
                if pgrep -f "react-scripts" > /dev/null; then
                    log_warning "Un serveur est déjà en cours d'exécution"
                    echo ""
                    read -p "Voulez-vous le redémarrer? (o/N) " -n 1 -r
                    echo ""
                    if [[ $REPLY =~ ^[Oo]$ ]]; then
                        stop_server
                        start_server
                    else
                        log_info "Opération annulée"
                        exit 0
                    fi
                else
                    log_info "Mode: DÉMARRAGE (par défaut)"
                    start_server
                fi
            else
                log_error "Argument inconnu: $1"
                echo ""
                echo "Usage: $0 {start|restart|stop|status|logs|help}"
                echo ""
                echo "Commandes disponibles :"
                echo "  start          Démarrer le serveur React"
                echo "  restart        Redémarrer le serveur"
                echo "  stop           Arrêter le serveur"
                echo "  status         Vérifier le statut"
                echo "  logs           Voir les logs en temps réel"
                echo "  help           Afficher l'aide détaillée"
                echo ""
                echo "Exemple: $0 start"
                echo "Pour plus d'aide: $0 help"
                exit 1
            fi
            ;;
    esac
}

# Exécuter le script
main "$@"

