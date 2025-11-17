/**
 * Utilitaires pour générer des analyses de compréhension détaillées
 * Adaptées selon le niveau CECR (A1, A2, B1, B2, C1)
 * @version 1.0.0
 */

import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { CheckCircle, Error, Info, School } from "@mui/icons-material";
import { LanguageLevel } from "../types";

interface AnalysisContent {
  rule: string;
  explanation: string;
  structure?: string;
  examples: string[];
  commonMistakes?: string[];
  vocabulary?: { word: string; definition: string }[];
  tips?: string[];
  exceptions?: string[];
}

interface ComprehensionAnalysisProps {
  questionId: string;
  level: LanguageLevel;
  isCorrect: boolean;
  questionText: string;
  userAnswer?: string;
  correctAnswer: string;
  grammarFocus?: string[];
  vocabularyFocus?: string[];
  customExplanation?: string;
}

/**
 * Génère une analyse de compréhension adaptée au niveau
 */
export const generateComprehensionAnalysis = (
  props: ComprehensionAnalysisProps
): React.ReactElement => {
  const { level, isCorrect, correctAnswer, grammarFocus, customExplanation, userAnswer } = props;

  // Analyses spécifiques par niveau
  const analyses: Record<LanguageLevel, Record<string, AnalysisContent>> = {
    A1: {
      present_simple: {
        rule: "Present Simple (Présent simple)",
        explanation:
          "Le présent simple est utilisé pour parler de choses qui sont toujours vraies, de faits généraux, ou d'actions qui se répètent régulièrement. C'est la base de la communication en anglais.",
        structure:
          "Structure affirmative :\n• I/You/We/They + verbe base\n• He/She/It + verbe + 's' ou 'es'\n\nStructure interrogative :\n• Do/Does + sujet + verbe base\n• Exemple : 'Do you work?' / 'Does she work?'\n\nStructure négative :\n• Don't/Doesn't + verbe base\n• Exemple : 'I don't work' / 'She doesn't work'",
        examples: [
          "I am a developer. (Je suis développeur)",
          "She writes code every day. (Elle écrit du code tous les jours)",
          "We use computers at work. (Nous utilisons des ordinateurs au travail)",
          "The server runs 24/7. (Le serveur fonctionne 24/7)",
          "Do you understand? (Comprenez-vous ?)",
        ],
        commonMistakes: [
          "❌ 'I is a developer' → ✅ 'I am a developer' (am avec I, is avec he/she/it)",
          "❌ 'she work every day' → ✅ 'she works every day' (ajouter 's' à la 3e personne)",
          "❌ 'they is working' → ✅ 'they are working' (are avec we/you/they)",
          "❌ 'Does you work?' → ✅ 'Do you work?' (do avec you/we/they)",
        ],
        tips: [
          "Pour la 3e personne du singulier (he, she, it), ajoutez toujours 's' ou 'es' au verbe",
          "Règles d'ajout de 's' : verbe normal + 's', verbe finissant par -s/-sh/-ch/-x/-o + 'es'",
          "Les verbes irréguliers 'be' et 'have' ont leurs propres formes",
          "Utilisez 'am' avec 'I', 'is' avec 'he/she/it', 'are' avec 'we/you/they'",
          "Pour les questions, utilisez 'do' avec I/you/we/they et 'does' avec he/she/it",
        ],
        vocabulary: [
          { word: "developer", definition: "développeur, développeuse" },
          { word: "work", definition: "travail, travailler" },
          { word: "code", definition: "code (informatique)" },
          { word: "computer", definition: "ordinateur" },
          { word: "server", definition: "serveur" },
        ],
      },
      present_continuous: {
        rule: "Present Continuous (Présent continu)",
        explanation:
          "Le présent continu exprime une action en cours au moment présent ou une action temporaire.",
        structure:
          "Structure affirmative :\n• I am + verb-ing\n• He/She/It is + verb-ing\n• You/We/They are + verb-ing\n\nStructure interrogative :\n• Am/Is/Are + sujet + verb-ing\n• Exemple : 'Are you working?' / 'Is she coding?'\n\nStructure négative :\n• Am/Is/Are + not + verb-ing\n• Exemple : 'I am not working' / 'She isn't coding'",
        examples: [
          "I am working on a project. (Je travaille sur un projet)",
          "She is writing code now. (Elle écrit du code maintenant)",
          "We are testing the application. (Nous testons l'application)",
          "Are you debugging? (Êtes-vous en train de déboguer ?)",
        ],
        commonMistakes: [
          "❌ 'I work now' → ✅ 'I am working now' (action en cours)",
          "❌ 'She write code' → ✅ 'She is writing code' (présent continu)",
          "❌ 'They are work' → ✅ 'They are working' (verbe-ing requis)",
        ],
        tips: [
          "Utilisez le présent continu pour les actions en cours",
          "Forme : be (am/is/are) + verbe-ing",
          "Indicateurs temporels : now, at the moment, currently",
        ],
        vocabulary: [
          { word: "to work", definition: "travailler" },
          { word: "to code", definition: "coder, programmer" },
          { word: "to test", definition: "tester" },
          { word: "now", definition: "maintenant" },
        ],
      },
      articles: {
        rule: "Articles (a/an/the)",
        explanation: "Les articles définissent ou généralisent les noms.",
        structure:
          "Articles indéfinis :\n• a + nom commençant par consonne : 'a developer', 'a computer'\n• an + nom commençant par voyelle : 'an application', 'an error'\n\nArticle défini :\n• the + nom spécifique : 'the project', 'the code'\n\nPas d'article :\n• Noms pluriels généraux : 'developers', 'computers'",
        examples: [
          "I am a developer. (Je suis développeur)",
          "She is an engineer. (Elle est ingénieur)",
          "The code is working. (Le code fonctionne)",
          "Developers use computers. (Les développeurs utilisent des ordinateurs)",
        ],
        commonMistakes: [
          "❌ 'I am developer' → ✅ 'I am a developer' (article requis)",
          "❌ 'an computer' → ✅ 'a computer' (consonne)",
          "❌ 'the developers' (général) → ✅ 'developers' (pas d'article)",
        ],
        tips: [
          "Utilisez 'a' avant une consonne, 'an' avant une voyelle",
          "Utilisez 'the' pour quelque chose de spécifique",
          "Pas d'article pour les pluriels généraux",
        ],
        vocabulary: [
          { word: "a", definition: "un, une (article indéfini)" },
          { word: "an", definition: "un, une (article indéfini devant voyelle)" },
          { word: "the", definition: "le, la, les (article défini)" },
        ],
      },
      basic_vocabulary: {
        rule: "Vocabulaire de base IT",
        explanation:
          "Mots et expressions essentielles pour parler de votre travail dans l'informatique.",
        structure: "Vocabulaire technique de base",
        vocabulary: [
          { word: "developer", definition: "développeur, développeuse" },
          { word: "programmer", definition: "programmeur, programmeuse" },
          { word: "computer", definition: "ordinateur" },
          { word: "code", definition: "code (informatique)" },
          { word: "software", definition: "logiciel" },
          { word: "application", definition: "application" },
          { word: "work", definition: "travail, travailler" },
          { word: "project", definition: "projet" },
        ],
        examples: [
          "I am a developer. (Je suis développeur)",
          "I write code. (J'écris du code)",
          "I use a computer. (J'utilise un ordinateur)",
          "This is my project. (C'est mon projet)",
        ],
        tips: [
          "Mémorisez le vocabulaire technique de votre domaine",
          "Pratiquez en utilisant ces mots dans des phrases simples",
          "Les mots techniques sont souvent similaires en français et en anglais",
        ],
      },
      technical_vocabulary: {
        rule: "Vocabulaire technique A1",
        explanation: "Vocabulaire technique de base pour débuter en IT.",
        vocabulary: [
          { word: "computer", definition: "ordinateur" },
          { word: "keyboard", definition: "clavier" },
          { word: "screen", definition: "écran" },
          { word: "mouse", definition: "souris" },
          { word: "internet", definition: "internet" },
          { word: "website", definition: "site web" },
        ],
        examples: [
          "I use a computer. (J'utilise un ordinateur)",
          "The screen is large. (L'écran est grand)",
          "I browse the internet. (Je navigue sur internet)",
        ],
      },
    },
    A2: {
      present_perfect: {
        rule: "Present Perfect (Présent parfait)",
        explanation:
          "Le présent parfait exprime une action commencée dans le passé et qui continue maintenant, une action récente avec un résultat présent, ou une expérience de vie. Il fait le lien entre le passé et le présent.",
        structure:
          "Structure affirmative :\n• I/You/We/They + have + past participle\n• He/She/It + has + past participle\n\nStructure interrogative :\n• Have/Has + sujet + past participle\n• Exemple : 'Have you finished?' / 'Has she arrived?'\n\nStructure négative :\n• Haven't/Hasn't + past participle\n• Exemple : 'I haven't finished' / 'She hasn't arrived'\n\nIndicateurs temporels :\n• For + durée : 'for two years', 'for a long time'\n• Since + point de départ : 'since 2020', 'since Monday'\n• Already, yet, just, ever, never",
        examples: [
          "I have worked here for two years. (Je travaille ici depuis deux ans)",
          "She has learned English. (Elle a appris l'anglais - résultat présent)",
          "We have finished the project. (Nous avons fini le projet - action récente)",
          "Have you seen this bug? (Avez-vous vu ce bug ?)",
          "The system has been running since this morning. (Le système fonctionne depuis ce matin)",
        ],
        commonMistakes: [
          "❌ 'I have went' → ✅ 'I have gone' (toujours past participle avec have/has)",
          "❌ 'she have done' → ✅ 'she has done' (has avec he/she/it)",
          "❌ 'I work here for 2 years' → ✅ 'I have worked here for 2 years' (action continue)",
          "❌ 'I finished the code yesterday' (✅ correct si action terminée) vs 'I have finished the code' (✅ correct si résultat présent)",
        ],
        tips: [
          "Utilisez 'for' pour une durée : 'for 2 years', 'for a week'",
          "Utilisez 'since' pour un point de départ : 'since 2020', 'since Monday'",
          "Le present perfect met l'accent sur le résultat présent, le past simple sur l'action passée",
          "Les verbes irréguliers : go → gone, see → seen, do → done, write → written",
        ],
        vocabulary: [
          { word: "to finish", definition: "finir, terminer" },
          { word: "to deploy", definition: "déployer, mettre en production" },
          { word: "to complete", definition: "compléter, achever" },
          { word: "already", definition: "déjà" },
          { word: "yet", definition: "encore, toujours (négatif/question)" },
        ],
      },
      past_simple: {
        rule: "Past Simple (Passé simple)",
        explanation:
          "Le passé simple décrit une action terminée dans le passé, à un moment précis. Il est souvent accompagné d'indicateurs temporels précis.",
        structure:
          "Structure affirmative :\n• Sujet + verbe-ed (verbes réguliers)\n• Sujet + forme irrégulière (verbes irréguliers)\n\nVerbes réguliers : work → worked, test → tested\nVerbes irréguliers : go → went, see → saw, do → did\n\nStructure interrogative :\n• Did + sujet + verbe base\n• Exemple : 'Did you work yesterday?'\n\nStructure négative :\n• Didn't + verbe base\n• Exemple : 'I didn't work yesterday'\n\nIndicateurs temporels : yesterday, last week, in 2020, ago, when",
        examples: [
          "I worked on this project yesterday. (J'ai travaillé sur ce projet hier)",
          "The application was deployed last week. (L'application a été déployée la semaine dernière)",
          "She tested the code two days ago. (Elle a testé le code il y a deux jours)",
          "Did you fix the bug? (Avez-vous corrigé le bug ?)",
          "We didn't finish on time. (Nous n'avons pas terminé à temps)",
        ],
        commonMistakes: [
          "❌ 'I work yesterday' → ✅ 'I worked yesterday' (toujours passé avec indicateur temporel)",
          "❌ 'was deploy' → ✅ 'was deployed' (past participle dans la voix passive)",
          "❌ 'Did you worked?' → ✅ 'Did you work?' (verbe base après did)",
          "❌ 'I didn't went' → ✅ 'I didn't go' (verbe base après didn't)",
        ],
        tips: [
          "Les verbes réguliers prennent '-ed' au passé : work → worked, test → tested",
          "Les verbes irréguliers ont leur propre forme : go → went, see → saw, do → did",
          "Après 'did' ou 'didn't', utilisez toujours le verbe à la base (sans -ed)",
          "Utilisez le passé simple avec des indicateurs temporels précis : yesterday, last week, in 2020",
        ],
        vocabulary: [
          { word: "yesterday", definition: "hier" },
          { word: "last week", definition: "la semaine dernière" },
          { word: "ago", definition: "il y a" },
          { word: "when", definition: "quand (indicateur de temps)" },
          { word: "to deploy", definition: "déployer" },
        ],
      },
      future_simple: {
        rule: "Future Simple (Futur simple)",
        explanation:
          "Le futur simple exprime une action future ou une décision prise au moment de parler.",
        structure:
          "Structure affirmative :\n• Will + verbe base\n• Exemple : 'I will work' / 'She will code'\n\nStructure interrogative :\n• Will + sujet + verbe base\n• Exemple : 'Will you work?' / 'Will she code?'\n\nStructure négative :\n• Won't + verbe base\n• Exemple : 'I won't work' / 'She won't code'\n\nForme contractée : 'll pour will, won't pour will not",
        examples: [
          "I will deploy the code tomorrow. (Je déploierai le code demain)",
          "She will test the application. (Elle testera l'application)",
          "Will you finish on time? (Finirez-vous à temps ?)",
          "We won't release this version. (Nous ne publierons pas cette version)",
        ],
        commonMistakes: [
          "❌ 'I will to work' → ✅ 'I will work' (pas de 'to' après will)",
          "❌ 'She will works' → ✅ 'She will work' (verbe base)",
          "❌ 'I will working' → ✅ 'I will work' (verbe base, pas -ing)",
        ],
        tips: [
          "Will + verbe base (pas de -s, pas de -ing, pas de to)",
          "Utilisez will pour décisions spontanées ou prédictions",
          "Forme contractée : I'll, you'll, he'll, she'll, we'll, they'll",
        ],
        vocabulary: [
          { word: "tomorrow", definition: "demain" },
          { word: "next week", definition: "la semaine prochaine" },
          { word: "will", definition: "verbe auxiliaire du futur" },
          { word: "to deploy", definition: "déployer" },
        ],
      },
      past_continuous: {
        rule: "Past Continuous (Passé continu)",
        explanation: "Le passé continu exprime une action en cours à un moment précis du passé.",
        structure:
          "Structure affirmative :\n• I/He/She/It was + verb-ing\n• You/We/They were + verb-ing\n\nStructure interrogative :\n• Was/Were + sujet + verb-ing\n• Exemple : 'Were you working?'\n\nStructure négative :\n• Wasn't/Weren't + verb-ing\n• Exemple : 'I wasn't working'",
        examples: [
          "I was coding when the bug appeared. (Je codais quand le bug est apparu)",
          "They were testing the application yesterday. (Ils testaient l'application hier)",
          "Was she working on the project? (Travaillait-elle sur le projet ?)",
        ],
        commonMistakes: [
          "❌ 'I was work' → ✅ 'I was working' (verbe-ing requis)",
          "❌ 'They was working' → ✅ 'They were working' (were avec they/we/you)",
          "❌ 'I were coding' → ✅ 'I was coding' (was avec I/he/she/it)",
        ],
        tips: [
          "Utilisez was avec I/he/she/it, were avec you/we/they",
          "Toujours verbe-ing après was/were",
          "Souvent utilisé avec 'when' ou 'while'",
        ],
        vocabulary: [
          { word: "was", definition: "était, étais (passé de be)" },
          { word: "were", definition: "étiez, étaient (passé de be)" },
          { word: "when", definition: "quand" },
          { word: "while", definition: "pendant que" },
        ],
      },
      comparative_superlative: {
        rule: "Comparative and Superlative (Comparatif et Superlatif)",
        explanation: "Le comparatif compare deux éléments, le superlatif identifie le plus/moins.",
        structure:
          "Comparatif :\n• Court : adjective + -er + than : 'faster than'\n• Long : more + adjective + than : 'more efficient than'\n\nSuperlatif :\n• Court : the + adjective + -est : 'the fastest'\n• Long : the + most + adjective : 'the most efficient'\n\nExceptions : good → better/best, bad → worse/worst",
        examples: [
          "This code is faster than the old one. (Ce code est plus rapide que l'ancien)",
          "She is the most experienced developer. (Elle est la développeuse la plus expérimentée)",
          "The new version is better. (La nouvelle version est meilleure)",
        ],
        commonMistakes: [
          "❌ 'more fast' → ✅ 'faster' (adjectif court)",
          "❌ 'the most fast' → ✅ 'the fastest' (adjectif court)",
          "❌ 'gooder' → ✅ 'better' (exception)",
        ],
        tips: [
          "Adjectifs courts (1-2 syllabes) : +er/+est",
          "Adjectifs longs (3+ syllabes) : more/most",
          "Exceptions importantes : good/better/best, bad/worse/worst",
        ],
        vocabulary: [
          { word: "faster", definition: "plus rapide" },
          { word: "better", definition: "meilleur" },
          { word: "more efficient", definition: "plus efficace" },
          { word: "the most", definition: "le plus" },
        ],
      },
    },
    B1: {
      conditional: {
        rule: "Conditional (Conditionnel)",
        explanation: "Le conditionnel exprime une situation hypothétique ou une possibilité.",
        structure:
          "If + présent → futur\n• 'If I have time, I will help' (Si j'ai le temps, j'aiderai)",
        examples: [
          "If I have time, I will help you.",
          "If you need help, I can assist you.",
          "If the test passes, we can deploy.",
        ],
        commonMistakes: [
          "❌ 'If I will have' → ✅ 'If I have'",
          "❌ 'If you will need' → ✅ 'If you need'",
        ],
        tips: [
          "Dans la clause 'if', utilisez le présent, pas le futur",
          "Le futur va dans la clause principale",
        ],
      },
      passive_voice: {
        rule: "Passive Voice (Voix passive)",
        explanation: "La voix passive met l'accent sur l'action, pas sur qui la fait.",
        structure:
          "Be (conjugué) + past participle\n• 'The code was reviewed' (le code a été révisé)\n• 'The app is tested' (l'app est testée)",
        examples: [
          "The code was reviewed by the team.",
          "The application is tested regularly.",
          "The bug was fixed yesterday.",
        ],
        commonMistakes: ["❌ 'was review' → ✅ 'was reviewed'", "❌ 'is testing' → ✅ 'is tested'"],
        tips: [
          "Utilisez la voix passive quand l'agent n'est pas important",
          "Toujours utiliser le past participle (verbe-ed ou irrégulier)",
          "Forme : be (conjugué) + past participle",
        ],
        vocabulary: [
          { word: "to review", definition: "réviser, examiner" },
          { word: "to test", definition: "tester" },
          { word: "to fix", definition: "corriger, réparer" },
          { word: "by", definition: "par (agent dans la voix passive)" },
        ],
      },
      past_perfect: {
        rule: "Past Perfect (Plus-que-parfait)",
        explanation:
          "Le past perfect exprime une action terminée avant une autre action dans le passé.",
        structure:
          "Structure affirmative :\n• Had + past participle\n• Exemple : 'I had finished' / 'She had deployed'\n\nStructure interrogative :\n• Had + sujet + past participle\n• Exemple : 'Had you finished?'\n\nStructure négative :\n• Hadn't + past participle\n• Exemple : 'I hadn't finished'\n\nUsage : Action 1 (past perfect) → Action 2 (past simple)",
        examples: [
          "I had finished the code before the meeting. (J'avais fini le code avant la réunion)",
          "She had tested the application when the bug appeared. (Elle avait testé l'application quand le bug est apparu)",
          "Had you deployed before the deadline? (Aviez-vous déployé avant la date limite ?)",
        ],
        commonMistakes: [
          "❌ 'I had finish' → ✅ 'I had finished' (past participle requis)",
          "❌ 'I have finished yesterday' → ✅ 'I had finished yesterday' (passé avant passé)",
          "❌ 'She had deploy' → ✅ 'She had deployed' (past participle)",
        ],
        tips: [
          "Toujours past participle après had",
          "Utilisez le past perfect pour l'action la plus ancienne",
          "Indicateurs : before, after, when, by the time",
        ],
        vocabulary: [
          { word: "before", definition: "avant" },
          { word: "after", definition: "après" },
          { word: "by the time", definition: "au moment où" },
          { word: "already", definition: "déjà" },
        ],
      },
      second_conditional: {
        rule: "Second Conditional (Conditionnel type 2)",
        explanation:
          "Le second conditional exprime une situation hypothétique irréelle au présent ou futur.",
        structure:
          "Structure :\n• If + past simple → would/could/might + verbe base\n• Exemple : 'If I had time, I would help'\n\nInversion formelle :\n• Were + sujet → would + verbe base\n• Exemple : 'Were I you, I would test' (Si j'étais vous)",
        examples: [
          "If I had more time, I would write better code. (Si j'avais plus de temps, j'écrirais un meilleur code)",
          "If she were here, she could help. (Si elle était là, elle pourrait aider)",
          "I would deploy if the tests passed. (Je déploierais si les tests passaient)",
        ],
        commonMistakes: [
          "❌ 'If I would have time' → ✅ 'If I had time' (pas de would dans la clause if)",
          "❌ 'If I was you' → ✅ 'If I were you' (were avec tous les sujets formel)",
          "❌ 'I would to help' → ✅ 'I would help' (pas de to après would)",
        ],
        tips: [
          "If + past simple (pas de would dans la clause if)",
          "Would/could/might + verbe base (pas de to)",
          "Utilisé pour situations irréelles ou hypothétiques",
        ],
        vocabulary: [
          { word: "would", definition: "conditionnel : je ferais" },
          { word: "could", definition: "pourrait" },
          { word: "might", definition: "pourrait (possibilité)" },
        ],
      },
      modal_verbs: {
        rule: "Modal Verbs (Verbes modaux)",
        explanation: "Les verbes modaux expriment capacité, permission, obligation, possibilité.",
        structure:
          "Structure : Modal + verbe base (sans 'to')\n\nModaux principaux :\n• Can : capacité/permission\n• Could : capacité passée/politesse\n• Must : obligation forte\n• Should : conseil/obligation faible\n• May/Might : possibilité",
        examples: [
          "I can code in Python. (Je peux coder en Python)",
          "You should test the code. (Vous devriez tester le code)",
          "We must fix this bug. (Nous devons corriger ce bug)",
          "She could help if needed. (Elle pourrait aider si nécessaire)",
        ],
        commonMistakes: [
          "❌ 'I can to code' → ✅ 'I can code' (pas de to après modal)",
          "❌ 'She can codes' → ✅ 'She can code' (verbe base)",
          "❌ 'You must to test' → ✅ 'You must test' (pas de to)",
        ],
        tips: [
          "Toujours verbe base après modaux (pas de -s, pas de -ing, pas de to)",
          "Can = capacité/permission, Must = obligation forte, Should = conseil",
          "Pas de -s à la 3e personne avec les modaux",
        ],
        vocabulary: [
          { word: "can", definition: "pouvoir (capacité/permission)" },
          { word: "must", definition: "devoir (obligation forte)" },
          { word: "should", definition: "devoir (conseil)" },
          { word: "could", definition: "pourrait (capacité passée/politesse)" },
        ],
      },
      technical_vocabulary: {
        rule: "Vocabulaire technique B1",
        explanation: "Vocabulaire technique intermédiaire pour l'informatique.",
        vocabulary: [
          { word: "database", definition: "base de données" },
          { word: "framework", definition: "framework, cadre de travail" },
          { word: "API", definition: "Interface de Programmation Applicative" },
          { word: "backend", definition: "backend, côté serveur" },
          { word: "frontend", definition: "frontend, côté client" },
        ],
        examples: [
          "The database stores user data. (La base de données stocke les données utilisateur)",
          "This framework is popular. (Ce framework est populaire)",
          "The API is well documented. (L'API est bien documentée)",
        ],
      },
    },
    B2: {
      present_perfect_continuous: {
        rule: "Present Perfect Continuous",
        explanation:
          "Exprime une action commencée dans le passé et qui continue jusqu'à maintenant, avec emphase sur la durée.",
        structure:
          "Have/Has + been + verbe-ing\n• 'I have been working' (je travaille depuis...)\n• 'She has been learning' (elle apprend depuis...)",
        examples: [
          "I have been working on this project for three months.",
          "She has been learning English for five years.",
          "We have been developing this feature since January.",
        ],
        commonMistakes: [
          "❌ 'have been work' → ✅ 'have been working'",
          "❌ 'has been learn' → ✅ 'has been learning'",
        ],
        tips: [
          "Emphase sur la durée/continuité",
          "Utilisez 'for' pour une durée, 'since' pour un point de départ",
        ],
      },
      modal_perfect: {
        rule: "Modal Perfect (Could have / Should have)",
        explanation:
          "Exprime une possibilité ou obligation dans le passé qui ne s'est pas réalisée.",
        structure:
          "Modal + have + past participle\n• 'could have been' (aurait pu être)\n• 'should have done' (aurait dû faire)",
        examples: [
          "The vulnerability could have been prevented.",
          "You should have tested the code first.",
          "The bug would have been caught with better tests.",
        ],
        commonMistakes: [
          "❌ 'could has been' → ✅ 'could have been'",
          "❌ 'should has done' → ✅ 'should have done'",
        ],
        tips: [
          "Toujours utiliser 'have', pas 'has', après les modaux",
          "Signifie 'c'était possible, mais ça n'a pas été fait'",
          "Could have = aurait pu, Should have = aurait dû, Would have = aurait fait",
        ],
        vocabulary: [
          { word: "could have", definition: "aurait pu" },
          { word: "should have", definition: "aurait dû" },
          { word: "would have", definition: "aurait fait" },
          { word: "might have", definition: "aurait pu (possibilité faible)" },
        ],
      },
      past_perfect_continuous: {
        rule: "Past Perfect Continuous",
        explanation:
          "Exprime une action continue dans le passé qui s'est terminée avant une autre action passée.",
        structure:
          "Structure :\n• Had been + verb-ing\n• Exemple : 'I had been working' / 'She had been coding'\n\nUsage : Action continue (had been -ing) → Action 2 (past simple)",
        examples: [
          "I had been coding for hours when the bug appeared. (Je codais depuis des heures quand le bug est apparu)",
          "She had been testing the application when it crashed. (Elle testait l'application quand elle a planté)",
          "We had been working on this feature for weeks before we released it. (Nous travaillions sur cette fonctionnalité depuis des semaines avant de la publier)",
        ],
        commonMistakes: [
          "❌ 'I had been work' → ✅ 'I had been working' (verbe-ing requis)",
          "❌ 'She had be coding' → ✅ 'She had been coding' (had + been)",
          "❌ 'They had being working' → ✅ 'They had been working' (had been)",
        ],
        tips: [
          "Structure : had + been + verb-ing",
          "Emphase sur la durée d'une action passée",
          "Utilisé avec 'for' (durée) ou 'when' (moment)",
        ],
        vocabulary: [
          { word: "for", definition: "depuis (durée)" },
          { word: "when", definition: "quand" },
          { word: "before", definition: "avant" },
        ],
      },
      reported_speech: {
        rule: "Reported Speech (Discours indirect)",
        explanation:
          "Le discours indirect rapporte ce que quelqu'un a dit sans citer ses mots exacts.",
        structure:
          "Changements de temps :\n• Present → Past : 'I work' → 'He said he worked'\n• Will → Would : 'I will help' → 'She said she would help'\n• Can → Could : 'I can code' → 'He said he could code'\n\nVerbes introducteurs : said, told, asked, explained",
        examples: [
          "He said he was working on the project. (Il a dit qu'il travaillait sur le projet)",
          "She told me she had fixed the bug. (Elle m'a dit qu'elle avait corrigé le bug)",
          "They asked if we could help. (Ils ont demandé si nous pouvions aider)",
        ],
        commonMistakes: [
          "❌ 'He said he is working' → ✅ 'He said he was working' (backshift du temps)",
          "❌ 'She said me' → ✅ 'She told me' (told avec objet, said sans objet)",
          "❌ 'They asked me if did I help' → ✅ 'They asked me if I could help' (ordre normal)",
        ],
        tips: [
          "Faites le 'backshift' des temps (présent → passé)",
          "Utilisez 'told' avec un objet, 'said' sans objet",
          "Ordre normal après 'if' ou 'whether' dans les questions indirectes",
        ],
        vocabulary: [
          { word: "said", definition: "a dit" },
          { word: "told", definition: "a dit à (avec objet)" },
          { word: "asked", definition: "a demandé" },
          { word: "explained", definition: "a expliqué" },
        ],
      },
      relative_clauses: {
        rule: "Relative Clauses (Propositions relatives)",
        explanation:
          "Les propositions relatives ajoutent des informations sur un nom en utilisant qui, que, où, dont.",
        structure:
          "Pronoms relatifs :\n• Who : personnes (sujet) : 'the developer who wrote this'\n• Which : choses (sujet/objet) : 'the code which runs'\n• That : personnes/choses (sujet/objet) : 'the bug that appeared'\n• Where : lieux : 'the office where I work'\n• Whose : possession : 'the developer whose code is clean'",
        examples: [
          "The developer who wrote this code is experienced. (Le développeur qui a écrit ce code est expérimenté)",
          "This is the bug that caused the crash. (C'est le bug qui a causé le crash)",
          "The office where we work is modern. (Le bureau où nous travaillons est moderne)",
        ],
        commonMistakes: [
          "❌ 'The developer which wrote' → ✅ 'The developer who wrote' (who pour personnes)",
          "❌ 'The code who runs' → ✅ 'The code which/that runs' (which/that pour choses)",
          "❌ 'The bug who appeared' → ✅ 'The bug that/which appeared' (that/which pour choses)",
        ],
        tips: [
          "Who pour personnes (sujet), whom pour personnes (objet formel)",
          "Which/that pour choses (sujet ou objet)",
          "Where pour lieux, whose pour possession",
        ],
        vocabulary: [
          { word: "who", definition: "qui (personnes)" },
          { word: "which", definition: "qui, que (choses)" },
          { word: "that", definition: "qui, que (personnes/choses)" },
          { word: "where", definition: "où (lieux)" },
        ],
      },
      technical_vocabulary: {
        rule: "Vocabulaire technique B2",
        explanation: "Vocabulaire spécialisé avancé pour les technologies IT.",
        vocabulary: [
          { word: "technical debt", definition: "dette technique" },
          { word: "deployment", definition: "déploiement" },
          { word: "infrastructure", definition: "infrastructure" },
          { word: "automation", definition: "automatisation" },
          { word: "scalability", definition: "scalabilité" },
          { word: "microservices", definition: "microservices" },
        ],
        examples: [
          "Technical debt accumulates over time. (La dette technique s'accumule avec le temps)",
          "The deployment was successful. (Le déploiement a réussi)",
          "Infrastructure as Code automates provisioning. (L'Infrastructure as Code automatise le provisionnement)",
        ],
      },
    },
    C1: {
      third_conditional: {
        rule: "Third Conditional (Conditionnel passé)",
        explanation:
          "Exprime une situation hypothétique dans le passé et son résultat irréel. L'inversion avec 'Had' rend la phrase plus formelle.",
        structure:
          "Had + sujet + past participle → would have + past participle\n• 'Had I known, I would have acted' (Si j'avais su, j'aurais agi)",
        examples: [
          "Had the team followed best practices, the breach would not have occurred.",
          "Had I known about the bug, I would have fixed it immediately.",
          "Had we tested properly, the issue would have been caught.",
        ],
        commonMistakes: [
          "❌ 'If had I known' → ✅ 'Had I known' (pas de 'if')",
          "❌ 'would has been' → ✅ 'would have been'",
        ],
        tips: [
          "Forme formelle : 'Had' en début de phrase (sans 'if')",
          "Niveau C1 - Structure avancée",
          "Exprime un regret ou une hypothèse irréelle",
        ],
        exceptions: [
          "La forme avec 'If' est aussi correcte mais moins formelle",
          "'If the team had followed' est équivalent mais moins élégant",
        ],
      },
      inversion: {
        rule: "Inversion (Emphase)",
        explanation:
          "L'inversion de l'ordre sujet-verbe est utilisée pour mettre l'emphase, particulièrement après des expressions négatives ou restrictives.",
        structure:
          "Expression restrictive + auxiliaire + sujet + verbe de base\n• 'Not only did it make' (non seulement cela a rendu...)\n• 'Never have I seen' (jamais je n'ai vu...)",
        examples: [
          "Not only did it make the system more secure, but it also improved performance.",
          "Never have I seen such efficient code.",
          "Rarely do we encounter such issues.",
          "Only then did I realize the problem.",
        ],
        commonMistakes: [
          "❌ 'Not only it made' → ✅ 'Not only did it make'",
          "❌ 'Never I have seen' → ✅ 'Never have I seen'",
        ],
        tips: [
          "Niveau C1 - Structure très formelle",
          "Ajoutez un auxiliaire (do/does/did, have/has) après l'expression restrictive",
          "Utilisé dans l'écrit formel et le discours académique",
        ],
        exceptions: [
          "L'inversion est optionnelle avec certaines expressions",
          "Peut être omise dans le langage informel",
        ],
      },
      mixed_conditionals: {
        rule: "Mixed Conditionals (Conditionnels mixtes)",
        explanation:
          "Les conditionnels mixtes combinent différents temps pour exprimer des situations complexes reliant passé et présent.",
        structure:
          "Type 1 : If + past perfect → would + verbe base\n• 'If I had studied more, I would be better now'\n\nType 2 : If + past simple → would have + past participle\n• 'If I were you, I would have tested first'",
        examples: [
          "If I had fixed the bug earlier, the system would be working now. (Si j'avais corrigé le bug plus tôt, le système fonctionnerait maintenant)",
          "If I were more experienced, I would have caught that error. (Si j'étais plus expérimenté, j'aurais attrapé cette erreur)",
          "If we had deployed yesterday, we wouldn't have this problem today. (Si nous avions déployé hier, nous n'aurions pas ce problème aujourd'hui)",
        ],
        commonMistakes: [
          "❌ 'If I had fixed, I would be fixing' → ✅ 'If I had fixed, I would be' (temps cohérents)",
          "❌ 'If I were, I would have be' → ✅ 'If I were, I would have been' (past participle)",
        ],
        tips: [
          "Combinez past perfect (action passée) avec would + base (situation présente)",
          "Ou combinez past simple (situation présente) avec would have (action passée)",
          "Exprime des liens entre passé et présent",
        ],
        exceptions: [
          "Ces structures sont plus rares que les conditionnels standards",
          "Utilisées principalement dans le langage formel",
        ],
      },
      subjunctive: {
        rule: "Subjunctive Mood (Subjonctif)",
        explanation:
          "Le subjonctif exprime des souhaits, des suggestions ou des situations hypothétiques, particulièrement dans des contextes formels.",
        structure:
          "Structure :\n• It is important/recommended that + sujet + verbe base\n• I suggest/recommend that + sujet + verbe base\n• If I were you... (pas 'was')\n\nNote : Le verbe au subjonctif reste à la base, même à la 3e personne",
        examples: [
          "It is important that the code be tested. (Il est important que le code soit testé)",
          "I recommend that he review the code. (Je recommande qu'il révise le code)",
          "If I were you, I would deploy. (Si j'étais vous, je déploierais)",
          "I suggest that she fix the bug. (Je suggère qu'elle corrige le bug)",
        ],
        commonMistakes: [
          "❌ 'It is important that he tests' → ✅ 'It is important that he test' (subjonctif)",
          "❌ 'If I was you' → ✅ 'If I were you' (were au subjonctif)",
          "❌ 'I recommend that she reviews' → ✅ 'I recommend that she review' (subjonctif)",
        ],
        tips: [
          "Verbe base même à la 3e personne au subjonctif",
          "Were (pas was) pour tous les sujets avec 'if I were'",
          "Utilisé après : suggest, recommend, important, essential, necessary",
        ],
        exceptions: [
          "Le subjonctif est souvent remplacé par l'indicatif dans le langage informel",
          "Plus courant en anglais américain qu'en anglais britannique",
        ],
      },
      advanced_modals: {
        rule: "Advanced Modal Verbs (Modaux avancés)",
        explanation:
          "Utilisation avancée des modaux pour exprimer des nuances subtiles de possibilité, obligation et probabilité.",
        structure:
          "Modaux de probabilité :\n• Must : très probable (déduction)\n• Might/May : possible\n• Could : possible mais incertain\n\nModaux passés :\n• Must have + past participle : très probable au passé\n• Might/May/Could have + past participle : possible au passé",
        examples: [
          "The server must be down. (Le serveur doit être en panne - déduction)",
          "She might have forgotten the meeting. (Elle a peut-être oublié la réunion)",
          "This could be a serious bug. (Cela pourrait être un bug sérieux)",
          "He must have fixed the code. (Il a dû corriger le code - déduction passée)",
        ],
        commonMistakes: [
          "❌ 'She must have forget' → ✅ 'She must have forgotten' (past participle)",
          "❌ 'It must be a bug, I'm not sure' → ✅ 'It might be a bug' (must = certitude)",
          "❌ 'He can have done' → ✅ 'He could have done' (can n'a pas de passé)",
        ],
        tips: [
          "Must = très probable/déduction logique",
          "Might/May = possible (might moins certain que may)",
          "Could = possible mais moins probable que might",
          "Must have + past participle pour déduction passée",
        ],
        exceptions: [
          "Must pour obligation : 'You must test the code'",
          "Must have pour déduction : 'He must have left' (il a dû partir)",
        ],
      },
      advanced_technical_vocabulary: {
        rule: "Vocabulaire technique avancé C1",
        explanation:
          "Vocabulaire spécialisé très avancé et concepts complexes en IT, IA et DevOps.",
        vocabulary: [
          {
            word: "retrieval-augmented generation",
            definition: "génération augmentée par récupération (RAG)",
          },
          { word: "microservices architecture", definition: "architecture microservices" },
          { word: "fault isolation", definition: "isolation des pannes" },
          { word: "observability", definition: "observabilité" },
          { word: "model drift", definition: "dérive du modèle" },
          { word: "distributed systems", definition: "systèmes distribués" },
          { word: "event-driven architecture", definition: "architecture orientée événements" },
        ],
        examples: [
          "RAG systems combine retrieval with generation. (Les systèmes RAG combinent récupération et génération)",
          "Microservices improve fault isolation. (Les microservices améliorent l'isolation des pannes)",
          "Observability provides deep insights into system behavior. (L'observabilité fournit des insights profonds sur le comportement du système)",
        ],
      },
    },
  };

  // Sélectionner l'analyse appropriée
  const analysisKey = grammarFocus?.[0] || "basic_vocabulary";
  const levelAnalyses = analyses[level] || analyses.B2;
  const analysis = levelAnalyses[analysisKey] || levelAnalyses["basic_vocabulary"];

  // Utiliser l'explication personnalisée si fournie, sinon utiliser celle de l'analyse
  const explanation = customExplanation
    ? `${customExplanation}\n\n${analysis.explanation}`
    : analysis.explanation;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {userAnswer ? (
          isCorrect ? (
            <Chip icon={<CheckCircle />} label="Bonne réponse ✅" color="success" />
          ) : (
            <Chip icon={<Error />} label="Réponse incorrecte ❌" color="error" />
          )
        ) : (
          <Chip icon={<Info />} label="Correction détaillée 💡" color="info" />
        )}
        <Chip icon={<School />} label={`Niveau ${level}`} variant="outlined" />
      </Box>

      <Typography variant="body1" paragraph sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
        {analysis.rule}
      </Typography>

      <Typography variant="body2" paragraph>
        {explanation}
      </Typography>

      {analysis.structure && (
        <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, mb: 2 }}>
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
          >
            <strong>Structure :</strong>
            <br />
            {analysis.structure}
          </Typography>
        </Box>
      )}

      {analysis.vocabulary && analysis.vocabulary.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Vocabulaire :</strong>
          </Typography>
          {analysis.vocabulary.map((vocab, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2">
                • <strong>{vocab.word}</strong> : {vocab.definition}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {analysis.examples && analysis.examples.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Exemples :</strong>
          </Typography>
          {analysis.examples.map((example, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5, fontStyle: "italic" }}>
              • "{example}"
            </Typography>
          ))}
        </Box>
      )}

      {analysis.commonMistakes && analysis.commonMistakes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>⚠️ Erreurs fréquentes :</strong>
          </Typography>
          {analysis.commonMistakes.map((mistake, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              {mistake}
            </Typography>
          ))}
        </Box>
      )}

      {analysis.tips && analysis.tips.length > 0 && (
        <Box sx={{ mb: 2, bgcolor: "info.light", p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>💡 Conseils :</strong>
          </Typography>
          {analysis.tips.map((tip, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              • {tip}
            </Typography>
          ))}
        </Box>
      )}

      {analysis.exceptions && analysis.exceptions.length > 0 && (
        <Box sx={{ mb: 2, bgcolor: "warning.light", p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>⚠️ Exceptions ou cas particuliers :</strong>
          </Typography>
          {analysis.exceptions.map((exception, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              • {exception}
            </Typography>
          ))}
        </Box>
      )}

      {/* Toujours afficher la bonne réponse avec explications détaillées */}
      <Box
        sx={{
          mt: 2,
          bgcolor:
            isCorrect && userAnswer ? "success.light" : userAnswer ? "error.light" : "info.light",
          p: 2,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: isCorrect && userAnswer ? "success.dark" : "text.primary",
          }}
        >
          <strong>✅ Bonne réponse :</strong> "{correctAnswer}"
        </Typography>
        {userAnswer && (
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            <strong>Votre réponse :</strong> "{userAnswer}"
            {isCorrect ? (
              <Chip label="✅ Correcte" color="success" size="small" sx={{ ml: 1 }} />
            ) : (
              <Chip label="❌ Incorrecte" color="error" size="small" sx={{ ml: 1 }} />
            )}
          </Typography>
        )}
        {!userAnswer && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
            💡 Aucune réponse fournie. Voici la bonne réponse avec les explications détaillées
            ci-dessus.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Génère une analyse simple pour les niveaux A1-A2
 */
export const generateSimpleAnalysis = (props: ComprehensionAnalysisProps): React.ReactElement => {
  return generateComprehensionAnalysis(props);
};

/**
 * Génère une analyse avancée pour les niveaux B2-C1
 */
export const generateAdvancedAnalysis = (props: ComprehensionAnalysisProps): React.ReactElement => {
  return generateComprehensionAnalysis(props);
};
