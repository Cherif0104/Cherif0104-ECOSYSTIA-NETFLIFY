# 🚀 GUIDE D'INSTALLATION - ERP SENEGEL

**Client** : IMPULCIA  
**Version** : 1.0.0  
**Date** : 13 octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Installation locale](#installation-locale)
3. [Configuration](#configuration)
4. [Démarrage](#démarrage)
5. [Accès à l'application](#accès-à-lapplication)
6. [Dépannage](#dépannage)

---

## 🔧 PRÉREQUIS

### Logiciels requis

| Logiciel | Version minimale | Installation |
|----------|------------------|--------------|
| **Node.js** | 18.0+ | https://nodejs.org |
| **npm** | 9.0+ | Inclus avec Node.js |
| **Git** | 2.30+ | https://git-scm.com |

### Vérifier les installations

```bash
# Vérifier Node.js
node --version
# Devrait afficher : v18.x.x ou supérieur

# Vérifier npm
npm --version
# Devrait afficher : 9.x.x ou supérieur

# Vérifier Git
git --version
# Devrait afficher : git version 2.x.x ou supérieur
```

---

## 💻 INSTALLATION LOCALE

### Étape 1 : Cloner le projet

```bash
# Option 1 : Si vous avez accès au repository Git
git clone [URL_DU_REPOSITORY]
cd SENEGEL-WorkFlow

# Option 2 : Si vous avez reçu un ZIP
# Extraire le fichier ZIP
# Ouvrir un terminal dans le dossier extrait
```

### Étape 2 : Installer les dépendances

```bash
# Installer toutes les dépendances
npm install

# Temps estimé : 2-3 minutes
```

### Étape 3 : Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Ou créer manuellement le fichier .env
```

Contenu du fichier `.env` :

```env
# Configuration Appwrite
VITE_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68e54e9c002cb568cfec
VITE_APPWRITE_DATABASE_ID=68e56de100267007af6a
VITE_APPWRITE_STORAGE_BUCKET_ID=files

# Configuration Gemini (optionnel)
VITE_GEMINI_API_KEY=votre_cle_gemini_si_disponible
```

---

## ⚙️ CONFIGURATION

### Backend Appwrite

L'application utilise **Appwrite Cloud** comme backend. Aucune configuration serveur n'est nécessaire.

**Informations de connexion Appwrite** :
- **Console** : https://cloud.appwrite.io/console
- **Project ID** : `68e54e9c002cb568cfec`
- **Database ID** : `68e56de100267007af6a`

### Collections configurées

Les collections suivantes sont déjà créées et configurées :

- ✅ `demo_users` - Utilisateurs
- ✅ `demo_projects` - Projets
- ✅ `demo_courses` - Cours
- ✅ `demo_jobs` - Emplois
- ✅ `demo_invoices` - Factures
- ✅ `demo_expenses` - Dépenses
- ✅ `demo_time_logs` - Logs de temps
- ✅ `demo_leave_requests` - Demandes de congé

---

## 🚀 DÉMARRAGE

### Démarrage en mode développement

```bash
# Lancer le serveur de développement
npm run dev

# L'application sera accessible sur :
# http://localhost:5173
```

### Build de production

```bash
# Créer le build de production
npm run build

# Les fichiers seront générés dans le dossier : dist/
```

### Prévisualiser le build de production

```bash
# Prévisualiser le build localement
npm run preview

# L'application sera accessible sur :
# http://localhost:4173
```

---

## 🌐 ACCÈS À L'APPLICATION

### URL locale (développement)

```
http://localhost:5173
```

### URL de production

```
https://ecosystia.vercel.app
```

### Credentials par défaut

#### Administrateur
- **Email** : `admin@ecosystia.com`
- **Password** : `Admin123!`

#### Manager
- **Email** : `manager@ecosystia.com`
- **Password** : `password123`

#### Développeur
- **Email** : `developer@ecosystia.com`
- **Password** : `password123`

#### Utilisateur standard
- **Email** : `user@ecosystia.com`
- **Password** : `password123`

**⚠️ IMPORTANT : Changez tous les mots de passe après la première connexion !**

---

## 📦 STRUCTURE DU PROJET

```
SENEGEL-WorkFlow/
├── components/           # Composants React
│   ├── common/          # Composants réutilisables
│   ├── icons/           # Icônes personnalisées
│   ├── Dashboard.tsx    # Tableau de bord
│   ├── Projects.tsx     # Gestion de projets
│   ├── Finance.tsx      # Gestion financière
│   └── ...              # Autres modules
├── contexts/            # Contextes React
│   ├── AuthContext.tsx  # Authentification
│   └── LocalizationContext.tsx
├── services/            # Services backend
│   ├── appwriteService.ts    # Client Appwrite
│   ├── dataService.ts        # Service de données
│   └── realtimeService.ts    # Synchronisation temps réel
├── hooks/               # Hooks React personnalisés
│   └── useRealtime.ts   # Hooks temps réel
├── utils/               # Utilitaires
│   ├── errorHandling.ts # Gestion d'erreurs
│   ├── validation.ts    # Validation de données
│   └── permissions.ts   # Système de permissions
├── constants/           # Constantes
│   ├── data.ts          # Données mock
│   └── localization.ts  # Traductions
├── docs/                # Documentation
├── scripts/             # Scripts utilitaires
├── .env                 # Variables d'environnement
├── package.json         # Dépendances
├── vite.config.ts       # Configuration Vite
└── tsconfig.json        # Configuration TypeScript
```

---

## 🔍 DÉPANNAGE

### Problème 1 : Erreur "Cannot find module"

**Symptôme** : Message d'erreur lors du `npm install`

**Solution** :
```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install
```

### Problème 2 : Port 5173 déjà utilisé

**Symptôme** : "Port 5173 is already in use"

**Solution** :
```bash
# Option 1 : Arrêter le processus existant
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node

# Option 2 : Utiliser un autre port
npx vite --port 3000
```

### Problème 3 : Erreur de connexion Appwrite

**Symptôme** : "Failed to connect to Appwrite"

**Solution** :
1. Vérifier la connexion internet
2. Vérifier que le fichier `.env` contient les bonnes valeurs
3. Vérifier que l'endpoint Appwrite est accessible : https://sfo.cloud.appwrite.io/v1

### Problème 4 : Page blanche après build

**Symptôme** : Page blanche après déploiement

**Solution** :
```bash
# Vérifier la configuration de Vite pour le déploiement
# Dans vite.config.ts, s'assurer que base est correctement configuré

# Reconstruire
npm run build
```

### Problème 5 : Données ne persistent pas

**Symptôme** : Les données disparaissent après rafraîchissement

**Solution** :
1. Vérifier que les collections Appwrite sont créées
2. Vérifier les permissions des collections
3. Vérifier la connexion Appwrite dans la console navigateur (F12)

---

## 🛠️ SCRIPTS UTILES

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Crée le build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run list-collections` | Liste les collections Appwrite |

---

## 📞 SUPPORT

### Documentation

- **Guide utilisateur** : `GUIDE-UTILISATEUR-IMPULCIA.md`
- **Documentation technique** : `docs/`
- **Cahier des charges** : `CAHIER-DES-CHARGES-IMPULCIA.md`

### Ressources externes

- **Appwrite Documentation** : https://appwrite.io/docs
- **React Documentation** : https://react.dev
- **Vite Documentation** : https://vitejs.dev

### Contact

Pour toute question ou problème :
- **Email** : contact@impulcia-afrique.com
- **Téléphone** : +221 78 832 40 69

---

## ✅ CHECKLIST D'INSTALLATION

Après l'installation, vérifier que :

- [ ] Node.js 18+ est installé
- [ ] Les dépendances sont installées (`node_modules` existe)
- [ ] Le fichier `.env` est configuré
- [ ] L'application démarre avec `npm run dev`
- [ ] L'application est accessible sur http://localhost:5173
- [ ] La connexion fonctionne avec les credentials par défaut
- [ ] Les données persistent après rafraîchissement

---

## 🎉 FÉLICITATIONS !

L'installation est terminée ! Vous pouvez maintenant :

1. ✅ Accéder à l'application : http://localhost:5173
2. ✅ Vous connecter avec les credentials par défaut
3. ✅ Consulter le guide utilisateur : `GUIDE-UTILISATEUR-IMPULCIA.md`
4. ✅ Commencer à utiliser les 16 modules ERP

---

**Date de création** : 13 octobre 2025  
**Version** : 1.0.0  
**Client** : IMPULCIA  
**Statut** : ✅ **PRÊT À L'EMPLOI**

