import { databases, DATABASE_ID, ID, Query } from './appwriteService';

/**
 * Service de données simplifié pour ECOSYSTIA
 * Évite les erreurs d'import en utilisant les collections directement
 */

// Collection IDs en dur pour éviter les erreurs d'import
const COLLECTIONS = {
  USERS: 'utilisateurs_de_démo',
  COURSES: 'cours',
  JOBS: 'emplois',
  PROJECTS: 'projets',
  TASKS: 'tâches',
  TIME_LOGS: 'journaux_de_temps_de_démo',
  INVOICES: 'factures_de_démo',
  CONTACTS: 'clients_crm',
} as const;

/**
 * Tester la connexion Appwrite
 */
export const testConnection = async (): Promise<boolean> => {
  // Désactivé temporairement pour éviter les erreurs
  console.log('⚠️ Appwrite temporairement désactivé');
  return false;
};

/**
 * Service pour les projets
 */
export const projectService = {
  // Récupérer tous les projets pour un utilisateur
  async getAll(userId: string) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS, [
        Query.equal('ID de l\'utilisateur', userId)
      ]);
      
      return response.documents.map(doc => ({
        id: doc.$id,
        title: doc.nom || doc.title,
        description: doc.description || doc['décrire...'],
        status: doc.statut || doc.status,
        priority: doc['a priori...'] || doc.priority || 'moyenne',
        startDate: doc['débutD...'] || doc.startDate,
        dueDate: doc['date de fin'] || doc.dueDate,
        budget: doc.budget || 0,
        progress: doc.progrès || doc.progress || 0,
        team: doc['membres de l\'équipe'] ? JSON.parse(doc['membres de l\'équipe']) : [],
        tasks: [],
        risks: [],
        ownerId: doc['propriétaireJe...'] || doc.ownerId || userId
      }));
    } catch (error) {
      console.error('Erreur récupération projets:', error);
      return [];
    }
  },

  // Créer un nouveau projet
  async create(project: any, userId: string) {
    try {
      const docData = {
        nom: project.title,
        description: project.description,
        statut: project.status,
        'a priori...': project.priority,
        'débutD...': project.startDate,
        'date de fin': project.dueDate,
        budget: project.budget,
        progrès: project.progress,
        'membres de l\'équipe': JSON.stringify(project.team),
        'propriétaireJe...': userId,
        'créé à': new Date().toISOString(),
        'mis à jour à': new Date().toISOString()
      };

      const response = await databases.createDocument(
        DATABASE_ID, 
        COLLECTIONS.PROJECTS, 
        ID.unique(), 
        docData
      );

      return {
        ...project,
        id: response.$id,
        ownerId: userId
      };
    } catch (error) {
      console.error('Erreur création projet:', error);
      return null;
    }
  },

  // Mettre à jour un projet
  async update(projectId: string, updates: any, userId: string) {
    try {
      const docData = {
        ...updates,
        'ID de l\'utilisateur': userId,
        'mis à jour à': new Date().toISOString()
      };

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROJECTS,
        projectId,
        docData
      );
      return true;
    } catch (error) {
      console.error('Erreur mise à jour projet:', error);
      return false;
    }
  },

  // Supprimer un projet
  async delete(projectId: string) {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId);
      return true;
    } catch (error) {
      console.error('Erreur suppression projet:', error);
      return false;
    }
  }
};

/**
 * Service pour les utilisateurs
 */
export const userService = {
  async getAll() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS);
      
      return response.documents.map(doc => ({
        id: doc.$id,
        name: `${doc['premierN...'] || ''} ${doc['dernierNa...'] || ''}`.trim(),
        email: doc['e-mail'] || doc.email,
        role: doc.rôle || doc.role,
        position: doc['positi...'] || doc.position,
        department: doc['partir...'] || doc.department,
        phone: doc.téléphone || doc.phone,
        avatar: doc.avatar,
        bio: doc.biographie || doc.bio,
        skills: doc.compétences ? doc.compétences.split(', ') : [],
        status: doc.statut || doc.status,
        isDemoUser: doc['estDémo...'] || doc.isDemoUser
      }));
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      return [];
    }
  }
};

/**
 * Fonction utilitaire pour nettoyer la base de données
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    const collections = Object.values(COLLECTIONS);
    
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
    
    return true;
  } catch (error) {
    console.error('Erreur nettoyage général:', error);
    return false;
  }
};

