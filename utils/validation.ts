/**
 * Utilitaires de validation pour les formulaires
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Format international ou local
  const phoneRegex = /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{2}[-\s\.]?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const validateDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const validateFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return validateDate(dateObj) && dateObj > new Date();
};

export const validatePastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return validateDate(dateObj) && dateObj <= new Date();
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value && value.length <= maxLength;
};

export const validatePositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0;
};

export const validateNonNegativeNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return validateDate(start) && validateDate(end) && start < end;
};

/**
 * Messages d'erreur standards en français
 */
export const ErrorMessages = {
  required: 'Ce champ est requis',
  email: 'Email invalide',
  phone: 'Numéro de téléphone invalide',
  minLength: (min: number) => `Minimum ${min} caractères requis`,
  maxLength: (max: number) => `Maximum ${max} caractères autorisés`,
  positiveNumber: 'Le nombre doit être positif',
  nonNegativeNumber: 'Le nombre ne peut pas être négatif',
  invalidDate: 'Date invalide',
  futureDate: 'La date doit être dans le futur',
  pastDate: 'La date doit être dans le passé',
  invalidUrl: 'URL invalide',
  dateRange: 'La date de fin doit être après la date de début',
  range: (min: number, max: number) => `La valeur doit être entre ${min} et ${max}`,
};

/**
 * Classe de validation pour les formulaires
 */
export class FormValidator {
  private errors: Record<string, string> = {};

  validateField(
    fieldName: string,
    value: any,
    rules: ValidationRule[]
  ): void {
    for (const rule of rules) {
      const error = rule.validate(value);
      if (error) {
        this.errors[fieldName] = error;
        return;
      }
    }
    delete this.errors[fieldName];
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  clearErrors(): void {
    this.errors = {};
  }

  setError(fieldName: string, message: string): void {
    this.errors[fieldName] = message;
  }
}

export interface ValidationRule {
  validate: (value: any) => string | null;
}

/**
 * Règles de validation prédéfinies
 */
export const ValidationRules = {
  required: (): ValidationRule => ({
    validate: (value) => validateRequired(value) ? null : ErrorMessages.required,
  }),

  email: (): ValidationRule => ({
    validate: (value) => !value || validateEmail(value) ? null : ErrorMessages.email,
  }),

  phone: (): ValidationRule => ({
    validate: (value) => !value || validatePhone(value) ? null : ErrorMessages.phone,
  }),

  minLength: (min: number): ValidationRule => ({
    validate: (value) => !value || validateMinLength(value, min) ? null : ErrorMessages.minLength(min),
  }),

  maxLength: (max: number): ValidationRule => ({
    validate: (value) => !value || validateMaxLength(value, max) ? null : ErrorMessages.maxLength(max),
  }),

  positiveNumber: (): ValidationRule => ({
    validate: (value) => value === '' || value === null || validatePositiveNumber(Number(value)) ? null : ErrorMessages.positiveNumber,
  }),

  nonNegativeNumber: (): ValidationRule => ({
    validate: (value) => value === '' || value === null || validateNonNegativeNumber(Number(value)) ? null : ErrorMessages.nonNegativeNumber,
  }),

  range: (min: number, max: number): ValidationRule => ({
    validate: (value) => !value || validateRange(Number(value), min, max) ? null : ErrorMessages.range(min, max),
  }),

  futureDate: (): ValidationRule => ({
    validate: (value) => !value || validateFutureDate(value) ? null : ErrorMessages.futureDate,
  }),

  pastDate: (): ValidationRule => ({
    validate: (value) => !value || validatePastDate(value) ? null : ErrorMessages.pastDate,
  }),

  url: (): ValidationRule => ({
    validate: (value) => !value || validateUrl(value) ? null : ErrorMessages.invalidUrl,
  }),

  custom: (validatorFn: (value: any) => boolean, errorMessage: string): ValidationRule => ({
    validate: (value) => validatorFn(value) ? null : errorMessage,
  }),
};
