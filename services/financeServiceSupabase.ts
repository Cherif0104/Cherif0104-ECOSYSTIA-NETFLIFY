/**
 * 💰 SERVICE FINANCE STANDARDISÉ SUPABASE
 * Gestion financière - Architecture standardisée
 */

import { supabase } from './supabaseService';
import { Invoice, Expense, RecurringInvoice, RecurringExpense, Budget, Project } from '../types';

class FinanceService {
  private invoicesTableName = 'invoices';
  private expensesTableName = 'expenses';
  private recurringInvoicesTableName = 'recurring_invoices';
  private recurringExpensesTableName = 'recurring_expenses';
  private budgetsTableName = 'budgets';

  // ===== INVOICES =====

  private mapInvoiceFromSupabase(data: any): Invoice {
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      clientName: data.client_name,
      clientEmail: data.client_email,
      clientAddress: data.client_address,
      amount: data.amount,
      tax: data.tax || 0,
      total: data.total,
      status: data.status,
      dueDate: data.due_date,
      paidDate: data.paid_date,
      description: data.description,
      items: data.items || [],
      notes: data.notes,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  private mapInvoiceToSupabase(invoice: Partial<Invoice>): any {
    return {
      invoice_number: invoice.invoiceNumber,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      client_address: invoice.clientAddress,
      amount: invoice.amount,
      tax: invoice.tax || 0,
      total: invoice.total,
      status: invoice.status,
      due_date: invoice.dueDate,
      paid_date: invoice.paidDate,
      description: invoice.description,
      items: invoice.items || [],
      notes: invoice.notes,
    };
  }

  async getAllInvoices(): Promise<Invoice[]> {
    try {
      console.log('🔄 Récupération factures Supabase...');
      
      const { data, error } = await supabase
        .from(this.invoicesTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invoices = data.map(item => this.mapInvoiceFromSupabase(item));
      console.log(`✅ ${invoices.length} factures récupérées`);
      return invoices;
    } catch (error) {
      console.error('❌ Erreur récupération factures:', error);
      return [];
    }
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from(this.invoicesTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapInvoiceFromSupabase(data);
    } catch (error) {
      console.error('❌ Erreur récupération facture:', error);
      return null;
    }
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice | null> {
    try {
      console.log('🔄 Création facture Supabase...');
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const invoiceData = this.mapInvoiceToSupabase(invoice);
      invoiceData.user_id = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.invoicesTableName)
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      const newInvoice = this.mapInvoiceFromSupabase(data);
      console.log('✅ Facture créée:', newInvoice.id);
      return newInvoice;
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
      return null;
    }
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | null> {
    try {
      console.log('🔄 Mise à jour facture Supabase...');
      
      const invoiceData = this.mapInvoiceToSupabase(invoice);
      const { data, error } = await supabase
        .from(this.invoicesTableName)
        .update(invoiceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedInvoice = this.mapInvoiceFromSupabase(data);
      console.log('✅ Facture mise à jour:', updatedInvoice.id);
      return updatedInvoice;
    } catch (error) {
      console.error('❌ Erreur mise à jour facture:', error);
      return null;
    }
  }

  async deleteInvoice(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression facture Supabase...');
      
      const { error } = await supabase
        .from(this.invoicesTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Facture supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression facture:', error);
      return false;
    }
  }

  // ===== EXPENSES =====

  private mapExpenseFromSupabase(data: any): Expense {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      amount: data.amount,
      category: data.category,
      status: data.status,
      date: data.date,
      receipt: data.receipt,
      projectId: data.project_id,
      tags: data.tags || [],
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  private mapExpenseToSupabase(expense: Partial<Expense>): any {
    return {
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      status: expense.status,
      date: expense.date,
      receipt: expense.receipt,
      project_id: expense.projectId,
      tags: expense.tags || [],
    };
  }

  async getAllExpenses(): Promise<Expense[]> {
    try {
      console.log('🔄 Récupération dépenses Supabase...');
      
      const { data, error } = await supabase
        .from(this.expensesTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const expenses = data.map(item => this.mapExpenseFromSupabase(item));
      console.log(`✅ ${expenses.length} dépenses récupérées`);
      return expenses;
    } catch (error) {
      console.error('❌ Erreur récupération dépenses:', error);
      return [];
    }
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      const { data, error } = await supabase
        .from(this.expensesTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapExpenseFromSupabase(data);
    } catch (error) {
      console.error('❌ Erreur récupération dépense:', error);
      return null;
    }
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense | null> {
    try {
      console.log('🔄 Création dépense Supabase...');
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const expenseData = this.mapExpenseToSupabase(expense);
      expenseData.user_id = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.expensesTableName)
        .insert(expenseData)
        .select()
        .single();

      if (error) throw error;

      const newExpense = this.mapExpenseFromSupabase(data);
      console.log('✅ Dépense créée:', newExpense.id);
      return newExpense;
    } catch (error) {
      console.error('❌ Erreur création dépense:', error);
      return null;
    }
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense | null> {
    try {
      console.log('🔄 Mise à jour dépense Supabase...');
      
      const expenseData = this.mapExpenseToSupabase(expense);
      const { data, error } = await supabase
        .from(this.expensesTableName)
        .update(expenseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedExpense = this.mapExpenseFromSupabase(data);
      console.log('✅ Dépense mise à jour:', updatedExpense.id);
      return updatedExpense;
    } catch (error) {
      console.error('❌ Erreur mise à jour dépense:', error);
      return null;
    }
  }

  async deleteExpense(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression dépense Supabase...');
      
      const { error } = await supabase
        .from(this.expensesTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Dépense supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression dépense:', error);
      return false;
    }
  }

  // ===== BUDGETS =====

  private mapBudgetFromSupabase(data: any): Budget {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      amount: data.amount,
      spent: data.spent || 0,
      remaining: data.remaining || data.amount,
      category: data.category,
      period: data.period,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      projectId: data.project_id,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  private mapBudgetToSupabase(budget: Partial<Budget>): any {
    return {
      name: budget.name,
      description: budget.description,
      amount: budget.amount,
      spent: budget.spent || 0,
      remaining: budget.remaining || budget.amount,
      category: budget.category,
      period: budget.period,
      start_date: budget.startDate,
      end_date: budget.endDate,
      status: budget.status,
      project_id: budget.projectId,
    };
  }

  async getAllBudgets(): Promise<Budget[]> {
    try {
      console.log('🔄 Récupération budgets Supabase...');
      
      const { data, error } = await supabase
        .from(this.budgetsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const budgets = data.map(item => this.mapBudgetFromSupabase(item));
      console.log(`✅ ${budgets.length} budgets récupérés`);
      return budgets;
    } catch (error) {
      console.error('❌ Erreur récupération budgets:', error);
      return [];
    }
  }

  async getBudgetById(id: string): Promise<Budget | null> {
    try {
      const { data, error } = await supabase
        .from(this.budgetsTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapBudgetFromSupabase(data);
    } catch (error) {
      console.error('❌ Erreur récupération budget:', error);
      return null;
    }
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget | null> {
    try {
      console.log('🔄 Création budget Supabase...');
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const budgetData = this.mapBudgetToSupabase(budget);
      budgetData.user_id = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.budgetsTableName)
        .insert(budgetData)
        .select()
        .single();

      if (error) throw error;

      const newBudget = this.mapBudgetFromSupabase(data);
      console.log('✅ Budget créé:', newBudget.id);
      return newBudget;
    } catch (error) {
      console.error('❌ Erreur création budget:', error);
      return null;
    }
  }

  async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget | null> {
    try {
      console.log('🔄 Mise à jour budget Supabase...');
      
      const budgetData = this.mapBudgetToSupabase(budget);
      const { data, error } = await supabase
        .from(this.budgetsTableName)
        .update(budgetData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedBudget = this.mapBudgetFromSupabase(data);
      console.log('✅ Budget mis à jour:', updatedBudget.id);
      return updatedBudget;
    } catch (error) {
      console.error('❌ Erreur mise à jour budget:', error);
      return null;
    }
  }

  async deleteBudget(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression budget Supabase...');
      
      const { error } = await supabase
        .from(this.budgetsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Budget supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression budget:', error);
      return false;
    }
  }

  // ===== ANALYTICS =====

  async getFinanceAnalytics() {
    try {
      const [invoices, expenses, budgets] = await Promise.all([
        this.getAllInvoices(),
        this.getAllExpenses(),
        this.getAllBudgets()
      ]);

      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
      const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
      const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const paidAmount = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      const totalExpenses = expenses.length;
      const totalExpenseAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      const totalBudgets = budgets.length;
      const totalBudgetAmount = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
      const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);

      return {
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          pending: pendingInvoices,
          totalAmount: totalInvoiceAmount,
          paidAmount: paidAmount,
          pendingAmount: totalInvoiceAmount - paidAmount
        },
        expenses: {
          total: totalExpenses,
          totalAmount: totalExpenseAmount
        },
        budgets: {
          total: totalBudgets,
          totalAmount: totalBudgetAmount,
          totalSpent: totalSpent,
          remaining: totalBudgetAmount - totalSpent
        },
        summary: {
          netIncome: paidAmount - totalExpenseAmount,
          profitMargin: paidAmount > 0 ? ((paidAmount - totalExpenseAmount) / paidAmount) * 100 : 0
        }
      };
    } catch (error) {
      console.error('❌ Erreur analytics finance:', error);
      return null;
    }
  }
}

export const financeService = new FinanceService();
export default financeService;