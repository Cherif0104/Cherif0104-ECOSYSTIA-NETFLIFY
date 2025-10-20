/**
 * 💾 SERVICE DE DONNÉES PRINCIPAL - ECOSYSTIA
 * Gestion complète des opérations CRUD avec Appwrite
 */

import { databases, DATABASE_ID, COLLECTION_IDS, ID, Query } from './appwriteService';
import { Project, Task, User, Course, Invoice, Expense, TimeLog, LeaveRequest, Contact, Document, Objective } from '../types';
import { ErrorHandler, EcosystiaError, ERROR_CODES, withErrorHandling, retryWithBackoff } from '../utils/errorHandling';

/**
 * Service de base générique
 */
class BaseService<T> {
  constructor(
    protected collectionId: string,
    protected mapFromAppwrite: (doc: any) => T,
    protected mapToAppwrite: (data: Partial<T>) => any
  ) {}

  /**
   * Récupère tous les documents
   */
  async getAll(queries: string[] = []): Promise<T[]> {
    return withErrorHandling(async () => {
      const response = await retryWithBackoff(() => 
        databases.listDocuments(DATABASE_ID, this.collectionId, queries)
      );
      return response.documents.map(this.mapFromAppwrite);
    }, `getAll ${this.collectionId}`, []) as Promise<T[]>;
  }

  /**
   * Récupère un document par ID
   */
  async getById(id: string): Promise<T | null> {
    return withErrorHandling(async () => {
      const response = await databases.getDocument(DATABASE_ID, this.collectionId, id);
      return this.mapFromAppwrite(response);
    }, `getById ${this.collectionId}`) as Promise<T | null>;
  }

  /**
   * Crée un nouveau document
   */
  async create(data: Partial<T>): Promise<T | null> {
    return withErrorHandling(async () => {
      const appwriteData = this.mapToAppwrite(data);
      const response = await databases.createDocument(
        DATABASE_ID,
        this.collectionId,
        ID.unique(),
        appwriteData
      );
      return this.mapFromAppwrite(response);
    }, `create ${this.collectionId}`) as Promise<T | null>;
  }

  /**
   * Met à jour un document
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return withErrorHandling(async () => {
      const appwriteData = this.mapToAppwrite(data);
      const response = await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        id,
        appwriteData
      );
      return this.mapFromAppwrite(response);
    }, `update ${this.collectionId}`) as Promise<T | null>;
  }

  /**
   * Supprime un document
   */
  async delete(id: string): Promise<boolean> {
    return withErrorHandling(async () => {
      await databases.deleteDocument(DATABASE_ID, this.collectionId, id);
      return true;
    }, `delete ${this.collectionId}`, false) as Promise<boolean>;
  }
}

/**
 * Service Projets
 */
class ProjectService extends BaseService<Project> {
  constructor() {
    super(
      COLLECTION_IDS.PROJECTS,
      (doc) => ({
        id: doc.$id,
        title: doc.name || doc.titre,
        description: doc.description || doc['décrire...'] || '',
        status: doc.status || doc.statut || 'Not Started',
        dueDate: doc.endDate || doc.dueDate || doc['finDat...'] || '',
        team: [], // À charger séparément
        tasks: [], // À charger séparément
        risks: [], // À charger séparément
      }),
      (project) => ({
        name: project.title,
        description: project.description,
        status: project.status,
        endDate: project.dueDate,
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        budget: 0,
        progress: 0,
        tags: [],
        category: 'General',
      })
    );
  }

  /**
   * Récupère les projets d'un utilisateur
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    return this.getAll([Query.equal('ownerId', userId)]);
  }

  /**
   * Crée un projet avec validation
   */
  async createWithValidation(project: Omit<Project, 'id'>, userId: string): Promise<Project | null> {
    // Validation désormais effectuée dans les formulaires via FormValidator
    // validateOrThrow(project, validateProject, 'createProject');
    
    return withErrorHandling(async () => {
      const appwriteData = {
        name: project.title,
        description: project.description,
        status: project.status,
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: project.dueDate,
        budget: 0,
        ownerId: userId,
        teamMembers: project.team.map(m => m.id.toString()),
        progress: 0,
        tags: [],
        category: 'General',
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        this.collectionId,
        ID.unique(),
        appwriteData
      );

      return this.mapFromAppwrite(response);
    }, 'createProject') as Promise<Project | null>;
  }

  /**
   * Met à jour un projet avec validation
   */
  async updateWithValidation(id: string, project: Project): Promise<Project | null> {
    // Validation désormais effectuée dans les formulaires via FormValidator
    // validateOrThrow(project, validateProject, 'updateProject');
    return this.update(id, project);
  }
}

/**
 * Service Utilisateurs
 */
class UserService extends BaseService<User> {
  constructor() {
    super(
      COLLECTION_IDS.USERS,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || doc.name || '',
        email: doc.email || '',
        avatar: doc.avatar || `https://picsum.photos/seed/${doc.$id}/100/100`,
        role: doc.role || 'student',
        skills: typeof doc.skills === 'string' 
          ? doc.skills.split(', ').filter(Boolean) 
          : (doc.skills || []),
        phone: doc.phone,
      }),
      (user) => ({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : user.skills,
        phone: user.phone,
      })
    );
  }

  /**
   * Crée un utilisateur avec validation
   */
  async createWithValidation(user: Omit<User, 'id' | 'avatar' | 'skills'>): Promise<User | null> {
    // Validation désormais effectuée dans les formulaires via FormValidator
    // validateOrThrow(user, validateUser, 'createUser');
    
    const userData = {
      ...user,
      avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
      skills: [],
    };
    
    return this.create(userData);
  }
}

/**
 * Service Cours
 */
class CourseService extends BaseService<Course> {
  constructor() {
    super(
      COLLECTION_IDS.COURSES,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        title: doc.title || doc.titre || '',
        instructor: doc.instructor || doc['instru...'] || '',
        duration: doc.duration || doc.durée || '',
        progress: doc.progress || 0,
        icon: doc.icon || 'fas fa-book',
        description: doc.description || doc['décrire...'] || '',
        modules: doc.modules || [],
        completedLessons: doc.completedLessons || [],
      }),
      (course) => ({
        titre: course.title,
        description: course.description,
        'instru...': course.instructor,
        durée: course.duration,
        niveau: 'Débutant',
        statut: 'actif',
        inscrire: 0,
        identifiant_de_rôle: 'étudiant',
      })
    );
  }

  /**
   * Crée un cours avec validation
   */
  async createWithValidation(course: Omit<Course, 'id' | 'progress'>): Promise<Course | null> {
    // Validation désormais effectuée dans les formulaires via FormValidator
    // validateOrThrow(course, validateCourse, 'createCourse');
    return this.create({ ...course, progress: 0 });
  }
}

/**
 * Service Factures
 */
class InvoiceService extends BaseService<Invoice> {
  constructor() {
    super(
      COLLECTION_IDS.INVOICES,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        invoiceNumber: doc.invoiceNumber || '',
        clientName: doc.clientName || '',
        amount: doc.amount || 0,
        dueDate: doc.dueDate || '',
        status: doc.status || 'Draft',
        recurringSourceId: doc.recurringSourceId,
      }),
      (invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        recurringSourceId: invoice.recurringSourceId,
      })
    );
  }

  /**
   * Crée une facture avec validation
   */
  async createWithValidation(invoice: Omit<Invoice, 'id'>): Promise<Invoice | null> {
    // Validation désormais effectuée dans les formulaires via FormValidator
    // validateOrThrow(invoice, validateInvoice, 'createInvoice');
    return this.create(invoice);
  }
}

/**
 * Service Dépenses
 */
class ExpenseService extends BaseService<Expense> {
  constructor() {
    super(
      COLLECTION_IDS.EXPENSES,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        category: doc.category || '',
        description: doc.description || '',
        amount: doc.amount || 0,
        date: doc.date || '',
        dueDate: doc.dueDate,
        status: doc.status || 'Unpaid',
        budgetItemId: doc.budgetItemId,
        recurringSourceId: doc.recurringSourceId,
      }),
      (expense) => ({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        dueDate: expense.dueDate,
        status: expense.status,
        budgetItemId: expense.budgetItemId,
        recurringSourceId: expense.recurringSourceId,
      })
    );
  }

  /**
   * Crée une dépense avec validation
   */
  async createWithValidation(expense: Omit<Expense, 'id'>): Promise<Expense | null> {
    // Validation désormais effectuée dans les formulaires via FormValidator
    // validateOrThrow(expense, validateExpense, 'createExpense');
    return this.create(expense);
  }
}

/**
 * Service Logs de Temps
 */
class TimeLogService extends BaseService<TimeLog> {
  constructor() {
    super(
      COLLECTION_IDS.TIME_LOGS,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        userId: parseInt(doc.userId) || 0,
        projectId: parseInt(doc.projectId),
        courseId: parseInt(doc.courseId),
        taskId: doc.taskId,
        taskDescription: doc.taskDescription || '',
        hours: doc.hours || 0,
        date: doc.date || '',
        description: doc.description || '',
      }),
      (log) => ({
        userId: log.userId?.toString(),
        projectId: log.projectId?.toString(),
        courseId: log.courseId?.toString(),
        taskId: log.taskId,
        taskDescription: log.taskDescription,
        hours: log.hours,
        date: log.date,
        description: log.description,
      })
    );
  }

  /**
   * Récupère les logs d'un utilisateur
   */
  async getUserTimeLogs(userId: string): Promise<TimeLog[]> {
    return this.getAll([Query.equal('userId', userId)]);
  }
}

/**
 * Service Demandes de Congé
 */
class LeaveRequestService extends BaseService<LeaveRequest> {
  constructor() {
    super(
      COLLECTION_IDS.LEAVE_REQUESTS,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        userId: parseInt(doc.userId) || 0,
        userName: doc.userName || '',
        userAvatar: doc.userAvatar || '',
        type: doc.type || '',
        startDate: doc.startDate || '',
        endDate: doc.endDate || '',
        reason: doc.reason || '',
        status: doc.status || 'Pending',
      }),
      (request) => ({
        userId: request.userId?.toString(),
        userName: request.userName,
        userAvatar: request.userAvatar,
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        status: request.status,
      })
    );
  }
}

/**
 * Service Contacts (CRM)
 */
class ContactService extends BaseService<Contact> {
  constructor() {
    super(
      COLLECTION_IDS.CONTACTS,
      (doc) => ({
        id: parseInt(doc.$id) || Date.now(),
        name: doc.name || doc.nom || '',
        workEmail: doc.workEmail || doc['e-mail'] || '',
        personalEmail: doc.personalEmail,
        company: doc.company || doc.entreprise || '',
        status: doc.status || doc.statut || 'Lead',
        avatar: doc.avatar || `https://picsum.photos/seed/${doc.$id}/100/100`,
        officePhone: doc.officePhone || doc.téléphone,
        mobilePhone: doc.mobilePhone,
        whatsappNumber: doc.whatsappNumber,
      }),
      (contact) => ({
        nom: contact.name,
        'e-mail': contact.workEmail,
        entreprise: contact.company,
        statut: contact.status,
        téléphone: contact.officePhone,
      })
    );
  }
}

// Export des instances de services
export const projectService = new ProjectService();
export const userService = new UserService();
export const courseService = new CourseService();
export const invoiceService = new InvoiceService();
export const expenseService = new ExpenseService();
export const timeLogService = new TimeLogService();
export const leaveRequestService = new LeaveRequestService();
export const contactService = new ContactService();

// Fonction de test Appwrite supprimée - migration vers Supabase
