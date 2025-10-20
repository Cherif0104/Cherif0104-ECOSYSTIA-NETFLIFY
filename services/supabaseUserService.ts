import { supabase } from './supabaseService';
import { User } from '../types';

export const supabaseUserService = {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('🔄 Récupération utilisateurs Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        throw error;
      }
      
      const users: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar || '',
        phone: user.phone || '',
        skills: [],
        createdAt: user.created_at,
        lastLoginAt: user.last_login || user.created_at
      }));
      
      console.log(`✅ ${users.length} utilisateurs récupérés depuis Supabase`);
      return users;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return [];
    }
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ Erreur récupération utilisateur:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        avatar: data.avatar || '',
        phone: data.phone || '',
        skills: [],
        createdAt: data.created_at,
        lastLoginAt: data.last_login || data.created_at
      };
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  },

  /**
   * Récupérer un utilisateur par email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();
      
      if (error) {
        console.error('❌ Erreur récupération utilisateur par email:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        avatar: data.avatar || '',
        phone: data.phone || '',
        skills: [],
        createdAt: data.created_at,
        lastLoginAt: data.last_login || data.created_at
      };
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur par email:', error);
      return null;
    }
  },

  /**
   * Rechercher des utilisateurs
   */
  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur recherche utilisateurs:', error);
        return [];
      }
      
      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar || '',
        phone: user.phone || '',
        skills: [],
        createdAt: user.created_at,
        lastLoginAt: user.last_login || user.created_at
      }));
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  },

  /**
   * Récupérer les utilisateurs par rôle
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur récupération utilisateurs par rôle:', error);
        return [];
      }
      
      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar || '',
        phone: user.phone || '',
        skills: [],
        createdAt: user.created_at,
        lastLoginAt: user.last_login || user.created_at
      }));
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs par rôle:', error);
      return [];
    }
  },

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.role) updateData.role = updates.role;
      if (updates.avatar) updateData.avatar = updates.avatar;
      if (updates.phone) updateData.phone = updates.phone;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erreur mise à jour utilisateur:', error);
        return null;
      }
      
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        avatar: data.avatar || '',
        phone: data.phone || '',
        skills: [],
        createdAt: data.created_at,
        lastLoginAt: data.last_login || data.created_at
      };
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      return null;
    }
  },

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      return false;
    }
  },

  /**
   * Obtenir les statistiques des utilisateurs
   */
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
  }> {
    try {
      const users = await this.getAllUsers();
      
      const stats = {
        total: users.length,
        byRole: {} as Record<string, number>,
        active: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
      };
      
      // Compter par rôle
      users.forEach(user => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur calcul statistiques utilisateurs:', error);
      return {
        total: 0,
        byRole: {},
        active: 0
      };
    }
  }
};
