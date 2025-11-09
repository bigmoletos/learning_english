# Scripts de Gestion de Sécurité Cursor

Ces scripts permettent de gérer temporairement les prompts de sécurité dans Cursor pour faciliter le développement.

## 📋 Scripts Disponibles

### 1. `temp-disable-security.ps1`
Active temporairement les autorisations automatiques pour 10 minutes (configurable).

**Usage :**
```powershell
# Activer pour 10 minutes (défaut)
.\scripts\temp-disable-security.ps1

# Activer pour une durée personnalisée
.\scripts\temp-disable-security.ps1 -DurationMinutes 15
```

**Ce que fait le script :**
- ✅ Sauvegarde les paramètres actuels
- ✅ Active les autorisations automatiques pour Browser, Terminal et File Operations
- ✅ Crée un verrou avec heure d'expiration
- ✅ Lance un processus en arrière-plan pour restauration automatique
- ✅ Restaure automatiquement après la durée spécifiée

### 2. `restore-security.ps1`
Restaure immédiatement les paramètres de sécurité.

**Usage :**
```powershell
.\scripts\restore-security.ps1
```

**Quand l'utiliser :**
- Si vous voulez restaurer les prompts avant l'expiration automatique
- Si le script automatique n'a pas fonctionné
- Pour forcer la restauration immédiate

### 3. `check-security-status.ps1`
Affiche le statut actuel des paramètres de sécurité.

**Usage :**
```powershell
.\scripts\check-security-status.ps1
```

**Affiche :**
- État actuel des paramètres (activés/désactivés)
- Si une autorisation temporaire est active
- Temps restant avant restauration automatique

## 🔧 Configuration

Les paramètres sont stockés dans `.vscode/settings.json` :

```json
{
  "cursor.ai.autoApproveBrowser": false,
  "cursor.ai.autoApproveTerminal": false,
  "cursor.ai.autoApproveFileOperations": false,
  "cursor.security.promptLevel": "medium"
}
```

## ⚠️ Sécurité

**Important :** Ces scripts désactivent temporairement les prompts de sécurité.

**Bonnes pratiques :**
- ✅ Utilisez uniquement pendant le développement actif
- ✅ Vérifiez régulièrement le statut avec `check-security-status.ps1`
- ✅ Restaurez manuellement si vous quittez votre session
- ❌ Ne laissez jamais les autorisations activées en production
- ❌ Ne partagez pas les fichiers de sauvegarde (`.backup`)

## 📝 Fichiers Créés

- `.vscode/settings.json` - Configuration Cursor
- `.vscode/settings.json.backup` - Sauvegarde des paramètres (créé automatiquement)
- `.vscode/.security-lock` - Verrou avec heure d'expiration (créé automatiquement)

## ⚠️ IMPORTANT : Redémarrage de Cursor requis

**Après avoir exécuté le script, vous DEVEZ redémarrer Cursor pour que les permissions prennent effet.**

1. Exécutez le script : `.\scripts\temp-disable-security.ps1`
2. **Redémarrez Cursor complètement** (fermez et rouvrez l'application)
3. Les permissions seront alors actives

## 🚀 Workflow Recommandé

1. **Avant de commencer le développement :**
   ```powershell
   .\scripts\temp-disable-security.ps1 -DurationMinutes 30
   ```
   **Puis redémarrez Cursor**

2. **Pendant le développement :**
   ```powershell
   # Vérifier le temps restant
   .\scripts\check-security-status.ps1
   ```

3. **Si besoin de prolonger :**
   ```powershell
   .\scripts\temp-disable-security.ps1 -DurationMinutes 30
   ```

4. **À la fin de la session :**
   ```powershell
   .\scripts\restore-security.ps1
   ```

## 🔍 Dépannage

**Les autorisations ne se restaurent pas automatiquement :**
```powershell
# Vérifier le statut
.\scripts\check-security-status.ps1

# Restaurer manuellement
.\scripts\restore-security.ps1
```

**Le script ne démarre pas :**
- Vérifiez que PowerShell 7+ est installé
- Exécutez avec : `pwsh scripts\temp-disable-security.ps1`

**Les paramètres ne s'appliquent pas :**
- Redémarrez Cursor après modification de `.vscode/settings.json`
- Vérifiez que le fichier est bien dans le workspace

