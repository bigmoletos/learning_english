/**
 * Script pour remplacer les options "Other X" par de vraies options
 * dans les exercices listening et reading
 * @version 1.0.0
 * @date 31-10-2025
 */

const fs = require('fs');
const path = require('path');

// Répertoires
const listeningPath = path.join(__dirname, '../public/corpus/listening/all_listening_100.json');
const readingPath = path.join(__dirname, '../public/corpus/reading/all_reading_100.json');

// Options alternatives génériques basées sur le contexte IT/DevOps
const alternativeOptionsByContext = {
  topic: {
    "Cloud Migration": [
      "API Development",
      "Database Optimization",
      "Security Protocols"
    ],
    "Agile": [
      "Waterfall Methodology",
      "Scrum Framework",
      "DevOps Practices"
    ],
    "Microservices": [
      "Monolithic Architecture",
      "Serverless Computing",
      "Container Orchestration"
    ],
    "Database Design": [
      "API Integration",
      "User Interface Design",
      "Network Configuration"
    ],
    "API Development": [
      "Database Management",
      "Security Implementation",
      "Frontend Development"
    ],
    "Testing": [
      "Documentation",
      "Deployment",
      "Monitoring"
    ]
  },
  emphasized: {
    "Planning": [
      "Speed",
      "Cost Reduction",
      "Technical Innovation"
    ],
    "Speed": [
      "Quality Assurance",
      "Cost Optimization",
      "Team Collaboration"
    ],
    "Cost": [
      "Performance",
      "Security",
      "Scalability"
    ],
    "Design": [
      "Implementation",
      "Testing",
      "Maintenance"
    ]
  },
  default: [
    "Performance Optimization",
    "Security Enhancement",
    "Cost Reduction",
    "Scalability Improvement",
    "Automation Implementation",
    "Quality Assurance",
    "Team Collaboration",
    "Technology Innovation"
  ]
};

/**
 * Génère des options alternatives pour une question
 */
function generateAlternativeOptions(question, correctAnswer, topic, allQuestions) {
  const options = [];
  const usedAnswers = new Set([correctAnswer]);
  
  // Utiliser le contexte pour générer des alternatives
  const questionTextLower = question.text.toLowerCase();
  
  // Déterminer le type de question
  let alternatives = [];
  
  if (questionTextLower.includes('topic') || questionTextLower.includes('main subject')) {
    // Pour les questions sur le sujet principal
    alternatives = alternativeOptionsByContext.topic[topic] || 
                   alternativeOptionsByContext.default.slice(0, 3);
  } else if (questionTextLower.includes('emphasize') || questionTextLower.includes('focus')) {
    // Pour les questions sur ce qui est souligné
    const emphasizedWord = correctAnswer;
    alternatives = alternativeOptionsByContext.emphasized[emphasizedWord] || 
                   ["Efficiency", "Reliability", "Flexibility"];
  } else if (questionTextLower.includes('benefit') || questionTextLower.includes('advantage')) {
    // Pour les questions sur les avantages
    alternatives = [
      "Reduced costs only",
      "Faster processing only",
      "Better documentation only",
      "Improved quality",
      "Enhanced security",
      "Better user experience"
    ];
  } else if (questionTextLower.includes('step') || questionTextLower.includes('how many')) {
    // Pour les questions sur les étapes/nombres
    const correctNum = parseInt(correctAnswer);
    if (!isNaN(correctNum)) {
      alternatives = [
        String(correctNum - 1),
        String(correctNum + 1),
        String(correctNum + 2)
      ].filter(n => parseInt(n) > 0);
    } else {
      alternatives = ["2", "3", "5"];
    }
  } else {
    // Options génériques basées sur le domaine IT
    alternatives = alternativeOptionsByContext.default.slice(0, 3);
    
    // Si la bonne réponse semble être un concept technique, utiliser des alternatives techniques
    if (correctAnswer.includes('API') || correctAnswer.includes('Service')) {
      alternatives = ["Database Management", "Security Protocols", "User Interface Design"];
    } else if (correctAnswer.includes('Cloud') || correctAnswer.includes('Migration')) {
      alternatives = ["Local Storage", "Hybrid Infrastructure", "On-Premise Solutions"];
    }
  }
  
  // Générer 3 alternatives uniques
  let count = 0;
  for (const alt of alternatives) {
    if (count >= 3) break;
    if (!usedAnswers.has(alt) && alt !== correctAnswer) {
      options.push(alt);
      usedAnswers.add(alt);
      count++;
    }
  }
  
  // Compléter avec des options par défaut si nécessaire
  while (options.length < 3) {
    const defaultOpt = alternativeOptionsByContext.default.find(opt => !usedAnswers.has(opt));
    if (defaultOpt) {
      options.push(defaultOpt);
      usedAnswers.add(defaultOpt);
    } else {
      options.push(`Alternative ${options.length + 1}`);
    }
  }
  
  return options.slice(0, 3);
}

/**
 * Traite les exercices listening
 */
function processListeningExercises() {
  console.log('📚 Traitement des exercices listening...');
  
  if (!fs.existsSync(listeningPath)) {
    console.error(`❌ Fichier non trouvé: ${listeningPath}`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(listeningPath, 'utf8'));
  let modifiedCount = 0;
  let totalQuestions = 0;
  
  if (!data.texts || !Array.isArray(data.texts)) {
    console.error('❌ Format JSON invalide');
    return;
  }
  
  for (const text of data.texts) {
    if (!text.questions || !Array.isArray(text.questions)) continue;
    
    for (const question of text.questions) {
      totalQuestions++;
      
      if (!question.options || !Array.isArray(question.options)) {
        continue;
      }
      
      // Vérifier si la question contient des placeholders "Other X"
      const hasPlaceholders = question.options.some(opt => 
        /^other \d+$/i.test(opt.trim())
      );
      
      if (hasPlaceholders) {
        const correctAnswer = question.correctAnswer;
        
        // Générer de vraies alternatives
        const newOptions = generateAlternativeOptions(
          question,
          correctAnswer,
          text.topic || 'Default',
          text.questions
        );
        
        // Remplacer les options placeholders
        const updatedOptions = [correctAnswer, ...newOptions];
        
        // Mélanger les options (sauf la bonne réponse qui reste en première position)
        const shuffledOptions = [correctAnswer];
        const otherOptions = newOptions.sort(() => Math.random() - 0.5);
        shuffledOptions.push(...otherOptions);
        
        // Mélanger final pour que la bonne réponse ne soit pas toujours en premier
        const finalOptions = shuffledOptions.sort(() => Math.random() - 0.5);
        
        question.options = finalOptions;
        question.correctAnswer = correctAnswer; // Maintenir la bonne réponse
        
        modifiedCount++;
        console.log(`✅ Question "${question.text.substring(0, 50)}..." mise à jour`);
      }
    }
  }
  
  // Sauvegarder
  fs.writeFileSync(listeningPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ ${modifiedCount}/${totalQuestions} questions listening mises à jour`);
  console.log(`✅ Fichier sauvegardé: ${listeningPath}`);
}

/**
 * Traite les exercices reading
 */
function processReadingExercises() {
  console.log('\n📚 Traitement des exercices reading...');
  
  if (!fs.existsSync(readingPath)) {
    console.error(`❌ Fichier non trouvé: ${readingPath}`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(readingPath, 'utf8'));
  let modifiedCount = 0;
  let totalQuestions = 0;
  
  if (!data.texts || !Array.isArray(data.texts)) {
    console.error('❌ Format JSON invalide');
    return;
  }
  
  for (const text of data.texts) {
    if (!text.questions || !Array.isArray(text.questions)) continue;
    
    for (const question of text.questions) {
      totalQuestions++;
      
      if (!question.options || !Array.isArray(question.options)) {
        continue;
      }
      
      // Vérifier si la question contient des placeholders "Other X"
      const hasPlaceholders = question.options.some(opt => 
        /^other \d+$/i.test(opt.trim())
      );
      
      if (hasPlaceholders) {
        const correctAnswer = question.correctAnswer;
        
        // Générer de vraies alternatives
        const newOptions = generateAlternativeOptions(
          question,
          correctAnswer,
          text.topic || 'Default',
          text.questions
        );
        
        // Mélanger les options
        const shuffledOptions = [correctAnswer];
        const otherOptions = newOptions.sort(() => Math.random() - 0.5);
        shuffledOptions.push(...otherOptions);
        
        // Mélanger final pour que la bonne réponse ne soit pas toujours en premier
        const finalOptions = shuffledOptions.sort(() => Math.random() - 0.5);
        
        question.options = finalOptions;
        question.correctAnswer = correctAnswer; // Maintenir la bonne réponse
        
        modifiedCount++;
        console.log(`✅ Question "${question.text.substring(0, 50)}..." mise à jour`);
      }
    }
  }
  
  // Sauvegarder
  fs.writeFileSync(readingPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ ${modifiedCount}/${totalQuestions} questions reading mises à jour`);
  console.log(`✅ Fichier sauvegardé: ${readingPath}`);
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('🚀 Démarrage du script de remplacement des options "Other X"...\n');
  
  try {
    processListeningExercises();
    processReadingExercises();
    
    console.log('\n✅ Script terminé avec succès !');
    console.log('💡 Les exercices incomplets ont été mis à jour avec de vraies options.');
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { processListeningExercises, processReadingExercises };

