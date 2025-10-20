import { Client, Databases, Account, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68ee2dc2001f0f499c02');

// Configuration Appwrite (setKey n'est pas nécessaire pour les API keys)
// Les API keys sont utilisées directement dans les requêtes

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '68ee527d002813e4e0ca';
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'files';

export { ID, Query };

// Collection IDs for Appwrite - SANS ACCENTS (Appwrite n'accepte pas les accents!)
export const COLLECTION_IDS = {
  // Noms de collections valides pour Appwrite (a-z, A-Z, 0-9, underscore uniquement)
  USERS: 'users',
  COURSES: 'courses',
  JOBS: 'jobs',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  RISKS: 'risks',
  OBJECTIVES: 'objectives',
  KEY_RESULTS: 'key_results',
  CONTACTS: 'contacts',
  CRM_CLIENTS: 'crm_clients',
  DOCUMENTS: 'documents',
  TIME_LOGS: 'time_logs',
  LEAVE_REQUESTS: 'leave_requests',
  INVOICES: 'invoices',
  EXPENSES: 'expenses',
  RECURRING_INVOICES: 'recurring_invoices',
  RECURRING_EXPENSES: 'recurring_expenses',
  BUDGETS: 'budgets',
  BUDGET_LINES: 'budget_lines',
  BUDGET_ITEMS: 'budget_items',
  MEETINGS: 'meetings',
  NOTIFICATIONS: 'notifications',
  LESSONS: 'lessons',
  MODULES: 'modules',
  COURSE_ENROLLMENTS: 'course_enrollments',  // ✅ Ajouté selon Merise
};

// Export des services Finance, CRM, Projects, Course Enrollment, Time Log, User et OKR
export * from './financeService';
export * from './crmService';
export * from './projectService';
export * from './courseEnrollmentService';
export * from './userService';
export * from './timeLogService';
export * from './okrService';

// Check if Appwrite is configured
const isAppwriteConfigured = () => {
  return !!(import.meta.env.VITE_APPWRITE_PROJECT_ID && import.meta.env.VITE_APPWRITE_ENDPOINT);
};

export const APPWRITE_ENABLED = isAppwriteConfigured();

// === AUTH SERVICE ===
export const authService = {
  async login(email: string, password: string) {
    if (!APPWRITE_ENABLED) {
      throw new Error('Appwrite not configured. Please set environment variables.');
    }
    return await account.createEmailSession(email, password);
  },
  
  async signup(email: string, password: string, name: string) {
    if (!APPWRITE_ENABLED) {
      throw new Error('Appwrite not configured. Please set environment variables.');
    }
    return await account.create(ID.unique(), email, password, name);
  },
  
  async logout() {
    if (!APPWRITE_ENABLED) return;
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  async getCurrentUser() {
    if (!APPWRITE_ENABLED) return null;
    try {
      return await account.get();
    } catch {
      return null;
    }
  }
};

// === USER SERVICE ===
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
    return await databases.listDocuments(
      DATABASE_ID,
      'users_profiles',
      [Query.orderDesc('created_at'), Query.limit(100)]
    );
  }
};

// === PROJECT SERVICE ===
export const projectService = {
  async list(userId: string, isManager: boolean = false) {
    const queries = isManager 
      ? [Query.orderDesc('created_at'), Query.limit(100)]
      : [
          Query.search('team_ids', userId),
          Query.orderDesc('created_at'),
          Query.limit(100)
        ];
    
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

// === TASK SERVICE ===
export const taskService = {
  async listByProject(projectId: string) {
    return await databases.listDocuments(
      DATABASE_ID,
      'tasks',
      [
        Query.equal('project_id', projectId),
        Query.orderAsc('created_at'),
        Query.limit(500)
      ]
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

// === RISK SERVICE ===
export const riskService = {
  async listByProject(projectId: string) {
    return await databases.listDocuments(
      DATABASE_ID,
      'risks',
      [Query.equal('project_id', projectId), Query.orderDesc('created_at')]
    );
  },
  
  async create(riskData: any) {
    return await databases.createDocument(
      DATABASE_ID,
      'risks',
      ID.unique(),
      {
        ...riskData,
        created_at: new Date().toISOString()
      }
    );
  },
  
  async update(riskId: string, data: any) {
    return await databases.updateDocument(DATABASE_ID, 'risks', riskId, data);
  },
  
  async delete(riskId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'risks', riskId);
  }
};

// === INVOICE SERVICE ===
export const invoiceService = {
  async list(filters: any = {}) {
    const queries = [Query.orderDesc('created_at'), Query.limit(100)];
    if (filters.status) queries.push(Query.equal('status', filters.status));
    if (filters.startDate) queries.push(Query.greaterThanEqual('due_date', filters.startDate));
    if (filters.endDate) queries.push(Query.lessThanEqual('due_date', filters.endDate));
    
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

// === EXPENSE SERVICE ===
export const expenseService = {
  async list(filters: any = {}) {
    const queries = [Query.orderDesc('created_at'), Query.limit(100)];
    if (filters.category) queries.push(Query.equal('category', filters.category));
    if (filters.status) queries.push(Query.equal('status', filters.status));
    
    return await databases.listDocuments(DATABASE_ID, 'expenses', queries);
  },
  
  async create(expenseData: any, userId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      'expenses',
      ID.unique(),
      {
        ...expenseData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async update(expenseId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'expenses',
      expenseId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async delete(expenseId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'expenses', expenseId);
  }
};

// === TIME LOG SERVICE ===
export const timeLogService = {
  async listByUser(userId: string, limit: number = 100) {
    return await databases.listDocuments(
      DATABASE_ID,
      'time_logs',
      [
        Query.equal('user_id', userId),
        Query.orderDesc('date'),
        Query.limit(limit)
      ]
    );
  },
  
  async create(logData: any, userId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      'time_logs',
      ID.unique(),
      {
        ...logData,
        user_id: userId,
        created_at: new Date().toISOString()
      }
    );
  },
  
  async update(logId: string, data: any) {
    return await databases.updateDocument(DATABASE_ID, 'time_logs', logId, data);
  },
  
  async delete(logId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'time_logs', logId);
  }
};

// === CONTACT SERVICE ===
export const contactService = {
  async list() {
    return await databases.listDocuments(
      DATABASE_ID,
      'contacts',
      [Query.orderDesc('created_at'), Query.limit(100)]
    );
  },
  
  async create(contactData: any, userId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      'contacts',
      ID.unique(),
      {
        ...contactData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async update(contactId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'contacts',
      contactId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async delete(contactId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'contacts', contactId);
  }
};

// === COURSE SERVICE ===
export const courseService = {
  async list() {
    return await databases.listDocuments(
      DATABASE_ID,
      'courses',
      [Query.orderDesc('created_at'), Query.limit(100)]
    );
  },
  
  async get(courseId: string) {
    return await databases.getDocument(DATABASE_ID, 'courses', courseId);
  },
  
  async create(courseData: any, userId: string) {
    return await databases.createDocument(
      DATABASE_ID,
      'courses',
      ID.unique(),
      {
        ...courseData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
  },
  
  async update(courseId: string, data: any) {
    return await databases.updateDocument(
      DATABASE_ID,
      'courses',
      courseId,
      { ...data, updated_at: new Date().toISOString() }
    );
  },
  
  async delete(courseId: string) {
    return await databases.deleteDocument(DATABASE_ID, 'courses', courseId);
  }
};

// === STORAGE SERVICE ===
export const storageService = {
  async uploadFile(file: File) {
    return await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
  },
  
  async getFileView(fileId: string) {
    return storage.getFileView(STORAGE_BUCKET_ID, fileId);
  },
  
  async getFileDownload(fileId: string) {
    return storage.getFileDownload(STORAGE_BUCKET_ID, fileId);
  },
  
  async deleteFile(fileId: string) {
    return await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
  }
};

// Export all services
export default {
  auth: authService,
  user: userService,
  project: projectService,
  task: taskService,
  risk: riskService,
  invoice: invoiceService,
  expense: expenseService,
  timeLog: timeLogService,
  contact: contactService,
  course: courseService,
  storage: storageService
};

