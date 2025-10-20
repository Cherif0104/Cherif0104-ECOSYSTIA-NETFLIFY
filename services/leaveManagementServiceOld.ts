/**
 * 🏖️ SERVICE LEAVE MANAGEMENT STANDARDISÉ
 * Gestion des congés et absences - Architecture standardisée
 */

import { supabase } from './supabaseService';
import { LeaveRequest, User } from '../types';

class LeaveManagementService {
  private tableName = 'leave_requests';

  /**
   * Récupérer toutes les demandes de congé (filtrées par utilisateur)
   */
  async getAll(userId?: string): Promise<LeaveRequest[]> {
    try {
      console.log('🔄 Récupération demandes de congé...');
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      // Filtrer par utilisateur si fourni
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erreur récupération demandes:', error);
        throw error;
      }

      // Mapper les données vers notre interface LeaveRequest
      const mappedData = data.map((item: any) => ({
        id: item.id,
        employeeId: item.user_id,
        leaveType: 'annual', // Valeur par défaut
        startDate: item.start_date,
        endDate: item.end_date,
        reason: item.reason || '',
        status: item.status,
        projectId: '',
        daysRequested: this.calculateDays(item.start_date, item.end_date),
        approvedBy: item.approver_id || null,
        approvedAt: item.updated_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isEligible: true,
        eligibilityReason: '',
        managerId: item.approver_id || null,
        isManualRequest: false,
        createdBy: item.user_id
      }));

      console.log(`✅ ${mappedData.length} demandes récupérées`);
      return mappedData as LeaveRequest[];
    } catch (error) {
      console.error('❌ Erreur service leave management:', error);
      throw error;
    }
  }

  /**
   * Calculer le nombre de jours entre deux dates
   */
  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Récupérer une demande par ID
   */
  async getById(id: string): Promise<LeaveRequest | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`❌ Erreur récupération demande ${id}:`, error);
        return null;
      }

      return data as LeaveRequest;
    } catch (error) {
      console.error('❌ Erreur récupération demande:', error);
      return null;
    }
  }

  /**
   * Créer une nouvelle demande de congé
   */
  async create(leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    try {
      console.log('🔄 Création demande de congé...');
      
      // Requête simplifiée avec seulement les colonnes essentielles
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: leaveRequest.employeeId,
          leave_type_id: 1, // ID par défaut pour le type de congé
          start_date: leaveRequest.startDate,
          end_date: leaveRequest.endDate,
          reason: leaveRequest.reason,
          status: leaveRequest.status || 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création demande:', error);
        throw error;
      }

      console.log('✅ Demande de congé créée:', data.id);
      
      // Mapper les données retournées
      const mappedData = {
        id: data.id,
        employeeId: data.user_id,
        leaveType: 'annual', // Valeur par défaut
        startDate: data.start_date,
        endDate: data.end_date,
        reason: data.reason || '',
        status: data.status,
        projectId: '',
        daysRequested: this.calculateDays(data.start_date, data.end_date),
        approvedBy: data.approver_id || null,
        approvedAt: data.updated_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isEligible: true,
        eligibilityReason: '',
        managerId: data.approver_id || null,
        isManualRequest: false,
        createdBy: data.user_id
      };
      
      return mappedData as LeaveRequest;
    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une demande de congé
   */
  async update(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
    try {
      console.log(`🔄 Mise à jour demande ${id}...`);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erreur mise à jour demande ${id}:`, error);
        throw error;
      }

      console.log('✅ Demande mise à jour');
      return data as LeaveRequest;
    } catch (error) {
      console.error('❌ Erreur mise à jour demande:', error);
      throw error;
    }
  }

  /**
   * Supprimer une demande de congé
   */
  async remove(id: string): Promise<boolean> {
    try {
      console.log(`🔄 Suppression demande ${id}...`);
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Erreur suppression demande ${id}:`, error);
        throw error;
      }

      console.log('✅ Demande supprimée');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression demande:', error);
      throw error;
    }
  }

  /**
   * Approuver une demande de congé
   */
  async approve(id: string, approvedBy: string): Promise<LeaveRequest | null> {
    try {
      console.log(`🔄 Approbation demande ${id}...`);
      
      return await this.update(id, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      throw error;
    }
  }

  /**
   * Rejeter une demande de congé
   */
  async reject(id: string, approvedBy: string): Promise<LeaveRequest | null> {
    try {
      console.log(`🔄 Rejet demande ${id}...`);
      
      return await this.update(id, {
        status: 'rejected',
        approvedBy,
        approvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes par employé
   */
  async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération demandes employé:', error);
        throw error;
      }

      return data as LeaveRequest[];
    } catch (error) {
      console.error('❌ Erreur récupération demandes employé:', error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes par statut
   */
  async getByStatus(status: string): Promise<LeaveRequest[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération demandes par statut:', error);
        throw error;
      }

      return data as LeaveRequest[];
    } catch (error) {
      console.error('❌ Erreur récupération demandes par statut:', error);
      throw error;
    }
  }

  // Méthode checkEligibility supprimée

  // Méthodes complexes supprimées pour simplifier

  /**
   * Valider ou rejeter une demande
   */
  async validateRequest(requestId: string, managerId: string, action: 'approve' | 'reject'): Promise<LeaveRequest | null> {
    try {
      console.log(`🔄 ${action === 'approve' ? 'Validation' : 'Rejet'} demande ${requestId}...`);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          approver_id: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select('*')
        .single();

      if (error) {
        console.error(`❌ Erreur ${action} demande:`, error);
        throw error;
      }

      // Récupérer le type de congé
      const { data: leaveType } = await supabase
        .from('leave_types')
        .select('*')
        .eq('id', data.leave_type_id)
        .single();

      // Mapper les données
      const mappedData = {
        id: data.id,
        employeeId: data.user_id,
        leaveType: leaveType?.name || 'annual',
        startDate: data.start_date,
        endDate: data.end_date,
        reason: data.reason || '',
        status: data.status,
        projectId: '',
        daysRequested: this.calculateDays(data.start_date, data.end_date),
        approvedBy: data.approver_id,
        approvedAt: data.updated_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isEligible: true,
        eligibilityReason: '',
        managerId: data.approver_id,
        isManualRequest: false,
        createdBy: data.user_id
      };

      console.log(`✅ Demande ${action === 'approve' ? 'validée' : 'rejetée'}`);
      return mappedData as LeaveRequest;
    } catch (error) {
      console.error(`❌ Erreur ${action} demande:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les demandes en attente de validation
   */
  async getPendingRequests(managerId?: string): Promise<LeaveRequest[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erreur récupération demandes en attente:', error);
        throw error;
      }

      return data as LeaveRequest[];
    } catch (error) {
      console.error('❌ Erreur récupération demandes en attente:', error);
      throw error;
    }
  }

  /**
   * Créer une demande manuelle (par manager/admin)
   */
  async createManualRequest(leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<LeaveRequest> {
    try {
      console.log('🔄 Création demande manuelle...');
      
      const manualRequest = {
        ...leaveRequest,
        isManualRequest: true,
        createdBy,
        isEligible: true, // Les demandes manuelles sont toujours éligibles
        status: 'pending' as const
      };

      return await this.create(manualRequest);
    } catch (error) {
      console.error('❌ Erreur création demande manuelle:', error);
      throw error;
    }
  }
}

export const leaveManagementService = new LeaveManagementService();
