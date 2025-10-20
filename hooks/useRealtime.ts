/**
 * Hook personnalisé pour la synchronisation temps réel
 * Simplifie l'utilisation des websockets Appwrite dans les composants React
 */

import { useEffect, useRef } from 'react';
import { realtimeService, type RealtimeCallback } from '../services/realtimeService';
import { COLLECTION_IDS } from '../services/appwriteService';

/**
 * Hook pour s'abonner aux changements d'une collection
 */
export function useRealtimeCollection(
  collectionId: string,
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);

  // Mettre à jour la ref quand le callback change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // S'abonner avec le callback de la ref
    const unsubscribe = realtimeService.subscribeToCollection(
      collectionId,
      (payload) => callbackRef.current(payload)
    );

    // Se désabonner au démontage
    return () => {
      unsubscribe();
    };
  }, [collectionId, enabled]);
}

/**
 * Hook pour s'abonner aux changements des projets
 */
export function useRealtimeProjects(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.PROJECTS, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des utilisateurs
 */
export function useRealtimeUsers(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.USERS, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des tâches
 */
export function useRealtimeTasks(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.TASKS, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des factures
 */
export function useRealtimeInvoices(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.INVOICES, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des dépenses
 */
export function useRealtimeExpenses(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.EXPENSES, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des demandes de congé
 */
export function useRealtimeLeaveRequests(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.LEAVE_REQUESTS, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des logs de temps
 */
export function useRealtimeTimeLogs(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.TIME_LOGS, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des cours
 */
export function useRealtimeCourses(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.COURSES, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des emplois
 */
export function useRealtimeJobs(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.JOBS, callback, enabled);
}

/**
 * Hook pour s'abonner aux changements des notifications
 */
export function useRealtimeNotifications(
  callback: RealtimeCallback,
  enabled: boolean = true
) {
  useRealtimeCollection(COLLECTION_IDS.NOTIFICATIONS, callback, enabled);
}

/**
 * Hook pour s'abonner à plusieurs collections
 */
export function useRealtimeMultiple(
  subscriptions: Array<{
    collectionId: string;
    callback: RealtimeCallback;
  }>,
  enabled: boolean = true
) {
  const subscriptionsRef = useRef(subscriptions);

  useEffect(() => {
    subscriptionsRef.current = subscriptions;
  }, [subscriptions]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = realtimeService.subscribeToMultiple(
      subscriptionsRef.current
    );

    return () => {
      unsubscribe();
    };
  }, [enabled]);
}

