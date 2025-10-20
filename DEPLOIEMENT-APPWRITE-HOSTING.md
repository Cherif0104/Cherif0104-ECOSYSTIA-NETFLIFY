# 🚀 GUIDE DE DÉPLOIEMENT - APPWRITE HOSTING

**Projet** : ERP SENEGEL  
**Client** : IMPULCIA  
**Date** : 13 octobre 2025

---

## 🎯 POURQUOI APPWRITE HOSTING ?

### Avantages

✅ **Tout au même endroit** : Backend + Frontend dans Appwrite  
✅ **Gratuit** : Inclus dans le plan gratuit Appwrite  
✅ **Simple** : Déploiement en une commande  
✅ **Rapide** : CDN global intégré  
✅ **Sécurisé** : HTTPS automatique  
✅ **Aucune configuration DNS** complexe  

### Comparaison

| Critère | Appwrite Hosting | Vercel |
|---------|------------------|--------|
| **Coût** | Gratuit | Gratuit (limité) |
| **Configuration** | Très simple | Simple |
| **Centralisation** | Backend + Frontend | Frontend seul |
| **CDN** | Inclus | Inclus |
| **SSL** | Automatique | Automatique |
| **Custom domain** | Oui | Oui |

---

## 📋 PRÉREQUIS

1. **Compte Appwrite Cloud** (déjà créé)
   - Console : https://cloud.appwrite.io/console
   - Project ID : `68e54e9c002cb568cfec`

2. **Appwrite CLI** installée
   ```bash
   npm install -g appwrite-cli
   ```

3. **Build de production** (déjà fait ✅)
   ```bash
   npm run build
   ```

---

## 🚀 DÉPLOIEMENT EN 3 ÉTAPES

### Étape 1 : Installer Appwrite CLI

```bash
# Installer globalement
npm install -g appwrite-cli

# Vérifier l'installation
appwrite --version
```

### Étape 2 : Se connecter à Appwrite

```bash
# Connexion
appwrite login

# Suivre les instructions :
# 1. Enter your Appwrite endpoint: https://cloud.appwrite.io/v1
# 2. Ouvrir le navigateur pour autoriser
# 3. Confirmer l'autorisation
```

### Étape 3 : Initialiser le projet

```bash
# Initialiser dans le dossier du projet
appwrite init

# Configuration :
# ? What is your project ID? 68e54e9c002cb568cfec
# ? What is your project name? ERP SENEGEL
# ? Select products you want to configure: Storage (optionnel)
```

### Étape 4 : Déployer

```bash
# Déployer le dossier dist/
appwrite deploy function --function-id ecosystia-frontend --build ./dist

# OU utiliser la nouvelle commande de hosting (Appwrite 1.5+)
appwrite deploy hosting --project-id 68e54e9c002cb568cfec --directory dist
```

---

## 🔧 CONFIGURATION COMPLÈTE (Méthode recommandée)

### 1. Créer le fichier de configuration Appwrite

Créer `appwrite.json` à la racine :

```json
{
  "projectId": "68e54e9c002cb568cfec",
  "projectName": "ERP SENEGEL",
  "hosting": {
    "source": "dist",
    "index": "index.html",
    "errorPage": "index.html"
  }
}
```

### 2. Script de déploiement automatique

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && appwrite deploy hosting"
  }
}
```

### 3. Déployer en une commande

```bash
# Build + Deploy automatique
npm run deploy
```

---

## 🌐 URL DE L'APPLICATION

Après le déploiement, votre application sera accessible sur :

```
https://68e54e9c002cb568cfec.appwrite.global
```

Ou avec un domaine personnalisé :

```
https://erp.impulcia-afrique.com
```

---

## 🔐 CONFIGURATION DU DOMAINE DANS APPWRITE

### Ajouter le domaine dans les plateformes autorisées

1. Aller sur https://cloud.appwrite.io/console
2. Sélectionner votre projet : **ERP SENEGEL**
3. Aller dans **Settings** → **Platforms**
4. Cliquer sur **"Add Platform"**
5. Sélectionner **"Web App"**
6. Ajouter :
   ```
   Name: ERP SENEGEL Production
   Hostname: 68e54e9c002cb568cfec.appwrite.global
   ```
7. Si vous avez un domaine personnalisé, ajouter aussi :
   ```
   Name: ERP SENEGEL Custom Domain
   Hostname: erp.impulcia-afrique.com
   ```

---

## 🔄 ALTERNATIVE : DÉPLOIEMENT MANUEL VIA LA CONSOLE

Si la CLI ne fonctionne pas, voici la méthode manuelle :

### Méthode 1 : Via Appwrite Storage

1. **Créer un bucket public**
   - Console → Storage → Create Bucket
   - Name: `frontend`
   - Permissions: Public read

2. **Uploader les fichiers**
   - Uploader tous les fichiers du dossier `dist/`
   - Conserver la structure des dossiers

3. **Configurer un proxy/redirect**
   - Utiliser Appwrite Functions pour servir les fichiers

### Méthode 2 : Via Appwrite Functions (Recommandé)

1. **Créer une fonction**
   ```bash
   appwrite init function
   # Name: frontend-host
   # Runtime: node-18.0
   ```

2. **Créer le script de hosting**
   
   Créer `functions/frontend-host/index.js` :
   
   ```javascript
   const fs = require('fs');
   const path = require('path');
   
   module.exports = async ({ req, res }) => {
     const filePath = req.path === '/' ? '/index.html' : req.path;
     const fullPath = path.join(__dirname, 'dist', filePath);
     
     if (fs.existsSync(fullPath)) {
       const content = fs.readFileSync(fullPath);
       const ext = path.extname(filePath);
       
       const contentTypes = {
         '.html': 'text/html',
         '.js': 'application/javascript',
         '.css': 'text/css',
         '.json': 'application/json',
         '.png': 'image/png',
         '.jpg': 'image/jpeg',
         '.svg': 'image/svg+xml'
       };
       
       res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
       return res.send(content);
     }
     
     // Fallback to index.html for SPA routing
     const indexPath = path.join(__dirname, 'dist', 'index.html');
     const indexContent = fs.readFileSync(indexPath);
     res.setHeader('Content-Type', 'text/html');
     return res.send(indexContent);
   };
   ```

3. **Copier le build dans la fonction**
   ```bash
   cp -r dist functions/frontend-host/
   ```

4. **Déployer la fonction**
   ```bash
   appwrite deploy function --function-id frontend-host
   ```

---

## ⚡ SOLUTION RAPIDE ET SIMPLE (RECOMMANDÉE)

### Utiliser le nouveau Appwrite Static Hosting

Appwrite 1.5+ inclut un hosting statique natif :

```bash
# 1. Installer la CLI
npm install -g appwrite-cli

# 2. Se connecter
appwrite login

# 3. Build
npm run build

# 4. Déployer
appwrite deploy static \
  --project-id 68e54e9c002cb568cfec \
  --directory dist \
  --domain erp-senegel
```

Votre app sera accessible sur :
```
https://erp-senegel.appwrite.global
```

---

## 🎯 SCRIPT DE DÉPLOIEMENT AUTOMATISÉ

Créer `deploy.sh` (ou `deploy.ps1` pour Windows) :

### Pour Windows PowerShell (`deploy.ps1`)

```powershell
#!/usr/bin/env pwsh

Write-Host "🚀 DÉPLOIEMENT ERP SENEGEL - APPWRITE HOSTING" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Build
Write-Host "📦 Build de production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build réussi" -ForegroundColor Green
Write-Host ""

# Étape 2 : Déploiement
Write-Host "🌐 Déploiement sur Appwrite..." -ForegroundColor Yellow

appwrite deploy static `
  --project-id 68e54e9c002cb568cfec `
  --directory dist `
  --domain erp-senegel

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Déploiement réussi !" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URL: https://erp-senegel.appwrite.global" -ForegroundColor Cyan
Write-Host ""
```

### Pour Linux/Mac (`deploy.sh`)

```bash
#!/bin/bash

echo "🚀 DÉPLOIEMENT ERP SENEGEL - APPWRITE HOSTING"
echo ""

# Étape 1 : Build
echo "📦 Build de production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi"
echo ""

# Étape 2 : Déploiement
echo "🌐 Déploiement sur Appwrite..."

appwrite deploy static \
  --project-id 68e54e9c002cb568cfec \
  --directory dist \
  --domain erp-senegel

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

echo ""
echo "✅ Déploiement réussi !"
echo ""
echo "🌐 URL: https://erp-senegel.appwrite.global"
echo ""
```

### Utilisation

```bash
# Windows PowerShell
.\deploy.ps1

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 COMPARAISON DES MÉTHODES

| Méthode | Difficulté | Temps | Recommandé |
|---------|------------|-------|------------|
| **Appwrite CLI (static)** | ⭐ Facile | 5 min | ✅ OUI |
| **Appwrite Functions** | ⭐⭐ Moyen | 15 min | ⚠️ Si CLI ne marche pas |
| **Appwrite Storage** | ⭐⭐⭐ Difficile | 30 min | ❌ Non recommandé |
| **Vercel** | ⭐ Facile | 5 min | ✅ Alternative |

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Avant le déploiement

- [x] Build de production réussi (`npm run build`)
- [x] Dossier `dist/` créé
- [ ] Appwrite CLI installée (`npm install -g appwrite-cli`)
- [ ] Connecté à Appwrite (`appwrite login`)
- [ ] Project ID configuré (`68e54e9c002cb568cfec`)

### Pendant le déploiement

- [ ] Commande de déploiement lancée
- [ ] Déploiement réussi (pas d'erreur)
- [ ] URL générée

### Après le déploiement

- [ ] Application accessible
- [ ] Connexion fonctionnelle
- [ ] Persistance validée
- [ ] Domaine ajouté dans Platforms Appwrite
- [ ] Tests sur mobile

---

## 🆘 DÉPANNAGE

### Problème 1 : Appwrite CLI non installée

**Erreur** : `appwrite: command not found`

**Solution** :
```bash
npm install -g appwrite-cli
```

### Problème 2 : Erreur d'authentification

**Erreur** : `Unauthorized`

**Solution** :
```bash
appwrite logout
appwrite login
```

### Problème 3 : Erreur CORS

**Erreur** : `CORS policy` dans la console

**Solution** :
1. Console Appwrite → Settings → Platforms
2. Ajouter le domaine de hosting
3. Redéployer

### Problème 4 : Page 404 sur les routes

**Erreur** : 404 sur les URLs directes

**Solution** :
Dans `appwrite.json`, configurer :
```json
{
  "hosting": {
    "errorPage": "index.html"
  }
}
```

---

## 🌐 DOMAINE PERSONNALISÉ

### Ajouter un domaine personnalisé

1. **Console Appwrite** → Hosting → Custom Domains
2. Cliquer sur **"Add Domain"**
3. Entrer : `erp.impulcia-afrique.com`
4. Appwrite fournit les enregistrements DNS
5. Ajouter ces enregistrements chez votre registrar :

```
Type: CNAME
Name: erp
Value: [valeur fournie par Appwrite]
```

6. Attendre la propagation DNS (5-60 min)
7. Activer le SSL (automatique)

---

## 💰 COÛTS

### Appwrite Hosting

| Plan | Bande passante | Stockage | Coût |
|------|----------------|----------|------|
| **Free** | 10 GB/mois | 2 GB | 0€ |
| **Pro** | 300 GB/mois | 100 GB | Inclus dans 75€ |

✅ **Votre cas** : Plan Free suffit largement pour commencer !

---

## 📞 SUPPORT

### Documentation

- **Appwrite Hosting** : https://appwrite.io/docs/products/hosting
- **Appwrite CLI** : https://appwrite.io/docs/tooling/command-line

### Contact Appwrite

- **Discord** : https://appwrite.io/discord
- **GitHub** : https://github.com/appwrite/appwrite

---

## 🎉 CONCLUSION

Déployer sur **Appwrite Hosting** est la solution idéale pour votre ERP :

✅ **Gratuit**  
✅ **Simple** (une commande)  
✅ **Centralisé** (tout sur Appwrite)  
✅ **Sécurisé** (HTTPS automatique)  
✅ **Rapide** (CDN global)  

**Prochaine étape** : Lancer le déploiement !

---

**Date** : 13 octobre 2025  
**Projet** : ERP SENEGEL  
**Client** : IMPULCIA  
**Statut** : 📋 **PRÊT POUR LE DÉPLOIEMENT APPWRITE**

