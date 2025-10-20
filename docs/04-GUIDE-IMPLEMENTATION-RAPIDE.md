# GUIDE D'IMPLÉMENTATION RAPIDE - Ecosystia
## Pour Deadline 8 Heures
**Date:** 12 Octobre 2025

---

## ÉTAPE 1: INSTALLATION DÉPENDANCES (5 min)

```bash
npm install appwrite@^14.0.0 jspdf@^2.5.1 jspdf-autotable@^3.8.0 xlsx@^0.18.5 file-saver@^2.0.5
```

---

## ÉTAPE 2: CONFIGURATION APPWRITE (15 min)

### A. Créer Projet Appwrite
1. Aller sur cloud.appwrite.io (ou instance self-hosted)
2. Créer nouveau projet "Ecosystia"
3. Noter: Project ID, Database ID

### B. Variables d'Environnement
Créer `.env`:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=<votre_project_id>
VITE_APPWRITE_DATABASE_ID=Ecosystia-main
VITE_APPWRITE_STORAGE_BUCKET_ID=files
VITE_GEMINI_API_KEY=<votre_clé_existante>
```

### C. Créer Collections (Script automatisé recommandé)
Utiliser Appwrite CLI ou interface web pour créer:
- users_profiles
- projects
- tasks
- risks
- objectives
- key_results
- courses
- course_modules
- lessons
- user_course_progress
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
- meetings
- notifications

**Référence schéma:** Voir `docs/02-CAHIER-DES-CHARGES.md` Section 3

---

## ÉTAPE 3: SERVICE APPWRITE (20 min)

Créer `services/appwriteService.ts`:

```typescript
import { Client, Databases, Account, Storage, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

export { ID, Query };

// === AUTH ===
export const authService = {
  async login(email: string, password: string) {
    return await account.createEmailSession(email, password);
  },
  
  async signup(email: string, password: string, name: string) {
    return await account.create(ID.unique(), email, password, name);
  },
  
  async logout() {
    return await account.deleteSession('current');
  },
  
  async getCurrentUser() {
    try {
      return await account.get();
    } catch {
      return null;
    }
  }
};

// === USERS ===
export const userService = {
  async createProfile(userId: string, userData: any) {
    return await databases.createDocument(
      DATABASE_ID,
      'users_profiles',
      userId,
      {
        user_id: userId,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async getProfile(userId: string) {
    return await databases.getDocument(DATABASE_ID, 'users_profiles', userId);
  },
  
  async updateProfile(userId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'users_profiles',
      userId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async listUsers() {
    return await databases.listDocuments(DATABASE_ID, 'users_profiles');
  }
};

// === PROJECTS ===
export const projectService = {
  async list(userId: string, isManager: boolean) {
    const queries = isManager 
      ? [Query.orderDesc('created_at')]
      : [Query.search('team_ids', userId), Query.orderDesc('created_at')];
    
    return await databases.listDocuments(DATABASE_ID, 'projects', queries);
  },
  
  async get(projectId: string) {
    return await databases.getDocument(DATABASE_ID, 'projects', projectId);
  },
  
  async create(projectData: any, userId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      'projects',
      ID.unique(),
      {
        ...projectData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async update(projectId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'projects',
      projectId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async delete(projectId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'projects', projectId);
  }
};

// === TASKS ===
export const taskService = {
  async listByProject(projectId: string) {
    return await databases.listDocuments(
      DATABASE_ID,
      'tasks',
      [Query.equal('project_id', projectId), Query.orderAsc('created_at')]
    );
  },
  
  async create(taskData: any) {
    return await databases.createDocument(
      DATABASE_ID,
      'tasks',
      ID.unique(),
      {
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async update(taskId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'tasks',
      taskId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async delete(taskId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'tasks', taskId);
  }
};

// === INVOICES ===
export const invoiceService = {
  async list(filters: any = {}) {
    const queries = [Query.orderDesc('created_at')];
    if (filters.status) queries.push(Query.equal('status', filters.status));
    return await databases.listDocuments(DATABASE_ID, 'invoices', queries);
  },
  
  async create(invoiceData: any, userId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      'invoices',
      ID.unique(),
      {
        ...invoiceData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async update(invoiceId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'invoices',
      invoiceId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async delete(invoiceId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'invoices', invoiceId);
  }
};

// Ajouter services similaires pour: expenses, courses, contacts, time_logs, etc.
```

---

## ÉTAPE 4: CONTEXT AUTH AVEC APPWRITE (20 min)

Modifier `contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authService, userService } from '../services/appwriteService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check si user déjà connecté
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const appwriteUser = await authService.getCurrentUser();
      if (appwriteUser) {
        const profile = await userService.getProfile(appwriteUser.$id);
        setUser({
          id: parseInt(profile.user_id),
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url || '',
          role: profile.role,
          skills: profile.skills || [],
          phone: profile.phone,
          location: profile.location
        });
      }
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.login(email, password);
      await checkUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      const appwriteUser = await authService.signup(email, password, userData.name);
      
      // Créer profil étendu
      await userService.createProfile(appwriteUser.$id, {
        name: userData.name,
        email: email,
        role: userData.role,
        skills: userData.skills || [],
        phone: userData.phone,
        location: userData.location,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`
      });
      
      // Login auto
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## ÉTAPE 5: LOGIN/SIGNUP RÉELS (20 min)

Modifier `components/Login.tsx`:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  
  try {
    await login(email, password);
    // Redirect automatique via AuthContext
  } catch (error: any) {
    setError(error.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

Modifier `components/Signup.tsx`:

```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  
  try {
    await signup(formData.email, formData.password, {
      name: formData.name,
      role: formData.role,
      skills: formData.skills,
      phone: formData.phone,
      location: formData.location
    });
    // Redirect automatique
  } catch (error: any) {
    setError(error.message || 'Signup failed');
  } finally {
    setIsLoading(false);
  }
};
```

---

## ÉTAPE 6: MIGRATION MODULE PROJECTS (40 min)

Modifier `components/Projects.tsx`:

```typescript
import { projectService, taskService } from '../services/appwriteService';

const Projects: React.FC<ProjectsProps> = ({ ... }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadProjects();
  }, [user]);
  
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const isManager = ['manager', 'supervisor', 'administrator', 'super_administrator'].includes(user.role);
      const response = await projectService.list(user.$id, isManager);
      setProjects(response.documents);
    } catch (error) {
      console.error('Load projects error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateProject = async (projectData) => {
    try {
      await projectService.create(projectData, user.$id);
      await loadProjects();
      showToast('Project created!', 'success');
    } catch (error) {
      showToast('Failed to create project', 'error');
    }
  };
  
  // Reste du composant...
};
```

---

## ÉTAPE 7: EXPORTS PDF/EXCEL (40 min)

Créer `utils/exportUtils.ts`:

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Data') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

export const exportProjectToPDF = (project: any, tasks: any[], risks: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(`Project: ${project.title}`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Status: ${project.status}`, 20, 35);
  doc.text(`Due Date: ${new Date(project.due_date).toLocaleDateString()}`, 20, 45);
  
  doc.setFontSize(10);
  const description = doc.splitTextToSize(project.description, 170);
  doc.text(description, 20, 60);
  
  let yPos = 60 + (description.length * 5) + 15;
  
  // Tasks
  doc.setFontSize(14);
  doc.text('Tasks', 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    head: [['Task', 'Status', 'Priority', 'Assignee']],
    body: tasks.map(t => [
      t.text,
      t.status,
      t.priority,
      t.assignee_name || 'Unassigned'
    ]),
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8 }
  });
  
  yPos = doc.lastAutoTable.finalY + 10;
  
  // Risks
  if (risks.length > 0) {
    doc.setFontSize(14);
    doc.text('Risks', 20, yPos);
    yPos += 5;
    
    autoTable(doc, {
      head: [['Description', 'Likelihood', 'Impact']],
      body: risks.map(r => [r.description, r.likelihood, r.impact]),
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
  }
  
  doc.save(`project_${project.title}_${new Date().toISOString().split('T')[0]}.pdf`);
};
```

---

## ÉTAPE 8: RENOMMAGE Ecosystia (15 min)

### A. Modifier Branding
1. `index.html` - Titre
2. `components/Sidebar.tsx` - Logo et nom
3. `components/Header.tsx` - Titre
4. `package.json` - Name
5. `README.md` - Documentation

### B. Créer/Modifier Logo
Créer `components/icons/EcosystiaIcon.tsx`:
```typescript
const EcosystiaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    {/* Logo SVG ici */}
    <text x="10" y="60" fontSize="40" fontWeight="bold">E5A</text>
  </svg>
);
```

---

## CHECKLIST FINALE

### Avant Livraison:
- [ ] Tous les modules migrent vers Appwrite
- [ ] Auth fonctionnel (login/signup/logout)
- [ ] Exports PDF/Excel sur modules clés
- [ ] Tests CRUD basiques sur chaque module
- [ ] Application renommée Ecosystia
- [ ] Build production réussi
- [ ] Documentation livrée

### Commandes:
```bash
# Test
npm run dev

# Build
npm run build

# Preview production
npm run preview
```

---

## LIVRAISON CLIENT

**Package à fournir:**
1. ✅ Code source complet
2. ✅ Documentation (ces 4 fichiers)
3. ✅ Variables d'environnement (.env.example)
4. ✅ Instructions déploiement
5. ✅ Credentials Appwrite (si configuré pour eux)

**Déploiement recommandé:**
- Vercel / Netlify pour frontend
- Appwrite Cloud (déjà configuré) pour backend

---

**Bonne chance ! 🚀**

