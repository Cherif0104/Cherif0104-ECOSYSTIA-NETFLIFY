# 🚀 Ecosystia Workflow - Plateforme de Gestion d'Entreprise

## 📋 **Description**

Ecosystia Workflow est une plateforme complète de gestion d'entreprise développée avec React, TypeScript et Appwrite. Elle offre une interface ultra-moderne pour gérer tous les aspects de votre entreprise.

## ✨ **Fonctionnalités**

### **🔐 Authentification**
- Mode Démo avec sélecteur de rôles (19 rôles disponibles)
- Mode Production avec Appwrite
- Gestion des sessions et permissions

### **📊 Modules Disponibles**
- **Dashboard** - Vue d'ensemble de l'entreprise
- **Projects** - Gestion des projets (interface ultra-moderne)
- **Goals/OKRs** - Objectifs et résultats clés
- **Time Tracking** - Suivi du temps de travail
- **Leave Management** - Gestion des congés
- **Finance** - Gestion financière et budgétaire
- **Knowledge Base** - Base de connaissances
- **Courses** - Formation et développement
- **Jobs** - Gestion des emplois
- **AI Coach** - Assistant IA intelligent
- **Settings** - Paramètres et configuration

### **🎨 Interface Ultra-Moderne**
- Design responsive et moderne
- Animations fluides et transitions
- Navigation intuitive
- Fonctionnalités CRUD complètes
- Gestion d'équipe avancée

## 🛠️ **Technologies**

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Appwrite (Base de données, Authentification, Storage)
- **Build**: Vite
- **Déploiement**: Netlify, Vercel, Appwrite Hosting
- **IA**: Google Gemini API

## 🚀 **Installation et Déploiement**

### **Développement Local**
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

### **Déploiement**
1. **Vercel**: `vercel --prod`
2. **Netlify**: `netlify deploy --prod`
3. **Appwrite Hosting**: Uploader le dossier `dist`

## 🔧 **Configuration**

### **Variables d'environnement**
```
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68ee2dc2001f0f499c02
VITE_APPWRITE_DATABASE_ID=68ee527d002813e4e0ca
VITE_APPWRITE_API_KEY=your_api_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### **Scripts Disponibles**
- `npm run dev` - Serveur de développement
- `npm run build` - Construction pour production
- `npm run preview` - Aperçu de la production
- `npm run setup-collections` - Configuration Appwrite
- `npm run create-test-users` - Création d'utilisateurs de test

## 📱 **Utilisation**

### **Mode Démo**
1. Ouvrir l'application
2. Sélectionner "Mode Démo"
3. Choisir un rôle parmi les 19 disponibles
4. Explorer tous les modules

### **Mode Production**
1. Ouvrir l'application
2. Sélectionner "Mode Production"
3. Se connecter avec Appwrite
4. Gérer les données réelles

## 🎯 **Fonctionnalités Avancées**

### **Gestion des Projets**
- Interface ultra-moderne avec cartes interactives
- Gestion d'équipe avec rôles et compétences
- Suivi de progression en temps réel
- Filtres et recherche avancés
- Vues multiples (Grille, Liste, Kanban)

### **Authentification Hybride**
- Mode Démo pour les démonstrations
- Mode Production pour l'utilisation réelle
- 19 rôles avec permissions granulaires
- Gestion des sessions et sécurité

### **Interconnexion des Modules**
- Données partagées entre modules
- Navigation fluide
- Synchronisation en temps réel
- Persistance des données

## 📞 **Support**

Pour toute question ou problème :
1. Vérifier la configuration Appwrite
2. Vérifier les variables d'environnement
3. Consulter la documentation
4. Contacter le support technique

## 🎉 **Déploiement Automatique**

Ce projet est configuré pour le déploiement automatique :
- **GitHub** : Repository source
- **Netlify** : Déploiement automatique
- **Appwrite** : Backend et base de données

Chaque push vers GitHub déclenche automatiquement un déploiement sur Netlify.

---

**Ecosystia Workflow - Gérez votre entreprise avec style !** 🚀