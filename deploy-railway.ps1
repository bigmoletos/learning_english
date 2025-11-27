#!/usr/bin/env pwsh
# Script de déploiement Railway - Backend AI English Trainer
# Auteur: AI English Trainer Team
# Date: 2025-11-27
# Usage: ./deploy-railway.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Script de déploiement Railway - Backend" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "backend/server.js")) {
    Write-Error "❌ Ce script doit être exécuté depuis la racine du projet"
    exit 1
}

Write-Host "✅ Répertoire correct détecté`n" -ForegroundColor Green

# Afficher les instructions
Write-Host "📋 Instructions pour déployer sur Railway :`n" -ForegroundColor Yellow

Write-Host "1️⃣  Créer un compte Railway" -ForegroundColor Cyan
Write-Host "   → Aller sur https://railway.app" -ForegroundColor Gray
Write-Host "   → Se connecter avec GitHub`n" -ForegroundColor Gray

Write-Host "2️⃣  Déployer le backend" -ForegroundColor Cyan
Write-Host "   → Cliquer sur 'New Project'" -ForegroundColor Gray
Write-Host "   → Sélectionner 'Deploy from GitHub repo'" -ForegroundColor Gray
Write-Host "   → Choisir le dépôt 'bigmoletos/learning_english'" -ForegroundColor Gray
Write-Host "   → Railway détectera automatiquement le dossier backend/`n" -ForegroundColor Gray

Write-Host "3️⃣  Configurer les variables d'environnement" -ForegroundColor Cyan
Write-Host "   → Dans Railway : Settings → Variables" -ForegroundColor Gray
Write-Host "   → Copier-coller les variables depuis RAILWAY_ENV_VARS.txt`n" -ForegroundColor Gray

Write-Host "4️⃣  Configurer le domaine personnalisé" -ForegroundColor Cyan
Write-Host "   → Dans Railway : Settings → Networking" -ForegroundColor Gray
Write-Host "   → Ajouter : backend.learning-english.iaproject.fr" -ForegroundColor Gray
Write-Host "   → Copier le CNAME fourni par Railway`n" -ForegroundColor Gray

Write-Host "5️⃣  Mettre à jour le DNS dans OVH" -ForegroundColor Cyan
Write-Host "   → Aller sur https://www.ovh.com/manager/web/" -ForegroundColor Gray
Write-Host "   → Zone DNS → Modifier backend.learning-english" -ForegroundColor Gray
Write-Host "   → Pointer vers le CNAME Railway`n" -ForegroundColor Gray

Write-Host "6️⃣  Vérifier le déploiement" -ForegroundColor Cyan
Write-Host "   → Attendre 5-10 minutes pour la propagation DNS" -ForegroundColor Gray
Write-Host "   → Tester : curl https://backend.learning-english.iaproject.fr/health`n" -ForegroundColor Gray

Write-Host "📄 Documentation complète : RAILWAY_DEPLOY.md`n" -ForegroundColor Yellow

# Vérifier si Railway CLI est installé
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if ($railwayInstalled) {
    Write-Host "✅ Railway CLI détecté`n" -ForegroundColor Green

    $useCli = Read-Host "Voulez-vous utiliser Railway CLI pour le déploiement ? (o/N)"

    if ($useCli -eq "o" -or $useCli -eq "O") {
        Write-Host "`n🔐 Connexion à Railway..." -ForegroundColor Cyan
        railway login

        Write-Host "`n📦 Déploiement du backend..." -ForegroundColor Cyan
        cd backend
        railway up

        Write-Host "`n✅ Déploiement terminé !" -ForegroundColor Green
        Write-Host "   Configurez les variables d'environnement dans Railway Dashboard" -ForegroundColor Yellow
    }
} else {
    Write-Host "💡 Astuce : Installez Railway CLI pour déployer depuis la ligne de commande" -ForegroundColor Yellow
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Gray
    Write-Host "   railway login" -ForegroundColor Gray
    Write-Host "   railway up`n" -ForegroundColor Gray
}

Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Suivre les instructions ci-dessus" -ForegroundColor Gray
Write-Host "   2. Consulter RAILWAY_DEPLOY.md pour le guide détaillé" -ForegroundColor Gray
Write-Host "   3. Utiliser RAILWAY_ENV_VARS.txt pour les variables d'environnement`n" -ForegroundColor Gray

Write-Host "✅ Prêt pour le déploiement ! 🚀" -ForegroundColor Green

