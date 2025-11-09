#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script pour vérifier le statut actuel des paramètres de sécurité Cursor
#>

$ErrorActionPreference = "Stop"

$settingsFile = Join-Path $PSScriptRoot "..\.vscode\settings.json"
$lockFile = Join-Path $PSScriptRoot "..\.vscode\.security-lock"

Write-Host "📊 Statut des paramètres de sécurité Cursor" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

if (Test-Path $settingsFile) {
    $settings = Get-Content $settingsFile -Raw | ConvertFrom-Json

    Write-Host "Paramètres actuels :" -ForegroundColor Yellow
    Write-Host "  - Browser Auto-Approve: $($settings.'cursor.ai.autoApproveBrowser')" -ForegroundColor $(if ($settings.'cursor.ai.autoApproveBrowser') { "Red" } else { "Green" })
    Write-Host "  - Terminal Auto-Approve: $($settings.'cursor.ai.autoApproveTerminal')" -ForegroundColor $(if ($settings.'cursor.ai.autoApproveTerminal') { "Red" } else { "Green" })
    Write-Host "  - File Ops Auto-Approve: $($settings.'cursor.ai.autoApproveFileOperations')" -ForegroundColor $(if ($settings.'cursor.ai.autoApproveFileOperations') { "Red" } else { "Green" })
    Write-Host "  - Prompt Level: $($settings.'cursor.security.promptLevel')" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Fichier de configuration non trouvé (paramètres par défaut actifs)" -ForegroundColor Yellow
}

Write-Host ""

if (Test-Path $lockFile) {
    $lockContent = Get-Content $lockFile -Raw
    $lockData = $lockContent | ConvertFrom-Json
    $expiryTime = [DateTime]::Parse($lockData.expiryTime)
    $remaining = $expiryTime - (Get-Date)

    if ($remaining.TotalSeconds -gt 0) {
        Write-Host "⏱️  Autorisations temporaires actives" -ForegroundColor Yellow
        Write-Host "   Début: $($lockData.startTime)" -ForegroundColor Gray
        Write-Host "   Expiration: $($lockData.expiryTime)" -ForegroundColor Gray
        Write-Host "   Temps restant: $([math]::Round($remaining.TotalMinutes, 1)) minutes" -ForegroundColor $(if ($remaining.TotalMinutes -lt 2) { "Red" } else { "Yellow" })
    } else {
        Write-Host "⚠️  Verrou expiré mais non nettoyé" -ForegroundColor Red
        Write-Host "   Exécutez restore-security.ps1 pour nettoyer" -ForegroundColor Gray
    }
} else {
    Write-Host "🔒 Aucune autorisation temporaire active" -ForegroundColor Green
}

Write-Host ""

