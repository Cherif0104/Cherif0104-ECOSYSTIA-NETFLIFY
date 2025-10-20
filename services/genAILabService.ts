import { supabase } from './supabaseService';

// Types pour Gen AI Lab
export interface AIExperiment {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'code' | 'data';
  status: 'draft' | 'running' | 'completed' | 'failed';
  model: string;
  parameters: Record<string, any>;
  results: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  isActive: boolean;
  performance: number;
  createdAt: Date;
}

class GenAILabService {
  private experimentsTableName = 'ai_experiments';
  private modelsTableName = 'ai_models';

  // ===== AI EXPERIMENTS =====

  private mapExperimentFromSupabase(data: any): AIExperiment {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status,
      model: data.model,
      parameters: data.parameters || {},
      results: data.results || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapExperimentToSupabase(experiment: Omit<AIExperiment, 'id'>): any {
    return {
      name: experiment.name,
      description: experiment.description,
      type: experiment.type,
      status: experiment.status,
      model: experiment.model,
      parameters: experiment.parameters,
      results: experiment.results,
    };
  }

  async getAllExperiments(): Promise<AIExperiment[]> {
    try {
      console.log('🔄 Récupération expériences Gen AI Lab Supabase...');
      
      const { data, error } = await supabase
        .from(this.experimentsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const experiments = (data || []).map(item => this.mapExperimentFromSupabase(item));
      console.log(`✅ ${experiments.length} expériences Gen AI Lab récupérées`);
      return experiments;
    } catch (error) {
      console.error('❌ Erreur récupération expériences Gen AI Lab:', error);
      return [];
    }
  }

  async createExperiment(experiment: Omit<AIExperiment, 'id'>): Promise<AIExperiment | null> {
    try {
      console.log('🔄 Création expérience Gen AI Lab Supabase:', experiment.name);
      
      const supabaseData = this.mapExperimentToSupabase(experiment);
      const { data, error } = await supabase
        .from(this.experimentsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdExperiment = this.mapExperimentFromSupabase(data);
      console.log('✅ Expérience Gen AI Lab créée:', createdExperiment.id);
      return createdExperiment;
    } catch (error) {
      console.error('❌ Erreur création expérience Gen AI Lab:', error);
      return null;
    }
  }

  async updateExperiment(id: string, experiment: Partial<AIExperiment>): Promise<AIExperiment | null> {
    try {
      console.log('🔄 Mise à jour expérience Gen AI Lab Supabase:', id);
      
      const supabaseData = this.mapExperimentToSupabase(experiment as Omit<AIExperiment, 'id'>);
      const { data, error } = await supabase
        .from(this.experimentsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedExperiment = this.mapExperimentFromSupabase(data);
      console.log('✅ Expérience Gen AI Lab mise à jour:', updatedExperiment.id);
      return updatedExperiment;
    } catch (error) {
      console.error('❌ Erreur mise à jour expérience Gen AI Lab:', error);
      return null;
    }
  }

  async deleteExperiment(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression expérience Gen AI Lab Supabase:', id);
      
      const { error } = await supabase
        .from(this.experimentsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Expérience Gen AI Lab supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression expérience Gen AI Lab:', error);
      return false;
    }
  }

  // ===== AI MODELS =====

  private mapModelFromSupabase(data: any): AIModel {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      version: data.version,
      description: data.description,
      isActive: data.is_active || false,
      performance: data.performance || 0,
      createdAt: new Date(data.created_at),
    };
  }

  private mapModelToSupabase(model: Omit<AIModel, 'id'>): any {
    return {
      name: model.name,
      type: model.type,
      version: model.version,
      description: model.description,
      is_active: model.isActive,
      performance: model.performance,
    };
  }

  async getAllModels(): Promise<AIModel[]> {
    try {
      console.log('🔄 Récupération modèles Gen AI Lab Supabase...');
      
      const { data, error } = await supabase
        .from(this.modelsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const models = (data || []).map(item => this.mapModelFromSupabase(item));
      console.log(`✅ ${models.length} modèles Gen AI Lab récupérés`);
      return models;
    } catch (error) {
      console.error('❌ Erreur récupération modèles Gen AI Lab:', error);
      return [];
    }
  }

  async createModel(model: Omit<AIModel, 'id'>): Promise<AIModel | null> {
    try {
      console.log('🔄 Création modèle Gen AI Lab Supabase:', model.name);
      
      const supabaseData = this.mapModelToSupabase(model);
      const { data, error } = await supabase
        .from(this.modelsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdModel = this.mapModelFromSupabase(data);
      console.log('✅ Modèle Gen AI Lab créé:', createdModel.id);
      return createdModel;
    } catch (error) {
      console.error('❌ Erreur création modèle Gen AI Lab:', error);
      return null;
    }
  }

  async updateModel(id: string, model: Partial<AIModel>): Promise<AIModel | null> {
    try {
      console.log('🔄 Mise à jour modèle Gen AI Lab Supabase:', id);
      
      const supabaseData = this.mapModelToSupabase(model as Omit<AIModel, 'id'>);
      const { data, error } = await supabase
        .from(this.modelsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedModel = this.mapModelFromSupabase(data);
      console.log('✅ Modèle Gen AI Lab mis à jour:', updatedModel.id);
      return updatedModel;
    } catch (error) {
      console.error('❌ Erreur mise à jour modèle Gen AI Lab:', error);
      return null;
    }
  }

  async deleteModel(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression modèle Gen AI Lab Supabase:', id);
      
      const { error } = await supabase
        .from(this.modelsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Modèle Gen AI Lab supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression modèle Gen AI Lab:', error);
      return false;
    }
  }
}

export const genAILabService = new GenAILabService();
