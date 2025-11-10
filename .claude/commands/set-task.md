# Set Task Status

Met à jour le statut de la tâche actuelle dans la status_line.

## Usage

```
/set-task "Description de la tâche" [icon]
```

## Exemples

- `/set-task "Code Review" "🔍"`
- `/set-task "Running Tests" "🧪"`
- `/set-task "Building" "⚙️"`
- `/set-task "Idle" "✓"`

## Instructions pour Claude

Extrayez la description et l'icône de la commande de l'utilisateur, puis exécutez :

```bash
bash .claude/scripts/update-task-status.sh "Description" "Icon"
```

Icônes suggérées selon le type de tâche :
- Code Review: 🔍
- Tests: 🧪
- Building: ⚙️
- Deploying: 🚀
- Debugging: 🐛
- Writing: ✍️
- Reading: 📖
- Analyzing: 📊
- Idle: ✓
- Error: ❌
- Success: ✅

Répondez avec un message court confirmant la mise à jour.
