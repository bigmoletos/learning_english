#!/bin/bash

# Script pour installer Infisical CLI sur Linux
# Usage: ./setup-cli.sh

set -e

echo "🔐 Installation d'Infisical CLI pour Linux"
echo "==========================================="

# Détecter la distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "❌ Impossible de détecter la distribution Linux"
    exit 1
fi

echo ""
echo "📦 Détection de la distribution: $OS $VER"

# Installation selon la distribution
case $OS in
    ubuntu|debian)
        echo ""
        echo "📥 Installation via APT..."

        # Ajouter la clé GPG
        curl -fsSL https://github.com/Infisical/infisical/releases/download/v0.14.0/infisical_0.14.0_linux_amd64.deb -o /tmp/infisical.deb

        # Installer
        sudo dpkg -i /tmp/infisical.deb || sudo apt-get install -f -y

        # Nettoyer
        rm /tmp/infisical.deb
        ;;

    fedora|rhel|centos)
        echo ""
        echo "📥 Installation via RPM..."

        # Télécharger le RPM
        curl -fsSL https://github.com/Infisical/infisical/releases/download/v0.14.0/infisical_0.14.0_linux_amd64.rpm -o /tmp/infisical.rpm

        # Installer
        sudo rpm -i /tmp/infisical.rpm

        # Nettoyer
        rm /tmp/infisical.rpm
        ;;

    *)
        echo ""
        echo "📥 Installation via binaire..."

        # Télécharger le binaire
        curl -fsSL https://github.com/Infisical/infisical/releases/download/v0.14.0/infisical_0.14.0_linux_amd64.tar.gz -o /tmp/infisical.tar.gz

        # Extraire
        tar -xzf /tmp/infisical.tar.gz -C /tmp

        # Installer dans /usr/local/bin
        sudo mv /tmp/infisical /usr/local/bin/infisical
        sudo chmod +x /usr/local/bin/infisical

        # Nettoyer
        rm /tmp/infisical.tar.gz
        ;;
esac

# Vérifier l'installation
echo ""
echo "🔍 Vérification de l'installation..."
if command -v infisical &> /dev/null; then
    INFISICAL_VERSION=$(infisical --version)
    echo "✅ Infisical CLI installé avec succès"
    echo "   Version: $INFISICAL_VERSION"
else
    echo "❌ Erreur: Infisical CLI non trouvé dans le PATH"
    exit 1
fi

# Configuration
echo ""
echo "⚙️  Configuration d'Infisical..."
echo ""
echo "Pour configurer Infisical, vous devez:"
echo "1. Vous connecter à votre serveur Infisical:"
echo "   infisical login"
echo ""
echo "2. Configurer votre projet:"
echo "   infisical init"
echo ""
echo "3. Vérifier votre configuration:"
echo "   infisical status"
echo ""

# Demander si l'utilisateur veut configurer maintenant
read -p "Voulez-vous configurer Infisical maintenant ? (o/n): " CONFIGURE_NOW
if [ "$CONFIGURE_NOW" = "o" ]; then
    echo ""
    echo "🔗 Connexion à Infisical..."
    infisical login

    echo ""
    echo "📁 Initialisation du projet..."
    infisical init

    echo ""
    echo "✅ Configuration terminée !"
else
    echo "⚠️  Configuration à faire manuellement plus tard"
fi

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📝 Commandes utiles:"
echo "   infisical secrets set KEY value --project=PROJECT --env=ENV"
echo "   infisical secrets get KEY --project=PROJECT --env=ENV"
echo "   infisical secrets list --project=PROJECT --env=ENV"
echo ""

