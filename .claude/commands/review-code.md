Code Review Complet

Effectue une revue de code approfondie du code récent ou spécifié.

**Instructions:**

**IMPORTANT:** Avant de commencer, exécutez :
```bash
bash .claude/scripts/update-task-status.sh "Code Review" "🔍"
```

Puis suivez ces étapes en mettant à jour le statut :

1. **Analyse Git** - Regarde les derniers commits et fichiers modifiés
   ```bash
   bash .claude/scripts/update-task-status.sh "Analyzing Git" "📊"
   ```

2. **Qualité du Code:**
   ```bash
   bash .claude/scripts/update-task-status.sh "Code Quality" "✨"
   ```
   - Lisibilité et clarté
   - Respect des conventions TypeScript/React
   - Patterns et architecture
   - Complexité cyclomatique

3. **Performance:**
   ```bash
   bash .claude/scripts/update-task-status.sh "Performance" "⚡"
   ```
   - Re-renders inutiles (React)
   - Opérations coûteuses
   - Optimisations possibles

4. **Sécurité:**
   ```bash
   bash .claude/scripts/update-task-status.sh "Security" "🔒"
   ```
   - Validation des inputs
   - Injection XSS/SQL
   - Gestion des secrets
   - Authentification/Autorisation

5. **Tests:**
   ```bash
   bash .claude/scripts/update-task-status.sh "Tests" "🧪"
   ```
   - Coverage existant
   - Tests manquants critiques

6. **Best Practices:**
   ```bash
   bash .claude/scripts/update-task-status.sh "Best Practices" "📋"
   ```
   - React hooks rules
   - TypeScript types (pas de `any`)
   - Error handling
   - Accessibilité

**À la fin, réinitialisez:**
```bash
bash .claude/scripts/update-task-status.sh "Idle" "✓"
```

**Livrable:** Rapport structuré avec:
- ✅ Points positifs
- ⚠️ Warnings
- ❌ Problèmes critiques
- 💡 Suggestions d'amélioration
