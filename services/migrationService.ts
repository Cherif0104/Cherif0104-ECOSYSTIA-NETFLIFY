import { databases, DATABASE_ID, COLLECTION_IDS, ID } from './appwriteService';
import { mockUsers, mockProjects, mockCourses, mockTasks, mockTimeLogs, mockInvoices, mockExpenses, mockContacts } from '../constants/data';

/**
 * Service de migration des données mockées vers Appwrite
 * Utilise les collections existantes configurées dans Appwrite
 */

// Types pour la migration
interface MigrationResult {
  success: boolean;
  count: number;
  errors: string[];
}

interface MigrationStats {
  total: number;
  success: number;
  errors: number;
  duration: number;
}

/**
 * Migre les utilisateurs de mock vers utilisateurs_de_démo
 */
export const migrateUsers = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const user of mockUsers) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.USERS, ID.unique(), {
          'ID de l\'utilisateur': user.id,
          'premierN...': user.name.split(' ')[0] || '',
          'dernierNa...': user.name.split(' ').slice(1).join(' ') || '',
          'données de démonstration': JSON.stringify({
            projects: [],
            tasks: [],
            notifications: [],
            documents: [],
            meetings: [],
            goals: []
          }),
          '$id': user.id,
          'e-mail': user.email,
          'rôle': user.role,
          'positi...': user.position || 'Utilisateur',
          'partir...': user.department || 'Général',
          'téléphone': user.phone || '+221 78 XXX XX XX',
          'avatar': user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          'biographie': user.bio || 'Utilisateur de la plateforme Ecosystia',
          'compétences': user.skills?.join(', ') || 'Général',
          'statut': 'actif',
          'estDémo...': true
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur utilisateur ${user.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration utilisateurs: ${error}`);
  }
  
  return result;
};

/**
 * Migre les projets vers projets_de_démo
 */
export const migrateProjects = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const project of mockProjects) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.PROJECTS, ID.unique(), {
          'nom': project.title,
          'description': project.description,
          'statut': project.status,
          'a priori...': project.priority || 'moyenne',
          'débutD...': project.startDate || new Date().toISOString(),
          'date de fin': project.dueDate || null,
          'budget': project.budget || 0,
          'progrès': project.progress || 0,
          'identifiant de rôle': 'utilisateur',
          'créé à': new Date().toISOString(),
          'mis à jour à': new Date().toISOString()
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur projet ${project.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration projets: ${error}`);
  }
  
  return result;
};

/**
 * Migre les cours vers cours
 */
export const migrateCourses = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const course of mockCourses) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.COURSES, ID.unique(), {
          'titre': course.title,
          'décrire...': course.description || 'Description du cours',
          'instru...': course.instructor,
          'instru...': course.instructor,
          'catégorie...': course.category || 'Général',
          'niveau': course.level || 'débutant',
          'durée': course.duration || 0,
          'prix': course.price || 0,
          'vignette': course.thumbnail || '',
          'statut': 'actif',
          'balises': course.tags?.join(', ') || '',
          'nombre d\'inscriptions': 0,
          'devise': 'XOF',
          'URL de la vidéo': '',
          'prérequis': '',
          'résultats d\'apprentissage': '',
          'notation': 0,
          'est publié': true,
          'est en vedette': false,
          'maxÉtudiants': 100,
          'ressources': ''
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur cours ${course.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration cours: ${error}`);
  }
  
  return result;
};

/**
 * Migre les tâches vers tâches
 */
export const migrateTasks = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    // Migrer les tâches des projets
    for (const project of mockProjects) {
      for (const task of project.tasks) {
        try {
          await databases.createDocument(DATABASE_ID, COLLECTION_IDS.TASKS, ID.unique(), {
            'projet...': project.id,
            'titre': task.text,
            'description': task.description || '',
            'statut': task.status,
            'a priori...': task.priority || 'moyenne',
            'assignéÀ': task.assignee?.id || '',
            'date d\'échéance': task.dueDate || null,
            'temps estimé': task.estimatedTime || 0,
            'temps réel': task.loggedTime || 0,
            'balises': task.tags?.join(', ') || '',
            'dépendances': JSON.stringify(task.dependencies || [])
          });
          result.count++;
        } catch (error) {
          result.errors.push(`Erreur tâche ${task.id}: ${error}`);
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration tâches: ${error}`);
  }
  
  return result;
};

/**
 * Migre les journaux de temps
 */
export const migrateTimeLogs = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const log of mockTimeLogs) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.TIME_LOGS, ID.unique(), {
          'ID de l\'utilisateur': log.userId,
          'identifiant du projet': log.projectId || '',
          'identifiant de tâche': log.taskId || '',
          'description': log.description,
          'débutT...': log.startTime || new Date().toISOString(),
          'fin des temps': log.endTime || new Date().toISOString(),
          'durée...': log.duration,
          'billab...': log.billable || false,
          'statut': 'complété',
          'taux horaire': log.hourlyRate || 0
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur journal ${log.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration journaux: ${error}`);
  }
  
  return result;
};

/**
 * Migre les factures
 */
export const migrateInvoices = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const invoice of mockInvoices) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.INVOICES, ID.unique(), {
          'titre': `Facture ${invoice.invoiceNumber}`,
          'décrire...': invoice.description || '',
          'entreprise...': invoice.clientName,
          'localisation...': 'Dakar',
          'salaire': invoice.amount,
          'taper': 'facture',
          'statut': invoice.status,
          'exiger...': '',
          'identifiant de rôle': 'utilisateur',
          'créé à': new Date().toISOString(),
          'mis à jour à': new Date().toISOString()
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur facture ${invoice.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration factures: ${error}`);
  }
  
  return result;
};

/**
 * Migre les dépenses
 */
export const migrateExpenses = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const expense of mockExpenses) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.EXPENSES, ID.unique(), {
          'titre': expense.description,
          'décrire...': expense.description,
          'entreprise...': expense.category,
          'localisation...': 'Dakar',
          'salaire': expense.amount,
          'taper': 'dépense',
          'statut': expense.status,
          'exiger...': '',
          'identifiant de rôle': 'utilisateur',
          'créé à': new Date().toISOString(),
          'mis à jour à': new Date().toISOString()
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur dépense ${expense.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration dépenses: ${error}`);
  }
  
  return result;
};

/**
 * Migre les contacts CRM
 */
export const migrateContacts = async (): Promise<MigrationResult> => {
  const result: MigrationResult = { success: true, count: 0, errors: [] };
  
  try {
    for (const contact of mockContacts) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_IDS.CONTACTS, ID.unique(), {
          'nom': contact.name,
          'e-mail': contact.workEmail,
          'téléphone': contact.officePhone || '',
          'entreprise': contact.company,
          'adresse': '',
          'ville': 'Dakar',
          'pays': 'Sénégal',
          'site web': '',
          'statut': contact.status,
          'balises': '',
          'notes': '',
          'assignéÀ': '',
          'revenu': 0
        });
        result.count++;
      } catch (error) {
        result.errors.push(`Erreur contact ${contact.id}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur générale migration contacts: ${error}`);
  }
  
  return result;
};

/**
 * Migration complète de toutes les données
 */
export const migrateAllData = async (): Promise<MigrationStats> => {
  const startTime = Date.now();
  const stats: MigrationStats = { total: 0, success: 0, errors: 0, duration: 0 };
  
  console.log('🚀 Début de la migration vers Appwrite...');
  
  const migrations = [
    { name: 'Utilisateurs', fn: migrateUsers },
    { name: 'Projets', fn: migrateProjects },
    { name: 'Cours', fn: migrateCourses },
    { name: 'Tâches', fn: migrateTasks },
    { name: 'Journaux de temps', fn: migrateTimeLogs },
    { name: 'Factures', fn: migrateInvoices },
    { name: 'Dépenses', fn: migrateExpenses },
    { name: 'Contacts', fn: migrateContacts }
  ];
  
  for (const migration of migrations) {
    try {
      console.log(`📦 Migration des ${migration.name}...`);
      const result = await migration.fn();
      
      stats.total += result.count;
      stats.success += result.count;
      stats.errors += result.errors.length;
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ Erreurs lors de la migration des ${migration.name}:`, result.errors);
      } else {
        console.log(`✅ ${migration.name}: ${result.count} éléments migrés`);
      }
    } catch (error) {
      console.error(`❌ Erreur critique migration ${migration.name}:`, error);
      stats.errors++;
    }
  }
  
  stats.duration = Date.now() - startTime;
  
  console.log('🎉 Migration terminée !');
  console.log(`📊 Statistiques:`);
  console.log(`   • Total: ${stats.total} éléments`);
  console.log(`   • Succès: ${stats.success}`);
  console.log(`   • Erreurs: ${stats.errors}`);
  console.log(`   • Durée: ${(stats.duration / 1000).toFixed(2)}s`);
  
  return stats;
};

/**
 * Vérifie la connectivité Appwrite
 */
export const checkAppwriteConnection = async (): Promise<boolean> => {
  try {
    await databases.list(DATABASE_ID);
    console.log('✅ Connexion Appwrite OK');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Appwrite:', error);
    return false;
  }
};

/**
 * Nettoie les données de démonstration (optionnel)
 */
export const clearDemoData = async (): Promise<void> => {
  console.log('🧹 Nettoyage des données de démonstration...');
  
  const collections = Object.values(COLLECTION_IDS);
  
  for (const collectionId of collections) {
    try {
      const documents = await databases.listDocuments(DATABASE_ID, collectionId);
      
      for (const doc of documents.documents) {
        await databases.deleteDocument(DATABASE_ID, collectionId, doc.$id);
      }
      
      console.log(`✅ Collection ${collectionId} nettoyée`);
    } catch (error) {
      console.warn(`⚠️ Erreur nettoyage ${collectionId}:`, error);
    }
  }
};

