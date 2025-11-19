/**
 * Composant ComprehensiveAssessment - Test d'évaluation complet (Listening, Reading, Writing)
 * @version 1.0.0
 * @date 31-10-2025
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  TextField,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  Headphones,
  MenuBook,
  Edit,
  PlayArrow,
  Stop,
  VolumeUp,
} from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { LanguageLevel } from "../../types";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

interface AssessmentQuestion {
  id: string;
  section: "listening" | "reading" | "writing";
  question: string;
  audioText?: string; // Texte à lire (simulant l'audio)
  readingText?: string;
  options?: string[];
  correctAnswer: string | string[];
  level: LanguageLevel;
  points: number;
}

const assessmentQuestions: AssessmentQuestion[] = [
  // SECTION LISTENING (6 questions)
  {
    id: "l1",
    section: "listening",
    question: "Listen to the audio: 'The system was deployed yesterday.' What tense is used?",
    audioText: "The system was deployed yesterday.",
    options: ["Present Simple", "Past Simple", "Present Perfect", "Past Perfect"],
    correctAnswer: "Past Simple",
    level: "B1",
    points: 1,
  },
  {
    id: "l2",
    section: "listening",
    question:
      "Listen: 'We have been working on this project for three months.' What does this indicate?",
    audioText: "We have been working on this project for three months.",
    options: [
      "The project is finished",
      "The project started in the past and continues now",
      "The project will start in three months",
      "The project lasted only three months",
    ],
    correctAnswer: "The project started in the past and continues now",
    level: "B2",
    points: 2,
  },
  {
    id: "l3",
    section: "listening",
    question: "Listen: 'The vulnerability could have been prevented.' What is the meaning?",
    audioText: "The vulnerability could have been prevented.",
    options: [
      "It was prevented",
      "It will be prevented",
      "It was possible to prevent it but it wasn't done",
      "It cannot be prevented",
    ],
    correctAnswer: "It was possible to prevent it but it wasn't done",
    level: "C1",
    points: 3,
  },
  {
    id: "l4",
    section: "listening",
    question:
      "Listen: 'By implementing CI/CD, deployment time has decreased significantly.' What happened?",
    audioText: "By implementing CI/CD, deployment time has decreased significantly.",
    options: [
      "Deployment takes more time now",
      "Deployment time stayed the same",
      "Deployment became much faster",
      "CI/CD was not implemented",
    ],
    correctAnswer: "Deployment became much faster",
    level: "B2",
    points: 2,
  },
  {
    id: "l5",
    section: "listening",
    question:
      "Listen: 'Had the team followed best practices, the security breach would not have occurred.' What does this mean?",
    audioText: "Had the team followed best practices, the security breach would not have occurred.",
    options: [
      "The team followed best practices",
      "The team didn't follow best practices and there was a breach",
      "There was no security breach",
      "Best practices are not important",
    ],
    correctAnswer: "The team didn't follow best practices and there was a breach",
    level: "C1",
    points: 3,
  },
  {
    id: "l6",
    section: "listening",
    question:
      "Listen: 'The application is being tested by the QA team.' What is the current status?",
    audioText: "The application is being tested by the QA team.",
    options: [
      "Testing is complete",
      "Testing will start soon",
      "Testing is happening right now",
      "Testing was cancelled",
    ],
    correctAnswer: "Testing is happening right now",
    level: "B2",
    points: 2,
  },

  // SECTION READING (6 questions)
  {
    id: "r1",
    section: "reading",
    question: "What is the main topic of this text?",
    readingText:
      "Technical debt occurs when developers choose quick solutions over better approaches. While these shortcuts save time initially, they accumulate interest in the form of increased maintenance costs and reduced code quality. Managing technical debt requires regular refactoring and prioritization.",
    options: [
      "Quick coding techniques",
      "Managing shortcuts in software development",
      "Cost reduction strategies",
      "Code quality standards",
    ],
    correctAnswer: "Managing shortcuts in software development",
    level: "B2",
    points: 2,
  },
  {
    id: "r2",
    section: "reading",
    question: "According to the text, what is the consequence of technical debt?",
    readingText:
      "Technical debt occurs when developers choose quick solutions over better approaches. While these shortcuts save time initially, they accumulate interest in the form of increased maintenance costs and reduced code quality. Managing technical debt requires regular refactoring and prioritization.",
    options: [
      "Faster development",
      "Better code quality",
      "Increased maintenance costs",
      "No consequences",
    ],
    correctAnswer: "Increased maintenance costs",
    level: "B2",
    points: 2,
  },
  {
    id: "r3",
    section: "reading",
    question: "What does RAG stand for in AI systems?",
    readingText:
      "Retrieval-Augmented Generation (RAG) is an AI framework that combines the power of large language models with external knowledge retrieval. Rather than relying solely on pre-trained knowledge, RAG systems query a database or document corpus to retrieve relevant information, which is then used to generate more accurate and contextually appropriate responses.",
    options: [
      "Rapid Application Generation",
      "Retrieval-Augmented Generation",
      "Random Access Gateway",
      "Real-time Analytics Generator",
    ],
    correctAnswer: "Retrieval-Augmented Generation",
    level: "C1",
    points: 3,
  },
  {
    id: "r4",
    section: "reading",
    question: "How does RAG improve AI responses?",
    readingText:
      "Retrieval-Augmented Generation (RAG) is an AI framework that combines the power of large language models with external knowledge retrieval. Rather than relying solely on pre-trained knowledge, RAG systems query a database or document corpus to retrieve relevant information, which is then used to generate more accurate and contextually appropriate responses.",
    options: [
      "By using only pre-trained data",
      "By accessing external knowledge sources",
      "By generating random responses",
      "By reducing computation time",
    ],
    correctAnswer: "By accessing external knowledge sources",
    level: "C1",
    points: 3,
  },
  {
    id: "r5",
    section: "reading",
    question: "What is the primary purpose of MLOps?",
    readingText:
      "MLOps (Machine Learning Operations) applies DevOps principles to machine learning workflows. It encompasses the practices, tools, and cultural philosophies necessary to deploy, monitor, and maintain ML models in production. Key aspects include automated testing, continuous integration/continuous deployment (CI/CD), model versioning, and performance monitoring.",
    options: [
      "To replace DevOps engineers",
      "To deploy and maintain ML models in production",
      "To train machine learning models",
      "To reduce computational costs",
    ],
    correctAnswer: "To deploy and maintain ML models in production",
    level: "B2",
    points: 2,
  },
  {
    id: "r6",
    section: "reading",
    question: "Which is NOT mentioned as a key aspect of MLOps?",
    readingText:
      "MLOps (Machine Learning Operations) applies DevOps principles to machine learning workflows. It encompasses the practices, tools, and cultural philosophies necessary to deploy, monitor, and maintain ML models in production. Key aspects include automated testing, continuous integration/continuous deployment (CI/CD), model versioning, and performance monitoring.",
    options: [
      "Automated testing",
      "Model versioning",
      "Manual deployment",
      "Performance monitoring",
    ],
    correctAnswer: "Manual deployment",
    level: "B2",
    points: 2,
  },

  // SECTION WRITING (6 questions)
  {
    id: "w1",
    section: "writing",
    question: "Complete the sentence: The bug ___ fixed by the developer yesterday.",
    correctAnswer: ["was"],
    level: "B1",
    points: 1,
  },
  {
    id: "w2",
    section: "writing",
    question: "Complete: We have ___ implementing microservices for two years.",
    correctAnswer: ["been"],
    level: "B2",
    points: 2,
  },
  {
    id: "w3",
    section: "writing",
    question:
      "Complete: Technical debt accumulates when teams choose quick solutions ___ of better approaches.",
    correctAnswer: ["instead"],
    level: "B2",
    points: 2,
  },
  {
    id: "w4",
    section: "writing",
    question: "Complete: Had the team ___ the security audit, the breach would not have occurred.",
    correctAnswer: ["conducted", "performed", "done", "completed"],
    level: "C1",
    points: 3,
  },
  {
    id: "w5",
    section: "writing",
    question: "Complete: Not only ___ the system more secure, but it also improved performance.",
    correctAnswer: ["did it make", "did we make"],
    level: "C1",
    points: 3,
  },
  {
    id: "w6",
    section: "writing",
    question: "Complete: The application ___ currently ___ tested by the QA team.",
    correctAnswer: ["is being"],
    level: "B2",
    points: 2,
  },
];

/**
 * Génère une explication grammaticale détaillée pour chaque question
 */
const getDetailedExplanation = (question: AssessmentQuestion, isCorrect: boolean): JSX.Element => {
  const explanations: { [key: string]: JSX.Element } = {
    // LISTENING QUESTIONS
    l1: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Past Simple (Passé simple)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le <strong>Past Simple</strong> est utilisé pour décrire une action terminée dans le
          passé, souvent accompagnée d'un indicateur de temps précis.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Forme affirmative : Sujet + verbe-ed (ou verbe irrégulier)
          <br />• Exemple : "The system <strong>was deployed</strong> yesterday."
          <br />• Indicateurs : yesterday, last week, in 2020, ago
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>⚠️ Attention :</strong> "was deployed" est à la voix passive. Voix active
          équivalente : "They deployed the system yesterday."
        </Typography>
        <Typography variant="body2">
          <strong>Autres exemples :</strong>
          <br />
          • "I worked on this project last month."
          <br />
          • "The bug was fixed two days ago."
          <br />• "She tested the application yesterday."
        </Typography>
      </Box>
    ),
    l2: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Present Perfect Continuous</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le <strong>Present Perfect Continuous</strong> exprime une action qui a commencé dans le
          passé et qui continue jusqu'à maintenant, avec emphase sur la durée.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Have/Has + been + verbe-ing
          <br />• Exemple : "We <strong>have been working</strong> for three months."
          <br />• Indicateurs : for (durée), since (point de départ)
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Différence avec Present Perfect Simple :</strong>
          <br />
          • Perfect Continuous : emphase sur la durée/continuité
          <br />
          • Perfect Simple : emphase sur le résultat/achèvement
          <br />
          Exemple : "I have been reading" (je lis encore) vs "I have read" (j'ai fini)
        </Typography>
        <Typography variant="body2">
          <strong>Autres exemples :</strong>
          <br />
          • "She has been learning English for 5 years."
          <br />
          • "They have been developing this feature since January."
          <br />• "The server has been running continuously."
        </Typography>
      </Box>
    ),
    l3: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Modal Perfect (Could have + past participle)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>"Could have + past participle"</strong> exprime une possibilité dans le passé qui
          ne s'est pas réalisée (regret, reproche, ou constat).
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Modal (could/should/would) + have + past participle
          <br />• Exemple : "The vulnerability <strong>could have been prevented</strong>."
          <br />• Signification : C'était possible de le prévenir, mais ça n'a pas été fait.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Autres modaux au passé :</strong>
          <br />• <strong>Should have :</strong> obligation non respectée (reproche)
          <br />
          &nbsp;&nbsp;"You should have tested the code."
          <br />• <strong>Would have :</strong> conditionnel passé
          <br />
          &nbsp;&nbsp;"I would have fixed it if I had known."
          <br />• <strong>Must have :</strong> déduction logique sur le passé
          <br />
          &nbsp;&nbsp;"He must have forgotten the meeting."
        </Typography>
        <Typography variant="body2">
          <strong>Exemples IT :</strong>
          <br />
          • "The data breach could have been prevented with proper encryption."
          <br />
          • "The deployment should have been tested in staging first."
          <br />• "The bug would have been caught if we had unit tests."
        </Typography>
      </Box>
    ),
    l4: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Present Perfect + Cause/Effect</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le <strong>Present Perfect</strong> est utilisé ici pour montrer un résultat présent d'une
          action passée. "By implementing" (gérondif) exprime le moyen/la cause.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • By + verb-ing (moyen) → résultat
          <br />• Exemple : "<strong>By implementing</strong> CI/CD, time{" "}
          <strong>has decreased</strong>."
          <br />• "By" = "en faisant", "grâce à"
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Vocabulaire clé :</strong>
          <br />• <strong>Significantly :</strong> de manière significative
          <br />• <strong>Decrease :</strong> diminuer (≠ increase : augmenter)
          <br />• <strong>Deployment :</strong> déploiement, mise en production
        </Typography>
        <Typography variant="body2">
          <strong>Expressions similaires :</strong>
          <br />
          • "By using automation, we have improved efficiency."
          <br />
          • "Through refactoring, code quality has increased."
          <br />• "Thanks to monitoring, downtime has reduced."
        </Typography>
      </Box>
    ),
    l5: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Third Conditional (Inversion)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le <strong>Third Conditional</strong> exprime une situation hypothétique dans le passé et
          son résultat irréel. L'inversion avec "Had" rend la phrase plus formelle.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure classique :</strong>
          <br />
          • If + past perfect → would have + past participle
          <br />• "If the team <strong>had followed</strong> practices, breach{" "}
          <strong>would not have occurred</strong>."
        </Typography>
        <Typography
          variant="body2"
          paragraph
          sx={{ bgcolor: "warning.light", p: 2, borderRadius: 1 }}
        >
          <strong>Structure avec inversion (formelle) :</strong>
          <br />• <strong>Had + sujet + past participle</strong> → would have + past participle
          <br />• "<strong>Had the team followed</strong> practices, breach would not have
          occurred."
          <br />• Note : "If" disparaît, "had" passe en tête
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Signification :</strong> L'équipe n'a PAS suivi les bonnes pratiques, et en
          conséquence, la faille de sécurité s'est produite.
        </Typography>
        <Typography variant="body2">
          <strong>Autres exemples avec inversion :</strong>
          <br />
          • "Had I known, I would have acted differently."
          <br />
          • "Had they tested properly, the bug would have been caught."
          <br />• "Had we deployed earlier, the deadline would have been met."
        </Typography>
      </Box>
    ),
    l6: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Present Continuous Passive</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le <strong>Present Continuous Passive</strong> décrit une action en cours de réalisation
          au moment présent, à la voix passive (l'agent n'est pas l'acteur principal).
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Is/Are + being + past participle
          <br />• Exemple : "The application <strong>is being tested</strong> by the QA team."
          <br />• Forme active : "The QA team is testing the application."
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Quand l'utiliser :</strong>
          <br />
          • Action en cours maintenant
          <br />
          • Focus sur l'objet de l'action (pas l'agent)
          <br />• Processus temporaire
        </Typography>
        <Typography variant="body2">
          <strong>Exemples IT :</strong>
          <br />
          • "The code is being reviewed by senior developers."
          <br />
          • "New features are being developed right now."
          <br />
          • "The database is being migrated to the cloud."
          <br />• "Security patches are being deployed across all servers."
        </Typography>
      </Box>
    ),

    // READING QUESTIONS
    r1: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Compréhension écrite : Idée principale</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le texte parle de la <strong>dette technique</strong> : des solutions rapides qui créent
          des problèmes à long terme.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Vocabulaire clé :</strong>
          <br />• <strong>Technical debt :</strong> dette technique
          <br />• <strong>Shortcuts :</strong> raccourcis, solutions rapides
          <br />• <strong>Accumulate interest :</strong> accumuler des intérêts (métaphore
          financière)
          <br />• <strong>Maintenance costs :</strong> coûts de maintenance
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Expressions courantes IT :</strong>
          <br />
          • "Quick and dirty solution" = solution rapide mais de mauvaise qualité
          <br />
          • "Cut corners" = prendre des raccourcis
          <br />
          • "Pay down technical debt" = rembourser la dette technique
          <br />• "Code smells" = signes de mauvaise qualité de code
        </Typography>
      </Box>
    ),
    r2: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Compréhension : Cause et conséquence</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le texte explique que la dette technique{" "}
          <strong>augmente les coûts de maintenance</strong>.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Mots de liaison cause/conséquence :</strong>
          <br />• <strong>Because / Since / As :</strong> parce que
          <br />• <strong>Therefore / Thus / Hence :</strong> donc, par conséquent
          <br />• <strong>As a result / Consequently :</strong> en conséquence
          <br />• <strong>Due to / Owing to :</strong> en raison de
        </Typography>
        <Typography variant="body2">
          <strong>Exemple :</strong> "Due to technical debt, maintenance costs increased."
        </Typography>
      </Box>
    ),
    r3: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Acronyme : RAG (Retrieval-Augmented Generation)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>RAG</strong> est un framework d'IA qui combine génération de texte et recherche
          d'informations externes pour des réponses plus précises.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Vocabulaire technique IA :</strong>
          <br />• <strong>Framework :</strong> cadre de travail, infrastructure
          <br />• <strong>Retrieval :</strong> récupération, recherche
          <br />• <strong>Augmented :</strong> augmenté, amélioré
          <br />• <strong>Query :</strong> requête, interrogation
          <br />• <strong>Corpus :</strong> ensemble de documents
        </Typography>
        <Typography variant="body2">
          <strong>Autres acronymes IA courants :</strong>
          <br />
          • LLM: Large Language Model
          <br />
          • NLP: Natural Language Processing
          <br />
          • MLOps: Machine Learning Operations
          <br />• API: Application Programming Interface
        </Typography>
      </Box>
    ),
    r4: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Compréhension : Mécanisme de fonctionnement</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          RAG améliore les réponses en{" "}
          <strong>accédant à des sources de connaissances externes</strong>, pas seulement aux
          données pré-entraînées.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Expression : "Rather than"</strong>
          <br />
          • Signification : "plutôt que", "au lieu de"
          <br />
          • Exemple : "Rather than relying on memory, it queries a database."
          <br />• Synonymes : instead of, in lieu of
        </Typography>
        <Typography variant="body2">
          <strong>Expressions de comparaison :</strong>
          <br />
          • "Unlike X, Y does..." = Contrairement à X, Y fait...
          <br />
          • "Whereas X is limited, Y can..." = Alors que X est limité, Y peut...
          <br />• "In contrast to X, Y..." = Par opposition à X, Y...
        </Typography>
      </Box>
    ),
    r5: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>MLOps : Machine Learning Operations</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          MLOps applique les principes DevOps au machine learning pour{" "}
          <strong>déployer et maintenir des modèles en production</strong>.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Vocabulaire MLOps :</strong>
          <br />• <strong>Deploy :</strong> déployer, mettre en production
          <br />• <strong>Monitor :</strong> surveiller, monitorer
          <br />• <strong>Maintain :</strong> maintenir, entretenir
          <br />• <strong>Pipeline :</strong> chaîne de traitement automatisée
          <br />• <strong>Versioning :</strong> gestion des versions
        </Typography>
        <Typography variant="body2">
          <strong>Concepts MLOps clés :</strong>
          <br />
          • Model training pipeline
          <br />
          • Continuous Integration / Continuous Deployment (CI/CD)
          <br />
          • Model monitoring and drift detection
          <br />• A/B testing for models
        </Typography>
      </Box>
    ),
    r6: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Compréhension : Détails du texte</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          Le texte mentionne automated testing, CI/CD, model versioning, et performance monitoring,
          mais PAS le <strong>déploiement manuel</strong>.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Astuce lecture :</strong>
          <br />
          • Questions "NOT mentioned" = attention redoublée
          <br />
          • Scanner le texte pour chaque option
          <br />
          • Éliminer les options présentes
          <br />• La réponse est celle qui n'apparaît PAS
        </Typography>
        <Typography variant="body2">
          <strong>Mots de négation en anglais :</strong>
          <br />
          • Which is NOT...
          <br />
          • Except for...
          <br />
          • All of the following EXCEPT...
          <br />• Neither... nor...
        </Typography>
      </Box>
    ),

    // WRITING QUESTIONS
    w1: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Passive Voice (Past Simple)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          "The bug <strong>was</strong> fixed" est à la voix passive au passé simple.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure voix passive :</strong>
          <br />
          • Be (conjugué) + past participle
          <br />
          • Passé simple : was/were + past participle
          <br />• Exemple : "was fixed", "were tested", "was deployed"
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Quand utiliser la voix passive :</strong>
          <br />
          • Agent inconnu ou non important
          <br />
          • Focus sur l'objet, pas l'agent
          <br />• Style formel/technique
        </Typography>
        <Typography variant="body2">
          <strong>Exemples IT :</strong>
          <br />
          • "The code was reviewed by the team."
          <br />
          • "The server was restarted at midnight."
          <br />• "All tests were passed successfully."
        </Typography>
      </Box>
    ),
    w2: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Present Perfect Continuous</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          "We have <strong>been</strong> implementing" exprime une action commencée dans le passé et
          qui continue.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Have/Has + been + verb-ing
          <br />
          • Exemple : "have been implementing"
          <br />• Indicateur temporel : "for two years" (durée)
        </Typography>
        <Typography variant="body2">
          <strong>⚠️ Erreurs courantes :</strong>
          <br />
          • ❌ "have implementing" → ✅ "have been implementing"
          <br />
          • ❌ "have been implement" → ✅ "have been implementing"
          <br />• ❌ "has been implementing" (avec "we") → ✅ "have been implementing"
        </Typography>
      </Box>
    ),
    w3: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Expression : "instead of"</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          "Instead of" = au lieu de, à la place de
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Instead of + noun/gerund
          <br />
          • Exemple : "instead of better approaches"
          <br />• Avec verbe : "instead of using" (gérondif)
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>⚠️ Ne pas confondre :</strong>
          <br />• <strong>Instead of :</strong> au lieu de (+ nom/gérondif)
          <br />• <strong>Instead :</strong> à la place (seul, sans "of")
          <br />
          Exemple : "I didn't go; I stayed home instead."
        </Typography>
        <Typography variant="body2">
          <strong>Expressions similaires :</strong>
          <br />
          • "Rather than" = plutôt que
          <br />
          • "In place of" = à la place de
          <br />• "As an alternative to" = comme alternative à
        </Typography>
      </Box>
    ),
    w4: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Third Conditional (Past Perfect)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          "Had the team <strong>conducted</strong> the audit" = Si l'équipe avait effectué l'audit
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Verbes acceptés :</strong>
          <br />• <strong>conducted</strong> (mener, effectuer) - le plus courant
          <br />• <strong>performed</strong> (réaliser, effectuer)
          <br />• <strong>done</strong> (faire) - moins formel
          <br />• <strong>completed</strong> (compléter, achever)
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Collocations avec "audit" :</strong>
          <br />
          • Conduct an audit (le plus fréquent)
          <br />
          • Perform an audit
          <br />
          • Carry out an audit
          <br />• Complete an audit
        </Typography>
        <Typography variant="body2">
          <strong>Autres exemples :</strong>
          <br />
          • "Had we conducted a code review..."
          <br />
          • "Had they performed load testing..."
          <br />• "Had the team completed the migration..."
        </Typography>
      </Box>
    ),
    w5: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Inversion (Emphase)</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          "Not only <strong>did it make</strong>" est une structure d'inversion pour l'emphase.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Not only + auxiliaire + sujet + verbe de base
          <br />• Exemple : "Not only <strong>did it make</strong> the system more secure"
          <br />• Normal : "It not only made the system more secure"
        </Typography>
        <Typography
          variant="body2"
          paragraph
          sx={{ bgcolor: "warning.light", p: 2, borderRadius: 1 }}
        >
          <strong>⚠️ Après "not only" en début de phrase :</strong>
          <br />
          • L'ordre sujet-verbe s'inverse
          <br />
          • On ajoute un auxiliaire (do/does/did)
          <br />• Niveau C1 - Structure formelle
        </Typography>
        <Typography variant="body2">
          <strong>Autres structures similaires :</strong>
          <br />
          • "Never have I seen..." (jamais je n'ai vu...)
          <br />
          • "Rarely does he..." (rarement il...)
          <br />
          • "Seldom do we..." (rarement nous...)
          <br />• "Only then did I realize..." (c'est alors que j'ai réalisé...)
        </Typography>
      </Box>
    ),
    w6: (
      <Box>
        <Typography variant="body1" paragraph>
          <strong>Règle : Present Continuous Passive</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          "The application <strong>is being</strong> tested" exprime une action passive en cours.
        </Typography>
        <Typography variant="body2" paragraph sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <strong>Structure :</strong>
          <br />
          • Is/Are + being + past participle
          <br />• Exemple : "<strong>is being</strong> tested"
          <br />• Note : deux mots nécessaires ("is" + "being")
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>⚠️ Erreurs fréquentes :</strong>
          <br />
          • ❌ "is tested" → présent simple passif (pas en cours)
          <br />
          • ❌ "is testing" → présent continu actif (mauvaise voix)
          <br />
          • ❌ "has been tested" → present perfect (action terminée)
          <br />• ✅ "is being tested" → présent continu passif (action en cours)
        </Typography>
        <Typography variant="body2">
          <strong>Exemples IT :</strong>
          <br />
          • "The code is being reviewed right now."
          <br />
          • "New features are being developed as we speak."
          <br />• "The database is being migrated this week."
        </Typography>
      </Box>
    ),
  };

  return (
    explanations[question.id] || (
      <Typography variant="body2">Explication à venir pour cette question.</Typography>
    )
  );
};

export const ComprehensiveAssessment: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState<"listening" | "reading" | "writing">(
    "listening"
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);
  const [assessedLevel, setAssessedLevel] = useState<LanguageLevel | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const { user, setUser } = useUser();
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  const sectionQuestions = assessmentQuestions.filter((q) => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const playAudio = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, "en-US");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Passer à la section suivante
      if (currentSection === "listening") {
        setCurrentSection("reading");
        setCurrentQuestionIndex(0);
      } else if (currentSection === "reading") {
        setCurrentSection("writing");
        setCurrentQuestionIndex(0);
      } else {
        calculateLevel();
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentSection === "reading") {
      setCurrentSection("listening");
      setCurrentQuestionIndex(
        assessmentQuestions.filter((q) => q.section === "listening").length - 1
      );
    } else if (currentSection === "writing") {
      setCurrentSection("reading");
      setCurrentQuestionIndex(
        assessmentQuestions.filter((q) => q.section === "reading").length - 1
      );
    }
  };

  const calculateLevel = async () => {
    let totalPoints = 0;
    let maxPoints = 0;

    assessmentQuestions.forEach((q) => {
      maxPoints += q.points;
      const userAnswer = answers[q.id]?.toLowerCase().trim();

      if (Array.isArray(q.correctAnswer)) {
        // Pour les questions writing
        if (q.correctAnswer.some((ans) => userAnswer === ans.toLowerCase())) {
          totalPoints += q.points;
        }
      } else {
        // Pour les QCM
        if (userAnswer === q.correctAnswer.toLowerCase()) {
          totalPoints += q.points;
        }
      }
    });

    const percentage = (totalPoints / maxPoints) * 100;

    let level: LanguageLevel;
    if (percentage >= 80) level = "C1";
    else if (percentage >= 65) level = "B2";
    else if (percentage >= 45) level = "B1";
    else level = "A2";

    setAssessedLevel(level);
    setCompleted(true);

    if (user) {
      const updatedUser = {
        ...user,
        currentLevel: level,
        lastActivity: new Date(),
      };
      setUser(updatedUser);

      // Sauvegarder dans localStorage
      localStorage.setItem("levelAssessed", "true");
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Sauvegarder dans Firebase
      try {
        const { markAssessmentCompleted } = await import("../../services/firebase/userService");
        await markAssessmentCompleted(user.id, level);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde dans Firebase:", error);
      }
    }
  };

  const isAnswered = answers[currentQuestion?.id] !== undefined;

  const getQuestionResult = (question: AssessmentQuestion) => {
    const userAnswer = answers[question.id]?.toLowerCase().trim();
    if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.some((ans) => userAnswer === ans.toLowerCase());
    }
    return userAnswer === question.correctAnswer.toLowerCase();
  };

  // Écran de correction détaillée
  if (showCorrection && completed && assessedLevel) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          📝 Correction détaillée de l'évaluation
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Voici la correction complète avec explications grammaticales, exemples et exceptions.
            Prenez le temps de bien comprendre chaque point.
          </Typography>
        </Alert>

        {assessmentQuestions.map((question, index) => {
          const isCorrect = getQuestionResult(question);
          const userAnswer = answers[question.id];
          const correctAnswer = Array.isArray(question.correctAnswer)
            ? question.correctAnswer[0]
            : question.correctAnswer;

          return (
            <Card
              key={question.id}
              sx={{
                mb: 3,
                border: 2,
                borderColor: isCorrect ? "success.main" : "error.main",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Chip label={`Question ${index + 1}`} color={isCorrect ? "success" : "error"} />
                  <Chip label={question.section.toUpperCase()} size="small" />
                  <Chip label={`Niveau ${question.level}`} size="small" variant="outlined" />
                  {isCorrect ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Box
                      sx={{ color: "error.main", display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      ❌ <Typography variant="body2">Incorrect</Typography>
                    </Box>
                  )}
                </Box>

                {/* Question */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {question.question}
                </Typography>

                {/* Texte audio/lecture si applicable */}
                {question.audioText && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      🔊 Texte audio : "{question.audioText}"
                    </Typography>
                  </Box>
                )}

                {question.readingText && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                    <Typography variant="body2">{question.readingText}</Typography>
                  </Box>
                )}

                {/* Réponses */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: isCorrect ? "success.light" : "error.light",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: isCorrect ? "success.dark" : "error.dark", mb: 1 }}
                        >
                          {isCorrect ? "✅ Votre réponse (correcte)" : "❌ Votre réponse"}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {userAnswer || "(non répondu)"}
                        </Typography>
                      </Box>
                    </Grid>
                    {!isCorrect && (
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ color: "success.dark", mb: 1 }}>
                            ✅ Réponse correcte
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {correctAnswer}
                          </Typography>
                          {Array.isArray(question.correctAnswer) &&
                            question.correctAnswer.length > 1 && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Autres réponses acceptées :{" "}
                                {question.correctAnswer.slice(1).join(", ")}
                              </Typography>
                            )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Explication détaillée */}
                <Box sx={{ p: 3, bgcolor: "primary.light", borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    📚 Explication grammaticale
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1 }}>
                    {getDetailedExplanation(question, isCorrect)}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
          <Button variant="outlined" onClick={() => setShowCorrection(false)}>
            Retour au résultat
          </Button>
          <Button variant="contained" onClick={onComplete}>
            Terminer et continuer
          </Button>
        </Box>
      </Box>
    );
  }

  if (completed && assessedLevel) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 3 }} />

            <Typography variant="h4" gutterBottom>
              Évaluation complète terminée !
            </Typography>

            <Box sx={{ my: 4, p: 3, bgcolor: "primary.light", borderRadius: 2 }}>
              <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
                Votre niveau estimé :
              </Typography>
              <Typography variant="h2" sx={{ color: "white", fontWeight: "bold" }}>
                {assessedLevel}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Résultats détaillés :</strong>
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "space-around" }}>
                <Box>
                  <Headphones sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  <Typography variant="caption">
                    Listening:{" "}
                    {
                      assessmentQuestions.filter(
                        (q) =>
                          q.section === "listening" &&
                          answers[q.id]?.toLowerCase() ===
                            (Array.isArray(q.correctAnswer)
                              ? q.correctAnswer[0]
                              : q.correctAnswer
                            ).toLowerCase()
                      ).length
                    }
                    /6
                  </Typography>
                </Box>
                <Box>
                  <MenuBook sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  <Typography variant="caption">
                    Reading:{" "}
                    {
                      assessmentQuestions.filter(
                        (q) =>
                          q.section === "reading" &&
                          answers[q.id]?.toLowerCase() ===
                            (Array.isArray(q.correctAnswer)
                              ? q.correctAnswer[0]
                              : q.correctAnswer
                            ).toLowerCase()
                      ).length
                    }
                    /6
                  </Typography>
                </Box>
                <Box>
                  <Edit sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  <Typography variant="caption">
                    Writing:{" "}
                    {
                      assessmentQuestions.filter(
                        (q) =>
                          q.section === "writing" &&
                          Array.isArray(q.correctAnswer) &&
                          q.correctAnswer.some(
                            (ans) => answers[q.id]?.toLowerCase().trim() === ans.toLowerCase()
                          )
                      ).length
                    }
                    /6
                  </Typography>
                </Box>
              </Box>
            </Alert>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Les exercices seront adaptés à votre niveau. Vous pouvez commencer dès maintenant !
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="outlined" size="large" onClick={() => setShowCorrection(true)}>
                📝 Voir la correction détaillée
              </Button>
              <Button variant="contained" size="large" onClick={onComplete}>
                Commencer les exercices
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleSkip = async () => {
    // Marquer le test comme complété sans résultat
    if (user) {
      try {
        // Sauvegarder dans localStorage
        localStorage.setItem("levelAssessed", "true");

        // Sauvegarder dans Firebase si disponible
        const { markAssessmentCompleted } = await import("../../services/firebase/userService");
        await markAssessmentCompleted(user.id);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du statut d'évaluation:", error);
        // Continuer même en cas d'erreur Firebase
        localStorage.setItem("levelAssessed", "true");
      }
    } else {
      localStorage.setItem("levelAssessed", "true");
    }

    onComplete();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Évaluation complète de niveau
        </Typography>
        <Button variant="outlined" color="secondary" onClick={handleSkip} sx={{ minWidth: 120 }}>
          Passer
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cette évaluation comporte 18 questions réparties en 3 sections :
        <strong> Listening (compréhension orale)</strong>,
        <strong> Reading (compréhension écrite)</strong>, et
        <strong> Writing (expression écrite)</strong>.
        <br />
        <strong>Note :</strong> Ce test est optionnel. Vous pouvez le passer plus tard depuis le
        tableau de bord.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progression globale : {answeredCount}/{totalQuestions} questions
          </Typography>
          <Typography variant="body2" color="primary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Chip
          icon={<Headphones />}
          label="Listening"
          color={currentSection === "listening" ? "primary" : "default"}
          variant={currentSection === "listening" ? "filled" : "outlined"}
        />
        <Chip
          icon={<MenuBook />}
          label="Reading"
          color={currentSection === "reading" ? "primary" : "default"}
          variant={currentSection === "reading" ? "filled" : "outlined"}
        />
        <Chip
          icon={<Edit />}
          label="Writing"
          color={currentSection === "writing" ? "primary" : "default"}
          variant={currentSection === "writing" ? "filled" : "outlined"}
        />
      </Box>

      <Card elevation={3}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary">
              {currentSection.toUpperCase()} - Question {currentQuestionIndex + 1} /{" "}
              {sectionQuestions.length}
            </Typography>

            {currentSection === "listening" && currentQuestion.audioText && (
              <Box
                sx={{
                  my: 2,
                  p: 3,
                  bgcolor: "primary.light",
                  borderRadius: 2,
                  border: 2,
                  borderColor: "primary.main",
                }}
              >
                {!isSupported && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Votre navigateur ne supporte pas la synthèse vocale. Veuillez utiliser Chrome,
                    Edge ou Safari.
                  </Alert>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <VolumeUp sx={{ fontSize: 40, color: "white" }} />
                  <Typography variant="h6" sx={{ color: "white", flexGrow: 1 }}>
                    Section d'écoute
                  </Typography>
                  <Tooltip title={isSpeaking ? "Arrêter" : "Écouter"}>
                    <span>
                      <IconButton
                        onClick={() => playAudio(currentQuestion.audioText!)}
                        disabled={!isSupported}
                        sx={{
                          bgcolor: "white",
                          "&:hover": { bgcolor: "grey.200" },
                          width: 60,
                          height: 60,
                        }}
                      >
                        {isSpeaking ? (
                          <Stop sx={{ fontSize: 30 }} />
                        ) : (
                          <PlayArrow sx={{ fontSize: 30 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.primary" }}>
                    "{currentQuestion.audioText}"
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ display: "block", mt: 1, color: "white" }}>
                  💡 Cliquez sur le bouton lecture pour entendre le texte en anglais
                </Typography>
              </Box>
            )}

            {currentSection === "reading" && currentQuestion.readingText && (
              <Box
                sx={{
                  my: 2,
                  p: 3,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "grey.300",
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {currentQuestion.readingText}
                </Typography>
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
              {currentQuestion.question}
            </Typography>

            {currentSection === "writing" ? (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Entrez votre réponse ici..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                multiline={false}
                sx={{ mb: 2 }}
              />
            ) : (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                >
                  {currentQuestion.options?.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: 1,
                        borderColor: "grey.300",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "grey.50" },
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={currentSection === "listening" && currentQuestionIndex === 0}
            >
              Précédent
            </Button>

            <Button variant="contained" onClick={handleNext} disabled={!isAnswered}>
              {currentSection === "writing" && currentQuestionIndex === sectionQuestions.length - 1
                ? "Terminer l'évaluation"
                : "Suivant"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
