# Status Line Configuration

## Vue d'ensemble

La status_line affiche des informations en temps réel en bas de votre terminal Claude Code.

### Affichage actuel

**Gauche :**
- 📁 Répertoire de travail
- ⎇ Branche Git
- Statut Git (modifié/propre)
- 📋 Tâche en cours

**Droite :**
- ⬢ Version Node.js
- 🟢/⚫ Serveur Dev (ON/OFF)
- 🕐 Horloge

---

## Système de Tâches (Option 1)

### Utilisation automatique par Claude

Quand vous lancez une commande comme `/review-code`, Claude peut automatiquement mettre à jour le statut :

```bash
bash .claude/scripts/update-task-status.sh "Code Review" "🔍"
```

### Utilisation manuelle

```bash
/set-task "Ma tâche" "🎯"
```

### Réinitialiser

```bash
bash .claude/scripts/update-task-status.sh "Idle" "✓"
```

---

## Fichiers

- **Configuration** : `.claude/settings.local.json`
- **Script helper** : `.claude/scripts/update-task-status.sh`
- **Fichier de statut** : `/tmp/claude_task.txt`
- **Commande slash** : `.claude/commands/set-task.md`

---

## Personnalisation

### Ajouter un élément à gauche

```json
{
  "type": "custom",
  "command": "echo 'Mon texte'",
  "icon": "🔥",
  "color": "red",
  "cache": false
}
```

### Couleurs disponibles

- `blue`, `cyan`, `green`, `magenta`, `red`, `yellow`, `white`, `gray`

### Changer le séparateur

```json
"separator": " | "  // ou " │ " ou " • "
```

### Intervalle de rafraîchissement

```json
"refreshInterval": 3000  // en millisecondes (3 secondes)
```

---

## Troubleshooting

### La status_line ne s'affiche pas

1. Vérifiez que `"enabled": true`
2. Redémarrez Claude Code
3. Vérifiez la syntaxe JSON avec : `jq . .claude/settings.local.json`

### Une commande custom ne fonctionne pas

Testez-la directement dans le terminal :
```bash
node -v  # Devrait afficher la version
```

### Le statut de tâche ne se met pas à jour

```bash
# Vérifier le fichier
cat /tmp/claude_task.txt

# Forcer la mise à jour
echo "✓ Idle" > /tmp/claude_task.txt
```

---

## Exemples d'icônes

- 🚀 Lancement
- 🔍 Analyse
- 🧪 Tests
- ⚙️ Build
- 🐛 Debug
- ✍️ Écriture
- 📖 Lecture
- 📊 Stats
- ✓ Terminé
- ❌ Erreur
- ✅ Succès
- ⏸️ Pause
- 🔄 Sync
- 🗂️ Fichiers
- 💾 Sauvegarde
