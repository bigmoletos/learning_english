---
description: Rules for PowerShell and Bash scripting
alwaysApply: false
---

# Règles PowerShell & Bash

## PowerShell

### Structure
```powershell
# ✅ Bon - Script avec paramètres et validation
param(
    [Parameter(Mandatory=$true)]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = ".\config.json"
)

# Validation
if (-not (Test-Path $ConfigPath)) {
    Write-Error "Config file not found: $ConfigPath"
    exit 1
}

# Main logic
try {
    Write-Host "Deploying to $Environment..."
    # ...
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
```

### Best Practices
- Utiliser `$ErrorActionPreference = "Stop"` pour gérer les erreurs
- Valider les paramètres avec `[Parameter(Mandatory=$true)]`
- Utiliser `Write-Host` pour l'output utilisateur, `Write-Error` pour les erreurs
- Utiliser `try-catch` pour la gestion d'erreurs
- Commenter les scripts complexes

## Bash

### Structure
```bash
#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly CONFIG_FILE="${SCRIPT_DIR}/config.json"

# Functions
deploy() {
    local environment="$1"
    echo "Deploying to ${environment}..."
    # ...
}

# Main
main() {
    if [[ $# -eq 0 ]]; then
        echo "Usage: $0 <environment>"
        exit 1
    fi
    
    deploy "$1"
}

main "$@"
```

### Best Practices
- Toujours utiliser `set -euo pipefail`
- Utiliser `readonly` pour les constantes
- Valider les arguments
- Utiliser des fonctions pour la modularité
- Quoter les variables : `"$variable"` pas `$variable`
- Utiliser `[[ ]]` au lieu de `[ ]` pour les tests

## Scripts d'Installation

### PowerShell
```powershell
# ✅ Bon - Script d'installation avec vérifications
$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed"
    exit 1
}

Write-Host "Installing dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed"
    exit 1
}
```

### Bash
```bash
#!/bin/bash
set -euo pipefail

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed" >&2
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install
```

## Sécurité

- Ne jamais exécuter de scripts non vérifiés
- Valider toutes les entrées utilisateur
- Utiliser des chemins absolus ou relatifs sécurisés
- Ne pas exposer de secrets dans les scripts
- Utiliser des variables d'environnement pour les secrets

