#!/usr/bin/env node
/**
 * Script pour remplacer tous les placeholders dans les exercices par du contenu réel
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const PUBLIC_DIR = path.join(__dirname, '../public/data/exercises');
const QCM_INPUT = path.join(PUBLIC_DIR, 'all_qcm_200.json');
const CLOZE_INPUT = path.join(PUBLIC_DIR, 'all_cloze_200.json');
const QCM_OUTPUT = path.join(PUBLIC_DIR, 'all_qcm_200_complete.json');
const CLOZE_OUTPUT = path.join(PUBLIC_DIR, 'all_cloze_200_complete.json');

// Base de données de contenu réel par domaine
const DOMAIN_CONTENT = {
  devops: {
    titles: [
      'DevOps Fundamentals',
      'CI/CD Pipelines',
      'Container Orchestration',
      'Infrastructure as Code',
      'Continuous Deployment',
      'Docker Best Practices',
      'Kubernetes Essentials',
      'Monitoring and Logging'
    ],
    primaryUses: [
      'DevOps bridges the gap between development and operations teams, enabling faster delivery cycles',
      'DevOps automates software delivery pipelines, reducing manual errors and deployment time',
      'DevOps implements continuous integration and continuous deployment for rapid releases',
      'DevOps enhances collaboration between developers and IT operations through shared tools and practices'
    ],
    correctStatements: [
      'DevOps promotes a culture of collaboration and shared responsibility across teams',
      'Containerization with Docker allows applications to run consistently across different environments',
      'Infrastructure as Code enables version control and automated provisioning of infrastructure',
      'CI/CD pipelines automate testing and deployment processes, reducing manual intervention'
    ],
    explanations: [
      'DevOps combines cultural philosophies, practices, and tools that increase an organization\'s ability to deliver applications and services at high velocity.',
      'This approach enables teams to build, test, and release software more frequently and reliably.',
      'By automating the software delivery pipeline, organizations can respond more quickly to market changes and customer needs.',
      'The practice emphasizes monitoring, measurement, and continuous improvement of the development lifecycle.'
    ],
    incorrectAnswers: [
      'DevOps requires manual intervention at every deployment step',
      'DevOps only applies to large organizations with dedicated teams',
      'DevOps focuses exclusively on writing code without considering operations',
      'DevOps eliminates the need for testing and quality assurance'
    ]
  },
  ai: {
    titles: [
      'Machine Learning Fundamentals',
      'Neural Networks',
      'Deep Learning Applications',
      'Natural Language Processing',
      'Computer Vision',
      'AI Ethics and Governance',
      'Model Training and Optimization',
      'AI Deployment Strategies'
    ],
    primaryUses: [
      'AI automates repetitive tasks and decision-making processes, improving efficiency in IT operations',
      'Machine learning models analyze large datasets to identify patterns and make predictions',
      'AI enhances software development through code generation, testing, and debugging assistance',
      'Natural language processing enables intelligent chatbots and document analysis systems'
    ],
    correctStatements: [
      'Machine learning models learn from data without being explicitly programmed for each task',
      'Neural networks are computational models inspired by biological neural networks',
      'Supervised learning requires labeled training data to make predictions',
      'AI systems can process unstructured data like images, text, and speech'
    ],
    explanations: [
      'Artificial intelligence enables computers to perform tasks that typically require human intelligence, such as pattern recognition and decision-making.',
      'Machine learning, a subset of AI, allows systems to improve their performance through experience without explicit programming.',
      'Deep learning uses multi-layered neural networks to model and understand complex patterns in data.',
      'AI applications range from automation and optimization to creative tasks and problem-solving across various industries.'
    ],
    incorrectAnswers: [
      'AI systems always require human supervision for every decision',
      'Machine learning models cannot handle real-time data processing',
      'AI is only useful for simple, repetitive tasks',
      'Neural networks work identically to traditional algorithms'
    ]
  },
  cybersecurity: {
    titles: [
      'Security Fundamentals',
      'Threat Detection',
      'Cryptography Basics',
      'Network Security',
      'Incident Response',
      'Vulnerability Management',
      'Identity and Access Management',
      'Security Compliance'
    ],
    primaryUses: [
      'Cybersecurity protects IT systems, networks, and data from unauthorized access and attacks',
      'Security measures prevent data breaches and ensure compliance with regulations like GDPR',
      'Cybersecurity implements defense mechanisms against malware, phishing, and other threats',
      'Security protocols authenticate users and authorize access to sensitive resources'
    ],
    correctStatements: [
      'Encryption transforms data into an unreadable format to protect it from unauthorized access',
      'Multi-factor authentication adds additional security layers beyond passwords',
      'Zero-trust security assumes no implicit trust and verifies every access request',
      'Regular security audits help identify vulnerabilities before they can be exploited'
    ],
    explanations: [
      'Cybersecurity encompasses technologies, processes, and practices designed to protect systems, networks, and data from cyber attacks.',
      'A comprehensive security strategy includes prevention, detection, and response mechanisms.',
      'Security measures must balance protection with usability to maintain productivity.',
      'Staying updated with security patches and threat intelligence is crucial for effective defense.'
    ],
    incorrectAnswers: [
      'Strong passwords alone are sufficient for complete security protection',
      'Cybersecurity is only necessary for large enterprises',
      'Security measures should be implemented only after a breach occurs',
      'All security threats can be prevented with a single firewall'
    ]
  },
  cloud: {
    titles: [
      'Cloud Computing Basics',
      'AWS Services',
      'Azure Fundamentals',
      'Container Services',
      'Serverless Architecture',
      'Cloud Migration',
      'Cloud Security',
      'Cost Optimization'
    ],
    primaryUses: [
      'Cloud computing provides on-demand access to computing resources without upfront infrastructure investment',
      'Cloud services enable scalable and flexible deployment of applications based on demand',
      'Cloud platforms offer managed services that reduce operational overhead for development teams',
      'Cloud infrastructure supports global distribution and high availability of applications'
    ],
    correctStatements: [
      'Infrastructure as a Service (IaaS) provides virtualized computing resources over the internet',
      'Platform as a Service (PaaS) offers development environments without managing underlying infrastructure',
      'Software as a Service (SaaS) delivers applications over the internet on a subscription basis',
      'Cloud storage enables data backup, disaster recovery, and collaboration across locations'
    ],
    explanations: [
      'Cloud computing allows organizations to access computing resources on-demand, paying only for what they use.',
      'Major cloud providers offer services across compute, storage, networking, and specialized AI and analytics tools.',
      'Cloud adoption enables businesses to scale quickly and reduce capital expenditures on hardware.',
      'Multi-cloud and hybrid cloud strategies provide flexibility and avoid vendor lock-in.'
    ],
    incorrectAnswers: [
      'Cloud computing always costs more than on-premises infrastructure',
      'Data stored in the cloud is automatically more secure than on-premises storage',
      'Cloud services work identically across all providers',
      'Migrating to the cloud eliminates the need for IT expertise'
    ]
  },
  angular: {
    titles: [
      'Angular Fundamentals',
      'Component Architecture',
      'Memory Management',
      'RxJS and Observables',
      'Dependency Injection',
      'Routing and Navigation',
      'Forms and Validation',
      'Performance Optimization'
    ],
    primaryUses: [
      'Angular provides a framework for building single-page applications with TypeScript',
      'Angular components encapsulate UI logic and enable reusable, modular application design',
      'Angular services manage shared data and business logic across components',
      'Angular routing enables navigation between views without full page reloads'
    ],
    correctStatements: [
      'Components in Angular use decorators like @Component to define metadata',
      'Angular\'s dependency injection system manages object creation and lifecycle',
      'RxJS Observables handle asynchronous data streams and event handling',
      'Angular CLI provides commands for generating, building, and testing applications'
    ],
    explanations: [
      'Angular is a platform and framework for building client-side applications using HTML, CSS, and TypeScript.',
      'The framework emphasizes modularity, testability, and maintainability through its component-based architecture.',
      'Angular\'s change detection system automatically updates the view when data models change.',
      'Memory leaks in Angular typically occur when subscriptions to Observables are not properly cleaned up.'
    ],
    incorrectAnswers: [
      'Angular components require manual DOM manipulation',
      'All Angular applications must use Redux for state management',
      'Angular only works with JavaScript, not TypeScript',
      'Observables in Angular always complete automatically'
    ]
  },
  rag: {
    titles: [
      'RAG Systems Overview',
      'Retrieval Mechanisms',
      'Vector Databases',
      'Prompt Engineering',
      'Document Chunking',
      'Embedding Models',
      'RAG Architecture',
      'Evaluation Metrics'
    ],
    primaryUses: [
      'RAG combines retrieval from knowledge bases with generative AI to provide accurate, contextual responses',
      'RAG systems reduce hallucinations in AI responses by grounding answers in retrieved documents',
      'RAG enables AI models to access up-to-date information beyond their training data',
      'RAG architecture improves answer quality by providing relevant context to language models'
    ],
    correctStatements: [
      'RAG systems retrieve relevant documents before generating responses',
      'Vector databases enable semantic search by storing document embeddings',
      'RAG reduces the need for fine-tuning models on domain-specific data',
      'The retrieval component in RAG finds the most relevant context for the query'
    ],
    explanations: [
      'Retrieval-Augmented Generation enhances language models by providing external knowledge sources during inference.',
      'RAG systems typically use embedding models to convert text into vector representations for similarity search.',
      'The retrieved context is combined with the user query to generate more accurate and contextual responses.',
      'RAG architecture separates knowledge storage from model parameters, enabling easier updates to information.'
    ],
    incorrectAnswers: [
      'RAG systems require retraining the language model for each new document',
      'Vector databases only work with structured data, not text',
      'RAG eliminates the need for prompt engineering',
      'Retrieval in RAG happens after the model generates the response'
    ]
  },
  mlops: {
    titles: [
      'MLOps Fundamentals',
      'Model Deployment',
      'Model Monitoring',
      'Experiment Tracking',
      'CI/CD for ML',
      'Model Versioning',
      'A/B Testing',
      'Data Pipeline Automation'
    ],
    primaryUses: [
      'MLOps automates the machine learning lifecycle from training to production deployment',
      'MLOps practices ensure model reproducibility and enable continuous model improvement',
      'MLOps pipelines automate testing, validation, and deployment of machine learning models',
      'MLOps tools monitor model performance and trigger retraining when metrics degrade'
    ],
    correctStatements: [
      'MLOps combines DevOps practices with machine learning workflow management',
      'Model versioning tracks different iterations and hyperparameters for reproducibility',
      'Continuous integration in MLOps includes data validation and model testing',
      'Model monitoring detects drift and degradation in production performance'
    ],
    explanations: [
      'MLOps extends DevOps principles to machine learning, focusing on automation and collaboration.',
      'Effective MLOps practices manage the entire ML lifecycle: data, models, code, and infrastructure.',
      'Model deployment pipelines automate the transition from development to production environments.',
      'Monitoring ML models in production is crucial because performance can degrade over time as data distributions change.'
    ],
    incorrectAnswers: [
      'MLOps only applies to training models, not deployment',
      'Model versioning is unnecessary since models are static once trained',
      'MLOps pipelines cannot automate model retraining',
      'Once deployed, ML models never require updates or monitoring'
    ]
  },
  gdpr: {
    titles: [
      'GDPR Compliance',
      'Data Protection',
      'Privacy by Design',
      'Data Subject Rights',
      'Consent Management',
      'Data Breach Notification',
      'Data Processing Agreements',
      'Privacy Impact Assessments'
    ],
    primaryUses: [
      'GDPR ensures data protection and privacy rights for individuals within the European Union',
      'GDPR compliance requires implementing technical and organizational measures for data security',
      'GDPR establishes rules for processing personal data and grants rights to data subjects',
      'GDPR mandates clear consent mechanisms and transparent privacy policies'
    ],
    correctStatements: [
      'GDPR requires explicit consent for processing personal data',
      'Data subjects have the right to access, rectify, and erase their personal data',
      'Privacy by Design means considering data protection from the start of system design',
      'Organizations must report data breaches to authorities within 72 hours'
    ],
    explanations: [
      'The General Data Protection Regulation sets strict rules for handling personal data of EU residents.',
      'GDPR applies to any organization processing personal data of individuals in the EU, regardless of location.',
      'Compliance requires implementing appropriate security measures and documenting data processing activities.',
      'Data subjects have rights including access, portability, and the right to be forgotten.'
    ],
    incorrectAnswers: [
      'GDPR only applies to European companies',
      'Consent can be implied without explicit user action',
      'Data breaches do not need to be reported if they are minor',
      'GDPR compliance is optional for small businesses'
    ]
  },
  vibe_coding: {
    titles: [
      'Vibe Coding Principles',
      'AI-Assisted Development',
      'Prompt Engineering',
      'Code Generation Tools',
      'Pair Programming with AI',
      'Productivity Enhancement',
      'Code Quality with AI',
      'Workflow Optimization'
    ],
    primaryUses: [
      'Vibe coding leverages AI tools to accelerate software development through intelligent assistance',
      'AI coding assistants help developers write code faster by suggesting completions and solutions',
      'Vibe coding improves productivity by automating repetitive coding tasks and boilerplate generation',
      'AI-powered tools assist in debugging, refactoring, and understanding complex codebases'
    ],
    correctStatements: [
      'Vibe coding combines human creativity with AI efficiency for faster development',
      'AI code assistants learn from code patterns to provide contextually relevant suggestions',
      'Effective vibe coding requires clear prompts and understanding of AI tool capabilities',
      'AI tools can generate tests, documentation, and code comments automatically'
    ],
    explanations: [
      'Vibe coding represents a collaborative approach where developers work alongside AI tools to enhance productivity.',
      'Modern AI coding assistants understand context and can suggest entire functions or architectural patterns.',
      'The effectiveness of vibe coding depends on providing clear context and iteratively refining AI suggestions.',
      'Developers still need to review and validate AI-generated code to ensure quality and correctness.'
    ],
    incorrectAnswers: [
      'Vibe coding eliminates the need for human developers',
      'AI-generated code is always correct and requires no review',
      'Vibe coding only works for simple, repetitive tasks',
      'AI tools cannot understand complex business logic or requirements'
    ]
  }
};

// Fonction pour obtenir un élément aléatoire d'un tableau
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour générer du contenu réel pour un exercice QCM
function generateRealQCMContent(exercise, domainData, index) {
  const titles = domainData.titles || [`${exercise.domain.toUpperCase()} Exercise ${index}`];
  const primaryUses = domainData.primaryUses || [];
  const correctStatements = domainData.correctStatements || [];
  const explanations = domainData.explanations || [];
  const incorrectAnswers = domainData.incorrectAnswers || [];
  
  // Générer le titre
  exercise.title = getRandomElement(titles) || `${exercise.domain.toUpperCase()} Exercise ${index}`;
  
  // Générer le contenu
  exercise.content = `${exercise.content} This exercise covers essential concepts and practices in ${exercise.domain}.`;
  
  // Générer les questions avec du contenu réel
  if (exercise.questions && exercise.questions.length > 0) {
    exercise.questions.forEach((question, qIndex) => {
      // Question 1 : Primary use
      if (qIndex === 0 && question.text.toLowerCase().includes('primary use')) {
        const primaryUse = getRandomElement(primaryUses);
        if (primaryUse) {
          // Générer 4 options réalistes (toujours 4 options pour QCM)
          const incorrectOpts = incorrectAnswers.filter(a => a && a.length > 20);
          question.options = [
            primaryUse,
            getRandomElement(incorrectOpts) || `${exercise.domain.toUpperCase()} is only used for basic administrative tasks`,
            getRandomElement(incorrectOpts) || `${exercise.domain.toUpperCase()} has limited applications in modern IT environments`,
            getRandomElement(incorrectOpts) || `${exercise.domain} is primarily a backup solution for legacy systems`
          ];
          // S'assurer d'avoir exactement 4 options uniques
          while (question.options.length < 4) {
            const newOption = getRandomElement(incorrectOpts) || `Incorrect: ${exercise.domain} requires extensive manual configuration`;
            if (!question.options.includes(newOption)) {
              question.options.push(newOption);
            }
          }
          // S'assurer que les options sont uniques
          question.options = [...new Set(question.options)];
          if (question.options.length < 4) {
            // Remplir jusqu'à 4 si nécessaire
            const additionalIncorrect = [
              `${exercise.domain} is not applicable in modern software development`,
              `${exercise.domain.toUpperCase()} only works with specific programming languages`,
              `${exercise.domain} requires specialized hardware that is expensive`,
              `${exercise.domain.toUpperCase()} is deprecated and no longer in use`
            ];
            while (question.options.length < 4) {
              const opt = getRandomElement(additionalIncorrect);
              if (!question.options.includes(opt)) {
                question.options.push(opt);
              }
            }
          }
          // Mélanger les options pour que la bonne réponse ne soit pas toujours la première
          question.options = question.options.sort(() => Math.random() - 0.5);
          question.correctAnswer = primaryUse;
          question.explanation = getRandomElement(explanations) || `${exercise.domain.toUpperCase()} provides essential capabilities for modern IT infrastructure.`;
        }
      }
      // Question 2 : Correct statement
      else if (qIndex === 1 && (question.text.toLowerCase().includes('correct') || question.text.toLowerCase().includes('statement'))) {
        const correctStatement = getRandomElement(correctStatements);
        if (correctStatement) {
          const incorrectOpts = incorrectAnswers.filter(a => a && a.length > 20);
          question.options = [
            getRandomElement(incorrectOpts) || `Strong passwords alone are sufficient for complete ${exercise.domain} protection`,
            correctStatement,
            getRandomElement(incorrectOpts) || `${exercise.domain.toUpperCase()} is only necessary for large enterprises`,
            getRandomElement(incorrectOpts) || `${exercise.domain} should be implemented only after a problem occurs`
          ];
          // S'assurer d'avoir exactement 4 options uniques
          while (question.options.length < 4) {
            const newOption = getRandomElement(incorrectOpts) || `Incorrect statement: ${exercise.domain} works identically across all implementations`;
            if (!question.options.includes(newOption)) {
              question.options.push(newOption);
            }
          }
          // S'assurer que les options sont uniques
          question.options = [...new Set(question.options)];
          if (question.options.length < 4) {
            const additionalIncorrect = [
              `${exercise.domain} is not applicable in cloud environments`,
              `${exercise.domain.toUpperCase()} only works with specific frameworks`,
              `${exercise.domain} requires extensive manual configuration`,
              `${exercise.domain.toUpperCase()} is deprecated and no longer recommended`
            ];
            while (question.options.length < 4) {
              const opt = getRandomElement(additionalIncorrect);
              if (!question.options.includes(opt)) {
                question.options.push(opt);
              }
            }
          }
          question.options = question.options.sort(() => Math.random() - 0.5);
          question.correctAnswer = correctStatement;
          question.explanation = getRandomElement(explanations) || `This statement accurately describes ${exercise.domain} practices and principles.`;
        }
      }
      // Pour toutes les autres questions ou si les conditions ci-dessus n'ont pas fonctionné
      else {
        // Générer du contenu même si la question ne correspond pas aux patterns attendus
        if (!question.options || question.options.length < 4) {
          const primaryUse = getRandomElement(primaryUses);
          const correctStatement = getRandomElement(correctStatements);
          const incorrectOpts = incorrectAnswers.filter(a => a && a.length > 20);
          
          // Générer 4 options
          question.options = [
            primaryUse || correctStatement || `Correct statement about ${exercise.domain}`,
            getRandomElement(incorrectOpts) || `${exercise.domain.toUpperCase()} is only used for basic tasks`,
            getRandomElement(incorrectOpts) || `${exercise.domain} has limited applications`,
            getRandomElement(incorrectOpts) || `${exercise.domain} is primarily a backup solution`
          ];
          
          // S'assurer d'avoir exactement 4 options uniques
          question.options = [...new Set(question.options)];
          while (question.options.length < 4) {
            const additionalIncorrect = [
              `${exercise.domain} is not applicable in modern development`,
              `${exercise.domain.toUpperCase()} only works with specific languages`,
              `${exercise.domain} requires specialized hardware`,
              `${exercise.domain.toUpperCase()} is deprecated`
            ];
            const opt = getRandomElement(additionalIncorrect);
            if (!question.options.includes(opt)) {
              question.options.push(opt);
            }
          }
          
          question.options = question.options.sort(() => Math.random() - 0.5);
          question.correctAnswer = question.options[0]; // Prendre la première comme bonne réponse
          question.explanation = getRandomElement(explanations) || `${exercise.domain.toUpperCase()} provides essential capabilities.`;
        }
      }
      
      // S'assurer que TOUTES les questions QCM ont exactement 4 options
      if (exercise.type === 'qcm' && question.options) {
        question.options = [...new Set(question.options)]; // Supprimer les doublons
        while (question.options.length < 4) {
          const additionalIncorrect = [
            `${exercise.domain} is not applicable in this context`,
            `${exercise.domain.toUpperCase()} requires manual configuration`,
            `${exercise.domain} is only available in enterprise versions`,
            `${exercise.domain.toUpperCase()} is deprecated in newer versions`
          ];
          const opt = getRandomElement(additionalIncorrect);
          if (!question.options.includes(opt)) {
            question.options.push(opt);
          }
        }
        // Limiter à 4 options maximum
        question.options = question.options.slice(0, 4);
      }
      
      // Si le texte de la question est trop générique, l'améliorer
      if (question.text.includes('primary use') || question.text.includes('Primary use')) {
        question.text = `What is a primary application of ${exercise.domain} in modern IT?`;
      } else if (question.text.includes('correct') || question.text.includes('statement')) {
        question.text = `Which statement accurately describes ${exercise.domain}?`;
      }
    });
  }
  
  // Améliorer la description
  exercise.description = `Test your knowledge of ${exercise.domain} concepts and best practices`;
  
  return exercise;
}

// Fonction pour générer du contenu réel pour un exercice Cloze
function generateRealClozeContent(exercise, domainData, index) {
  const titles = domainData.titles || [`${exercise.domain.toUpperCase()} Cloze Test ${index}`];
  
  exercise.title = getRandomElement(titles) || `${exercise.domain.toUpperCase()} Cloze Test ${index}`;
  exercise.description = `Complete the text about ${exercise.domain} concepts and practices`;
  exercise.content = `This exercise helps you practice English grammar and vocabulary in the context of ${exercise.domain}.`;
  
  // Générer des questions réalistes basées sur le domaine
  const clozeTemplates = {
    present_simple: [
      { text: `${exercise.domain.toUpperCase()} ___ widely adopted in modern software development.`, answers: ['is', 'remains', 'has become'] },
      { text: `Many organizations ___ ${exercise.domain} to improve their workflows.`, answers: ['use', 'adopt', 'implement'] }
    ],
    modals: [
      { text: `Developers ___ follow ${exercise.domain} best practices for optimal results.`, answers: ['must', 'should', 'need to'] },
      { text: `Teams ___ consider security implications when implementing ${exercise.domain}.`, answers: ['must', 'should', 'ought to'] }
    ],
    present_perfect: [
      { text: `Many companies ___ successfully integrated ${exercise.domain} into their processes.`, answers: ['have', 'have already'] },
      { text: `The ${exercise.domain} approach ___ gained popularity over recent years.`, answers: ['has', 'has gradually'] }
    ],
    passive_voice: [
      { text: `${exercise.domain.toUpperCase()} principles ___ applied across various industries.`, answers: ['are', 'are being', 'have been'] },
      { text: `The benefits of ${exercise.domain} ___ well documented in industry research.`, answers: ['are', 'have been'] }
    ]
  };
  
  if (exercise.questions && exercise.questions.length > 0) {
    exercise.questions.forEach((question, qIndex) => {
      const grammarFocus = question.grammarFocus && question.grammarFocus[0];
      const template = clozeTemplates[grammarFocus] || clozeTemplates.present_simple;
      const selectedTemplate = getRandomElement(template);
      
      if (selectedTemplate) {
        question.text = selectedTemplate.text;
        question.correctAnswer = selectedTemplate.answers;
        question.explanation = question.explanation || `This structure is appropriate for ${grammarFocus} in the context of ${exercise.domain}.`;
      }
    });
  }
  
  return exercise;
}

// Fonction principale pour traiter les fichiers QCM
function processQCMFile() {
  console.log('📖 Lecture du fichier QCM...');
  const data = JSON.parse(fs.readFileSync(QCM_INPUT, 'utf8'));
  const exercises = data.exercises || [];
  
  console.log(`📝 Traitement de ${exercises.length} exercices QCM...`);
  
  exercises.forEach((exercise, index) => {
    const domain = exercise.domain || 'devops';
    const domainData = DOMAIN_CONTENT[domain] || DOMAIN_CONTENT.devops;
    
    generateRealQCMContent(exercise, domainData, index + 1);
    
    if ((index + 1) % 50 === 0) {
      console.log(`  ✓ Traité ${index + 1}/${exercises.length} exercices...`);
    }
  });
  
  console.log('💾 Sauvegarde du fichier QCM complet...');
  fs.writeFileSync(QCM_OUTPUT, JSON.stringify({ exercises, total: exercises.length }, null, 2));
  console.log(`✅ Fichier sauvegardé: ${QCM_OUTPUT}`);
  
  return exercises.length;
}

// Fonction principale pour traiter les fichiers Cloze
function processClozeFile() {
  console.log('📖 Lecture du fichier Cloze...');
  const data = JSON.parse(fs.readFileSync(CLOZE_INPUT, 'utf8'));
  const exercises = data.exercises || [];
  
  console.log(`📝 Traitement de ${exercises.length} exercices Cloze...`);
  
  exercises.forEach((exercise, index) => {
    const domain = exercise.domain || 'angular';
    const domainData = DOMAIN_CONTENT[domain] || DOMAIN_CONTENT.angular;
    
    generateRealClozeContent(exercise, domainData, index + 1);
    
    if ((index + 1) % 50 === 0) {
      console.log(`  ✓ Traité ${index + 1}/${exercises.length} exercices...`);
    }
  });
  
  console.log('💾 Sauvegarde du fichier Cloze complet...');
  fs.writeFileSync(CLOZE_OUTPUT, JSON.stringify({ exercises, total: exercises.length }, null, 2));
  console.log(`✅ Fichier sauvegardé: ${CLOZE_OUTPUT}`);
  
  return exercises.length;
}

// Fonction principale
function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🔧 Génération de Contenu Réel pour les Exercices');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    const qcmCount = processQCMFile();
    console.log('');
    const clozeCount = processClozeFile();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ TERMINÉ: ${qcmCount} QCM + ${clozeCount} Cloze = ${qcmCount + clozeCount} exercices complets`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 Prochaines étapes:');
    console.log(`   1. Vérifier les fichiers générés:`);
    console.log(`      - ${QCM_OUTPUT}`);
    console.log(`      - ${CLOZE_OUTPUT}`);
    console.log(`   2. Remplacer les anciens fichiers si tout est correct`);
    console.log(`   3. Mettre à jour ExerciseList.tsx pour charger les nouveaux fichiers`);
    console.log('');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { processQCMFile, processClozeFile, generateRealQCMContent, generateRealClozeContent };

