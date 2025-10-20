/**
 * 📁 SERVICE PROJECTS - ECOSYSTIA
 * Gestion complète des projets avec Supabase
 */

import { supabaseDataService } from './supabaseDataService';
import { Project, Task, Risk, User } from '../types';
import AuthUtils from './authUtils';
import { supabase } from './supabaseService';

class ProjectService {
  /**
   * Convertir un projet Supabase en Project
   */
  private mapFromSupabase(data: any): Project {
    return {
      id: data.id,
      title: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority || 'Medium',
      startDate: data.start_date,  // AJOUTÉ pour alignement MVP client
      dueDate: data.end_date,
      budget: data.budget,
      client: data.client || '',  // AJOUTÉ
      tags: data.tags || [],       // AJOUTÉ
      team: data.team_members || [],
      owner: data.owner_id,        // AJOUTÉ pour compatibilité
      ownerId: data.owner_id,
      tasks: [],
      risks: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Convertir un Project en données Supabase
   */
  private mapToSupabase(project: Partial<Project>): any {
    const data: any = {};
    
    if (project.title !== undefined) data.name = project.title;
    if (project.description !== undefined) data.description = project.description;
    if (project.status !== undefined) data.status = project.status;
    if (project.priority !== undefined) data.priority = project.priority;
    if (project.startDate !== undefined) data.start_date = project.startDate;  // AJOUTÉ
    if (project.dueDate !== undefined) data.end_date = project.dueDate;
    if (project.budget !== undefined) data.budget = project.budget;
    if (project.client !== undefined) data.client = project.client;  // AJOUTÉ
    if (project.tags !== undefined) data.tags = project.tags;  // AJOUTÉ
    if (project.team !== undefined) data.team_members = project.team;
    if (project.owner !== undefined) data.owner_id = project.owner;
    
    return data;
  }

  /**
   * Créer un nouveau projet
   */
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      console.log('🔄 Création projet Supabase:', project.title);
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const projectData = this.mapToSupabase(project);
      projectData.owner_id = user.id; // Utiliser directement l'ID de l'utilisateur
      projectData.start_date = project.startDate || new Date().toISOString().split('T')[0];
      
      const createdProject = await supabaseDataService.createProject(projectData);
      
      console.log('✅ Projet créé:', createdProject.id);
      return this.mapFromSupabase(createdProject);
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les projets (filtrés par utilisateur)
   */
  async getAll(userId?: string): Promise<Project[]> {
    try {
      console.log('🔄 Récupération projets Supabase...');
      
      const projects = await supabaseDataService.getProjects();
      console.log(`🔍 Debug - ${projects.length} projets récupérés de la base`);
      
      // TEMPORAIRE : Retourner tous les projets pour la présentation
      // TODO: Réimplémenter l'isolation correctement après la présentation
      const mappedProjects = projects.map(project => this.mapFromSupabase(project));
      
      console.log(`✅ ${mappedProjects.length} projets mappés et retournés`);
      return mappedProjects;
    } catch (error) {
      console.error('❌ Erreur récupération projets:', error);
      return [];
    }
  }

  /**
   * Récupérer un projet par ID
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const projects = await supabaseDataService.getProjects();
      const project = projects.find(p => p.id === id);
      
      if (!project) return null;
      
      return this.mapFromSupabase(project);
    } catch (error) {
      console.error('❌ Erreur récupération projet:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un projet
   */
  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      console.log('🔄 Mise à jour projet:', id);
      
      const projectData = this.mapToSupabase(updates);
      const updatedProject = await supabaseDataService.updateProject(id, projectData);
      
      console.log('✅ Projet mis à jour:', id);
      return this.mapFromSupabase(updatedProject);
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      return null;
    }
  }

  /**
   * Supprimer un projet
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression projet:', id);
      
      await supabaseDataService.deleteProject(id);
      
      console.log('✅ Projet supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      return false;
    }
  }

  /**
   * Récupérer les projets par statut
   */
  async getByStatus(status: string): Promise<Project[]> {
    try {
      const projects = await supabaseDataService.getProjects();
      const filteredProjects = projects.filter(p => p.status === status);
      
      return filteredProjects.map(project => this.mapFromSupabase(project));
    } catch (error) {
      console.error('❌ Erreur récupération projets par statut:', error);
      return [];
    }
  }

  /**
   * Récupérer les projets par propriétaire
   */
  async getByOwner(ownerId: string): Promise<Project[]> {
    try {
      const projects = await supabaseDataService.getProjects();
      const filteredProjects = projects.filter(p => p.owner_id === ownerId);
      
      return filteredProjects.map(project => this.mapFromSupabase(project));
    } catch (error) {
      console.error('❌ Erreur récupération projets par propriétaire:', error);
      return [];
    }
  }

  /**
   * Récupérer les projets par équipe
   */
  async getByTeam(teamMemberId: string): Promise<Project[]> {
    try {
      const projects = await supabaseDataService.getProjects();
      const filteredProjects = projects.filter(p => 
        p.team_members && p.team_members.includes(teamMemberId)
      );
      
      return filteredProjects.map(project => this.mapFromSupabase(project));
    } catch (error) {
      console.error('❌ Erreur récupération projets par équipe:', error);
      return [];
    }
  }

  /**
   * Calculer les statistiques des projets
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    cancelled: number;
    averageProgress: number;
  }> {
    try {
      const projects = await supabaseDataService.getProjects();
      
      const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
        averageProgress: 0
      };
      
      if (projects.length > 0) {
        const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
        stats.averageProgress = Math.round(totalProgress / projects.length);
      }
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur calcul statistiques projets:', error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0,
        averageProgress: 0
      };
    }
  }

  /**
   * Rechercher des projets
   */
  async search(query: string): Promise<Project[]> {
    try {
      const projects = await supabaseDataService.getProjects();
      const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      return filteredProjects.map(project => this.mapFromSupabase(project));
    } catch (error) {
      console.error('❌ Erreur recherche projets:', error);
      return [];
    }
  }

  /**
   * Ajouter une tâche à un projet
   */
  async addTask(projectId: string, taskData: Omit<Task, 'id'>): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const newTask: Task = {
        id: `task_${Date.now()}`,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedTasks = [...(project.tasks || []), newTask];
      const updatedProject = { ...project, tasks: updatedTasks };

      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur ajout tâche:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une tâche
   */
  async updateTask(projectId: string, taskId: string, taskData: Partial<Task>): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTasks = (project.tasks || []).map(task => 
        task.id === taskId 
          ? { ...task, ...taskData, updatedAt: new Date() }
          : task
      );

      const updatedProject = { ...project, tasks: updatedTasks };
      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      throw error;
    }
  }

  /**
   * Supprimer une tâche
   */
  async deleteTask(projectId: string, taskId: string): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTasks = (project.tasks || []).filter(task => task.id !== taskId);
      const updatedProject = { ...project, tasks: updatedTasks };

      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw error;
    }
  }

  /**
   * Ajouter un risque à un projet
   */
  async addRisk(projectId: string, riskData: Omit<Risk, 'id'>): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const newRisk: Risk = {
        id: `risk_${Date.now()}`,
        ...riskData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedRisks = [...(project.risks || []), newRisk];
      const updatedProject = { ...project, risks: updatedRisks };

      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur ajout risque:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un risque
   */
  async updateRisk(projectId: string, riskId: string, riskData: Partial<Risk>): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedRisks = (project.risks || []).map(risk => 
        risk.id === riskId 
          ? { ...risk, ...riskData, updatedAt: new Date() }
          : risk
      );

      const updatedProject = { ...project, risks: updatedRisks };
      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur mise à jour risque:', error);
      throw error;
    }
  }

  /**
   * Supprimer un risque
   */
  async deleteRisk(projectId: string, riskId: string): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedRisks = (project.risks || []).filter(risk => risk.id !== riskId);
      const updatedProject = { ...project, risks: updatedRisks };

      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur suppression risque:', error);
      throw error;
    }
  }

  /**
   * Ajouter un membre à l'équipe
   */
  async addTeamMember(projectId: string, user: any): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTeam = [...(project.team_members || []), user.id];
      const updatedProject = { ...project, team_members: updatedTeam };

      const result = await this.update(projectId, updatedProject);
      
      // Envoyer une notification à l'utilisateur assigné
      if (result) {
        try {
          const { notificationService } = await import('./notificationService');
          await notificationService.notifyProjectAssignment(
            user.id,
            project.name,
            'Système' // TODO: Récupérer le nom de l'utilisateur qui fait l'assignation
          );
          console.log('✅ Notification d\'assignation envoyée');
        } catch (notificationError) {
          console.warn('⚠️ Erreur envoi notification:', notificationError);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur ajout membre équipe:', error);
      throw error;
    }
  }

  /**
   * Supprimer un membre de l'équipe
   */
  async removeTeamMember(projectId: string, userId: string): Promise<Project | null> {
    try {
      const project = await this.getById(projectId);
      if (!project) return null;

      const updatedTeam = (project.team || []).filter(id => id !== userId);
      const updatedProject = { ...project, team: updatedTeam };

      return await this.update(projectId, updatedProject);
    } catch (error) {
      console.error('❌ Erreur suppression membre équipe:', error);
      throw error;
    }
  }

}

export const projectService = new ProjectService();