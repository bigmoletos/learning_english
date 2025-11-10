Security Audit Complet

Audit de sécurité approfondi du code et des dépendances.

**Checklist de Sécurité:**

## 1. Dependencies
- [ ] npm audit (no critical/high vulnerabilities)
- [ ] Outdated packages avec vulnérabilités connues
- [ ] Licenses compatibles
- [ ] Unused dependencies

## 2. Authentication & Authorization
- [ ] JWT tokens sécurisés (secret strength, expiration)
- [ ] Password hashing (bcrypt avec salt)
- [ ] Session management
- [ ] CSRF protection
- [ ] Rate limiting sur login
- [ ] Account lockout après X tentatives

## 3. Input Validation
- [ ] Validation côté serveur (pas seulement client)
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS prevention (sanitization)
- [ ] File upload validation (type, size)
- [ ] Command injection prevention

## 4. Data Protection
- [ ] Secrets pas en hardcode
- [ ] .env files sécurisés
- [ ] Encryption at rest (DB sensible)
- [ ] HTTPS only en production
- [ ] Secure cookies (httpOnly, secure, sameSite)

## 5. API Security
- [ ] CORS correctement configuré
- [ ] Rate limiting
- [ ] API keys rotation
- [ ] Request size limits
- [ ] Authentication sur tous les endpoints privés
- [ ] Authorization checks (pas juste auth)

## 6. Frontend Security
- [ ] No eval() ou Function()
- [ ] Sanitize dangerouslySetInnerHTML
- [ ] CSP (Content Security Policy)
- [ ] Subresource Integrity (SRI)
- [ ] No sensitive data in localStorage
- [ ] No secrets dans le code client

## 7. Firebase Security
- [ ] Firestore rules strictes
- [ ] Firebase Storage rules
- [ ] Authentication providers sécurisés
- [ ] API keys restrictions (domaines)

## 8. Code Quality
- [ ] No console.log avec données sensibles
- [ ] Error messages pas trop verbeux (leaks)
- [ ] Dependency confusion protection
- [ ] Code obfuscation (si nécessaire)

## 9. Infrastructure
- [ ] Environment variables sécurisées
- [ ] No debug mode en production
- [ ] Logging sécurisé (no PII)
- [ ] Regular backups
- [ ] Disaster recovery plan

## 10. Android (Capacitor)
- [ ] ProGuard/R8 enabled
- [ ] Certificate pinning (si API sensible)
- [ ] No hardcoded keys
- [ ] Permission minimales
- [ ] Secure storage (Preferences encrypted)

**Process:**

1. Scan automatique (npm audit, ESLint security plugin)
2. Code review manuel (patterns dangereux)
3. Test des vulnérabilités communes (OWASP Top 10)
4. Vérification configuration (CORS, CSP, etc.)
5. Rapport avec priorisation

**Outils:**
```bash
npm audit --audit-level=moderate
npx snyk test  # si Snyk configuré
grep -r "eval\|dangerouslySetInnerHTML" src/
grep -r "console.log" src/ | grep -i "password\|token\|secret"
```

**Livrable:**
- 🔴 Critiques (à fixer immédiatement)
- 🟡 Importantes (fixer avant prod)
- 🟢 Best practices (nice to have)
- Code fixes proposés
