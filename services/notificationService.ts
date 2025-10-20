/**
 * 🔔 SERVICE DE NOTIFICATIONS - ECOSYSTIA
 * Gestion des notifications pour les assignations et mises à jour
 */

import { supabase } from './supabaseService';

export interface Notification {
  id: string;
  user_id: string;
  type: 'assignment' | 'update' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: 'assignment' | 'update' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
}

class NotificationService {
  /**
   * Créer une nouvelle notification
   */
  async create(notificationData: CreateNotificationData): Promise<Notification | null> {
    try {
      console.log('🔔 Création notification:', notificationData.title);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notificationData.user_id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || null,
          read: false
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Notification créée:', data.id);
      return data;
    } catch (error: any) {
      console.error('❌ Erreur création notification:', error.message);
      return null;
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getByUser(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('❌ Erreur récupération notifications:', error.message);
      return [];
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      console.log('✅ Notification marquée comme lue:', notificationId);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur marquage notification:', error.message);
      return false;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      console.log('✅ Toutes les notifications marquées comme lues');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur marquage notifications:', error.message);
      return false;
    }
  }

  /**
   * Supprimer une notification
   */
  async delete(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      console.log('✅ Notification supprimée:', notificationId);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression notification:', error.message);
      return false;
    }
  }

  /**
   * Notifier une assignation de projet
   */
  async notifyProjectAssignment(userId: string, projectName: string, assignedBy: string): Promise<Notification | null> {
    return this.create({
      user_id: userId,
      type: 'assignment',
      title: 'Nouvelle assignation de projet',
      message: `Vous avez été assigné au projet "${projectName}" par ${assignedBy}`,
      data: { project_name: projectName, assigned_by: assignedBy }
    });
  }

  /**
   * Notifier une assignation de tâche
   */
  async notifyTaskAssignment(userId: string, taskTitle: string, projectName: string, assignedBy: string): Promise<Notification | null> {
    return this.create({
      user_id: userId,
      type: 'assignment',
      title: 'Nouvelle tâche assignée',
      message: `Vous avez été assigné à la tâche "${taskTitle}" dans le projet "${projectName}" par ${assignedBy}`,
      data: { task_title: taskTitle, project_name: projectName, assigned_by: assignedBy }
    });
  }

  /**
   * Notifier une mise à jour de projet
   */
  async notifyProjectUpdate(userId: string, projectName: string, updateType: string, updatedBy: string): Promise<Notification | null> {
    return this.create({
      user_id: userId,
      type: 'update',
      title: 'Projet mis à jour',
      message: `Le projet "${projectName}" a été ${updateType} par ${updatedBy}`,
      data: { project_name: projectName, update_type: updateType, updated_by: updatedBy }
    });
  }
}

export const notificationService = new NotificationService();
