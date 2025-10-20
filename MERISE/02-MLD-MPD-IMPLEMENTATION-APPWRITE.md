# 📊 MÉTHODE MERISE - ECOSYSTIA
# PARTIE 2 : MLD & MPD (MODÈLES LOGIQUE ET PHYSIQUE)

**Projet :** ECOSYSTIA  
**Backend :** Appwrite Cloud  
**Date :** 14 Octobre 2025

---

## 🎯 DU MCD AU MLD

### Transformation MCD → MLD

Le passage du MCD au MLD consiste à :
1. Transformer les entités en tables (collections Appwrite)
2. Transformer les associations en clés étrangères ou tables intermédiaires
3. Adapter aux contraintes d'Appwrite

### Spécificités Appwrite

Appwrite est une base de données NoSQL orientée document avec :
- **Collections** : Équivalent des tables
- **Documents** : Équivalent des enregistrements
- **Attributs** : Équivalent des colonnes
- **Relations** : Gérées par référence (IDs) ou embedding
- **Pas de JOIN natif** : Relations gérées côté application

---

## 📋 MODÈLE LOGIQUE DE DONNÉES (MLD)

### Stratégie de Modélisation pour Appwrite

#### Option 1 : Normalisation (Relations par ID)
```
users (id, firstName, lastName, ...)
projects (id, name, ownerId → users.id, ...)
```
**Avantages :** Pas de redondance, cohérence  
**Inconvénients :** Requêtes multiples

#### Option 2 : Dénormalisation (Embedding)
```
projects (id, name, owner{...}, teamMembers[{...}], ...)
```
**Avantages :** Une seule requête  
**Inconvénients :** Redondance, synchronisation

#### Option 3 : Hybride (Utilisée dans ECOSYSTIA)
```
projects (id, name, ownerId, team: JSON[ids], teamData: JSON[embedded])
```
**Avantages :** Équilibre performance/cohérence

---

## 📦 COLLECTIONS APPWRITE (MPD)

### Collection 1 : users

```sql
TABLE users (
  $id STRING PRIMARY KEY,
  firstName STRING(255) NOT NULL,
  lastName STRING(255) NOT NULL,
  email EMAIL(255) UNIQUE NOT NULL,
  avatar URL(500),
  role ENUM('student', 'employer', 'super_administrator', ...) NOT NULL DEFAULT 'student',
  skills TEXT,  -- JSON array as string
  phone STRING(20),
  location STRING(255),
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- UNIQUE: email
- INDEX: role

**Permissions :**
```javascript
Read: Role.any()
Create: Role.users()
Update: Role.user($id)
Delete: Role.team('admin')
```

---

### Collection 2 : projects

```sql
TABLE projects (
  $id STRING PRIMARY KEY,
  name STRING(255) NOT NULL,
  description TEXT(2000),
  status ENUM('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled') NOT NULL DEFAULT 'Not Started',
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  startDate STRING(50),
  endDate STRING(50),
  budget FLOAT DEFAULT 0,
  client STRING(255),
  ownerId STRING(50) NOT NULL,  -- FK → users.$id
  teamMembers TEXT,  -- JSON array of user IDs
  teamData TEXT,  -- JSON embedded user data (cache)
  progress INTEGER DEFAULT 0,
  tags TEXT,  -- JSON array
  category STRING(100) DEFAULT 'General',
  tasks TEXT,  -- JSON array of embedded tasks
  risks TEXT,  -- JSON array of embedded risks
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: ownerId, status, priority
- FULLTEXT: name, description

**Relations :**
- ownerId → users.$id (1:N)
- teamMembers → users.$id (N:N via JSON array)

**Permissions :**
```javascript
Read: Role.any()
Create: Role.users()
Update: Role.user(ownerId) || Role.team('manager')
Delete: Role.user(ownerId) || Role.team('admin')
```

---

### Collection 3 : tasks

```sql
TABLE tasks (
  $id STRING PRIMARY KEY,
  projectId STRING(50) NOT NULL,  -- FK → projects.$id
  text STRING(500) NOT NULL,
  status ENUM('To Do', 'In Progress', 'Done') DEFAULT 'To Do',
  priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
  assigneeId STRING(50),  -- FK → users.$id
  assigneeData TEXT,  -- JSON embedded user data (cache)
  estimatedTime FLOAT,
  loggedTime FLOAT DEFAULT 0,
  dueDate STRING(50),
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: projectId, assigneeId, status

**Relations :**
- projectId → projects.$id (N:1)
- assigneeId → users.$id (N:1)

---

### Collection 4 : risks

```sql
TABLE risks (
  $id STRING PRIMARY KEY,
  projectId STRING(50) NOT NULL,  -- FK → projects.$id
  title STRING(255) NOT NULL,
  description TEXT(1000),
  likelihood ENUM('High', 'Medium', 'Low') NOT NULL,
  impact ENUM('High', 'Medium', 'Low') NOT NULL,
  mitigationStrategy TEXT(1000),
  $createdAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: projectId, likelihood, impact

---

### Collection 5 : objectives

```sql
TABLE objectives (
  $id STRING PRIMARY KEY,
  projectId STRING(50) NOT NULL,  -- FK → projects.$id
  title STRING(255) NOT NULL,
  keyResults TEXT,  -- JSON array of embedded key results
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: projectId

**Structure keyResults (JSON) :**
```json
[
  {
    "id": "kr1",
    "title": "Augmenter les ventes",
    "current": 50,
    "target": 100,
    "unit": "unités"
  }
]
```

---

### Collection 6 : courses

```sql
TABLE courses (
  $id STRING PRIMARY KEY,
  title STRING(255) NOT NULL,
  description TEXT(2000),
  instructorId STRING(50) NOT NULL,  -- FK → users.$id
  instructorData TEXT,  -- JSON embedded user data
  duration STRING(100),
  level ENUM('Débutant', 'Intermédiaire', 'Avancé') DEFAULT 'Débutant',
  status ENUM('Brouillon', 'Actif', 'Archivé') DEFAULT 'Actif',
  icon STRING(100),
  enrolled INTEGER DEFAULT 0,
  modules TEXT,  -- JSON array of embedded modules
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: instructorId, status, level
- FULLTEXT: title, description

**Structure modules (JSON) :**
```json
[
  {
    "id": "mod1",
    "title": "Introduction",
    "lessons": [
      {
        "id": "les1",
        "title": "Bienvenue",
        "type": "video",
        "duration": "10min",
        "icon": "fa-video"
      }
    ]
  }
]
```

---

### Collection 7 : course_enrollments

```sql
TABLE course_enrollments (
  $id STRING PRIMARY KEY,
  userId STRING(50) NOT NULL,  -- FK → users.$id
  courseId STRING(50) NOT NULL,  -- FK → courses.$id
  enrolledDate STRING(50) NOT NULL,
  progress INTEGER DEFAULT 0,
  completedLessons TEXT,  -- JSON array of lesson IDs
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- UNIQUE: (userId, courseId)
- INDEX: userId, courseId

**Relations :**
- userId → users.$id (N:1)
- courseId → courses.$id (N:1)

---

### Collection 8 : jobs

```sql
TABLE jobs (
  $id STRING PRIMARY KEY,
  title STRING(255) NOT NULL,
  description TEXT(2000),
  company STRING(255) NOT NULL,
  location STRING(255),
  salary FLOAT,
  type ENUM('Full-time', 'Part-time', 'Contract') DEFAULT 'Full-time',
  status ENUM('Ouvert', 'Fermé', 'Pourvu') DEFAULT 'Ouvert',
  requirements TEXT(2000),
  requiredSkills TEXT,  -- JSON array
  postedDate STRING(50) NOT NULL,
  applicants TEXT,  -- JSON array of user IDs
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: status, type
- FULLTEXT: title, description, company

---

### Collection 9 : job_applications

```sql
TABLE job_applications (
  $id STRING PRIMARY KEY,
  userId STRING(50) NOT NULL,  -- FK → users.$id
  jobId STRING(50) NOT NULL,  -- FK → jobs.$id
  applicationDate STRING(50) NOT NULL,
  status ENUM('Pending', 'Reviewed', 'Accepted', 'Rejected') DEFAULT 'Pending',
  coverLetter TEXT(2000),
  $createdAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- UNIQUE: (userId, jobId)
- INDEX: userId, jobId, status

---

### Collection 10 : invoices

```sql
TABLE invoices (
  $id STRING PRIMARY KEY,
  invoiceNumber STRING(100) UNIQUE NOT NULL,
  clientName STRING(255) NOT NULL,
  amount FLOAT NOT NULL,
  dueDate STRING(50) NOT NULL,
  status ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Partially Paid') DEFAULT 'Draft',
  paidDate STRING(50),
  paidAmount FLOAT,
  recurringSourceId STRING(50),  -- FK → recurring_invoices.$id
  receipt TEXT,  -- JSON file data
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- UNIQUE: invoiceNumber
- INDEX: status, dueDate, recurringSourceId

---

### Collection 11 : expenses

```sql
TABLE expenses (
  $id STRING PRIMARY KEY,
  category STRING(100) NOT NULL,
  description STRING(500) NOT NULL,
  amount FLOAT NOT NULL,
  date STRING(50) NOT NULL,
  dueDate STRING(50),
  status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
  budgetItemId STRING(50),  -- FK → budget_items.$id
  recurringSourceId STRING(50),  -- FK → recurring_expenses.$id
  receipt TEXT,  -- JSON file data
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: category, status, date, budgetItemId

---

### Collection 12 : recurring_invoices

```sql
TABLE recurring_invoices (
  $id STRING PRIMARY KEY,
  clientName STRING(255) NOT NULL,
  amount FLOAT NOT NULL,
  frequency ENUM('Monthly', 'Quarterly', 'Annually') NOT NULL,
  startDate STRING(50) NOT NULL,
  endDate STRING(50),
  lastGeneratedDate STRING(50) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

---

### Collection 13 : recurring_expenses

```sql
TABLE recurring_expenses (
  $id STRING PRIMARY KEY,
  category STRING(100) NOT NULL,
  description STRING(500) NOT NULL,
  amount FLOAT NOT NULL,
  frequency ENUM('Monthly', 'Quarterly', 'Annually') NOT NULL,
  startDate STRING(50) NOT NULL,
  endDate STRING(50),
  lastGeneratedDate STRING(50) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

---

### Collection 14 : budgets

```sql
TABLE budgets (
  $id STRING PRIMARY KEY,
  title STRING(255) NOT NULL,
  type ENUM('Project', 'Office') NOT NULL,
  amount FLOAT NOT NULL,
  startDate STRING(50) NOT NULL,
  endDate STRING(50) NOT NULL,
  projectId STRING(50),  -- FK → projects.$id (optional)
  budgetLines TEXT,  -- JSON array of embedded budget lines
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Structure budgetLines (JSON) :**
```json
[
  {
    "id": "line1",
    "title": "Personnel",
    "items": [
      {
        "id": "item1",
        "description": "Salaires",
        "amount": 50000
      }
    ]
  }
]
```

---

### Collection 15 : time_logs

```sql
TABLE time_logs (
  $id STRING PRIMARY KEY,
  userId STRING(50) NOT NULL,  -- FK → users.$id
  entityType ENUM('project', 'course', 'task') NOT NULL,
  entityId STRING(50) NOT NULL,
  entityTitle STRING(255),
  date STRING(50) NOT NULL,
  duration INTEGER NOT NULL,  -- minutes
  description TEXT(1000),
  $createdAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: userId, entityType, entityId, date

---

### Collection 16 : leave_requests

```sql
TABLE leave_requests (
  $id STRING PRIMARY KEY,
  userId STRING(50) NOT NULL,  -- FK → users.$id
  userName STRING(255) NOT NULL,
  userAvatar URL(500),
  type STRING(100) NOT NULL,
  startDate STRING(50) NOT NULL,
  endDate STRING(50) NOT NULL,
  reason TEXT(1000),
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  reviewedBy STRING(50),  -- FK → users.$id
  reviewedAt STRING(50),
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

---

### Collection 17 : contacts

```sql
TABLE contacts (
  $id STRING PRIMARY KEY,
  name STRING(255) NOT NULL,
  workEmail EMAIL(255),
  personalEmail EMAIL(255),
  company STRING(255),
  status ENUM('Lead', 'Contacted', 'Prospect', 'Customer') DEFAULT 'Lead',
  avatar URL(500),
  officePhone STRING(20),
  mobilePhone STRING(20),
  whatsappNumber STRING(20),
  notes TEXT,
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

**Index :**
- PRIMARY: $id
- INDEX: status, company
- FULLTEXT: name, company

---

### Collection 18 : documents

```sql
TABLE documents (
  $id STRING PRIMARY KEY,
  title STRING(255) NOT NULL,
  content TEXT(10000) NOT NULL,
  createdBy STRING(255) NOT NULL,
  tags TEXT,  -- JSON array
  category STRING(100),
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

---

### Collection 19 : meetings

```sql
TABLE meetings (
  $id STRING PRIMARY KEY,
  title STRING(255) NOT NULL,
  startTime STRING(50) NOT NULL,  -- ISO datetime
  endTime STRING(50) NOT NULL,    -- ISO datetime
  description TEXT(2000),
  organizerId STRING(50) NOT NULL,  -- FK → users.$id
  attendees TEXT,  -- JSON array of user IDs
  attendeesData TEXT,  -- JSON embedded user data
  $createdAt DATETIME AUTO,
  $updatedAt DATETIME AUTO,
  $permissions ARRAY
)
```

---

### Collection 20 : notifications

```sql
TABLE notifications (
  $id STRING PRIMARY KEY,
  userId STRING(50) NOT NULL,  -- FK → users.$id
  message TEXT(500) NOT NULL,
  date STRING(50) NOT NULL,
  entityType ENUM('invoice', 'expense', 'project', 'task') NOT NULL,
  entityId STRING(50) NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  $createdAt DATETIME AUTO,
  $permissions ARRAY
)
```

---

## 🔐 SYSTÈME DE PERMISSIONS APPWRITE

### Modèle de Permissions

Appwrite utilise un système de permissions granulaires :

```javascript
// Exemple pour la collection 'projects'
{
  // Lecture publique
  read: [
    Permission.read(Role.any())
  ],
  
  // Création réservée aux membres
  create: [
    Permission.create(Role.users())
  ],
  
  // Mise à jour par propriétaire ou managers
  update: [
    Permission.update(Role.user(ownerId)),
    Permission.update(Role.team('managers'))
  ],
  
  // Suppression par propriétaire ou admins
  delete: [
    Permission.delete(Role.user(ownerId)),
    Permission.delete(Role.team('admins'))
  ]
}
```

### Rôles Définis

```javascript
const ROLES = {
  // Rôles système
  ANY: 'any',              // Tout le monde (anonyme inclus)
  USERS: 'users',          // Utilisateurs authentifiés
  GUESTS: 'guests',        // Utilisateurs non authentifiés
  
  // Rôles métier (teams)
  ADMIN: 'admins',
  MANAGER: 'managers',
  SUPERVISOR: 'supervisors',
  EDITOR: 'editors',
  
  // Rôle utilisateur spécifique
  USER: (userId) => `user:${userId}`
};
```

---

## 📊 DIAGRAMME MLD COMPLET

```
┌──────────────────────────────────────────────────────────┐
│                    ECOSYSTIA MLD                         │
└──────────────────────────────────────────────────────────┘

┌─────────────┐
│   USERS     │
│─────────────│      1,N        ┌──────────────┐
│ PK: $id     │◄────────────────│  PROJECTS    │
│ email       │                 │──────────────│
│ role        │   owns          │ PK: $id      │
│ ...         │                 │ FK: ownerId  │
└─────────────┘                 │ team: JSON   │
       │                        │ tasks: JSON  │
       │ N,N                    └──────────────┘
       │                              │
       │        ┌─────────────────────┘
       │        │ 1,N
       │   ┌────▼────┐
       │   │  TASKS  │
       │   │─────────│
       │   │ PK: $id │
       │   │ FK: projectId
       └───┤ FK: assigneeId
           └─────────┘

┌─────────────┐      1,N        ┌──────────────┐
│   COURSES   │◄────────────────│ ENROLLMENTS  │
│─────────────│                 │──────────────│
│ PK: $id     │                 │ PK: $id      │
│ FK: instructorId              │ FK: userId   │
│ modules: JSON                 │ FK: courseId │
└─────────────┘                 │ progress     │
                                └──────────────┘

┌──────────────┐     génère     ┌──────────────┐
│ RECURRING    │───────────────►│   INVOICES   │
│ INVOICES     │      1,N       │──────────────│
│──────────────│                │ PK: $id      │
│ PK: $id      │                │ FK: recurringSourceId
│ frequency    │                └──────────────┘
└──────────────┘

┌──────────────┐                ┌──────────────┐
│   BUDGETS    │                │  TIME_LOGS   │
│──────────────│                │──────────────│
│ PK: $id      │                │ PK: $id      │
│ FK: projectId│                │ FK: userId   │
│ lines: JSON  │                │ entityType   │
└──────────────┘                │ entityId     │
                                └──────────────┘
```

---

## ✅ VALIDATION DU MPD

### Contraintes Respectées

✅ **Intégrité référentielle**  
- Toutes les FK sont documentées
- Gestion des suppressions en cascade définie

✅ **Intégrité de domaine**  
- Types Appwrite utilisés correctement
- ENUM pour valeurs contrôlées

✅ **Performances**  
- Index sur les clés étrangères
- Index FULLTEXT sur champs recherchés
- Embedding pour réduire requêtes

✅ **Sécurité**  
- Permissions granulaires définies
- Validation côté serveur (Appwrite functions)

---

**Prochaine étape :** MCT (Modèle Conceptuel de Traitement)

**Document suivant :** `03-MCT-MOT-PROCESSUS-METIER.md`

