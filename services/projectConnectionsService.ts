/**
 * 🔗 SERVICE CONNEXIONS PROJETS - ECOSYSTIA
 * Gestion des connexions entre projets et autres modules
 */

import { databases, DATABASE_ID, COLLECTION_IDS } from './appwriteService';
import { ID, Query } from 'appwrite';
import { projectService } from './projectService';
import { invoiceService, expenseService, budgetService } from './financeService';

export class ProjectConnectionsService {
  
  // ============================================
  // CONNEXIONS TÂCHES ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer toutes les tâches d'un projet
   */
  async getProjectTasks(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.TASKS,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} tâches récupérées pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération tâches projet:', error);
      return [];
    }
  }
  
  /**
   * Créer une tâche liée à un projet
   */
  async createProjectTask(projectId: string, taskData: any, userId: string) {
    try {
      const task = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.TASKS,
        ID.unique(),
        {
          ...taskData,
          projectId: projectId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Tâche créée et liée au projet:', task.$id);
      return task;
    } catch (error) {
      console.error('❌ Erreur création tâche projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS RISQUES ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer tous les risques d'un projet
   */
  async getProjectRisks(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.RISKS,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} risques récupérés pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération risques projet:', error);
      return [];
    }
  }
  
  /**
   * Créer un risque lié à un projet
   */
  async createProjectRisk(projectId: string, riskData: any, userId: string) {
    try {
      const risk = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.RISKS,
        ID.unique(),
        {
          ...riskData,
          projectId: projectId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Risque créé et lié au projet:', risk.$id);
      return risk;
    } catch (error) {
      console.error('❌ Erreur création risque projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS BUDGETS ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer le budget d'un projet
   */
  async getProjectBudget(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.BUDGETS,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} budgets récupérés pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération budget projet:', error);
      return [];
    }
  }
  
  /**
   * Créer un budget pour un projet
   */
  async createProjectBudget(projectId: string, budgetData: any, userId: string) {
    try {
      const budget = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.BUDGETS,
        ID.unique(),
        {
          ...budgetData,
          projectId: projectId,
          type: 'project',
          createdBy: userId,
          spent: 0,
          remaining: budgetData.amount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Budget créé pour le projet:', budget.$id);
      return budget;
    } catch (error) {
      console.error('❌ Erreur création budget projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS FACTURES ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer les factures d'un projet
   */
  async getProjectInvoices(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.INVOICES,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} factures récupérées pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération factures projet:', error);
      return [];
    }
  }
  
  /**
   * Créer une facture liée à un projet
   */
  async createProjectInvoice(projectId: string, invoiceData: any, userId: string) {
    try {
      const invoice = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.INVOICES,
        ID.unique(),
        {
          ...invoiceData,
          projectId: projectId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Facture créée pour le projet:', invoice.$id);
      return invoice;
    } catch (error) {
      console.error('❌ Erreur création facture projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS DÉPENSES ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer les dépenses d'un projet
   */
  async getProjectExpenses(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.EXPENSES,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} dépenses récupérées pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération dépenses projet:', error);
      return [];
    }
  }
  
  /**
   * Créer une dépense liée à un projet
   */
  async createProjectExpense(projectId: string, expenseData: any, userId: string) {
    try {
      const expense = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.EXPENSES,
        ID.unique(),
        {
          ...expenseData,
          projectId: projectId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Dépense créée pour le projet:', expense.$id);
      return expense;
    } catch (error) {
      console.error('❌ Erreur création dépense projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS TEMPS ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer les logs de temps d'un projet
   */
  async getProjectTimeLogs(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.TIME_LOGS,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} logs de temps récupérés pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération logs temps projet:', error);
      return [];
    }
  }
  
  /**
   * Créer un log de temps pour un projet
   */
  async createProjectTimeLog(projectId: string, timeLogData: any, userId: string) {
    try {
      const timeLog = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.TIME_LOGS,
        ID.unique(),
        {
          ...timeLogData,
          projectId: projectId,
          userId: userId,
          createdAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Log de temps créé pour le projet:', timeLog.$id);
      return timeLog;
    } catch (error) {
      console.error('❌ Erreur création log temps projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS RÉUNIONS ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer les réunions d'un projet
   */
  async getProjectMeetings(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.MEETINGS,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} réunions récupérées pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération réunions projet:', error);
      return [];
    }
  }
  
  /**
   * Créer une réunion liée à un projet
   */
  async createProjectMeeting(projectId: string, meetingData: any, userId: string) {
    try {
      const meeting = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.MEETINGS,
        ID.unique(),
        {
          ...meetingData,
          projectId: projectId,
          organizerId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Réunion créée pour le projet:', meeting.$id);
      return meeting;
    } catch (error) {
      console.error('❌ Erreur création réunion projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // CONNEXIONS DOCUMENTS ↔ PROJETS
  // ============================================
  
  /**
   * Récupérer les documents d'un projet
   */
  async getProjectDocuments(projectId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.DOCUMENTS,
        [Query.equal('projectId', projectId)]
      );
      
      console.log(`✅ ${response.documents.length} documents récupérés pour le projet ${projectId}`);
      return response.documents;
    } catch (error) {
      console.error('❌ Erreur récupération documents projet:', error);
      return [];
    }
  }
  
  /**
   * Créer un document lié à un projet
   */
  async createProjectDocument(projectId: string, documentData: any, userId: string) {
    try {
      const document = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.DOCUMENTS,
        ID.unique(),
        {
          ...documentData,
          projectId: projectId,
          uploadedBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Document créé pour le projet:', document.$id);
      return document;
    } catch (error) {
      console.error('❌ Erreur création document projet:', error);
      throw error;
    }
  }
  
  // ============================================
  // STATISTIQUES ET RAPPORTS PROJETS
  // ============================================
  
  /**
   * Récupérer un résumé complet d'un projet
   */
  async getProjectSummary(projectId: string) {
    try {
      const [
        project,
        tasks,
        risks,
        budgets,
        invoices,
        expenses,
        timeLogs,
        meetings,
        documents
      ] = await Promise.all([
        projectService.getById(projectId),
        this.getProjectTasks(projectId),
        this.getProjectRisks(projectId),
        this.getProjectBudget(projectId),
        this.getProjectInvoices(projectId),
        this.getProjectExpenses(projectId),
        this.getProjectTimeLogs(projectId),
        this.getProjectMeetings(projectId),
        this.getProjectDocuments(projectId)
      ]);
      
      // Calculer les statistiques
      const totalBudget = budgets.reduce((sum, budget) => sum + (parseFloat(budget.amount) || 0), 0);
      const totalSpent = budgets.reduce((sum, budget) => sum + (parseFloat(budget.spent) || 0), 0);
      const totalInvoices = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const totalTimeLogged = timeLogs.reduce((sum, log) => sum + (parseInt(log.duration) || 0), 0);
      
      const summary = {
        project,
        stats: {
          tasks: {
            total: tasks.length,
            completed: tasks.filter(task => task.status === 'Completed').length,
            inProgress: tasks.filter(task => task.status === 'In Progress').length,
            pending: tasks.filter(task => task.status === 'To Do').length
          },
          risks: {
            total: risks.length,
            high: risks.filter(risk => risk.likelihood === 'High' || risk.impact === 'High').length,
            medium: risks.filter(risk => risk.likelihood === 'Medium' || risk.impact === 'Medium').length,
            low: risks.filter(risk => risk.likelihood === 'Low' && risk.impact === 'Low').length
          },
          budget: {
            allocated: totalBudget,
            spent: totalSpent,
            remaining: totalBudget - totalSpent,
            utilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
          },
          finance: {
            totalInvoices: totalInvoices,
            totalExpenses: totalExpenses,
            netProfit: totalInvoices - totalExpenses
          },
          time: {
            totalLogged: totalTimeLogged,
            averagePerTask: tasks.length > 0 ? totalTimeLogged / tasks.length : 0
          },
          collaboration: {
            meetings: meetings.length,
            documents: documents.length
          }
        }
      };
      
      console.log('✅ Résumé projet généré:', projectId);
      return summary;
    } catch (error) {
      console.error('❌ Erreur génération résumé projet:', error);
      throw error;
    }
  }
  
  /**
   * Mettre à jour automatiquement le budget d'un projet
   */
  async updateProjectBudgetFromExpenses(projectId: string) {
    try {
      const [budgets, expenses] = await Promise.all([
        this.getProjectBudget(projectId),
        this.getProjectExpenses(projectId)
      ]);
      
      const totalSpent = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      for (const budget of budgets) {
        await budgetService.update(budget.$id, {
          spent: totalSpent,
          remaining: (parseFloat(budget.amount) || 0) - totalSpent
        });
      }
      
      console.log('✅ Budget projet mis à jour automatiquement:', projectId);
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour budget projet:', error);
      throw error;
    }
  }
}

export const projectConnectionsService = new ProjectConnectionsService();
