---
description: Rules for Kubernetes and Helm
alwaysApply: false
---

# Règles Kubernetes & Helm

## Manifests Kubernetes

### Structure
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-english-frontend
  labels:
    app: learning-english
    component: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: learning-english
      component: frontend
  template:
    metadata:
      labels:
        app: learning-english
        component: frontend
    spec:
      containers:
      - name: frontend
        image: learning-english:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Best Practices
- Toujours définir des resource requests et limits
- Utiliser des labels cohérents
- Configurer des liveness et readiness probes
- Utiliser des ConfigMaps et Secrets pour la configuration
- Ne jamais hardcoder de secrets dans les manifests

## Helm Charts

### Structure
```
chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── charts/
```

### Values
- Utiliser des valeurs par défaut sensées
- Documenter les valeurs importantes
- Utiliser des templates pour éviter la duplication
- Valider les valeurs avec des schemas

### Versioning
- Suivre le semantic versioning
- Incrémenter le version dans Chart.yaml
- Taguer les releases avec des versions

## Sécurité

### RBAC
- Principe du moindre privilège
- Créer des ServiceAccounts dédiés
- Limiter les permissions au strict nécessaire

### Secrets
- Utiliser des Secrets Kubernetes
- Ne jamais committer de secrets
- Utiliser des outils comme Sealed Secrets ou External Secrets

### Network Policies
- Définir des network policies pour isoler les pods
- Limiter les communications inter-pods
- Utiliser des labels pour les sélections

## Monitoring & Logging

- Configurer des métriques avec Prometheus
- Utiliser des labels pour le filtrage
- Centraliser les logs avec un sidecar ou DaemonSet
- Configurer des alertes appropriées

