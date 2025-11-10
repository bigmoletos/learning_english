#!/bin/bash
# Hook: Vérifications avant commit Git

echo "🔍 Pre-commit checks..."

# TypeScript compilation check
echo "📘 Checking TypeScript..."
npx tsc --noEmit 2>&1 | head -20
if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript errors found!"
fi

# ESLint check (erreurs seulement, pas warnings)
echo "🔍 Checking ESLint..."
npx eslint src/ --quiet --max-warnings 0 2>&1 | head -20
if [ $? -ne 0 ]; then
    echo "⚠️  ESLint errors found!"
fi

# Check for console.log in production code (pas dans tests)
echo "🔍 Checking for console.log..."
CONSOLE_LOGS=$(grep -r "console\.\(log\|debug\)" src/ --exclude-dir=__tests__ --exclude="*.test.*" --exclude="*.spec.*" | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
    echo "⚠️  Found $CONSOLE_LOGS console.log/debug statements"
    grep -r "console\.\(log\|debug\)" src/ --exclude-dir=__tests__ --exclude="*.test.*" --exclude="*.spec.*" | head -5
fi

# Check for TODO/FIXME
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo "📝 Found $TODO_COUNT TODO/FIXME comments"
fi

echo "✅ Pre-commit checks done"
exit 0
