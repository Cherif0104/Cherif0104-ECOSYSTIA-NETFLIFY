/**
 * Service de synchronisation temps réel avec Appwrite
 * Permet de recevoir les mises à jour en direct des données
 */

import { client, DATABASE_ID, COLLECTION_IDS } from './appwriteService';

type RealtimeCallback = (payload: any) => void;

class RealtimeService {
  private subscriptions: Map<string, () => void> = new Map();

  /**
   * S'abonne aux changements d'une collection
   */
  subscribeToCollection(
    collectionId: string,
    callback: RealtimeCallback
  ): () => void {
    const channel = `databases.${DATABASE_ID}.collections.${collectionId}.documents`;
    
    console.log(`📡 Abonnement temps réel: ${collectionId}`);

    const unsubscribe = client.subscribe(channel, (response) => {
      const { events, payload } = response;

      // Déterminer le type d'événement
      const eventType = events.find(event => 
        event.includes('.create') || 
        event.includes('.update') || 
        event.includes('.delete')
      );

      if (eventType) {
        const action = eventType.split('.').pop() as 'create' | 'update' | 'delete';
        
        console.log(`🔔 Événement temps réel [${collectionId}]:`, action, payload);
        
        callback({
          action,
          document: payload,
          collectionId
        });
      }
    });

    // Stocker l'unsubscribe pour nettoyage ultérieur
    this.subscriptions.set(collectionId, unsubscribe);

    // Retourner la fonction de désabonnement
    return unsubscribe;
  }

  /**
   * S'abonne aux changements des projets
   */
  subscribeToProjects(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.PROJECTS, callback);
  }

  /**
   * S'abonne aux changements des utilisateurs
   */
  subscribeToUsers(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.USERS, callback);
  }

  /**
   * S'abonne aux changements des tâches
   */
  subscribeToTasks(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.TASKS, callback);
  }

  /**
   * S'abonne aux changements des factures
   */
  subscribeToInvoices(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.INVOICES, callback);
  }

  /**
   * S'abonne aux changements des dépenses
   */
  subscribeToExpenses(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.EXPENSES, callback);
  }

  /**
   * S'abonne aux changements des demandes de congé
   */
  subscribeToLeaveRequests(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.LEAVE_REQUESTS, callback);
  }

  /**
   * S'abonne aux changements des logs de temps
   */
  subscribeToTimeLogs(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.TIME_LOGS, callback);
  }

  /**
   * S'abonne aux changements des cours
   */
  subscribeToCourses(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.COURSES, callback);
  }

  /**
   * S'abonne aux changements des emplois
   */
  subscribeToJobs(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.JOBS, callback);
  }

  /**
   * S'abonne aux changements des notifications
   */
  subscribeToNotifications(callback: RealtimeCallback) {
    return this.subscribeToCollection(COLLECTION_IDS.NOTIFICATIONS, callback);
  }

  /**
   * Se désabonne d'une collection spécifique
   */
  unsubscribeFromCollection(collectionId: string) {
    const unsubscribe = this.subscriptions.get(collectionId);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(collectionId);
      console.log(`🔕 Désabonnement: ${collectionId}`);
    }
  }

  /**
   * Se désabonne de toutes les collections
   */
  unsubscribeAll() {
    console.log(`🔕 Désabonnement de ${this.subscriptions.size} collections`);
    
    this.subscriptions.forEach((unsubscribe, collectionId) => {
      unsubscribe();
      console.log(`  • ${collectionId}`);
    });
    
    this.subscriptions.clear();
  }

  /**
   * S'abonne à plusieurs collections en même temps
   */
  subscribeToMultiple(
    subscriptions: Array<{
      collectionId: string;
      callback: RealtimeCallback;
    }>
  ): () => void {
    const unsubscribers: (() => void)[] = [];

    subscriptions.forEach(({ collectionId, callback }) => {
      const unsubscribe = this.subscribeToCollection(collectionId, callback);
      unsubscribers.push(unsubscribe);
    });

    // Retourner une fonction qui désabonne tous les abonnements
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }
}

// Instance singleton
export const realtimeService = new RealtimeService();

// Export du type pour utilisation dans les composants
export type { RealtimeCallback };

