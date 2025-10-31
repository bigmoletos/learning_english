#!/bin/bash

# Script bash pour vérifier les utilisateurs
# Usage: ./checkUsers.sh [email]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

if [ $# -eq 0 ]; then
  # Lister tous les utilisateurs
  node scripts/checkUser.js
else
  # Chercher un utilisateur spécifique
  node scripts/checkUser.js "$1"
fi

