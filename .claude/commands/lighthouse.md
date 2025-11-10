Lighthouse Performance Audit

Analyse performance complète avec Google Lighthouse.

**Process:**

1. **Build de Production:**
   ```bash
   npm run build
   npx serve -s build -l 3000
   ```

2. **Lighthouse Audit:**
   ```bash
   npx lighthouse http://localhost:3000 \
     --output html \
     --output json \
     --output-path ./lighthouse-report \
     --chrome-flags="--headless"
   ```

3. **Analyse des Métriques:**
   - Performance Score (target: >90)
   - Accessibility Score (target: >90)
   - Best Practices (target: >90)
   - SEO Score (target: >90)
   - PWA Score (if applicable)

4. **Core Web Vitals:**
   - **LCP (Largest Contentful Paint)** - target: <2.5s
   - **FID (First Input Delay)** - target: <100ms
   - **CLS (Cumulative Layout Shift)** - target: <0.1
   - **FCP (First Contentful Paint)** - target: <1.8s
   - **TTI (Time to Interactive)** - target: <3.8s
   - **TBT (Total Blocking Time)** - target: <200ms
   - **SI (Speed Index)** - target: <3.4s

5. **Opportunités d'Optimisation:**
   - Images non optimisées
   - Render-blocking resources
   - Unused JavaScript/CSS
   - Text compression
   - Server response times
   - Cache policy
   - Lazy loading opportunities

6. **Diagnostics:**
   - DOM size (target: <1500 nodes)
   - Critical request chains
   - JavaScript execution time
   - Main thread work
   - Network RTT

**Recommandations par Score:**

### Performance < 50 (Rouge)
🔴 **Actions urgentes:**
- Code splitting agressif
- Lazy loading images
- Remove unused code
- Optimize third-party scripts
- CDN pour assets statiques

### Performance 50-89 (Orange)
🟡 **Améliorations:**
- Optimize images (WebP, compression)
- Minify CSS/JS
- Defer non-critical CSS
- Preload critical resources
- Service Worker caching

### Performance 90+ (Vert)
🟢 **Maintenance:**
- Monitor régulièrement
- Budget de performance
- Lighthouse CI dans pipeline

**CI/CD Integration:**

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

**Configuration Lighthouse CI:**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run serve",
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["warn", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Livrable:**
- Rapport HTML détaillé
- Rapport JSON pour CI/CD
- Liste prioritaire d'optimisations
- Budget de performance recommandé
