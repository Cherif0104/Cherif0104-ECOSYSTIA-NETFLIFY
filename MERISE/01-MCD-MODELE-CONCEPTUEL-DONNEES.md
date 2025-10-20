# 📊 MÉTHODE MERISE - ECOSYSTIA
# PARTIE 1 : MCD (MODÈLE CONCEPTUEL DE DONNÉES)

**Projet :** ECOSYSTIA - Plateforme de Gestion d'Écosystème  
**Backend :** Appwrite Cloud  
**Date :** 14 Octobre 2025  
**Version :** 1.0

---

## 🎯 INTRODUCTION À LA MÉTHODE MERISE

### Qu'est-ce que Merise ?

Merise est une méthode française de conception de systèmes d'information qui permet de :
- Modéliser les données (MCD, MLD, MPD)
- Modéliser les traitements (MCT, MOT, MPT)
- Assurer la cohérence entre données et traitements
- Faciliter la communication entre utilisateurs et développeurs

### Application à ECOSYSTIA

Nous allons appliquer Merise à ECOSYSTIA avec Appwrite comme backend pour :
- ✅ Structurer la base de données de manière optimale
- ✅ Définir les relations entre entités
- ✅ Identifier les contraintes d'intégrité
- ✅ Optimiser les performances
- ✅ Faciliter la maintenance et l'évolution

---

## 📐 NIVEAU CONCEPTUEL : MCD

Le MCD (Modèle Conceptuel de Données) représente les données du système indépendamment de toute considération technique.

### Règles de Gestion Identifiées

#### Gestion des Utilisateurs
1. Un utilisateur possède un et un seul rôle
2. Un utilisateur peut participer à plusieurs projets
3. Un utilisateur peut s'inscrire à plusieurs cours
4. Un utilisateur peut postuler à plusieurs emplois
5. Un utilisateur peut créer plusieurs projets (en tant que propriétaire)

#### Gestion des Projets
6. Un projet est créé par un utilisateur (propriétaire)
7. Un projet peut avoir plusieurs membres d'équipe
8. Un projet contient plusieurs tâches
9. Un projet peut avoir plusieurs risques
10. Un projet peut avoir plusieurs objectifs (OKR)
11. Un projet peut être lié à un budget

#### Gestion des Tâches
12. Une tâche appartient à un projet
13. Une tâche peut être assignée à un utilisateur
14. Une tâche peut avoir plusieurs journaux de temps

#### Gestion des Cours
15. Un cours a un instructeur (utilisateur)
16. Un cours contient plusieurs modules
17. Un module contient plusieurs leçons
18. Un utilisateur peut s'inscrire à plusieurs cours
19. Un utilisateur peut compléter plusieurs leçons

#### Gestion Financière
20. Une facture concerne un client
21. Une dépense appartient à une catégorie
22. Une facture peut provenir d'une facture récurrente
23. Une dépense peut provenir d'une dépense récurrente
24. Une dépense peut être liée à un poste budgétaire
25. Un budget peut être lié à un projet (optionnel)

#### Gestion RH
26. Un utilisateur peut faire plusieurs demandes de congé
27. Une demande de congé est approuvée/rejetée par un administrateur
28. Un utilisateur enregistre ses heures travaillées
29. Un journal de temps peut être lié à un projet OU un cours OU une tâche

#### Gestion CRM
30. Un contact a un statut (Lead, Prospect, Client)
31. Un contact peut être lié à plusieurs projets
32. Un contact travaille dans une entreprise

#### Gestion des Emplois
33. Une offre d'emploi peut avoir plusieurs candidats
34. Un utilisateur peut postuler à plusieurs emplois

---

## 🔷 ENTITÉS PRINCIPALES

### 1. UTILISATEUR (USER)

**Propriétés :**
- id (identifiant unique)
- firstName (prénom)
- lastName (nom)
- email (adresse email) [UNIQUE]
- avatar (URL photo)
- role (rôle système)
- skills (compétences)
- phone (téléphone)
- location (localisation)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- email unique et obligatoire
- role obligatoire
- firstName et lastName obligatoires

---

### 2. PROJET (PROJECT)

**Propriétés :**
- id (identifiant unique)
- name (nom du projet)
- description (description détaillée)
- status (statut : Not Started, In Progress, Completed, On Hold, Cancelled)
- priority (priorité : Low, Medium, High, Critical)
- startDate (date de début)
- endDate (date de fin)
- budget (budget alloué)
- progress (pourcentage progression)
- tags (étiquettes)
- category (catégorie)
- client (nom du client)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- name obligatoire
- status obligatoire
- priority obligatoire

---

### 3. TÂCHE (TASK)

**Propriétés :**
- id (identifiant unique)
- text (description de la tâche)
- status (statut : To Do, In Progress, Done)
- priority (priorité : High, Medium, Low)
- estimatedTime (temps estimé en heures)
- loggedTime (temps enregistré en heures)
- dueDate (date d'échéance)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- text obligatoire
- Doit être liée à un projet

---

### 4. RISQUE (RISK)

**Propriétés :**
- id (identifiant unique)
- title (titre du risque)
- description (description détaillée)
- likelihood (probabilité : High, Medium, Low)
- impact (impact : High, Medium, Low)
- mitigationStrategy (stratégie d'atténuation)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit être lié à un projet

---

### 5. OBJECTIF (OBJECTIVE)

**Propriétés :**
- id (identifiant unique)
- title (titre de l'objectif)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit être lié à un projet

---

### 6. RÉSULTAT CLÉ (KEY_RESULT)

**Propriétés :**
- id (identifiant unique)
- title (titre du résultat)
- current (valeur actuelle)
- target (valeur cible)
- unit (unité de mesure)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit être lié à un objectif

---

### 7. COURS (COURSE)

**Propriétés :**
- id (identifiant unique)
- title (titre du cours)
- description (description détaillée)
- duration (durée totale)
- level (niveau : Débutant, Intermédiaire, Avancé)
- status (statut : Brouillon, Actif, Archivé)
- icon (icône)
- enrolled (nombre d'inscrits)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit avoir un instructeur

---

### 8. MODULE (MODULE)

**Propriétés :**
- id (identifiant unique)
- title (titre du module)
- order (ordre d'affichage)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit être lié à un cours

---

### 9. LEÇON (LESSON)

**Propriétés :**
- id (identifiant unique)
- title (titre de la leçon)
- type (type : Video, Reading, Quiz)
- duration (durée)
- icon (icône)
- order (ordre d'affichage)
- content (contenu)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit être liée à un module

---

### 10. EMPLOI (JOB)

**Propriétés :**
- id (identifiant unique)
- title (intitulé du poste)
- description (description du poste)
- company (entreprise)
- location (localisation)
- salary (salaire)
- type (type : Full-time, Part-time, Contract)
- status (statut : Ouvert, Fermé, Pourvu)
- requirements (exigences)
- postedDate (date de publication)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- company obligatoire

---

### 11. FACTURE (INVOICE)

**Propriétés :**
- id (identifiant unique)
- invoiceNumber (numéro de facture) [UNIQUE]
- clientName (nom du client)
- amount (montant)
- dueDate (date d'échéance)
- status (statut : Draft, Sent, Paid, Overdue, Partially Paid)
- paidDate (date de paiement)
- paidAmount (montant payé)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- invoiceNumber unique et obligatoire
- clientName obligatoire
- amount obligatoire

---

### 12. DÉPENSE (EXPENSE)

**Propriétés :**
- id (identifiant unique)
- category (catégorie)
- description (description)
- amount (montant)
- date (date de la dépense)
- dueDate (date d'échéance)
- status (statut : Paid, Unpaid)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- category obligatoire
- description obligatoire
- amount obligatoire

---

### 13. FACTURE RÉCURRENTE (RECURRING_INVOICE)

**Propriétés :**
- id (identifiant unique)
- clientName (nom du client)
- amount (montant)
- frequency (fréquence : Monthly, Quarterly, Annually)
- startDate (date de début)
- endDate (date de fin)
- lastGeneratedDate (dernière génération)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- clientName obligatoire
- amount obligatoire
- frequency obligatoire

---

### 14. DÉPENSE RÉCURRENTE (RECURRING_EXPENSE)

**Propriétés :**
- id (identifiant unique)
- category (catégorie)
- description (description)
- amount (montant)
- frequency (fréquence : Monthly, Quarterly, Annually)
- startDate (date de début)
- endDate (date de fin)
- lastGeneratedDate (dernière génération)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- category obligatoire
- description obligatoire
- amount obligatoire

---

### 15. BUDGET

**Propriétés :**
- id (identifiant unique)
- title (titre du budget)
- type (type : Project, Office)
- amount (montant total)
- startDate (date de début)
- endDate (date de fin)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- type obligatoire
- amount obligatoire

---

### 16. LIGNE BUDGÉTAIRE (BUDGET_LINE)

**Propriétés :**
- id (identifiant unique)
- title (titre de la ligne)
- order (ordre d'affichage)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- Doit être liée à un budget

---

### 17. POSTE BUDGÉTAIRE (BUDGET_ITEM)

**Propriétés :**
- id (identifiant unique)
- description (description)
- amount (montant alloué)
- order (ordre d'affichage)

**Identifiant :** id  
**Contraintes :**
- description obligatoire
- amount obligatoire
- Doit être lié à une ligne budgétaire

---

### 18. JOURNAL DE TEMPS (TIME_LOG)

**Propriétés :**
- id (identifiant unique)
- entityType (type : project, course, task)
- entityTitle (titre de l'entité)
- date (date)
- duration (durée en minutes)
- description (description)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- entityType obligatoire
- date obligatoire
- duration obligatoire
- Doit être lié à un utilisateur

---

### 19. DEMANDE DE CONGÉ (LEAVE_REQUEST)

**Propriétés :**
- id (identifiant unique)
- userName (nom de l'utilisateur)
- userAvatar (avatar de l'utilisateur)
- type (type de congé)
- startDate (date de début)
- endDate (date de fin)
- reason (raison)
- status (statut : Pending, Approved, Rejected)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- type obligatoire
- startDate et endDate obligatoires
- Doit être liée à un utilisateur

---

### 20. CONTACT (CONTACT)

**Propriétés :**
- id (identifiant unique)
- name (nom du contact)
- workEmail (email professionnel)
- personalEmail (email personnel)
- company (entreprise)
- status (statut : Lead, Contacted, Prospect, Customer)
- avatar (avatar)
- officePhone (téléphone bureau)
- mobilePhone (téléphone mobile)
- whatsappNumber (numéro WhatsApp)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- name obligatoire
- Au moins un email obligatoire

---

### 21. DOCUMENT (DOCUMENT)

**Propriétés :**
- id (identifiant unique)
- title (titre)
- content (contenu)
- createdBy (créateur)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- content obligatoire

---

### 22. RÉUNION (MEETING)

**Propriétés :**
- id (identifiant unique)
- title (titre)
- startTime (heure de début)
- endTime (heure de fin)
- description (description)
- createdAt (date création)
- updatedAt (date modification)

**Identifiant :** id  
**Contraintes :**
- title obligatoire
- startTime et endTime obligatoires
- Doit avoir un organisateur

---

### 23. NOTIFICATION

**Propriétés :**
- id (identifiant unique)
- message (message)
- date (date)
- entityType (type : invoice, expense)
- isRead (lu/non lu)
- createdAt (date création)

**Identifiant :** id  
**Contraintes :**
- message obligatoire
- Doit être liée à un utilisateur

---

## 🔗 ASSOCIATIONS (RELATIONS)

### Association 1 : POSSÈDE (User ↔ Role)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un utilisateur possède un rôle, un rôle peut être attribué à plusieurs utilisateurs
- **Type :** Association simple

### Association 2 : CRÉE (User ↔ Project)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un utilisateur crée plusieurs projets, un projet est créé par un utilisateur
- **Type :** Association avec propriété (ownerId)

### Association 3 : PARTICIPE (User ↔ Project)
- **Cardinalité :** 0,N - 0,N
- **Description :** Un utilisateur peut participer à plusieurs projets, un projet peut avoir plusieurs participants
- **Type :** Association multiple (Many-to-Many)
- **Table associative :** PROJECT_MEMBERS

### Association 4 : CONTIENT_TÂCHE (Project ↔ Task)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un projet contient plusieurs tâches, une tâche appartient à un projet
- **Type :** Composition forte

### Association 5 : ASSIGNÉE_À (Task ↔ User)
- **Cardinalité :** 0,1 - 0,N
- **Description :** Une tâche peut être assignée à un utilisateur, un utilisateur peut avoir plusieurs tâches
- **Type :** Association simple

### Association 6 : A_RISQUE (Project ↔ Risk)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un projet peut avoir plusieurs risques, un risque appartient à un projet
- **Type :** Composition forte

### Association 7 : A_OBJECTIF (Project ↔ Objective)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un projet peut avoir plusieurs objectifs, un objectif appartient à un projet
- **Type :** Composition forte

### Association 8 : MESURE (Objective ↔ KeyResult)
- **Cardinalité :** 1,1 - 1,N
- **Description :** Un objectif a au moins un résultat clé, un résultat appartient à un objectif
- **Type :** Composition forte

### Association 9 : ENSEIGNE (User ↔ Course)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un utilisateur (instructeur) enseigne plusieurs cours, un cours a un instructeur
- **Type :** Association avec rôle

### Association 10 : S'INSCRIT (User ↔ Course)
- **Cardinalité :** 0,N - 0,N
- **Description :** Un utilisateur peut s'inscrire à plusieurs cours, un cours peut avoir plusieurs inscrits
- **Type :** Association multiple
- **Propriétés :** enrolledDate, progress, completedLessons

### Association 11 : CONTIENT_MODULE (Course ↔ Module)
- **Cardinalité :** 1,1 - 1,N
- **Description :** Un cours contient au moins un module, un module appartient à un cours
- **Type :** Composition forte

### Association 12 : CONTIENT_LEÇON (Module ↔ Lesson)
- **Cardinalité :** 1,1 - 1,N
- **Description :** Un module contient au moins une leçon, une leçon appartient à un module
- **Type :** Composition forte

### Association 13 : POSTULE (User ↔ Job)
- **Cardinalité :** 0,N - 0,N
- **Description :** Un utilisateur peut postuler à plusieurs emplois, un emploi peut avoir plusieurs candidats
- **Type :** Association multiple
- **Table associative :** JOB_APPLICATIONS
- **Propriétés :** applicationDate, status, coverLetter

### Association 14 : ENREGISTRE_TEMPS (User ↔ TimeLog)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un utilisateur enregistre plusieurs journaux de temps
- **Type :** Association simple

### Association 15 : TEMPS_SUR (TimeLog ↔ Project/Course/Task)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un journal de temps est lié à UN projet OU UN cours OU UNE tâche
- **Type :** Association exclusive (XOR)

### Association 16 : DEMANDE_CONGÉ (User ↔ LeaveRequest)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un utilisateur peut faire plusieurs demandes de congé
- **Type :** Association simple

### Association 17 : GÉNÈRE_FACTURE (RecurringInvoice ↔ Invoice)
- **Cardinalité :** 0,1 - 0,N
- **Description :** Une facture récurrente génère plusieurs factures
- **Type :** Association de génération

### Association 18 : GÉNÈRE_DÉPENSE (RecurringExpense ↔ Expense)
- **Cardinalité :** 0,1 - 0,N
- **Description :** Une dépense récurrente génère plusieurs dépenses
- **Type :** Association de génération

### Association 19 : A_BUDGET (Project ↔ Budget)
- **Cardinalité :** 0,1 - 0,1
- **Description :** Un projet peut avoir un budget, un budget peut être lié à un projet
- **Type :** Association optionnelle

### Association 20 : CONTIENT_LIGNE (Budget ↔ BudgetLine)
- **Cardinalité :** 1,1 - 1,N
- **Description :** Un budget contient au moins une ligne budgétaire
- **Type :** Composition forte

### Association 21 : CONTIENT_POSTE (BudgetLine ↔ BudgetItem)
- **Cardinalité :** 1,1 - 1,N
- **Description :** Une ligne budgétaire contient au moins un poste
- **Type :** Composition forte

### Association 22 : AFFECTÉE_À (Expense ↔ BudgetItem)
- **Cardinalité :** 0,1 - 0,N
- **Description :** Une dépense peut être affectée à un poste budgétaire
- **Type :** Association optionnelle

### Association 23 : ORGANISE (User ↔ Meeting)
- **Cardinalité :** 1,1 - 0,N
- **Description :** Un utilisateur organise plusieurs réunions
- **Type :** Association simple

### Association 24 : PARTICIPE_RÉUNION (User ↔ Meeting)
- **Cardinalité :** 0,N - 1,N
- **Description :** Un utilisateur participe à plusieurs réunions, une réunion a plusieurs participants
- **Type :** Association multiple

---

## 📊 DIAGRAMME MCD PRINCIPAL

```
                    ┌─────────────┐
                    │  UTILISATEUR│
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐       ┌───▼────┐       ┌───▼────┐
    │ PROJET  │       │ COURS  │       │ EMPLOI │
    └────┬────┘       └───┬────┘       └────────┘
         │                │
    ┌────┼────┐      ┌───┼────┐
    │    │    │      │   │    │
┌───▼┐ ┌─▼──┐ ┌▼───┐ │ ┌─▼──┐ │
│TÂCHE││RISQUE││OKR │ │ │MODULE│ │
└─────┘└─────┘└────┘ │ └──┬──┘ │
                      │    │    │
                      │ ┌──▼──┐ │
                      │ │LEÇON│ │
                      │ └─────┘ │
                      └─────────┘

         GESTION FINANCIÈRE
┌────────────┐  génère  ┌─────────┐
│ FACTURE    │◄─────────│RÉCURRENTE│
│ RÉCURRENTE │          │FACTURE   │
└────────────┘          └──────────┘

┌────────────┐  génère  ┌─────────┐
│ DÉPENSE    │◄─────────│RÉCURRENTE│
│ RÉCURRENTE │          │DÉPENSE   │
└────────────┘          └──────────┘

         BUDGET
    ┌────────────┐
    │   BUDGET   │
    └──────┬─────┘
           │
      ┌────▼─────┐
      │  LIGNE   │
      │BUDGÉTAIRE│
      └────┬─────┘
           │
      ┌────▼─────┐
      │   POSTE  │
      │BUDGÉTAIRE│
      └──────────┘
```

---

## ✅ VALIDATION DU MCD

### Normalisation

Le MCD respecte les formes normales :
- **1FN** : Tous les attributs sont atomiques
- **2FN** : Pas de dépendance partielle (chaque attribut dépend de la totalité de la clé)
- **3FN** : Pas de dépendance transitive

### Cohérence

- ✅ Toutes les entités ont un identifiant
- ✅ Toutes les associations ont des cardinalités définies
- ✅ Les règles de gestion sont respectées
- ✅ Pas de redondance d'information

### Contraintes d'Intégrité

1. **Intégrité d'entité** : Chaque entité a une clé primaire unique
2. **Intégrité référentielle** : Toutes les associations sont valides
3. **Intégrité de domaine** : Les valeurs respectent les types définis
4. **Intégrité de contrainte** : Les règles métier sont implémentables

---

**Prochaine étape :** MLD (Modèle Logique de Données) adapté à Appwrite

**Document suivant :** `02-MLD-MPD-IMPLEMENTATION-APPWRITE.md`

