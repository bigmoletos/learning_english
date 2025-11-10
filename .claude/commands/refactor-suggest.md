Refactoring Suggestions

Analyse le code et suggère des refactorings.

**Analyse:**

1. **Code Smells Detection:**
   - Duplicated code
   - Long functions (>50 lignes)
   - Too many parameters (>4)
   - Deep nesting (>3 niveaux)
   - God objects/components
   - Dead code

2. **TypeScript Improvements:**
   - `any` types → types stricts
   - Type assertions → type guards
   - Union types → discriminated unions
   - Missing return types
   - Enums vs const objects

3. **React Patterns:**
   - Component composition
   - Custom hooks extraction
   - Props drilling → Context
   - Large components → split
   - Class components → functional
   - Missing React.memo
   - useCallback/useMemo opportunities

4. **Architecture:**
   - Separation of concerns
   - Single Responsibility
   - DRY violations
   - Tight coupling
   - Missing abstractions

5. **Performance:**
   - Unnecessary re-renders
   - Heavy computations → memoization
   - Large bundles → code splitting
   - N+1 queries
   - Missing indexes (DB)

**Livrable:**

Pour chaque suggestion:
- 📍 Location (file:line)
- 🔴 Priorité (High/Medium/Low)
- 📝 Description du problème
- ✅ Solution proposée
- 💻 Code example (before/after)
- ⚡ Impact (readability/performance/maintainability)

**Options:**
- `--file <path>` : Analyser un fichier spécifique
- `--component <name>` : Analyser un component
- `--priority high` : Seulement priorité haute
