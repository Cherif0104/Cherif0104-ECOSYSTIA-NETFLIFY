/**
 * 🔐 SERVICE AUTHENTIFICATION - ECOSYSTIA
 * Gestion complète de l'authentification avec Appwrite
 * Référence : MERISE/02-MLD-MPD-IMPLEMENTATION-APPWRITE.md - Collection 1
 */

import { account, databases, DATABASE_ID, ID, Query } from './appwriteService';
import { User, Role } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  skills?: string[];
}

export interface AuthUser {
  $id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  phone?: string;
  skills?: string[];
  createdAt: string;
  lastLoginAt?: string;
}

class AuthService {
  private collectionId = 'users';

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      // 0. Vérifier et supprimer toute session existante
      try {
        const currentSession = await account.getSession('current');
        if (currentSession) {
          await account.deleteSession('current');
          console.log('✅ Session précédente supprimée');
        }
      } catch (error) {
        // Pas de session active, continuer
      }

      // 1. Authentifier avec Appwrite Auth
      const session = await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );

      if (!session) {
        throw new Error('Échec de l\'authentification');
      }

      // 2. Récupérer les données utilisateur depuis la collection
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('email', credentials.email)]
      );

      if (userResponse.documents.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const userDoc = userResponse.documents[0];

      // 3. Mettre à jour la dernière connexion
      await this.updateLastLogin(userDoc.$id);

      // 4. Retourner les données utilisateur
      const authUser: AuthUser = {
        $id: userDoc.$id,
        email: userDoc.email,
        name: `${userDoc.firstName} ${userDoc.lastName}`,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        role: userDoc.role,
        avatar: userDoc.avatar,
        phone: userDoc.phone,
        skills: userDoc.skills ? JSON.parse(userDoc.skills) : [],
        createdAt: userDoc.$createdAt,
        lastLoginAt: new Date().toISOString(),
      };

      console.log('✅ Connexion réussie:', authUser.email);
      return authUser;

    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.message);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<AuthUser | null> {
    try {
      // 1. Créer le compte Appwrite Auth
      const accountResponse = await account.create(
        ID.unique(),
        data.email,
        data.password,
        `${data.firstName} ${data.lastName}`
      );

      if (!accountResponse) {
        throw new Error('Échec de la création du compte');
      }

      // 2. Créer le document utilisateur dans la collection
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        phone: data.phone || '',
        skills: data.skills ? JSON.stringify(data.skills) : JSON.stringify([]),
        avatar: '',
      };

      const userResponse = await databases.createDocument(
        DATABASE_ID,
        this.collectionId,
        accountResponse.$id, // Utiliser l'ID du compte comme ID du document
        userData
      );

      // 3. Retourner les données utilisateur
      const authUser: AuthUser = {
        $id: userResponse.$id,
        email: userResponse.email,
        name: `${userResponse.firstName} ${userResponse.lastName}`,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
        role: userResponse.role,
        avatar: userResponse.avatar,
        phone: userResponse.phone,
        skills: userResponse.skills ? JSON.parse(userResponse.skills) : [],
        createdAt: userResponse.$createdAt,
      };

      console.log('✅ Inscription réussie:', authUser.email);
      return authUser;

    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.message);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error.message);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const accountUser = await account.get();
      
      if (!accountUser) {
        return null;
      }

      // Récupérer les données complètes depuis la collection
      const userResponse = await databases.listDocuments(
        DATABASE_ID,
        this.collectionId,
        [Query.equal('email', accountUser.email)]
      );

      if (userResponse.documents.length === 0) {
        return null;
      }

      const userDoc = userResponse.documents[0];

      return {
        $id: userDoc.$id,
        email: userDoc.email,
        name: `${userDoc.firstName} ${userDoc.lastName}`,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        role: userDoc.role,
        avatar: userDoc.avatar,
        phone: userDoc.phone,
        skills: userDoc.skills ? JSON.parse(userDoc.skills) : [],
        createdAt: userDoc.$createdAt,
        lastLoginAt: userDoc.lastLoginAt,
      };

    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateur:', error.message);
      return null;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<AuthUser | null> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.firstName = updates.firstName;
      if (updates.lastName) updateData.lastName = updates.lastName;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.skills) updateData.skills = JSON.stringify(updates.skills);
      if (updates.avatar) updateData.avatar = updates.avatar;

      const response = await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        userId,
        updateData
      );

      return {
        $id: response.$id,
        email: response.email,
        name: `${response.firstName} ${response.lastName}`,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        avatar: response.avatar,
        phone: response.phone,
        skills: response.skills ? JSON.parse(response.skills) : [],
        createdAt: response.$createdAt,
        lastLoginAt: response.lastLoginAt,
      };

    } catch (error: any) {
      console.error('❌ Erreur mise à jour profil:', error.message);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(password: string, oldPassword: string): Promise<boolean> {
    try {
      await account.updatePassword(password, oldPassword);
      console.log('✅ Mot de passe mis à jour');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur changement mot de passe:', error.message);
      throw new Error('Erreur lors du changement de mot de passe');
    }
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      console.log('✅ Email de réinitialisation envoyé');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur réinitialisation mot de passe:', error.message);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const user = await account.get();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mettre à jour la dernière connexion
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        this.collectionId,
        userId,
        { lastLoginAt: new Date().toISOString() }
      );
    } catch (error) {
      console.warn('⚠️ Impossible de mettre à jour la dernière connexion');
    }
  }

  /**
   * Convertir AuthUser en User (pour compatibilité)
   */
  convertToUser(authUser: AuthUser): User {
    return {
      id: authUser.id || authUser.$id, // Support Supabase et Appwrite
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      email: authUser.email,
      avatar: authUser.avatar || '',
      role: authUser.role,
      skills: authUser.skills || [],
      phone: authUser.phone || '',
    };
  }

  /**
   * Obtenir un message d'erreur lisible
   */
  private getErrorMessage(error: any): string {
    if (error.message?.includes('Invalid credentials')) {
      return 'Email ou mot de passe incorrect';
    }
    if (error.message?.includes('User already exists')) {
      return 'Un compte avec cet email existe déjà';
    }
    if (error.message?.includes('Invalid email')) {
      return 'Adresse email invalide';
    }
    if (error.message?.includes('Password too short')) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (error.message?.includes('Network error')) {
      return 'Erreur de connexion. Vérifiez votre connexion internet';
    }
    return error.message || 'Une erreur inattendue s\'est produite';
  }
}

export const authService = new AuthService();
