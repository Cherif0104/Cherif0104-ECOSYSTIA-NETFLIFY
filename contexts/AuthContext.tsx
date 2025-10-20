
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { authService, AuthUser } from '../services/authService';
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

// Configuration
const SESSION_KEY = 'ecosystia_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour l'activité
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    sessionService.updateActivity();
  }, []);

  // Obtenir la page actuelle
  const getCurrentPage = useCallback(() => {
    return sessionService.getCurrentPage();
  }, []);

  // Sauvegarder la page actuelle
  const saveCurrentPage = useCallback((page: string) => {
    sessionService.saveCurrentPage(page);
  }, []);

  // Obtenir le temps restant avant expiration
  const getTimeUntilExpiration = useCallback(() => {
    return sessionService.getTimeUntilExpiration();
  }, []);

  // Logout automatique si session expirée
  const checkSessionExpiry = useCallback(() => {
    if (user && !sessionService.isSessionValid()) {
      console.log('Session expirée - Déconnexion automatique');
      logout();
      return true;
    }
    return false;
  }, [user]);

  // Charger la session au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Vérifier d'abord la session locale
        if (sessionService.isSessionValid()) {
          const currentUser = sessionService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setLastActivity(Date.now());
            console.log('✅ Session locale restaurée avec succès');
            setIsLoading(false);
            return;
          }
        }

        // Sinon, essayer de récupérer depuis Supabase
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          const userData = authService.convertToUser(authUser);
          setUser(userData);
          sessionService.startSession(userData);
          setLastActivity(Date.now());
          console.log('Session Supabase restaurée avec succès');
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Surveiller l'activité utilisateur
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Ajouter les listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Vérifier périodiquement l'expiration
    const checkInterval = setInterval(checkSessionExpiry, 60000); // Vérifier chaque minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(checkInterval);
    };
  }, [user, updateActivity, checkSessionExpiry]);

  const login = async (credentials: { email: string; password: string; role?: Role }): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Authentification Supabase uniquement (mode production)
      const authUser = await authService.login(credentials);
      if (authUser) {
        const userData = authService.convertToUser(authUser);
        
        setUser(userData);
        sessionService.startSession(userData);
        localStorage.setItem('ecosystia_is_new_login', 'true');
        
        console.log('✅ Connexion Supabase réussie - Session créée');
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.message);
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir les compétences selon le rôle
  const getRoleSkills = (role: Role): string[] => {
    const roleSkills: Record<Role, string[]> = {
      'super_administrator': ['Administration', 'Sécurité', 'Gestion', 'Développement'],
      'administrator': ['Administration', 'Gestion', 'Sécurité'],
      'manager': ['Gestion', 'Leadership', 'Planification'],
      'team_lead': ['Leadership', 'Gestion d\'équipe', 'Planification'],
      'developer': ['Développement', 'Programmation', 'Architecture'],
      'designer': ['Design', 'UI/UX', 'Créativité'],
      'analyst': ['Analyse', 'Données', 'Reporting'],
      'tester': ['Test', 'Qualité', 'Validation'],
      'consultant': ['Conseil', 'Analyse', 'Stratégie'],
      'trainer': ['Formation', 'Pédagogie', 'Communication'],
      'support': ['Support', 'Assistance', 'Communication'],
      'sales': ['Vente', 'Commercial', 'Négociation'],
      'marketing': ['Marketing', 'Communication', 'Stratégie'],
      'hr': ['RH', 'Gestion', 'Recrutement'],
      'finance': ['Finance', 'Comptabilité', 'Analyse'],
      'legal': ['Juridique', 'Conformité', 'Réglementation'],
      'operations': ['Opérations', 'Gestion', 'Optimisation'],
      'research': ['Recherche', 'Innovation', 'Analyse'],
      'content': ['Contenu', 'Rédaction', 'Communication']
    };
    
    return roleSkills[role] || ['Général'];
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; role: string }): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const authUser = await authService.register({
        ...data,
        role: data.role as any
      });
      
      if (authUser) {
        const userData = authService.convertToUser(authUser);
        const now = Date.now();
        
        setUser(userData);
        setLastActivity(now);
        
        sessionService.startSession(userData);
        localStorage.setItem('ecosystia_is_new_login', 'true');
        
        console.log('Inscription réussie - Session créée');
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error.message);
      console.error('Erreur d\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      
      setUser(null);
      sessionService.endSession();
      
      console.log('Déconnexion - Session nettoyée');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      // Nettoyer quand même localement
      setUser(null);
      localStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ 
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};