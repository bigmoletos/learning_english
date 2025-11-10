Build & Bundle Analysis

Vérifie le build et analyse la taille du bundle.

**Process:**

1. **Clean Build:**
   ```bash
   rm -rf build node_modules/.cache
   npm run build
   ```

2. **Build Analysis:**
   - Taille totale du bundle
   - Bundle par chunk
   - Dépendances les plus lourdes
   - Source maps

3. **Optimisations Détectées:**
   - Code splitting opportunities
   - Tree shaking inefficace
   - Duplicated dependencies
   - Large dependencies alternatives

4. **Performance:**
   - Time to Interactive (TTI)
   - First Contentful Paint (FCP)
   - Bundle size budget check

5. **Recommendations:**
   - Lazy loading suggestions
   - Dynamic imports
   - Dependency optimizations
   - Code splitting strategy

**Commandes utilisées:**
- `npm run build`
- `npm run analyze` (source-map-explorer)
- `du -sh build/*` (tailles)
