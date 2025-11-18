---
description: Rules for performance optimization and memory management
alwaysApply: false
---

# Règles Performance & Optimisation

## Frugalité Mémoire

### Mesure et Monitoring

```typescript
// ✅ Bon - Monitoring de la mémoire
if (process.env.NODE_ENV === 'development') {
  const memoryUsage = performance.memory;
  console.log('Memory usage:', {
    used: `${(memoryUsage.usedJSHeapSize / 1048576).toFixed(2)} MB`,
    total: `${(memoryUsage.totalJSHeapSize / 1048576).toFixed(2)} MB`,
    limit: `${(memoryUsage.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
  });
}
```

### Techniques d'Optimisation Mémoire

#### 1. Nettoyage des Ressources
```typescript
// ✅ Bon - Nettoyage des subscriptions
useEffect(() => {
  const subscription = observable.subscribe(data => {
    // ...
  });
  
  return () => {
    subscription.unsubscribe(); // Nettoyer
  };
}, []);

// ❌ Mauvais - Pas de nettoyage
useEffect(() => {
  observable.subscribe(data => {
    // ...
  });
}, []);
```

#### 2. Object Pooling
```typescript
// ✅ Bon - Réutilisation d'objets
class ObjectPool<T> {
  private pool: T[] = [];
  
  acquire(): T {
    return this.pool.pop() || this.create();
  }
  
  release(obj: T): void {
    this.pool.push(obj);
  }
}
```

#### 3. Weak References
```typescript
// ✅ Bon - WeakMap pour éviter les memory leaks
const cache = new WeakMap<object, ExpensiveData>();

function getCachedData(key: object): ExpensiveData {
  if (!cache.has(key)) {
    cache.set(key, computeExpensiveData());
  }
  return cache.get(key)!;
}
```

#### 4. Limitation des Caches
```typescript
// ✅ Bon - Cache avec limite
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

## Frugalité en Taille

### Analyse des Bundles

```bash
# ✅ Analyser la taille du bundle
npm run build
npm run analyze

# Vérifier la taille des dépendances
npm ls --depth=0 | grep -E "MB|KB"
```

### Réduction des Dépendances

```typescript
// ✅ Bon - Utiliser des alternatives légères
import { format } from 'date-fns'; // ~2KB vs moment.js ~70KB
import axios from 'axios'; // Ou utiliser fetch natif si possible

// ❌ Mauvais - Dépendances lourdes inutiles
import moment from 'moment'; // Trop lourd pour des besoins simples
import lodash from 'lodash'; // Importer seulement ce dont on a besoin
```

### Tree Shaking

```typescript
// ✅ Bon - Import nommé pour tree shaking
import { debounce, throttle } from 'lodash-es';

// ❌ Mauvais - Import par défaut empêche tree shaking
import _ from 'lodash';
const debounced = _.debounce(...);
```

### Code Splitting

```typescript
// ✅ Bon - Lazy loading des routes
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));

// ✅ Bon - Dynamic import pour les composants lourds
const HeavyComponent = lazy(() => 
  import('./components/HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);
```

### Optimisation des Assets

```typescript
// ✅ Bon - Images optimisées
<img 
  src="image.webp" 
  srcSet="image-small.webp 400w, image-large.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="Description"
/>

// ❌ Mauvais - Images non optimisées
<img src="large-image.png" alt="Description" />
```

## Profiling et Mesure

### React Profiler

```typescript
// ✅ Utiliser React DevTools Profiler
// Mesurer les re-renders et identifier les composants lents
// Utiliser React.memo pour les composants coûteux

export const ExpensiveComponent = React.memo(({ data }) => {
  // Composant coûteux
}, (prevProps, nextProps) => {
  // Comparaison personnalisée si nécessaire
  return prevProps.data.id === nextProps.data.id;
});
```

### Performance API

```typescript
// ✅ Bon - Mesurer les performances
function measurePerformance(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

const duration = measurePerformance(() => {
  // Code à mesurer
});
console.log(`Execution time: ${duration}ms`);
```

### Lighthouse CI

```yaml
# ✅ Intégrer Lighthouse dans CI/CD
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://learning-english.iaproject.fr
    uploadArtifacts: true
```

## Principes et Patterns Connus

### Design Patterns Optimisés

1. **Observer Pattern** : Pour les événements, éviter les polling
2. **Factory Pattern** : Pour créer des objets de manière optimisée
3. **Singleton** : Utiliser avec précaution, seulement si nécessaire
4. **Strategy Pattern** : Pour éviter les conditions multiples

### Principes SOLID pour Performance

- **Single Responsibility** : Composants/services focalisés = plus faciles à optimiser
- **Open/Closed** : Extension sans modification = moins de re-renders
- **Dependency Inversion** : Injection de dépendances = meilleur testabilité et optimisation

### Frameworks et Bibliothèques Optimisées

- **React Query** : Pour le caching et la gestion d'état serveur
- **Zustand** : State management léger (vs Redux)
- **SWR** : Data fetching avec cache automatique
- **Immer** : Immutability sans overhead mémoire

## Checklist Performance

Avant de committer, vérifier :

- [ ] Bundle size analysé et acceptable (< 500KB gzipped idéalement)
- [ ] Pas de memory leaks (vérifier avec DevTools)
- [ ] Lazy loading pour les routes et composants lourds
- [ ] Images optimisées (WebP, lazy loading, responsive)
- [ ] Dépendances minimisées et justifiées
- [ ] Code splitting configuré
- [ ] Caches limités en taille
- [ ] Event listeners et subscriptions nettoyés
- [ ] Re-renders minimisés (React.memo, useMemo, useCallback)
- [ ] Performance mesurée et documentée si nécessaire

## Outils Recommandés

- **Chrome DevTools** : Memory profiler, Performance tab
- **webpack-bundle-analyzer** : Analyse de la taille des bundles
- **Lighthouse** : Audit de performance
- **React DevTools Profiler** : Analyse des re-renders
- **Source Map Explorer** : Analyse détaillée des bundles

