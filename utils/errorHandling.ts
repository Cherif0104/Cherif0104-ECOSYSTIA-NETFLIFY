/**
 * 🛡️ GESTION D'ERREURS ROBUSTE - ECOSYSTIA
 * Système complet de gestion des erreurs avec logging et notifications
 */

export interface AppError {
  code: string;
  message: string;
  context?: string;
  timestamp: string;
  userId?: string;
}

export class EcosystiaError extends Error {
  public code: string;
  public context?: string;
  public timestamp: string;

  constructor(message: string, code: string, context?: string) {
    super(message);
    this.name = 'EcosystiaError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export const ERROR_CODES = {
  // Erreurs Authentification
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_SESSION_EXPIRED: 'AUTH_002',
  AUTH_UNAUTHORIZED: 'AUTH_003',
  
  // Erreurs Validation
  VALIDATION_REQUIRED_FIELD: 'VAL_001',
  VALIDATION_INVALID_FORMAT: 'VAL_002',
  VALIDATION_INVALID_DATE: 'VAL_003',
  
  // Erreurs Base de données
  DB_CONNECTION_FAILED: 'DB_001',
  DB_DOCUMENT_NOT_FOUND: 'DB_002',
  DB_DUPLICATE_ENTRY: 'DB_003',
  DB_OPERATION_FAILED: 'DB_004',
  
  // Erreurs Réseau
  NETWORK_TIMEOUT: 'NET_001',
  NETWORK_OFFLINE: 'NET_002',
  
  // Erreurs Métier
  BUSINESS_INVALID_OPERATION: 'BUS_001',
  BUSINESS_PERMISSION_DENIED: 'BUS_002',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  // Authentification
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Identifiants invalides',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Session expirée, veuillez vous reconnecter',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'Action non autorisée',
  
  // Validation
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Champ requis manquant',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Format de données invalide',
  [ERROR_CODES.VALIDATION_INVALID_DATE]: 'Date invalide',
  
  // Base de données
  [ERROR_CODES.DB_CONNECTION_FAILED]: 'Erreur de connexion à la base de données',
  [ERROR_CODES.DB_DOCUMENT_NOT_FOUND]: 'Document non trouvé',
  [ERROR_CODES.DB_DUPLICATE_ENTRY]: 'Entrée déjà existante',
  [ERROR_CODES.DB_OPERATION_FAILED]: 'Opération base de données échouée',
  
  // Réseau
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Délai d\'attente dépassé',
  [ERROR_CODES.NETWORK_OFFLINE]: 'Pas de connexion internet',
  
  // Métier
  [ERROR_CODES.BUSINESS_INVALID_OPERATION]: 'Opération invalide',
  [ERROR_CODES.BUSINESS_PERMISSION_DENIED]: 'Permission refusée',
};

/**
 * Gestionnaire d'erreurs principal
 */
export class ErrorHandler {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 100;

  /**
   * Traite une erreur et retourne un message utilisateur approprié
   */
  static handle(error: unknown, context?: string): string {
    let appError: AppError;

    if (error instanceof EcosystiaError) {
      appError = {
        code: error.code,
        message: error.message,
        context: error.context || context,
        timestamp: error.timestamp,
      };
    } else if (error instanceof Error) {
      // Erreur standard JavaScript
      appError = {
        code: 'UNKNOWN',
        message: error.message,
        context,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Erreur inconnue
      appError = {
        code: 'UNKNOWN',
        message: String(error),
        context,
        timestamp: new Date().toISOString(),
      };
    }

    // Logger l'erreur
    this.log(appError);

    // Retourner message utilisateur
    return this.getUserMessage(appError);
  }

  /**
   * Logue une erreur
   */
  private static log(error: AppError): void {
    // Ajouter au log local
    this.errorLog.push(error);

    // Limiter la taille du log
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Logger dans la console (développement)
    if (import.meta.env.DEV) {
      console.error(`[${error.code}] ${error.message}`, {
        context: error.context,
        timestamp: error.timestamp,
      });
    }

    // TODO: Envoyer à service de monitoring en production
    // if (import.meta.env.PROD) {
    //   this.sendToMonitoring(error);
    // }
  }

  /**
   * Retourne un message utilisateur approprié
   */
  private static getUserMessage(error: AppError): string {
    // Message personnalisé basé sur le code
    const customMessage = ERROR_MESSAGES[error.code];
    if (customMessage) {
      return customMessage;
    }

    // Message générique si pas de correspondance
    if (error.code.startsWith('AUTH_')) {
      return 'Erreur d\'authentification. Veuillez réessayer.';
    } else if (error.code.startsWith('DB_')) {
      return 'Erreur de sauvegarde. Vos données n\'ont pas été enregistrées.';
    } else if (error.code.startsWith('NET_')) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  /**
   * Récupère le log des erreurs
   */
  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Efface le log des erreurs
   */
  static clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Vérifie si une erreur est critique
   */
  static isCritical(error: AppError): boolean {
    const criticalCodes = [
      ERROR_CODES.DB_CONNECTION_FAILED,
      ERROR_CODES.AUTH_SESSION_EXPIRED,
    ];
    return criticalCodes.includes(error.code as any);
  }
}

/**
 * Hook React pour gérer les erreurs
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string): string => {
    return ErrorHandler.handle(error, context);
  };

  const getErrorLog = () => ErrorHandler.getErrorLog();
  const clearErrorLog = () => ErrorHandler.clearLog();

  return {
    handleError,
    getErrorLog,
    clearErrorLog,
  };
};

/**
 * Wrapper pour exécuter des fonctions avec gestion d'erreurs
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    ErrorHandler.handle(error, context);
    return fallbackValue;
  }
}

/**
 * Retry logic avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

