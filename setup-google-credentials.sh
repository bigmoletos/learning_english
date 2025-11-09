#!/bin/bash

# Script pour configurer les credentials Google Cloud TTS
# Usage: ./setup-google-credentials.sh path/to/downloaded/file.json

if [ $# -eq 0 ]; then
    echo "Usage: $0 path/to/downloaded/google-service-account.json"
    echo ""
    echo "Exemple:"
    echo "  $0 ~/Downloads/learning-english-477713-abc123.json"
    exit 1
fi

DOWNLOADED_FILE="$1"
PROJECT_DIR="/mnt/c/programmation/learning_english"
CREDENTIALS_DIR="$PROJECT_DIR/backend/credentials"
TARGET_FILE="$CREDENTIALS_DIR/google-tts-service-account.json"

# Vérifier que le fichier source existe
if [ ! -f "$DOWNLOADED_FILE" ]; then
    echo "❌ Erreur: Le fichier $DOWNLOADED_FILE n'existe pas"
    exit 1
fi

# Créer le dossier credentials
echo "📁 Création du dossier credentials..."
mkdir -p "$CREDENTIALS_DIR"

# Copier le fichier
echo "📋 Copie du fichier JSON..."
cp "$DOWNLOADED_FILE" "$TARGET_FILE"

# Vérifier que la copie a réussi
if [ -f "$TARGET_FILE" ]; then
    echo "✅ Fichier copié avec succès vers: $TARGET_FILE"

    # Extraire les informations du JSON
    PROJECT_ID=$(grep -o '"project_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$TARGET_FILE" | cut -d'"' -f4)
    CLIENT_EMAIL=$(grep -o '"client_email"[[:space:]]*:[[:space:]]*"[^"]*"' "$TARGET_FILE" | cut -d'"' -f4)

    echo ""
    echo "📊 Informations extraites:"
    echo "   Project ID: $PROJECT_ID"
    echo "   Client Email: $CLIENT_EMAIL"
    echo ""

    # Mettre à jour le .env
    ENV_FILE="$PROJECT_DIR/.env"

    if [ -f "$ENV_FILE" ]; then
        echo "📝 Mise à jour du fichier .env..."

        # Créer une sauvegarde
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

        # Mettre à jour ou ajouter GOOGLE_APPLICATION_CREDENTIALS
        if grep -q "^GOOGLE_APPLICATION_CREDENTIALS=" "$ENV_FILE"; then
            sed -i "s|^GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=$TARGET_FILE|" "$ENV_FILE"
            echo "   ✅ GOOGLE_APPLICATION_CREDENTIALS mis à jour"
        else
            echo "" >> "$ENV_FILE"
            echo "# Google Cloud Text-to-Speech Service Account" >> "$ENV_FILE"
            echo "GOOGLE_APPLICATION_CREDENTIALS=$TARGET_FILE" >> "$ENV_FILE"
            echo "   ✅ GOOGLE_APPLICATION_CREDENTIALS ajouté"
        fi

        # Commenter les anciennes variables si elles existent
        sed -i 's/^GOOGLE_CLOUD_PROJECT_ID=/# GOOGLE_CLOUD_PROJECT_ID=/' "$ENV_FILE"
        sed -i 's/^GOOGLE_CLOUD_CLIENT_EMAIL=/# GOOGLE_CLOUD_CLIENT_EMAIL=/' "$ENV_FILE"
        sed -i 's/^GOOGLE_CLOUD_PRIVATE_KEY=/# GOOGLE_CLOUD_PRIVATE_KEY=/' "$ENV_FILE"

        echo "   ✅ Anciennes variables commentées"
    fi

    # Ajouter au .gitignore
    GITIGNORE_FILE="$PROJECT_DIR/.gitignore"
    if [ -f "$GITIGNORE_FILE" ]; then
        if ! grep -q "backend/credentials/" "$GITIGNORE_FILE"; then
            echo "" >> "$GITIGNORE_FILE"
            echo "# Google Cloud credentials" >> "$GITIGNORE_FILE"
            echo "backend/credentials/" >> "$GITIGNORE_FILE"
            echo "✅ Ajouté au .gitignore"
        else
            echo "✅ Déjà présent dans .gitignore"
        fi
    fi

    echo ""
    echo "═══════════════════════════════════════"
    echo "  ✅ Configuration terminée !"
    echo "═══════════════════════════════════════"
    echo ""
    echo "📌 Prochaines étapes:"
    echo "   1. Redémarrer le backend:"
    echo "      bash ./start_frontend_backend.sh restart"
    echo ""
    echo "   2. Tester l'API:"
    echo "      curl http://localhost:5010/api/text-to-speech/voices?lang=en-US"
    echo ""

else
    echo "❌ Erreur lors de la copie du fichier"
    exit 1
fi
