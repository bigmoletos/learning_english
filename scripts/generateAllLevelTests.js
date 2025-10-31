#!/usr/bin/env node
/**
 * Script pour générer des tests complets pour tous les niveaux CECR (A1, A2, B1, B2, C1)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public/data/toeic_toefl');
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

// Questions adaptées par niveau
const QUESTIONS_BY_LEVEL = {
  A1: {
    reading: [
      {
        text: "I ___ a developer.",
        options: ["am", "is", "are", "be"],
        correctAnswer: "am",
        explanation: "Use 'am' with 'I' in present simple.",
        points: 2
      },
      {
        text: "She ___ code every day.",
        options: ["write", "writes", "writing", "written"],
        correctAnswer: "writes",
        explanation: "Use 'writes' with 'she' in present simple (third person).",
        points: 2
      },
      {
        text: "What ___ you do?",
        options: ["do", "does", "is", "are"],
        correctAnswer: "do",
        explanation: "Use 'do' with 'you' in questions.",
        points: 2
      }
    ],
    listening: [
      {
        text: "What does the speaker say?",
        audioText: "Hello, I am a software developer.",
        options: ["The speaker is a teacher", "The speaker is a developer", "The speaker is a student", "The speaker is a manager"],
        correctAnswer: "The speaker is a developer",
        explanation: "The audio clearly states 'I am a software developer'.",
        points: 2
      }
    ]
  },
  A2: {
    reading: [
      {
        text: "I ___ English for two years.",
        options: ["study", "studied", "have studied", "am studying"],
        correctAnswer: "have studied",
        explanation: "Use present perfect for actions started in the past and continuing now.",
        points: 2
      },
      {
        text: "The application ___ yesterday.",
        options: ["deploy", "deployed", "was deployed", "deploying"],
        correctAnswer: "was deployed",
        explanation: "Use passive voice in past simple for completed actions.",
        points: 3
      }
    ],
    listening: [
      {
        text: "What did the team do yesterday?",
        audioText: "We deployed the new version of the application yesterday.",
        options: ["They tested the application", "They deployed the application", "They designed the application", "They documented the application"],
        correctAnswer: "They deployed the application",
        explanation: "The audio states 'We deployed the new version'.",
        points: 2
      }
    ]
  },
  B1: {
    reading: [
      {
        text: "If I ___ more time, I would improve the code.",
        options: ["have", "had", "has", "having"],
        correctAnswer: "had",
        explanation: "Use past simple in second conditional (if-clause).",
        points: 3
      },
      {
        text: "The system ___ by the team last week.",
        options: ["updated", "was updated", "has updated", "updating"],
        correctAnswer: "was updated",
        explanation: "Passive voice in past simple for completed actions.",
        points: 3
      }
    ],
    listening: [
      {
        text: "What is mentioned about CI/CD?",
        audioText: "Continuous Integration helps teams integrate code changes more frequently and reliably.",
        options: ["It requires manual intervention", "It helps integrate code more frequently", "It slows down development", "It only works for small teams"],
        correctAnswer: "It helps integrate code more frequently",
        explanation: "The audio states that CI helps integrate code changes more frequently.",
        points: 3
      }
    ]
  },
  B2: {
    reading: [
      {
        text: "Technical debt accumulates when teams choose quick solutions ___ better approaches.",
        options: ["instead of", "instead", "rather", "than"],
        correctAnswer: "instead of",
        explanation: "'Instead of' means 'rather than' or 'as an alternative to'.",
        points: 3
      },
      {
        text: "DevOps practices ___ automation and collaboration.",
        options: ["emphasize", "emphasizes", "emphasized", "emphasizing"],
        correctAnswer: "emphasize",
        explanation: "Use present simple plural form with 'practices' (plural subject).",
        points: 3
      }
    ],
    listening: [
      {
        text: "What does the speaker say about CI/CD pipelines?",
        audioText: "CI/CD pipelines automate testing and deployment, reducing time to production.",
        options: ["They require manual steps", "They automate processes and reduce time", "They only work for large teams", "They increase deployment time"],
        correctAnswer: "They automate processes and reduce time",
        explanation: "The audio states that CI/CD automates processes and reduces time.",
        points: 3
      }
    ]
  },
  C1: {
    reading: [
      {
        text: "Had the team ___ best practices, the security breach would not have occurred.",
        options: ["follow", "followed", "following", "follows"],
        correctAnswer: "followed",
        explanation: "Use past perfect in third conditional (if-clause).",
        points: 4
      },
      {
        text: "Not only ___ the system more secure, but it also improved performance.",
        options: ["it made", "made it", "did it make", "it did make"],
        correctAnswer: "did it make",
        explanation: "Inversion after 'Not only' at the beginning of a sentence.",
        points: 4
      }
    ],
    listening: [
      {
        text: "What does the speaker mention about microservices?",
        audioText: "Microservices architecture enables independent deployment and scaling of services, improving system resilience through fault isolation.",
        options: ["Services must be deployed together", "Services can be deployed independently", "Microservices reduce reliability", "Services cannot be scaled separately"],
        correctAnswer: "Services can be deployed independently",
        explanation: "The audio emphasizes independent deployment and scaling.",
        points: 4
      }
    ]
  }
};

// Générer des questions writing par niveau
function generateWritingQuestions(level) {
  const questions = {
    A1: [
      {
        text: "Write 3-5 sentences about your work. Use simple present tense.",
        points: 10,
        minWords: 30,
        maxWords: 50
      }
    ],
    A2: [
      {
        text: "Describe your typical day at work. Write 5-7 sentences using present simple and present continuous.",
        points: 15,
        minWords: 50,
        maxWords: 100
      }
    ],
    B1: [
      {
        text: "Explain how your team collaborates on projects. Write 100-150 words using past simple and present perfect.",
        points: 20,
        minWords: 100,
        maxWords: 150
      }
    ],
    B2: [
      {
        text: "Explain the concept of DevOps and its benefits. Write 150-200 words using appropriate technical vocabulary.",
        points: 25,
        minWords: 150,
        maxWords: 200
      }
    ],
    C1: [
      {
        text: "Discuss the challenges and benefits of microservices architecture. Write 200-250 words demonstrating advanced vocabulary and complex sentence structures.",
        points: 30,
        minWords: 200,
        maxWords: 250
      }
    ]
  };
  return questions[level] || [];
}

// Générer des questions speaking par niveau
function generateSpeakingQuestions(level) {
  const questions = {
    A1: [
      {
        text: "Introduce yourself and describe what you do at work. Speak for 30-60 seconds.",
        points: 10,
        duration: 60
      }
    ],
    A2: [
      {
        text: "Describe your daily routine at work. Speak for 1-2 minutes.",
        points: 15,
        duration: 120
      }
    ],
    B1: [
      {
        text: "Explain how your team works on a project. Speak for 2-3 minutes.",
        points: 20,
        duration: 180
      }
    ],
    B2: [
      {
        text: "Describe how your team manages software deployments. Speak for 2-3 minutes.",
        points: 25,
        duration: 180
      }
    ],
    C1: [
      {
        text: "Explain technical debt and discuss strategies for managing it. Speak for 3-4 minutes.",
        points: 30,
        duration: 240
      }
    ]
  };
  return questions[level] || [];
}

// Générer un test EF SET pour un niveau donné
function generateEFSETTest(level) {
  const readingQuestions = QUESTIONS_BY_LEVEL[level]?.reading || [];
  const listeningQuestions = QUESTIONS_BY_LEVEL[level]?.listening || [];
  const writingQuestions = generateWritingQuestions(level);
  const speakingQuestions = generateSpeakingQuestions(level);

  const readingPoints = readingQuestions.reduce((sum, q) => sum + q.points, 0);
  const listeningPoints = listeningQuestions.reduce((sum, q) => sum + q.points, 0);
  const writingPoints = writingQuestions.reduce((sum, q) => sum + q.points, 0);
  const speakingPoints = speakingQuestions.reduce((sum, q) => sum + q.points, 0);
  const totalPoints = readingPoints + listeningPoints + writingPoints + speakingPoints;

  return {
    id: `efset_${level.toLowerCase()}`,
    type: "efset",
    level: level,
    title: `EF SET - Test d'anglais complet - Niveau ${level}`,
    description: `Testez vos 4 compétences en anglais au niveau ${level} : Reading, Listening, Writing, Speaking`,
    duration: level === 'A1' ? 30 : level === 'A2' ? 40 : level === 'B1' ? 50 : level === 'B2' ? 60 : 70,
    totalPoints: totalPoints,
    adaptive: level !== 'A1' && level !== 'A2',
    sections: [
      {
        id: "reading",
        name: "Reading Comprehension",
        type: "reading",
        points: readingPoints,
        timeLimit: level === 'A1' ? 10 : level === 'A2' ? 15 : level === 'B1' ? 20 : level === 'B2' ? 25 : 30,
        adaptive: false,
        questions: readingQuestions.map((q, i) => ({
          id: `r${i + 1}`,
          level: level,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points
        }))
      },
      {
        id: "listening",
        name: "Listening Comprehension",
        type: "listening",
        points: listeningPoints,
        timeLimit: level === 'A1' ? 10 : level === 'A2' ? 15 : level === 'B1' ? 20 : level === 'B2' ? 25 : 30,
        adaptive: false,
        questions: listeningQuestions.map((q, i) => ({
          id: `l${i + 1}`,
          level: level,
          text: q.text,
          audioText: q.audioText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points
        }))
      },
      {
        id: "writing",
        name: "Writing",
        type: "writing",
        points: writingPoints,
        timeLimit: level === 'A1' ? 10 : level === 'A2' ? 15 : level === 'B1' ? 20 : level === 'B2' ? 25 : 30,
        questions: writingQuestions.map((q, i) => ({
          id: `w${i + 1}`,
          level: level,
          text: q.text,
          type: "essay",
          points: q.points,
          minWords: q.minWords,
          maxWords: q.maxWords,
          rubric: {
            content: Math.floor(q.points * 0.4),
            organization: Math.floor(q.points * 0.3),
            language: Math.floor(q.points * 0.2),
            vocabulary: Math.floor(q.points * 0.1)
          }
        }))
      },
      {
        id: "speaking",
        name: "Speaking",
        type: "speaking",
        points: speakingPoints,
        timeLimit: level === 'A1' ? 5 : level === 'A2' ? 10 : level === 'B1' ? 15 : level === 'B2' ? 15 : 20,
        questions: speakingQuestions.map((q, i) => ({
          id: `s${i + 1}`,
          level: level,
          text: q.text,
          type: "speaking",
          points: q.points,
          duration: q.duration,
          rubric: {
            fluency: Math.floor(q.points * 0.3),
            pronunciation: Math.floor(q.points * 0.25),
            vocabulary: Math.floor(q.points * 0.25),
            grammar: Math.floor(q.points * 0.2)
          }
        }))
      }
    ]
  };
}

// Générer tous les tests EF SET
function generateAllEFSETTests() {
  const tests = LEVELS.map(level => generateEFSETTest(level));
  
  const output = {
    tests: tests
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'efset_all_levels.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`✅ ${tests.length} tests EF SET générés (A1, A2, B1, B2, C1)`);
  return tests.length;
}

// Générer un test TOEIC pour un niveau donné
function generateTOEICTest(level) {
  const grammarQuestions = QUESTIONS_BY_LEVEL[level]?.reading || [];
  const listeningQuestions = QUESTIONS_BY_LEVEL[level]?.listening || [];

  const grammarPoints = grammarQuestions.reduce((sum, q) => sum + q.points, 0) * 2; // Plus de poids pour la grammaire
  const listeningPoints = listeningQuestions.reduce((sum, q) => sum + q.points, 0) * 2;
  const totalPoints = grammarPoints + listeningPoints;

  return {
    id: `toeic_${level.toLowerCase()}`,
    type: "toeic",
    level: level,
    title: `TOEIC Practice Test - Niveau ${level}`,
    description: `Testez votre niveau d'anglais avec ce test TOEIC niveau ${level}`,
    duration: level === 'A1' ? 60 : level === 'A2' ? 90 : 120,
    totalPoints: totalPoints,
    sections: [
      {
        id: "grammar",
        name: "Grammar and Structure",
        type: "reading",
        points: grammarPoints,
        timeLimit: level === 'A1' ? 25 : level === 'A2' ? 30 : 40,
        questions: grammarQuestions.map((q, i) => ({
          id: `g${i + 1}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          grammarFocus: ["present_simple", "technical_vocabulary"],
          points: q.points * 2
        }))
      },
      {
        id: "listening",
        name: "Listening Comprehension",
        type: "listening",
        points: listeningPoints,
        timeLimit: level === 'A1' ? 25 : level === 'A2' ? 30 : 40,
        questions: listeningQuestions.map((q, i) => ({
          id: `l${i + 1}`,
          text: q.text,
          audioText: q.audioText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points * 2
        }))
      }
    ]
  };
}

// Générer tous les tests TOEIC
function generateAllTOEICTests() {
  const tests = LEVELS.map(level => generateTOEICTest(level));
  
  const output = {
    tests: tests
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'toeic_all_levels.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`✅ ${tests.length} tests TOEIC générés (A1, A2, B1, B2, C1)`);
  return tests.length;
}

// Générer un test TOEFL pour un niveau donné
function generateTOEFLTest(level) {
  const readingQuestions = QUESTIONS_BY_LEVEL[level]?.reading || [];
  const listeningQuestions = QUESTIONS_BY_LEVEL[level]?.listening || [];
  const writingQuestions = generateWritingQuestions(level);

  const readingPoints = readingQuestions.reduce((sum, q) => sum + q.points, 0) * 3;
  const listeningPoints = listeningQuestions.reduce((sum, q) => sum + q.points, 0) * 3;
  const writingPoints = writingQuestions.reduce((sum, q) => sum + q.points, 0);
  const totalPoints = readingPoints + listeningPoints + writingPoints;

  return {
    id: `toefl_${level.toLowerCase()}`,
    type: "toefl",
    level: level,
    title: `TOEFL Practice Test - Niveau ${level}`,
    description: `Test avancé TOEFL pour le niveau ${level}`,
    duration: level === 'A1' ? 90 : level === 'A2' ? 120 : level === 'B1' ? 150 : 180,
    totalPoints: totalPoints,
    sections: [
      {
        id: "reading",
        name: "Reading Comprehension",
        type: "reading",
        points: readingPoints,
        timeLimit: level === 'A1' ? 20 : level === 'A2' ? 30 : level === 'B1' ? 40 : 50,
        questions: readingQuestions.map((q, i) => ({
          id: `r${i + 1}`,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          grammarFocus: ["present_simple", "technical_vocabulary"],
          points: q.points * 3
        }))
      },
      {
        id: "listening",
        name: "Listening Comprehension",
        type: "listening",
        points: listeningPoints,
        timeLimit: level === 'A1' ? 20 : level === 'A2' ? 30 : level === 'B1' ? 40 : 50,
        questions: listeningQuestions.map((q, i) => ({
          id: `l${i + 1}`,
          text: q.text,
          audioText: q.audioText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points * 3
        }))
      },
      {
        id: "writing",
        name: "Writing",
        type: "writing",
        points: writingPoints,
        timeLimit: level === 'A1' ? 20 : level === 'A2' ? 30 : level === 'B1' ? 40 : 50,
        questions: writingQuestions.map((q, i) => ({
          id: `w${i + 1}`,
          text: q.text,
          type: "essay",
          points: q.points,
          minWords: q.minWords,
          maxWords: q.maxWords,
          rubric: {
            content: Math.floor(q.points * 0.4),
            organization: Math.floor(q.points * 0.3),
            language: Math.floor(q.points * 0.2),
            vocabulary: Math.floor(q.points * 0.1)
          }
        }))
      }
    ]
  };
}

// Générer tous les tests TOEFL
function generateAllTOEFLTests() {
  const tests = LEVELS.map(level => generateTOEFLTest(level));
  
  const output = {
    tests: tests
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'toefl_all_levels.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`✅ ${tests.length} tests TOEFL générés (A1, A2, B1, B2, C1)`);
  return tests.length;
}

// Fonction principale
function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🔧 Génération des tests pour tous les niveaux (A1-C1)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    const efsetCount = generateAllEFSETTests();
    console.log('');
    const toeicCount = generateAllTOEICTests();
    console.log('');
    const toeflCount = generateAllTOEFLTests();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ TERMINÉ: ${efsetCount} EF SET + ${toeicCount} TOEIC + ${toeflCount} TOEFL = ${efsetCount + toeicCount + toeflCount} tests générés`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 Fichiers créés:');
    console.log('   - public/data/toeic_toefl/efset_all_levels.json');
    console.log('   - public/data/toeic_toefl/toeic_all_levels.json');
    console.log('   - public/data/toeic_toefl/toefl_all_levels.json');
    console.log('');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAllEFSETTests, generateAllTOEICTests, generateAllTOEFLTests };

