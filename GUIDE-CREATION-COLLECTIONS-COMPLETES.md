# 📚 Guide de Création des Collections Appwrite Complètes

## 📅 Date : 15 Octobre 2025

---

## 🎯 Objectif

Créer les 6 collections Appwrite manquantes pour compléter l'infrastructure backend de l'application Ecosystia.

---

## 📋 Collections à Créer

| # | Collection | Script | Attributs | État |
|---|------------|--------|-----------|------|
| 1 | `jobs` | `createJobsCollections.ts` | 15 | ⏳ À créer |
| 2 | `job_applications` | `createJobsCollections.ts` | 11 | ⏳ À créer |
| 3 | `knowledge_articles` | `createKnowledgeBaseCollections.ts` | 12 | ⏳ À créer |
| 4 | `knowledge_categories` | `createKnowledgeBaseCollections.ts` | 4 | ⏳ À créer |
| 5 | `leave_requests` | `createLeaveRequestsCollection.ts` | 10 | ⏳ À créer |
| 6 | `courses` | `createCoursesCollection.ts` | 13 | ⏳ À créer |

**Total** : 6 collections | 65 attributs

---

## 🚀 MÉTHODE 1 : Exécution des Scripts (Recommandée)

### Prérequis

1. **Node.js** installé
2. **Variables d'environnement** configurées :
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=votre_project_id
   VITE_APPWRITE_DATABASE_ID=votre_database_id
   VITE_APPWRITE_API_KEY=votre_api_key
   ```

3. **TypeScript Executor** :
   ```bash
   npm install -D tsx
   ```

### Étape 1 : Créer les Collections Jobs

```bash
npx tsx scripts/createJobsCollections.ts
```

**Résultat attendu** :
```
🚀 Création des collections Jobs & Applications...

📋 Création collection "jobs"...
✅ Collection "jobs" créée: jobs
  ✅ Attribut "title" créé
  ✅ Attribut "company" créé
  ... (15 attributs)

📋 Création collection "job_applications"...
✅ Collection "job_applications" créée: job_applications
  ✅ Attribut "jobId" créé
  ... (11 attributs)

🎉 Collections Jobs créées avec succès!
```

### Étape 2 : Créer les Collections Knowledge Base

```bash
npx tsx scripts/createKnowledgeBaseCollections.ts
```

**Résultat attendu** :
```
🚀 Création des collections Knowledge Base...

📋 Création collection "knowledge_articles"...
✅ Collection "knowledge_articles" créée
  ... (12 attributs)

📋 Création collection "knowledge_categories"...
✅ Collection "knowledge_categories" créée
  ... (4 attributs)

🎉 Collections Knowledge Base créées avec succès!
```

### Étape 3 : Créer la Collection Leave Requests

```bash
npx tsx scripts/createLeaveRequestsCollection.ts
```

### Étape 4 : Créer la Collection Courses

```bash
npx tsx scripts/createCoursesCollection.ts
```

### Étape 5 : Vérification

Aller sur Appwrite Console → Database → Vérifier que les 6 nouvelles collections apparaissent.

---

## 🛠️ MÉTHODE 2 : Création Manuelle (Alternative)

Si les scripts ne fonctionnent pas, créer manuellement via Appwrite Console :

### Collection 1 : jobs

**Permissions** :
- Read: Any
- Create/Update/Delete: Users

**Attributs** :

| Clé | Type | Taille | Requis | Options |
|-----|------|--------|--------|---------|
| title | String | 255 | ✅ | - |
| company | String | 255 | ✅ | - |
| location | String | 255 | ✅ | - |
| type | Enum | - | ✅ | Full-time, Part-time, Contract, CDI, CDD |
| postedDate | String | 50 | ✅ | - |
| description | String | 10000 | ✅ | - |
| requiredSkills | String[] | 100 | ❌ | Array |
| department | String | 100 | ✅ | - |
| level | Enum | - | ✅ | junior, intermediate, senior, expert |
| salary | String | 500 | ✅ | JSON |
| status | Enum | - | ✅ | open, closed, paused |
| requirements | String[] | 100 | ❌ | Array |
| benefits | String[] | 100 | ❌ | Array |
| applicationsCount | Integer | - | ❌ | Default: 0 |
| deadline | String | 50 | ✅ | - |

**Index** :
- `status_index` : status (ASC)

### Collection 2 : job_applications

**Attributs** :

| Clé | Type | Taille | Requis |
|-----|------|--------|--------|
| jobId | String | 100 | ✅ |
| candidateName | String | 255 | ✅ |
| candidateEmail | String | 255 | ✅ |
| candidatePhone | String | 50 | ✅ |
| resume | String | 1000 | ✅ |
| coverLetter | String | 10000 | ✅ |
| status | Enum | - | ✅ |
| experience | Integer | - | ✅ |
| skills | String[] | 100 | ❌ |
| appliedAt | String | 50 | ✅ |
| notes | String | 5000 | ❌ |

**Enum status** : pending, reviewed, interviewed, accepted, rejected

**Index** :
- `jobId_index` : jobId (ASC)

### Collection 3 : knowledge_articles

**Attributs** :

| Clé | Type | Taille | Requis | Default |
|-----|------|--------|--------|---------|
| title | String | 500 | ✅ | - |
| content | String | 50000 | ✅ | - |
| summary | String | 500 | ✅ | - |
| category | String | 100 | ✅ | - |
| type | Enum | - | ✅ | article, tutorial, faq, guide |
| status | Enum | - | ✅ | published, draft, archived |
| tags | String[] | 100 | ❌ | - |
| author | String | 255 | ✅ | - |
| views | Integer | - | ❌ | 0 |
| rating | Integer | - | ❌ | 0 |
| helpful | Integer | - | ❌ | 0 |
| lastViewed | String | 50 | ❌ | - |

**Index** :
- `category_index` : category (ASC)

### Collection 4 : knowledge_categories

**Attributs** :

| Clé | Type | Taille | Requis | Default |
|-----|------|--------|--------|---------|
| name | String | 100 | ✅ | - |
| description | String | 1000 | ❌ | - |
| color | Enum | - | ✅ | blue, green, purple, orange, red |
| articleCount | Integer | - | ❌ | 0 |

### Collection 5 : leave_requests

**Attributs** :

| Clé | Type | Taille | Requis |
|-----|------|--------|--------|
| userId | String | 100 | ✅ |
| type | Enum | - | ✅ |
| startDate | String | 50 | ✅ |
| endDate | String | 50 | ✅ |
| days | Integer | - | ✅ |
| status | Enum | - | ✅ |
| reason | String | 2000 | ❌ |
| approvedBy | String | 100 | ❌ |
| approvedAt | String | 50 | ❌ |
| rejectionReason | String | 1000 | ❌ |

**Enum type** : Annual Leave, Sick Leave, Personal Leave, Maternity Leave, Paternity Leave, Unpaid Leave

**Enum status** : Pending, Approved, Rejected

**Index** :
- `userId_index` : userId (ASC)
- `status_index` : status (ASC)

### Collection 6 : courses

**Attributs** :

| Clé | Type | Taille | Requis | Default |
|-----|------|--------|--------|---------|
| title | String | 500 | ✅ | - |
| instructor | String | 255 | ✅ | - |
| description | String | 10000 | ✅ | - |
| duration | Integer | - | ✅ | - |
| level | Enum | - | ✅ | beginner, intermediate, advanced |
| category | String | 100 | ✅ | - |
| status | Enum | - | ✅ | draft, active, completed |
| rating | Integer | - | ❌ | 0 |
| studentsCount | Integer | - | ❌ | 0 |
| price | Integer | - | ✅ | - |
| icon | String | 100 | ❌ | - |
| lessons | String | 50000 | ❌ | - |
| modules | String | 50000 | ❌ | - |

**Index** :
- `category_index` : category (ASC)
- `status_index` : status (ASC)

---

## ✅ Vérification Post-Création

### 1. Vérifier dans Appwrite Console

1. Aller sur https://cloud.appwrite.io
2. Sélectionner votre projet
3. Aller dans Database
4. Vérifier que les 16 collections existent :

**Collections Existantes** :
- ✅ projects
- ✅ invoices
- ✅ expenses
- ✅ budgets
- ✅ contacts
- ✅ crm_clients
- ✅ objectives
- ✅ key_results
- ✅ course_enrollments
- ✅ time_logs

**Collections Nouvelles** :
- ⏳ jobs
- ⏳ job_applications
- ⏳ knowledge_articles
- ⏳ knowledge_categories
- ⏳ leave_requests
- ⏳ courses

### 2. Tester les Services

```typescript
// Test jobsService
import { jobsService } from './services/jobsService';

const testJob = await jobsService.createJob({
  title: 'Développeur React',
  company: 'TechCorp',
  location: 'Dakar',
  type: 'CDI',
  postedDate: '2025-10-15',
  description: 'Nous recherchons un développeur React expérimenté',
  requiredSkills: ['React', 'TypeScript'],
  department: 'Informatique',
  level: 'senior',
  salary: { min: 800000, max: 1500000, currency: 'XOF' },
  status: 'open',
  requirements: ['Bac+5', '5 ans d\'expérience'],
  benefits: ['Assurance', 'Télétravail'],
  applicationsCount: 0,
  deadline: new Date('2025-12-31')
});

console.log('✅ Job créé:', testJob);

// Test knowledgeBaseService
import { knowledgeBaseService } from './services/knowledgeBaseService';

const testArticle = await knowledgeBaseService.createArticle({
  title: 'Guide React Hooks',
  content: 'Lorem ipsum...',
  summary: 'Guide complet des React Hooks',
  category: 'Développement',
  type: 'tutorial',
  status: 'published',
  tags: ['React', 'Hooks', 'JavaScript'],
  author: 'Jean Sénégal',
  views: 0,
  rating: 0,
  helpful: 0
});

console.log('✅ Article créé:', testArticle);
```

---

## 🐛 Troubleshooting

### Erreur : "Collection already exists"

Si une collection existe déjà, supprimer d'abord via Appwrite Console ou modifier le script pour ne créer que les attributs manquants.

### Erreur : "Attribute already exists"

Normal si le script est réexécuté. Les attributs existants sont conservés.

### Erreur : "Invalid API key"

Vérifier que `VITE_APPWRITE_API_KEY` est correctement défini dans `.env`.

### Erreur : "Database not found"

Vérifier que `VITE_APPWRITE_DATABASE_ID` correspond à votre database Appwrite.

---

## 📊 État Final Après Création

### Collections Totales : 16

#### Core Business (10)
1. ✅ projects
2. ✅ invoices
3. ✅ expenses
4. ✅ budgets
5. ✅ contacts
6. ✅ crm_clients (leads)
7. ✅ objectives
8. ✅ key_results
9. ✅ time_logs
10. ✅ course_enrollments

#### Nouvelles Collections (6)
11. ⏳ jobs
12. ⏳ job_applications
13. ⏳ knowledge_articles
14. ⏳ knowledge_categories
15. ⏳ leave_requests
16. ⏳ courses

---

## 🔄 Ordre d'Exécution Recommandé

```bash
# 1. Jobs (le plus important - Recrutement)
npx tsx scripts/createJobsCollections.ts

# 2. Knowledge Base (Documentation)
npx tsx scripts/createKnowledgeBaseCollections.ts

# 3. Leave Requests (RH)
npx tsx scripts/createLeaveRequestsCollection.ts

# 4. Courses (E-learning)
npx tsx scripts/createCoursesCollection.ts
```

**Temps total estimé** : ~10-15 minutes (avec les pauses entre attributs)

---

## 🎓 Utilisation Post-Création

### Formulaires Disponibles

Après création des collections, tous ces formulaires seront opérationnels :

#### Module Jobs
- ✅ **JobFormModal** - Créer/Modifier offres
- ✅ **ApplicationFormModal** - Gérer candidatures

#### Module Knowledge Base
- ✅ **ArticleFormModal** - Créer/Modifier articles
- ✅ **CategoryFormModal** - Gérer catégories

#### Module Courses
- ✅ **CourseFormModal** - Créer/Modifier cours
- ✅ **LessonFormModal** - Gérer leçons

#### Module Time Tracking
- ✅ **TimeEntryFormModal** - Logger temps

#### Module CRM
- ✅ **InteractionFormModal** - Logger interactions

---

## 📝 Checklist de Validation

Après exécution de tous les scripts :

- [ ] 6 nouvelles collections visibles dans Appwrite Console
- [ ] Tous les attributs créés sans erreur
- [ ] Index créés correctement
- [ ] Permissions configurées
- [ ] Test de création d'un document dans chaque collection
- [ ] Services backend fonctionnent (getJobs(), createJob(), etc.)
- [ ] Formulaires s'ouvrent et se soumettent
- [ ] Données apparaissent dans l'interface

---

## 🎯 Migration des Données Mock

Une fois les collections créées, migrer les données mock existantes :

### Jobs
```typescript
// Migrer mockJobs vers Appwrite
import { mockJobs } from './constants/data';

for (const job of mockJobs) {
  await jobsService.createJob(job);
}
```

### Courses
```typescript
// Migrer mockCourses vers Appwrite
import { mockCourses } from './constants/data';

for (const course of mockCourses) {
  await courseService.createCourse(course);
}
```

### Leave Requests
```typescript
// Migrer mockLeaveRequests vers Appwrite
import { mockLeaveRequests } from './constants/data';

for (const request of mockLeaveRequests) {
  await leaveService.createLeaveRequest(request);
}
```

---

## 🔐 Sécurité & Permissions

### Permissions par Collection

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| jobs | Any | Users | Users | Users |
| job_applications | Any | Any | Users | Users |
| knowledge_articles | Any | Users | Users | Users |
| knowledge_categories | Any | Users | Users | Users |
| leave_requests | Any | Users | Users | Users |
| courses | Any | Users | Users | Users |

**Note** : `Any` = accessible même non connecté (lecture publique)
**Note** : `Users` = nécessite authentification

---

## 📈 Impact Business

### Avant
❌ 6 collections manquantes  
❌ Données en mock  
❌ Pas de persistance cloud  
❌ Formulaires incomplets  

### Après
✅ **16 collections** Appwrite opérationnelles  
✅ **Persistance cloud** complète  
✅ **Formulaires complets** avec validation  
✅ **Services backend** tous fonctionnels  
✅ **CRUD 100%** opérationnel  

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Backup automatique** : Configurer sauvegardes régulières
2. **Monitoring** : Ajouter monitoring Appwrite
3. **Optimisation** : Index supplémentaires si besoin
4. **Relations** : Utiliser les relations Appwrite natives
5. **Webhooks** : Notifications automatiques

---

## 📞 Support

En cas de problème :

1. Vérifier les logs console
2. Vérifier Appwrite Console → Database
3. Vérifier variables d'environnement
4. Consulter documentation Appwrite : https://appwrite.io/docs

---

**Créé le** : 15 Octobre 2025  
**Version** : 1.0  
**Projet** : Ecosystia / SENEGELE  
**Statut** : ✅ Prêt à exécuter

