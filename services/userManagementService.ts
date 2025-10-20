import { User, Role } from '../types';

class UserManagementService {
  // Données mockées pour éviter les erreurs d'import Appwrite
  private users: User[] = [
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@ecosystia.com',
      phone: '+221 77 123 45 67',
      role: 'admin',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: null,
      department: 'Direction',
      position: 'Directeur Général'
    },
    {
      id: '2',
      name: 'Manager Projets',
      email: 'manager@ecosystia.com',
      phone: '+221 77 234 56 78',
      role: 'manager',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: null,
      department: 'Projets',
      position: 'Chef de Projet'
    },
    {
      id: '3',
      name: 'Développeur Senior',
      email: 'dev@ecosystia.com',
      phone: '+221 77 345 67 89',
      role: 'user',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: null,
      department: 'Développement',
      position: 'Développeur'
    }
  ];

  private roles: Role[] = [
    {
      id: '1',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_roles'],
      userCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Gestion des projets et équipes',
      permissions: ['read', 'write', 'manage_projects', 'manage_teams'],
      userCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Utilisateur',
      description: 'Accès de base aux fonctionnalités',
      permissions: ['read', 'write'],
      userCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  // ===== UTILISATEURS =====

  async getUsers(): Promise<User[]> {
    try {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...this.users];
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u.id === id);
      return user || null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): Promise<User | null> {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      this.users.push(newUser);
      return newUser;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      return null;
    }
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
      const userIndex = this.users.findIndex(user => user.id === id);
      if (userIndex === -1) return null;

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      return this.users[userIndex];
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const userIndex = this.users.findIndex(user => user.id === id);
      if (userIndex === -1) return false;

      this.users.splice(userIndex, 1);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      return false;
    }
  }

  async toggleUserStatus(id: string): Promise<User | null> {
    try {
      const userIndex = this.users.findIndex(user => user.id === id);
      if (userIndex === -1) return null;

      const newStatus = this.users[userIndex].status === 'active' ? 'inactive' : 'active';
      this.users[userIndex] = {
        ...this.users[userIndex],
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      return this.users[userIndex];
    } catch (error) {
      console.error('❌ Erreur changement statut utilisateur:', error);
      return null;
    }
  }

  // ===== RÔLES =====

  async getRoles(): Promise<Role[]> {
    try {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...this.roles];
    } catch (error) {
      console.error('❌ Erreur récupération rôles:', error);
      return [];
    }
  }

  async getRoleById(id: string): Promise<Role | null> {
    try {
      const role = this.roles.find(r => r.id === id);
      return role || null;
    } catch (error) {
      console.error('❌ Erreur récupération rôle:', error);
      return null;
    }
  }

  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>): Promise<Role | null> {
    try {
      const newRole: Role = {
        ...roleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userCount: 0,
      };
      
      this.roles.push(newRole);
      return newRole;
    } catch (error) {
      console.error('❌ Erreur création rôle:', error);
      return null;
    }
  }

  async updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>>): Promise<Role | null> {
    try {
      const roleIndex = this.roles.findIndex(role => role.id === id);
      if (roleIndex === -1) return null;

      this.roles[roleIndex] = {
        ...this.roles[roleIndex],
        ...roleData,
        updatedAt: new Date().toISOString(),
      };

      return this.roles[roleIndex];
    } catch (error) {
      console.error('❌ Erreur mise à jour rôle:', error);
      return null;
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const roleIndex = this.roles.findIndex(role => role.id === id);
      if (roleIndex === -1) return false;

      this.roles.splice(roleIndex, 1);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression rôle:', error);
      return false;
    }
  }

  // ===== PERMISSIONS =====

  async getPermissions(): Promise<string[]> {
    // Permissions prédéfinies du système
    return [
      'read',
      'write',
      'delete',
      'manage',
      'admin',
      'finance_read',
      'finance_write',
      'projects_read',
      'projects_write',
      'projects_manage',
      'users_read',
      'users_write',
      'users_manage',
      'reports_read',
      'reports_generate',
      'settings_read',
      'settings_write'
    ];
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return [];

      const role = await this.getRoleById(user.role);
      return role?.permissions || [];
    } catch (error) {
      console.error('❌ Erreur récupération permissions utilisateur:', error);
      return [];
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.includes(permission) || userPermissions.includes('admin');
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error);
      return false;
    }
  }

  // ===== STATISTIQUES =====

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    managerUsers: number;
    regularUsers: number;
  }> {
    try {
      const users = await this.getUsers();
      
      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        inactiveUsers: users.filter(u => u.status === 'inactive').length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        managerUsers: users.filter(u => u.role === 'manager').length,
        regularUsers: users.filter(u => u.role === 'user').length
      };
    } catch (error) {
      console.error('❌ Erreur calcul statistiques utilisateurs:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        managerUsers: 0,
        regularUsers: 0
      };
    }
  }

  // ===== RECHERCHE ET FILTRAGE =====

  async searchUsers(query: string, filters: {
    role?: string;
    status?: string;
    department?: string;
  } = {}): Promise<User[]> {
    try {
      let filteredUsers = [...this.users];
      
      if (query) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.department.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (filters.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      
      if (filters.status && filters.status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }
      
      if (filters.department && filters.department !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.department === filters.department);
      }

      return filteredUsers;
    } catch (error) {
      console.error('❌ Erreur recherche utilisateurs:', error);
      return [];
    }
  }
}

export const userManagementService = new UserManagementService();