---
description: Rules for Jenkins and Ansible automation
alwaysApply: false
---

# Règles Jenkins & Ansible

## Jenkins

### Jenkinsfile (Declarative Pipeline)

```groovy
// ✅ Bon - Pipeline structuré
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18.x'
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    publishCoverage adapters: [istanbulCoberturaAdapter()]
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}
```

### Best Practices
- Utiliser des agents spécifiques pour chaque stage si nécessaire
- Nettoyer le workspace après chaque build
- Publier les artefacts et rapports de test
- Utiliser des credentials Jenkins pour les secrets
- Configurer des notifications (email, Slack, etc.)

## Ansible

### Playbooks

```yaml
# ✅ Bon - Playbook structuré
---
- name: Deploy Learning English App
  hosts: web_servers
  become: yes
  vars:
    app_version: "1.0.0"
    node_version: "18.x"
  
  tasks:
    - name: Install Node.js
      apt:
        name: nodejs
        state: present
        version: "{{ node_version }}"
    
    - name: Install dependencies
      npm:
        path: /opt/learning-english
        state: present
    
    - name: Run tests
      command: npm test
      changed_when: false
    
    - name: Build application
      command: npm run build
      args:
        chdir: /opt/learning-english
    
    - name: Restart application
      systemd:
        name: learning-english
        state: restarted
        enabled: yes
```

### Roles

```yaml
# ✅ Bon - Structure de role
roles/
  learning-english/
    tasks/
      main.yml
    handlers/
      main.yml
    templates/
      app.conf.j2
    vars/
      main.yml
    defaults/
      main.yml
```

### Best Practices
- Utiliser des roles pour la réutilisabilité
- Séparer les variables (vars, defaults)
- Utiliser des handlers pour les services
- Utiliser Ansible Vault pour les secrets
- Idempotence : les playbooks doivent être idempotents
- Utiliser `changed_when: false` pour les commandes de lecture

## Sécurité

- Ne jamais committer de secrets dans les playbooks
- Utiliser Ansible Vault pour chiffrer les secrets
- Utiliser des credentials Jenkins pour les secrets
- Limiter les permissions des utilisateurs Jenkins
- Utiliser des agents isolés pour les builds sensibles

