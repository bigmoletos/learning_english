Fix ESLint & Prettier

Corrige automatiquement les erreurs ESLint et Prettier.

**Process:**

1. Exécute `npm run lint` pour voir les erreurs
2. Analyse les erreurs par catégorie
3. Corrige automatiquement ce qui est possible:
   - Formatage (Prettier)
   - Imports non utilisés
   - Variables non utilisées
   - Missing semicolons
   - Quotes inconsistency
4. Liste les erreurs nécessitant une correction manuelle
5. Re-lance ESLint pour vérifier

**Options (à préciser en argument):**
- `--frontend` : Seulement le frontend
- `--backend` : Seulement le backend
- `--fix-auto` : N'appliquer que les auto-fix
- `--report` : Juste générer un rapport sans corriger
