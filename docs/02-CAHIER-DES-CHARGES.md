# CAHIER DES CHARGES - Ecosystia
## Plan de Développement Détaillé
**Date:** 12 Octobre 2025  
**Version:** 1.0  
**Client:** [Nom du Client]  
**Développeur:** [Votre Nom]  
**Deadline:** 8 heures

---

## TABLE DES MATIÈRES
1. [Objectifs du Projet](#1-objectifs-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Schéma de Base de Données](#3-schéma-de-base-de-données)
4. [Plan de Développement par Module](#4-plan-de-développement-par-module)
5. [Spécifications des Boutons et Actions](#5-spécifications-des-boutons-et-actions)
6. [Système d'Import/Export](#6-système-dimportexport)
7. [Planning de Réalisation](#7-planning-de-réalisation)

---

## 1. OBJECTIFS DU PROJET

### 1.1 Objectif Principal
Transformer le MVP **SENEGEL WorkFlow** en application production-ready **Ecosystia** avec:
- ✅ Persistance des données (Appwrite)
- ✅ Authentification réelle
- ✅ Fonctionnalités d'import/export (PDF, Excel)
- ✅ Stabilité et performance

### 1.2 Livrables
1. ✅ Application renommée "Ecosystia"
2. ✅ Base de données Appwrite configurée et connectée
3. ✅ Toutes les données mockées migrées vers DB
4. ✅ Exports PDF/Excel sur modules clés
5. ✅ Documentation technique
6. ✅ Application déployée (ou package de déploiement)

### 1.3 Contraintes
- ⏰ Deadline: 8 heures maximum
- 🔒 Pas de modifications de l'UI existante
- 📦 Conserver tous les modules actuels
- 🚀 Focus sur la persistance et les exports

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Stack Technique

**Frontend:**
- React 19.1.0 + TypeScript
- Vite 6.3.6
- Tailwind CSS
- Gemini AI SDK

**Backend/BaaS:**
- **Appwrite** (self-hosted ou cloud)
  - Database (NoSQL)
  - Authentication
  - Storage
  - Functions (optionnel)

**Libraries à Ajouter:**
```json
{
  "appwrite": "^14.0.0",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0",
  "xlsx": "^0.18.5",
  "file-saver": "^2.0.5"
}
```

### 2.2 Configuration Appwrite

**Variables d'Environnement (.env):**
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=Ecosystia-project
VITE_APPWRITE_DATABASE_ID=main-database
VITE_GEMINI_API_KEY=your_gemini_key
```

**Collections à Créer:**
- users (gérée par Auth + profils étendus)
- projects
- tasks
- risks
- objectives
- key_results
- courses
- modules
- lessons
- jobs
- contacts
- documents
- time_logs
- leave_requests
- invoices
- expenses
- recurring_invoices
- recurring_expenses
- budgets
- budget_lines
- budget_items
- meetings
- notifications

---

## 3. SCHÉMA DE BASE DE DONNÉES

### 3.1 Collection: `users` (Profils Étendus)
**ID Collection:** `users_profiles`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| user_id | string | ✅ | ✅ | Lien avec Appwrite Auth |
| name | string | ✅ | ✅ | Nom complet |
| email | string | ✅ | ✅ | Email (depuis Auth) |
| avatar_url | string | ❌ | ❌ | URL avatar |
| role | enum | ✅ | ✅ | Rôle (19 valeurs) |
| skills | string[] | ❌ | ❌ | Compétences |
| phone | string | ❌ | ❌ | Téléphone |
| location | string | ❌ | ❌ | Localisation |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:all
- Write: user:self
- Update: user:self
- Delete: role:super_administrator

### 3.2 Collection: `projects`
**ID Collection:** `projects`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| title | string | ✅ | ✅ | Titre |
| description | string | ✅ | ❌ | Description |
| status | enum | ✅ | ✅ | Not Started, In Progress, Completed |
| due_date | datetime | ✅ | ✅ | Date d'échéance |
| team_ids | string[] | ✅ | ✅ | IDs membres équipe |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:all (si membre ou manager)
- Create: role:manager, role:administrator, role:super_administrator, role:entrepreneur
- Update: team_ids + managers
- Delete: role:super_administrator, created_by

**Relations:**
- → tasks (1:N)
- → risks (1:N)
- → objectives (1:N)

### 3.3 Collection: `tasks`
**ID Collection:** `tasks`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| project_id | string | ✅ | ✅ | ID projet parent |
| text | string | ✅ | ✅ | Texte tâche |
| status | enum | ✅ | ✅ | To Do, In Progress, Done |
| priority | enum | ✅ | ✅ | High, Medium, Low |
| assignee_id | string | ❌ | ✅ | ID assigné |
| estimated_time | integer | ❌ | ❌ | Temps estimé (min) |
| logged_time | integer | ❌ | ❌ | Temps logué (min) |
| due_date | datetime | ❌ | ✅ | Date d'échéance |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: projet.team_ids + managers
- Create: projet.team_ids + managers
- Update: assignee_id + projet.team_ids + managers
- Delete: managers

### 3.4 Collection: `risks`
**ID Collection:** `risks`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| project_id | string | ✅ | ✅ | ID projet parent |
| description | string | ✅ | ❌ | Description risque |
| likelihood | enum | ✅ | ✅ | High, Medium, Low |
| impact | enum | ✅ | ✅ | High, Medium, Low |
| mitigation_strategy | string | ✅ | ❌ | Stratégie mitigation |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: projet.team_ids + managers
- Create/Update/Delete: managers

### 3.5 Collection: `objectives`
**ID Collection:** `objectives`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| project_id | string | ✅ | ✅ | ID projet lié |
| title | string | ✅ | ✅ | Titre objectif |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: projet.team_ids + managers
- Create/Update/Delete: projet.team_ids + managers

**Relations:**
- → key_results (1:N)

### 3.6 Collection: `key_results`
**ID Collection:** `key_results`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| objective_id | string | ✅ | ✅ | ID objectif parent |
| title | string | ✅ | ❌ | Titre KR |
| current | float | ✅ | ❌ | Valeur actuelle |
| target | float | ✅ | ❌ | Valeur cible |
| unit | string | ✅ | ❌ | Unité (users, %, etc.) |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Hérite de objective

### 3.7 Collection: `courses`
**ID Collection:** `courses`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| title | string | ✅ | ✅ | Titre cours |
| instructor | string | ✅ | ✅ | Nom instructeur |
| duration | string | ✅ | ❌ | Durée (ex: "6 Weeks") |
| icon | string | ✅ | ❌ | Classe icône Font Awesome |
| description | string | ✅ | ❌ | Description |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:all
- Create/Update/Delete: role:trainer, role:manager, role:administrator, role:super_administrator

**Relations:**
- → modules (1:N)

### 3.8 Collection: `modules`
**ID Collection:** `course_modules`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| course_id | string | ✅ | ✅ | ID cours parent |
| title | string | ✅ | ❌ | Titre module |
| order | integer | ✅ | ✅ | Ordre d'affichage |

**Relations:**
- → lessons (1:N)
- → evidence_documents (1:N) - via Storage

### 3.9 Collection: `lessons`
**ID Collection:** `lessons`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| module_id | string | ✅ | ✅ | ID module parent |
| title | string | ✅ | ❌ | Titre leçon |
| type | enum | ✅ | ✅ | video, reading, quiz |
| duration | string | ✅ | ❌ | Durée estimée |
| icon | string | ✅ | ❌ | Icône |
| order | integer | ✅ | ✅ | Ordre |

### 3.10 Collection: `user_course_progress`
**ID Collection:** `user_course_progress`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| user_id | string | ✅ | ✅ | ID utilisateur |
| course_id | string | ✅ | ✅ | ID cours |
| progress | integer | ✅ | ❌ | Progression % (0-100) |
| completed_lessons | string[] | ❌ | ❌ | IDs leçons complétées |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: user:self
- Create/Update: user:self

### 3.11 Collection: `jobs`
**ID Collection:** `jobs`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| title | string | ✅ | ✅ | Titre poste |
| company | string | ✅ | ✅ | Entreprise |
| location | string | ✅ | ✅ | Localisation |
| type | enum | ✅ | ✅ | Full-time, Part-time, Contract |
| description | string | ✅ | ❌ | Description |
| required_skills | string[] | ✅ | ❌ | Compétences requises |
| applicant_ids | string[] | ❌ | ❌ | IDs candidats |
| posted_by | string | ✅ | ✅ | ID posteur |
| posted_date | datetime | ✅ | ✅ | Date publication |
| status | enum | ✅ | ✅ | Open, Closed |

**Permissions:**
- Read: role:all
- Create: role:employer, role:administrator, role:super_administrator
- Update/Delete: posted_by + administrators

### 3.12 Collection: `contacts`
**ID Collection:** `contacts`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| name | string | ✅ | ✅ | Nom contact |
| work_email | string | ✅ | ✅ | Email professionnel |
| personal_email | string | ❌ | ❌ | Email personnel |
| company | string | ✅ | ✅ | Entreprise |
| status | enum | ✅ | ✅ | Lead, Contacted, Prospect, Customer |
| avatar_url | string | ❌ | ❌ | URL avatar |
| office_phone | string | ❌ | ❌ | Tél bureau |
| mobile_phone | string | ❌ | ❌ | Tél mobile |
| whatsapp_number | string | ❌ | ❌ | WhatsApp |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:manager, role:administrator, role:super_administrator, role:entrepreneur
- Create/Update/Delete: managers

### 3.13 Collection: `documents`
**ID Collection:** `documents`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| title | string | ✅ | ✅ | Titre document |
| content | string | ✅ | ❌ | Contenu (markdown) |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:all
- Create: role:trainer, role:manager, role:administrator, role:super_administrator
- Update/Delete: created_by + administrators

### 3.14 Collection: `time_logs`
**ID Collection:** `time_logs`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| user_id | string | ✅ | ✅ | ID utilisateur |
| entity_type | enum | ✅ | ✅ | project, course, task |
| entity_id | string | ✅ | ✅ | ID entité liée |
| entity_title | string | ✅ | ❌ | Titre entité (cache) |
| date | datetime | ✅ | ✅ | Date |
| duration | integer | ✅ | ❌ | Durée (minutes) |
| description | string | ✅ | ❌ | Description |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: user:self + managers
- Create: user:self
- Update/Delete: user:self (même jour seulement)

### 3.15 Collection: `leave_requests`
**ID Collection:** `leave_requests`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| user_id | string | ✅ | ✅ | ID demandeur |
| start_date | datetime | ✅ | ✅ | Date début |
| end_date | datetime | ✅ | ✅ | Date fin |
| reason | string | ✅ | ❌ | Raison |
| status | enum | ✅ | ✅ | Pending, Approved, Rejected |
| reviewed_by | string | ❌ | ✅ | ID approbateur |
| reviewed_at | datetime | ❌ | ❌ | Date révision |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: user:self + managers
- Create: role:all
- Update: role:manager, role:supervisor, role:administrator, role:super_administrator
- Delete: user:self (si Pending)

### 3.16 Collection: `invoices`
**ID Collection:** `invoices`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| invoice_number | string | ✅ | ✅ | Numéro facture |
| client_name | string | ✅ | ✅ | Nom client |
| amount | float | ✅ | ❌ | Montant |
| due_date | datetime | ✅ | ✅ | Date d'échéance |
| status | enum | ✅ | ✅ | Draft, Sent, Paid, Overdue, Partially Paid |
| receipt_id | string | ❌ | ❌ | ID fichier reçu (Storage) |
| paid_date | datetime | ❌ | ✅ | Date paiement |
| paid_amount | float | ❌ | ❌ | Montant payé |
| recurring_source_id | string | ❌ | ✅ | ID facture récurrente |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:manager, role:administrator, role:super_administrator
- Create/Update/Delete: managers

### 3.17 Collection: `expenses`
**ID Collection:** `expenses`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| category | string | ✅ | ✅ | Catégorie |
| description | string | ✅ | ❌ | Description |
| amount | float | ✅ | ❌ | Montant |
| date | datetime | ✅ | ✅ | Date dépense |
| due_date | datetime | ❌ | ✅ | Date d'échéance |
| receipt_id | string | ❌ | ❌ | ID fichier reçu (Storage) |
| status | enum | ✅ | ✅ | Paid, Unpaid |
| budget_item_id | string | ❌ | ✅ | ID item budget lié |
| recurring_source_id | string | ❌ | ✅ | ID dépense récurrente |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Permissions:**
- Read: role:manager, role:administrator, role:super_administrator
- Create/Update/Delete: managers

### 3.18 Collection: `recurring_invoices`
**ID Collection:** `recurring_invoices`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| client_name | string | ✅ | ✅ | Nom client |
| amount | float | ✅ | ❌ | Montant |
| frequency | enum | ✅ | ✅ | Monthly, Quarterly, Annually |
| start_date | datetime | ✅ | ✅ | Date début |
| end_date | datetime | ❌ | ✅ | Date fin (optionnel) |
| last_generated_date | datetime | ✅ | ✅ | Dernière génération |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: managers
- Create/Update/Delete: managers

### 3.19 Collection: `recurring_expenses`
**ID Collection:** `recurring_expenses`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| category | string | ✅ | ✅ | Catégorie |
| description | string | ✅ | ❌ | Description |
| amount | float | ✅ | ❌ | Montant |
| frequency | enum | ✅ | ✅ | Monthly, Quarterly, Annually |
| start_date | datetime | ✅ | ✅ | Date début |
| end_date | datetime | ❌ | ✅ | Date fin (optionnel) |
| last_generated_date | datetime | ✅ | ✅ | Dernière génération |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: managers
- Create/Update/Delete: managers

### 3.20 Collection: `budgets`
**ID Collection:** `budgets`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| title | string | ✅ | ✅ | Titre budget |
| type | enum | ✅ | ✅ | Project, Office |
| amount | float | ✅ | ❌ | Montant total |
| start_date | datetime | ✅ | ✅ | Date début |
| end_date | datetime | ✅ | ✅ | Date fin |
| project_id | string | ❌ | ✅ | ID projet (si type=Project) |
| budget_lines | json | ✅ | ❌ | Structure lignes/items (JSON) |
| created_by | string | ✅ | ✅ | ID créateur |
| created_at | datetime | ✅ | ✅ | Date création |
| updated_at | datetime | ✅ | ❌ | Date MAJ |

**Note:** budget_lines stocke la structure complète (lines → items) en JSON car imbrication profonde.

**Permissions:**
- Read: managers
- Create/Update/Delete: managers

### 3.21 Collection: `meetings`
**ID Collection:** `meetings`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| title | string | ✅ | ✅ | Titre réunion |
| start_time | datetime | ✅ | ✅ | Heure début |
| end_time | datetime | ✅ | ✅ | Heure fin |
| attendee_ids | string[] | ✅ | ✅ | IDs participants |
| organizer_id | string | ✅ | ✅ | ID organisateur |
| description | string | ❌ | ❌ | Description |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: attendee_ids + organizer_id + managers
- Create: role:all
- Update/Delete: organizer_id + managers

### 3.22 Collection: `notifications`
**ID Collection:** `notifications`

| Champ | Type | Requis | Index | Description |
|-------|------|--------|-------|-------------|
| user_id | string | ✅ | ✅ | ID destinataire |
| message | string | ✅ | ❌ | Message |
| date | datetime | ✅ | ✅ | Date notification |
| entity_type | enum | ✅ | ✅ | invoice, expense, meeting, etc. |
| entity_id | string | ✅ | ✅ | ID entité liée |
| is_read | boolean | ✅ | ✅ | Lu/Non lu |
| created_at | datetime | ✅ | ✅ | Date création |

**Permissions:**
- Read: user:self
- Create: system (via Functions)
- Update: user:self (mark as read)
- Delete: user:self

---

## 4. PLAN DE DÉVELOPPEMENT PAR MODULE

*[Suite dans le prochain fichier pour éviter dépassement de tokens]*

