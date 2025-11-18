# Security Policy

## Vulnérabilités connues

### Frontend

Les vulnérabilités suivantes sont présentes dans les dépendances de développement et ne sont pas critiques pour la production :

1. **glob** (via Jest) - High severity
   - Affecte uniquement l'environnement de développement/test
   - Correction : Mise à jour de Jest vers une version plus récente (nécessite une migration majeure)
   - Impact : Aucun impact sur la production

2. **nth-check, postcss, webpack-dev-server** (via react-scripts) - Moderate/High severity
   - Affecte uniquement l'environnement de développement
   - Correction : Mise à jour de react-scripts vers la version 6.x (nécessite une migration majeure)
   - Impact : Aucun impact sur la production

3. **prismjs** (via react-syntax-highlighter) - Moderate severity
   - Correction : Mise à jour vers react-syntax-highlighter@16.1.0 (effectuée)
   - Impact : Aucun impact sur la production

### Backend

✅ **Aucune vulnérabilité détectée** après mise à jour de nodemailer vers 7.0.7

## Actions de correction

- ✅ Mise à jour de `nodemailer` vers 7.0.7 dans le backend
- ✅ Mise à jour de `react-syntax-highlighter` vers 16.1.0 dans le frontend
- ⚠️ Vulnérabilités dans les dépendances de développement (Jest, react-scripts) - à corriger lors de la prochaine mise à jour majeure

## Reporting a Vulnerability

Si vous découvrez une vulnérabilité de sécurité, veuillez :
1. Ne pas créer d'issue publique
2. Contacter l'équipe de développement directement
3. Fournir des détails sur la vulnérabilité et les étapes de reproduction

