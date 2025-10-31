# AI English Trainer pour Professionnels IT

**Entraînement en anglais technique (IA/DevOps/Cybersécurité) avec agent IA adaptatif, synthèse vocale, et préparation TOEIC/TOEFL (B2→C1)**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)]()
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript)]()

---

## 🎯 Objectif

Atteindre le **niveau C1 en anglais technique** (IA, DevOps, Cybersécurité) en 6-12 mois, avec préparation intensive TOEIC/TOEFL.

---

## ✨ Fonctionnalités Principales

### 🧪 Évaluation de Niveau Complète
- Test de 18 questions (Listening, Reading, Writing)
- Correction détaillée avec explications grammaticales
- Évaluation du niveau (A2 → B1 → B2 → C1)
- Possibilité de refaire le test à tout moment

### 📝 400+ Exercices Interactifs
- **200 QCM** + **200 Textes à trous**
- Vocabulaire technique : IA, DevOps, MLOps, RGPD, IA Act
- Niveaux : A2, B1, B2, C1
- Filtres par niveau, type, domaine

### 🎓 Programme Adaptatif par IA
- Génération automatique selon votre niveau et progression
- Objectifs personnalisés avec progression trackée
- Mode auto-adaptatif ou modification manuelle
- Recommandations d'exercices ciblés

### 🔊 Synthèse Vocale
- Lecture audio des textes avec voix native
- Contrôle volume et vitesse
- Exercices d'écoute (Listening)
- Compatible Chrome, Edge, Safari

### 📊 Tableau de Bord Personnalisé
- Statistiques détaillées (score, temps, série)
- Progression par niveau
- Points faibles identifiés
- Accès rapide aux exercices recommandés

### 🔐 Authentification Sécurisée
- Inscription avec validation email
- Connexion JWT (7 jours)
- Reset password sécurisé
- Compte administrateur

### 🗄️ Sauvegarde en Base de Données
- Backend API Node.js/Express
- SQLite (évolutif vers PostgreSQL)
- Historique complet des réponses
- Progression sauvegardée en temps réel

### 📚 Corpus Pédagogique Riche
- **100 documents techniques** (IA, DevOps, Cyber)
- **20 leçons de grammaire** (B1 à C1)
- **8000 mots** (dictionnaire FR↔EN IT/IA)
- **100 textes de lecture** + **100 d'écoute**
- **Matériel TOEIC/TOEFL** (tous niveaux)

---

## 🚀 Installation Rapide (5 min)

```bash
# 1. Cloner
git clone https://github.com/bigmoletos/learning_english.git
cd learning_english

# 2. Installer dépendances
npm install
cd backend && npm install && cd ..

# 3. Configurer
cp ENV_TEMPLATE.txt .env
nano .env  # Définir ADMIN_PASSWORD et JWT_SECRET

# 4. Créer compte admin
cd backend && npm run seed && cd ..

# 5. Démarrer
./start_frontend_backend.sh start
```

**Ouvrir** : http://localhost:3000

📖 **Guide détaillé** : [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 📂 Structure du Projet

```
learning_english/
├── src/                    # Frontend (React/TypeScript)
├── backend/                # Backend (Node.js/Express)
│   ├── models/             # Modèles DB
│   ├── routes/             # API REST
│   └── utils/              # Services (email, etc.)
├── public/
│   ├── data/exercises/     # 400 exercices JSON
│   └── corpus/             # Ressources pédagogiques
├── database/               # SQLite
├── .env                    # Variables d'environnement
└── start_frontend_backend.sh  # Script de démarrage
```

---

## 🎓 Utilisation

### 1. Première Connexion
1. **Inscription** : Créer votre compte
2. **Évaluation** : Compléter le test de niveau (18 questions)
3. **Programme** : Consulter le programme généré par l'IA
4. **Exercices** : Commencer par les exercices recommandés

### 2. Pratique Quotidienne
- **15-20 minutes/jour** recommandées
- 2-3 exercices ciblés
- Consultation des corrections détaillées
- Suivi de la progression

### 3. Suivi Hebdomadaire
- Refaire l'évaluation si progression
- Ajuster le programme si nécessaire
- Explorer de nouveaux domaines techniques

---

## 🛠️ Technologies

| Composant | Technologies |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Material-UI |
| **Backend** | Node.js, Express, Sequelize |
| **Base de données** | SQLite (→ PostgreSQL en prod) |
| **Authentification** | JWT, bcrypt |
| **Email** | Nodemailer |
| **Synthèse vocale** | Web Speech API |
| **IA** | Agent NLP custom |

---

## 📊 Statut des Fonctionnalités

| Fonctionnalité | Statut |
|----------------|--------|
| Évaluation de niveau complète | ✅ Opérationnelle |
| 400 exercices (QCM + Cloze) | ✅ Opérationnelle |
| Programme adaptatif IA | ✅ Opérationnelle |
| Synthèse vocale (TTS) | ✅ Opérationnelle |
| Backend API + DB | ✅ Opérationnelle |
| Authentification JWT | ✅ Opérationnelle |
| Tableau de bord | ✅ Opérationnel |
| Corpus pédagogique | ✅ Opérationnel (100 docs + 20 leçons + 8000 mots) |
| Tests TOEIC/TOEFL complets | 🔄 En développement |
| Reconnaissance vocale (STT) | 🔄 En développement |
| ChatBot IA | 🔄 Prévu |
| Application mobile | 🔄 Prévu |

---

## 📚 Documentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Installation et démarrage rapide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique détaillée
- **[BACKEND.md](./BACKEND.md)** - Configuration backend et scripts
- **[FEATURES.md](./FEATURES.md)** - Documentation complète des fonctionnalités

---

## 🤝 Contribution

Contributions bienvenues ! Ouvrez une issue ou soumettez une pull request.

### Développement

```bash
# Frontend
npm start

# Backend
cd backend && npm run dev

# Tests
npm test
cd backend && npm test
```

---

## 📧 Support

- **Issues GitHub** : [github.com/bigmoletos/learning_english/issues](https://github.com/bigmoletos/learning_english/issues)
- **Email** : support@learning-english.local

---

## 📄 Licence

MIT License - Voir [LICENSE](./LICENSE)

---

## 👤 Auteur

**Bigmoletos**  
GitHub : [@bigmoletos](https://github.com/bigmoletos)

---

## 🙏 Remerciements

- Corpus technique inspiré des bonnes pratiques IT/DevOps
- Règles grammaticales issues de références académiques
- Matériel TOEIC/TOEFL adapté des guides officiels

---

## 🎯 Roadmap

### Q4 2025
- ✅ Évaluation complète avec corrections
- ✅ Programme adaptatif IA
- ✅ Synthèse vocale
- ✅ Backend + Authentification

### Q1 2026
- 🔄 Tests TOEIC/TOEFL complets
- 🔄 Reconnaissance vocale (prononciation)
- 🔄 ChatBot IA conversationnel

### Q2 2026
- 📅 Application mobile (React Native)
- 📅 Mode communautaire
- 📅 Gamification (badges, défis)

---

**🚀 Lancez-vous dès maintenant vers l'anglais C1 !**

```bash
./start_frontend_backend.sh start
# Ouvrir http://localhost:3000
```
