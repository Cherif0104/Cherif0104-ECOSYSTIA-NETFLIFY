# 🔄 PROGRESSION - CORRECTION PERSISTANCE MODULE PROJECTS

## 📋 **STATUT ACTUEL**

**Date :** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Phase :** Correction de la persistance Appwrite  
**Progression :** 30% ✅

---

## ✅ **TERMINÉ**

### **1. Correction des Types (types.ts)**

Tous les IDs ont été convertis de `number` à `string` pour compatibilité Appwrite :

- ✅ **User** - `id: string`
- ✅ **Course** - `id: string`
- ✅ **Job** - `id: string`
- ✅ **Task** - `id: string` (déjà fait)
- ✅ **Project** - `id: string` + nouveaux champs (priority, budget, client, tags, createdAt, updatedAt)
- ✅ **Objective** - `id: string`, `projectId: string`
- ✅ **Contact** - `id: string`
- ✅ **Document** - `id: string`
- ✅ **TimeLog** - `id: string`, `userId: string`, `entityId: string`
- ✅ **LeaveRequest** - `id: string`, `userId: string`
- ✅ **Invoice** - `id: string`, `recurringSourceId: string`
- ✅ **Expense** - `id: string`, `recurringSourceId: string`
- ✅ **RecurringInvoice** - `id: string`
- ✅ **RecurringExpense** - `id: string`
- ✅ **Budget** - `id: string`, `projectId: string`
- ✅ **Meeting** - `id: string`, `organizerId: string`
- ✅ **AppNotification** - `entityId: string`
- ✅ **Toast** - `id: string`

### **2. Amélioration du Type Project**

Nouveaux champs ajoutés :
```typescript
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';  // NOUVEAU
  dueDate: string;
  budget?: number;                                     // NOUVEAU
  client?: string;                                     // NOUVEAU
  tags: string[];                                      // NOUVEAU
  team: User[];
  tasks: Task[];
  risks: Risk[];
  createdAt?: string;                                  // NOUVEAU
  updatedAt?: string;                                  // NOUVEAU
}
```

---

## 🔨 **EN COURS / À FAIRE**

### **3. Service Projects avec Appwrite (PROCHAIN)**

Créer `services/projectService.ts` avec :

```typescript
import { databases, DATABASE_ID, COLLECTION_IDS, ID, Query } from './appwriteService';
import { Project, Task, Risk, User } from '../types';

class ProjectService {
  private collectionId = COLLECTION_IDS.PROJECTS;

  /**
   * Convertir un document Appwrite en Project
   */
  private mapFromAppwrite(doc: any): Project {
    return {
      id: doc.$id,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      priority: doc.priority || 'Medium',
      dueDate: doc.dueDate,
      budget: doc.budget,
      client: doc.client,
      tags: doc.tags ? JSON.parse(doc.tags) : [],
      team: doc.team ? JSON.parse(doc.team) : [],
      tasks: doc.tasks ? JSON.parse(doc.tasks) : [],
      risks: doc.risks ? JSON.parse(doc.risks) : [],
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  }

  /**
   * Convertir un Project en document Appwrite
   */
  private mapToAppwrite(project: Partial<Project>): any {
    return {
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority || 'Medium',
      dueDate: project.dueDate,
      budget: project.budget,
      client: project.client,
      tags: JSON.stringify(project.tags || []),
      team: JSON.stringify(project.team || []),
      tasks: JSON.stringify(project.tasks || []),
      risks: JSON.stringify(project.risks || []),
    };
  }

  /**
   * Créer un nouveau projet
   */
  async create(projectData: Omit<Project, 'id'>, userId: string): Promise<Project | null> {
    try {
      const appwriteData = this.mapToAppwrite(projectData);
      appwriteData.userId = userId; // Pour filtrage par utilisateur
      
      const response = await databases.createDocument(
        DATABASE_ID,
        this.collectionId,
        ID.unique(),
        appwriteData
      );
      
      console.log('✅ Projet créé dans Appwrite:', response.$id);
      return this.mapFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      return null;
    }
  }

  /**
   * Récupérer tous les projets d'un utilisateur
   */
  async getByUser(userId: string): Promise<Project[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      
      return response.documents.map(this.mapFromAppwrite);
    } catch (error) {
      console.error('❌ Erreur récupération projets:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les projets
   */
  async getAll(): Promise<Project[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId
      );
      
      return response.documents.map(this.mapFromAppwrite);
    } catch (error) {
      console.error('❌ Erreur récupération tous les projets:', error);
      return [];
    }
  }

  /**
   * Récupérer un projet par ID
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );
      
      return this.mapFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur récupération projet:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un projet
   */
  async update(id: string, projectData: Partial<Project>): Promise<Project | null> {
    try {
      const appwriteData = this.mapToAppwrite(projectData);
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        id,
        appwriteData
      );
      
      console.log('✅ Projet mis à jour dans Appwrite:', id);
      return this.mapFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      return null;
    }
  }

  /**
   * Supprimer un projet
   */
  async delete(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        this.collectionId,
        id
      );
      
      console.log('✅ Projet supprimé de Appwrite:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      return false;
    }
  }

  /**
   * Ajouter une tâche à un projet
   */
  async addTask(projectId: string, task: Task): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTasks = [...project.tasks, task];
      return await this.update(projectId, { tasks: updatedTasks });
    } catch (error) {
      console.error('❌ Erreur ajout tâche:', error);
      return null;
    }
  }

  /**
   * Mettre à jour une tâche
   */
  async updateTask(projectId: string, taskId: string, taskData: Partial<Task>): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTasks = project.tasks.map(task =>
        task.id === taskId ? { ...task, ...taskData } : task
      );
      
      return await this.update(projectId, { tasks: updatedTasks });
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      return null;
    }
  }

  /**
   * Supprimer une tâche
   */
  async deleteTask(projectId: string, taskId: string): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTasks = project.tasks.filter(task => task.id !== taskId);
      return await this.update(projectId, { tasks: updatedTasks });
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      return null;
    }
  }

  /**
   * Ajouter un risque
   */
  async addRisk(projectId: string, risk: Risk): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedRisks = [...project.risks, risk];
      return await this.update(projectId, { risks: updatedRisks });
    } catch (error) {
      console.error('❌ Erreur ajout risque:', error);
      return null;
    }
  }
}

export const projectService = new ProjectService();
```

---

### **4. Correction de App.tsx (À FAIRE)**

Mise à jour des handlers pour utiliser `projectService` :

```typescript
// ❌ ANCIEN CODE (IDs numériques)
const handleAddProject = async (projectData: Omit<Project, 'id' | 'tasks' | 'risks'>) => {
    const newProject: Project = {
        id: Date.now(),  // ❌ ID numérique
        ...projectData,
        tasks: [],
        risks: [],
    };
    setProjects(prev => [newProject, ...prev]);
};

// ✅ NOUVEAU CODE (Appwrite avec IDs string)
const handleAddProject = async (projectData: Omit<Project, 'id' | 'tasks' | 'risks'>) => {
    if (!user?.id) return;
    
    try {
        const savedProject = await projectService.create({
            ...projectData,
            tasks: [],
            risks: [],
            tags: projectData.tags || [],
            priority: projectData.priority || 'Medium',
            createdAt: new Date().toISOString(),
        }, user.id);

        if (savedProject) {
            setProjects(prev => [savedProject, ...prev]);
            addToast({
                message: `Projet "${savedProject.title}" créé avec succès ! 🎉`,
                type: 'success'
            });
        }
    } catch (error) {
        addToast({
            message: `Erreur lors de la création : ${error.message}`,
            type: 'error'
        });
    }
};
```

---

### **5. Correction du Formulaire Projects (À FAIRE)**

Mise à jour de `ProjectFormModal` dans `components/Projects.tsx` :

**Problèmes à corriger :**
- ❌ Sélection d'équipe avec `<select multiple>` basique
- ❌ IDs numériques `Number(option.value)`
- ❌ Pas de champs priority, budget, client, tags

**Solutions :**
- ✅ Multi-select moderne avec recherche
- ✅ IDs string directement
- ✅ Ajout des nouveaux champs

---

### **6. Correction des Données Mock (À FAIRE)**

Mettre à jour `constants/data.ts` avec des IDs string :

```typescript
// ❌ ANCIEN
export const mockProjects: Project[] = [
  {
    id: 1,  // ❌ Numérique
    // ...
  }
];

// ✅ NOUVEAU
export const mockProjects: Project[] = [
  {
    id: 'proj_001',  // ✅ String
    priority: 'High',
    tags: ['web', 'ecommerce'],
    createdAt: '2024-01-15T10:00:00Z',
    // ...
  }
];
```

---

## 📊 **PROGRESSION DÉTAILLÉE**

### **Étapes Complétées**
- [x] Correction des types (User, Project, etc.) - 100%
- [x] Ajout des nouveaux champs à Project - 100%

### **Étapes En Cours**
- [ ] Création du service projectService.ts - 0%
- [ ] Correction de App.tsx - 0%
- [ ] Correction du formulaire Projects.tsx - 0%
- [ ] Correction des données mock - 0%
- [ ] Tests de persistance - 0%

### **Estimation Temps Restant**
- Service projectService : 30 min
- Correction App.tsx : 20 min
- Correction formulaire : 40 min
- Correction données mock : 10 min
- Tests : 20 min

**Total : ~2 heures**

---

## 🚀 **PROCHAINES ACTIONS IMMÉDIATES**

1. **Créer `services/projectService.ts`** ✅
2. **Exporter dans `services/appwriteService.ts`**
3. **Mettre à jour App.tsx avec projectService**
4. **Moderniser le formulaire ProjectFormModal**
5. **Tester la persistance complète**

---

## ✅ **CRITÈRES DE VALIDATION**

### **Persistance**
- [ ] Création de projet sauvegardée dans Appwrite
- [ ] Modification de projet persistée
- [ ] Suppression de projet fonctionnelle
- [ ] Tâches sauvegardées avec le projet
- [ ] Risques sauvegardés avec le projet

### **Synchronisation**
- [ ] Données cohérentes après refresh
- [ ] Pas d'IDs numériques
- [ ] Tous les champs sauvegardés (priority, budget, tags, etc.)

### **UX**
- [ ] Notifications de succès/erreur
- [ ] Loading states
- [ ] Validation formulaire

---

**📅 Prêt pour continuer l'implémentation !**

