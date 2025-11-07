#!/bin/bash

# Script de configuration du bastion Nginx
# Usage: ./setup.sh

set -e

echo "🔐 Configuration du Bastion Nginx pour Infisical"
echo "================================================"

# Vérifier les permissions root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

# Variables
NGINX_CONF="/etc/nginx/sites-available/infisical-bastion"
NGINX_ENABLED="/etc/nginx/sites-enabled/infisical-bastion"
HTPASSWD_FILE="/etc/nginx/.htpasswd"
SSL_DIR="/etc/letsencrypt/live/infisical.example.com"
DOMAIN="infisical.example.com"

echo ""
echo "📝 Configuration du domaine"
read -p "Entrez votre domaine (ex: infisical.example.com): " DOMAIN_INPUT
if [ ! -z "$DOMAIN_INPUT" ]; then
    DOMAIN=$DOMAIN_INPUT
fi

# Copier la configuration Nginx
echo ""
echo "📋 Installation de la configuration Nginx..."
cp nginx.conf "$NGINX_CONF"

# Remplacer le domaine dans la configuration
sed -i "s/infisical.example.com/$DOMAIN/g" "$NGINX_CONF"

# Créer le lien symbolique
if [ -f "$NGINX_ENABLED" ]; then
    rm "$NGINX_ENABLED"
fi
ln -s "$NGINX_CONF" "$NGINX_ENABLED"

# Créer le fichier .htpasswd
echo ""
echo "👤 Configuration de l'authentification basique..."
if [ ! -f "$HTPASSWD_FILE" ]; then
    echo "Création du fichier .htpasswd..."
    read -p "Nom d'utilisateur: " USERNAME
    htpasswd -c "$HTPASSWD_FILE" "$USERNAME"
    echo "✅ Fichier .htpasswd créé"
else
    echo "Le fichier .htpasswd existe déjà."
    read -p "Voulez-vous ajouter un utilisateur ? (o/n): " ADD_USER
    if [ "$ADD_USER" = "o" ]; then
        read -p "Nom d'utilisateur: " USERNAME
        htpasswd "$HTPASSWD_FILE" "$USERNAME"
    fi
fi

# Configuration SSL avec Let's Encrypt
echo ""
echo "🔒 Configuration SSL avec Let's Encrypt..."
if [ ! -d "$SSL_DIR" ]; then
    echo "Installation de Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx

    echo "Génération du certificat SSL..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect
    echo "✅ Certificat SSL généré"
else
    echo "✅ Certificat SSL existe déjà"
fi

# Configuration du firewall
echo ""
echo "🔥 Configuration du firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo "✅ Firewall configuré"
else
    echo "⚠️  UFW non installé. Configurez votre firewall manuellement."
fi

# Test de la configuration Nginx
echo ""
echo "🧪 Test de la configuration Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Configuration Nginx valide"
    systemctl reload nginx
    echo "✅ Nginx rechargé"
else
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi

# Configuration de la rotation automatique des certificats
echo ""
echo "🔄 Configuration de la rotation automatique des certificats..."
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet --nginx") | crontab -
echo "✅ Rotation automatique configurée"

echo ""
echo "✅ Configuration du bastion terminée !"
echo ""
echo "📝 Informations importantes:"
echo "  - Domaine: https://$DOMAIN"
echo "  - Fichier .htpasswd: $HTPASSWD_FILE"
echo "  - Configuration Nginx: $NGINX_CONF"
echo ""
echo "🔐 Pour ajouter un utilisateur:"
echo "  htpasswd $HTPASSWD_FILE nom_utilisateur"
echo ""

