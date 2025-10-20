import { supabase } from './supabaseService';
import { TimeLog, Project } from '../types';

class TimeTrackingService {
  private timeLogsTableName = 'time_logs';

  /**
   * Convertir un TimeLog Supabase en TimeLog
   */
  private mapFromSupabase(data: any): TimeLog {
    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      taskName: data.task_id || data.description || 'Tâche générale', // Utiliser task_id ou description
      description: data.description || '',
      startTime: data.date ? new Date(data.date) : new Date(),
      endTime: undefined, // Pas de champ end_time dans la table
      duration: data.hours ? Math.round(data.hours * 60) : 0, // Convertir heures en minutes
      status: 'completed', // Toujours completed car pas de statut dans la table
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  /**
   * Convertir un TimeLog en données Supabase
   */
  private mapToSupabase(timeLog: Partial<TimeLog>): any {
    const data: any = {};
    
    if (timeLog.userId !== undefined) data.user_id = timeLog.userId;
    if (timeLog.projectId !== undefined) data.project_id = timeLog.projectId;
    if (timeLog.taskName !== undefined) data.description = timeLog.taskName; // Stocker le nom de la tâche dans description temporairement
    // Note: description sera écrasé par taskName si les deux sont fournis
    if (timeLog.startTime !== undefined) {
      // Convertir en Date si c'est une string
      const date = timeLog.startTime instanceof Date ? timeLog.startTime : new Date(timeLog.startTime);
      data.date = date.toISOString().split('T')[0];
    }
    if (timeLog.duration !== undefined) data.hours = timeLog.duration / 60; // Convertir minutes en heures
    data.updated_at = new Date().toISOString();
    
    return data;
  }

  /**
   * Récupérer tous les time logs (filtrés par utilisateur)
   */
  async getAll(userId?: string): Promise<TimeLog[]> {
    try {
      let query = supabase
        .from(this.timeLogsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      // Filtrer par utilisateur si fourni
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log(`✅ ${data.length} time logs récupérés`);
      return data.map(this.mapFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération time logs:', error.message);
      return [];
    }
  }

  /**
   * Récupérer les time logs d'un utilisateur
   */
  async getByUserId(userId: string): Promise<TimeLog[]> {
    try {
      const { data, error } = await supabase
        .from(this.timeLogsTableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} time logs récupérés pour l'utilisateur ${userId}`);
      return data.map(this.mapFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération time logs utilisateur:', error.message);
      return [];
    }
  }

  /**
   * Récupérer les time logs d'un projet
   */
  async getByProjectId(projectId: string): Promise<TimeLog[]> {
    try {
      const { data, error } = await supabase
        .from(this.timeLogsTableName)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ ${data.length} time logs récupérés pour le projet ${projectId}`);
      return data.map(this.mapFromSupabase);
    } catch (error: any) {
      console.error('❌ Erreur récupération time logs projet:', error.message);
      return [];
    }
  }

  /**
   * Créer un nouveau time log
   */
  async create(timeLogData: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog | null> {
    try {
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const supabaseData = this.mapToSupabase(timeLogData);
      supabaseData.user_id = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.timeLogsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Time log créé dans Supabase:', data.id);
      return this.mapFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur création time log:', error.message);
      throw error;
    }
  }

  /**
   * Mettre à jour un time log
   */
  async update(id: string, timeLogData: Partial<TimeLog>): Promise<TimeLog | null> {
    try {
      const supabaseData = this.mapToSupabase(timeLogData);
      const { data, error } = await supabase
        .from(this.timeLogsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Time log mis à jour dans Supabase:', id);
      return this.mapFromSupabase(data);
    } catch (error: any) {
      console.error('❌ Erreur mise à jour time log:', error.message);
      throw error;
    }
  }

  /**
   * Supprimer un time log
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.timeLogsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Time log supprimé de Supabase:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression time log:', error.message);
      return false;
    }
  }

  /**
   * Démarrer un timer
   */
  async startTimer(userId: string, projectId: string, taskName: string, description?: string): Promise<TimeLog | null> {
    try {
      const timeLogData = {
        userId,
        projectId,
        taskName,
        description: description || '',
        startTime: new Date(),
        duration: 0, // Commencer avec 0 minutes
        status: 'active' as const,
      };

      return await this.create(timeLogData);
    } catch (error: any) {
      console.error('❌ Erreur démarrage timer:', error.message);
      throw error;
    }
  }

  /**
   * Arrêter un timer
   */
  async stopTimer(id: string): Promise<TimeLog | null> {
    try {
      // Récupérer le time log actuel
      const { data: currentLog, error: fetchError } = await supabase
        .from(this.timeLogsTableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Calculer la durée basée sur la date et les heures actuelles
      const currentDate = new Date();
      const logDate = new Date(currentLog.date);
      const duration = currentLog.hours || 0; // Utiliser les heures existantes

      const updateData = {
        hours: duration + 0.5, // Ajouter 30 minutes par exemple
        updated_at: new Date().toISOString(),
      };

      return await this.update(id, updateData);
    } catch (error: any) {
      console.error('❌ Erreur arrêt timer:', error.message);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques de temps
   */
  async getTimeStats(userId?: string, projectId?: string): Promise<any> {
    try {
      let query = supabase.from(this.timeLogsTableName).select('*');
      
      if (userId) query = query.eq('user_id', userId);
      if (projectId) query = query.eq('project_id', projectId);
      
      const { data, error } = await query;
      if (error) throw error;

      const totalTime = data.reduce((sum, log) => sum + (log.duration || 0), 0);
      const activeTimers = data.filter(log => log.status === 'active').length;
      const completedLogs = data.filter(log => log.status === 'completed').length;

      return {
        totalTime, // en minutes
        activeTimers,
        completedLogs,
        totalLogs: data.length,
        averageSessionTime: completedLogs > 0 ? Math.round(totalTime / completedLogs) : 0,
      };
    } catch (error: any) {
      console.error('❌ Erreur calcul statistiques temps:', error.message);
      throw error;
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
