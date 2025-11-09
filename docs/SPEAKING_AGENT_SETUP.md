# Configuration de l'Agent IA Speaking

**Version** : 1.0.0
**Date** : 09-11-2025

## Vue d'ensemble

L'agent IA Speaking analyse vos phrases prononcées, détecte les erreurs grammaticales, fournit des corrections avec explications détaillées, et propose des exercices personnalisés de niveau A2 à C1.

## Fonctionnalités

### 1. Transcription Speech-to-Text
- Utilise Google Cloud Speech-to-Text API
- Détecte automatiquement la langue (en-US par défaut)
- Retourne la transcription avec un score de confiance

### 2. Analyse grammaticale
- Détection automatique des erreurs courantes :
  - Concordance sujet-verbe (he/she/it + verbe)
  - Articles (a/an)
  - Quantificateurs (much/many)
  - Négation au passé (didn't + base form)
- Explications précises avec exceptions
- Score grammatical (0-100%)

### 3. Évaluation complète
- **Score grammatical** : Basé sur les erreurs détectées
- **Score de prononciation** : Basé sur la confiance du STT
- **Score de fluidité** : Basé sur la longueur, complexité et confiance
- **Score global** : Moyenne des trois scores

### 4. Feedback personnalisé
- Commentaires adaptés au niveau (A2-C1)
- Recommandations ciblées
- Exercices suggérés selon les erreurs détectées

### 5. Exercices de speaking
- Niveaux disponibles : A2, B1, B2, C1
- Types d'exercices :
  - **Pronunciation** : Prononciation des verbes irréguliers, etc.
  - **Fluency** : Description libre, narration
  - **Grammar** : Focus sur des règles spécifiques
  - **Vocabulary** : Vocabulaire technique IT

## Configuration

### Variables d'environnement

Ajoutez dans votre fichier `.env` :

```bash
# Google Cloud Speech-to-Text (déjà configuré)
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
# OU
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Ollama (optionnel - pour améliorer l'analyse)
ENABLE_OLLAMA=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Installation d'Ollama (optionnel)

1. **Installer Ollama** : https://ollama.ai
2. **Télécharger un modèle** :
   ```bash
   ollama pull llama2
   # ou
   ollama pull mistral
   # ou
   ollama pull codellama
   ```
3. **Vérifier que Ollama fonctionne** :
   ```bash
   curl http://localhost:11434/api/tags
   ```
4. **Activer dans `.env`** :
   ```bash
   ENABLE_OLLAMA=true
   OLLAMA_MODEL=llama2
   ```

## Utilisation

### Via l'interface web

1. Accédez à la section **"Speaking"** dans le menu
2. Sélectionnez votre niveau (A2, B1, B2, C1)
3. Choisissez un exercice
4. Cliquez sur **"Commencer l'enregistrement"**
5. Parlez clairement dans le microphone
6. Cliquez sur **"Arrêter"** pour analyser
7. Consultez les résultats : transcription, corrections, scores, exercices suggérés

### Via l'API

#### Analyser une phrase

```bash
POST /api/speaking-agent/analyze
Content-Type: application/json

{
  "transcript": "He go to school every day",
  "confidence": 0.85,
  "targetLevel": "B1",
  "expectedSentence": "He goes to school every day"
}
```

Réponse :
```json
{
  "success": true,
  "originalTranscript": "He go to school every day",
  "correctedSentence": "He goes to school every day",
  "errors": [
    {
      "type": "subject_verb_agreement",
      "original": "He go",
      "corrected": "He goes",
      "explanation": "Avec he/she/it, il faut ajouter -s/-es au verbe au présent simple.",
      "exceptions": ["Verbes modaux (can, must, should) ne prennent jamais de -s"],
      "severity": "high"
    }
  ],
  "score": 75,
  "grammarScore": 70,
  "pronunciationScore": 85,
  "fluencyScore": 70,
  "feedback": "Très bien ! Quelques petites améliorations possibles...",
  "recommendations": ["Révisez les règles de : subject verb agreement"],
  "suggestedExercises": [...]
}
```

#### Générer des exercices

```bash
POST /api/speaking-agent/exercises
Content-Type: application/json

{
  "level": "B1",
  "focusAreas": ["grammar", "pronunciation"],
  "count": 5
}
```

#### Corriger une phrase

```bash
POST /api/speaking-agent/correct
Content-Type: application/json

{
  "sentence": "I didn't went to the store",
  "level": "B1"
}
```

## Architecture

```
Frontend (React)
  ↓
SpeakingExercise Component
  ↓
speechToTextService (Google STT)
  ↓
Backend API (/api/speech-to-text)
  ↓
Google Cloud Speech-to-Text
  ↓
Backend API (/api/speaking-agent/analyze)
  ↓
speakingAgent (analyse basique)
  ↓
ollamaService (amélioration optionnelle)
  ↓
Ollama (modèle IA local)
```

## Dépannage

### Le microphone ne fonctionne pas
- Vérifiez les permissions du navigateur
- Utilisez Chrome ou Edge (meilleur support)
- Sur Android : Autorisez l'accès au microphone dans les paramètres

### L'analyse ne détecte pas d'erreurs
- Parlez plus clairement
- Vérifiez que Google STT retourne une bonne transcription
- Activez Ollama pour une analyse plus approfondie

### Ollama ne répond pas
- Vérifiez que Ollama est démarré : `ollama serve`
- Vérifiez l'URL dans `.env` : `OLLAMA_URL=http://localhost:11434`
- Vérifiez que le modèle est téléchargé : `ollama list`

### Les exercices ne se chargent pas
- Vérifiez que le backend est démarré sur le port 5010
- Vérifiez les logs du backend pour les erreurs
- L'analyse basique fonctionne même sans Ollama

## Prochaines améliorations

- [ ] Intégration Firebase Functions pour Ollama (partage web/Android)
- [ ] Analyse de la prononciation phonétique
- [ ] Comparaison avec des modèles de référence
- [ ] Historique des sessions de speaking
- [ ] Statistiques de progression par type d'erreur

