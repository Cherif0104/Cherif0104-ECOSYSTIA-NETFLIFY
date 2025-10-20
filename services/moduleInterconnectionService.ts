/**
 * 🔗 SERVICE D'INTERCONNEXION DES MODULES
 * Assure la communication et la synchronisation entre tous les modules
 */

import { supabase } from './supabaseService';
import { Project, TimeLog, Objective, Invoice, KnowledgeArticle, Job, Course } from '../types';

class ModuleInterconnectionService {
  /**
   * Mettre à jour les statistiques d'un projet après ajout de time log
   */
  async updateProjectStatsAfterTimeLog(projectId: string): Promise<void> {
    try {
      console.log('🔄 Mise à jour statistiques projet après time log...');
      
      // Récupérer tous les time logs du projet
      const { data: timeLogs, error } = await supabase
        .from('time_logs')
        .select('duration, status')
        .eq('project_id', projectId);

      if (error) throw error;

      // Calculer le temps total
      const totalTime = timeLogs?.reduce((sum, log) => sum + (log.duration || 0), 0) || 0;
      
      // Calculer le pourcentage de completion basé sur les time logs
      const completedLogs = timeLogs?.filter(log => log.status === 'completed').length || 0;
      const totalLogs = timeLogs?.length || 0;
      const completionPercentage = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

      // Mettre à jour le projet
      await supabase
        .from('projects')
        .update({
          total_time: totalTime,
          progress: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      console.log('✅ Statistiques projet mises à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour statistiques projet:', error);
    }
  }

  /**
   * Mettre à jour les statistiques d'un objectif après ajout de time log
   */
  async updateObjectiveStatsAfterTimeLog(objectiveId: string): Promise<void> {
    try {
      console.log('🔄 Mise à jour statistiques objectif après time log...');
      
      // Récupérer les time logs liés à l'objectif (via les tâches)
      const { data: timeLogs, error } = await supabase
        .from('time_logs')
        .select('duration, status')
        .eq('objective_id', objectiveId);

      if (error) throw error;

      // Calculer le temps total et la progression
      const totalTime = timeLogs?.reduce((sum, log) => sum + (log.duration || 0), 0) || 0;
      const completedLogs = timeLogs?.filter(log => log.status === 'completed').length || 0;
      const totalLogs = timeLogs?.length || 0;
      const progress = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

      // Mettre à jour l'objectif
      await supabase
        .from('objectives')
        .update({
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', objectiveId);

      console.log('✅ Statistiques objectif mises à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour statistiques objectif:', error);
    }
  }

  /**
   * Créer une notification pour les assignations d'équipe
   */
  async notifyTeamAssignment(userId: string, entityType: 'project' | 'objective', entityName: string): Promise<void> {
    try {
      console.log('🔄 Création notification assignation équipe...');
      
      await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          message: `Vous avez été assigné(e) à ${entityType === 'project' ? 'le projet' : 'l\'objectif'} "${entityName}"`,
          type: 'team_assignment',
          entity_id: entityType,
          read: false
        }]);

      console.log('✅ Notification créée');
    } catch (error) {
      console.error('❌ Erreur création notification:', error);
    }
  }

  /**
   * Synchroniser les données entre modules
   */
  async syncModuleData(moduleType: string, action: string, data: any): Promise<void> {
    try {
      console.log(`🔄 Synchronisation ${moduleType} - ${action}...`);
      
      switch (moduleType) {
        case 'time_tracking':
          if (action === 'create' && data.projectId) {
            await this.updateProjectStatsAfterTimeLog(data.projectId);
          }
          break;
          
        case 'projects':
          if (action === 'update' && data.team) {
            // Notifier les nouveaux membres d'équipe
            for (const memberId of data.team) {
              await this.notifyTeamAssignment(memberId, 'project', data.name);
            }
          }
          break;
          
        case 'objectives':
          if (action === 'update' && data.team) {
            // Notifier les nouveaux membres d'équipe
            for (const memberId of data.team) {
              await this.notifyTeamAssignment(memberId, 'objective', data.title);
            }
          }
          break;
      }
      
      console.log('✅ Synchronisation terminée');
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }

  /**
   * Récupérer les données liées pour un module
   */
  async getRelatedData(entityType: string, entityId: string): Promise<any> {
    try {
      console.log(`🔄 Récupération données liées ${entityType}...`);
      
      switch (entityType) {
        case 'project':
          const { data: projectData } = await supabase
            .from('projects')
            .select(`
              *,
              time_logs:time_logs(*),
              objectives:objectives(*)
            `)
            .eq('id', entityId)
            .single();
          return projectData;
          
        case 'objective':
          const { data: objectiveData } = await supabase
            .from('objectives')
            .select(`
              *,
              time_logs:time_logs(*)
            `)
            .eq('id', entityId)
            .single();
          return objectiveData;
          
        default:
          return null;
      }
    } catch (error) {
      console.error('❌ Erreur récupération données liées:', error);
      return null;
    }
  }

  /**
   * Mettre à jour les métriques globales
   */
  async updateGlobalMetrics(): Promise<void> {
    try {
      console.log('🔄 Mise à jour métriques globales...');
      
      // Compter les projets actifs
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'In Progress');
      
      // Compter les objectifs en cours
      const { count: activeObjectives } = await supabase
        .from('objectives')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'In Progress');
      
      // Calculer le temps total travaillé
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('duration');
      
      const totalWorkTime = timeLogs?.reduce((sum, log) => sum + (log.duration || 0), 0) || 0;
      
      console.log('✅ Métriques globales mises à jour:', {
        activeProjects,
        activeObjectives,
        totalWorkTime
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour métriques:', error);
    }
  }
}

export const moduleInterconnectionService = new ModuleInterconnectionService();
