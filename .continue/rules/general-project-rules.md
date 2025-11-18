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

4. **Performance**
   - Optimiser les requêtes et les appels API
   - Utiliser le lazy loading pour les composants volumineux
   - Minimiser les re-renders inutiles
   - Surveiller la taille des bundles

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
