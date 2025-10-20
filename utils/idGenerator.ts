/**
 * 🔑 GÉNÉRATEUR D'IDS UNIQUES
 * Utilitaires pour générer des IDs uniques compatibles avec Appwrite
 */

/**
 * Génère un ID unique de type string
 * Format: prefix_timestamp_random
 */
export const generateId = (prefix: string = 'id'): string => {
  const timestamp = Date.now().toString(36); // Base 36 pour compacité
  const random = Math.random().toString(36).substring(2, 9); // 7 caractères aléatoires
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Génère un ID unique pour un projet
 */
export const generateProjectId = (): string => generateId('proj');

/**
 * Génère un ID unique pour une tâche
 */
export const generateTaskId = (): string => generateId('task');

/**
 * Génère un ID unique pour un utilisateur
 */
export const generateUserId = (): string => generateId('user');

/**
 * Génère un ID unique pour un cours
 */
export const generateCourseId = (): string => generateId('course');

/**
 * Génère un ID unique pour un contact
 */
export const generateContactId = (): string => generateId('contact');

/**
 * Génère un ID unique pour une facture
 */
export const generateInvoiceId = (): string => generateId('inv');

/**
 * Génère un ID unique pour une dépense
 */
export const generateExpenseId = (): string => generateId('exp');

/**
 * Génère un ID unique pour un budget
 */
export const generateBudgetId = (): string => generateId('budget');

/**
 * Génère un ID unique pour une réunion
 */
export const generateMeetingId = (): string => generateId('meeting');

/**
 * Génère un ID unique pour une demande de congé
 */
export const generateLeaveRequestId = (): string => generateId('leave');

/**
 * Génère un ID unique pour un log de temps
 */
export const generateTimeLogId = (): string => generateId('time');

/**
 * Génère un ID unique pour un risque
 */
export const generateRiskId = (): string => generateId('risk');

/**
 * Génère un ID unique pour une facture récurrente
 */
export const generateRecurringInvoiceId = (): string => generateId('rinv');

/**
 * Génère un ID unique pour une dépense récurrente
 */
export const generateRecurringExpenseId = (): string => generateId('rexp');

/**
 * Génère un numéro de facture unique
 * Format: INV-YYYYMMDD-XXX
 */
export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}${day}-${random}`;
};

