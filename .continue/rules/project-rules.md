---
description: Specific rules for the AI English Trainer project
alwaysApply: true
---

# Règles Spécifiques du Projet : AI English Trainer

> **Note** : Les règles générales universelles sont définies dans `C:\Users\romar\.continue\rules\general-project-rules.md` et sont automatiquement appliquées à tous les projets.

## Standards Spécifiques au Projet

Ces standards s'appliquent uniquement à ce projet et complètent les règles générales universelles.

### Formatage du Code

- **Indentation** : 2 espaces
- **Guillemets** : Double quotes (`"`)
- **Point-virgules** : Oui
- **Limite de taille de fichier** : 300 lignes (idéalement)

### Technologies Utilisées

- **TypeScript** : Strict mode activé
- **React** : Functional components uniquement
- **Hooks** : useState, useEffect, useContext, useReducer

### Conventions Spécifiques

- **Structure des dossiers** :
  - `src/agents/` : Logique des agents IA (analyse, scoring)
  - `src/corpus/` : Documents techniques et ressources linguistiques
  - `src/components/` : Composants React organisés par fonctionnalité

### Configuration IA

- **Context window** : 12000 tokens
- **Temperature** : 0.2
- **Top P** : 0.95
- **Stop sequences** : `["\n\n", "---"]`

## Workflow Projet

1. Créer une branche depuis `main`
2. Développer et tester localement
3. S'assurer que tous les tests passent
4. Créer une Pull Request avec description détaillée
5. Attendre la review avant de merger

## Références

- Règles générales universelles : `C:\Users\romar\.continue\rules\general-project-rules.md`
- Règles technologiques : `C:\Users\romar\.continue\rules\` (react-typescript.md, nodejs-backend.md, etc.)
