# Security Policy

## Vulnérabilités connues (Novembre 2025)

### Frontend

✅ **Toutes les vulnérabilités ont été corrigées** (Novembre 2025)

**Total : 0 vulnérabilité**

Les vulnérabilités suivantes ont été corrigées en utilisant `npm overrides` dans `package.json` :

#### 1. **glob** (via Jest, sucrase, tailwindcss) - High severity
- **CVE** : GHSA-5j98-mcp5-4vw2
- **Description** : Command injection via -c/--cmd executes matches with shell:true
- **Correction** : ✅ Override vers `glob@^11.0.0` (effectuée)
- **Statut** : ✅ Corrigé

#### 2. **nth-check** (via svgo) - High severity
- **CVE** : GHSA-rp65-9cf3-cjxr
- **Description** : Inefficient Regular Expression Complexity (ReDoS)
- **Correction** : ✅ Override vers `nth-check@^2.1.1` (effectuée)
- **Statut** : ✅ Corrigé

#### 3. **postcss** (via resolve-url-loader) - Moderate severity
- **CVE** : GHSA-7fh5-64p2-3v2j
- **Description** : PostCSS line return parsing error
- **Correction** : ✅ Override vers `postcss@^8.4.31` (effectuée)
- **Statut** : ✅ Corrigé

#### 4. **webpack-dev-server** - Moderate severity
- **CVE** : GHSA-9jgg-88mc-972h, GHSA-4v9v-hfq4-rm2v
- **Description** : Source code may be stolen when accessing malicious websites
- **Correction** : ✅ Override vers `webpack-dev-server@^5.2.0` (effectuée)
- **Statut** : ✅ Corrigé

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
- ✅ **Correction de toutes les vulnérabilités frontend** via `npm overrides` dans `package.json` :
  - `glob@^11.0.0` (corrige GHSA-5j98-mcp5-4vw2)
  - `nth-check@^2.1.1` (corrige GHSA-rp65-9cf3-cjxr)
  - `postcss@^8.4.31` (corrige GHSA-7fh5-64p2-3v2j)
  - `webpack-dev-server@^5.2.0` (corrige GHSA-9jgg-88mc-972h, GHSA-4v9v-hfq4-rm2v)

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

