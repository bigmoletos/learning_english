# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - 2025-11-12

### ✨ Ajouté

#### Mode Conversationnel
- Détection automatique de fin de phrase (pause de 2s)
- Mode coach IA avec feedback contextuel
- Historique des conversations sauvegardé dans Firestore
- Scores de fluidité, grammaire et prononciation
- Support des corrections vocales avec Google Cloud TTS

#### Agent IA
- Détection de 10+ types d'erreurs grammaticales
- Explications détaillées avec exceptions
- Suggestions d'amélioration personnalisées
- Support multi-niveaux (A2, B1, B2, C1)

#### Services
- Integration complète Firebase (Auth + Firestore)
- Google Cloud Text-to-Speech avec cache
- Service de synchronisation des données
- Service de progression utilisateur

#### Mobile
- Build Android avec Capacitor 7.4
- Support du mode hors-ligne
- Notifications push (préparation)

### 🔧 Technique
- Migration vers TypeScript 4.9
- Architecture modulaire avec hooks personnalisés
- Tests unitaires avec Jest
- Tests E2E avec Cypress
- Linting ESLint + Prettier
- CI/CD avec GitHub Actions (préparé)

### 📚 Contenu
- 20 leçons de grammaire (A2 à C1)
- 106 sujets techniques (DevOps, Cloud, IA)
- 8 exercices TOEIC/TOEFL

### 📝 Documentation
- README.md complet
- SETUP.md (installation et configuration)
- DEVELOPMENT.md (guide développeur)
- DEPLOYMENT.md (production et APK)
- Commentaires JSDoc dans le code

---

## [0.9.0] - 2025-11-11

### ✨ Ajouté
- Status line dans Claude Code avec token tracking
- Scripts de parsing des transcripts
- Configuration Pro avec limites ajustées (500 msgs, 24h)

### 🐛 Corrigé
- Détection de fin de phrase dans ConversationalSpeaking
- Format JSON compact pour le parsing de tokens
- Appel synchrone setState dans useTextToSpeech
- Gestion des timers de pause
- Chemin relatif dans statusline.sh

### 🔧 Amélioré
- Performance du mode conversationnel
- Gestion des erreurs dans l'agent IA
- Cache TTS optimisé
- Logs backend plus détaillés

---

## [0.8.0] - 2025-11-09

### ✨ Ajouté
- Configuration Firebase complète
- Règles de sécurité Firestore
- Service d'authentification JWT
- Rate limiting sur les routes backend

### 🔧 Amélioré
- Architecture backend (Express + Sequelize)
- Gestion des erreurs centralisée
- Logging avec Winston
- CORS sécurisé

### 📚 Documentation
- Guide de configuration Firebase
- Guide de configuration Google Cloud TTS
- Scripts de backup et migration

---

## [0.7.0] - 2025-11-07

### ✨ Ajouté
- Build Android initial avec Capacitor
- Configuration gradle pour release
- Signing configuration pour APK

### 🐛 Corrigé
- Problèmes de compatibilité Android
- Permissions microphone sur mobile
- Cache assets pour mode hors-ligne

### 🔧 Amélioré
- Performance sur mobile
- Taille de l'APK réduite
- Splash screen Android

---

## [0.6.0] - 2025-11-05

### ✨ Ajouté
- Google Cloud Text-to-Speech integration
- Cache audio côté client
- Support multi-voix (US, UK, AU)
- Contrôle de vitesse et pitch

### 🔧 Amélioré
- Qualité audio (Neural2 voices)
- Temps de réponse TTS
- Gestion des erreurs réseau

---

## [0.5.0] - 2025-11-03

### ✨ Ajouté
- Web Speech API pour reconnaissance vocale
- Hook personnalisé useSpeechRecognition
- Support multi-navigateurs (Chrome, Edge, Safari)
- Indicateur de niveau de confiance

### 🐛 Corrigé
- Problèmes de permissions microphone
- Bugs de reconnexion après pause
- Fuite mémoire dans le service STT

---

## [0.4.0] - 2025-11-01

### ✨ Ajouté
- Agent IA de correction grammaticale
- 10 patterns de détection d'erreurs
- Système de scoring (grammaire, fluidité, prononciation)
- Feedback personnalisé par niveau

### 🔧 Amélioré
- Précision des corrections
- Performance de l'analyse
- Messages d'erreur plus clairs

---

## [0.3.0] - 2025-10-28

### ✨ Ajouté
- Composant ConversationalSpeaking
- Interface Material-UI
- Historique des sessions
- Statistiques de progression

### 🔧 Amélioré
- UX du mode conversationnel
- Feedback visuel en temps réel
- Navigation entre exercices

---

## [0.2.0] - 2025-10-25

### ✨ Ajouté
- 106 sujets techniques (corpus)
- 20 leçons de grammaire
- 8 exercices TOEIC/TOEFL
- Système de niveaux (A2 à C1)

### 📚 Contenu
- DevOps (Kubernetes, Docker, CI/CD)
- Cloud (AWS, GCP, Azure)
- IA/ML (RAG, LLMs, MLOps)
- Cybersécurité (GDPR, AI Act)

---

## [0.1.0] - 2025-10-20

### ✨ Initial Release

- Setup projet React + TypeScript
- Configuration Material-UI
- Structure de base des composants
- Configuration Firebase
- Backend Express initial
- Base de données SQLite

---

## 🔮 À venir (Roadmap)

### v1.1.0 (Décembre 2025)
- [ ] Mode hors-ligne complet (PWA)
- [ ] Synchronisation multi-appareils
- [ ] Notifications de rappel
- [ ] Statistiques avancées (graphiques)
- [ ] Export des données (PDF, CSV)

### v1.2.0 (Janvier 2026)
- [ ] Mode multiplayer (conversation à 2)
- [ ] Intégration ChatGPT API (optionnel)
- [ ] Reconnaissance d'accents (US, UK, AU)
- [ ] Exercices personnalisés par l'IA

### v2.0.0 (T1 2026)
- [ ] Support iOS (Capacitor)
- [ ] Support de nouvelles langues (FR, ES, DE)
- [ ] Mode entreprise (B2B)
- [ ] API publique pour intégrations

---

## 📝 Convention de versioning

- **Major (X.0.0)** : Changements breaking, refonte majeure
- **Minor (1.X.0)** : Nouvelles fonctionnalités, backwards compatible
- **Patch (1.0.X)** : Bug fixes, améliorations mineures

---

## 🔗 Liens

- **Repository** : https://github.com/iaproject/learning-english
- **Issues** : https://github.com/iaproject/learning-english/issues
- **Releases** : https://github.com/iaproject/learning-english/releases
- **Documentation** : [README.md](README.md)
