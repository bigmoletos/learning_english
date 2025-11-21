# 🔧 Guide de Résolution des Problèmes Continue

## Problèmes Identifiés

### 1. ❌ Extension YAML manquante

**Erreur :**
```
Failed to register Continue config.yaml schema, most likely, YAML extension is not installed
```

**Solution :**

1. **Installer l'extension YAML** :
   - Ouvrir Cursor
   - `Ctrl+Shift+X` (ou `Cmd+Shift+X` sur Mac)
   - Rechercher : `Red Hat YAML`
   - Installer : `redhat.vscode-yaml`

2. **Alternative** : Installer via ligne de commande
   ```powershell
   cursor --install-extension redhat.vscode-yaml
   ```

### 2. ❌ Impossible d'écrire dans les paramètres utilisateur

**Erreur :**
```
Unable to write into user settings. Please open the user settings to correct errors/warnings in it and try again.
```

**Solution :**

1. **Ouvrir les paramètres utilisateur** :
   - `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
   - Vérifier la syntaxe JSON (pas de virgules en trop, accolades fermées)

2. **Vérifier les erreurs** :
   - `Ctrl+Shift+P` → "Preferences: Open Settings (UI)"
   - Chercher les avertissements en haut de la page

3. **Réinitialiser les paramètres** (si nécessaire) :
   - Fermer Cursor
   - Sauvegarder `%APPDATA%\Cursor\User\settings.json`
   - Supprimer le fichier
   - Rouvrir Cursor (il créera un nouveau fichier par défaut)

### 3. ❌ Agents Continue non enregistrés

**Erreur :**
```
MainThreadChatAgents2#$updateAgent: No agent with handle X registered
```

**Solution :**

1. **Redémarrer l'extension host** :
   - `Ctrl+Shift+P` → "Developer: Reload Window"

2. **Réinstaller Continue** :
   - `Ctrl+Shift+X`
   - Rechercher "Continue"
   - Désinstaller puis réinstaller

3. **Vérifier la configuration Continue** :
   - Le fichier de configuration Continue se trouve généralement dans :
     - Windows : `%APPDATA%\Continue\config.json`
     - Ou dans le workspace : `.continue/config.json`

### 4. ❌ Extension host devient non réactif

**Erreur :**
```
Extension host became UNRESPONSIVE
```

**Solution :**

1. **Redémarrer l'extension host** :
   - `Ctrl+Shift+P` → "Developer: Restart Extension Host"

2. **Identifier l'extension problématique** :
   - Ouvrir la console développeur : `Ctrl+Shift+I`
   - Vérifier les logs pour identifier l'extension qui bloque

3. **Désactiver temporairement les extensions** :
   - `Ctrl+Shift+X`
   - Désactiver les extensions non essentielles une par une
   - Redémarrer après chaque désactivation pour identifier le coupable

## 🔍 Vérification de la Configuration Continue

### Localisation des fichiers Continue

**Windows :**
```
%APPDATA%\Continue\config.json
%APPDATA%\Continue\models.json
```

**Ou dans le workspace :**
```
.continue/config.json
.continue/models.json
```

### Configuration Continue minimale

Si le fichier de configuration Continue n'existe pas, créer `.continue/config.json` :

```json
{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022"
    }
  ],
  "customCommands": [],
  "tabAutocompleteModel": {
    "title": "Claude 3.5 Sonnet",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022"
  },
  "allowAnonymousTelemetry": false,
  "docs": []
}
```

## ✅ Checklist de Résolution

- [ ] Extension YAML installée (`redhat.vscode-yaml`)
- [ ] Paramètres utilisateur sans erreurs JSON
- [ ] Extension host redémarré
- [ ] Continue réinstallé si nécessaire
- [ ] Configuration Continue valide
- [ ] Cursor redémarré complètement

## 🚀 Commandes Rapides

```powershell
# Installer YAML extension
cursor --install-extension redhat.vscode-yaml

# Vérifier les extensions installées
cursor --list-extensions | Select-String -Pattern "yaml|continue"

# Redémarrer Cursor (fermer et rouvrir)
```

## 📝 Notes

- Les erreurs Continue sont généralement non bloquantes pour le développement
- Si Continue ne fonctionne pas, vous pouvez toujours utiliser l'assistant IA intégré de Cursor
- Les erreurs `TypeError: Cannot read properties of null (reading 'elapsed')` sont souvent liées à des fichiers supprimés ou inaccessibles - généralement non bloquantes

