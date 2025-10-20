# 🚀 GUIDE COMPLET DE PRÉRÉGLAGE APPWRITE - ECOSYSTIA

**Date:** 14 Octobre 2025  
**Version:** 1.0  
**Durée estimée:** 2-3 heures

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Étape 1 : Créer le Compte Appwrite](#étape-1--créer-le-compte-appwrite)
3. [Étape 2 : Créer le Projet](#étape-2--créer-le-projet)
4. [Étape 3 : Créer la Base de Données](#étape-3--créer-la-base-de-données)
5. [Étape 4 : Créer les Collections](#étape-4--créer-les-collections)
6. [Étape 5 : Configurer l'Application](#étape-5--configurer-lapplication)
7. [Étape 6 : Tester la Connexion](#étape-6--tester-la-connexion)
8. [Étape 7 : Migration des Données](#étape-7--migration-des-données)
9. [Dépannage](#dépannage)

---

## 🎯 PRÉREQUIS

### Ce dont vous avez besoin

- ✅ Connexion Internet stable
- ✅ Navigateur moderne (Chrome, Firefox, Safari, Edge)
- ✅ Adresse email valide
- ✅ Node.js installé (pour les scripts de migration)
- ✅ Projet ECOSYSTIA cloné localement

### Temps nécessaire

- Création compte + projet : **10 minutes**
- Création collections : **30-45 minutes** (manuel) OU **5 minutes** (automatique)
- Configuration application : **5 minutes**
- Tests : **10-15 minutes**
- Migration données : **15-30 minutes**

**TOTAL : 1h15 à 1h45**

---

## 📝 ÉTAPE 1 : CRÉER LE COMPTE APPWRITE

### 1.1 Accéder à Appwrite Cloud

```
🌐 URL : https://cloud.appwrite.io
```

### 1.2 S'inscrire

1. Cliquer sur **"Sign Up"** ou **"Get Started"**
2. Choisir une méthode d'inscription :
   - Email + Mot de passe
   - GitHub
   - GitLab
   - Bitbucket

### 1.3 Vérifier votre email

- Ouvrir l'email de confirmation
- Cliquer sur le lien de vérification
- Retourner sur cloud.appwrite.io

✅ **Checkpoint 1 :** Vous êtes connecté à Appwrite Console

---

## 🏗️ ÉTAPE 2 : CRÉER LE PROJET

### 2.1 Créer un nouveau projet

1. Dans Appwrite Console, cliquer sur **"Create Project"**
2. Remplir les informations :
   ```
   Nom du projet : Ecosystia
   Description : Plateforme de gestion d'écosystème intelligente
   Region : Choisir la plus proche (Europe/USA/Asia)
   ```
3. Cliquer sur **"Create"**

### 2.2 Noter l'ID du projet

Une fois créé, vous verrez :
```
Project ID : 67xxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT** : Copier et sauvegarder cet ID !

### 2.3 Configurer le projet

1. Aller dans **Settings** → **General**
2. Vérifier les informations
3. (Optionnel) Personnaliser l'icône du projet

✅ **Checkpoint 2 :** Projet "Ecosystia" créé avec ID sauvegardé

---

## 🗄️ ÉTAPE 3 : CRÉER LA BASE DE DONNÉES

### 3.1 Accéder aux Databases

1. Dans le menu latéral, cliquer sur **"Databases"**
2. Cliquer sur **"Create Database"**

### 3.2 Créer la database principale

```
Database ID : ecosystia_main
Database Name : Ecosystia Main Database
```

⚠️ **IMPORTANT** : Copier et sauvegarder le Database ID !

### 3.3 Vérification

Vous devriez voir :
```
📊 Ecosystia Main Database
   Collections : 0
   Documents : 0
```

✅ **Checkpoint 3 :** Base de données créée

---

## 📦 ÉTAPE 4 : CRÉER LES COLLECTIONS

Vous avez **2 options** :

### Option A : Automatique (Recommandé) ⚡

#### A.1 Préparer le script

1. Ouvrir le fichier `scripts/createCollections.ts`
2. Mettre à jour les constantes en haut du fichier :

```typescript
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'VOTRE_PROJECT_ID_ICI';
const APPWRITE_DATABASE_ID = 'ecosystia_main';
const APPWRITE_API_KEY = 'VOTRE_API_KEY_ICI';
```

#### A.2 Créer une API Key

1. Dans Appwrite Console → **Settings** → **API Keys**
2. Cliquer sur **"Create API Key"**
3. Configurer :
   ```
   Name : Ecosystia Setup Key
   Scopes : 
      ✅ databases.read
      ✅ databases.write
      ✅ collections.read
      ✅ collections.write
      ✅ attributes.read
      ✅ attributes.write
   Expiration : Never (ou 1 mois)
   ```
4. Cliquer sur **"Create"**
5. **COPIER LA CLÉ IMMÉDIATEMENT** (elle ne sera plus visible après !)

#### A.3 Lancer le script

```bash
# Dans le terminal, à la racine du projet
npm run setup-collections
```

Le script va :
- ✅ Créer les 22 collections
- ✅ Créer tous les attributs
- ✅ Configurer les permissions
- ⏱️ Durée : 3-5 minutes

### Option B : Manuelle (Détaillée) 📋

Si le script automatique ne fonctionne pas, voici comment créer manuellement les collections principales :

#### B.1 Collection : Users

1. Dans Databases → Ecosystia Main → **"Create Collection"**

```
Collection ID : users
Collection Name : Users
```

2. **Permissions** :
   ```
   Role : Any
   Permissions : Read

   Role : Member
   Permissions : Create, Update

   Role : Admin
   Permissions : Read, Create, Update, Delete
   ```

3. **Attributs** :

| Key | Type | Size | Required | Default |
|-----|------|------|----------|---------|
| firstName | String | 255 | ✅ | - |
| lastName | String | 255 | ✅ | - |
| email | Email | 255 | ✅ | - |
| avatar | URL | 500 | ❌ | - |
| role | String | 50 | ✅ | student |
| skills | String | 1000 | ❌ | - |
| phone | String | 20 | ❌ | - |

#### B.2 Collection : Projects

```
Collection ID : projects
Collection Name : Projects
```

**Attributs** :

| Key | Type | Size | Required | Default |
|-----|------|------|----------|---------|
| name | String | 255 | ✅ | - |
| description | String | 2000 | ❌ | - |
| status | String | 50 | ✅ | Not Started |
| priority | String | 50 | ✅ | Medium |
| startDate | String | 50 | ❌ | - |
| endDate | String | 50 | ❌ | - |
| budget | Float | - | ❌ | 0 |
| ownerId | String | 50 | ✅ | - |
| teamMembers | String | 50 | ❌ | - |
| progress | Integer | - | ❌ | 0 |
| tags | String | 100 | ❌ | - |
| category | String | 100 | ❌ | General |

#### B.3 Collection : Tasks

```
Collection ID : tasks
Collection Name : Tasks
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| projectId | String | 50 | ✅ |
| text | String | 500 | ✅ |
| status | String | 50 | ❌ |
| priority | String | 50 | ❌ |
| assigneeId | String | 50 | ❌ |
| estimatedTime | Float | - | ❌ |
| loggedTime | Float | - | ❌ |
| dueDate | String | 50 | ❌ |

#### B.4 Collection : Courses

```
Collection ID : courses
Collection Name : Courses
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| title | String | 255 | ✅ |
| description | String | 2000 | ❌ |
| instructor | String | 255 | ✅ |
| duration | String | 100 | ❌ |
| level | String | 50 | ❌ |
| status | String | 50 | ❌ |
| enrolled | Integer | - | ❌ |
| roleId | String | 100 | ❌ |

#### B.5 Collection : Invoices

```
Collection ID : invoices
Collection Name : Invoices
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| invoiceNumber | String | 100 | ✅ |
| clientName | String | 255 | ✅ |
| amount | Float | - | ✅ |
| dueDate | String | 50 | ✅ |
| status | String | 50 | ❌ |
| recurringSourceId | Integer | - | ❌ |

#### B.6 Collection : Expenses

```
Collection ID : expenses
Collection Name : Expenses
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| category | String | 100 | ✅ |
| description | String | 500 | ✅ |
| amount | Float | - | ✅ |
| date | String | 50 | ✅ |
| dueDate | String | 50 | ❌ |
| status | String | 50 | ❌ |
| budgetItemId | String | 50 | ❌ |
| recurringSourceId | Integer | - | ❌ |

#### B.7 Collection : Time Logs

```
Collection ID : time_logs
Collection Name : Time Logs
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| userId | String | 50 | ✅ |
| projectId | String | 50 | ❌ |
| courseId | String | 50 | ❌ |
| taskId | String | 50 | ❌ |
| taskDescription | String | 500 | ❌ |
| hours | Float | - | ✅ |
| date | String | 50 | ✅ |
| description | String | 1000 | ❌ |

#### B.8 Collection : Leave Requests

```
Collection ID : leave_requests
Collection Name : Leave Requests
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| userId | String | 50 | ✅ |
| userName | String | 255 | ✅ |
| userAvatar | URL | 500 | ❌ |
| type | String | 100 | ✅ |
| startDate | String | 50 | ✅ |
| endDate | String | 50 | ✅ |
| reason | String | 1000 | ❌ |
| status | String | 50 | ❌ |

#### B.9 Collection : Contacts

```
Collection ID : contacts
Collection Name : Contacts
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| name | String | 255 | ✅ |
| workEmail | Email | 255 | ❌ |
| personalEmail | Email | 255 | ❌ |
| company | String | 255 | ❌ |
| status | String | 50 | ❌ |
| avatar | URL | 500 | ❌ |
| officePhone | String | 20 | ❌ |
| mobilePhone | String | 20 | ❌ |
| whatsappNumber | String | 20 | ❌ |

#### B.10 Collection : Documents

```
Collection ID : documents
Collection Name : Documents
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| title | String | 255 | ✅ |
| content | String | 10000 | ✅ |
| createdAt | String | 50 | ❌ |
| createdBy | String | 255 | ❌ |

#### B.11 Collection : Risks

```
Collection ID : risks
Collection Name : Risks
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| projectId | String | 50 | ✅ |
| title | String | 255 | ✅ |
| description | String | 1000 | ❌ |
| impact | String | 50 | ❌ |
| probability | String | 50 | ❌ |
| mitigationStrategy | String | 1000 | ❌ |

#### B.12 Collection : Jobs

```
Collection ID : jobs
Collection Name : Jobs
```

**Attributs** :

| Key | Type | Size | Required |
|-----|------|------|----------|
| title | String | 255 | ✅ |
| description | String | 2000 | ❌ |
| company | String | 255 | ❌ |
| location | String | 255 | ❌ |
| salary | Float | - | ❌ |
| type | String | 50 | ❌ |
| status | String | 50 | ❌ |
| requirements | String | 2000 | ❌ |

**⚠️ IMPORTANT :** Répéter pour les 10 autres collections (voir `scripts/createCollections.ts` pour la liste complète)

✅ **Checkpoint 4 :** Collections créées (min. 12/22)

---

## ⚙️ ÉTAPE 5 : CONFIGURER L'APPLICATION

### 5.1 Créer le fichier .env

À la racine du projet, créer un fichier `.env` :

```env
# Configuration Appwrite
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=VOTRE_PROJECT_ID_ICI
VITE_APPWRITE_DATABASE_ID=ecosystia_main
VITE_APPWRITE_STORAGE_BUCKET_ID=files

# Configuration Gemini AI (Optionnel)
VITE_GEMINI_API_KEY=votre_cle_gemini_optionnelle
```

### 5.2 Remplacer les valeurs

```env
VITE_APPWRITE_PROJECT_ID=67abc123def456... (de l'étape 2)
```

### 5.3 Créer un Storage Bucket (pour les fichiers)

1. Dans Appwrite Console → **Storage**
2. Cliquer sur **"Create Bucket"**

```
Bucket ID : files
Bucket Name : Ecosystia Files
Max File Size : 50 MB
Allowed Extensions : pdf, jpg, jpeg, png, gif, doc, docx, xls, xlsx
Compression : Enabled
Encryption : Enabled
Antivirus : Enabled
```

3. **Permissions** :
   ```
   Role : Any
   Permissions : Read

   Role : Member
   Permissions : Create, Update, Delete
   ```

✅ **Checkpoint 5 :** Fichier .env configuré + Storage bucket créé

---

## 🧪 ÉTAPE 6 : TESTER LA CONNEXION

### 6.1 Installer les dépendances

```bash
npm install
```

### 6.2 Lancer l'application

```bash
npm run dev
```

### 6.3 Ouvrir l'application

```
URL : http://localhost:5173
```

### 6.4 Tester la connexion

1. Ouvrir la **Console du navigateur** (F12)
2. Regarder les messages :

✅ **Succès** :
```
✅ Connexion Appwrite réussie
```

❌ **Erreur** :
```
❌ Erreur connexion Appwrite: ...
```

→ Voir section [Dépannage](#dépannage)

### 6.5 Tester l'authentification

1. Créer un compte sur l'interface de login
2. Vérifier dans Appwrite Console → **Auth** → **Users**
3. Vous devriez voir le nouvel utilisateur

✅ **Checkpoint 6 :** Connexion Appwrite fonctionnelle

---

## 📤 ÉTAPE 7 : MIGRATION DES DONNÉES

### 7.1 Tester avec un projet manuel

1. Dans l'application, aller sur **Projects**
2. Cliquer sur **"New Project"**
3. Remplir le formulaire :
   ```
   Titre : Projet Test Appwrite
   Description : Test de la persistance
   Statut : In Progress
   Priorité : High
   Date d'échéance : 2025-12-31
   ```
4. Cliquer sur **"Create Project"**

### 7.2 Vérifier dans Appwrite

1. Aller dans Appwrite Console → **Databases** → **ecosystia_main** → **projects**
2. Vous devriez voir le nouveau projet créé !

✅ **SUCCÈS** : La persistance fonctionne !

### 7.3 Migrer les données mockées (Optionnel)

Si vous voulez importer les données de démo :

```bash
npm run migrate-data
```

Cela va créer :
- 19 utilisateurs de démo
- 13 projets de démo
- 12 cours de démo
- Etc.

✅ **Checkpoint 7 :** Migration complète

---

## 🔧 DÉPANNAGE

### Problème 1 : "API Key must be set"

**Cause** : Variables d'environnement non chargées

**Solution** :
1. Vérifier que le fichier `.env` existe à la racine
2. Vérifier que les variables commencent par `VITE_`
3. Redémarrer le serveur de développement :
   ```bash
   # Arrêter (Ctrl+C)
   # Relancer
   npm run dev
   ```

### Problème 2 : "Project not found"

**Cause** : ID de projet incorrect

**Solution** :
1. Vérifier l'ID du projet dans Appwrite Console
2. Mettre à jour `.env` :
   ```env
   VITE_APPWRITE_PROJECT_ID=67... (le bon ID)
   ```
3. Redémarrer l'application

### Problème 3 : "Database not found"

**Cause** : ID de database incorrect

**Solution** :
1. Vérifier l'ID de la database dans Appwrite Console
2. Mettre à jour `.env` :
   ```env
   VITE_APPWRITE_DATABASE_ID=ecosystia_main
   ```
3. Redémarrer l'application

### Problème 4 : "Collection not found"

**Cause** : Collections pas encore créées

**Solution** :
1. Vérifier les collections dans Appwrite Console
2. Créer les collections manquantes (voir Étape 4)
3. Ou lancer le script automatique :
   ```bash
   npm run setup-collections
   ```

### Problème 5 : CORS Error

**Cause** : Platform non configurée

**Solution** :
1. Dans Appwrite Console → **Settings** → **Platforms**
2. Cliquer sur **"Add Platform"** → **"Web App"**
3. Configurer :
   ```
   Name : Ecosystia Local
   Hostname : localhost
   ```
4. Ajouter aussi :
   ```
   Name : Ecosystia Prod
   Hostname : votre-domaine.com (si applicable)
   ```

### Problème 6 : "Permission denied"

**Cause** : Permissions mal configurées

**Solution** :
1. Aller dans la collection concernée
2. Settings → Permissions
3. Vérifier :
   ```
   Role : Any → Read ✅
   Role : Member → Create, Update ✅
   Role : Admin → All ✅
   ```

### Problème 7 : Script createCollections échoue

**Cause** : API Key invalide ou expirée

**Solution** :
1. Créer une nouvelle API Key (voir Étape 4.A.2)
2. Vérifier les scopes (databases, collections, attributes)
3. Mettre à jour `scripts/createCollections.ts`
4. Relancer le script

---

## 📊 CHECKLIST FINALE

Avant de considérer le préréglage complet, vérifier :

### Configuration Appwrite
- [ ] Compte Appwrite créé et vérifié
- [ ] Projet "Ecosystia" créé
- [ ] Project ID sauvegardé
- [ ] Database "ecosystia_main" créée
- [ ] Database ID sauvegardé
- [ ] Storage bucket "files" créé
- [ ] API Key créée (si script automatique)

### Collections
- [ ] Minimum 12 collections créées
  - [ ] users
  - [ ] projects
  - [ ] tasks
  - [ ] courses
  - [ ] jobs
  - [ ] invoices
  - [ ] expenses
  - [ ] time_logs
  - [ ] leave_requests
  - [ ] contacts
  - [ ] documents
  - [ ] risks

### Application
- [ ] Fichier `.env` créé
- [ ] Variables d'environnement correctes
- [ ] Dépendances installées (`npm install`)
- [ ] Application démarrée (`npm run dev`)
- [ ] Console : "✅ Connexion Appwrite réussie"

### Tests
- [ ] Création de compte fonctionne
- [ ] Login fonctionne
- [ ] Création d'un projet fonctionne
- [ ] Projet visible dans Appwrite Console
- [ ] Modification d'un projet fonctionne
- [ ] Suppression d'un projet fonctionne

### Bonus
- [ ] API Key créée et sauvegardée
- [ ] Script automatique exécuté avec succès
- [ ] Données de démo migrées
- [ ] Documentation lue
- [ ] Premiers tests utilisateur effectués

---

## 🎉 FÉLICITATIONS !

Si vous avez coché toutes les cases, votre instance **ECOSYSTIA** est maintenant connectée à Appwrite et prête à l'emploi ! 🚀

### Prochaines Étapes

1. **Explorer l'application**
   - Tester tous les modules
   - Créer des données réelles
   - Inviter des utilisateurs

2. **Personnaliser**
   - Modifier les couleurs
   - Adapter les rôles
   - Ajouter des modules

3. **Déployer**
   - Configurer un domaine
   - Déployer sur Vercel/Netlify
   - Mettre en production

---

## 📞 SUPPORT

### Documentation
- `docs/` - Documentation complète (250+ pages)
- `ANALYSE-COMPLETE-PROJET-ECOSYSTIA.md` - Analyse du projet
- `README.md` - Guide de démarrage

### Ressources Externes
- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Discord](https://appwrite.io/discord)
- [Appwrite GitHub](https://github.com/appwrite/appwrite)

---

**Guide créé le :** 14 Octobre 2025  
**Version :** 1.0  
**Auteur :** Assistant IA  
**Pour :** ECOSYSTIA v1.0.0

