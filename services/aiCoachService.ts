import { supabase } from './supabaseService';

// Types pour AI Coach
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  rating?: number;
  isBookmarked?: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'resource' | 'action' | 'tip';
  priority: 'high' | 'medium' | 'low';
  category: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

class AICoachService {
  private sessionsTableName = 'ai_chat_sessions';
  private recommendationsTableName = 'ai_recommendations';
  private messagesTableName = 'ai_chat_messages';

  // ===== CHAT SESSIONS =====

  private mapSessionFromSupabase(data: any): ChatSession {
    return {
      id: data.id,
      title: data.title,
      messages: data.messages || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active || false,
    };
  }

  private mapSessionToSupabase(session: Omit<ChatSession, 'id'>): any {
    return {
      title: session.title,
      messages: session.messages,
      is_active: session.isActive,
    };
  }

  async getAllSessions(): Promise<ChatSession[]> {
    try {
      console.log('🔄 Récupération sessions AI Coach Supabase...');
      
      const { data, error } = await supabase
        .from(this.sessionsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions = (data || []).map(item => this.mapSessionFromSupabase(item));
      console.log(`✅ ${sessions.length} sessions AI Coach récupérées`);
      return sessions;
    } catch (error) {
      console.error('❌ Erreur récupération sessions AI Coach:', error);
      return [];
    }
  }

  async createSession(session: Omit<ChatSession, 'id'>): Promise<ChatSession | null> {
    try {
      console.log('🔄 Création session AI Coach Supabase:', session.title);
      
      const supabaseData = this.mapSessionToSupabase(session);
      const { data, error } = await supabase
        .from(this.sessionsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdSession = this.mapSessionFromSupabase(data);
      console.log('✅ Session AI Coach créée:', createdSession.id);
      return createdSession;
    } catch (error) {
      console.error('❌ Erreur création session AI Coach:', error);
      return null;
    }
  }

  async updateSession(id: string, session: Partial<ChatSession>): Promise<ChatSession | null> {
    try {
      console.log('🔄 Mise à jour session AI Coach Supabase:', id);
      
      const supabaseData = this.mapSessionToSupabase(session as Omit<ChatSession, 'id'>);
      const { data, error } = await supabase
        .from(this.sessionsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession = this.mapSessionFromSupabase(data);
      console.log('✅ Session AI Coach mise à jour:', updatedSession.id);
      return updatedSession;
    } catch (error) {
      console.error('❌ Erreur mise à jour session AI Coach:', error);
      return null;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression session AI Coach Supabase:', id);
      
      const { error } = await supabase
        .from(this.sessionsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Session AI Coach supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression session AI Coach:', error);
      return false;
    }
  }

  // ===== RECOMMENDATIONS =====

  private mapRecommendationFromSupabase(data: any): Recommendation {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      category: data.category,
      isRead: data.is_read || false,
      createdAt: new Date(data.created_at),
    };
  }

  private mapRecommendationToSupabase(recommendation: Omit<Recommendation, 'id'>): any {
    return {
      title: recommendation.title,
      description: recommendation.description,
      type: recommendation.type,
      priority: recommendation.priority,
      category: recommendation.category,
      is_read: recommendation.isRead,
    };
  }

  async getAllRecommendations(): Promise<Recommendation[]> {
    try {
      console.log('🔄 Récupération recommandations AI Coach Supabase...');
      
      const { data, error } = await supabase
        .from(this.recommendationsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const recommendations = (data || []).map(item => this.mapRecommendationFromSupabase(item));
      console.log(`✅ ${recommendations.length} recommandations AI Coach récupérées`);
      return recommendations;
    } catch (error) {
      console.error('❌ Erreur récupération recommandations AI Coach:', error);
      return [];
    }
  }

  async createRecommendation(recommendation: Omit<Recommendation, 'id'>): Promise<Recommendation | null> {
    try {
      console.log('🔄 Création recommandation AI Coach Supabase:', recommendation.title);
      
      const supabaseData = this.mapRecommendationToSupabase(recommendation);
      const { data, error } = await supabase
        .from(this.recommendationsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdRecommendation = this.mapRecommendationFromSupabase(data);
      console.log('✅ Recommandation AI Coach créée:', createdRecommendation.id);
      return createdRecommendation;
    } catch (error) {
      console.error('❌ Erreur création recommandation AI Coach:', error);
      return null;
    }
  }

  async updateRecommendation(id: string, recommendation: Partial<Recommendation>): Promise<Recommendation | null> {
    try {
      console.log('🔄 Mise à jour recommandation AI Coach Supabase:', id);
      
      const supabaseData = this.mapRecommendationToSupabase(recommendation as Omit<Recommendation, 'id'>);
      const { data, error } = await supabase
        .from(this.recommendationsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRecommendation = this.mapRecommendationFromSupabase(data);
      console.log('✅ Recommandation AI Coach mise à jour:', updatedRecommendation.id);
      return updatedRecommendation;
    } catch (error) {
      console.error('❌ Erreur mise à jour recommandation AI Coach:', error);
      return null;
    }
  }

  async deleteRecommendation(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression recommandation AI Coach Supabase:', id);
      
      const { error } = await supabase
        .from(this.recommendationsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Recommandation AI Coach supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression recommandation AI Coach:', error);
      return false;
    }
  }
}

export const aiCoachService = new AICoachService();
