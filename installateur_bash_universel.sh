#!/bin/bash
set -euo pipefail

# ============================================
# Script d'Installation Universel - Ubuntu 24.04
# Version: 1.0.0
# Date: 31 octobre 2025
# ============================================

# Définir les couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Variables globales
TEMP_DIR=$(mktemp -d)
WINE_PREFIX_DIR="/opt/wineprefix"
APPIMAGE_DIR="/opt/appimages"
DESKTOP_DIR="$HOME/.local/share/applications"
CLEANUP_ON_EXIT=true

# Base de données des paquets spéciaux
declare -A SPECIAL_PACKAGES=(
  ["anycubic-slicer"]="wine|https://github.com/ANYCUBIC-3D/AnycubicSlicer/releases/download/v2.5.3/AnycubicSlicer_2.5.3.exe"
  ["prusa-slicer"]="appimage|https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.8.1/PrusaSlicer-2.8.1+linux-x64-newer-distros-GTK3-202409181416.AppImage"
)

# Fonction de nettoyage à la sortie
cleanup() {
  if [ "$CLEANUP_ON_EXIT" = true ]; then
    rm -rf "$TEMP_DIR" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ============================================
# Fonctions d'affichage
# ============================================

display_message() {
  local color=$1
  shift
  echo -e "${color}${*}${NC}"
}

display_step() {
  display_message "$BLUE" "ℹ $*"
}

display_success() {
  display_message "$GREEN" "✅ $*"
}

display_error() {
  display_message "$RED" "❌ $*"
}

display_warning() {
  display_message "$YELLOW" "⚠ $*"
}

display_info() {
  display_message "$MAGENTA" "ℹ $*"
}

# ============================================
# Fonctions de vérification
# ============================================

check_root() {
  if [ "$(id -u)" -ne 0 ]; then
    display_error "Ce script doit être exécuté en tant que root (utilisez sudo)"
    exit 1
  fi
}

check_dependencies() {
  local missing=()
  for dep in "$@"; do
    if ! command -v "$dep" &>/dev/null; then
      missing+=("$dep")
    fi
  done

  if [ ${#missing[@]} -gt 0 ]; then
    display_warning "Installation des dépendances manquantes: ${missing[*]}"
    apt update -qq >/dev/null 2>&1 || true
    apt install -y "${missing[@]}" >/dev/null 2>&1 || {
      display_error "Impossible d'installer les dépendances: ${missing[*]}"
      return 1
    }
    display_success "Dépendances installées: ${missing[*]}"
  fi
}

verify_url() {
  local url=$1
  if ! curl -s --head --fail "$url" >/dev/null 2>&1; then
    display_error "URL invalide ou inaccessible: $url"
    return 1
  fi
  return 0
}

get_file_size() {
  local url=$1
  local size=$(curl -s --head "$url" | grep -i "content-length" | awk '{print $2}' | tr -d '\r')
  if [ -z "$size" ]; then
    echo "Taille inconnue"
  else
    local size_mb=$(echo "scale=2; $size / 1024 / 1024" | bc 2>/dev/null || echo "calcul...")
    echo "${size_mb} MB"
  fi
}

# ============================================
# Fonctions d'installation APT
# ============================================

update_apt() {
  display_step "Mise à jour des paquets APT..."
  if apt update -qq >/dev/null 2>&1; then
    display_success "Mise à jour des paquets terminée"
  else
    display_warning "Certains paquets n'ont pas pu être mis à jour"
  fi
}

check_package_installed() {
  local pkg=$1
  if dpkg -l "$pkg" 2>/dev/null | grep -q "^ii"; then
    local version=$(dpkg -l "$pkg" 2>/dev/null | grep "^ii" | awk '{print $3}')
    echo "$version"
    return 0
  fi
  return 1
}

install_apt_packages() {
  local packages=("$@")
  local to_install=()
  local already_installed=()

  update_apt

  for pkg in "${packages[@]}"; do
    if version=$(check_package_installed "$pkg"); then
      display_success "$pkg déjà installé (version: $version)"
      already_installed+=("$pkg")
    else
      to_install+=("$pkg")
    fi
  done

  if [ ${#to_install[@]} -eq 0 ]; then
    return 0
  fi

  display_step "Installation des paquets: ${to_install[*]}"
  
  if apt install -y "${to_install[@]}" >/dev/null 2>&1; then
    display_success "Paquets installés: ${to_install[*]}"
    return 0
  else
    display_error "Échec de l'installation des paquets: ${to_install[*]}"
    suggest_alternatives "${to_install[@]}"
    return 1
  fi
}

check_command_in_package() {
  local command=$1
  local pkg=$(dpkg -S "$command" 2>/dev/null | cut -d: -f1 | head -n 1)
  if [ -n "$pkg" ]; then
    echo "$pkg"
    return 0
  fi
  return 1
}

suggest_alternatives() {
  local packages=("$@")
  display_info "Paquets alternatifs suggérés:"
  
  for pkg in "${packages[@]}"; do
    local found=false
    
    # Vérifier si c'est une commande dans un paquet existant
    local parent_pkg=$(check_command_in_package "/sbin/$pkg" || check_command_in_package "/usr/bin/$pkg" || check_command_in_package "/usr/sbin/$pkg")
    if [ -n "$parent_pkg" ]; then
      display_info "  La commande '$pkg' fait partie du paquet: $parent_pkg"
      if ! dpkg -l "$parent_pkg" 2>/dev/null | grep -q "^ii"; then
        display_info "    → Installez: $parent_pkg"
      else
        local version=$(dpkg -l "$parent_pkg" 2>/dev/null | grep "^ii" | awk '{print $3}')
        display_info "    → Déjà installé ($parent_pkg version: $version)"
      fi
      found=true
    fi
    
    # Chercher dans apt-cache avec plusieurs stratégies
    if [ "$found" = false ]; then
      local suggestions=""
      
      # Recherche exacte
      suggestions=$(apt-cache search "^$pkg" 2>/dev/null | head -n 3)
      
      # Recherche par mot-clé si pas de résultat
      if [ -z "$suggestions" ]; then
        suggestions=$(apt-cache search "$pkg" 2>/dev/null | grep -i "$pkg" | head -n 5)
      fi
      
      # Recherche par catégorie pour certains outils
      if [ -z "$suggestions" ]; then
        case "$pkg" in
          *undelete*|*recover*|*rescue*)
            suggestions=$(apt-cache search "recovery\|testdisk\|photorec" 2>/dev/null | head -n 3)
            ;;
          *format*|*fsck*)
            suggestions=$(apt-cache search "filesystem\|disk-utilities" 2>/dev/null | head -n 3)
            ;;
        esac
      fi
      
      if [ -n "$suggestions" ]; then
        echo "$suggestions" | awk -F' - ' '{print "  - " $1}'
        found=true
      fi
    fi
    
    if [ "$found" = false ]; then
      display_warning "  Aucune alternative trouvée pour: $pkg"
      
      # Suggestions génériques par type
      case "$pkg" in
        *ntfs*)
          display_info "    Paquets NTFS disponibles:"
          apt-cache search "^ntfs-" 2>/dev/null | head -n 3 | awk -F' - ' '{print "      - " $1}'
          ;;
        *disk*|*partition*)
          display_info "    Outils de gestion de disque:"
          apt-cache search "gparted\|testdisk\|fdisk" 2>/dev/null | head -n 3 | awk -F' - ' '{print "      - " $1}'
          ;;
      esac
    fi
  done
}

# ============================================
# Fonctions d'installation Wine
# ============================================

check_wine_prefix_exists() {
  local prefix=$1
  [ -f "$prefix/system.reg" ]
}

install_wine_packages() {
  local package=$1
  local url=$2
  local wine_prefix="$WINE_PREFIX_DIR/$package"

  display_step "Installation de $package via Wine..."

  # Vérifier l'URL
  if ! verify_url "$url"; then
    return 1
  fi

  # Afficher la taille du fichier
  local file_size=$(get_file_size "$url")
  display_info "Taille du fichier: $file_size"

  mkdir -p "$wine_prefix"
  export WINEPREFIX="$wine_prefix"
  export WINEARCH=win32

  # Vérifier les dépendances
  if ! check_dependencies wine winetricks; then
    display_error "Impossible d'installer les dépendances Wine"
    return 1
  fi

  # Initialiser le prefix Wine si nécessaire
  if ! check_wine_prefix_exists "$wine_prefix"; then
    display_step "Initialisation du prefix Wine..."
    if ! wineboot -u >/dev/null 2>&1; then
      display_error "Échec de l'initialisation de Wine"
      return 1
    fi
    display_success "Prefix Wine initialisé"
  else
    display_info "Prefix Wine existant détecté"
  fi

  # Installer les dépendances Windows
  display_step "Installation des dépendances Windows (dotnet48, corefonts)..."
  if winetricks -q dotnet48 corefonts >/dev/null 2>&1; then
    display_success "Dépendances Windows installées"
  else
    display_warning "Certaines dépendances Windows n'ont pas pu être installées"
  fi

  # Télécharger le fichier
  local filename=$(basename "$url")
  local temp_file="$TEMP_DIR/$filename"
  
  display_step "Téléchargement de $package..."
  if wget --show-progress "$url" -O "$temp_file" 2>&1 | grep -E "(Length|saved)" || wget -q "$url" -O "$temp_file"; then
    display_success "Téléchargement terminé"
  else
    display_error "Échec du téléchargement"
    return 1
  fi

  # Vérifier que le fichier téléchargé est valide
  if [ ! -s "$temp_file" ]; then
    display_error "Fichier téléchargé vide ou invalide"
    return 1
  fi

  # Installer via Wine
  display_step "Installation de $package via Wine (cela peut prendre du temps)..."
  if wine "$temp_file" >/dev/null 2>&1 || wine "$temp_file"; then
    display_success "Installation réussie: $package"
    
    # Créer le raccourci desktop
    local exe_path="$wine_prefix/drive_c/Program Files/$package/$package.exe"
    if [ -f "$exe_path" ]; then
      create_desktop_shortcut "$package" "env WINEPREFIX=$wine_prefix wine start /unix \"$exe_path\""
    else
      # Chercher l'exécutable dans d'autres emplacements
      local found_exe=$(find "$wine_prefix" -name "*.exe" -type f 2>/dev/null | head -n 1)
      if [ -n "$found_exe" ]; then
        create_desktop_shortcut "$package" "env WINEPREFIX=$wine_prefix wine start /unix \"$found_exe\""
      else
        display_warning "Exécutable non trouvé, raccourci non créé"
      fi
    fi
    return 0
  else
    display_error "Échec de l'installation via Wine"
    return 1
  fi
}

# ============================================
# Fonctions d'installation AppImage
# ============================================

verify_appimage() {
  local file=$1
  if ! file "$file" 2>/dev/null | grep -qE "(ELF|AppImage)"; then
    display_error "Fichier AppImage invalide ou corrompu"
    return 1
  fi
  return 0
}

install_appimage() {
  local url=$1
  local app_name=$(basename "$url" | sed 's/\.AppImage.*//g')

  display_step "Installation de $app_name via AppImage..."

  # Vérifier l'URL
  if ! verify_url "$url"; then
    return 1
  fi

  # Afficher la taille du fichier
  local file_size=$(get_file_size "$url")
  display_info "Taille du fichier: $file_size"

  # Télécharger
  local temp_file="$TEMP_DIR/$app_name.AppImage"
  display_step "Téléchargement de $app_name..."
  
  if wget --show-progress "$url" -O "$temp_file" 2>&1 | grep -E "(Length|saved)" || wget -q "$url" -O "$temp_file"; then
    display_success "Téléchargement terminé"
  else
    display_error "Échec du téléchargement"
    return 1
  fi

  # Vérifier le fichier
  if [ ! -s "$temp_file" ]; then
    display_error "Fichier téléchargé vide ou invalide"
    return 1
  fi

  if ! verify_appimage "$temp_file"; then
    return 1
  fi

  # Installer l'AppImage
  mkdir -p "$APPIMAGE_DIR"
  if mv "$temp_file" "$APPIMAGE_DIR/$app_name.AppImage" && chmod +x "$APPIMAGE_DIR/$app_name.AppImage"; then
    display_success "Installation réussie: $app_name"
    create_desktop_shortcut "$app_name" "$APPIMAGE_DIR/$app_name.AppImage"
    return 0
  else
    display_error "Échec de l'installation de l'AppImage"
    return 1
  fi
}

# ============================================
# Fonction de création de raccourcis
# ============================================

get_icon_path() {
  local name=$1
  local icon_path="/usr/share/icons/hicolor/48x48/apps/application-x-executable.png"
  
  # Chercher une icône existante
  local possible_icons=(
    "/usr/share/pixmaps/$name.png"
    "/usr/share/icons/hicolor/48x48/apps/$name.png"
    "/usr/share/icons/hicolor/64x64/apps/$name.png"
    "/usr/share/icons/gnome/48x48/apps/$name.png"
  )
  
  for icon in "${possible_icons[@]}"; do
    if [ -f "$icon" ]; then
      echo "$icon"
      return 0
    fi
  done
  
  # Utiliser l'icône générique
  echo "$icon_path"
}

create_desktop_shortcut() {
  local name=$1
  local exec_cmd=$2
  local icon=$(get_icon_path "$name")

  mkdir -p "$DESKTOP_DIR"
  
  local desktop_file="$DESKTOP_DIR/$name.desktop"
  cat > "$desktop_file" <<EOF
[Desktop Entry]
Name=$name
Exec=$exec_cmd
Icon=$icon
Type=Application
Terminal=false
Categories=Utility;Application;
StartupNotify=true
EOF

  chmod +x "$desktop_file"
  display_success "Raccourci créé: $desktop_file"
}

# ============================================
# Fonction de nettoyage
# ============================================

clean_unused_packages() {
  display_step "Nettoyage des paquets inutiles..."
  if apt autoremove -y -qq >/dev/null 2>&1; then
    display_success "Nettoyage terminé"
  else
    display_warning "Certains paquets n'ont pas pu être nettoyés"
  fi
}

# ============================================
# Fonction principale
# ============================================

show_usage() {
  display_info "═══════════════════════════════════════════════════════════"
  display_info "  Installateur Bash Universel - Ubuntu 24.04"
  display_info "  Version 1.0.0"
  display_info "═══════════════════════════════════════════════════════════"
  echo ""
  echo "Usage: sudo $0 <paquet1> [paquet2] [...] [OPTIONS]"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  TYPES DE PAQUETS SUPPORTÉS"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo -e "${GREEN}1. Paquets APT standard${NC}"
  echo "   Description: Paquets Ubuntu/Debian standards"
  echo "   Exemples:"
  echo "     sudo $0 ntfs-3g"
  echo "     sudo $0 gparted"
  echo "     sudo $0 vim curl wget"
  echo "     sudo $0 htop tree git"
  echo ""
  echo -e "${GREEN}2. Paquets spéciaux (base de données intégrée)${NC}"
  echo "   Description: Logiciels configurés automatiquement via Wine ou AppImage"
  echo "   Paquets disponibles:"
  echo "     • anycubic-slicer  - Installation via Wine"
  echo "     • prusa-slicer     - Installation via AppImage"
  echo "   Exemples:"
  echo "     sudo $0 anycubic-slicer"
  echo "     sudo $0 prusa-slicer"
  echo ""
  echo -e "${GREEN}3. URL AppImage directe${NC}"
  echo "   Description: Installation d'AppImage depuis une URL"
  echo "   Exemples:"
  echo "     sudo $0 https://github.com/user/repo/releases/download/v1.0/app.AppImage"
  echo "     sudo $0 https://exemple.com/mon-app.AppImage"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  OPTIONS DISPONIBLES"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo -e "${YELLOW}  -h, --help${NC}           Afficher cette aide"
  echo "                  Exemple: $0 --help"
  echo ""
  echo -e "${YELLOW}  --no-cleanup${NC}        Ne pas nettoyer le répertoire temporaire"
  echo "                  Utile pour le débogage"
  echo "                  Exemple: sudo $0 ntfs-3g --no-cleanup"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  EXEMPLES D'UTILISATION COMPLETS"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo -e "${BLUE}# Installation d'un paquet APT simple${NC}"
  echo "  sudo $0 ntfs-3g"
  echo ""
  echo -e "${BLUE}# Installation de plusieurs paquets APT${NC}"
  echo "  sudo $0 ntfs-3g gparted vim curl"
  echo ""
  echo -e "${BLUE}# Installation d'un paquet spécial (Wine)${NC}"
  echo "  sudo $0 anycubic-slicer"
  echo ""
  echo -e "${BLUE}# Installation d'un paquet spécial (AppImage)${NC}"
  echo "  sudo $0 prusa-slicer"
  echo ""
  echo -e "${BLUE}# Installation depuis une URL AppImage${NC}"
  echo "  sudo $0 https://exemple.com/app.AppImage"
  echo ""
  echo -e "${BLUE}# Installation mixte (APT + spéciaux)${NC}"
  echo "  sudo $0 ntfs-3g anycubic-slicer gparted"
  echo ""
  echo -e "${BLUE}# Installation avec option de debug${NC}"
  echo "  sudo $0 ntfs-3g --no-cleanup"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  COMPORTEMENT DU SCRIPT"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "  • Vérifie si les paquets sont déjà installés"
  echo "  • Affiche la version si déjà installé"
  echo "  • Installe automatiquement les dépendances manquantes"
  echo "  • Propose des alternatives si un paquet n'existe pas"
  echo "  • Crée des raccourcis .desktop automatiquement"
  echo "  • Nettoie les paquets inutiles à la fin (sauf --no-cleanup)"
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  PAQUETS SPÉCIAUX DISPONIBLES"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  for pkg in "${!SPECIAL_PACKAGES[@]}"; do
    IFS='|' read -r type url <<< "${SPECIAL_PACKAGES[$pkg]}"
    echo "  • $pkg"
    echo "    Type: $type"
    echo "    URL: $url"
    echo ""
  done
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "Pour plus d'informations, consultez le script ou la documentation."
  echo ""
}

main() {
  local no_cleanup=false
  
  # Vérifier les arguments
  if [ $# -eq 0 ]; then
    display_error "Aucun argument fourni"
    show_usage
    exit 1
  fi

  # Traiter les options
  local args=()
  for arg in "$@"; do
    case "$arg" in
      -h|--help)
        show_usage
        exit 0
        ;;
      --no-cleanup)
        no_cleanup=true
        CLEANUP_ON_EXIT=false
        ;;
      *)
        args+=("$arg")
        ;;
    esac
  done

  if [ ${#args[@]} -eq 0 ]; then
    display_error "Aucun paquet à installer"
    exit 1
  fi

  # Vérifier root
  check_root

  # Vérifier les dépendances de base
  check_dependencies wget curl apt wine winetricks || true
  
  # Créer les répertoires nécessaires
  mkdir -p "$WINE_PREFIX_DIR" "$APPIMAGE_DIR" "$DESKTOP_DIR"

  display_info "═══════════════════════════════════════"
  display_info "🚀 Installation de ${#args[@]} paquet(s)"
  display_info "═══════════════════════════════════════"
  echo ""

  local success_count=0
  local fail_count=0

  # Traiter chaque argument
  for arg in "${args[@]}"; do
    echo ""
    display_info "───────────────────────────────────────"
    
    if [[ "$arg" == http* ]]; then
      # URL AppImage
      if install_appimage "$arg"; then
        ((success_count++))
      else
        ((fail_count++))
      fi
      
    elif [[ -v SPECIAL_PACKAGES["$arg"] ]]; then
      # Paquet spécial
      IFS='|' read -r type url <<< "${SPECIAL_PACKAGES[$arg]}"
      if [ "$type" = "wine" ]; then
        if install_wine_packages "$arg" "$url"; then
          ((success_count++))
        else
          ((fail_count++))
        fi
      elif [ "$type" = "appimage" ]; then
        if install_appimage "$url"; then
          ((success_count++))
        else
          ((fail_count++))
        fi
      fi
      
    else
      # Paquet APT standard
      if install_apt_packages "$arg"; then
        ((success_count++))
      else
        ((fail_count++))
      fi
    fi
  done

  # Nettoyage final
  echo ""
  clean_unused_packages

  # Résumé
  echo ""
  display_info "═══════════════════════════════════════"
  if [ $fail_count -eq 0 ]; then
    display_success "Toutes les installations sont terminées!"
    display_info "✅ Réussies: $success_count"
  else
    display_warning "Installations terminées avec des erreurs"
    display_info "✅ Réussies: $success_count"
    display_error "❌ Échouées: $fail_count"
  fi
  display_info "═══════════════════════════════════════"

  if [ "$no_cleanup" = true ]; then
    display_info "Répertoire temporaire conservé: $TEMP_DIR"
  fi

  return $fail_count
}

main "$@"
