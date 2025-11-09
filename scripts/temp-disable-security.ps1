#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script pour désactiver temporairement les prompts de sécurité Cursor pendant 10 minutes

.DESCRIPTION
    Ce script active temporairement les autorisations automatiques pour :
    - Browser (navigateur)
    - Terminal
    - File Operations

    Après 10 minutes, les paramètres de sécurité sont automatiquement restaurés.

.PARAMETER DurationMinutes
    Durée en minutes pendant laquelle les autorisations sont désactivées (défaut: 10)

.EXAMPLE
    .\scripts\temp-disable-security.ps1
    .\scripts\temp-disable-security.ps1 -DurationMinutes 15
#>

param(
    [int]$DurationMinutes = 10
)

$ErrorActionPreference = "Stop"

# Chemins vers les fichiers de configuration
$settingsFile = Join-Path $PSScriptRoot "..\.vscode\settings.json"
$backupFile = Join-Path $PSScriptRoot "..\.vscode\settings.json.backup"
$cursorCliFile = Join-Path $PSScriptRoot "..\.cursor\cli.json"
$cursorCliBackup = Join-Path $PSScriptRoot "..\.cursor\cli.json.backup"
$lockFile = Join-Path $PSScriptRoot "..\.vscode\.security-lock"

# Fonction pour lire le fichier JSON
function Read-SettingsFile {
    param([string]$FilePath)

    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        try {
            return $content | ConvertFrom-Json
        } catch {
            Write-Warning "Erreur lors de la lecture du fichier JSON, création d'un nouveau fichier"
            return @{} | ConvertTo-Json | ConvertFrom-Json
        }
    } else {
        return @{} | ConvertTo-Json | ConvertFrom-Json
    }
}

# Fonction pour écrire le fichier JSON
function Write-SettingsFile {
    param(
        [string]$FilePath,
        [object]$Settings
    )

    $json = $Settings | ConvertTo-Json -Depth 10
    $json | Set-Content $FilePath -Encoding UTF8 -NoNewline
}

# Vérifier si un verrou existe déjà
if (Test-Path $lockFile) {
    $lockContent = Get-Content $lockFile -Raw
    $lockData = $lockContent | ConvertFrom-Json
    $expiryTime = [DateTime]::Parse($lockData.expiryTime)

    if ($expiryTime -gt (Get-Date)) {
        $remaining = ($expiryTime - (Get-Date)).TotalMinutes
        Write-Host "⚠️  Les autorisations sont déjà activées temporairement." -ForegroundColor Yellow
        Write-Host "   Expiration dans : $([math]::Round($remaining, 1)) minutes" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Voulez-vous prolonger la durée ? (O/N)" -ForegroundColor Cyan
        $response = Read-Host
        if ($response -ne "O" -and $response -ne "o") {
            Write-Host "Opération annulée." -ForegroundColor Gray
            exit 0
        }
    } else {
        Write-Host "🔓 Verrou expiré, restauration des paramètres de sécurité..." -ForegroundColor Green
        # Restaurer les paramètres depuis la sauvegarde
        if (Test-Path $backupFile) {
            Copy-Item $backupFile $settingsFile -Force
            Remove-Item $backupFile -Force
            Remove-Item $lockFile -Force
            Write-Host "✅ Paramètres de sécurité restaurés." -ForegroundColor Green
        }
    }
}

# Créer le dossier .vscode s'il n'existe pas
$vscodeDir = Split-Path $settingsFile -Parent
if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
    Write-Host "📁 Dossier .vscode créé" -ForegroundColor Green
}

# Lire les paramètres actuels
Write-Host "📖 Lecture des paramètres actuels..." -ForegroundColor Cyan
$settings = Read-SettingsFile -FilePath $settingsFile

# Sauvegarder les paramètres actuels si pas déjà sauvegardé
if (-not (Test-Path $backupFile)) {
    Write-Host "💾 Sauvegarde des paramètres actuels (.vscode)..." -ForegroundColor Cyan
    Write-SettingsFile -FilePath $backupFile -Settings $settings
}

# Activer les autorisations temporaires dans .vscode/settings.json
Write-Host "🔓 Activation des autorisations temporaires pour $DurationMinutes minutes..." -ForegroundColor Yellow
$settings | Add-Member -MemberType NoteProperty -Name "cursor.ai.autoApproveBrowser" -Value $true -Force
$settings | Add-Member -MemberType NoteProperty -Name "cursor.ai.autoApproveTerminal" -Value $true -Force
$settings | Add-Member -MemberType NoteProperty -Name "cursor.ai.autoApproveFileOperations" -Value $true -Force
$settings | Add-Member -MemberType NoteProperty -Name "cursor.security.promptLevel" -Value "low" -Force

# Écrire les nouveaux paramètres
Write-SettingsFile -FilePath $settingsFile -Settings $settings

# Configurer les permissions Cursor CLI
Write-Host "🔓 Configuration des permissions Cursor CLI..." -ForegroundColor Yellow
$cursorDir = Split-Path $cursorCliFile -Parent
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
}

if (Test-Path $cursorCliFile) {
    $cursorCli = Read-SettingsFile -FilePath $cursorCliFile
    if (-not (Test-Path $cursorCliBackup)) {
        Write-SettingsFile -FilePath $cursorCliBackup -Settings $cursorCli
    }
} else {
    $cursorCli = @{} | ConvertTo-Json | ConvertFrom-Json
}

# Activer toutes les permissions
$cursorCli | Add-Member -MemberType NoteProperty -Name "permissions" -Value @{
    allow = @("Browser(*)", "Shell(*)", "Terminal(*)", "Read(*)", "Write(*)", "FileSystem(*)", "Network(*)")
    deny = @()
    ask = @()
} -Force

$cursorCli | Add-Member -MemberType NoteProperty -Name "security" -Value @{
    promptLevel = "low"
    autoApproveBrowser = $true
    autoApproveTerminal = $true
    autoApproveFileOperations = $true
} -Force

Write-SettingsFile -FilePath $cursorCliFile -Settings $cursorCli
Write-Host "✅ Permissions Cursor CLI configurées" -ForegroundColor Green

# Créer le fichier de verrou avec l'heure d'expiration
$expiryTime = (Get-Date).AddMinutes($DurationMinutes)
$lockData = @{
    startTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    expiryTime = $expiryTime.ToString("yyyy-MM-dd HH:mm:ss")
    durationMinutes = $DurationMinutes
} | ConvertTo-Json

$lockData | Set-Content $lockFile -Encoding UTF8
Write-Host "✅ Autorisations activées jusqu'à $($expiryTime.ToString('HH:mm:ss'))" -ForegroundColor Green
Write-Host ""

# Afficher un compte à rebours en arrière-plan
Write-Host "⏱️  Compte à rebours démarré..." -ForegroundColor Cyan
Write-Host "   Les autorisations seront automatiquement restaurées dans $DurationMinutes minutes." -ForegroundColor Gray
Write-Host ""

# Script de restauration automatique en arrière-plan
$restoreScript = @"
`$lockFile = '$lockFile'
`$backupFile = '$backupFile'
`$settingsFile = '$settingsFile'
`$cursorCliFile = '$cursorCliFile'
`$cursorCliBackup = '$cursorCliBackup'
`$expiryTime = [DateTime]::Parse('$($expiryTime.ToString("yyyy-MM-dd HH:mm:ss"))')

Start-Sleep -Seconds ($DurationMinutes * 60)

if (Test-Path `$lockFile) {
    `$lockContent = Get-Content `$lockFile -Raw
    `$lockData = `$lockContent | ConvertFrom-Json
    `$expiry = [DateTime]::Parse(`$lockData.expiryTime)

    if ((Get-Date) -ge `$expiry) {
        Write-Host "`n🔒 Restauration automatique des paramètres de sécurité..." -ForegroundColor Yellow
        if (Test-Path `$backupFile) {
            Copy-Item `$backupFile `$settingsFile -Force
            Remove-Item `$backupFile -Force
            Write-Host "✅ Paramètres .vscode restaurés." -ForegroundColor Green
        }
        if (Test-Path `$cursorCliBackup) {
            Copy-Item `$cursorCliBackup `$cursorCliFile -Force
            Remove-Item `$cursorCliBackup -Force
            Write-Host "✅ Permissions Cursor CLI restaurées." -ForegroundColor Green
        }
        Remove-Item `$lockFile -Force
    }
}
"@

# Démarrer le script de restauration en arrière-plan
Start-Process pwsh -ArgumentList "-NoProfile", "-Command", $restoreScript -WindowStyle Hidden

Write-Host "💡 Pour restaurer manuellement avant l'expiration, exécutez :" -ForegroundColor Cyan
Write-Host "   .\scripts\restore-security.ps1" -ForegroundColor White
Write-Host ""

