# 🚀 Guide de Démarrage Rapide

**AI English Trainer for IT Professionals**  
**5 minutes pour commencer !**

---

## ⚡ Installation en 3 étapes

### 1️⃣ Installer les dépendances

```bash
cd /media/franck/M2_2To_990_windows/programmation/learning_english
npm install
```

**Durée** : 2-3 minutes

### 2️⃣ Lancer l'application

```bash
npm start
```

**Résultat** : L'application s'ouvre automatiquement dans votre navigateur sur `http://localhost:3000`

### 3️⃣ C'est prêt ! 🎉

Votre tableau de bord s'affiche avec votre profil créé automatiquement.

---

## 📱 Premier usage

### Navigation

L'application contient 4 sections principales accessibles depuis le menu latéral :

1. **📊 Tableau de bord** : Vue d'ensemble de votre progression
2. **📝 Exercices** : QCM et textes à trous (11 exercices disponibles)
3. **📈 Progression** : Analyse détaillée par l'agent IA
4. **🎯 Tests TOEIC/TOEFL** : (À venir)

### Commencer un exercice

#### Option 1 : Exercice QCM

1. Allez dans **"Exercices"** (menu latéral)
2. Choisissez un exercice QCM (ex: "Machine Learning Fundamentals")
3. Lisez la question
4. Sélectionnez une réponse
5. Cliquez sur **"Valider la réponse"**
6. Consultez l'explication détaillée

#### Option 2 : Texte à trous

1. Allez dans **"Exercices"**
2. Choisissez un exercice "Cloze" (ex: "Technical Debt Management")
3. Complétez les blancs avec les mots manquants
4. Cliquez sur **"Valider"**
5. Recevez un feedback immédiat

### Tester la reconnaissance vocale

1. Cliquez sur un exercice avec icône 🎤
2. Autorisez l'accès au microphone (première fois seulement)
3. Cliquez sur **"Commencer l'enregistrement"**
4. Parlez en anglais
5. Cliquez sur **"Arrêter"**
6. Consultez votre transcription et score de confiance

### Consulter votre progression

1. Allez dans **"Progression"** (menu latéral)
2. Visualisez :
   - Votre score global, grammatical, et vocabulaire
   - Vos domaines à améliorer
   - Vos points forts
   - Les exercices recommandés par l'IA

---

## 📚 Ressources disponibles

### Exercices (11 au total)

**QCM (6 exercices)** :
- Machine Learning Fundamentals (B2)
- Angular Memory Management (B2)
- RAG Systems Architecture (C1)
- MLOps and CI/CD Pipelines (B2)
- GDPR and Data Protection (B2)
- Advanced Cybersecurity (C1)

**Textes à trous (5 exercices)** :
- Technical Debt Management (B2)
- Angular Memory Leaks (B2)
- EU AI Act Compliance (C1)
- DevOps Culture and Practices (B2)
- Zero Trust Security (C1)

### Documents techniques (10 documents)

1. Understanding Technical Debt
2. Debugging Angular Memory Leaks
3. RAG Systems Explained
4. MLOps and CI/CD for ML Projects
5. GDPR Compliance for AI
6. The EU AI Act
7. Vibe Coding with Cursor
8. Cybersecurity in the AI Age
9. Modern DevOps Practices
10. Cloud Computing Fundamentals

**Emplacement** : `public/corpus/technical/`

### Ressources grammaticales (2 leçons)

1. The Present Perfect Tense (B1-B2)
2. The Passive Voice (B2-C1)

**Emplacement** : `public/corpus/grammar/`

---

## 🎯 Programme d'apprentissage suggéré

### Semaine 1 : Découverte

- **Jour 1-2** : Faites 2-3 exercices QCM pour évaluer votre niveau
- **Jour 3-4** : Lisez 2 documents techniques
- **Jour 5** : Testez la reconnaissance vocale
- **Jour 6-7** : Consultez votre progression et ciblez vos faiblesses

### Semaine 2-4 : Intensif

- **Chaque jour** : 
  - 1 exercice QCM ou texte à trous (15 min)
  - 1 document technique en lecture (10 min)
  - 1 session de reconnaissance vocale (5 min)
- **Fin de semaine** : Analyse de progression

### Mois 2-3 : Consolidation

- Répétez les exercices où vous avez obtenu moins de 80%
- Concentrez-vous sur vos domaines faibles identifiés par l'IA
- Lisez tous les documents techniques plusieurs fois

### Mois 4-6 : Maîtrise

- Passez aux exercices niveau C1
- Tests TOEIC/TOEFL (quand disponibles)
- Lecture avancée des documents techniques

---

## 💡 Conseils d'utilisation

### Pour maximiser votre progression

✅ **Régularité** : 30 minutes par jour > 3 heures le week-end  
✅ **Diversité** : Alternez QCM, textes à trous, lecture, oral  
✅ **Répétition** : Refaites les exercices après quelques jours  
✅ **Analyse** : Consultez régulièrement votre progression  
✅ **Ciblage** : Focalisez sur vos faiblesses identifiées par l'IA

### Pour la reconnaissance vocale

🎤 **Environnement** : Choisissez un endroit calme  
🎤 **Articulation** : Parlez clairement mais naturellement  
🎤 **Rythme** : Ne parlez ni trop vite ni trop lentement  
🎤 **Pratique** : Utilisez-la quotidiennement (5-10 min)  
🎤 **Feedback** : Analysez vos transcriptions pour progresser

---

## ❓ Problèmes courants

### L'application ne démarre pas

**Erreur** : `Cannot find module...`
```bash
# Solution : Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Le port 3000 est déjà utilisé

```bash
# Solution : Utilisez un autre port
PORT=3001 npm start
```

### La reconnaissance vocale ne fonctionne pas

**Cause 1** : Navigateur non supporté  
**Solution** : Utilisez Chrome ou Edge

**Cause 2** : Microphone non autorisé  
**Solution** : Vérifiez les paramètres de votre navigateur :
- Chrome : `chrome://settings/content/microphone`
- Edge : `edge://settings/content/microphone`

---

## 📈 Suivi de votre progression

### Données stockées localement

Toutes vos données sont dans le **localStorage** de votre navigateur :
- Profil utilisateur
- Réponses aux exercices
- Scores et statistiques
- Préférences

### Sauvegarder vos données

Pour exporter vos données :
1. Ouvrez la console de votre navigateur (F12)
2. Tapez :
```javascript
localStorage.getItem('userProfile')
localStorage.getItem('userResponses')
```
3. Copiez et sauvegardez le résultat

### Réinitialiser votre progression

```javascript
// Dans la console du navigateur (F12)
localStorage.clear()
// Puis rechargez la page
```

---

## 🎓 Objectifs par niveau

### Niveau B1 → B2 (3-4 mois)

- ✅ Compléter 50 exercices avec > 75% de réussite
- ✅ Lire et comprendre tous les documents techniques B2
- ✅ Maîtriser les 2 leçons grammaticales
- ✅ Pratiquer 20+ sessions de reconnaissance vocale

### Niveau B2 → C1 (4-6 mois)

- ✅ Compléter tous les exercices C1 avec > 80% de réussite
- ✅ Lire et analyser en profondeur tous les documents C1
- ✅ Atteindre > 85% de confiance en reconnaissance vocale
- ✅ Passer les tests TOEIC/TOEFL (quand disponibles)

---

## 🚀 Prochaines étapes

Une fois que vous maîtrisez l'application :

1. **Consultez INSTALLATION.md** pour la configuration avancée
2. **Lisez README.md** pour les fonctionnalités détaillées
3. **Contribuez !** Proposez de nouveaux exercices ou documents
4. **Partagez** l'application avec vos collègues

---

## 🌟 Bon apprentissage !

**Vous êtes maintenant prêt à progresser en anglais technique !**

N'oubliez pas :
- 📅 Pratiquez régulièrement (30 min/jour idéalement)
- 📊 Consultez votre progression chaque semaine
- 🎯 Concentrez-vous sur vos faiblesses
- 🗣️ Pratiquez l'oral quotidiennement

**Objectif : B2 → C1 en 6-12 mois** 🎯

---

<<<END>>>

