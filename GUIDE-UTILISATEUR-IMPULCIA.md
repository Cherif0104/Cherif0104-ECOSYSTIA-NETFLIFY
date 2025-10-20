# 📚 GUIDE UTILISATEUR - ERP SENEGEL

**Client** : IMPULCIA  
**Version** : 1.0.0  
**Date** : 13 octobre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Modules disponibles](#modules-disponibles)
4. [Guide par module](#guide-par-module)
5. [Rôles et permissions](#rôles-et-permissions)
6. [Questions fréquentes](#questions-fréquentes)

---

## 🎯 INTRODUCTION

**ERP SENEGEL** est une plateforme complète de gestion d'entreprise qui intègre 16 modules pour gérer tous les aspects de votre organisation.

### Caractéristiques principales

- ✅ **16 modules intégrés** - Gestion complète de l'entreprise
- ✅ **Synchronisation temps réel** - Collaboration instantanée
- ✅ **Multi-rôles** - 15+ rôles utilisateur
- ✅ **Sécurisé** - Authentification JWT + RBAC
- ✅ **Multilingue** - Français, Anglais, Wolof
- ✅ **Responsive** - Fonctionne sur tous les appareils

---

## 🚀 PREMIERS PAS

### 1. Accéder à l'application

**URL** : https://ecosystia.vercel.app (ou http://localhost:5173 en local)

### 2. Se connecter

#### Credentials par défaut

| Rôle | Email | Password |
|------|-------|----------|
| **Administrateur** | admin@ecosystia.com | Admin123! |
| **Manager** | manager@ecosystia.com | password123 |
| **Développeur** | developer@ecosystia.com | password123 |
| **Utilisateur** | user@ecosystia.com | password123 |

**⚠️ Important** : Changez votre mot de passe après la première connexion.

### 3. Changer votre mot de passe

1. Cliquer sur votre avatar en haut à droite
2. Sélectionner **"Profil"**
3. Cliquer sur **"Changer le mot de passe"**
4. Entrer le nouveau mot de passe
5. Confirmer

### 4. Interface principale

L'interface est divisée en 3 zones :

```
┌─────────────────────────────────────────┐
│  Header (Logo, Recherche, Profil)      │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  Zone de contenu principale     │
│ bar  │  (Dashboard, Modules)           │
│      │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

---

## 📦 MODULES DISPONIBLES

### Vue d'ensemble

| Module | Icône | Description | Rôles autorisés |
|--------|-------|-------------|-----------------|
| **Dashboard** | 📊 | Tableau de bord principal | Tous |
| **Projects** | 📁 | Gestion de projets | Admin, Manager, Chef de projet |
| **Tasks** | ✅ | Gestion de tâches | Tous |
| **Finance** | 💰 | Gestion financière | Admin, Finance Manager |
| **HR** | 👥 | Ressources humaines | Admin, HR Manager |
| **CRM** | 📞 | Gestion clients | Admin, Sales, Marketing |
| **Time Tracking** | ⏱️ | Suivi du temps | Tous |
| **Documents** | 📄 | Gestion documentaire | Tous |
| **Learning** | 🎓 | Plateforme de formation | Enseignants, Étudiants |
| **Jobs** | 💼 | Plateforme d'emploi | Admin, HR Manager |
| **Reports** | 📈 | Rapports et analytics | Admin, Managers |
| **Settings** | ⚙️ | Paramètres | Admin |
| **Calendar** | 📅 | Calendrier | Tous |
| **Messages** | 💬 | Messagerie | Tous |
| **Notifications** | 🔔 | Centre de notifications | Tous |
| **Profile** | 👤 | Profil utilisateur | Tous |

---

## 📘 GUIDE PAR MODULE

### 1. 📊 DASHBOARD (Tableau de bord)

**Description** : Vue d'ensemble de l'activité

**Fonctionnalités** :
- Statistiques en temps réel
- Graphiques de performance
- Activités récentes
- Alertes et notifications
- Raccourcis vers les modules

**Comment l'utiliser** :
1. Cliquer sur **"Dashboard"** dans la sidebar
2. Consulter les KPIs principaux
3. Utiliser les filtres (période, département, etc.)
4. Cliquer sur un widget pour accéder au module correspondant

---

### 2. 📁 PROJECTS (Gestion de projets)

**Description** : Gestion complète des projets

**Fonctionnalités** :
- Créer/Modifier/Supprimer des projets
- Assigner des tâches
- Suivre l'avancement
- Gérer les risques
- Collaborer en temps réel

**Comment créer un projet** :
1. Aller dans **"Projects"**
2. Cliquer sur **"+ Nouveau Projet"**
3. Remplir le formulaire :
   - Nom du projet
   - Description
   - Date de début/fin
   - Budget
   - Priorité
   - Chef de projet
4. Cliquer sur **"Créer"**

**Comment ajouter une tâche** :
1. Ouvrir un projet
2. Cliquer sur **"+ Nouvelle Tâche"**
3. Remplir les détails
4. Assigner à un membre
5. Définir la date limite
6. Cliquer sur **"Ajouter"**

---

### 3. 💰 FINANCE (Gestion financière)

**Description** : Gestion des finances de l'entreprise

**Fonctionnalités** :
- Factures (création, envoi, suivi)
- Dépenses (catégorisation, validation)
- Budgets (planification, suivi)
- Récurrences (factures/dépenses automatiques)
- Rapports financiers

**Comment créer une facture** :
1. Aller dans **"Finance"** → **"Factures"**
2. Cliquer sur **"+ Nouvelle Facture"**
3. Remplir :
   - Numéro de facture
   - Client
   - Montant
   - Date d'échéance
   - Description
4. Ajouter des lignes (produits/services)
5. Cliquer sur **"Créer et Envoyer"**

**Comment gérer un budget** :
1. Aller dans **"Finance"** → **"Budgets"**
2. Cliquer sur **"+ Nouveau Budget"**
3. Définir :
   - Période (mensuel, annuel)
   - Catégories
   - Montants alloués
4. Suivre l'évolution en temps réel

---

### 4. 👥 HR (Ressources Humaines)

**Description** : Gestion du personnel

**Fonctionnalités** :
- Gestion des employés
- Demandes de congé
- Évaluations de performance
- Formation et développement
- Suivi des absences

**Comment soumettre une demande de congé** :
1. Aller dans **"HR"** → **"Congés"**
2. Cliquer sur **"+ Nouvelle Demande"**
3. Sélectionner :
   - Type de congé (annuel, maladie, etc.)
   - Date de début
   - Date de fin
   - Raison
4. Cliquer sur **"Soumettre"**

**Comment approuver une demande (Manager)** :
1. Aller dans **"HR"** → **"Demandes en attente"**
2. Consulter la demande
3. Cliquer sur **"Approuver"** ou **"Rejeter"**
4. Ajouter un commentaire (optionnel)

---

### 5. 📞 CRM (Gestion clients)

**Description** : Gestion de la relation client

**Fonctionnalités** :
- Gestion des contacts
- Pipeline de vente
- Suivi des opportunités
- Historique des interactions
- Rapports de vente

**Comment ajouter un contact** :
1. Aller dans **"CRM"** → **"Contacts"**
2. Cliquer sur **"+ Nouveau Contact"**
3. Remplir :
   - Nom
   - Email
   - Téléphone
   - Entreprise
   - Adresse
4. Ajouter des tags
5. Cliquer sur **"Créer"**

**Comment gérer un lead** :
1. Aller dans **"CRM"** → **"Leads"**
2. Créer un nouveau lead
3. Le faire progresser dans le pipeline :
   - Prospect → Qualifié → Négociation → Gagné/Perdu
4. Ajouter des notes à chaque étape

---

### 6. ⏱️ TIME TRACKING (Suivi du temps)

**Description** : Suivi du temps de travail

**Fonctionnalités** :
- Logger le temps par projet/tâche
- Timer intégré
- Rapports de productivité
- Validation par manager
- Export des rapports

**Comment logger du temps** :
1. Aller dans **"Time Tracking"**
2. Cliquer sur **"+ Log Time"**
3. Sélectionner :
   - Projet
   - Tâche
   - Nombre d'heures
   - Date
   - Description
4. Cliquer sur **"Enregistrer"**

**Utiliser le timer** :
1. Cliquer sur **"Start Timer"**
2. Sélectionner le projet/tâche
3. Travailler...
4. Cliquer sur **"Stop"**
5. Le temps est automatiquement enregistré

---

### 7. 📄 DOCUMENTS (Gestion documentaire)

**Description** : Stockage et partage de documents

**Fonctionnalités** :
- Upload de fichiers
- Organisation en dossiers
- Partage avec permissions
- Versioning
- Recherche avancée

**Comment uploader un document** :
1. Aller dans **"Documents"**
2. Cliquer sur **"+ Upload"**
3. Sélectionner le fichier
4. Choisir le dossier
5. Définir les permissions
6. Cliquer sur **"Upload"**

---

### 8. 🎓 LEARNING (Plateforme de formation)

**Description** : Gestion des formations

**Fonctionnalités** :
- Catalogue de cours
- Inscriptions
- Suivi de progression
- Évaluations
- Certifications

**Comment s'inscrire à un cours (Étudiant)** :
1. Aller dans **"Learning"** → **"Cours"**
2. Parcourir le catalogue
3. Cliquer sur un cours
4. Cliquer sur **"S'inscrire"**
5. Commencer la formation

**Comment créer un cours (Enseignant)** :
1. Aller dans **"Learning"** → **"Mes Cours"**
2. Cliquer sur **"+ Nouveau Cours"**
3. Remplir :
   - Titre
   - Description
   - Niveau
   - Durée
   - Prix (optionnel)
4. Ajouter des modules/leçons
5. Publier

---

### 9. 💼 JOBS (Plateforme d'emploi)

**Description** : Gestion des offres d'emploi

**Fonctionnalités** :
- Publier des offres
- Gérer les candidatures
- Processus de recrutement
- Évaluation des candidats

**Comment publier une offre** :
1. Aller dans **"Jobs"**
2. Cliquer sur **"+ Nouvelle Offre"**
3. Remplir :
   - Titre du poste
   - Description
   - Exigences
   - Salaire
   - Localisation
4. Publier

---

### 10. 📈 REPORTS (Rapports)

**Description** : Rapports et analytics

**Fonctionnalités** :
- Rapports prédéfinis
- Création de rapports personnalisés
- Export PDF/Excel
- Graphiques interactifs
- Planification de rapports

**Comment générer un rapport** :
1. Aller dans **"Reports"**
2. Sélectionner un type de rapport
3. Définir les filtres (période, département, etc.)
4. Cliquer sur **"Générer"**
5. Exporter en PDF/Excel si nécessaire

---

## 🔐 RÔLES ET PERMISSIONS

### Hiérarchie des rôles

```
Super Admin
    ├── Administrateur
    │   ├── Manager
    │   ├── Finance Manager
    │   ├── HR Manager
    │   ├── Sales Manager
    │   └── Marketing Manager
    ├── Chef de projet
    ├── Développeur
    ├── Designer
    ├── Enseignant
    ├── Étudiant
    └── Utilisateur
```

### Permissions par module

| Module | Admin | Manager | Utilisateur | Étudiant |
|--------|-------|---------|-------------|----------|
| Dashboard | ✅ Complet | ✅ Complet | ✅ Lecture | ✅ Lecture |
| Projects | ✅ Complet | ✅ Complet | ✅ Lecture | ❌ |
| Finance | ✅ Complet | ❌ | ❌ | ❌ |
| HR | ✅ Complet | ✅ Lecture | ✅ Personnel | ❌ |
| CRM | ✅ Complet | ✅ Complet | ✅ Lecture | ❌ |
| Learning | ✅ Complet | ✅ Lecture | ✅ Lecture | ✅ Inscription |

---

## ❓ QUESTIONS FRÉQUENTES

### 1. Comment réinitialiser mon mot de passe ?

1. Sur la page de connexion, cliquer sur **"Mot de passe oublié ?"**
2. Entrer votre email
3. Vérifier votre boîte mail
4. Cliquer sur le lien de réinitialisation
5. Définir un nouveau mot de passe

### 2. Les données sont-elles sauvegardées automatiquement ?

Oui, toutes les données sont **sauvegardées automatiquement** dans Appwrite dès que vous cliquez sur "Enregistrer" ou "Créer".

### 3. Puis-je travailler hors ligne ?

Actuellement, l'application nécessite une connexion internet. Une version offline est prévue dans la Phase 2.

### 4. Comment inviter un nouvel utilisateur ?

1. Aller dans **"Settings"** → **"Utilisateurs"**
2. Cliquer sur **"+ Inviter un utilisateur"**
3. Entrer l'email
4. Sélectionner le rôle
5. Cliquer sur **"Envoyer l'invitation"**

### 5. Comment exporter des données ?

1. Aller dans le module concerné (Projects, Finance, etc.)
2. Cliquer sur **"Export"**
3. Choisir le format (PDF, Excel, CSV)
4. Télécharger le fichier

### 6. Comment changer la langue ?

1. Cliquer sur le sélecteur de langue en haut à droite
2. Choisir : Français, English, ou Wolof

### 7. Les modifications sont-elles visibles en temps réel ?

Oui ! Grâce à la **synchronisation temps réel**, les modifications sont visibles instantanément pour tous les utilisateurs connectés.

---

## 📞 SUPPORT

### En cas de problème

1. **Consulter la documentation** : `GUIDE-INSTALLATION-IMPULCIA.md`
2. **Contacter le support** :
   - Email : contact@impulcia-afrique.com
   - Téléphone : +221 78 832 40 69
3. **Horaires** : Lundi-Vendredi, 9h-18h GMT

---

## 🎉 FÉLICITATIONS !

Vous êtes prêt à utiliser **ERP SENEGEL** !

**Prochaines étapes** :
1. ✅ Explorer les différents modules
2. ✅ Créer votre premier projet
3. ✅ Inviter votre équipe
4. ✅ Commencer à collaborer en temps réel

---

**Date de création** : 13 octobre 2025  
**Version** : 1.0.0  
**Client** : IMPULCIA  
**Statut** : ✅ **PRÊT À L'EMPLOI**

