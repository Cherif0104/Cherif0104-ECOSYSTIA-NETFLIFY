/**
 * 👥 SERVICE UTILISATEURS - ECOSYSTIA
 * Gestion complète des utilisateurs avec Supabase
 */

import { supabaseUserService } from './supabaseUserService';
import { User, Role } from '../types';

class UserService {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAll(): Promise<User[]> {
    try {
      console.log('🔄 Récupération utilisateurs Supabase...');
      return await supabaseUserService.getAllUsers();
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return [];
    }
  }

  /**
   * Alias pour getAll() - compatibilité
   */
  async getAllUsers(): Promise<User[]> {
    return this.getAll();
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id: string): Promise<User | null> {
    try {
      return await supabaseUserService.getUserById(id);
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupérer un utilisateur par email
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      return await supabaseUserService.getUserByEmail(email);
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur par email:', error);
      return null;
    }
  }

  /**
   * Rechercher des utilisateurs
   */
  async search(query: string): Promise<User[]> {
    try {
      return await supabaseUserService.searchUsers(query);
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }

  /**
   * Récupérer les utilisateurs par rôle
   */
  async getByRole(role: Role): Promise<User[]> {
    try {
      return await supabaseUserService.getUsersByRole(role);
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs par rôle:', error);
      return [];
    }
  }

  /**
   * Créer un utilisateur
   */
  async create(user: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<User | null> {
    try {
      // Note: La création d'utilisateurs se fait via Supabase Auth
      // Ce service gère seulement les profils utilisateurs
      console.log('⚠️ Création utilisateur via Supabase Auth requise');
      return null;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      return await supabaseUserService.updateUser(id, updates);
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      return null;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async delete(id: string): Promise<boolean> {
    try {
      return await supabaseUserService.deleteUser(id);
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques des utilisateurs
   */
  async getStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
  }> {
    try {
      return await supabaseUserService.getUserStats();
    } catch (error) {
      console.error('❌ Erreur calcul statistiques utilisateurs:', error);
      return {
        total: 0,
        byRole: {},
        active: 0
      };
    }
  }

  /**
   * Récupérer les utilisateurs pour la sélection d'équipe
   */
  async getForTeamSelection(): Promise<User[]> {
    try {
      const users = await this.getAll();
      // Filtrer les utilisateurs actifs et retourner les informations essentielles
      return users.filter(user => user.role !== 'inactive');
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs pour équipe:', error);
      return [];
    }
  }

  /**
   * Récupérer les utilisateurs par équipe
   */
  async getByTeam(teamId: string): Promise<User[]> {
    try {
      // Pour l'instant, retourner tous les utilisateurs
      // Plus tard, on pourra ajouter une table teams
      return await this.getAll();
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs par équipe:', error);
      return [];
    }
  }

  /**
   * Vérifier si un utilisateur existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const user = await this.getById(id);
      return user !== null;
    } catch (error) {
      console.error('❌ Erreur vérification existence utilisateur:', error);
      return false;
    }
  }

  /**
   * Obtenir les rôles disponibles
   */
  getAvailableRoles(): Role[] {
    return [
      'super_administrator',
      'administrator',
      'manager',
      'supervisor',
      'developer',
      'designer',
      'analyst',
      'hr',
      'finance',
      'sales',
      'marketing',
      'support',
      'operations',
      'content',
      'tester',
      'user'
    ];
  }

  /**
   * Valider un rôle
   */
  isValidRole(role: string): role is Role {
    return this.getAvailableRoles().includes(role as Role);
  }

  /**
   * Obtenir les permissions d'un rôle
   */
  getRolePermissions(role: Role): string[] {
    const permissions: Record<Role, string[]> = {
      'super_administrator': ['*'],
      'administrator': ['users.read', 'users.write', 'projects.read', 'projects.write', 'reports.read'],
      'manager': ['projects.read', 'projects.write', 'team.read', 'reports.read'],
      'supervisor': ['team.read', 'projects.read', 'tasks.write'],
      'developer': ['projects.read', 'tasks.read', 'tasks.write'],
      'designer': ['projects.read', 'tasks.read', 'tasks.write'],
      'analyst': ['projects.read', 'reports.read', 'analytics.read'],
      'hr': ['users.read', 'users.write', 'reports.read'],
      'finance': ['finance.read', 'finance.write', 'reports.read'],
      'sales': ['sales.read', 'sales.write', 'reports.read'],
      'marketing': ['marketing.read', 'marketing.write', 'reports.read'],
      'support': ['support.read', 'support.write'],
      'operations': ['operations.read', 'operations.write'],
      'content': ['content.read', 'content.write'],
      'tester': ['testing.read', 'testing.write'],
      'user': ['profile.read', 'profile.write']
    };

    return permissions[role] || [];
  }
}

export const userService = new UserService();