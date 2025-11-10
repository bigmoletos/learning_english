#!/bin/bash
# Hook: Après npm install - vérifications de sécurité

echo "🔒 Security audit after npm install..."

# npm audit (seulement critiques et hautes)
echo "📊 Running npm audit..."
npm audit --audit-level=high 2>&1 | head -30

# Check for outdated packages
echo "📦 Checking outdated packages..."
npm outdated 2>&1 | head -20

# Vérifier la taille de node_modules
NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
echo "💾 node_modules size: $NODE_MODULES_SIZE"

echo "✅ Post-install checks done"
exit 0
