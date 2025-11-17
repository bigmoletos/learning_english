# 🚀 Spec Kit - Guide de Démarrage Rapide

**Auteur** : Guide basé sur Spec Kit
**Version** : 1.0
**Date** : 2025-01-27
**Contexte** : Guide pratique pour démarrer rapidement avec Spec-Driven Development

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.11+**
- **uv** (gestionnaire de paquets Python)
- **Git**
- Un **agent IA compatible** (Cursor, Claude Code, GitHub Copilot, etc.)

---

## ⚡ Installation Rapide

### Étape 1 : Installer Specify CLI

**Option recommandée** (installation persistante) :

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

**Option alternative** (usage ponctuel) :

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <NOM_PROJET>
```

### Étape 2 : Vérifier l'installation

```bash
specify check
```

Cette commande vérifie que tous les outils nécessaires sont installés (git, agent IA, etc.).

---

## 🎯 Workflow Complet avec Exemple

### Exemple : Créer une Application de Gestion de Tâches

#### **Étape 1 : Initialiser le projet**

```bash
# Initialiser un nouveau projet avec Cursor
specify init mon-gestionnaire-taches --ai cursor-agent

# Ou si vous êtes déjà dans un dossier
specify init --here --ai cursor-agent
```

#### **Étape 2 : Définir les principes du projet**

Dans votre assistant IA (Cursor), utilisez la commande :

```
/speckit.constitution Créer des principes axés sur la qualité du code, les standards de test, la cohérence de l'expérience utilisateur, et les exigences de performance. Le code doit être modulaire, bien documenté, et suivre les principes SOLID.
```

**Résultat attendu** : Création d'un fichier `CONSTITUTION.md` définissant les règles de développement du projet.

#### **Étape 3 : Spécifier les besoins fonctionnels**

```
/speckit.specify Créer une application de gestion de tâches qui permet aux utilisateurs de créer, modifier, supprimer et marquer comme terminées des tâches. Les tâches doivent avoir un titre, une description, une date d'échéance optionnelle, et un statut (à faire, en cours, terminée). L'interface doit afficher une liste de toutes les tâches avec la possibilité de les filtrer par statut. Les tâches peuvent être triées par date de création ou date d'échéance.
```

**Résultat attendu** : Création d'un fichier de spécification détaillant les besoins fonctionnels.

#### **Étape 4 : Créer le plan technique**

```
/speckit.plan L'application utilise React avec TypeScript et Vite comme bundler. Utiliser Tailwind CSS pour le styling. Les données sont stockées localement dans le localStorage du navigateur (pas de backend pour cette version). Utiliser React Hook Form pour la gestion des formulaires. Implémenter les tests unitaires avec Vitest et React Testing Library.
```

**Résultat attendu** : Création d'un plan d'implémentation technique détaillé.

#### **Étape 5 : Générer la liste des tâches**

```
/speckit.tasks
```

**Résultat attendu** : Création d'une liste de tâches actionnables décomposant le plan en étapes concrètes.

#### **Étape 6 : Implémenter la fonctionnalité**

```
/speckit.implement
```

**Résultat attendu** : Exécution automatique de toutes les tâches pour construire l'application selon le plan.

---

## 🔧 Commandes Disponibles

### Commandes Principales (Workflow Standard)

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/speckit.constitution` | Créer/éditer les principes du projet | `/speckit.constitution Focus sur sécurité et performance` |
| `/speckit.specify` | Définir ce que vous voulez construire | `/speckit.specify Créer un blog avec authentification` |
| `/speckit.plan` | Créer le plan technique | `/speckit.plan Utiliser Next.js, PostgreSQL, et Auth0` |
| `/speckit.tasks` | Générer la liste des tâches | `/speckit.tasks` |
| `/speckit.implement` | Exécuter l'implémentation | `/speckit.implement` |

### Commandes Optionnelles (Amélioration de la Qualité)

| Commande | Description | Quand l'utiliser |
|----------|-------------|------------------|
| `/speckit.clarify` | Clarifier les zones sous-spécifiées | Avant `/speckit.plan` |
| `/speckit.analyze` | Analyse de cohérence et couverture | Après `/speckit.tasks`, avant `/speckit.implement` |
| `/speckit.checklist` | Générer des checklists de qualité | À tout moment pour validation |

---

## 📝 Exemple Complet : Application de Notes

### Scénario
Créer une application simple de prise de notes avec recherche et catégories.

### Commandes à exécuter dans l'ordre

#### 1. Initialisation
```bash
specify init notes-app --ai cursor-agent
cd notes-app
```

#### 2. Constitution
```
/speckit.constitution Le projet doit suivre les principes de code propre, avec des tests unitaires pour chaque composant critique. L'interface doit être responsive et accessible (WCAG 2.1 AA). Les performances doivent être optimisées pour un chargement initial < 2 secondes.
```

#### 3. Spécification
```
/speckit.specify Créer une application de prise de notes où les utilisateurs peuvent créer, éditer, supprimer et rechercher des notes. Chaque note a un titre, un contenu (markdown supporté), une date de création/modification, et peut être associée à une ou plusieurs catégories. Les notes peuvent être filtrées par catégorie et triées par date. L'interface affiche une liste de notes à gauche et l'éditeur à droite. La recherche doit être en temps réel et rechercher dans le titre et le contenu.
```

#### 4. Plan Technique
```
/speckit.plan Utiliser Next.js 14 avec App Router, TypeScript, et Tailwind CSS. Stocker les notes dans une base de données SQLite locale avec Prisma comme ORM. Utiliser shadcn/ui pour les composants UI. Implémenter la recherche avec Fuse.js. Utiliser Zustand pour la gestion d'état globale. Tests avec Vitest et Playwright pour les tests E2E.
```

#### 5. Génération des Tâches
```
/speckit.tasks
```

#### 6. Implémentation
```
/speckit.implement
```

---

## 🛠️ Options Avancées de `specify init`

### Exemples d'utilisation

```bash
# Initialiser avec PowerShell (Windows)
specify init mon-projet --ai copilot --script ps

# Initialiser dans le dossier actuel
specify init --here --ai cursor-agent

# Forcer l'initialisation sans confirmation
specify init --here --force --ai cursor-agent

# Initialiser sans Git
specify init mon-projet --ai cursor-agent --no-git

# Mode debug pour troubleshooting
specify init mon-projet --ai cursor-agent --debug

# Utiliser un token GitHub (environnements d'entreprise)
specify init mon-projet --ai cursor-agent --github-token ghp_votre_token
```

---

## 🔍 Variables d'Environnement

### `SPECIFY_FEATURE`

Pour les dépôts non-Git ou pour travailler sur une fonctionnalité spécifique :

```bash
# Définir la fonctionnalité avant d'utiliser /speckit.plan
export SPECIFY_FEATURE=001-gestion-notes
```

**Important** : Cette variable doit être définie dans le contexte de votre agent IA avant d'utiliser `/speckit.plan` ou les commandes suivantes.

---

## ✅ Checklist de Vérification

Avant de commencer un nouveau projet avec Spec Kit :

- [ ] Python 3.11+ installé
- [ ] `uv` installé et accessible dans PATH
- [ ] Git installé et configuré
- [ ] Agent IA compatible installé (Cursor, Claude Code, etc.)
- [ ] `specify check` exécuté avec succès
- [ ] Projet initialisé avec `specify init`

---

## 🐛 Dépannage

### Problème : `specify` command not found

**Solution** : Vérifier que `uv` est dans votre PATH et réinstaller :

```bash
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git
```

### Problème : Les commandes `/speckit.*` ne sont pas disponibles

**Solution** : Vérifier que vous êtes dans un projet initialisé avec `specify init` et que votre agent IA est compatible.

### Problème : Erreurs d'authentification Git

**Solution** : Configurer Git Credential Manager (voir section Troubleshooting dans SPEC-KIT.md).

---

## 📚 Ressources Complémentaires

- **Documentation complète** : Voir `SPEC-KIT.md`
- **Méthodologie détaillée** : [Complete Spec-Driven Development Methodology](https://github.com/github/spec-kit)
- **Guide pas à pas** : [Detailed Walkthrough](https://github.com/github/spec-kit)

---

## 💡 Conseils Pratiques

1. **Commencez simple** : Testez d'abord avec un projet petit pour comprendre le workflow
2. **Itérez** : Utilisez `/speckit.clarify` si les spécifications sont floues
3. **Validez** : Utilisez `/speckit.analyze` avant l'implémentation pour vérifier la cohérence
4. **Documentez** : Les fichiers générés (CONSTITUTION.md, SPEC.md, etc.) sont votre documentation vivante

---

**Note** : Ce guide est une version condensée. Pour plus de détails, consultez `SPEC-KIT.md`.

<<<END>>>

