# Supprimer les runs GitHub Actions en échec

Ce script permet de supprimer tous les workflow runs GitHub Actions qui ont échoué.

## Prérequis

1. **Créer un token GitHub** :
   - Aller sur https://github.com/settings/tokens
   - Cliquer sur "Generate new token (classic)"
   - Donner un nom (ex: "Delete workflow runs")
   - Sélectionner la permission **`repo`** (accès complet au dépôt)
   - Cliquer sur "Generate token"
   - **⚠️ Copier le token immédiatement** (il ne sera plus visible après)

## Utilisation

### Sur Windows (PowerShell)

```powershell
# 1. Définir le token GitHub
$env:GITHUB_TOKEN = "votre_token_github"

# 2. Exécuter le script
.\scripts\delete-failed-workflow-runs.ps1
```

### Sur Linux/Mac (Bash)

```bash
# 1. Définir le token GitHub
export GITHUB_TOKEN="votre_token_github"

# 2. Rendre le script exécutable (première fois seulement)
chmod +x scripts/delete-failed-workflow-runs.sh

# 3. Exécuter le script
./scripts/delete-failed-workflow-runs.sh
```

## Fonctionnement

1. Le script récupère tous les workflow runs avec le statut `completed` et la conclusion `failure`
2. Il affiche la liste des runs en échec trouvés
3. Il demande confirmation avant de supprimer
4. Il supprime chaque run un par un
5. Il affiche un résumé des suppressions réussies/échouées

## Sécurité

- Le token GitHub est utilisé uniquement pour les requêtes API
- Le script demande confirmation avant de supprimer
- Les erreurs sont affichées clairement

## Alternative : Via l'interface GitHub

Vous pouvez aussi supprimer les runs manuellement :
1. Aller sur https://github.com/bigmoletos/learning_english/actions
2. Cliquer sur chaque workflow run en échec
3. Cliquer sur "..." (menu) → "Delete workflow run"

