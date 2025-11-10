Performance Analysis

Analyse complète des performances de l'application.

**Process:**

1. **Bundle Analysis:**
   - Taille totale du bundle
   - Code splitting effectiveness
   - Largest dependencies
   - Tree-shaking opportunities

2. **React Performance:**
   - Components avec re-renders excessifs
   - Missing memoization (React.memo, useMemo, useCallback)
   - Props drilling vs Context
   - Large component trees
   - Virtual DOM thrashing

3. **Network:**
   - API calls optimisations
   - Request batching opportunities
   - Caching strategy
   - Lazy loading assets
   - Image optimizations

4. **Database (Backend):**
   - N+1 query problems
   - Missing indexes
   - Slow queries
   - Connection pooling

5. **Runtime:**
   - Heavy computations à optimiser
   - Memory leaks potentiels
   - Event listener cleanup
   - Infinite loops/recursion

6. **Build Time:**
   - Compilation time
   - Hot reload performance
   - CI/CD build time

**Outils utilisés:**
```bash
npm run build
npm run analyze
# React DevTools Profiler
# Chrome DevTools Performance
```

**Livrable:**
- Rapport de performance avec scores
- Top 10 problèmes par impact
- Suggestions d'optimisation priorisées
- Code examples (before/after)

**Métriques cibles:**
- Initial bundle: <500KB
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Lighthouse Score: >90
