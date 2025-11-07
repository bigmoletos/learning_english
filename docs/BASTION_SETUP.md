# Guide de Configuration du Bastion

**Version** : 1.0.0 | **Date** : Novembre 2025

---

## 🎯 Vue d'ensemble

Le bastion est un reverse proxy Nginx sécurisé qui protège votre instance Infisical avec authentification basique et rate limiting.

---

## 🔧 Installation

### Automatique

```bash
cd bastion
chmod +x setup.sh
sudo ./setup.sh
```

Le script va :
1. Installer Nginx
2. Configurer le reverse proxy
3. Configurer l'authentification basique
4. Installer Certbot et générer les certificats SSL
5. Configurer le firewall

### Manuelle

#### 1. Installation Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

#### 2. Installation Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 3. Configuration Nginx

```bash
# Copier la configuration
sudo cp nginx.conf /etc/nginx/sites-available/infisical-bastion

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/infisical-bastion /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default
```

#### 4. Configuration SSL

```bash
# Générer le certificat
sudo certbot --nginx -d infisical.votre-domaine.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

#### 5. Configuration Authentification

```bash
# Installer htpasswd
sudo apt install -y apache2-utils

# Créer le fichier .htpasswd
sudo htpasswd -c /etc/nginx/.htpasswd utilisateur1

# Ajouter d'autres utilisateurs
sudo htpasswd /etc/nginx/.htpasswd utilisateur2
```

---

## 🔐 Configuration de l'authentification

### Ajouter un utilisateur

```bash
sudo htpasswd /etc/nginx/.htpasswd nom_utilisateur
```

### Supprimer un utilisateur

```bash
sudo htpasswd -D /etc/nginx/.htpasswd nom_utilisateur
```

### Lister les utilisateurs

```bash
cat /etc/nginx/.htpasswd
```

---

## 🛡️ IP Whitelist

### Activer la whitelist

Modifier `nginx.conf` et décommenter :

```nginx
# IP Whitelist
include /etc/nginx/conf.d/whitelist.conf;
```

### Créer le fichier whitelist

```bash
sudo nano /etc/nginx/conf.d/whitelist.conf
```

Contenu :

```nginx
# Autoriser uniquement ces IPs
allow 1.2.3.4;      # Votre IP
allow 5.6.7.8;      # Autre IP autorisée
deny all;
```

### Recharger Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ⚡ Rate Limiting

La configuration inclut déjà le rate limiting :

- **API générale** : 10 requêtes/seconde
- **Authentification** : 5 requêtes/seconde

Pour modifier, éditer `nginx.conf` :

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;
```

---

## 🔥 Firewall

### Configuration automatique

```bash
cd bastion
chmod +x firewall-rules.sh
sudo ./firewall-rules.sh
```

### Configuration manuelle

```bash
# Installer UFW
sudo apt install -y ufw

# Règles par défaut
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier
sudo ufw status verbose
```

---

## 🔄 Renouvellement automatique SSL

Certbot configure automatiquement le renouvellement. Vérifier :

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Vérifier le cron job
sudo crontab -l | grep certbot
```

---

## 📊 Monitoring

### Logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/bastion_access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/bastion_error.log
```

### Statistiques

```bash
# Voir les connexions actives
sudo netstat -an | grep :443

# Voir les processus Nginx
ps aux | grep nginx
```

---

## 🐛 Dépannage

### Nginx ne démarre pas

```bash
# Vérifier la configuration
sudo nginx -t

# Voir les erreurs
sudo journalctl -u nginx -n 50
```

### Erreur SSL

```bash
# Régénérer le certificat
sudo certbot renew --force-renewal

# Vérifier le certificat
sudo certbot certificates
```

### Authentification ne fonctionne pas

```bash
# Vérifier le fichier .htpasswd
sudo cat /etc/nginx/.htpasswd

# Vérifier les permissions
sudo ls -la /etc/nginx/.htpasswd

# Tester l'authentification
curl -u utilisateur:motdepasse https://infisical.votre-domaine.com
```

---

## 🔐 Sécurité renforcée

### Headers de sécurité

La configuration inclut déjà les headers de sécurité :

- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`

### Fail2ban

Installer Fail2ban pour protection contre les attaques brute-force :

```bash
sudo apt install -y fail2ban

# Configuration automatique dans firewall-rules.sh
```

---

## 📚 Ressources

- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation Certbot](https://certbot.eff.org/docs/)
- [Fail2ban Documentation](https://www.fail2ban.org/wiki/index.php/Main_Page)

---

**Auteur** : Infrastructure DevOps
**Date** : Novembre 2025

