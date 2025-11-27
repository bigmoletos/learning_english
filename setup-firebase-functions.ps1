# Script PowerShell pour configurer Firebase Functions
# Date: 2025-11-27

Write-Host "🔥 Configuration Firebase Functions" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Firebase CLI est installé
Write-Host "1. Vérification Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI non installé. Installez-le avec: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Firebase CLI: $firebaseVersion" -ForegroundColor Green

# Vérifier la connexion
Write-Host ""
Write-Host "2. Vérification de la connexion Firebase..." -ForegroundColor Yellow
$firebaseLogin = firebase login:list 2>&1
if ($firebaseLogin -match "desmedt.franck@gmail.com") {
    Write-Host "✅ Connecté en tant que: desmedt.franck@gmail.com" -ForegroundColor Green
} else {
    Write-Host "⚠️  Connexion Firebase non vérifiée" -ForegroundColor Yellow
    Write-Host "   Exécutez: firebase login" -ForegroundColor Yellow
}

# Vérifier que les fichiers sont créés
Write-Host ""
Write-Host "3. Vérification de la structure..." -ForegroundColor Yellow
$filesToCheck = @(
    ".firebaserc",
    "firebase.json",
    "functions/index.js",
    "functions/package.json"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
    }
}

# Vérifier les routes copiées
Write-Host ""
Write-Host "4. Vérification des routes..." -ForegroundColor Yellow
$routesCount = (Get-ChildItem -Path "functions\routes\*.js" -ErrorAction SilentlyContinue).Count
if ($routesCount -gt 0) {
    Write-Host "✅ $routesCount routes copiées" -ForegroundColor Green
} else {
    Write-Host "❌ Aucune route trouvée" -ForegroundColor Red
}

# Vérifier les dépendances
Write-Host ""
Write-Host "5. Vérification des dépendances..." -ForegroundColor Yellow
if (Test-Path "functions\node_modules") {
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dépendances non installées. Exécutez: cd functions; npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Sélectionner le projet Firebase:" -ForegroundColor White
Write-Host "   firebase use ia-project-91c03" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configurer les variables d'environnement:" -ForegroundColor White
Write-Host "   firebase functions:config:set jwt.secret=`"6e7fd6d08c6a9784dc934342be5266a1b4f500402263e4956a6d6c60c1f738fb`" jwt.expires_in=`"7d`" cors.origin=`"https://learning-english.iaproject.fr,https://learning-english-b7d.pages.dev,https://bigmoletos.github.io`"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Déployer:" -ForegroundColor White
Write-Host "   firebase deploy --only functions" -ForegroundColor Gray
Write-Host ""

