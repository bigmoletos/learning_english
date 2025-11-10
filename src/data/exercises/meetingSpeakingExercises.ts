/**
 * Exercices de speaking pour réunions informatiques
 * Inspirés des scénarios réels : support client et réunions d'équipe
 * @version 1.0.0
 * @date 09-11-2025
 */

import { LanguageLevel } from "../../types";

export interface MeetingSpeakingExercise {
  id: string;
  level: LanguageLevel;
  category: "team_meeting" | "client_support" | "problem_solving" | "decision_making";
  title: string;
  scenario: string;
  prompt: string;
  targetPhrases: string[];
  duration: number;
  difficulty: number;
  focusAreas: string[];
  tips: string[];
}

export const meetingSpeakingExercises: MeetingSpeakingExercise[] = [
  // === NIVEAU A2 ===
  {
    id: "meeting_a2_1",
    level: "A2",
    category: "team_meeting",
    title: "Démarrer une réunion",
    scenario: "Vous devez ouvrir une réunion d'équipe hebdomadaire.",
    prompt: "Dites bonjour à l'équipe, remerciez-les d'être présents et annoncez l'objectif principal de la réunion.",
    targetPhrases: [
      "Hello everyone, thank you for joining.",
      "The main objective today is to...",
      "Let's start with a quick round of introductions."
    ],
    duration: 30,
    difficulty: 1,
    focusAreas: ["greetings", "meeting introduction", "basic phrases"],
    tips: [
      "Parlez clairement et lentement",
      "Utilisez des phrases courtes",
      "Souriez pour mettre l'équipe à l'aise"
    ]
  },
  {
    id: "meeting_a2_2",
    level: "A2",
    category: "client_support",
    title: "Expliquer un problème simple",
    scenario: "Un client signale que son application ne démarre pas.",
    prompt: "Expliquez que vous comprenez le problème et que vous allez l'aider.",
    targetPhrases: [
      "I understand the problem.",
      "Let me help you with that.",
      "Could you tell me when the problem started?"
    ],
    duration: 30,
    difficulty: 1,
    focusAreas: ["problem description", "customer service", "simple questions"],
    tips: [
      "Montrez de l'empathie",
      "Posez des questions simples",
      "Confirmez votre compréhension"
    ]
  },
  {
    id: "meeting_a2_3",
    level: "A2",
    category: "team_meeting",
    title: "Demander une clarification",
    scenario: "Votre collègue parle d'un module mais vous n'êtes pas sûr de comprendre.",
    prompt: "Demandez poliment à votre collègue de clarifier de quel module il parle.",
    targetPhrases: [
      "Sorry, could you say that again?",
      "I didn't quite understand.",
      "Could you clarify which module you mean?"
    ],
    duration: 20,
    difficulty: 1,
    focusAreas: ["asking for clarification", "polite requests", "active listening"],
    tips: [
      "N'ayez pas peur de demander",
      "Utilisez 'sorry' ou 'excuse me' pour être poli",
      "Reformulez pour vérifier"
    ]
  },

  // === NIVEAU B1 ===
  {
    id: "meeting_b1_1",
    level: "B1",
    category: "problem_solving",
    title: "Identifier la cause d'un problème",
    scenario: "Votre équipe discute d'un bug en production. Il faut trouver la cause.",
    prompt: "Proposez d'analyser les logs et suggérez que le problème pourrait venir de la dernière mise à jour.",
    targetPhrases: [
      "Let's try to identify the root cause of the issue.",
      "Have you noticed any errors in the logs?",
      "The issue seems to come from the latest update."
    ],
    duration: 45,
    difficulty: 2,
    focusAreas: ["problem analysis", "technical vocabulary", "cause and effect"],
    tips: [
      "Utilisez des connecteurs logiques (because, so, therefore)",
      "Restez factuel et technique",
      "Proposez des hypothèses avec 'might be', 'could be'"
    ]
  },
  {
    id: "meeting_b1_2",
    level: "B1",
    category: "client_support",
    title: "Donner le contexte d'un problème",
    scenario: "Le client rapporte un comportement anormal de l'application.",
    prompt: "Expliquez que vous avez bien compris le problème et donnez le contexte technique : le problème est apparu après la mise à jour et affecte le module d'importation.",
    targetPhrases: [
      "We're facing a performance issue in the import module.",
      "The client reported an unexpected behavior.",
      "The problem seems to come from the latest update."
    ],
    duration: 45,
    difficulty: 2,
    focusAreas: ["context explanation", "technical description", "client communication"],
    tips: [
      "Structurez votre explication (Quoi ? Quand ? Où ?)",
      "Utilisez un vocabulaire technique approprié",
      "Rassurez le client sur la prise en charge"
    ]
  },
  {
    id: "meeting_b1_3",
    level: "B1",
    category: "decision_making",
    title: "Proposer des solutions",
    scenario: "L'équipe cherche comment résoudre une fuite mémoire.",
    prompt: "Proposez trois options : redémarrer le service, déployer un correctif temporaire, ou revenir à la version précédente.",
    targetPhrases: [
      "Here are a few possible approaches to fix the issue.",
      "I suggest restarting the service and monitoring the behavior.",
      "Another option would be to roll back to the previous version."
    ],
    duration: 60,
    difficulty: 2,
    focusAreas: ["suggesting solutions", "conditional structures", "technical options"],
    tips: [
      "Présentez plusieurs options",
      "Expliquez les avantages/inconvénients",
      "Utilisez 'I suggest...', 'We could...', 'Another option would be...'"
    ]
  },

  // === NIVEAU B2 ===
  {
    id: "meeting_b2_1",
    level: "B2",
    category: "team_meeting",
    title: "Gérer un désaccord technique",
    scenario: "Un collègue propose une solution que vous trouvez risquée. Vous devez exprimer votre désaccord de manière diplomatique.",
    prompt: "Exprimez que vous comprenez son point de vue, mais proposez une approche alternative plus sûre en expliquant les risques potentiels.",
    targetPhrases: [
      "I understand your point of view, but here's another approach.",
      "Let's stay focused on the technical facts.",
      "I'm concerned about the potential impact on production."
    ],
    duration: 60,
    difficulty: 3,
    focusAreas: ["diplomatic disagreement", "risk assessment", "alternative proposals"],
    tips: [
      "Commencez par valider le point de vue de l'autre",
      "Utilisez des formules diplomatiques ('however', 'on the other hand')",
      "Appuyez votre argument avec des faits techniques"
    ]
  },
  {
    id: "meeting_b2_2",
    level: "B2",
    category: "client_support",
    title: "Expliquer une architecture complexe",
    scenario: "Le client veut comprendre pourquoi le système est lent pendant les pics de charge.",
    prompt: "Expliquez l'architecture actuelle, identifiez le goulot d'étranglement (bottleneck), et proposez une solution de scaling horizontal avec load balancing.",
    targetPhrases: [
      "Our current architecture leverages a single-server model.",
      "The bottleneck appears to be at the database level.",
      "I suggest implementing horizontal scaling with load balancing.",
      "This approach would improve performance during peak hours."
    ],
    duration: 90,
    difficulty: 3,
    focusAreas: ["architecture explanation", "performance analysis", "technical proposals"],
    tips: [
      "Utilisez des schémas ou des diagrammes si possible",
      "Simplifiez les concepts techniques pour le client",
      "Donnez des exemples concrets"
    ]
  },
  {
    id: "meeting_b2_3",
    level: "B2",
    category: "problem_solving",
    title: "Analyser une panne réseau",
    scenario: "Le système est inaccessible pour certains utilisateurs. Vous devez mener l'investigation.",
    prompt: "Analysez la situation : vérifiez les logs, testez la connectivité réseau, identifiez les utilisateurs affectés, et proposez un plan d'action avec des priorités.",
    targetPhrases: [
      "Let's start by checking the network connectivity.",
      "It might be related to the firewall configuration.",
      "We need to prioritize restoring service for critical users.",
      "I'll coordinate with the infrastructure team."
    ],
    duration: 90,
    difficulty: 3,
    focusAreas: ["incident management", "troubleshooting", "coordination"],
    tips: [
      "Suivez une méthodologie structurée (Observe → Analyze → Act)",
      "Communiquez clairement les priorités",
      "Coordonnez avec les autres équipes"
    ]
  },

  // === NIVEAU C1 ===
  {
    id: "meeting_c1_1",
    level: "C1",
    category: "team_meeting",
    title: "Faciliter une réunion d'architecture critique",
    scenario: "Vous animez une réunion pour décider de la migration vers une architecture microservices. Il y a des opinions divergentes.",
    prompt: "Facilitez la discussion : présentez les enjeux, donnez la parole à chaque partie, synthétisez les arguments, et guidez l'équipe vers un consensus en tenant compte des contraintes techniques, budgétaires et de timeline.",
    targetPhrases: [
      "Let's evaluate the trade-offs between monolithic and microservices architectures.",
      "I'd like to hear everyone's perspective on this critical decision.",
      "While I appreciate the technical benefits, we must consider the operational complexity.",
      "To reach a consensus, let's focus on our core requirements and constraints."
    ],
    duration: 120,
    difficulty: 5,
    focusAreas: ["meeting facilitation", "consensus building", "strategic thinking"],
    tips: [
      "Restez neutre en tant que facilitateur",
      "Reformulez les arguments pour assurer la compréhension",
      "Guidez vers des décisions basées sur des critères objectifs"
    ]
  },
  {
    id: "meeting_c1_2",
    level: "C1",
    category: "client_support",
    title: "Gérer une escalade client avec impact business",
    scenario: "Un client majeur menace de résilier le contrat suite à des problèmes de performance récurrents. Vous devez gérer la situation.",
    prompt: "Menez la réunion de crise : reconnaissez les problèmes rencontrés, présentez l'analyse des causes profondes, détaillez le plan d'action correctif avec timelines, proposez des compensations, et restaurez la confiance.",
    targetPhrases: [
      "First, I want to acknowledge the impact these issues have had on your operations.",
      "We've conducted a thorough root cause analysis and identified three key factors.",
      "Here's our comprehensive remediation plan with specific milestones and accountability.",
      "To demonstrate our commitment, we're proposing the following compensatory measures.",
      "I'd like to schedule weekly checkpoints to ensure transparency throughout the resolution."
    ],
    duration: 120,
    difficulty: 5,
    focusAreas: ["crisis management", "stakeholder communication", "commitment restoration"],
    tips: [
      "Montrez de l'empathie sans faire d'excuses vagues",
      "Soyez transparent sur les causes et les solutions",
      "Engagez-vous sur des résultats mesurables",
      "Proposez une gouvernance claire du suivi"
    ]
  },
  {
    id: "meeting_c1_3",
    level: "C1",
    category: "decision_making",
    title: "Présenter une stratégie MLOps à des stakeholders",
    scenario: "Vous devez convaincre les stakeholders (CTO, CFO, Product Manager) d'investir dans une plateforme MLOps.",
    prompt: "Présentez la stratégie : contexte business, problèmes actuels (dette technique ML, time-to-market, reproductibilité), bénéfices attendus (ROI, scalabilité, gouvernance), architecture proposée, roadmap de déploiement, et budget. Gérez les questions et objections.",
    targetPhrases: [
      "Our current ML deployment process is manual and error-prone, resulting in significant technical debt.",
      "Implementing a MLOps platform would reduce our model deployment time from weeks to days.",
      "The proposed architecture integrates CI/CD pipelines, model versioning, and automated monitoring.",
      "Based on industry benchmarks, we anticipate a 200% ROI within 18 months.",
      "Regarding your concern about upfront costs, let me break down the phased implementation approach."
    ],
    duration: 120,
    difficulty: 5,
    focusAreas: ["strategic presentation", "business case", "stakeholder management", "technical leadership"],
    tips: [
      "Adaptez votre discours à chaque stakeholder (technique vs business)",
      "Quantifiez les bénéfices (temps, coûts, qualité)",
      "Anticipez les objections et préparez des réponses",
      "Utilisez des analogies pour vulgariser les concepts complexes"
    ]
  },
  {
    id: "meeting_c1_4",
    level: "C1",
    category: "problem_solving",
    title: "Mener un post-mortem d'incident majeur",
    scenario: "Suite à une panne de 4 heures affectant tous les utilisateurs, vous animez la réunion de post-mortem avec toutes les équipes impliquées.",
    prompt: "Facilitez le post-mortem : établissez un timeline des événements, identifiez les causes techniques et organisationnelles, analysez pourquoi les mécanismes de prévention ont échoué, définissez des actions correctives avec responsables et deadlines, et créez une culture d'apprentissage sans blâme.",
    targetPhrases: [
      "This post-mortem is about learning, not blaming. Let's focus on improving our systems.",
      "Let's reconstruct the timeline to understand the cascade of failures.",
      "While the immediate cause was X, the underlying issue was a gap in our monitoring.",
      "I'm proposing we implement chaos engineering practices to prevent similar incidents.",
      "Each action item needs a clear owner and a realistic deadline. Let's assign responsibilities now."
    ],
    duration: 120,
    difficulty: 5,
    focusAreas: ["incident analysis", "blameless culture", "systemic thinking", "continuous improvement"],
    tips: [
      "Créez un environnement psychologiquement sûr",
      "Cherchez les causes systémiques, pas les coupables",
      "Documentez tout pour la mémoire organisationnelle",
      "Transformez chaque incident en opportunité d'apprentissage"
    ]
  }
];

// Fonction utilitaire pour filtrer par catégorie
export const getMeetingExercisesByCategory = (category: MeetingSpeakingExercise["category"]) => {
  return meetingSpeakingExercises.filter(ex => ex.category === category);
};

// Fonction utilitaire pour filtrer par niveau
export const getMeetingExercisesByLevel = (level: LanguageLevel) => {
  return meetingSpeakingExercises.filter(ex => ex.level === level);
};

