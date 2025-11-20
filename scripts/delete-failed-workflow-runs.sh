#!/bin/bash

# Script pour supprimer tous les runs GitHub Actions qui ont échoué
# Usage: ./scripts/delete-failed-workflow-runs.sh

set -e

REPO_OWNER="bigmoletos"
REPO_NAME="learning_english"

# Vérifier que GITHUB_TOKEN est défini
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Erreur: GITHUB_TOKEN n'est pas défini"
  echo "Définissez-le avec: export GITHUB_TOKEN=votre_token"
  echo "Vous pouvez créer un token sur: https://github.com/settings/tokens"
  echo "Permissions nécessaires: repo (pour supprimer les runs)"
  exit 1
fi

echo "🔍 Recherche des workflow runs en échec..."

# Récupérer tous les workflow runs
WORKFLOW_RUNS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=100&status=completed&conclusion=failure")

# Extraire les IDs des runs en échec
RUN_IDS=$(echo "$WORKFLOW_RUNS" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' || echo "")

if [ -z "$RUN_IDS" ]; then
  echo "✅ Aucun run en échec trouvé"
  exit 0
fi

echo "📋 Runs en échec trouvés:"
echo "$WORKFLOW_RUNS" | grep -o '"id":[0-9]*' | sed 's/"id"://' | while read -r run_id; do
  echo "  - Run ID: $run_id"
done

echo ""
read -p "⚠️  Voulez-vous supprimer ces runs ? (oui/non): " confirm

if [ "$confirm" != "oui" ]; then
  echo "❌ Opération annulée"
  exit 0
fi

# Supprimer chaque run
DELETED=0
FAILED=0

echo "$RUN_IDS" | while read -r run_id; do
  if [ -n "$run_id" ]; then
    echo "🗑️  Suppression du run $run_id..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/$run_id")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "204" ]; then
      echo "  ✅ Run $run_id supprimé"
      DELETED=$((DELETED + 1))
    else
      echo "  ❌ Erreur lors de la suppression du run $run_id (HTTP $HTTP_CODE)"
      FAILED=$((FAILED + 1))
    fi
  fi
done

echo ""
echo "✅ Terminé: $DELETED runs supprimés"
if [ $FAILED -gt 0 ]; then
  echo "⚠️  $FAILED runs n'ont pas pu être supprimés"
fi

