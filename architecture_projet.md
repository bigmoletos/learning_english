ai-english-trainer/
├── .cursorrules          # Règles pour Cursor (mis à jour)
├── .eslintrc.json        # Linter strict
├── package.json          # Dépendances et scripts
├── README.md             # Documentation complète
├── public/
│   ├── corpus/           # Corpus documentaire (100 docs IA/DevOps + grammaire)
│   │   ├── technical/    # Documents techniques (Angular, RAG, MLOps...)
│   │   ├── grammar/      # Règles grammaticales (B1→C1)
│   │   ├── dictionaries/ # Dictionnaires FR-EN/EN-FR (4000 mots tech)
│   │   ├── toeic_toefl/   # Ressources TOEIC/TOEFL (A2→C1)
│   │   ├── listening/    # 100 textes audio + transcriptions
│   │   └── reading/      # 100 textes écrits
├── src/
│   ├── agents/           # Agents IA pour analyse des réponses
│   │   └── progressAgent.ts  # Logique d'analyse et progression
│   ├── components/       # Composants React (avec Material-UI)
│   ├── data/             # Exercices et questions
│   ├── utils/            # Logique métier (adaptation, scoring...)
│   └── App.tsx           # Point d'entrée
