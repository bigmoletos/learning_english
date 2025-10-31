# **AI English Trainer for IT Professionals** (B2→C1)

**Outil d'entraînement en anglais technique** spécialisé en **IA, DevOps, Cybersécurité**, avec préparation **TOEIC/TOEFL** et **agent IA** pour analyse des réponses.

![Demo](https://via.placeholder.com/800x400/1E88E5/FFFFFF?text=AI+English+Trainer+for+IT)

---

## 🎯 Objectifs

- **Atteindre le niveau C1** en anglais technique (IA/DevOps) en **6-12 mois**
- **Préparation intensive** aux certifications **TOEIC/TOEFL** (niveaux B2→C1)
- **Analyse des réponses** par un agent IA pour une progression personnalisée
- **Focus métiers IT** :
  - Dette technique et **Angular memory leaks**
  - **Vibe Coding** et outils comme Cursor
  - **RAG systems** et conformité **RGPD/IA Act**
  - **MLOps/CI-CD** pour les projets IA
  - **Cybersécurité** et bonnes pratiques
  - **DevOps** et Cloud Computing

---

## ✨ Fonctionnalités Principales

| Fonctionnalité | Détails | Statut |
|----------------|---------|--------|
| **Tableau de bord interactif** | Vue d'ensemble de votre progression avec statistiques détaillées | ✅ Disponible |
| **Agent IA d'analyse** | Évaluation automatique des réponses avec détection des faiblesses | ✅ Disponible |
| **Reconnaissance vocale** | Entraînement à l'oral avec transcription en temps réel | ✅ Disponible |
| **Synthèse vocale** | Écoute des textes en anglais avec voix naturelle | ✅ Disponible |
| **Exercices QCM** | Questions à choix multiples sur des thèmes IT | ✅ 6 exercices |
| **Textes à trous** | Exercices de grammaire contextualisés | ✅ 5 exercices |
| **Corpus technique** | Documents sur IA, DevOps, Cybersécurité (B2-C1) | ✅ 10 documents |
| **Ressources grammaticales** | Leçons détaillées avec exemples IT | ✅ 2 leçons |
| **Dictionnaire technique** | Mots FR-EN/EN-FR spécialisés IT | ✅ 20 entrées |
| **Suivi adaptatif** | Progression personnalisée basée sur vos résultats | ✅ Disponible |
| **Tests TOEIC/TOEFL** | Examens blancs complets avec corrections | 🚧 À venir |

---

## 📦 Installation

### Prérequis

- **Node.js** 18.x ou supérieur
- **npm** 9.x ou supérieur
- **Chrome** ou **Edge** (pour la reconnaissance vocale)

### Installation rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/bigmoletos/learning_english.git
cd learning_english

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm start
```

L'application s'ouvrira automatiquement sur `http://localhost:3000`.

**Pour plus de détails**, consultez [INSTALLATION.md](./INSTALLATION.md).

---

## 🚀 Utilisation

### 1. Tableau de bord

Le tableau de bord affiche :
- **Votre niveau actuel** et progression vers l'objectif
- **Nombre d'exercices complétés**
- **Score moyen** sur tous les exercices
- **Temps d'étude** et série de jours consécutifs
- **Points forts** et **points à améliorer**

### 2. Exercices

#### QCM (Questions à Choix Multiples)
- 6 exercices disponibles couvrant :
  - Machine Learning fundamentals
  - Angular memory management
  - RAG systems architecture
  - MLOps et CI/CD
  - GDPR et protection des données
  - Cybersécurité avancée

#### Textes à trous
- 5 exercices de grammaire contextualisés
- Thèmes : Technical debt, Angular, AI Act, DevOps, Cybersecurity
- Feedback immédiat et explications détaillées

### 3. Reconnaissance vocale

1. Cliquez sur **"Commencer l'enregistrement"**
2. Autorisez l'accès au microphone
3. Lisez le texte affiché ou parlez librement
4. Cliquez sur **"Arrêter"**
5. Consultez votre transcription et le score de confiance

### 4. Analyse de progression

Accédez à la section **"Progression"** pour voir :
- **Score global, grammatical, et vocabulaire**
- **Domaines à améliorer** (identifiés par l'IA)
- **Points forts**
- **Exercices recommandés** basés sur votre analyse

---

## 📚 Corpus Documentaire

### Documents techniques (10 disponibles)

1. **Technical Debt** - Understanding and managing technical debt
2. **Angular Memory Leaks** - Debugging memory leaks in Angular
3. **RAG Systems** - Retrieval-Augmented Generation explained
4. **MLOps & CI/CD** - ML operations and continuous deployment
5. **GDPR for AI** - GDPR compliance for AI systems
6. **EU AI Act** - Comprehensive overview of AI regulation
7. **Vibe Coding with Cursor** - AI-powered development
8. **Cybersecurity & AI** - Security in the age of AI
9. **DevOps Practices** - Modern DevOps culture
10. **Cloud Computing** - Fundamentals and best practices

### Ressources grammaticales (2 disponibles)

1. **Present Perfect** - Formation, uses, and common mistakes
2. **Passive Voice** - Technical writing with passive constructions

---

## 🤖 Agent IA

L'agent IA intégré analyse vos réponses pour :

### Fonctionnalités

✅ **Détection des faiblesses** : Identifie automatiquement vos domaines à améliorer  
✅ **Scoring adaptatif** : Évalue précisément vos compétences grammaticales et vocabulaire  
✅ **Recommandations personnalisées** : Suggère 3 exercices ciblés selon vos besoins  
✅ **Analyse écrite** : Fournit un feedback détaillé sur vos réponses rédigées  
✅ **Progression dynamique** : Ajuste le niveau de difficulté en temps réel

### Algorithmes utilisés

- **Natural Language Processing** : Tokenisation et analyse sémantique
- **Pattern Recognition** : Détection des erreurs récurrentes
- **Similarity Matching** : Comparaison de vos réponses avec les modèles attendus
- **Statistical Analysis** : Calcul de scores et tendances

---

## 🏗️ Architecture du projet

```
ai-english-trainer/
├── public/
│   ├── corpus/
│   │   ├── technical/          # 10 documents techniques
│   │   ├── grammar/            # 2 leçons grammaticales
│   │   └── dictionaries/       # Dictionnaire EN-FR
│   └── index.html
├── src/
│   ├── agents/                 # Agent IA
│   │   └── progressAgent.ts    # Logique d'analyse et scoring
│   ├── components/             # Composants React
│   │   ├── layout/
│   │   │   └── Dashboard.tsx   # Tableau de bord
│   │   ├── exercises/
│   │   │   ├── QCMExercise.tsx
│   │   │   └── ClozeExercise.tsx
│   │   ├── voice/
│   │   │   └── VoiceRecorder.tsx
│   │   └── progress/
│   │       └── ProgressTracker.tsx
│   ├── contexts/
│   │   └── UserContext.tsx     # Gestion d'état global
│   ├── data/
│   │   └── exercises/          # JSON d'exercices
│   ├── hooks/
│   │   └── useSpeechRecognition.ts
│   ├── types/
│   │   └── index.ts            # Types TypeScript
│   ├── App.tsx                 # Composant principal
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Technologies utilisées

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Material-UI** - Composants UI modernes
- **React Router** - Navigation

### IA & NLP
- **Natural.js** - Traitement du langage naturel
- **Lodash** - Utilitaires pour l'analyse
- **Custom AI Agent** - Analyse personnalisée

### Reconnaissance vocale
- **Web Speech API** - Reconnaissance vocale native
- **SpeechSynthesis API** - Synthèse vocale

### Build & Dev
- **React Scripts** - Configuration Webpack
- **ESLint** - Linting du code
- **TypeScript Compiler** - Compilation TypeScript

---

## 📊 Thèmes couverts

### Intelligence Artificielle
- Machine Learning & Deep Learning
- Neural Networks & NLP
- RAG Systems (Retrieval-Augmented Generation)
- AI Ethics & Regulation (AI Act, GDPR)
- MLOps & Model Deployment

### DevOps & Cloud
- CI/CD Pipelines
- Container Orchestration (Kubernetes)
- Infrastructure as Code
- Monitoring & Observability
- Cloud Computing (AWS, Azure, GCP)

### Software Engineering
- Technical Debt Management
- Code Refactoring & Clean Code
- Angular Development & Memory Management
- Vibe Coding with AI Tools (Cursor)
- Testing & Quality Assurance

### Cybersecurity
- Threat Detection & Analysis
- Zero Trust Architecture
- Adversarial Machine Learning
- Data Protection & Privacy
- Security Best Practices

---

## 🎓 Niveaux et progression

### Niveaux disponibles

- **A2** : Débutant - Bases de l'anglais professionnel
- **B1** : Intermédiaire - Anglais courant IT
- **B2** : Intermédiaire avancé - Anglais technique solide
- **C1** : Avancé - Maîtrise de l'anglais technique

### Système de progression

1. **Évaluation initiale** : Profil créé au premier lancement
2. **Exercices adaptatifs** : Difficulté ajustée selon vos performances
3. **Analyse continue** : L'agent IA évalue chaque réponse
4. **Recommandations** : Exercices ciblés sur vos faiblesses
5. **Certification du niveau** : Passage au niveau supérieur à 85% de réussite

---

## 🔐 Confidentialité et sécurité

### Stockage des données

- **Local Storage** : Toutes les données sont stockées localement dans votre navigateur
- **Aucun serveur externe** : Vos réponses ne sont jamais envoyées à un serveur
- **Anonymat total** : Aucune donnée personnelle n'est collectée
- **RGPD compliant** : Respect total de la vie privée

### Sécurité

- **Pas de tracking** : Aucun cookie de suivi
- **Open Source** : Code source vérifiable
- **Encryption** : Données chiffrées dans le localStorage (option activable)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Pushez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

### Directives de contribution

- Respectez les règles de codage définies dans `.cursorrules`
- Utilisez TypeScript pour tout nouveau code
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez le code avec des commentaires clairs
- Suivez les principes SOLID

---

## 📝 Roadmap

### Version 1.1 (Q1 2026)

- [ ] 50 exercices QCM supplémentaires
- [ ] 50 exercices de textes à trous
- [ ] Tests TOEIC blancs complets (Listening + Reading)
- [ ] 40 documents techniques additionnels
- [ ] Export PDF des résultats

### Version 1.2 (Q2 2026)

- [ ] Tests TOEFL blancs complets
- [ ] Exercices de compréhension orale avec audio
- [ ] 100 exercices de compréhension écrite
- [ ] Extension du dictionnaire (4000 mots)
- [ ] Mode hors ligne complet

### Version 2.0 (Q3 2026)

- [ ] Intégration GPT-4 pour feedback avancé
- [ ] Création automatique d'exercices personnalisés
- [ ] Parcours d'apprentissage guidé
- [ ] Gamification et badges
- [ ] Application mobile (React Native)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](./LICENSE) pour plus de détails.

---

## 👨‍💻 Auteurs

- **AI English Trainer Team** - Développement initial
- **Bigmoletos** - Direction du projet

---

## 🙏 Remerciements

- **Natural.js** pour les outils NLP
- **Material-UI** pour les composants UI
- **La communauté React** pour le framework
- **Web Speech API** pour la reconnaissance vocale
- **Tous les contributeurs** qui rendent ce projet possible

---

## 📞 Support

### Questions fréquentes

Consultez [INSTALLATION.md](./INSTALLATION.md) pour :
- Guide d'installation détaillé
- Résolution des problèmes courants
- Configuration de la reconnaissance vocale

### Besoin d'aide ?

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : contact@ai-english-trainer.dev

---

## 🌟 Donnez une étoile !

Si ce projet vous aide dans votre apprentissage de l'anglais technique, n'hésitez pas à lui donner une étoile ⭐ sur GitHub !

---

**Version** : 1.0.0  
**Dernière mise à jour** : 31 octobre 2025  
**Status** : ✅ Production Ready

---

**Happy Learning!** 🚀📚🇬🇧

<<<END>>>
