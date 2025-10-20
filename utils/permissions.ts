/**
 * 🔐 SYSTÈME DE PERMISSIONS - ECOSYSTIA
 * Gestion granulaire des permissions par rôle
 */

import { Role, User } from '../types';

/**
 * Définition des permissions disponibles
 */
export const PERMISSIONS = {
  // Projets
  PROJECTS: {
    CREATE: 'projects:create',
    READ: 'projects:read',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
    MANAGE_TASKS: 'projects:tasks:manage',
    MANAGE_RISKS: 'projects:risks:manage',
    VIEW_ANALYTICS: 'projects:analytics:view',
  },
  
  // Utilisateurs
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE_ROLES: 'users:roles:manage',
  },
  
  // Cours
  COURSES: {
    CREATE: 'courses:create',
    READ: 'courses:read',
    UPDATE: 'courses:update',
    DELETE: 'courses:delete',
    ENROLL: 'courses:enroll',
    MANAGE: 'courses:manage',
  },
  
  // Finance
  FINANCE: {
    VIEW: 'finance:view',
    CREATE: 'finance:create',
    UPDATE: 'finance:update',
    DELETE: 'finance:delete',
    APPROVE: 'finance:approve',
    MANAGE_BUDGETS: 'finance:budgets:manage',
  },
  
  // CRM
  CRM: {
    VIEW: 'crm:view',
    CREATE: 'crm:create',
    UPDATE: 'crm:update',
    DELETE: 'crm:delete',
    MANAGE: 'crm:manage',
  },
  
  // Emplois
  JOBS: {
    VIEW: 'jobs:view',
    CREATE: 'jobs:create',
    UPDATE: 'jobs:update',
    DELETE: 'jobs:delete',
    MANAGE: 'jobs:manage',
    APPLY: 'jobs:apply',
  },
  
  // Congés
  LEAVE: {
    REQUEST: 'leave:request',
    APPROVE: 'leave:approve',
    REJECT: 'leave:reject',
    VIEW_ALL: 'leave:view_all',
  },
  
  // Analytics
  ANALYTICS: {
    VIEW: 'analytics:view',
    EXPORT: 'analytics:export',
  },
  
  // Settings
  SETTINGS: {
    VIEW: 'settings:view',
    UPDATE: 'settings:update',
    MANAGE_SYSTEM: 'settings:system:manage',
  },
} as const;

/**
 * Permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  // Super Administrateur - Accès complet
  super_administrator: [
    ...Object.values(PERMISSIONS.PROJECTS),
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.COURSES),
    ...Object.values(PERMISSIONS.FINANCE),
    ...Object.values(PERMISSIONS.CRM),
    ...Object.values(PERMISSIONS.JOBS),
    ...Object.values(PERMISSIONS.LEAVE),
    ...Object.values(PERMISSIONS.ANALYTICS),
    ...Object.values(PERMISSIONS.SETTINGS),
  ],
  
  // Administrateur
  administrator: [
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.PROJECTS.DELETE,
    PERMISSIONS.PROJECTS.MANAGE_TASKS,
    PERMISSIONS.PROJECTS.MANAGE_RISKS,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.COURSES.CREATE,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.UPDATE,
    PERMISSIONS.COURSES.DELETE,
    PERMISSIONS.COURSES.MANAGE,
    PERMISSIONS.FINANCE.VIEW,
    PERMISSIONS.FINANCE.CREATE,
    PERMISSIONS.FINANCE.UPDATE,
    PERMISSIONS.CRM.VIEW,
    PERMISSIONS.CRM.CREATE,
    PERMISSIONS.CRM.UPDATE,
    PERMISSIONS.CRM.MANAGE,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.JOBS.CREATE,
    PERMISSIONS.JOBS.UPDATE,
    PERMISSIONS.JOBS.MANAGE,
    PERMISSIONS.LEAVE.APPROVE,
    PERMISSIONS.LEAVE.REJECT,
    PERMISSIONS.LEAVE.VIEW_ALL,
    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.SETTINGS.VIEW,
    PERMISSIONS.SETTINGS.UPDATE,
  ],
  
  // Manager
  manager: [
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.PROJECTS.MANAGE_TASKS,
    PERMISSIONS.PROJECTS.MANAGE_RISKS,
    PERMISSIONS.PROJECTS.VIEW_ANALYTICS,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.ENROLL,
    PERMISSIONS.FINANCE.VIEW,
    PERMISSIONS.CRM.VIEW,
    PERMISSIONS.CRM.CREATE,
    PERMISSIONS.CRM.UPDATE,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.JOBS.CREATE,
    PERMISSIONS.JOBS.UPDATE,
    PERMISSIONS.LEAVE.APPROVE,
    PERMISSIONS.LEAVE.REJECT,
    PERMISSIONS.LEAVE.VIEW_ALL,
    PERMISSIONS.ANALYTICS.VIEW,
  ],
  
  // Supervisor
  supervisor: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.PROJECTS.MANAGE_TASKS,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.ENROLL,
    PERMISSIONS.FINANCE.VIEW,
    PERMISSIONS.CRM.VIEW,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.LEAVE.VIEW_ALL,
  ],
  
  // Student
  student: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.ENROLL,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.JOBS.APPLY,
    PERMISSIONS.LEAVE.REQUEST,
  ],
  
  // Employer
  employer: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.FINANCE.VIEW,
    PERMISSIONS.CRM.VIEW,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.JOBS.CREATE,
    PERMISSIONS.JOBS.UPDATE,
    PERMISSIONS.JOBS.MANAGE,
  ],
  
  // Editor
  editor: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.UPDATE,
  ],
  
  // Autres rôles - Permissions basiques
  entrepreneur: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.FINANCE.VIEW,
    PERMISSIONS.CRM.VIEW,
    PERMISSIONS.CRM.CREATE,
    PERMISSIONS.JOBS.VIEW,
  ],
  
  funder: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.FINANCE.VIEW,
    PERMISSIONS.ANALYTICS.VIEW,
  ],
  
  mentor: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
  ],
  
  intern: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.ENROLL,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.LEAVE.REQUEST,
  ],
  
  trainer: [
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.CREATE,
    PERMISSIONS.COURSES.UPDATE,
    PERMISSIONS.COURSES.MANAGE,
    PERMISSIONS.USERS.READ,
  ],
  
  implementer: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.PROJECTS.MANAGE_TASKS,
  ],
  
  coach: [
    PERMISSIONS.USERS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.ANALYTICS.VIEW,
  ],
  
  facilitator: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.USERS.READ,
  ],
  
  publisher: [
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.COURSES.CREATE,
    PERMISSIONS.COURSES.UPDATE,
  ],
  
  producer: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.FINANCE.VIEW,
  ],
  
  artist: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.COURSES.READ,
  ],
  
  alumni: [
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.COURSES.READ,
    PERMISSIONS.JOBS.VIEW,
    PERMISSIONS.JOBS.APPLY,
  ],
};

/**
 * Permissions par module
 */
export const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: [PERMISSIONS.PROJECTS.READ],
  projects: [PERMISSIONS.PROJECTS.READ],
  goals_okrs: [PERMISSIONS.PROJECTS.READ],
  time_tracking: [PERMISSIONS.PROJECTS.READ],
  leave_management: [PERMISSIONS.LEAVE.REQUEST, PERMISSIONS.LEAVE.VIEW_ALL],
  finance: [PERMISSIONS.FINANCE.VIEW],
  knowledge_base: [PERMISSIONS.PROJECTS.READ],
  courses: [PERMISSIONS.COURSES.READ],
  jobs: [PERMISSIONS.JOBS.VIEW],
  ai_coach: [PERMISSIONS.PROJECTS.READ],
  gen_ai_lab: [PERMISSIONS.PROJECTS.READ],
  crm_sales: [PERMISSIONS.CRM.VIEW],
  course_management: [PERMISSIONS.COURSES.MANAGE],
  analytics: [PERMISSIONS.ANALYTICS.VIEW],
  user_management: [PERMISSIONS.USERS.MANAGE_ROLES],
  settings: [PERMISSIONS.SETTINGS.VIEW],
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Vérifie si un utilisateur a toutes les permissions données
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Vérifie si un utilisateur a au moins une des permissions données
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Vérifie si un utilisateur peut accéder à un module
 */
export const canAccessModule = (user: User | null, module: string): boolean => {
  if (!user) return false;
  
  const requiredPermissions = MODULE_PERMISSIONS[module] || [];
  if (requiredPermissions.length === 0) return true; // Module accessible à tous
  
  return hasAnyPermission(user, requiredPermissions);
};

/**
 * Récupère toutes les permissions d'un utilisateur
 */
export const getUserPermissions = (user: User | null): string[] => {
  if (!user) return [];
  
  return ROLE_PERMISSIONS[user.role] || [];
};

/**
 * Vérifie si un rôle est de niveau management
 */
export const isManagementRole = (role: Role): boolean => {
  const managementRoles: Role[] = [
    'super_administrator',
    'administrator',
    'manager',
    'supervisor',
  ];
  return managementRoles.includes(role);
};

/**
 * Vérifie si un rôle est de niveau admin
 */
export const isAdminRole = (role: Role): boolean => {
  return role === 'super_administrator' || role === 'administrator';
};

/**
 * Hook React pour les permissions
 */
export const usePermissions = (user: User | null) => {
  return {
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    canAccessModule: (module: string) => canAccessModule(user, module),
    getUserPermissions: () => getUserPermissions(user),
    isManagement: user ? isManagementRole(user.role) : false,
    isAdmin: user ? isAdminRole(user.role) : false,
  };
};

