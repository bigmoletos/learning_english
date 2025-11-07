# Fonctionnalités - AI English Trainer

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 🎯 Vue d'ensemble

Outil complet d'entraînement en anglais technique (IA/DevOps) avec IA adaptative, reconnaissance vocale, et préparation TOEIC/TOEFL (B2→C1).

---

## 🧪 1. Évaluation de Niveau Complète

### Description
Test de 18 questions (Listening, Reading, Writing) pour évaluer votre niveau initial.

### Sections
- **🎧 Listening** (6 questions) : Compréhension orale avec synthèse vocale
- **📖 Reading** (6 questions) : Compréhension écrite
- **✍️ Writing** (6 questions) : Expression écrite

### Correction Détaillée
- ✅ Réponse correcte/incorrecte pour chaque question
- 📚 Explications grammaticales complètes
- 💡 Exemples et exceptions
- 🔄 Règles de grammaire avec structure et usage

### Niveau Évalué
- **A2** : 0-40% (Élémentaire)
- **B1** : 41-60% (Intermédiaire)
- **B2** : 61-80% (Intermédiaire avancé)
- **C1** : 81-100% (Avancé)

### Refaire l'Évaluation
Possibilité de refaire le test **à tout moment** depuis le tableau de bord pour réévaluer votre niveau.

---

## 📝 2. Exercices Interactifs (400+)

### Types d'Exercices

#### QCM (200 exercices)
- Questions à choix multiples
- 4 niveaux : A2, B1, B2, C1
- Domaines techniques : IA, DevOps, Cybersécurité, MLOps, RGPD

#### Textes à Trous (200 exercices)
- Compléter des phrases techniques
- Focus sur vocabulaire IT spécialisé
- Contextes professionnels réalistes

### Chargement Automatique
Les 400 exercices sont chargés depuis :
- `/data/exercises/all_qcm_200.json`
- `/data/exercises/all_cloze_200.json`

### Filtres
- Par niveau (A2/B1/B2/C1)
- Par type (QCM/Cloze)
- Par domaine technique

---

## 🎓 3. Programme d'Apprentissage Adaptatif

### Génération Automatique
Le programme est **généré automatiquement** par l'agent IA en fonction de :
- Votre niveau actuel
- Vos réponses aux exercices
- Vos points faibles identifiés
- Votre progression

### Objectifs Personnalisés
4 types d'objectifs créés automatiquement :
1. **Consolider le niveau actuel**
2. **Améliorer les points faibles** (détectés par l'IA)
3. **Progresser vers le niveau supérieur**
4. **Préparation TOEIC/TOEFL**

### Adaptation Dynamique
- 🔄 **Mode Auto** : Le programme se met à jour après chaque exercice
- ✏️ **Mode Manuel** : Vous pouvez modifier les objectifs
- 📊 **Suivi de progression** : Barre de progression pour chaque objectif

### Modification du Programme
- Éditer titre, description, priorité
- Ajuster la durée estimée
- Activer/désactiver l'adaptation automatique
- Supprimer des objectifs

---

## 🔊 4. Synthèse Vocale (Text-to-Speech)

### Description
Écoutez les textes en anglais avec une voix naturelle de haute qualité.

### Fonctionnalités
- ▶️ **Lecture audio** : Bouton play/stop
- 🔊 **Contrôle du volume** : Slider 0-100%
- ⚡ **Contrôle de la vitesse** : Slider 0.5x à 2x
- 🎙️ **Choix de la voix** : Voix anglaises natives disponibles

### Technologie
- **Web Speech API** native du navigateur
- Fonctionne sur : Chrome, Edge, Safari
- Voix par défaut : Anglais US/UK

### Utilisation
Disponible dans :
- 🎧 Exercices d'écoute (Listening)
- 📝 Évaluation de niveau (section Listening)
- 📖 Textes de lecture (optionnel)

### Compatibilité
- ✅ Chrome/Chromium
- ✅ Microsoft Edge
- ✅ Safari
- ⚠️ Firefox (support limité)

---

## 📊 5. Tableau de Bord Personnalisé

### Statistiques Affichées
- 📈 **Score moyen** : Pourcentage de réussite global
- 🎯 **Exercices complétés** : Nombre total d'exercices réalisés
- ⏱️ **Temps d'apprentissage** : Durée totale en minutes
- 🔥 **Série de jours** : Nombre de jours consécutifs de pratique
- 📊 **Progression par niveau** : Barre de progression vers le niveau cible

### Alertes et Actions
- 🎯 **Alerte évaluation** : Si niveau non évalué
- 🔄 **Bouton "Refaire l'évaluation"** : Accessible directement
- 🎓 **Accès au programme adaptatif** : Depuis le tableau de bord

---

## 🧠 6. Agent IA d'Analyse

### Fonctionnalités
- 🔍 **Analyse automatique** des réponses
- 📊 **Détection des faiblesses** : Grammaire, vocabulaire, compréhension
- 💡 **Recommandations personnalisées** : Exercices ciblés
- 📈 **Calcul des scores** : Par domaine (grammaire, vocabulaire)

### Algorithme
Utilise des techniques de NLP pour :
- Tokeniser les réponses
- Analyser les patterns d'erreurs
- Identifier les domaines faibles
- Suggérer des exercices adaptés

---

## 🗄️ 7. Sauvegarde en Base de Données

### Backend API
- ✅ Authentification JWT sécurisée
- ✅ Sauvegarde de la progression en temps réel
- ✅ Stockage des résultats d'évaluation
- ✅ Gestion des plans d'apprentissage

### Données Sauvegardées
- 👤 **Profil utilisateur** : Niveau, objectifs, préférences
- 📝 **Réponses** : Chaque réponse à chaque exercice
- 📊 **Statistiques** : Scores, temps, progression
- 🎯 **Évaluations** : Résultats détaillés avec corrections
- 📚 **Plans d'apprentissage** : Objectifs et progression

---

## 📚 8. Corpus Pédagogique

### Contenu Disponible

#### Documents Techniques (100)
- Thèmes : IA, DevOps, Cybersécurité, MLOps, CI/CD, RGPD, IA Act
- Niveaux : B2 et C1
- Format : Markdown (200-300 mots)

#### Leçons de Grammaire (20)
- Tous niveaux : B1, B2, C1
- Topics : Temps verbaux, prépositions, voix passive, conditionnels, etc.
- Exercices inclus

#### Dictionnaire Technique (8000 entrées)
- 4000 EN→FR
- 4000 FR→EN
- Domaines : IT, IA, Cybersécurité, DevOps

#### Textes de Lecture (100)
- Compréhension écrite
- Tous niveaux (A2 à C1)
- Contextes professionnels IT

#### Textes d'Écoute (100)
- Compréhension orale
- Scripts pour synthèse vocale
- Niveaux A2 à C1

#### Matériel TOEIC/TOEFL (8 documents)
- 4 niveaux (A2, B1, B2, C1)
- 2 types (TOEIC, TOEFL)
- Conseils et stratégies

---

## 🔐 9. Authentification Sécurisée

### Inscription
- Validation email obligatoire
- Critères de mot de passe forts
- Vérification par email automatique

### Connexion
- JWT tokens (7 jours)
- Protection par rate limiting (5 tentatives/15min)
- Session sécurisée

### Réinitialisation Mot de Passe
- Email avec lien sécurisé (1h d'expiration)
- Token unique par demande
- Hashage bcrypt (10 rounds)

### Compte Administrateur
- Gestion des utilisateurs
- Statistiques globales
- Désactivation de comptes

---

## 🎨 10. Interface Moderne

### Design
- **Material-UI** : Composants modernes et accessibles
- **Responsive** : Adapté mobile, tablette, desktop
- **Dark Mode** : Thème clair/sombre

### Navigation
- Menu latéral intuitif
- Breadcrumbs pour se situer
- Boutons d'action contextuels

### Accessibilité
- Contraste élevé
- Navigation au clavier
- Labels ARIA

---

## 🚀 11. Fonctionnalités à Venir

### En Développement
- 🎙️ **Reconnaissance vocale** : Exercices de prononciation
- 🤖 **ChatBot IA** : Assistant conversationnel
- 📊 **Tableaux de bord avancés** : Graphiques interactifs
- 🏆 **Gamification** : Badges, niveaux, défis
- 👥 **Mode communautaire** : Partage de progression
- 📱 **Application mobile** : iOS et Android

### Prévues
- Tests TOEIC/TOEFL complets
- Export de certificats
- Intégration OpenAI pour feedback avancé
- Mode hors ligne (PWA)

---

## 📖 Utilisation des Fonctionnalités

### Première Utilisation
1. **Inscription** : Créer un compte
2. **Évaluation** : Compléter le test de niveau (18 questions)
3. **Programme** : Consulter le programme généré automatiquement
4. **Exercices** : Commencer par les exercices recommandés
5. **Suivi** : Consulter le tableau de bord régulièrement

### Quotidien
1. Connexion
2. Vérifier le tableau de bord
3. Faire 2-3 exercices (15-20 min)
4. Consulter les corrections détaillées
5. Suivre sa progression

### Hebdomadaire
- Refaire l'évaluation si progression significative
- Ajuster le programme d'apprentissage
- Consulter les statistiques détaillées
- Explorer de nouveaux domaines techniques

---

## 🎯 Objectifs Pédagogiques

### Court Terme (1-3 mois)
- Consolider le niveau actuel
- Améliorer les points faibles identifiés
- Enrichir le vocabulaire technique IT

### Moyen Terme (3-6 mois)
- Progresser d'un niveau (ex: B2 → C1)
- Maîtriser le vocabulaire spécialisé
- Préparer TOEIC/TOEFL

### Long Terme (6-12 mois)
- Atteindre le niveau C1
- Score TOEIC ≥ 900
- Autonomie complète en anglais technique

---

**💡 Conseil** : Pratiquez **15-20 minutes par jour** plutôt que 2 heures une fois par semaine pour de meilleurs résultats !

