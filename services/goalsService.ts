/**
 * 🎯 SERVICE GOALS (OKRs) - STANDARDISÉ
 * Architecture alignée avec projectService
 */

import { supabase } from './supabaseService';
import { Objective } from '../types';

class GoalsService {
  /**
   * Récupérer tous les objectifs (filtrés par utilisateur)
   */
  async getAll(userId?: string): Promise<Objective[]> {
    try {
      console.log('🔄 Récupération objectifs Supabase...');
      
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // TEMPORAIRE : Retourner tous les objectifs pour la présentation
      // TODO: Réimplémenter l'isolation correctement après la présentation
      const filteredData = data || [];

      const objectives = filteredData.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        status: item.status,
        priority: item.priority,
        startDate: item.start_date,
        endDate: item.end_date,
        progress: item.progress || 0,
        ownerId: item.owner_id,
        category: item.category || '',
        owner: item.owner_name || '',
        team: item.team_members || [],
        keyResults: [], // Chargés séparément si nécessaire
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        quarter: item.quarter,
        year: item.year
      }));

      console.log(`✅ ${objectives.length} objectifs récupérés`);
      return objectives;
    } catch (error) {
      console.error('❌ Erreur récupération objectifs:', error);
      throw error;
    }
  }

  /**
   * Récupérer un objectif par ID
   */
  async getById(id: string): Promise<Objective | null> {
    try {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        progress: data.progress || 0,
        ownerId: data.owner_id,
        category: data.category || '',
        owner: data.owner_name || '',
        team: data.team_members || [],
        keyResults: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        quarter: data.quarter,
        year: data.year
      };
    } catch (error) {
      console.error('❌ Erreur récupération objectif:', error);
      return null;
    }
  }

  /**
   * Créer un objectif
   */
  async create(objective: Partial<Objective>): Promise<Objective> {
    try {
      console.log('🔄 Création objectif...');
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const { data, error } = await supabase
        .from('objectives')
        .insert([{
          title: objective.title,
          description: objective.description,
          status: objective.status || 'Not Started',
          priority: objective.priority || 'Medium',
          start_date: objective.startDate,
          end_date: objective.endDate,
          progress: objective.progress || 0,
          owner_id: user.id, // Utiliser directement l'ID de l'utilisateur connecté
          category: objective.category,
          owner_name: objective.owner,
          team_members: objective.team || [],
          quarter: objective.quarter || 'Q4',
          year: objective.year || new Date().getFullYear()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Objectif créé:', data.id);
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        progress: data.progress || 0,
        ownerId: data.owner_id,
        category: data.category || '',
        owner: data.owner_name || '',
        team: data.team_members || [],
        keyResults: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        quarter: data.quarter,
        year: data.year
      };
    } catch (error) {
      console.error('❌ Erreur création objectif:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un objectif
   */
  async update(id: string, updates: Partial<Objective>): Promise<Objective | null> {
    try {
      console.log('🔄 Mise à jour objectif:', id);
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.progress !== undefined) updateData.progress = updates.progress;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.owner !== undefined) updateData.owner_name = updates.owner;
      if (updates.team !== undefined) updateData.team_members = updates.team;
      if (updates.quarter !== undefined) updateData.quarter = updates.quarter;
      if (updates.year !== undefined) updateData.year = updates.year;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('objectives')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Objectif mis à jour');
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        progress: data.progress || 0,
        ownerId: data.owner_id,
        category: data.category || '',
        owner: data.owner_name || '',
        team: data.team_members || [],
        keyResults: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        quarter: data.quarter,
        year: data.year
      };
    } catch (error) {
      console.error('❌ Erreur mise à jour objectif:', error);
      throw error;
    }
  }

  /**
   * Supprimer un objectif
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression objectif:', id);
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Objectif supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression objectif:', error);
      throw error;
    }
  }

  /**
   * Ajouter un membre à l'équipe
   */
  async addTeamMember(objectiveId: string, userId: string): Promise<Objective | null> {
    try {
      const objective = await this.getById(objectiveId);
      if (!objective) return null;

      const updatedTeam = [...(objective.team || []), userId];
      return await this.update(objectiveId, { team: updatedTeam });
    } catch (error) {
      console.error('❌ Erreur ajout membre équipe:', error);
      throw error;
    }
  }

  /**
   * Retirer un membre de l'équipe
   */
  async removeTeamMember(objectiveId: string, userId: string): Promise<Objective | null> {
    try {
      const objective = await this.getById(objectiveId);
      if (!objective) return null;

      const updatedTeam = (objective.team || []).filter(id => id !== userId);
      return await this.update(objectiveId, { team: updatedTeam });
    } catch (error) {
      console.error('❌ Erreur retrait membre équipe:', error);
      throw error;
    }
  }
}

export const goalsService = new GoalsService();
