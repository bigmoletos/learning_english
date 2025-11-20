# Script PowerShell pour supprimer tous les runs GitHub Actions qui ont échoué
# Usage: .\scripts\delete-failed-workflow-runs.ps1

$REPO_OWNER = "bigmoletos"
$REPO_NAME = "learning_english"

# Vérifier que GITHUB_TOKEN est défini
if (-not $env:GITHUB_TOKEN) {
    Write-Host "❌ Erreur: GITHUB_TOKEN n'est pas défini" -ForegroundColor Red
    Write-Host "Définissez-le avec: `$env:GITHUB_TOKEN = 'votre_token'" -ForegroundColor Yellow
    Write-Host "Vous pouvez créer un token sur: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "Permissions nécessaires: repo (pour supprimer les runs)" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Recherche des workflow runs en échec..." -ForegroundColor Cyan

# Récupérer tous les workflow runs en échec
$headers = @{
    "Authorization" = "token $env:GITHUB_TOKEN"
    "Accept" = "application/vnd.github.v3+json"
}

$page = 1
$allRuns = @()

do {
    $url = "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=100&page=$page&status=completed&conclusion=failure"

    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        $allRuns += $response.workflow_runs
        $page++
    } catch {
        Write-Host "❌ Erreur lors de la récupération des runs: $_" -ForegroundColor Red
        exit 1
    }
} while ($response.workflow_runs.Count -eq 100)

if ($allRuns.Count -eq 0) {
    Write-Host "✅ Aucun run en échec trouvé" -ForegroundColor Green
    exit 0
}

Write-Host "📋 Runs en échec trouvés: $($allRuns.Count)" -ForegroundColor Yellow
foreach ($run in $allRuns) {
    Write-Host "  - Run ID: $($run.id) - Workflow: $($run.name) - Créé le: $($run.created_at)" -ForegroundColor Gray
}

Write-Host ""
$confirm = Read-Host "⚠️  Voulez-vous supprimer ces runs ? (oui/non)"

if ($confirm -ne "oui") {
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    exit 0
}

# Supprimer chaque run
$deleted = 0
$failed = 0

foreach ($run in $allRuns) {
    Write-Host "🗑️  Suppression du run $($run.id)..." -ForegroundColor Cyan

    $deleteUrl = "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/$($run.id)"

    try {
        $response = Invoke-WebRequest -Uri $deleteUrl -Headers $headers -Method Delete

        if ($response.StatusCode -eq 204) {
            Write-Host "  ✅ Run $($run.id) supprimé" -ForegroundColor Green
            $deleted++
        } else {
            Write-Host "  ❌ Erreur lors de la suppression du run $($run.id) (HTTP $($response.StatusCode))" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "  ❌ Erreur lors de la suppression du run $($run.id): $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "✅ Terminé: $deleted runs supprimés" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "⚠️  $failed runs n'ont pas pu être supprimés" -ForegroundColor Yellow
}

