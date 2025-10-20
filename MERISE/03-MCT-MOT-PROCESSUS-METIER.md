# 📊 MÉTHODE MERISE - ECOSYSTIA
# PARTIE 3 : MCT & MOT (MODÈLES DE TRAITEMENT)

**Projet :** ECOSYSTIA  
**Backend :** Appwrite Cloud  
**Date :** 14 Octobre 2025

---

## 🎯 MODÈLES DE TRAITEMENT

### MCT (Modèle Conceptuel de Traitement)

Le MCT décrit **QUOI** faire (les opérations métier) indépendamment de :
- Qui les fait
- Où elles sont faites
- Quand elles sont faites

### MOT (Modèle Organisationnel de Traitement)

Le MOT décrit **QUI** fait **QUOI**, **OÙ** et **QUAND**

---

## 📋 PROCESSUS MÉTIER PRINCIPAUX

### 1. GESTION DES PROJETS

#### MCT : Cycle de Vie d'un Projet

```
┌─────────────────────────────────────────────────────────────┐
│           CYCLE DE VIE PROJET - MCT                         │
└─────────────────────────────────────────────────────────────┘

[Début]
   │
   ▼
┌─────────────────────┐
│ Création Projet     │
│ - Saisir info       │
│ - Définir équipe    │
│ - Fixer budget      │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Status:      │
    │ Not Started  │
    └──────┬───────┘
           │
           ▼ [Projet lancé]
    ┌──────────────┐
    │ Status:      │
    │ In Progress  │
    └──────┬───────┘
           │
           ├──► Ajouter Tâches
           ├──► Identifier Risques
           ├──► Définir OKRs
           ├──► Enregistrer Temps
           │
           ▼ [Projet terminé]
    ┌──────────────┐
    │ Status:      │
    │ Completed    │
    └──────┬───────┘
           │
           ▼ [Clôture]
    ┌──────────────┐
    │ Archivage    │
    │ - Export PDF │
    │ - Bilan      │
    └──────────────┘
           │
           ▼
        [Fin]
```

#### MOT : Organisation de la Gestion de Projet

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Manager** | Créer projet | Application Web | À tout moment |
| **Manager** | Affecter équipe | Application Web | Lors de la création |
| **Membre Équipe** | Consulter projets | Application Web | À tout moment |
| **Membre Équipe** | Mettre à jour tâches | Application Web | Quotidiennement |
| **Manager** | Valider progression | Application Web | Hebdomadaire |
| **System** | Générer notifications | Serveur Appwrite | Quotidien (échéances) |
| **Admin** | Archiver projet | Application Web | Après complétion |

---

### 2. GESTION DES TÂCHES

#### MCT : Workflow des Tâches

```
[Début]
   │
   ▼
┌─────────────────┐
│ Créer Tâche     │
│ - Nom          │
│ - Priorité      │
│ - Échéance      │
└────────┬────────┘
         │
         ▼
   ┌──────────┐
   │ To Do    │
   └────┬─────┘
        │
        ▼ [Assignation]
┌──────────────────┐
│ Assigner à User  │
└────────┬─────────┘
         │
         ▼ [Début travail]
   ┌──────────────┐
   │ In Progress  │
   └────┬─────────┘
        │
        ├──► Log Time
        ├──► Mise à jour
        │
        ▼ [Terminée]
   ┌──────────┐
   │   Done   │
   └──────────┘
        │
        ▼
     [Fin]
```

#### MOT : Organisation des Tâches

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Manager/Supervisor** | Créer tâche | App - Module Projects | Planification |
| **Manager** | Assigner tâche | App - Module Projects | Immédiatement |
| **User Assigné** | Accepter tâche | App - Notifications | À réception |
| **User Assigné** | Mettre statut "In Progress" | App - Module Projects | Au démarrage |
| **User Assigné** | Logger le temps | App - Time Tracking | Quotidien |
| **User Assigné** | Marquer "Done" | App - Module Projects | À complétion |
| **Manager** | Valider complétion | App - Module Projects | Review sprint |

---

### 3. GESTION FINANCIÈRE

#### MCT : Processus Factures

```
[Début]
   │
   ▼
┌─────────────────────┐
│ Créer Facture       │
│ - Client            │
│ - Montant           │
│ - Échéance          │
└──────────┬──────────┘
           │
           ▼
     ┌──────────┐
     │  Draft   │
     └────┬─────┘
          │
          ▼ [Validation]
     ┌──────────┐
     │   Sent   │
     └────┬─────┘
          │
          ├──► [Échéance proche] → Notification
          │
          ▼ [Paiement reçu]
   ┌──────────────┐
   │ Enregistrer  │
   │ Paiement     │
   └──────┬───────┘
          │
          ▼
     ┌──────────┐
     │   Paid   │
     └──────────┘
          │
          ▼
       [Fin]
```

#### MCT : Factures Récurrentes

```
[Début]
   │
   ▼
┌──────────────────────┐
│ Créer Facture        │
│ Récurrente           │
│ - Fréquence          │
│ - Date début         │
│ - Date fin (opt)     │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ Active       │
    └──────┬───────┘
           │
           │ [Chaque période]
           ▼
    ┌──────────────────┐
    │ Système vérifie  │
    │ si génération    │
    │ nécessaire       │
    └──────┬───────────┘
           │
           ├──► OUI: Générer Facture
           │          │
           │          ▼
           │    ┌──────────────┐
           │    │ Nouvelle     │
           │    │ Facture      │
           │    │ Status: Sent │
           │    └──────────────┘
           │
           ├──► NON: Continuer
           │
           ▼ [Date fin atteinte]
    ┌──────────────┐
    │ Inactive     │
    └──────────────┘
           │
           ▼
        [Fin]
```

#### MOT : Organisation Finance

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Comptable/Admin** | Créer facture | App - Module Finance | À émission |
| **Comptable** | Envoyer facture | App - Module Finance | Après validation |
| **System** | Générer notifications échéance | Appwrite Functions | J-3, J-1, J (paramétrable) |
| **Comptable** | Enregistrer paiement | App - Module Finance | À réception |
| **Manager** | Consulter tableau de bord | App - Dashboard Finance | Hebdomadaire |
| **System** | Générer factures récurrentes | Appwrite Functions | Quotidien (cron) |

---

### 4. GESTION DES COURS

#### MCT : Cycle de Vie Cours

```
[Début]
   │
   ▼
┌─────────────────────┐
│ Créer Cours         │
│ - Titre             │
│ - Description       │
│ - Modules/Leçons    │
└──────────┬──────────┘
           │
           ▼
     ┌──────────┐
     │ Brouillon│
     └────┬─────┘
          │
          ▼ [Publication]
     ┌──────────┐
     │  Actif   │
     └────┬─────┘
          │
          ├──► Utilisateurs s'inscrivent
          │    │
          │    ▼
          │  ┌──────────────────┐
          │  │ Suivre Cours     │
          │  │ - Voir leçons    │
          │  │ - Compléter      │
          │  │ - Logger temps   │
          │  └──────────────────┘
          │
          ▼ [Fin de vie]
     ┌──────────┐
     │ Archivé  │
     └──────────┘
          │
          ▼
       [Fin]
```

#### MOT : Organisation Cours

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Trainer/Instructor** | Créer cours | App - Course Management | Préparation |
| **Trainer** | Ajouter modules/leçons | App - Course Management | Création contenu |
| **Admin** | Publier cours | App - Course Management | Validation |
| **Student** | S'inscrire | App - Module Courses | À volonté |
| **Student** | Suivre leçons | App - Course Detail | Apprentissage |
| **Student** | Marquer leçon complétée | App - Course Detail | Après visionnage |
| **System** | Calculer progression | Frontend (React state) | Temps réel |
| **Trainer** | Consulter statistiques | App - Analytics | Hebdomadaire |

---

### 5. GESTION RH

#### MCT : Demande de Congé

```
[Début]
   │
   ▼
┌─────────────────────┐
│ Soumettre Demande   │
│ - Type              │
│ - Dates             │
│ - Raison            │
└──────────┬──────────┘
           │
           ▼
     ┌──────────┐
     │ Pending  │
     └────┬─────┘
          │
          ├──► Notification Manager
          │
          ▼ [Review]
    ┌──────────────┐
    │ Manager      │
    │ Examine      │
    └──────┬───────┘
           │
           ├──► [Accepte]
           │    │
           │    ▼
           │  ┌──────────┐
           │  │ Approved │
           │  └──────────┘
           │       │
           │       ▼
           │    Notification User
           │
           └──► [Refuse]
                │
                ▼
              ┌──────────┐
              │ Rejected │
              └──────────┘
                   │
                   ▼
                Notification User
                   │
                   ▼
                [Fin]
```

#### MOT : Organisation RH

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Employee** | Créer demande congé | App - Leave Management | Planification |
| **System** | Notifier manager | Appwrite - Realtime | Immédiat |
| **Manager/Admin** | Examiner demande | App - Leave Management | Dans 48h |
| **Manager** | Approuver/Rejeter | App - Leave Management | Décision |
| **System** | Notifier employé | Appwrite - Realtime | Immédiat |
| **Admin** | Générer calendrier congés | App - Analytics RH | Mensuel |

---

### 6. GESTION TEMPS

#### MCT : Enregistrement Temps

```
[Début]
   │
   ▼
┌──────────────────────┐
│ Sélectionner Entité  │
│ - Projet OU          │
│ - Cours OU           │
│ - Tâche              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Saisir Temps         │
│ - Date               │
│ - Durée              │
│ - Description        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Validation           │
│ - Durée > 0          │
│ - Date valide        │
└──────────┬───────────┘
           │
           ▼ [OK]
┌──────────────────────┐
│ Enregistrement       │
│ - Créer TimeLog      │
│ - MAJ loggedTime     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Mise à Jour          │
│ - Tâche.loggedTime   │
│ - Stats Dashboard    │
└──────────────────────┘
           │
           ▼
        [Fin]
```

#### MOT : Organisation Temps

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Tous utilisateurs** | Logger temps | App - Time Tracking | Quotidien |
| **Todos utilisateurs** | Voir historique | App - Time Tracking | À volonté |
| **Manager** | Consulter temps équipe | App - Dashboard | Hebdomadaire |
| **Admin** | Exporter rapports | App - Analytics | Mensuel |
| **System** | Calculer totaux | Frontend/Backend | Temps réel |

---

### 7. GESTION CRM

#### MCT : Cycle de Vie Contact

```
[Début]
   │
   ▼
┌─────────────────────┐
│ Créer Contact       │
│ - Infos base        │
│ - Status: Lead      │
└──────────┬──────────┘
           │
           ▼
     ┌──────────┐
     │   Lead   │
     └────┬─────┘
          │
          ▼ [Premier contact]
     ┌──────────┐
     │ Contacted│
     └────┬─────┘
          │
          ▼ [Intérêt confirmé]
     ┌──────────┐
     │ Prospect │
     └────┬─────┘
          │
          ▼ [Vente conclue]
     ┌──────────┐
     │ Customer │
     └────┬─────┘
          │
          ├──► Lier à Projets
          ├──► Générer Factures
          │
          ▼
       [Fin]
```

#### MOT : Organisation CRM

| Acteur | Opération | Où | Quand |
|--------|-----------|-----|-------|
| **Sales** | Créer contact | App - CRM | Premier contact |
| **Sales** | Mettre à jour statut | App - CRM | Après chaque interaction |
| **Sales** | Ajouter notes | App - CRM | Après rendez-vous |
| **Manager** | Analyser pipeline | App - Analytics | Hebdomadaire |
| **Admin** | Exporter contacts | App - CRM | Mensuel |

---

## 🔄 PROCESSUS TRANSVERSAUX

### Authentification & Sécurité

```
┌────────────────────────────────────────┐
│     PROCESSUS AUTHENTIFICATION         │
└────────────────────────────────────────┘

[Accès App]
     │
     ▼
┌──────────────┐
│ Check Session│
└──────┬───────┘
       │
       ├──► [Session valide]
       │    │
       │    ▼
       │  ┌─────────────┐
       │  │ Rediriger   │
       │  │ Dashboard   │
       │  └─────────────┘
       │
       └──► [Pas de session]
            │
            ▼
      ┌──────────────┐
      │ Page Login   │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │ Saisir       │
      │ Credentials  │
      └──────┬───────┘
             │
             ▼
      ┌──────────────────┐
      │ Appwrite Auth    │
      │ - Vérifier email │
      │ - Vérifier pwd   │
      └──────┬───────────┘
             │
             ├──► [OK]
             │    │
             │    ▼
             │  ┌─────────────────┐
             │  │ Créer Session   │
             │  │ - Token JWT     │
             │  │ - TTL: 30min    │
             │  └────────┬────────┘
             │           │
             │           ▼
             │    ┌──────────────┐
             │    │ localStorage │
             │    │ - User data  │
             │    │ - Timestamp  │
             │    └──────┬───────┘
             │           │
             │           ▼
             │    ┌──────────────┐
             │    │ Dashboard    │
             │    └──────────────┘
             │
             └──► [Erreur]
                  │
                  ▼
            Message d'erreur
```

### Notifications Temps Réel

```
┌────────────────────────────────────────┐
│     SYSTÈME DE NOTIFICATIONS           │
└────────────────────────────────────────┘

[Événement]
     │
     ├──► Facture échéance proche
     ├──► Nouvelle tâche assignée
     ├──► Demande congé soumise
     ├──► Projet mis à jour
     │
     ▼
┌──────────────────────┐
│ Créer Notification   │
│ - Message            │
│ - Type               │
│ - UserId(s)          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Appwrite Realtime    │
│ - WebSocket          │
│ - Channel broadcast  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Frontend Reception   │
│ - Toast notification │
│ - Badge compteur     │
└──────────────────────┘
```

---

## ✅ VALIDATION DES PROCESSUS

### Cohérence MCT ↔ MCD

Chaque processus métier (MCT) utilise les entités définies dans le MCD :
- ✅ Gestion Projets → Entités: Project, Task, Risk, User
- ✅ Gestion Finance → Entités: Invoice, Expense, Budget
- ✅ Gestion Cours → Entités: Course, Module, Lesson, Enrollment
- ✅ Gestion RH → Entités: LeaveRequest, TimeLog, User

### Faisabilité Technique (Appwrite)

Tous les processus sont réalisables avec Appwrite :
- ✅ CRUD opérations → Appwrite Database API
- ✅ Authentification → Appwrite Auth
- ✅ Notifications → Appwrite Realtime
- ✅ Traitements automatiques → Appwrite Functions (cron)
- ✅ Stockage fichiers → Appwrite Storage

---

**Prochaine étape :** Architecture de Déploiement

**Document suivant :** `04-ARCHITECTURE-DEPLOIEMENT-APPWRITE.md`

