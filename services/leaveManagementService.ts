/**
 * 🏖️ SERVICE LEAVE MANAGEMENT SIMPLIFIÉ
 * Service simplifié sans règles d'éligibilité complexes
 */

import { supabase } from './supabaseService';
import { LeaveRequest } from '../types';

class LeaveManagementService {
  private tableName = 'leave_requests';

  /**
   * Récupérer toutes les demandes de congé
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
   * Créer une nouvelle demande de congé
   */
  async create(leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
    try {
      console.log('🔄 Création demande de congé...');
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Requête simplifiée avec colonnes obligatoires
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: user.id, // Utiliser directement l'ID de l'utilisateur connecté
          leave_type_id: '81be1bb2-62bc-487d-98e5-382cf095271c', // UUID du congé annuel
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
          start_date: updates.startDate,
          end_date: updates.endDate,
          reason: updates.reason,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour demande:', error);
        throw error;
      }

      // Mapper les données retournées
      const mappedData = {
        id: data.id,
        employeeId: data.user_id,
        leaveType: 'annual',
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

      console.log('✅ Demande mise à jour');
      return mappedData as LeaveRequest;
    } catch (error) {
      console.error('❌ Erreur mise à jour demande:', error);
      throw error;
    }
  }

  /**
   * Supprimer une demande de congé
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log(`🔄 Suppression demande ${id}...`);
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression demande:', error);
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
   * Calculer le nombre de jours entre deux dates
   */
  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}

export const leaveManagementService = new LeaveManagementService();
export default leaveManagementService;
