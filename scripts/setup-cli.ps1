# PowerShell script pour installer Infisical CLI sur Windows
# Usage: .\setup-cli.ps1

Write-Host "🔐 Installation d'Infisical CLI pour Windows" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Chocolatey est installé
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installation de Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation de Chocolatey" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Chocolatey installé" -ForegroundColor Green
}

# Installer Infisical CLI via Chocolatey
Write-Host ""
Write-Host "📦 Installation d'Infisical CLI..." -ForegroundColor Yellow
choco install infisical -y

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation d'Infisical CLI" -ForegroundColor Red
    exit 1
}

# Vérifier l'installation
Write-Host ""
Write-Host "🔍 Vérification de l'installation..." -ForegroundColor Yellow
$infisicalVersion = infisical --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Infisical CLI installé avec succès" -ForegroundColor Green
    Write-Host "   Version: $infisicalVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ Erreur: Infisical CLI non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "   Vérifiez que Chocolatey a bien installé Infisical" -ForegroundColor Yellow
    exit 1
}

# Configuration
Write-Host ""
Write-Host "⚙️  Configuration d'Infisical..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour configurer Infisical, vous devez:" -ForegroundColor Cyan
Write-Host "1. Vous connecter à votre serveur Infisical:" -ForegroundColor White
Write-Host "   infisical login" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configurer votre projet:" -ForegroundColor White
Write-Host "   infisical init" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Vérifier votre configuration:" -ForegroundColor White
Write-Host "   infisical status" -ForegroundColor Gray
Write-Host ""

# Demander si l'utilisateur veut configurer maintenant
$configureNow = Read-Host "Voulez-vous configurer Infisical maintenant ? (o/n)"
if ($configureNow -eq "o") {
    Write-Host ""
    Write-Host "🔗 Connexion à Infisical..." -ForegroundColor Yellow
    infisical login

    Write-Host ""
    Write-Host "📁 Initialisation du projet..." -ForegroundColor Yellow
    infisical init

    Write-Host ""
    Write-Host "✅ Configuration terminée !" -ForegroundColor Green
} else {
    Write-Host "⚠️  Configuration à faire manuellement plus tard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Installation terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   infisical secrets set KEY value --project=PROJECT --env=ENV" -ForegroundColor Gray
Write-Host "   infisical secrets get KEY --project=PROJECT --env=ENV" -ForegroundColor Gray
Write-Host "   infisical secrets list --project=PROJECT --env=ENV" -ForegroundColor Gray
Write-Host ""

