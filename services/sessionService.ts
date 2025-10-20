import { User, Role } from '../types';

interface SessionData {
    user: User;
    lastActivity: number;
    currentPage: string;
    formData?: any;
    timestamp: number;
}

class SessionService {
    private readonly SESSION_KEY = 'ecosystia_session';
    private readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes en millisecondes
    private readonly ACTIVITY_CHECK_INTERVAL = 30 * 1000; // Vérification toutes les 30 secondes
    private activityTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.startActivityMonitoring();
        this.setupActivityListeners();
    }

    // Démarrer la session
    startSession(user: User): void {
        const sessionData: SessionData = {
            user,
            lastActivity: Date.now(),
            currentPage: 'dashboard',
            timestamp: Date.now()
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        console.log('🔧 Session démarrée:', {
            userId: user.id,
            userName: user.name,
            role: user.role,
            timestamp: new Date().toISOString()
        });
        console.log(`✅ Session démarrée pour ${user.name} (${user.role})`);
    }

    // Vérifier si la session est valide
    isSessionValid(): boolean {
        const sessionData = this.getSessionData();
        if (!sessionData) return false;

        const now = Date.now();
        const timeSinceLastActivity = now - sessionData.lastActivity;
        
        // Mode démo : session valide si moins de 10 minutes
        if (this.isDemoMode) {
            return timeSinceLastActivity < this.SESSION_TIMEOUT;
        }
        
        // Mode production : vérifier avec Appwrite
        if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
            console.log('⏰ Session expirée - timeout dépassé');
            this.endSession();
            return false;
        }

        return true;
    }

    // Obtenir les données de session (sans validation pour éviter boucle infinie)
    getSessionData(): SessionData | null {
        try {
            const stored = localStorage.getItem(this.SESSION_KEY);
            if (!stored) return null;
            
            const sessionData = JSON.parse(stored);
            return sessionData;
        } catch (error) {
            console.error('❌ Erreur lecture session:', error);
            return null;
        }
    }

    // Obtenir l'utilisateur actuel
    getCurrentUser(): User | null {
        const sessionData = this.getSessionData();
        return sessionData ? sessionData.user : null;
    }

    // Mettre à jour l'activité
    updateActivity(): void {
        const sessionData = this.getSessionData();
        if (sessionData) {
            sessionData.lastActivity = Date.now();
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        }
    }

    // Sauvegarder la page actuelle
    saveCurrentPage(page: string): void {
        const sessionData = this.getSessionData();
        if (sessionData) {
            sessionData.currentPage = page;
            sessionData.lastActivity = Date.now();
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        }
    }

    // Sauvegarder les données de formulaire
    saveFormData(formData: any): void {
        const sessionData = this.getSessionData();
        if (sessionData) {
            sessionData.formData = formData;
            sessionData.lastActivity = Date.now();
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        }
    }

    // Récupérer les données de formulaire
    getFormData(): any {
        const sessionData = this.getSessionData();
        return sessionData ? sessionData.formData : null;
    }

    // Obtenir la page actuelle
    getCurrentPage(): string {
        const sessionData = this.getSessionData();
        return sessionData ? sessionData.currentPage : 'dashboard';
    }

    // Terminer la session
    endSession(): void {
        const sessionData = this.getSessionData();
        if (sessionData) {
            console.log(`🔚 Session terminée pour ${sessionData.user.name}`);
        }
        
        localStorage.removeItem(this.SESSION_KEY);
        this.stopActivityMonitoring();
    }

    // Démarrer la surveillance d'activité
    private startActivityMonitoring(): void {
        this.activityTimer = setInterval(() => {
            if (!this.isSessionValid()) {
                this.endSession();
                // Rediriger vers la page de connexion
                window.location.href = '/#/login';
            }
        }, this.ACTIVITY_CHECK_INTERVAL);
    }

    // Arrêter la surveillance d'activité
    private stopActivityMonitoring(): void {
        if (this.activityTimer) {
            clearInterval(this.activityTimer);
            this.activityTimer = null;
        }
    }

    // Configurer les écouteurs d'activité
    private setupActivityListeners(): void {
        // Événements qui indiquent une activité utilisateur
        const activityEvents = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
        ];

        const updateActivity = () => {
            this.updateActivity();
        };

        // Ajouter les écouteurs avec throttling
        let lastActivityUpdate = 0;
        const throttledUpdate = () => {
            const now = Date.now();
            if (now - lastActivityUpdate > 5000) { // Mettre à jour max toutes les 5 secondes
                updateActivity();
                lastActivityUpdate = now;
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, throttledUpdate, true);
        });
    }

    // Vérifier les permissions utilisateur
    hasPermission(requiredRole: Role): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Hiérarchie des rôles (du plus élevé au plus bas)
        const roleHierarchy: Record<Role, number> = {
            'super_administrator': 10,
            'administrator': 9,
            'director': 8,
            'manager': 7,
            'senior_developer': 6,
            'developer': 5,
            'junior_developer': 4,
            'senior_designer': 6,
            'designer': 5,
            'junior_designer': 4,
            'senior_analyst': 6,
            'analyst': 5,
            'junior_analyst': 4,
            'senior_consultant': 6,
            'consultant': 5,
            'junior_consultant': 4,
            'intern': 3,
            'freelancer': 2,
            'guest': 1
        };

        const userLevel = roleHierarchy[user.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    // Obtenir le temps restant avant expiration
    getTimeUntilExpiration(): number {
        const sessionData = this.getSessionData();
        if (!sessionData) return 0;

        const now = Date.now();
        const timeSinceLastActivity = now - sessionData.lastActivity;
        const timeRemaining = this.SESSION_TIMEOUT - timeSinceLastActivity;

        return Math.max(0, timeRemaining);
    }

    // Formater le temps restant
    getFormattedTimeRemaining(): string {
        const timeRemaining = this.getTimeUntilExpiration();
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

export const sessionService = new SessionService();
