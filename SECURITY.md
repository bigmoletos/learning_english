# Security Policy

## Vulnérabilités connues (Novembre 2025)

### Frontend - Dépendances de développement

**Total : 20 vulnérabilités (3 moderate, 17 high)**

Les vulnérabilités suivantes sont présentes dans les dépendances de **développement uniquement** et **ne sont pas incluses dans le build de production** :

#### 1. **glob** (via Jest, sucrase, tailwindcss) - High severity
- **CVE** : GHSA-5j98-mcp5-4vw2
- **Description** : Command injection via -c/--cmd executes matches with shell:true
- **Versions affectées** : 10.3.7 - 11.0.3
- **Impact** : Aucun impact sur la production (Jest est uniquement utilisé en développement/test)
- **Correction** : Mise à jour de Jest vers 30.x+ (en cours d'évaluation)
- **Statut** : ⚠️ Accepté (dev dependencies uniquement)

#### 2. **nth-check** (via svgo) - High severity
- **CVE** : GHSA-rp65-9cf3-cjxr
- **Description** : Inefficient Regular Expression Complexity (ReDoS)
- **Versions affectées** : < 2.0.1
- **Impact** : Aucun impact sur la production (svgo est utilisé uniquement lors du build)
- **Correction** : Mise à jour de react-scripts vers 6.x (nécessite une migration majeure)
- **Statut** : ⚠️ Accepté (dev dependencies uniquement)

#### 3. **postcss** (via resolve-url-loader) - Moderate severity
- **CVE** : GHSA-7fh5-64p2-3v2j
- **Description** : PostCSS line return parsing error
- **Versions affectées** : < 8.4.31
- **Impact** : Aucun impact sur la production (utilisé uniquement lors du build)
- **Correction** : Mise à jour de react-scripts vers 6.x (nécessite une migration majeure)
- **Statut** : ⚠️ Accepté (dev dependencies uniquement)

#### 4. **webpack-dev-server** - Moderate severity
- **CVE** : GHSA-9jgg-88mc-972h, GHSA-4v9v-hfq4-rm2v
- **Description** : Source code may be stolen when accessing malicious websites
- **Versions affectées** : <= 5.2.0
- **Impact** : Aucun impact sur la production (webpack-dev-server est uniquement utilisé en développement)
- **Correction** : Mise à jour de react-scripts vers 6.x (nécessite une migration majeure)
- **Statut** : ⚠️ Accepté (dev dependencies uniquement)

#### 5. **react-syntax-highlighter** - Moderate severity
- **Correction** : ✅ Mise à jour vers 16.1.0 (effectuée)
- **Statut** : ✅ Corrigé

### Backend

✅ **Aucune vulnérabilité détectée** après mise à jour de nodemailer vers 7.0.7

## Actions de correction

### ✅ Effectuées
- ✅ Mise à jour de `nodemailer` vers 7.0.7 dans le backend
- ✅ Mise à jour de `react-syntax-highlighter` vers 16.1.0 dans le frontend
- ✅ Mise à jour de Node.js vers 20.x dans GitHub Actions
- ✅ Amélioration du workflow security-audit pour générer des rapports détaillés

### ⚠️ En attente (dépendances de développement)
- ⚠️ Vulnérabilités dans Jest (glob) - à corriger lors de la prochaine mise à jour majeure
- ⚠️ Vulnérabilités dans react-scripts (nth-check, postcss, webpack-dev-server) - migration vers react-scripts 6.x ou Vite prévue

## Stratégie de gestion

1. **Dépendances de production** : Toutes les vulnérabilités critiques sont corrigées immédiatement
2. **Dépendances de développement** : Les vulnérabilités sont documentées et corrigées lors des mises à jour majeures
3. **Monitoring** : Le workflow CI/CD génère des rapports d'audit automatiques à chaque push
4. **Documentation** : Toutes les vulnérabilités sont documentées dans ce fichier

## Vérification

Pour vérifier les vulnérabilités localement :

```bash
# Frontend
npm audit --audit-level=moderate

# Backend
cd backend && npm audit --audit-level=moderate
```

Les rapports d'audit sont également disponibles dans les artifacts GitHub Actions après chaque exécution du workflow.

## Reporting a Vulnerability

Si vous découvrez une vulnérabilité de sécurité, veuillez :
1. Ne pas créer d'issue publique
2. Contacter l'équipe de développement directement
3. Fournir des détails sur la vulnérabilité et les étapes de reproduction

