#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script pour restaurer manuellement les paramètres de sécurité Cursor

.DESCRIPTION
    Ce script restaure immédiatement les paramètres de sécurité depuis la sauvegarde
    et supprime le verrou temporaire.
#>

$ErrorActionPreference = "Stop"

# Chemins des fichiers
$settingsFile = Join-Path $PSScriptRoot "..\.vscode\settings.json"
$backupFile = Join-Path $PSScriptRoot "..\.vscode\settings.json.backup"
$cursorCliFile = Join-Path $PSScriptRoot "..\.cursor\cli.json"
$cursorCliBackup = Join-Path $PSScriptRoot "..\.cursor\cli.json.backup"
$lockFile = Join-Path $PSScriptRoot "..\.vscode\.security-lock"

Write-Host "🔒 Restauration des paramètres de sécurité..." -ForegroundColor Yellow

if (-not (Test-Path $backupFile)) {
    Write-Host "⚠️  Aucune sauvegarde trouvée. Création de paramètres par défaut..." -ForegroundColor Yellow

    $defaultSettings = @{
        "cursor.ai.autoApproveBrowser" = $false
        "cursor.ai.autoApproveTerminal" = $false
        "cursor.ai.autoApproveFileOperations" = $false
        "cursor.security.promptLevel" = "medium"
    } | ConvertTo-Json -Depth 10

    $defaultSettings | Set-Content $settingsFile -Encoding UTF8 -NoNewline
    Write-Host "✅ Paramètres par défaut appliqués." -ForegroundColor Green
} else {
    Copy-Item $backupFile $settingsFile -Force
    Remove-Item $backupFile -Force
    Write-Host "✅ Paramètres restaurés depuis la sauvegarde." -ForegroundColor Green
}

if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "✅ Verrou supprimé." -ForegroundColor Green
}

# Restaurer les permissions Cursor CLI
if (Test-Path $cursorCliBackup) {
    Copy-Item $cursorCliBackup $cursorCliFile -Force
    Remove-Item $cursorCliBackup -Force
    Write-Host "✅ Permissions Cursor CLI restaurées." -ForegroundColor Green
} elseif (Test-Path $cursorCliFile) {
    # Supprimer le fichier si pas de sauvegarde
    Remove-Item $cursorCliFile -Force
    Write-Host "✅ Fichier Cursor CLI supprimé (pas de sauvegarde)." -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Les prompts de sécurité sont maintenant réactivés." -ForegroundColor Green

