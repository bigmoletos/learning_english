#!/usr/bin/env pwsh
# Auteur: Script de vérification des prérequis Spec Kit
# Date: 2025-01-27
# But: Vérifier et installer les prérequis nécessaires pour Spec Kit
# Validation requise avant exécution : "J'autorise l'exécution de ce script pour vérifier/installer les prérequis Spec Kit."

<#
.SYNOPSIS
    Vérifie et installe les prérequis pour Spec Kit

.DESCRIPTION
    Ce script vérifie la présence des outils nécessaires pour utiliser Spec Kit :
    - Python 3.11+
    - uv (gestionnaire de paquets Python)
    - Git
    - Specify CLI (installé via uv)

.PARAMETER Install
    Si spécifié, tente d'installer automatiquement les outils manquants

.PARAMETER SkipSpecifyInstall
    Si spécifié, ne vérifie pas l'installation de Specify CLI

.EXAMPLE
    .\check-prerequisites.ps1
    Vérifie uniquement les prérequis

.EXAMPLE
    .\check-prerequisites.ps1 -Install
    Vérifie et installe automatiquement les outils manquants
#>

[CmdletBinding()]
param(
    [switch]$Install,
    [switch]$SkipSpecifyInstall
)

# Configuration des couleurs et du logging
$ErrorActionPreference = "Continue"
$InformationPreference = "Continue"

# Fonction pour afficher les messages avec couleurs
function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Status) {
        "OK" { "Green" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        "INFO" { "Cyan" }
        default { "White" }
    }

    Write-Host "[$timestamp] [$Status] $Message" -ForegroundColor $color
}

# Fonction pour vérifier si une commande existe
function Test-Command {
    param([string]$Command)

    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Fonction pour obtenir la version de Python
function Get-PythonVersion {
    try {
        $version = python --version 2>&1
        if ($version -match "Python (\d+)\.(\d+)\.(\d+)") {
            $major = [int]$matches[1]
            $minor = [int]$matches[2]
            return @{ Major = $major; Minor = $minor; Full = $version }
        }
    } catch {
        return $null
    }
    return $null
}

# Fonction pour rafraîchir le PATH
function Refresh-Path {
    Write-Status "Rafraîchissement du PATH..." "INFO"
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

    # Ajouter les chemins Python courants
    $pythonPaths = @(
        "$env:USERPROFILE\AppData\Local\Programs\Python",
        "$env:USERPROFILE\AppData\Roaming\Python",
        "$env:LOCALAPPDATA\Programs\Python",
        "$env:ProgramFiles\Python*"
    )

    foreach ($path in $pythonPaths) {
        $resolved = Resolve-Path $path -ErrorAction SilentlyContinue
        if ($resolved) {
            foreach ($p in $resolved) {
                if ($env:Path -notlike "*$($p.Path)*") {
                    $env:Path = "$($p.Path);$env:Path"
                    $env:Path = "$($p.Path)\Scripts;$env:Path"
                }
            }
        }
    }

    # Ajouter .local/bin pour uv (Linux/Mac style, mais aussi Windows)
    $uvPaths = @(
        "$env:USERPROFILE\.local\bin",
        "$env:USERPROFILE\.cargo\bin",
        "$env:APPDATA\Python\Scripts",
        "$env:LOCALAPPDATA\Programs\uv"
    )

    foreach ($path in $uvPaths) {
        if (Test-Path $path -ErrorAction SilentlyContinue) {
            if ($env:Path -notlike "*$path*") {
                $env:Path = "$path;$env:Path"
            }
        }
    }
}

# Fonction pour vérifier uv avec plusieurs tentatives
function Test-UVInstalled {
    param([int]$MaxAttempts = 3)

    for ($i = 1; $i -le $MaxAttempts; $i++) {
        Refresh-Path
        Start-Sleep -Milliseconds 500

        if (Test-Command "uv") {
            try {
                $version = uv --version 2>&1
                Write-Status "uv vérifié: $version" "OK"
                return $true
            } catch {
                Write-Status "uv trouvé mais erreur lors de la vérification (tentative $i/$MaxAttempts)" "WARN"
            }
        }

        if ($i -lt $MaxAttempts) {
            Start-Sleep -Seconds 1
        }
    }

    return $false
}

# Fonction pour installer uv avec plusieurs méthodes
function Install-UV {
    Write-Status "Installation de uv..." "INFO"

    $installationMethods = @()

    # Méthode 1 : via pip (recommandée)
    if (Test-Command "pip") {
        $installationMethods += @{
            Name = "pip (user)"
            Script = {
                Write-Status "Tentative d'installation via pip --user..." "INFO"
                python -m pip install --user uv --quiet
                Refresh-Path
                return Test-UVInstalled
            }
        }

        $installationMethods += @{
            Name = "pip (global)"
            Script = {
                Write-Status "Tentative d'installation via pip (global)..." "INFO"
                python -m pip install uv --quiet
                Refresh-Path
                return Test-UVInstalled
            }
        }
    }

    # Méthode 2 : via pipx si disponible
    if (Test-Command "pipx") {
        $installationMethods += @{
            Name = "pipx"
            Script = {
                Write-Status "Tentative d'installation via pipx..." "INFO"
                pipx install uv
                Refresh-Path
                return Test-UVInstalled
            }
        }
    }

    # Méthode 3 : via le script d'installation officiel (Windows)
    $installationMethods += @{
        Name = "Script officiel PowerShell"
        Script = {
            Write-Status "Tentative d'installation via le script officiel..." "INFO"
            try {
                $installScript = Invoke-WebRequest -Uri "https://astral.sh/uv/install.ps1" -UseBasicParsing -TimeoutSec 30
                Invoke-Expression $installScript.Content
                Refresh-Path
                Start-Sleep -Seconds 2
                return Test-UVInstalled
            } catch {
                Write-Status "Erreur avec le script officiel: $_" "WARN"
                return $false
            }
        }
    }

    # Méthode 4 : via curl/wget (méthode Unix-like pour Windows)
    if (Test-Command "curl") {
        $installationMethods += @{
            Name = "curl (méthode Unix)"
            Script = {
                Write-Status "Tentative d'installation via curl..." "INFO"
                try {
                    $installScript = curl.exe -fsSL "https://astral.sh/uv/install.sh" 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Invoke-Expression $installScript
                        Refresh-Path
                        return Test-UVInstalled
                    }
                } catch {
                    Write-Status "Erreur avec curl: $_" "WARN"
                }
                return $false
            }
        }
    }

    # Essayer chaque méthode jusqu'à ce qu'une fonctionne
    foreach ($method in $installationMethods) {
        Write-Status "Essai de la méthode: $($method.Name)" "INFO"
        try {
            $result = & $method.Script
            if ($result) {
                Write-Status "✓ uv installé avec succès via $($method.Name)" "OK"

                # Vérification finale
                Refresh-Path
                if (Test-UVInstalled) {
                    $uvVersion = uv --version 2>&1
                    Write-Status "Installation confirmée: $uvVersion" "OK"
                    return $true
                }
            }
        } catch {
            Write-Status "Échec de la méthode $($method.Name): $_" "WARN"
        }
    }

    # Si toutes les méthodes ont échoué, donner des instructions
    Write-Status "✗ Toutes les méthodes automatiques ont échoué" "ERROR"
    Write-Status "Instructions manuelles:" "INFO"
    Write-Status "  1. pip install --user uv" "INFO"
    Write-Status "  2. Ou visitez: https://github.com/astral-sh/uv#installation" "INFO"
    Write-Status "  3. Après installation, redémarrez votre terminal" "INFO"

    return $false
}

# Fonction pour vérifier Specify CLI
function Test-SpecifyCLIInstalled {
    param([int]$MaxAttempts = 3)

    for ($i = 1; $i -le $MaxAttempts; $i++) {
        Refresh-Path
        Start-Sleep -Milliseconds 500

        if (Test-Command "specify") {
            try {
                $version = specify --version 2>&1
                if ($LASTEXITCODE -eq 0 -or $version -notmatch "error|not found") {
                    Write-Status "Specify CLI vérifié: $version" "OK"
                    return $true
                }
            } catch {
                Write-Status "Specify CLI trouvé mais erreur lors de la vérification (tentative $i/$MaxAttempts)" "WARN"
            }
        }

        if ($i -lt $MaxAttempts) {
            Start-Sleep -Seconds 1
        }
    }

    return $false
}

# Fonction pour installer Specify CLI avec vérification
function Install-SpecifyCLI {
    Write-Status "Installation de Specify CLI..." "INFO"

    if (-not (Test-Command "uv")) {
        Write-Status "uv n'est pas disponible. Impossible d'installer Specify CLI." "ERROR"
        Write-Status "Veuillez d'abord installer uv." "INFO"
        return $false
    }

    $installationMethods = @()

    # Méthode 1 : Installation standard via uv tool
    $installationMethods += @{
        Name = "uv tool install (standard)"
        Script = {
            Write-Status "Exécution: uv tool install specify-cli --from git+https://github.com/github/spec-kit.git" "INFO"
            & uv tool install specify-cli --from git+https://github.com/github/spec-kit.git 2>&1 | Out-Null
            Refresh-Path
            Start-Sleep -Seconds 2
            return Test-SpecifyCLIInstalled
        }
    }

    # Méthode 2 : Installation avec --force si déjà installé
    $installationMethods += @{
        Name = "uv tool install --force"
        Script = {
            Write-Status "Tentative avec --force..." "INFO"
            & uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git 2>&1 | Out-Null
            Refresh-Path
            Start-Sleep -Seconds 2
            return Test-SpecifyCLIInstalled
        }
    }

    # Essayer chaque méthode
    foreach ($method in $installationMethods) {
        Write-Status "Essai de la méthode: $($method.Name)" "INFO"
        try {
            $result = & $method.Script
            if ($result) {
                Write-Status "✓ Specify CLI installé avec succès via $($method.Name)" "OK"

                # Vérification finale
                Refresh-Path
                if (Test-SpecifyCLIInstalled) {
                    $specifyVersion = specify --version 2>&1
                    Write-Status "Installation confirmée: $specifyVersion" "OK"
                    return $true
                }
            }
        } catch {
            Write-Status "Échec de la méthode $($method.Name): $_" "WARN"
        }
    }

    Write-Status "✗ Échec de l'installation de Specify CLI" "ERROR"
    Write-Status "Instructions manuelles:" "INFO"
    Write-Status "  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git" "INFO"
    Write-Status "  Ou: uvx --from git+https://github.com/github/spec-kit.git specify init <PROJET>" "INFO"

    return $false
}

# Fonction pour vérifier Git
function Test-GitInstalled {
    if (Test-Command "git") {
        try {
            $version = git --version
            Write-Status "Git trouvé: $version" "OK"
            return $true
        } catch {
            Write-Status "Git est installé mais ne répond pas correctement" "WARN"
            return $false
        }
    } else {
        Write-Status "Git n'est pas installé" "ERROR"
        return $false
    }
}

# Fonction pour vérifier les agents IA (détection basique)
function Test-AIAgents {
    Write-Status "Vérification des agents IA compatibles..." "INFO"

    $agentsFound = @()
    $agentsPaths = @{
        "Cursor" = @("$env:LOCALAPPDATA\Programs\cursor\Cursor.exe", "$env:ProgramFiles\Cursor\Cursor.exe")
        "VS Code" = @("$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe", "$env:ProgramFiles\Microsoft VS Code\Code.exe")
        "GitHub Copilot" = @("$env:LOCALAPPDATA\Programs\GitHub Copilot CLI\github-copilot-cli.exe")
    }

    foreach ($agent in $agentsPaths.Keys) {
        foreach ($path in $agentsPaths[$agent]) {
            if (Test-Path $path) {
                $agentsFound += $agent
                Write-Status "$agent trouvé à: $path" "OK"
                break
            }
        }
    }

    # Vérifier les commandes CLI
    $cliAgents = @("claude", "gemini", "cursor-agent", "windsurf", "qwen", "opencode", "codex", "shai")
    foreach ($agent in $cliAgents) {
        if (Test-Command $agent) {
            $agentsFound += $agent
            Write-Status "Agent CLI '$agent' trouvé" "OK"
        }
    }

    if ($agentsFound.Count -eq 0) {
        Write-Status "Aucun agent IA compatible détecté automatiquement" "WARN"
        Write-Status "Assurez-vous d'avoir installé Cursor, Claude Code, GitHub Copilot ou un autre agent compatible" "INFO"
        return $false
    } else {
        Write-Status "$($agentsFound.Count) agent(s) IA trouvé(s): $($agentsFound -join ', ')" "OK"
        return $true
    }
}

# ============================================
# SCRIPT PRINCIPAL
# ============================================

Write-Status "========================================" "INFO"
Write-Status "Vérification des prérequis Spec Kit" "INFO"
Write-Status "========================================" "INFO"
if ($Install) {
    Write-Status "Mode installation automatique activé" "INFO"
}
Write-Host ""

# Rafraîchir le PATH au début
Refresh-Path

$allChecksPassed = $true
$missingTools = @()

# 1. Vérifier Python 3.11+
Write-Status "Vérification de Python 3.11+..." "INFO"
$pythonVersion = Get-PythonVersion

if ($null -eq $pythonVersion) {
    Write-Status "Python n'est pas installé ou n'est pas dans le PATH" "ERROR"
    $allChecksPassed = $false
    $missingTools += "Python 3.11+"

    if ($Install) {
        Write-Status "Veuillez installer Python manuellement depuis https://www.python.org/downloads/" "INFO"
        Write-Status "Assurez-vous de cocher 'Add Python to PATH' lors de l'installation" "INFO"
    }
} elseif ($pythonVersion.Major -lt 3 -or ($pythonVersion.Major -eq 3 -and $pythonVersion.Minor -lt 11)) {
    Write-Status "Python $($pythonVersion.Full) trouvé, mais la version 3.11+ est requise" "ERROR"
    $allChecksPassed = $false
    $missingTools += "Python 3.11+"
} else {
    Write-Status "Python $($pythonVersion.Full) trouvé - Version OK" "OK"
}

Write-Host ""

# 2. Vérifier uv
Write-Status "Vérification de uv..." "INFO"
Refresh-Path
$uvInstalled = Test-UVInstalled

if (-not $uvInstalled) {
    Write-Status "uv n'est pas installé ou non accessible" "ERROR"
    $allChecksPassed = $false
    $missingTools += "uv"

    if ($Install) {
        Write-Host ""
        Write-Status "Installation automatique de uv..." "INFO"
        if (Install-UV) {
            # Retester après installation
            Refresh-Path
            Start-Sleep -Seconds 2
            if (Test-UVInstalled) {
                $uvVersion = uv --version 2>&1
                Write-Status "✓ uv installé et vérifié: $uvVersion" "OK"
                $allChecksPassed = $true
                $missingTools = $missingTools | Where-Object { $_ -ne "uv" }
            } else {
                Write-Status "⚠ uv installé mais non accessible. Redémarrez votre terminal." "WARN"
            }
        } else {
            Write-Status "✗ Échec de l'installation automatique de uv" "ERROR"
        }
    }
} else {
    try {
        $uvVersion = uv --version 2>&1
        Write-Status "uv trouvé: $uvVersion" "OK"
    } catch {
        Write-Status "uv est installé mais ne répond pas correctement" "WARN"
        $allChecksPassed = $false
    }
}

Write-Host ""

# 3. Vérifier Git
Write-Status "Vérification de Git..." "INFO"
if (-not (Test-GitInstalled)) {
    $allChecksPassed = $false
    $missingTools += "Git"

    if ($Install) {
        Write-Status "Veuillez installer Git manuellement depuis https://git-scm.com/download/win" "INFO"
    }
}

Write-Host ""

# 4. Vérifier Specify CLI
if (-not $SkipSpecifyInstall) {
    Write-Status "Vérification de Specify CLI..." "INFO"
    Refresh-Path
    $specifyInstalled = Test-SpecifyCLIInstalled

    if (-not $specifyInstalled) {
        Write-Status "Specify CLI n'est pas installé" "WARN"

        if ($Install) {
            Write-Host ""
            Write-Status "Installation automatique de Specify CLI..." "INFO"
            if (Install-SpecifyCLI) {
                # Retester après installation
                Refresh-Path
                Start-Sleep -Seconds 2
                if (Test-SpecifyCLIInstalled) {
                    $specifyVersion = specify --version 2>&1
                    Write-Status "✓ Specify CLI installé et vérifié: $specifyVersion" "OK"
                } else {
                    Write-Status "⚠ Specify CLI installé mais non accessible. Redémarrez votre terminal." "WARN"
                }
            } else {
                Write-Status "✗ Échec de l'installation automatique de Specify CLI" "ERROR"
                Write-Status "Note: Specify CLI est optionnel, vous pouvez utiliser uvx à la place" "INFO"
            }
        } else {
            Write-Status "Pour installer Specify CLI, exécutez:" "INFO"
            Write-Status "  uv tool install specify-cli --from git+https://github.com/github/spec-kit.git" "INFO"
            Write-Status "Ou utilisez: uvx --from git+https://github.com/github/spec-kit.git specify init <PROJET>" "INFO"
        }
    } else {
        try {
            $specifyVersion = specify --version 2>&1
            Write-Status "Specify CLI trouvé: $specifyVersion" "OK"
        } catch {
            Write-Status "Specify CLI est installé mais ne répond pas correctement" "WARN"
        }
    }

    Write-Host ""
}

# 5. Vérifier les agents IA (optionnel, ne bloque pas)
Write-Status "Vérification des agents IA (optionnel)..." "INFO"
Test-AIAgents | Out-Null

Write-Host ""
Write-Status "========================================" "INFO"

# Vérification finale complète si installation effectuée
if ($Install) {
    Write-Status "Vérification finale après installation..." "INFO"
    Refresh-Path
    Start-Sleep -Seconds 1

    # Re-vérifier tous les outils
    $finalCheck = @{
        Python = $false
        UV = $false
        Git = $false
        SpecifyCLI = $false
    }

    # Python
    $pythonVersion = Get-PythonVersion
    if ($null -ne $pythonVersion -and $pythonVersion.Major -ge 3 -and $pythonVersion.Minor -ge 11) {
        $finalCheck.Python = $true
    }

    # UV
    if (Test-UVInstalled) {
        $finalCheck.UV = $true
    }

    # Git
    if (Test-GitInstalled) {
        $finalCheck.Git = $true
    }

    # Specify CLI (optionnel)
    if ($SkipSpecifyInstall -or (Test-SpecifyCLIInstalled)) {
        $finalCheck.SpecifyCLI = $true
    }

    Write-Host ""
    Write-Status "Résultat de la vérification finale:" "INFO"
    foreach ($tool in $finalCheck.Keys) {
        $status = if ($finalCheck[$tool]) { "✓" } else { "✗" }
        $color = if ($finalCheck[$tool]) { "Green" } else { "Red" }
        Write-Host "  $status $tool" -ForegroundColor $color
    }
    Write-Host ""

    # Mettre à jour allChecksPassed
    $allChecksPassed = $finalCheck.Python -and $finalCheck.UV -and $finalCheck.Git
    if ($allChecksPassed) {
        $missingTools = @()
    }
}

Write-Status "========================================" "INFO"

# Résumé final
if ($allChecksPassed -and ($missingTools.Count -eq 0)) {
    Write-Status "✓ Tous les prérequis essentiels sont installés et fonctionnels!" "OK"
    Write-Host ""
    Write-Status "Vous pouvez maintenant utiliser Spec Kit:" "INFO"
    if (Test-Command "specify") {
        Write-Status "  specify init <NOM_PROJET> --ai cursor-agent" "INFO"
        Write-Status "  specify check" "INFO"
    } else {
        Write-Status "  uvx --from git+https://github.com/github/spec-kit.git specify init <NOM_PROJET> --ai cursor-agent" "INFO"
    }
    exit 0
} else {
    Write-Status "✗ Certains prérequis sont manquants" "ERROR"
    Write-Host ""

    if ($missingTools.Count -gt 0) {
        Write-Status "Outils manquants:" "ERROR"
        foreach ($tool in $missingTools) {
            Write-Status "  - $tool" "ERROR"
        }
        Write-Host ""
    }

    if (-not $Install) {
        Write-Status "Pour installer automatiquement les outils manquants, exécutez:" "INFO"
        Write-Status "  .\check-prerequisites.ps1 -Install" "INFO"
    } else {
        Write-Status "Certaines installations ont échoué. Consultez les messages ci-dessus." "WARN"
        Write-Status "Vous pouvez réessayer ou installer manuellement les outils manquants." "INFO"
    }

    exit 1
}

