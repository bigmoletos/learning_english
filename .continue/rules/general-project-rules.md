---
description: General guidelines for all developers working on the AI English Trainer project
alwaysApply: true
---

# Règles Générales du Projet

## Principes Fondamentaux

1. **Qualité du Code**
   - Toujours écrire du code propre, lisible et maintenable
   - Respecter les conventions de nommage du projet
   - Documenter le code complexe avec des commentaires explicatifs
   - Éviter la duplication de code (DRY principle)

2. **Tests**
   - Tous les tests doivent passer avant de committer
   - Couverture de code minimale : 10% (seuils ajustés selon la maturité du projet)
   - Écrire des tests unitaires pour toute nouvelle fonctionnalité
   - Les tests doivent être indépendants et reproductibles

3. **Sécurité**
   - Ne jamais committer de secrets, credentials ou fichiers `.env`
   - Valider toutes les entrées utilisateur
   - Utiliser des variables d'environnement pour les configurations sensibles
   - Respecter les principes de sécurité (OWASP Top 10)

4. **Performance & Frugalité**
   - **Optimiser les requêtes et les appels API** : Réduire le nombre de requêtes, utiliser le caching
   - **Lazy loading** : Charger les composants volumineux à la demande
   - **Minimiser les re-renders** : Utiliser React.memo, useMemo, useCallback
   - **Surveiller la taille des bundles** : Analyser avec webpack-bundle-analyzer
   - **Frugalité mémoire** :
     - Tester régulièrement la consommation mémoire avec les DevTools
     - Utiliser des techniques de mémoire optimisées (object pooling, weak references)
     - Éviter les memory leaks (nettoyer les event listeners, subscriptions, timers)
     - Limiter la taille des caches et des données en mémoire
   - **Frugalité en taille** :
     - Minimiser les dépendances (vérifier la taille avec `npm ls --depth=0`)
     - Utiliser des alternatives légères (date-fns vs moment.js, axios vs fetch)
     - Code splitting et tree shaking
     - Optimiser les images et assets (compression, formats modernes)
   - **Frameworks et principes connus** :
     - Utiliser des patterns éprouvés (Observer, Factory, Singleton si approprié)
     - Suivre les principes SOLID pour maintenir un code efficient
     - Utiliser des bibliothèques optimisées et maintenues
     - Profiler avant d'optimiser (mesurer, optimiser, mesurer à nouveau)

5. **Git & Commits**
   - Format de commit : `type(scope): description`
   - Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
   - Faire des commits atomiques et descriptifs
   - Ne jamais faire de `--force` push sur main/master

6. **Documentation**
   - Mettre à jour la documentation lors de changements majeurs
   - Documenter les APIs et les interfaces publiques
   - Maintenir les README à jour

## Standards du Projet Actuel

- **Indentation** : 2 espaces
- **Guillemets** : Double quotes (`"`)
- **Point-virgules** : Oui
- **Limite de taille de fichier** : 300 lignes (idéalement)
- **TypeScript** : Strict mode activé
- **React** : Functional components uniquement
- **Hooks** : useState, useEffect, useContext, useReducer

## Workflow

1. Créer une branche depuis `main`
2. Développer et tester localement
3. S'assurer que tous les tests passent
4. Créer une Pull Request avec description détaillée
5. Attendre la review avant de merger
