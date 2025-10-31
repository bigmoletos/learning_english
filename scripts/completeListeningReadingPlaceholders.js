/**
 * Script pour compléter tous les placeholders manquants
 * dans les exercices listening et reading
 * @version 1.0.0
 * @date 31-10-2025
 */

const fs = require('fs');
const path = require('path');

// Répertoires
const listeningPath = path.join(__dirname, '../public/corpus/listening/all_listening_100.json');
const readingPath = path.join(__dirname, '../public/corpus/reading/all_reading_100.json');

// Générer une transcription complète basée sur le topic
function generateTranscript(topic, level) {
  const templates = {
    "Cloud Migration": `Cloud Migration is a fundamental process in modern IT infrastructure management. Organizations are increasingly moving their workloads from on-premise servers to cloud platforms to achieve better scalability, cost efficiency, and flexibility. The migration process involves several critical steps including assessment, planning, execution, and optimization. During the assessment phase, teams evaluate current infrastructure and identify which applications are suitable for cloud deployment. Planning requires careful consideration of security, compliance, and performance requirements. The execution phase involves moving data and applications while ensuring minimal downtime. Finally, optimization ensures that cloud resources are used efficiently and costs are minimized.`,
    
    "Agile": `Agile methodology represents a revolutionary approach to software development that emphasizes iterative progress, collaboration, and adaptability. Unlike traditional waterfall methods, Agile breaks down projects into small, manageable sprints typically lasting two to four weeks. Each sprint results in a potentially shippable product increment. Key principles include customer collaboration over contract negotiation, responding to change over following a plan, and individuals and interactions over processes and tools. Daily stand-up meetings, sprint planning, and retrospectives are essential Agile ceremonies. This approach enables teams to respond quickly to changing requirements and deliver value more frequently to stakeholders.`,
    
    "Microservices": `Microservices architecture is a modern approach to building distributed systems where applications are composed of small, independent services that communicate over well-defined APIs. Each service is responsible for a specific business capability and can be developed, deployed, and scaled independently. This architecture pattern offers significant advantages including improved fault isolation, where a failure in one service doesn't bring down the entire system. Teams can use different programming languages and technologies for different services, enabling them to choose the best tools for each specific problem. Microservices also facilitate faster deployment cycles since services can be updated independently without affecting others.`,
    
    "Database Design": `Database Design is a critical phase in software development that determines how data is stored, organized, and accessed. A well-designed database ensures data integrity, improves performance, and makes applications more maintainable. The design process typically involves several stages: requirements analysis to understand what data needs to be stored, conceptual design to create entity-relationship models, logical design to normalize the database structure, and physical design to optimize performance. Key principles include normalization to eliminate redundancy, proper indexing for fast queries, and establishing relationships between tables. Security considerations such as access control and data encryption are also essential aspects of database design.`,
    
    "API Development": `API Development is essential for creating modern software applications that can communicate with each other. APIs, or Application Programming Interfaces, define how different software components should interact. RESTful APIs have become the standard for web services, using HTTP methods like GET, POST, PUT, and DELETE to perform operations on resources. Good API design principles include using clear, consistent naming conventions, providing comprehensive documentation, implementing proper error handling, and ensuring security through authentication and authorization mechanisms. API versioning helps maintain backward compatibility while allowing systems to evolve. Rate limiting and caching strategies are important for performance optimization.`,
    
    "Testing": `Testing is a fundamental practice in software development that ensures code quality and reliability. Various testing levels exist including unit tests for individual components, integration tests for component interactions, system tests for complete functionality, and acceptance tests for user requirements. Test-driven development, or TDD, involves writing tests before implementing features, which helps clarify requirements and improves code design. Automated testing enables continuous integration and deployment by providing quick feedback on code changes. Key testing types include functional testing to verify features work correctly, performance testing to ensure systems handle load, and security testing to identify vulnerabilities.`
  };
  
  return templates[topic] || `In modern IT, ${topic} represents a crucial aspect of software development and system architecture. This practice involves several key components and best practices that enable organizations to build robust, scalable, and maintainable solutions. The implementation requires careful planning, technical expertise, and continuous improvement. Teams must consider various factors including security, performance, cost, and user experience when working with ${topic}. The adoption of modern tools and methodologies has significantly enhanced the effectiveness of ${topic} implementations across different industries and use cases.`;
}

// Générer des explications pour les questions
function generateExplanation(question, correctAnswer, topic) {
  const questionTextLower = question.text.toLowerCase();
  
  if (questionTextLower.includes('topic') || questionTextLower.includes('main subject')) {
    return `${correctAnswer} is the main subject discussed in this listening exercise. The text focuses specifically on ${correctAnswer} and its relevance in modern IT infrastructure. Understanding this central topic is essential for comprehending the broader context of the discussion.`;
  } else if (questionTextLower.includes('emphasize') || questionTextLower.includes('focus')) {
    return `The text emphasizes the importance of ${correctAnswer} in the context of ${topic}. This concept is highlighted as a key factor for successful implementation and is discussed in detail throughout the presentation.`;
  } else if (questionTextLower.includes('benefit') || questionTextLower.includes('advantage')) {
    return `${correctAnswer} represents a significant advantage or benefit in modern IT practices. This benefit contributes to improved efficiency, cost reduction, or enhanced system performance.`;
  } else if (questionTextLower.includes('step') || questionTextLower.includes('how many')) {
    return `The text mentions ${correctAnswer} steps in the process. This number represents the structured approach required for successful implementation.`;
  } else {
    return `The correct answer is ${correctAnswer}. This is supported by the information presented in the listening text about ${topic}. Understanding this concept is important for grasping the overall message.`;
  }
}

// S'assurer que toutes les questions ont exactement 4 options
function ensureFourOptions(question, correctAnswer, topic) {
  if (!question.options || question.options.length === 0) {
    question.options = [correctAnswer];
  }
  
  // Filtrer les placeholders existants
  question.options = question.options.filter(opt => 
    !/^other \d+$/i.test(opt.trim())
  );
  
  // S'assurer que la bonne réponse est dans les options
  if (!question.options.includes(correctAnswer)) {
    question.options.unshift(correctAnswer);
  }
  
  // Générer des options supplémentaires si nécessaire
  const alternativeOptions = [
    "Performance Optimization",
    "Security Enhancement",
    "Cost Reduction",
    "Scalability Improvement",
    "Automation Implementation",
    "Quality Assurance",
    "Team Collaboration",
    "Technology Innovation",
    "API Development",
    "Database Management",
    "User Interface Design",
    "Network Configuration"
  ];
  
  const usedOptions = new Set(question.options);
  let count = question.options.length;
  
  while (count < 4) {
    const randomOpt = alternativeOptions[Math.floor(Math.random() * alternativeOptions.length)];
    if (!usedOptions.has(randomOpt) && randomOpt !== correctAnswer) {
      question.options.push(randomOpt);
      usedOptions.add(randomOpt);
      count++;
    } else {
      // Si on a épuisé les options, utiliser des variations
      const fallback = `Alternative ${count + 1}`;
      if (!usedOptions.has(fallback)) {
        question.options.push(fallback);
        usedOptions.add(fallback);
        count++;
      } else {
        break;
      }
    }
  }
  
  // Mélanger les options (sauf la bonne réponse qui reste accessible)
  const correctIndex = question.options.indexOf(correctAnswer);
  if (correctIndex > -1) {
    question.options.splice(correctIndex, 1);
    const shuffled = question.options.sort(() => Math.random() - 0.5);
    question.options = [correctAnswer, ...shuffled].sort(() => Math.random() - 0.5);
    // S'assurer que correctAnswer est toujours dans les options après le mélange
    if (!question.options.includes(correctAnswer)) {
      question.options[0] = correctAnswer;
    }
  }
  
  // Limiter à 4 options exactement
  question.options = question.options.slice(0, 4);
}

/**
 * Traite les exercices listening
 */
function processListeningExercises() {
  console.log('📚 Traitement complet des exercices listening...');
  
  if (!fs.existsSync(listeningPath)) {
    console.error(`❌ Fichier non trouvé: ${listeningPath}`);
    return { updated: 0, total: 0 };
  }
  
  const data = JSON.parse(fs.readFileSync(listeningPath, 'utf8'));
  let updatedCount = 0;
  let totalQuestions = 0;
  
  if (!data.texts || !Array.isArray(data.texts)) {
    console.error('❌ Format JSON invalide');
    return { updated: 0, total: 0 };
  }
  
  for (const text of data.texts) {
    // Compléter la transcription si elle est trop courte ou manquante
    if (!text.transcript || text.transcript.length < 100) {
      text.transcript = generateTranscript(text.topic, text.level);
      updatedCount++;
    }
    
    if (!text.questions || !Array.isArray(text.questions)) continue;
    
    for (const question of text.questions) {
      totalQuestions++;
      let questionUpdated = false;
      
      // S'assurer que la question a un texte
      if (!question.text || question.text.trim().length < 5) {
        question.text = `Question about ${text.topic}`;
        questionUpdated = true;
      }
      
      // S'assurer qu'il y a exactement 4 options
      if (!question.options || question.options.length !== 4) {
        ensureFourOptions(question, question.correctAnswer, text.topic);
        questionUpdated = true;
      }
      
      // Filtrer les placeholders restants
      if (question.options) {
        const hasPlaceholder = question.options.some(opt => 
          /^other \d+$/i.test(opt.trim())
        );
        if (hasPlaceholder) {
          ensureFourOptions(question, question.correctAnswer, text.topic);
          questionUpdated = true;
        }
      }
      
      // Générer une explication si elle manque
      if (!question.explanation || question.explanation.trim().length < 10) {
        question.explanation = generateExplanation(question, question.correctAnswer, text.topic);
        questionUpdated = true;
      }
      
      // S'assurer qu'il y a une bonne réponse
      if (!question.correctAnswer && question.options && question.options.length > 0) {
        question.correctAnswer = question.options[0];
        questionUpdated = true;
      }
      
      if (questionUpdated) {
        updatedCount++;
      }
    }
  }
  
  // Sauvegarder
  fs.writeFileSync(listeningPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${updatedCount} éléments listening mis à jour (${totalQuestions} questions total)`);
  
  return { updated: updatedCount, total: totalQuestions };
}

/**
 * Traite les exercices reading
 */
function processReadingExercises() {
  console.log('\n📚 Traitement complet des exercices reading...');
  
  if (!fs.existsSync(readingPath)) {
    console.error(`❌ Fichier non trouvé: ${readingPath}`);
    return { updated: 0, total: 0 };
  }
  
  const data = JSON.parse(fs.readFileSync(readingPath, 'utf8'));
  let updatedCount = 0;
  let totalQuestions = 0;
  
  if (!data.texts || !Array.isArray(data.texts)) {
    console.error('❌ Format JSON invalide');
    return { updated: 0, total: 0 };
  }
  
  for (const text of data.texts) {
    // Compléter le texte si il est trop court ou répétitif
    if (!text.text || text.text.length < 200 || text.text.split('#').length > 10) {
      // Générer un texte de lecture complet
      text.text = generateReadingText(text.topic, text.level);
      updatedCount++;
    }
    
    if (!text.questions || !Array.isArray(text.questions)) continue;
    
    for (const question of text.questions) {
      totalQuestions++;
      let questionUpdated = false;
      
      // S'assurer que la question a un texte
      if (!question.text || question.text.trim().length < 5) {
        question.text = `Question about ${text.topic}`;
        questionUpdated = true;
      }
      
      // S'assurer qu'il y a exactement 4 options
      if (!question.options || question.options.length !== 4) {
        ensureFourOptions(question, question.correctAnswer, text.topic);
        questionUpdated = true;
      }
      
      // Filtrer les placeholders restants
      if (question.options) {
        const hasPlaceholder = question.options.some(opt => 
          /^other \d+$/i.test(opt.trim())
        );
        if (hasPlaceholder) {
          ensureFourOptions(question, question.correctAnswer, text.topic);
          questionUpdated = true;
        }
      }
      
      // Générer une explication si elle manque
      if (!question.explanation || question.explanation.trim().length < 10) {
        question.explanation = generateExplanation(question, question.correctAnswer, text.topic);
        questionUpdated = true;
      }
      
      // S'assurer qu'il y a une bonne réponse
      if (!question.correctAnswer && question.options && question.options.length > 0) {
        question.correctAnswer = question.options[0];
        questionUpdated = true;
      }
      
      if (questionUpdated) {
        updatedCount++;
      }
    }
  }
  
  // Sauvegarder
  fs.writeFileSync(readingPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${updatedCount} éléments reading mis à jour (${totalQuestions} questions total)`);
  
  return { updated: updatedCount, total: totalQuestions };
}

// Générer un texte de lecture complet
function generateReadingText(topic, level) {
  const baseText = generateTranscript(topic, level);
  
  // Ajouter plus de contenu pour un texte de lecture
  const additionalContent = `
  
The implementation of ${topic} requires careful consideration of multiple factors. Organizations must evaluate their current infrastructure, identify potential challenges, and develop a comprehensive strategy. Key considerations include technical requirements, budget constraints, timeline expectations, and resource availability.

Best practices in ${topic} involve establishing clear objectives, creating detailed documentation, and ensuring proper training for team members. Regular monitoring and assessment help identify areas for improvement and ensure that the implementation meets initial goals and expectations.`;
  
  return baseText + additionalContent;
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('🚀 Démarrage du script de complétion des placeholders...\n');
  
  try {
    const listeningResult = processListeningExercises();
    const readingResult = processReadingExercises();
    
    console.log('\n✅ Script terminé avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - Listening: ${listeningResult.updated} éléments mis à jour sur ${listeningResult.total} questions`);
    console.log(`   - Reading: ${readingResult.updated} éléments mis à jour sur ${readingResult.total} questions`);
    console.log('\n💡 Tous les placeholders manquants ont été complétés.');
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

