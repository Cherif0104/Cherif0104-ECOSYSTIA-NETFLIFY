import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { supabaseAuthService, AuthUser } from '../services/supabaseService';
import { sessionService } from '../services/sessionService';

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string; role?: Role }) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; role: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  lastActivity: number;
  updateActivity: () => void;
  error: string | null;
  getCurrentPage: () => string;
  saveCurrentPage: (page: string) => void;
  getTimeUntilExpiration: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Vérifier la session existante au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier la session Supabase
        const currentUser = await supabaseAuthService.getCurrentUser();
        
        if (currentUser) {
          // Convertir AuthUser en User
          const userData: User = {
            id: currentUser.id,
            email: currentUser.email,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            name: currentUser.name, // Ajouter name
            first_name: currentUser.firstName, // Ajouter first_name pour compatibilité
            role: currentUser.role as Role,
            phone: currentUser.phone,
            avatar: currentUser.avatar,
            createdAt: currentUser.createdAt,
            lastLoginAt: currentUser.lastLoginAt
          };
          
          setUser(userData);
          sessionService.startSession(userData);
          console.log('✅ Session Supabase restaurée avec succès');
        } else {
          // Vérifier la session locale comme fallback
          const localUser = sessionService.getCurrentUser();
          if (localUser) {
            setUser(localUser);
            console.log('✅ Session locale restaurée avec succès');
          }
        }
      } catch (error: any) {
        console.error('❌ Erreur initialisation auth:', error.message);
        setError('Erreur lors de l\'initialisation de l\'authentification');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = useCallback(async (credentials: { email: string; password: string; role?: Role }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Tentative de connexion Supabase...');
      
        const authUser = await supabaseAuthService.login(credentials.email, credentials.password);
      
      if (authUser) {
        // Convertir AuthUser en User
        const userData: User = {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          name: authUser.name, // Ajouter name
          first_name: authUser.firstName, // Ajouter first_name pour compatibilité
          role: authUser.role as Role,
          phone: authUser.phone,
          avatar: authUser.avatar,
          createdAt: authUser.createdAt,
          lastLoginAt: authUser.lastLoginAt
        };
        
        setUser(userData);
        sessionService.startSession(userData);
        setLastActivity(Date.now());
        
        console.log('✅ Connexion Supabase réussie');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.message);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction d'inscription
  const register = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string; role: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Inscription Supabase...');
      
      const authUser = await supabaseAuthService.register(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.role
      );
      
      if (authUser) {
        // Convertir AuthUser en User
        const userData: User = {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          role: authUser.role as Role,
          phone: authUser.phone,
          avatar: authUser.avatar,
          createdAt: authUser.createdAt,
          lastLoginAt: authUser.lastLoginAt
        };
        
        setUser(userData);
        sessionService.startSession(userData);
        setLastActivity(Date.now());
        
        console.log('✅ Inscription Supabase réussie');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.message);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Déconnexion Supabase...');
      
      await supabaseAuthService.logout();
      sessionService.endSession();
      setUser(null);
      setLastActivity(Date.now());
      
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error.message);
      // Forcer la déconnexion même en cas d'erreur
      sessionService.endSession();
      setUser(null);
    }
  }, []);

  // Mettre à jour l'activité
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (user) {
      sessionService.updateActivity();
    }
  }, [user]);

  // Obtenir la page courante
  const getCurrentPage = useCallback(() => {
    return sessionService.getCurrentPage();
  }, []);

  // Sauvegarder la page courante
  const saveCurrentPage = useCallback((page: string) => {
    sessionService.saveCurrentPage(page);
  }, []);

  // Obtenir le temps jusqu'à expiration
  const getTimeUntilExpiration = useCallback(() => {
    return sessionService.getTimeUntilExpiration();
  }, []);

  // Vérifier l'expiration de session
  useEffect(() => {
    const checkSessionExpiration = () => {
      if (user) {
        const timeUntilExpiration = getTimeUntilExpiration();
        if (timeUntilExpiration <= 0) {
          console.log('⏰ Session expirée, déconnexion automatique');
          logout();
        }
      }
    };

    const interval = setInterval(checkSessionExpiration, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [user, getTimeUntilExpiration, logout]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    lastActivity,
    updateActivity,
    error,
    getCurrentPage,
    saveCurrentPage,
    getTimeUntilExpiration
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
