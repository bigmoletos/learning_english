#!/bin/bash
# Script pour mettre à jour le statut de la tâche dans la status_line
# Usage: update-task-status.sh "Task description" [icon]

TASK_FILE="/tmp/claude_task.txt"
TASK_DESC="${1:-Idle}"
ICON="${2:-✓}"

# Écrire le statut
echo "$ICON $TASK_DESC" > "$TASK_FILE"

# Log pour debug (optionnel)
if [ "$DEBUG" = "1" ]; then
  echo "[$(date '+%H:%M:%S')] Task status updated: $ICON $TASK_DESC" >> /tmp/claude_task.log
fi
