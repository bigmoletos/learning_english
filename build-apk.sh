#!/bin/bash

# ============================================
# Script de Build APK pour Android
# ============================================
# Ce script automatise la reconstruction complète de l'APK Android
# Compatible avec WSL (Windows Subsystem for Linux)
# Usage: ./build-apk.sh [options]
#
# Options:
#   --skip-build    : Ignore le build React (si déjà fait)
#   --skip-sync     : Ignore la synchronisation Capacitor (si déjà fait)
#   --open-studio   : Ouvre Android Studio après la synchronisation
#   --install       : Installe l'APK sur l'appareil connecté via ADB
#   --help          : Affiche cette aide
# ============================================

set -e  # Arrêter en cas d'erreur

# Détection WSL
if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    IS_WSL=true
else
    IS_WSL=false
fi

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
SKIP_BUILD=false
SKIP_SYNC=false
OPEN_STUDIO=false
INSTALL_APK=false

# Fonction d'aide
show_help() {
    echo -e "${BLUE}Usage: ./build-apk.sh [options]${NC}"
    echo ""
    echo "Options:"
    echo "  --skip-build    Ignore le build React (si déjà fait)"
    echo "  --skip-sync     Ignore la synchronisation Capacitor (si déjà fait)"
    echo "  --open-studio   Ouvre Android Studio après la synchronisation"
    echo "  --install       Installe l'APK sur l'appareil connecté via ADB"
    echo "  --help          Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  ./build-apk.sh                    # Build complet"
    echo "  ./build-apk.sh --open-studio      # Build et ouvre Android Studio"
    echo "  ./build-apk.sh --skip-build       # Skip le build React"
    echo "  ./build-apk.sh --install          # Build et installe sur l'appareil"
}

# Parsing des arguments
for arg in "$@"; do
    case $arg in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-sync)
            SKIP_SYNC=true
            shift
            ;;
        --open-studio)
            OPEN_STUDIO=true
            shift
            ;;
        --install)
            INSTALL_APK=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Option inconnue: $arg${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Vérification des prérequis
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"
echo -e "${BLUE}========================================${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# Vérifier Capacitor CLI
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx n'est pas disponible${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npx disponible${NC}"

# Vérifier que le dossier android existe
if [ ! -d "android" ]; then
    echo -e "${RED}❌ Le dossier android/ n'existe pas${NC}"
    echo -e "${YELLOW}💡 Exécutez d'abord: npx cap add android${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dossier android/ trouvé${NC}"

# Vérifier ADB si --install est utilisé
if [ "$INSTALL_APK" = true ]; then
    # Dans WSL, ADB peut être dans le PATH Windows
    if command -v adb &> /dev/null; then
        echo -e "${GREEN}✅ ADB disponible${NC}"
    elif [ "$IS_WSL" = true ] && command -v adb.exe &> /dev/null; then
        echo -e "${GREEN}✅ ADB disponible (via Windows)${NC}"
        # Créer un alias pour adb.exe
        alias adb="adb.exe"
    else
        echo -e "${YELLOW}⚠️  ADB n'est pas disponible. L'installation sera ignorée.${NC}"
        echo -e "${YELLOW}💡 Dans WSL, installez ADB via: sudo apt-get install android-tools-adb${NC}"
        INSTALL_APK=false
    fi
fi

echo ""

# Étape 1: Build React
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}📦 Étape 1: Build de l'application React${NC}"
    echo -e "${BLUE}========================================${NC}"

    echo -e "${YELLOW}⏳ Exécution de npm run build...${NC}"
    npm run build

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build React réussi${NC}"
    else
        echo -e "${RED}❌ Erreur lors du build React${NC}"
        exit 1
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  Étape 1 ignorée (--skip-build)${NC}"
    echo ""
fi

# Étape 2: Synchronisation Capacitor
if [ "$SKIP_SYNC" = false ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🔄 Étape 2: Synchronisation Capacitor${NC}"
    echo -e "${BLUE}========================================${NC}"

    echo -e "${YELLOW}⏳ Exécution de npx cap sync android...${NC}"
    npx cap sync android

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Synchronisation Capacitor réussie${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la synchronisation Capacitor${NC}"
        exit 1
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  Étape 2 ignorée (--skip-sync)${NC}"
    echo ""
fi

# Étape 3: Ouvrir Android Studio
if [ "$OPEN_STUDIO" = true ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🚀 Étape 3: Ouverture d'Android Studio${NC}"
    echo -e "${BLUE}========================================${NC}"

    if [ "$IS_WSL" = true ]; then
        echo -e "${YELLOW}⏳ Ouverture d'Android Studio depuis WSL...${NC}"
        # Dans WSL, utiliser cmd.exe pour ouvrir Android Studio
        if command -v cmd.exe &> /dev/null; then
            # Convertir le chemin WSL en chemin Windows
            WIN_PATH=$(wslpath -w "$(pwd)/android" 2>/dev/null || echo "$(pwd)/android")
            cmd.exe /c start "" "$WIN_PATH" 2>/dev/null || {
                echo -e "${YELLOW}⚠️  Impossible d'ouvrir automatiquement Android Studio depuis WSL${NC}"
                echo -e "${YELLOW}💡 Ouvrez manuellement Android Studio et chargez le dossier:${NC}"
                echo -e "${YELLOW}   $(pwd)/android${NC}"
            }
        else
            echo -e "${YELLOW}⚠️  cmd.exe non disponible. Ouvrez manuellement Android Studio${NC}"
            echo -e "${YELLOW}💡 Chemin du projet: $(pwd)/android${NC}"
        fi
    else
        echo -e "${YELLOW}⏳ Ouverture d'Android Studio...${NC}"
        npx cap open android
    fi

    if [ $? -eq 0 ] || [ "$IS_WSL" = true ]; then
        echo -e "${GREEN}✅ Android Studio ouvert${NC}"
        echo -e "${YELLOW}💡 Dans Android Studio:${NC}"
        echo -e "${YELLOW}   1. Attendez la synchronisation Gradle${NC}"
        echo -e "${YELLOW}   2. Build → Build Bundle(s) / APK(s) → Build APK(s)${NC}"
        if [ "$IS_WSL" = true ]; then
            echo -e "${YELLOW}   3. L'APK sera dans: $(pwd)/android/app/build/outputs/apk/debug/app-debug.apk${NC}"
        else
            echo -e "${YELLOW}   3. L'APK sera dans: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
        fi
    else
        echo -e "${RED}❌ Erreur lors de l'ouverture d'Android Studio${NC}"
        echo -e "${YELLOW}💡 Ouvrez manuellement Android Studio et chargez le dossier android/${NC}"
    fi
    echo ""
fi

# Étape 4: Build de l'APK via Gradle
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔨 Étape 4: Build de l'APK via Gradle${NC}"
echo -e "${BLUE}========================================${NC}"

# Vérifier si Gradle est disponible
if [ -f "android/gradlew" ]; then
    echo -e "${YELLOW}⏳ Construction de l'APK via Gradle...${NC}"
    cd android

    # Rendre gradlew exécutable si nécessaire
    chmod +x gradlew 2>/dev/null || true

    # Construire l'APK debug
    if [ "$IS_WSL" = true ]; then
        # Dans WSL, convertir le chemin et utiliser gradlew.bat via Windows
        if command -v cmd.exe &> /dev/null && [ -f "gradlew.bat" ]; then
            echo -e "${YELLOW}   Utilisation de Gradle via Windows (WSL)...${NC}"
            WIN_ANDROID_PATH=$(wslpath -w "$(pwd)" 2>/dev/null || echo "$(pwd)")
            cmd.exe /c "cd /d \"$WIN_ANDROID_PATH\" && gradlew.bat assembleDebug" || {
                echo -e "${YELLOW}   Tentative avec gradlew directement...${NC}"
                bash gradlew assembleDebug
            }
        else
            # Essayer avec gradlew directement
            echo -e "${YELLOW}   Utilisation de Gradle directement...${NC}"
            bash gradlew assembleDebug
        fi
    else
        ./gradlew assembleDebug
    fi

    cd ..

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ APK construit avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la construction de l'APK${NC}"
        echo -e "${YELLOW}💡 Vous pouvez construire manuellement dans Android Studio${NC}"
        echo -e "${YELLOW}   Menu → Build → Build Bundle(s) / APK(s) → Build APK(s)${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  Gradle wrapper non trouvé${NC}"
    echo -e "${YELLOW}💡 Option A: Build dans Android Studio (recommandé)${NC}"
    echo -e "${YELLOW}   Menu → Build → Build Bundle(s) / APK(s) → Build APK(s)${NC}"
    echo ""
    echo -e "${YELLOW}💡 Option B: Build via ligne de commande${NC}"
    echo -e "${YELLOW}   cd android && ./gradlew assembleDebug${NC}"
    echo ""
fi

# Vérifier si l'APK existe déjà
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${GREEN}✅ APK existant trouvé: $APK_PATH (${APK_SIZE})${NC}"

    if [ "$INSTALL_APK" = true ]; then
        echo ""
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}📱 Installation de l'APK sur l'appareil${NC}"
        echo -e "${BLUE}========================================${NC}"

        # Utiliser adb.exe dans WSL si nécessaire
        ADB_CMD="adb"
        if [ "$IS_WSL" = true ] && ! command -v adb &> /dev/null && command -v adb.exe &> /dev/null; then
            ADB_CMD="adb.exe"
        fi

        # Vérifier qu'un appareil est connecté
        DEVICE_COUNT=$($ADB_CMD devices 2>/dev/null | grep -v "List" | grep "device" | wc -l)
        if [ "$DEVICE_COUNT" -eq 0 ]; then
            echo -e "${RED}❌ Aucun appareil Android connecté${NC}"
            echo -e "${YELLOW}💡 Connectez votre appareil via USB et activez le débogage USB${NC}"
            if [ "$IS_WSL" = true ]; then
                echo -e "${YELLOW}💡 Dans WSL, assurez-vous que ADB est accessible depuis Windows${NC}"
            fi
            exit 1
        fi

        echo -e "${GREEN}✅ Appareil(s) connecté(s): $DEVICE_COUNT${NC}"
        echo -e "${YELLOW}⏳ Installation de l'APK...${NC}"

        $ADB_CMD install -r "$APK_PATH"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ APK installé avec succès${NC}"
        else
            echo -e "${RED}❌ Erreur lors de l'installation de l'APK${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️  APK non trouvé. Vous devez le construire dans Android Studio ou via Gradle.${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Processus terminé !${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📱 Emplacement de l'APK:${NC}"
echo -e "   $APK_PATH"
echo ""
echo -e "${YELLOW}💡 Commandes utiles:${NC}"
echo -e "   - Installer l'APK: adb install -r $APK_PATH"
echo -e "   - Voir les logs: adb logcat | grep -i 'learning_english'"
echo -e "   - Ouvrir Android Studio: npx cap open android"
echo ""

