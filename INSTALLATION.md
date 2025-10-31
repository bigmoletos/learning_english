# Guide d'Installation - AI English Trainer for IT Professionals

**Version**: 1.0.0  
**Date**: 31 octobre 2025  
**Auteur**: AI English Trainer Team

---

## Prérequis

### Logiciels requis

- **Node.js**: version 18.x ou supérieure
- **npm**: version 9.x ou supérieure (inclus avec Node.js)
- **Navigateur**: Chrome, Edge, ou Firefox (récent)
  - Note: La reconnaissance vocale fonctionne mieux sur Chrome/Edge

### Vérification des versions

```bash
node --version  # Devrait afficher v18.x ou supérieur
npm --version   # Devrait afficher 9.x ou supérieur
```

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-utilisateur/ai-english-trainer-it.git
cd ai-english-trainer-it
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires :
- React et React DOM
- Material-UI pour l'interface
- TypeScript
- Bibliothèques de reconnaissance vocale
- Natural pour le traitement du langage
- Et toutes les autres dépendances listées dans `package.json`

**Note**: L'installation peut prendre quelques minutes selon votre connexion internet.

---

## Lancement de l'application

### Mode développement

```bash
npm start
```

Cette commande :
- Lance le serveur de développement
- Ouvre automatiquement votre navigateur sur `http://localhost:3000`
- Active le rechargement automatique (Hot Module Replacement)

**L'application devrait s'ouvrir automatiquement dans votre navigateur.**

Si ce n'est pas le cas, ouvrez manuellement : `http://localhost:3000`

---

## Configuration de la reconnaissance vocale

### Autoriser l'accès au microphone

Lors de la première utilisation de la reconnaissance vocale :

1. Votre navigateur vous demandera l'autorisation d'accéder au microphone
2. **Cliquez sur "Autoriser"** pour activer cette fonctionnalité
3. Cette autorisation sera mémorisée pour les prochaines sessions

### Tester la reconnaissance vocale

1. Allez dans la section "Exercices"
2. Choisissez un exercice oral
3. Cliquez sur "Commencer l'enregistrement"
4. Parlez en anglais
5. Cliquez sur "Arrêter" pour voir la transcription

---

## Structure du projet

```
ai-english-trainer/
├── public/
│   ├── corpus/
│   │   ├── technical/        # 10 documents techniques (IA, DevOps, etc.)
│   │   ├── grammar/          # 2 règles grammaticales
│   │   └── dictionaries/     # Dictionnaire FR-EN/EN-FR
│   └── index.html
├── src/
│   ├── agents/               # Agent IA pour l'analyse
│   │   └── progressAgent.ts
│   ├── components/           # Composants React
│   │   ├── layout/
│   │   │   └── Dashboard.tsx
│   │   ├── exercises/
│   │   │   ├── QCMExercise.tsx
│   │   │   └── ClozeExercise.tsx
│   │   ├── voice/
│   │   │   └── VoiceRecorder.tsx
│   │   └── progress/
│   │       └── ProgressTracker.tsx
│   ├── contexts/             # Contextes React
│   │   └── UserContext.tsx
│   ├── data/                 # Données d'exercices
│   │   └── exercises/
│   ├── hooks/                # Hooks personnalisés
│   │   └── useSpeechRecognition.ts
│   ├── types/                # Types TypeScript
│   │   └── index.ts
│   ├── App.tsx               # Composant principal
│   └── index.tsx             # Point d'entrée
├── package.json
├── tsconfig.json
└── README.md
```

---

## Fonctionnalités disponibles

### ✅ Implémenté

- **Tableau de bord**: Vue d'ensemble de votre progression
- **Reconnaissance vocale**: Entraînement à l'oral avec transcription
- **Analyse IA**: Évaluation automatique des réponses
- **Exercices QCM**: 6 exercices sur des thèmes IT
- **Textes à trous**: 5 exercices de grammaire
- **Suivi de progression**: Graphiques et recommandations
- **Corpus documentaire**: 10 documents techniques niveau B2-C1
- **Ressources grammaticales**: 2 leçons (Present Perfect, Passive Voice)

### 🚧 À venir

- Tests TOEIC/TOEFL complets
- Plus d'exercices (QCM, textes à trous)
- Exercices de compréhension orale avec audio
- Exercices de compréhension écrite
- Expansion du dictionnaire technique
- Export des résultats
- Mode hors ligne

---

## Scripts disponibles

### `npm start`
Lance l'application en mode développement sur `http://localhost:3000`.

### `npm run build`
Compile l'application pour la production dans le dossier `build/`.
L'application est optimisée pour les meilleures performances.

### `npm test`
Lance les tests (à configurer).

### `npm run analyze`
Analyse la taille des bundles JavaScript (après `npm run build`).

---

## Résolution des problèmes

### L'application ne démarre pas

**Erreur**: `Cannot find module...`
- **Solution**: Exécutez `npm install` pour réinstaller les dépendances

**Erreur**: `Port 3000 is already in use`
- **Solution**: Arrêtez l'application qui utilise le port 3000, ou définissez un autre port :
  ```bash
  PORT=3001 npm start
  ```

### La reconnaissance vocale ne fonctionne pas

**Symptôme**: Message "Votre navigateur ne supporte pas la reconnaissance vocale"
- **Solution**: Utilisez Chrome ou Edge (Firefox a un support limité)

**Symptôme**: Aucune transcription n'apparaît
- **Solution**: 
  1. Vérifiez que le microphone est autorisé dans les paramètres du navigateur
  2. Testez votre microphone dans une autre application
  3. Vérifiez que vous êtes en HTTPS ou sur localhost

### Problèmes de performance

**Symptôme**: L'application est lente
- **Solution**: 
  1. Fermez les onglets inutiles
  2. Vérifiez que votre navigateur est à jour
  3. Redémarrez l'application avec `npm start`

---

## Support et Contact

### Rapporter un bug

Pour rapporter un bug, créez une issue sur GitHub avec :
- Description du problème
- Étapes pour reproduire
- Version du navigateur et de Node.js
- Captures d'écran si pertinent

### Demander une fonctionnalité

Les demandes de fonctionnalités sont les bienvenues ! Créez une issue avec le label "enhancement".

---

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## Prochaines étapes

Une fois l'installation réussie :

1. **Créez votre profil**: L'application créera automatiquement un profil lors du premier lancement
2. **Explorez le tableau de bord**: Familiarisez-vous avec l'interface
3. **Commencez par les exercices**: Choisissez des exercices adaptés à votre niveau
4. **Testez la reconnaissance vocale**: Essayez les exercices oraux
5. **Suivez votre progression**: Consultez régulièrement votre analyse de progression

**Bon apprentissage !** 🚀

---

<<<END>>>

