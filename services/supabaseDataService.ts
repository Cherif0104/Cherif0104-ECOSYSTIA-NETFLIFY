import { supabase } from './supabaseService';
import { Objective, KeyResult, Project, TimeLog, LeaveRequest, Invoice, Expense, Budget } from '../types';

export const supabaseDataService = {
  // OBJECTIVES
  async getObjectives(): Promise<Objective[]> {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      startDate: item.start_date,
      endDate: item.end_date,
      progress: item.progress,
      ownerId: item.owner_id,
      category: item.category || '',
      owner: item.owner_name || '',
      team: item.team_members || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async createObjective(objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>): Promise<Objective> {
    const { data, error } = await supabase
      .from('objectives')
      .insert([{
        title: objective.title,
        description: objective.description,
        status: objective.status,
        priority: objective.priority,
        start_date: objective.startDate,
        end_date: objective.endDate,
        progress: objective.progress,
        owner_id: objective.ownerId,
        category: objective.category,
        owner_name: objective.owner,
        team_members: objective.team || [],
        quarter: objective.quarter || 'Q4',
        year: objective.year || new Date().getFullYear()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.start_date,
      endDate: data.end_date,
      progress: data.progress,
      ownerId: data.owner_id,
      category: data.category || '',
      owner: data.owner_name || '',
      team: data.team_members || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
    const { data, error } = await supabase
      .from('objectives')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        start_date: updates.startDate,
        end_date: updates.endDate,
        progress: updates.progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.start_date,
      endDate: data.end_date,
      progress: data.progress,
      ownerId: data.owner_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteObjective(id: string): Promise<void> {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // KEY RESULTS
  async getKeyResults(objectiveId: string): Promise<KeyResult[]> {
    const { data, error } = await supabase
      .from('key_results')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(kr => ({
      id: kr.id,
      objectiveId: kr.objective_id,
      title: kr.title,
      description: kr.description,
      targetValue: kr.target_value,
      currentValue: kr.current_value,
      unit: kr.unit,
      status: kr.status,
      createdAt: kr.created_at,
      updatedAt: kr.updated_at
    })) || [];
  },

  async createKeyResult(keyResult: Omit<KeyResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<KeyResult> {
    const { data, error } = await supabase
      .from('key_results')
      .insert([{
        objective_id: keyResult.objectiveId,
        title: keyResult.title,
        description: keyResult.description,
        target_value: keyResult.targetValue,
        current_value: keyResult.currentValue,
        unit: keyResult.unit,
        status: keyResult.status
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      objectiveId: data.objective_id,
      title: data.title,
      description: data.description,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateKeyResult(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
    const { data, error } = await supabase
      .from('key_results')
      .update({
        title: updates.title,
        description: updates.description,
        target_value: updates.targetValue,
        current_value: updates.currentValue,
        unit: updates.unit,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      objectiveId: data.objective_id,
      title: data.title,
      description: data.description,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteKeyResult(id: string): Promise<void> {
    const { error } = await supabase
      .from('key_results')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // PROJECTS
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.start_date,
      endDate: project.end_date,
      progress: project.progress,
      budget: project.budget,
      ownerId: project.owner_id,
      teamMembers: project.team_members || [],
      createdAt: project.created_at,
      updatedAt: project.updated_at
    })) || [];
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: project.startDate,
        end_date: project.endDate,
        progress: project.progress,
        budget: project.budget,
        owner_id: project.ownerId || project.owner_id,
        team_members: project.teamMembers
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.start_date,
      endDate: data.end_date,
      progress: data.progress,
      budget: data.budget,
      ownerId: data.owner_id,
      teamMembers: data.team_members || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        start_date: updates.startDate,
        end_date: updates.endDate,
        progress: updates.progress,
        budget: updates.budget,
        team_members: updates.teamMembers,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: data.start_date,
      endDate: data.end_date,
      progress: data.progress,
      budget: data.budget,
      ownerId: data.owner_id,
      teamMembers: data.team_members || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // TIME LOGS
  async getTimeLogs(): Promise<TimeLog[]> {
    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(log => ({
      id: log.id,
      userId: log.user_id,
      projectId: log.project_id,
      taskId: log.task_id,
      description: log.description,
      hours: log.hours,
      date: log.date,
      createdAt: log.created_at,
      updatedAt: log.updated_at
    })) || [];
  },

  async createTimeLog(timeLog: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog> {
    const { data, error } = await supabase
      .from('time_logs')
      .insert([{
        user_id: timeLog.userId,
        project_id: timeLog.projectId,
        task_id: timeLog.taskId,
        description: timeLog.description,
        hours: timeLog.hours,
        date: timeLog.date
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      taskId: data.task_id,
      description: data.description,
      hours: data.hours,
      date: data.date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // LEAVE REQUESTS
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(request => ({
      id: request.id,
      employeeId: request.employee_id,
      leaveType: request.leave_type,
      startDate: request.start_date,
      endDate: request.end_date,
      daysRequested: request.days_requested,
      reason: request.reason,
      status: request.status,
      approvedBy: request.approved_by,
      approvedAt: request.approved_at,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    })) || [];
  },

  async createLeaveRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{
        employee_id: leaveRequest.employeeId,
        leave_type: leaveRequest.leaveType,
        start_date: leaveRequest.startDate,
        end_date: leaveRequest.endDate,
        days_requested: leaveRequest.daysRequested,
        reason: leaveRequest.reason,
        status: leaveRequest.status
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      employeeId: data.employee_id,
      leaveType: data.leave_type,
      startDate: data.start_date,
      endDate: data.end_date,
      daysRequested: data.days_requested,
      reason: data.reason,
      status: data.status,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // INVOICES
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.client_name,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.due_date,
      issuedDate: invoice.issued_date,
      createdBy: invoice.created_by,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at
    })) || [];
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.clientName,
        amount: invoice.amount,
        status: invoice.status,
        due_date: invoice.dueDate,
        issued_date: invoice.issuedDate,
        created_by: invoice.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      clientName: data.client_name,
      amount: data.amount,
      status: data.status,
      dueDate: data.due_date,
      issuedDate: data.issued_date,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // EXPENSES
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      receiptUrl: expense.receipt_url,
      createdBy: expense.created_by,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at
    })) || [];
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        receipt_url: expense.receiptUrl,
        created_by: expense.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      receiptUrl: data.receipt_url,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // BUDGETS
  async getBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(budget => ({
      id: budget.id,
      name: budget.name,
      category: budget.category,
      allocatedAmount: budget.allocated_amount,
      spentAmount: budget.spent_amount,
      periodStart: budget.period_start,
      periodEnd: budget.period_end,
      createdBy: budget.created_by,
      createdAt: budget.created_at,
      updatedAt: budget.updated_at
    })) || [];
  },

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        name: budget.name,
        category: budget.category,
        allocated_amount: budget.allocatedAmount,
        spent_amount: budget.spentAmount,
        period_start: budget.periodStart,
        period_end: budget.periodEnd,
        created_by: budget.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      allocatedAmount: data.allocated_amount,
      spentAmount: data.spent_amount,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};
