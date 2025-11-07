#!/bin/bash

# Script de configuration du firewall pour le bastion
# Usage: ./firewall-rules.sh

set -e

echo "🔥 Configuration du Firewall pour le Bastion"
echo "============================================="

# Vérifier les permissions root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

# Vérifier si UFW est installé
if ! command -v ufw &> /dev/null; then
    echo "📦 Installation de UFW..."
    apt-get update
    apt-get install -y ufw
fi

# Réinitialiser UFW (optionnel - commenté par sécurité)
# echo "⚠️  ATTENTION: Ceci va réinitialiser UFW. Continuer ? (o/n)"
# read -p "> " CONFIRM
# if [ "$CONFIRM" != "o" ]; then
#     echo "Annulé."
#     exit 0
# fi
# ufw --force reset

# Règles par défaut
echo ""
echo "📋 Configuration des règles par défaut..."
ufw default deny incoming
ufw default allow outgoing

# SSH (port 22) - IMPORTANT: Ne pas bloquer votre accès !
echo ""
echo "🔐 Configuration SSH..."
read -p "Autoriser SSH depuis toutes les IPs ? (o/n): " ALLOW_SSH_ALL
if [ "$ALLOW_SSH_ALL" = "o" ]; then
    ufw allow 22/tcp
    echo "✅ SSH autorisé depuis toutes les IPs"
else
    read -p "Entrez votre IP publique pour SSH: " SSH_IP
    ufw allow from $SSH_IP to any port 22 proto tcp
    echo "✅ SSH autorisé uniquement depuis $SSH_IP"
fi

# HTTP/HTTPS
echo ""
echo "🌐 Configuration HTTP/HTTPS..."
ufw allow 80/tcp
ufw allow 443/tcp
echo "✅ HTTP/HTTPS autorisés"

# Ports Infisical (si accès direct nécessaire)
echo ""
read -p "Autoriser l'accès direct au port 8080 Infisical ? (o/n): " ALLOW_8080
if [ "$ALLOW_8080" = "o" ]; then
    read -p "Autoriser depuis toutes les IPs ? (o/n): " ALLOW_8080_ALL
    if [ "$ALLOW_8080_ALL" = "o" ]; then
        ufw allow 8080/tcp
        echo "✅ Port 8080 autorisé depuis toutes les IPs"
    else
        read -p "Entrez l'IP autorisée pour le port 8080: " IP_8080
        ufw allow from $IP_8080 to any port 8080 proto tcp
        echo "✅ Port 8080 autorisé depuis $IP_8080"
    fi
else
    echo "⚠️  Port 8080 non autorisé (recommandé: accès via bastion uniquement)"
fi

# Rate limiting (via fail2ban)
echo ""
read -p "Installer fail2ban pour protection contre les attaques brute-force ? (o/n): " INSTALL_FAIL2BAN
if [ "$INSTALL_FAIL2BAN" = "o" ]; then
    apt-get update
    apt-get install -y fail2ban

    # Configuration fail2ban pour SSH
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    echo "✅ Fail2ban installé et configuré"
fi

# Activer UFW
echo ""
echo "🚀 Activation du firewall..."
ufw --force enable

# Afficher le statut
echo ""
echo "📊 Statut du firewall:"
ufw status verbose

echo ""
echo "✅ Configuration du firewall terminée !"
echo ""
echo "📝 Commandes utiles:"
echo "  - Voir les règles: ufw status verbose"
echo "  - Voir les logs: tail -f /var/log/ufw.log"
echo "  - Désactiver temporairement: ufw disable"
echo "  - Réactiver: ufw enable"
echo ""

