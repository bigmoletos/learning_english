# Script pour ouvrir l'application dans Chrome au lieu du navigateur intégré de Cursor
# Usage: .\scripts\open-browser.ps1 [port]

param(
    [int]$Port = 3000
)

$url = "http://localhost:$Port"

Write-Host "🌐 Ouverture de l'application dans Chrome..." -ForegroundColor Cyan
Write-Host "📍 URL: $url" -ForegroundColor Yellow

# Vérifier si Chrome est installé
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if ($chromePath) {
    Write-Host "✅ Chrome trouvé: $chromePath" -ForegroundColor Green

    # Ouvrir Chrome avec l'URL et les DevTools
    Start-Process -FilePath $chromePath -ArgumentList "$url", "--auto-open-devtools-for-tabs"

    Write-Host "✅ Chrome ouvert avec DevTools" -ForegroundColor Green
} else {
    Write-Host "⚠️ Chrome non trouvé, ouverture avec le navigateur par défaut..." -ForegroundColor Yellow
    Start-Process $url
}

Write-Host ""
Write-Host "💡 Conseil: Utilisez Chrome pour le développement au lieu du navigateur intégré de Cursor" -ForegroundColor Cyan
Write-Host "   Le navigateur intégré peut avoir des problèmes avec les proxies et les configurations locales." -ForegroundColor Gray

