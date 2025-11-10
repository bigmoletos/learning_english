#!/bin/bash
# Hook: Auto-lint après Edit ou Write sur fichiers TypeScript/JavaScript

FILE_PATH="$1"

# Vérifier si c'est un fichier TS/JS/TSX/JSX
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
    echo "🔍 Linting: $FILE_PATH"

    # ESLint avec auto-fix
    npx eslint "$FILE_PATH" --fix 2>/dev/null

    # Prettier
    npx prettier --write "$FILE_PATH" 2>/dev/null

    echo "✅ Lint done: $FILE_PATH"
fi

exit 0
