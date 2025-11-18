---
description: Rules for Docker development
alwaysApply: false
---

# Règles Docker

## Dockerfile

### Multi-stage Builds
```dockerfile
# ✅ Bon - Multi-stage pour optimiser la taille
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

### Best Practices
- Utiliser des images officielles (node:18-alpine)
- Minimiser le nombre de layers
- Utiliser `.dockerignore` pour exclure les fichiers inutiles
- Ne pas exposer de ports inutiles
- Utiliser des utilisateurs non-root

## Docker Compose

### Structure
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5010:5010"
    environment:
      - DATABASE_URL=postgres://...
```

### Bonnes Pratiques
- Utiliser des networks isolés
- Utiliser des volumes nommés pour la persistance
- Configurer les healthchecks
- Utiliser des secrets pour les données sensibles

## Sécurité

- Ne jamais committer de secrets dans les images
- Utiliser des secrets Docker ou des variables d'environnement
- Scanner les images pour les vulnérabilités
- Utiliser des images minimales (alpine)

## Optimisation

- Utiliser le cache Docker efficacement
- Ordonner les COPY pour maximiser le cache
- Utiliser `.dockerignore` pour réduire le contexte
- Multi-stage builds pour réduire la taille finale

