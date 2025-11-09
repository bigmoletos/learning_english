#!/bin/bash
# Script de démarrage du système de monitoring
# @version 1.0.0
# @date 2025-11-05

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🚀 Démarrage du système de monitoring - AI English Trainer"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Vérifier que le backend est démarré
echo "🔍 Vérification du backend..."
if ! curl -s http://localhost:5010/health > /dev/null 2>&1; then
    echo "⚠️  Le backend n'est pas accessible sur http://localhost:5010"
    echo "   Veuillez démarrer le backend d'abord :"
    echo "   cd backend && npm start"
    echo ""
    read -p "Continuer quand même ? (o/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        exit 1
    fi
else
    echo "✅ Backend accessible"
fi

# Créer les dossiers nécessaires
echo ""
echo "📁 Création des dossiers nécessaires..."
mkdir -p logs
mkdir -p monitoring/prometheus/rules
mkdir -p monitoring/alertmanager
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards

# Démarrer les services
echo ""
echo "🐳 Démarrage des services Docker..."
docker-compose -f docker-compose.monitoring.yml up -d

# Attendre que les services soient prêts
echo ""
echo "⏳ Attente du démarrage des services..."
sleep 5

# Vérifier l'état des services
echo ""
echo "🔍 Vérification de l'état des services..."

check_service() {
    if docker ps | grep -q "$1"; then
        echo "✅ $1 démarré"
    else
        echo "❌ $1 non démarré"
    fi
}

check_service learning_english_prometheus
check_service learning_english_grafana
check_service learning_english_alertmanager
check_service learning_english_node_exporter

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Système de monitoring démarré !"
echo ""
echo "📍 URLs disponibles :"
echo "   - Prometheus  : http://localhost:9090"
echo "   - Grafana     : http://localhost:3001 (admin/admin)"
echo "   - Alertmanager: http://localhost:9093"
echo "   - Backend     : http://localhost:5010/metrics"
echo ""
echo "📊 Dashboards Grafana :"
echo "   - Application : Application - Métriques Backend"
echo "   - Base de données : Base de Données - Métriques SQLite"
echo "   - Système : Système - Métriques Performance"
echo ""
echo "📝 Documentation complète : voir MONITORING.md"
echo "═══════════════════════════════════════════════════════════"




