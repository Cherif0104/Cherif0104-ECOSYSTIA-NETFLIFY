import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase';

// Client Supabase pour l'authentification et les données
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Client Supabase avec service role pour les opérations admin
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types pour les utilisateurs
export interface SupabaseUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  department?: string;
  position?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Service d'authentification simplifié
export class SupabaseAuthService {
  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string): Promise<AuthUser | null> {
    try {
      console.log(`🔄 Tentative de connexion: ${email}`);
      
      // 1. Authentifier avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ Erreur auth:', authError.message);
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!authData.user) {
        throw new Error('Utilisateur non trouvé');
      }

      // 2. Récupérer les données utilisateur depuis la table users (insensible à la casse)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();

      if (userError || !userData) {
        console.error('❌ Erreur récupération utilisateur:', userError?.message);
        throw new Error('Profil utilisateur non trouvé');
      }

      // 3. Mettre à jour la dernière connexion
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      // 4. Retourner les données utilisateur formatées
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        phone: userData.phone,
        avatar: userData.avatar,
        createdAt: userData.created_at,
        lastLoginAt: new Date().toISOString()
      };

      console.log('✅ Connexion réussie:', authUser.email);
      return authUser;

    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<AuthUser | null> {
    try {
      console.log(`🔄 Inscription: ${userData.email}`);

      // 1. Créer le compte auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur inscription auth:', authError.message);
        throw new Error('Erreur lors de la création du compte');
      }

      if (!authData.user) {
        throw new Error('Échec de la création du compte');
      }

      // 2. Créer le profil utilisateur dans la table users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: userData.role || 'user',
          department: 'Général',
          position: 'Utilisateur',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erreur création profil:', profileError.message);
        throw new Error('Erreur lors de la création du profil');
      }

      // 3. Retourner les données utilisateur
      const authUser: AuthUser = {
        id: profileData.id,
        email: profileData.email,
        name: `${profileData.first_name} ${profileData.last_name}`,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        phone: profileData.phone,
        createdAt: profileData.created_at
      };

      console.log('✅ Inscription réussie:', authUser.email);
      return authUser;

    } catch (error: any) {
      console.error('❌ Erreur inscription:', error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error.message);
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userData) return null;

      return {
        id: userData.id,
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        phone: userData.phone,
        avatar: userData.avatar,
        createdAt: userData.created_at,
        lastLoginAt: userData.last_login
      };
    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateur:', error.message);
      return null;
    }
  }

  /**
   * Créer des utilisateurs en masse (Admin)
   */
  async createBulkUsers(users: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    department?: string;
    position?: string;
  }>): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    console.log(`🚀 Création en masse de ${users.length} utilisateurs`);

    for (const user of users) {
      try {
        // Créer le compte auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone
          }
        });

        if (authError) {
          console.error(`❌ Erreur auth ${user.email}:`, authError.message);
          errors++;
          continue;
        }

        // Créer le profil utilisateur
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone,
            role: user.role,
            department: user.department || 'Général',
            position: user.position || 'Utilisateur',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`❌ Erreur profil ${user.email}:`, profileError.message);
          errors++;
          continue;
        }

        console.log(`✅ Utilisateur créé: ${user.email}`);
        success++;

        // Attendre entre les créations pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`❌ Erreur ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log(`🎉 Création terminée: ${success} succès, ${errors} erreurs`);
    return { success, errors };
  }
}

export const supabaseAuthService = new SupabaseAuthService();
