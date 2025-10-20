/**
 * 🔐 SERVICE AUTH UTILITAIRE - ECOSYSTIA
 * Utilitaires pour l'authentification et la gestion des utilisateurs
 */

import { supabase } from './supabaseService';

export class AuthUtils {
  /**
   * Obtenir l'ID de l'utilisateur connecté
   */
  static async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Obtenir l'utilisateur connecté complet
   */
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static async isAuthenticated(): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    return userId !== null;
  }

  /**
   * Obtenir le rôle de l'utilisateur connecté
   */
  static async getCurrentUserRole(): Promise<string | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération rôle:', error);
        return null;
      }

      return userData?.role || null;
    } catch (error) {
      console.error('❌ Erreur récupération rôle:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  static async hasRole(requiredRoles: string[]): Promise<boolean> {
    const userRole = await this.getCurrentUserRole();
    return userRole ? requiredRoles.includes(userRole) : false;
  }

  /**
   * Vérifier si l'utilisateur peut accéder au CRM
   */
  static async canAccessCRM(): Promise<boolean> {
    return this.hasRole(['manager', 'sales', 'super_administrator']);
  }

  /**
   * Vérifier si l'utilisateur peut accéder aux Analytics
   */
  static async canAccessAnalytics(): Promise<boolean> {
    return this.hasRole(['super_administrator', 'analyst']);
  }

  /**
   * Obtenir les données d'insertion avec owner_id automatique
   */
  static async getInsertDataWithOwner(baseData: any = {}): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return {
      ...baseData,
      owner_id: userId,
      user_id: userId,
      created_by: userId
    };
  }

  /**
   * Obtenir les données d'insertion pour les projets
   */
  static async getProjectInsertData(baseData: any = {}): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return {
      ...baseData,
      owner_id: userId
    };
  }

  /**
   * Obtenir les données d'insertion pour les objectifs
   */
  static async getObjectiveInsertData(baseData: any = {}): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return {
      ...baseData,
      owner_id: userId
    };
  }

  /**
   * Obtenir les données d'insertion pour les time logs
   */
  static async getTimeLogInsertData(baseData: any = {}): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return {
      ...baseData,
      user_id: userId
    };
  }

  /**
   * Obtenir les données d'insertion pour les finances
   */
  static async getFinanceInsertData(baseData: any = {}): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return {
      ...baseData,
      user_id: userId,
      created_by: userId
    };
  }
}

export default AuthUtils;
