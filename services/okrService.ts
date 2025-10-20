import { supabaseDataService } from './supabaseDataService';
import { Objective, KeyResult } from '../types';

class OKRService {
  // ===== OBJECTIVES =====

  async createObjective(objective: Omit<Objective, 'id' | 'keyResults' | 'createdAt' | 'updatedAt'>): Promise<Objective> {
    try {
      const createdObjective = await supabaseDataService.createObjective({
        title: objective.title,
        description: objective.description,
        status: objective.status,
        priority: objective.priority,
        startDate: objective.startDate,
        endDate: objective.endDate,
        progress: objective.progress,
        ownerId: objective.ownerId
      });

      return {
        ...createdObjective,
        keyResults: [],
        category: objective.category || '',
        owner: objective.owner || '',
        team: objective.team || []
      };
    } catch (error) {
      console.error('Erreur création objectif:', error);
      throw error;
    }
  }

  async getAllObjectives(): Promise<Objective[]> {
    try {
      const objectives = await supabaseDataService.getObjectives();
      
      // Load key results for each objective
      const objectivesWithKeyResults = await Promise.all(
        objectives.map(async (objective) => {
          const keyResults = await this.getKeyResultsByObjectiveId(objective.id);
          return {
            ...objective,
            keyResults
          };
        })
      );

      return objectivesWithKeyResults;
    } catch (error) {
      console.error('Erreur récupération objectifs:', error);
      throw error;
    }
  }

  async getObjectiveById(id: string): Promise<Objective | null> {
    try {
      const objectives = await supabaseDataService.getObjectives();
      const objective = objectives.find(obj => obj.id === id);
      
      if (!objective) return null;

      // Load key results for this objective
      const keyResults = await this.getKeyResultsByObjectiveId(id);

      return {
        ...objective,
        keyResults
      };
    } catch (error) {
      console.error('Erreur récupération objectif:', error);
      return null;
    }
  }

  async updateObjective(id: string, objective: Partial<Objective>): Promise<boolean> {
    try {
      await supabaseDataService.updateObjective(id, {
        title: objective.title,
        description: objective.description,
        status: objective.status,
        priority: objective.priority,
        startDate: objective.startDate,
        endDate: objective.endDate,
        progress: objective.progress,
        ownerId: objective.ownerId
      });

      return true;
    } catch (error) {
      console.error('Erreur mise à jour objectif:', error);
      return false;
    }
  }

  async deleteObjective(id: string): Promise<boolean> {
    try {
      // First delete all key results for this objective
      const keyResults = await this.getKeyResultsByObjectiveId(id);
      for (const keyResult of keyResults) {
        await this.deleteKeyResult(keyResult.id);
      }

      // Then delete the objective
      await supabaseDataService.deleteObjective(id);

      return true;
    } catch (error) {
      console.error('Erreur suppression objectif:', error);
      return false;
    }
  }

  async updateObjectiveTeam(objectiveId: string, teamMembers: string[]): Promise<Objective | null> {
    try {
      const { supabase } = await import('./supabaseService');
      
      const { data, error } = await supabase
        .from('objectives')
        .update({ team_members: teamMembers })
        .eq('id', objectiveId)
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
    } catch (error) {
      console.error('Erreur mise à jour équipe objectif:', error);
      throw error;
    }
  }

  // ===== KEY RESULTS =====

  async createKeyResult(keyResult: Omit<KeyResult, 'id'>): Promise<KeyResult> {
    try {
      const createdKeyResult = await supabaseDataService.createKeyResult({
        objectiveId: keyResult.objectiveId,
        title: keyResult.title,
        description: keyResult.description,
        targetValue: keyResult.target,
        currentValue: keyResult.current,
        unit: keyResult.unit,
        status: keyResult.status || 'active'
      });

      return {
        id: createdKeyResult.id,
        objectiveId: createdKeyResult.objectiveId,
        title: createdKeyResult.title,
        description: createdKeyResult.description,
        target: createdKeyResult.targetValue,
        current: createdKeyResult.currentValue,
        unit: createdKeyResult.unit,
        progress: keyResult.progress || 0,
        status: createdKeyResult.status,
        createdAt: createdKeyResult.createdAt,
        updatedAt: createdKeyResult.updatedAt
      };
    } catch (error) {
      console.error('Erreur création key result:', error);
      throw error;
    }
  }

  async getKeyResultsByObjectiveId(objectiveId: string): Promise<KeyResult[]> {
    try {
      const keyResults = await supabaseDataService.getKeyResults(objectiveId);
      
      return keyResults.map(kr => ({
        id: kr.id,
        objectiveId: kr.objectiveId,
        title: kr.title,
        description: kr.description,
        target: kr.targetValue,
        current: kr.currentValue,
        unit: kr.unit,
        progress: kr.currentValue && kr.targetValue ? (kr.currentValue / kr.targetValue) * 100 : 0,
        status: kr.status,
        createdAt: kr.createdAt,
        updatedAt: kr.updatedAt
      }));
    } catch (error) {
      console.error('Erreur récupération key results:', error);
      return [];
    }
  }

  async updateKeyResult(id: string, keyResult: Partial<KeyResult>): Promise<boolean> {
    try {
      await supabaseDataService.updateKeyResult(id, {
        title: keyResult.title,
        description: keyResult.description,
        targetValue: keyResult.target,
        currentValue: keyResult.current,
        unit: keyResult.unit,
        status: keyResult.status
      });

      return true;
    } catch (error) {
      console.error('Erreur mise à jour key result:', error);
      return false;
    }
  }

  async deleteKeyResult(id: string): Promise<boolean> {
    try {
      await supabaseDataService.deleteKeyResult(id);
      return true;
    } catch (error) {
      console.error('Erreur suppression key result:', error);
      return false;
    }
  }

  // ===== ANALYTICS =====

  async getObjectivesByStatus(status: string): Promise<Objective[]> {
    try {
      const objectives = await supabaseDataService.getObjectives();
      const filteredObjectives = objectives.filter(obj => obj.status === status);
      
      // Load key results for each objective
      const objectivesWithKeyResults = await Promise.all(
        filteredObjectives.map(async (objective) => {
          const keyResults = await this.getKeyResultsByObjectiveId(objective.id);
          return {
            ...objective,
            keyResults,
            category: '',
            owner: '',
            team: []
          };
        })
      );

      return objectivesWithKeyResults;
    } catch (error) {
      console.error('Erreur récupération objectifs par statut:', error);
      return [];
    }
  }

  async getObjectivesByOwner(owner: string): Promise<Objective[]> {
    try {
      const objectives = await supabaseDataService.getObjectives();
      const filteredObjectives = objectives.filter(obj => obj.ownerId === owner);
      
      // Load key results for each objective
      const objectivesWithKeyResults = await Promise.all(
        filteredObjectives.map(async (objective) => {
          const keyResults = await this.getKeyResultsByObjectiveId(objective.id);
          return {
            ...objective,
            keyResults,
            category: '',
            owner: '',
            team: []
          };
        })
      );

      return objectivesWithKeyResults;
    } catch (error) {
      console.error('Erreur récupération objectifs par propriétaire:', error);
      return [];
    }
  }

  async getAverageProgress(): Promise<number> {
    try {
      const objectives = await this.getAllObjectives();
      if (objectives.length === 0) return 0;
      
      const totalProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0);
      return Math.round(totalProgress / objectives.length);
    } catch (error) {
      console.error('Erreur calcul progression moyenne:', error);
      return 0;
    }
  }
}

export const okrService = new OKRService();