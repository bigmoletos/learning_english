# Guide Complet des Commandes - Scripts Bash

**Version** : 1.0.0 | **Date** : 31 octobre 2025

---

## 📜 Scripts Disponibles

Le projet dispose de **3 scripts** avec des commandes et exemples détaillés.

---

## 1️⃣ `start_frontend_backend.sh` - Script Complet (Frontend + Backend)

### Afficher l'aide complète

```bash
./start_frontend_backend.sh help
# ou
./start_frontend_backend.sh --help
# ou
./start_frontend_backend.sh -h
```

### Commandes Disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| `start` | Démarrer frontend (3000) + backend (5010) | `./start_frontend_backend.sh start` |
| `stop` | Arrêter tous les serveurs | `./start_frontend_backend.sh stop` |
| `restart` | Redémarrer tous les serveurs | `./start_frontend_backend.sh restart` |
| `status` | Voir l'état des serveurs | `./start_frontend_backend.sh status` |
| `logs` | Logs combinés (backend + frontend) | `./start_frontend_backend.sh logs` |
| `logs-backend` | Logs backend uniquement | `./start_frontend_backend.sh logs-backend` |
| `logs-frontend` | Logs frontend uniquement | `./start_frontend_backend.sh logs-frontend` |
| `help` | Aide détaillée avec exemples | `./start_frontend_backend.sh help` |

### Exemples d'Utilisation

```bash
# Démarrer l'application complète
./start_frontend_backend.sh start

# Vérifier le statut
./start_frontend_backend.sh status

# Voir les logs backend en temps réel (dans un terminal séparé)
./start_frontend_backend.sh logs-backend

# Voir les logs frontend en temps réel
./start_frontend_backend.sh logs-frontend

# Redémarrer après modification du code
./start_frontend_backend.sh restart

# Arrêter proprement tous les serveurs
./start_frontend_backend.sh stop
```

### Fichiers de Logs

- **Backend** : `/tmp/backend_api.log`
- **Frontend** : `/tmp/frontend_react.log`

### Fichiers PID

- **Backend** : `/tmp/backend.pid`
- **Frontend** : `/tmp/frontend.pid`

---

## 2️⃣ `start-app.sh` - Script Frontend Uniquement

### Afficher l'aide complète

```bash
./start-app.sh help
# ou
./start-app.sh --help
# ou
./start-app.sh -h
```

### Commandes Disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| `start` | Démarrer le serveur React (port 3000) | `./start-app.sh start` |
| (aucun) | Démarrer par défaut (équivalent à start) | `./start-app.sh` |
| `restart` | Redémarrer le serveur React | `./start-app.sh restart` |
| `stop` | Arrêter le serveur React | `./start-app.sh stop` |
| `status` | Vérifier si le serveur est en cours | `./start-app.sh status` |
| `logs` | Voir les logs en temps réel | `./start-app.sh logs` |
| `help` | Aide détaillée avec exemples | `./start-app.sh help` |

### Exemples d'Utilisation

```bash
# Démarrer le frontend
./start-app.sh start

# Démarrer (sans argument = start par défaut)
./start-app.sh

# Redémarrer le serveur
./start-app.sh restart

# Vérifier le statut
./start-app.sh status

# Voir les logs en temps réel
./start-app.sh logs

# Arrêter le serveur
./start-app.sh stop
```

### Fichiers

- **Logs** : `/tmp/react_app.log`

### Note

Ce script démarre **uniquement le FRONTEND**.
Pour démarrer frontend + backend ensemble, utilisez : `./start_frontend_backend.sh start`

---

## 3️⃣ `installateur_bash_universel.sh` - Installateur Universel Ubuntu 24.04

### Afficher l'aide complète

```bash
sudo ./installateur_bash_universel.sh --help
# ou
sudo ./installateur_bash_universel.sh -h
```

### Types de Paquets Supportés

#### 1. Paquets APT Standard

Paquets Ubuntu/Debian standards.

**Exemples** :
```bash
sudo ./installateur_bash_universel.sh ntfs-3g
sudo ./installateur_bash_universel.sh gparted
sudo ./installateur_bash_universel.sh vim curl wget
sudo ./installateur_bash_universel.sh htop tree git
```

#### 2. Paquets Spéciaux (Base de Données Intégrée)

Logiciels configurés automatiquement via Wine ou AppImage.

**Paquets disponibles** :
- `anycubic-slicer` - Installation via Wine
- `prusa-slicer` - Installation via AppImage

**Exemples** :
```bash
sudo ./installateur_bash_universel.sh anycubic-slicer
sudo ./installateur_bash_universel.sh prusa-slicer
```

#### 3. URL AppImage Directe

Installation d'AppImage depuis une URL.

**Exemples** :
```bash
sudo ./installateur_bash_universel.sh https://github.com/user/repo/releases/download/v1.0/app.AppImage
sudo ./installateur_bash_universel.sh https://exemple.com/mon-app.AppImage
```

### Options Disponibles

| Option | Description | Exemple |
|--------|-------------|---------|
| `-h, --help` | Afficher l'aide | `sudo ./installateur_bash_universel.sh --help` |
| `--no-cleanup` | Ne pas nettoyer le répertoire temporaire (debug) | `sudo ./installateur_bash_universel.sh ntfs-3g --no-cleanup` |

### Exemples d'Utilisation Complets

```bash
# Installation d'un paquet APT simple
sudo ./installateur_bash_universel.sh ntfs-3g

# Installation de plusieurs paquets APT
sudo ./installateur_bash_universel.sh ntfs-3g gparted vim curl

# Installation d'un paquet spécial (Wine)
sudo ./installateur_bash_universel.sh anycubic-slicer

# Installation d'un paquet spécial (AppImage)
sudo ./installateur_bash_universel.sh prusa-slicer

# Installation depuis une URL AppImage
sudo ./installateur_bash_universel.sh https://exemple.com/app.AppImage

# Installation mixte (APT + spéciaux)
sudo ./installateur_bash_universel.sh ntfs-3g anycubic-slicer gparted

# Installation avec option de debug
sudo ./installateur_bash_universel.sh ntfs-3g --no-cleanup
```

### Comportement du Script

- ✅ Vérifie si les paquets sont déjà installés
- ✅ Affiche la version si déjà installé
- ✅ Installe automatiquement les dépendances manquantes
- ✅ Propose des alternatives si un paquet n'existe pas
- ✅ Détecte si une commande fait partie d'un paquet existant
- ✅ Crée des raccourcis .desktop automatiquement
- ✅ Nettoie les paquets inutiles à la fin (sauf `--no-cleanup`)
- ✅ Affiche la taille des fichiers téléchargés
- ✅ Vérifie les URLs avant téléchargement

---

## 🔍 Commandes Rapides

### Obtenir de l'Aide

```bash
# Script complet
./start_frontend_backend.sh help

# Script frontend
./start-app.sh help

# Installateur
sudo ./installateur_bash_universel.sh --help
```

### Voir les Logs en Temps Réel

```bash
# Backend uniquement
./start_frontend_backend.sh logs-backend

# Frontend uniquement
./start_frontend_backend.sh logs-frontend

# Les deux combinés
./start_frontend_backend.sh logs

# Frontend (script simple)
./start-app.sh logs
```

**Note** : Utilisez `Ctrl+C` pour quitter la visualisation des logs.

---

## 📊 Tableau Récapitulatif

| Script | Commandes Disponibles | Utilisation Principale |
|--------|----------------------|------------------------|
| `start_frontend_backend.sh` | start, stop, restart, status, logs, logs-backend, logs-frontend, help | Démarrage full-stack complet |
| `start-app.sh` | start, restart, stop, status, logs, help | Démarrage frontend uniquement |
| `installateur_bash_universel.sh` | paquet1 [paquet2] ... [--help\|--no-cleanup] | Installation de paquets Ubuntu |

---

## 💡 Astuces

### Créer des Alias

Ajoutez dans votre `~/.bashrc` :

```bash
alias start-english='cd /media/franck/M2_2To_990_windows/programmation/learning_english && ./start_frontend_backend.sh start'
alias stop-english='cd /media/franck/M2_2To_990_windows/programmation/learning_english && ./start_frontend_backend.sh stop'
alias logs-english='cd /media/franck/M2_2To_990_windows/programmation/learning_english && ./start_frontend_backend.sh logs-frontend'
```

Puis rechargez :
```bash
source ~/.bashrc
```

### Utilisation Rapide

```bash
# Démarrer tout
start-english

# Voir les logs
logs-english

# Arrêter tout
stop-english
```

---

## 🐛 Dépannage

### Script ne répond pas

```bash
# Vérifier la syntaxe
bash -n script.sh

# Vérifier les permissions
chmod +x script.sh
```

### Logs non disponibles

```bash
# Vérifier que les serveurs sont démarrés
./start_frontend_backend.sh status

# Vérifier que les fichiers de log existent
ls -l /tmp/*.log
```

### Installateur échoue

```bash
# Voir les erreurs
sudo ./installateur_bash_universel.sh paquet --no-cleanup

# Vérifier les logs système
tail -f /var/log/apt/history.log
```

---

## 📚 Documentation Complète

- **README.md** - Vue d'ensemble du projet
- **GETTING_STARTED.md** - Installation et démarrage
- **BACKEND.md** - Configuration backend et scripts
- **ARCHITECTURE.md** - Architecture technique

---

**💡 Conseil** : Utilisez toujours `--help` ou `help` pour voir toutes les possibilités d'un script !

