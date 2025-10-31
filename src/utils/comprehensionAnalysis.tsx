/**
 * Utilitaires pour générer des analyses de compréhension détaillées
 * Adaptées selon le niveau CECR (A1, A2, B1, B2, C1)
 * @version 1.0.0
 */

import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
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
export const generateComprehensionAnalysis = (props: ComprehensionAnalysisProps): React.ReactElement => {
  const { level, isCorrect, questionText, correctAnswer, grammarFocus, vocabularyFocus, customExplanation } = props;

  // Analyses spécifiques par niveau
  const analyses: Record<LanguageLevel, Record<string, AnalysisContent>> = {
    A1: {
      present_simple: {
        rule: "Present Simple (Présent simple)",
        explanation: "Le présent simple est utilisé pour parler de choses qui sont toujours vraies ou qui se répètent.",
        structure: "Sujet + verbe (base form)\n• 'I work' (je travaille)\n• 'She works' (elle travaille)\n• 'We work' (nous travaillons)",
        examples: [
          "I am a developer.",
          "She writes code every day.",
          "We use computers at work."
        ],
        commonMistakes: [
          "❌ 'I is' → ✅ 'I am'",
          "❌ 'she work' → ✅ 'she works' (ajouter 's' à la 3e personne)"
        ],
        tips: [
          "Pour la 3e personne (he, she, it), ajoutez 's' au verbe",
          "Utilisez 'am' avec 'I', 'is' avec 'he/she/it', 'are' avec 'we/you/they'"
        ]
      },
      basic_vocabulary: {
        rule: "Vocabulaire de base",
        explanation: "Mots et expressions simples pour parler de votre travail.",
        vocabulary: [
          { word: "developer", definition: "développeur" },
          { word: "computer", definition: "ordinateur" },
          { word: "code", definition: "code" },
          { word: "work", definition: "travail" }
        ],
        examples: [
          "I am a developer.",
          "I use a computer.",
          "I write code."
        ]
      }
    },
    A2: {
      present_perfect: {
        rule: "Present Perfect (Présent parfait)",
        explanation: "Le présent parfait exprime une action commencée dans le passé et qui continue maintenant, ou une action récente.",
        structure: "Have/Has + past participle\n• 'I have studied' (j'ai étudié)\n• 'She has worked' (elle a travaillé)\n• 'We have finished' (nous avons fini)",
        examples: [
          "I have worked here for two years.",
          "She has learned English.",
          "We have finished the project."
        ],
        commonMistakes: [
          "❌ 'I have went' → ✅ 'I have gone'",
          "❌ 'she have done' → ✅ 'she has done'"
        ],
        tips: [
          "Utilisez 'for' pour une durée (for 2 years)",
          "Utilisez 'since' pour un point de départ (since 2020)"
        ]
      },
      past_simple: {
        rule: "Past Simple (Passé simple)",
        explanation: "Le passé simple décrit une action terminée dans le passé.",
        structure: "Sujet + verbe-ed (ou verbe irrégulier)\n• 'I worked' (j'ai travaillé)\n• 'She went' (elle est allée)\n• 'We finished' (nous avons fini)",
        examples: [
          "I worked on this project yesterday.",
          "The application was deployed last week.",
          "She tested the code two days ago."
        ],
        commonMistakes: [
          "❌ 'I work yesterday' → ✅ 'I worked yesterday'",
          "❌ 'was deploy' → ✅ 'was deployed'"
        ],
        tips: [
          "Les verbes réguliers prennent '-ed' au passé",
          "Les verbes irréguliers ont leur propre forme (went, did, was)"
        ]
      }
    },
    B1: {
      conditional: {
        rule: "Conditional (Conditionnel)",
        explanation: "Le conditionnel exprime une situation hypothétique ou une possibilité.",
        structure: "If + présent → futur\n• 'If I have time, I will help' (Si j'ai le temps, j'aiderai)",
        examples: [
          "If I have time, I will help you.",
          "If you need help, I can assist you.",
          "If the test passes, we can deploy."
        ],
        commonMistakes: [
          "❌ 'If I will have' → ✅ 'If I have'",
          "❌ 'If you will need' → ✅ 'If you need'"
        ],
        tips: [
          "Dans la clause 'if', utilisez le présent, pas le futur",
          "Le futur va dans la clause principale"
        ]
      },
      passive_voice: {
        rule: "Passive Voice (Voix passive)",
        explanation: "La voix passive met l'accent sur l'action, pas sur qui la fait.",
        structure: "Be (conjugué) + past participle\n• 'The code was reviewed' (le code a été révisé)\n• 'The app is tested' (l'app est testée)",
        examples: [
          "The code was reviewed by the team.",
          "The application is tested regularly.",
          "The bug was fixed yesterday."
        ],
        commonMistakes: [
          "❌ 'was review' → ✅ 'was reviewed'",
          "❌ 'is testing' → ✅ 'is tested'"
        ],
        tips: [
          "Utilisez la voix passive quand l'agent n'est pas important",
          "Toujours utiliser le past participle (verbe-ed ou irrégulier)"
        ]
      }
    },
    B2: {
      present_perfect_continuous: {
        rule: "Present Perfect Continuous",
        explanation: "Exprime une action commencée dans le passé et qui continue jusqu'à maintenant, avec emphase sur la durée.",
        structure: "Have/Has + been + verbe-ing\n• 'I have been working' (je travaille depuis...)\n• 'She has been learning' (elle apprend depuis...)",
        examples: [
          "I have been working on this project for three months.",
          "She has been learning English for five years.",
          "We have been developing this feature since January."
        ],
        commonMistakes: [
          "❌ 'have been work' → ✅ 'have been working'",
          "❌ 'has been learn' → ✅ 'has been learning'"
        ],
        tips: [
          "Emphase sur la durée/continuité",
          "Utilisez 'for' pour une durée, 'since' pour un point de départ"
        ]
      },
      modal_perfect: {
        rule: "Modal Perfect (Could have / Should have)",
        explanation: "Exprime une possibilité ou obligation dans le passé qui ne s'est pas réalisée.",
        structure: "Modal + have + past participle\n• 'could have been' (aurait pu être)\n• 'should have done' (aurait dû faire)",
        examples: [
          "The vulnerability could have been prevented.",
          "You should have tested the code first.",
          "The bug would have been caught with better tests."
        ],
        commonMistakes: [
          "❌ 'could has been' → ✅ 'could have been'",
          "❌ 'should has done' → ✅ 'should have done'"
        ],
        tips: [
          "Toujours utiliser 'have', pas 'has', après les modaux",
          "Signifie 'c'était possible, mais ça n'a pas été fait'"
        ]
      },
      technical_vocabulary: {
        rule: "Vocabulaire technique",
        explanation: "Vocabulaire spécialisé pour les technologies IT.",
        vocabulary: [
          { word: "technical debt", definition: "dette technique" },
          { word: "deployment", definition: "déploiement" },
          { word: "infrastructure", definition: "infrastructure" },
          { word: "automation", definition: "automatisation" }
        ],
        examples: [
          "Technical debt accumulates over time.",
          "The deployment was successful.",
          "Infrastructure as Code automates provisioning."
        ]
      }
    },
    C1: {
      third_conditional: {
        rule: "Third Conditional (Conditionnel passé)",
        explanation: "Exprime une situation hypothétique dans le passé et son résultat irréel. L'inversion avec 'Had' rend la phrase plus formelle.",
        structure: "Had + sujet + past participle → would have + past participle\n• 'Had I known, I would have acted' (Si j'avais su, j'aurais agi)",
        examples: [
          "Had the team followed best practices, the breach would not have occurred.",
          "Had I known about the bug, I would have fixed it immediately.",
          "Had we tested properly, the issue would have been caught."
        ],
        commonMistakes: [
          "❌ 'If had I known' → ✅ 'Had I known' (pas de 'if')",
          "❌ 'would has been' → ✅ 'would have been'"
        ],
        tips: [
          "Forme formelle : 'Had' en début de phrase (sans 'if')",
          "Niveau C1 - Structure avancée",
          "Exprime un regret ou une hypothèse irréelle"
        ],
        exceptions: [
          "La forme avec 'If' est aussi correcte mais moins formelle",
          "'If the team had followed' est équivalent mais moins élégant"
        ]
      },
      inversion: {
        rule: "Inversion (Emphase)",
        explanation: "L'inversion de l'ordre sujet-verbe est utilisée pour mettre l'emphase, particulièrement après des expressions négatives ou restrictives.",
        structure: "Expression restrictive + auxiliaire + sujet + verbe de base\n• 'Not only did it make' (non seulement cela a rendu...)\n• 'Never have I seen' (jamais je n'ai vu...)",
        examples: [
          "Not only did it make the system more secure, but it also improved performance.",
          "Never have I seen such efficient code.",
          "Rarely do we encounter such issues.",
          "Only then did I realize the problem."
        ],
        commonMistakes: [
          "❌ 'Not only it made' → ✅ 'Not only did it make'",
          "❌ 'Never I have seen' → ✅ 'Never have I seen'"
        ],
        tips: [
          "Niveau C1 - Structure très formelle",
          "Ajoutez un auxiliaire (do/does/did, have/has) après l'expression restrictive",
          "Utilisé dans l'écrit formel et le discours académique"
        ],
        exceptions: [
          "L'inversion est optionnelle avec certaines expressions",
          "Peut être omise dans le langage informel"
        ]
      },
      advanced_technical_vocabulary: {
        rule: "Vocabulaire technique avancé",
        explanation: "Vocabulaire spécialisé et concepts complexes en IT.",
        vocabulary: [
          { word: "retrieval-augmented generation", definition: "génération augmentée par récupération (RAG)" },
          { word: "microservices architecture", definition: "architecture microservices" },
          { word: "fault isolation", definition: "isolation des pannes" },
          { word: "observability", definition: "observabilité" },
          { word: "model drift", definition: "dérive du modèle" }
        ],
        examples: [
          "RAG systems combine retrieval with generation.",
          "Microservices improve fault isolation.",
          "Observability provides deep insights into system behavior."
        ]
      }
    }
  };

  // Sélectionner l'analyse appropriée
  const analysisKey = grammarFocus?.[0] || "basic_vocabulary";
  const levelAnalyses = analyses[level] || analyses.B2;
  const analysis = levelAnalyses[analysisKey] || levelAnalyses["basic_vocabulary"];

  // Utiliser l'explication personnalisée si fournie
  const explanation = customExplanation || analysis.explanation;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {isCorrect ? (
          <Chip icon={<CheckCircle />} label="Bonne réponse" color="success" />
        ) : (
          <Chip icon={<Error />} label="Réponse incorrecte" color="error" />
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
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
            <strong>Structure :</strong><br/>
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

      {!isCorrect && (
        <Box sx={{ mt: 2, bgcolor: "error.light", p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Votre réponse :</strong> "{userAnswer}"
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            <strong>Bonne réponse :</strong> "{correctAnswer}"
          </Typography>
        </Box>
      )}
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

