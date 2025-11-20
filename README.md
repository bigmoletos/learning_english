# AI English Trainer IT

> Application d'apprentissage de l'anglais technique (IA/DevOps) avec agent IA, reconnaissance vocale et préparation TOEIC/TOEFL (B2→C1)

**Version**: 1.0.0 | **Date**: Novembre 2025

---

## 🎯 Vue d'ensemble

Application React + Firebase pour l'apprentissage interactif de l'anglais technique avec :
- 🎤 **Mode conversationnel** : Parlez et recevez des corrections en temps réel
- 🤖 **Agent IA** : Corrections grammaticales avec explications détaillées
- 📚 **Corpus technique** : 100+ sujets (DevOps, Cloud, IA, Cybersécurité)
- 📝 **Exercices TOEIC/TOEFL** : Préparation niveau B2 à C1
- 📱 **Support mobile** : Application Android (APK disponible)
- 🔊 **Text-to-Speech** : Google Cloud TTS pour prononciation native

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0
- Compte Firebase (authentification)
- Compte Google Cloud (TTS)

**Dépendances backend essentielles** :
```bash
npm install sequelize winston express-rate-limit
```

### Installation

```bash
# 1. Cloner le projet
cd /mnt/c/programmation/learning_english

# 2. Installer les dépendances
npm install
cd backend && npm install && npm install sequelize winston express-rate-limit && cd ..

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials Firebase et Google Cloud

# 4. Démarrer le backend
cd backend && npm run dev &

# 5. Démarrer l'application React
npm start
```

L'application sera accessible sur `http://localhost:3000`

---

## 📖 Structure du projet

```
learning_english/
├── src/                    # Code source React
│   ├── agents/            # Agent IA de correction
│   ├── components/        # Composants React
│   ├── hooks/            # Hooks personnalisés (speech, TTS)
│   ├── services/         # Services (Firebase, TTS, STT)
│   └── types/            # Définitions TypeScript
├── backend/              # API Express.js
│   ├── routes/          # Routes API
│   ├── database/        # SQLite + Sequelize
│   └── credentials/     # Credentials Google Cloud TTS
├── public/corpus/       # Contenu pédagogique
│   ├── grammar/        # 20 leçons de grammaire
│   ├── technical/      # 106 sujets techniques
│   └── toeic_toefl/   # 8 exercices d'examen
├── android/            # Build Android Capacitor
└── docs/              # Documentation complémentaire
```

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Installation complète et configuration (Firebase, Google Cloud, Android)
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guide développeur (architecture, features, tests)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Déploiement en production et build APK
- **[CHANGELOG.md](CHANGELOG.md)** - Historique des modifications

---

## 🎯 Fonctionnalités principales

### Mode Conversationnel
- Reconnaissance vocale en temps réel (Web Speech API)
- Détection automatique de fin de phrase (pause de 2s)
- Corrections grammaticales instantanées
- Feedback vocal avec Google Cloud TTS
- Historique des conversations

### Exercices
- **Grammaire** : 20 leçons (present perfect, conditionnels, modaux...)
- **Technique** : 106 sujets (Kubernetes, Docker, CI/CD, AI/ML...)
- **TOEIC/TOEFL** : Exercices par niveau (A2, B1, B2, C1)

### Agent IA
- Détection de 10+ types d'erreurs grammaticales
- Explications détaillées avec exceptions
- Suggestions d'amélioration
- Score de fluidité et prononciation

---

## 🔧 Technologies

**Frontend**
- React 18.2 + TypeScript
- Material-UI 5.14
- Firebase Auth + Firestore
- Web Speech API + Google Cloud TTS

**Backend**
- Node.js + Express 4.18
- Sequelize + SQLite
- JWT Authentication
- Winston (logging)

**Mobile**
- Capacitor 7.4 (Android)
- Build APK via Android Studio

---

## 🤝 Contribution

Ce projet est en développement actif. Pour contribuer :
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Ajout de ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

---

## 👤 Auteur

AI English Trainer Team
- Email: admin@iaproject.fr
- GitHub: [@iaproject](https://github.com/iaproject)

---

## ⚡ Liens rapides

- 📱 **APK Android** : Voir [DEPLOYMENT.md](DEPLOYMENT.md#build-android)
- 🔐 **Configuration Firebase** : Voir [SETUP.md](SETUP.md#firebase)
- 🗣️ **Configuration TTS** : Voir [SETUP.md](SETUP.md#google-cloud-tts)
- 🧪 **Lancer les tests** : `npm test`
- 🏗️ **Build production** : `npm run build`
