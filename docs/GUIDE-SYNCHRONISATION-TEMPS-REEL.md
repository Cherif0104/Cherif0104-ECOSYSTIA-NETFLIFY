# 🔄 Guide de Synchronisation Temps Réel - ECOSYSTIA

## 📋 Vue d'ensemble

La synchronisation temps réel permet à l'application de recevoir automatiquement les mises à jour de données sans avoir à rafraîchir la page. Cela améliore considérablement l'expérience utilisateur, particulièrement pour les équipes collaboratives.

---

## 🎯 Fonctionnalités

### ✅ Mises à jour automatiques
- Création de nouveaux documents
- Modification de documents existants
- Suppression de documents

### ✅ Collections supportées
- ✅ Projets (`demo_projects`)
- ✅ Utilisateurs (`demo_users`)
- ✅ Tâches (`demo_tasks`)
- ✅ Factures (`demo_invoices`)
- ✅ Dépenses (`demo_expenses`)
- ✅ Demandes de congé (`demo_leave_requests`)
- ✅ Logs de temps (`demo_time_logs`)
- ✅ Cours (`demo_courses`)
- ✅ Emplois (`demo_jobs`)
- ✅ Notifications (`demo_notifications`)

---

## 🚀 Utilisation dans les composants

### Exemple 1 : Synchronisation des projets

```typescript
import { useRealtimeProjects } from '../hooks/useRealtime';

function ProjectsList() {
  const [projects, setProjects] = useState([]);

  // S'abonner aux changements de projets
  useRealtimeProjects((payload) => {
    const { action, document } = payload;

    switch (action) {
      case 'create':
        // Ajouter le nouveau projet
        setProjects(prev => [...prev, document]);
        console.log('✅ Nouveau projet créé:', document.name);
        break;

      case 'update':
        // Mettre à jour le projet existant
        setProjects(prev =>
          prev.map(p => p.$id === document.$id ? document : p)
        );
        console.log('🔄 Projet mis à jour:', document.name);
        break;

      case 'delete':
        // Supprimer le projet
        setProjects(prev =>
          prev.filter(p => p.$id !== document.$id)
        );
        console.log('🗑️ Projet supprimé:', document.name);
        break;
    }
  });

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.$id} project={project} />
      ))}
    </div>
  );
}
```

### Exemple 2 : Synchronisation des notifications

```typescript
import { useRealtimeNotifications } from '../hooks/useRealtime';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useRealtimeNotifications((payload) => {
    if (payload.action === 'create') {
      // Nouvelle notification reçue
      setNotifications(prev => [payload.document, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Afficher une notification toast
      showToast({
        type: 'info',
        title: payload.document.title,
        message: payload.document.message
      });
    }
  });

  return (
    <div>
      <NotificationBadge count={unreadCount} />
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

### Exemple 3 : Synchronisation conditionnelle

```typescript
import { useRealtimeTasks } from '../hooks/useRealtime';

function TaskBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const isActive = useProjectActive(projectId);

  // S'abonner uniquement si le projet est actif
  useRealtimeTasks(
    (payload) => {
      // Filtrer uniquement les tâches du projet actuel
      if (payload.document.projectId === projectId) {
        handleTaskUpdate(payload);
      }
    },
    isActive // enabled = true seulement si le projet est actif
  );

  return <TaskList tasks={tasks} />;
}
```

### Exemple 4 : Abonnements multiples

```typescript
import { useRealtimeMultiple } from '../hooks/useRealtime';
import { COLLECTION_IDS } from '../services/appwriteService';

function Dashboard() {
  const [data, setData] = useState({
    projects: [],
    tasks: [],
    notifications: []
  });

  useRealtimeMultiple([
    {
      collectionId: COLLECTION_IDS.PROJECTS,
      callback: (payload) => {
        console.log('📊 Projet mis à jour');
        updateProjects(payload);
      }
    },
    {
      collectionId: COLLECTION_IDS.TASKS,
      callback: (payload) => {
        console.log('✅ Tâche mise à jour');
        updateTasks(payload);
      }
    },
    {
      collectionId: COLLECTION_IDS.NOTIFICATIONS,
      callback: (payload) => {
        console.log('🔔 Nouvelle notification');
        updateNotifications(payload);
      }
    }
  ]);

  return <DashboardView data={data} />;
}
```

---

## 🔧 API du Service Realtime

### `realtimeService.subscribeToCollection(collectionId, callback)`

S'abonne aux changements d'une collection spécifique.

**Paramètres:**
- `collectionId` (string): ID de la collection Appwrite
- `callback` (function): Fonction appelée lors d'un changement

**Retourne:**
- `unsubscribe` (function): Fonction pour se désabonner

**Exemple:**
```typescript
const unsubscribe = realtimeService.subscribeToCollection(
  'demo_projects',
  (payload) => {
    console.log('Changement détecté:', payload);
  }
);

// Plus tard, se désabonner
unsubscribe();
```

### `realtimeService.unsubscribeAll()`

Se désabonne de toutes les collections actives.

**Exemple:**
```typescript
useEffect(() => {
  // S'abonner à plusieurs collections
  realtimeService.subscribeToProjects(handleProjectChange);
  realtimeService.subscribeToTasks(handleTaskChange);

  // Nettoyer tous les abonnements au démontage
  return () => {
    realtimeService.unsubscribeAll();
  };
}, []);
```

---

## 📊 Structure des événements

Chaque événement reçu a la structure suivante :

```typescript
{
  action: 'create' | 'update' | 'delete',
  document: {
    $id: string,
    $createdAt: string,
    $updatedAt: string,
    // ... autres champs du document
  },
  collectionId: string
}
```

---

## 🎨 Bonnes pratiques

### ✅ À faire

1. **Utiliser les hooks personnalisés**
   ```typescript
   // ✅ BON
   useRealtimeProjects(handleProjectChange);
   
   // ❌ ÉVITER
   realtimeService.subscribeToProjects(handleProjectChange);
   ```

2. **Désabonner lors du démontage**
   ```typescript
   useEffect(() => {
     const unsubscribe = realtimeService.subscribeToProjects(callback);
     return () => unsubscribe(); // ✅ Nettoyage
   }, []);
   ```

3. **Filtrer les événements pertinents**
   ```typescript
   useRealtimeTasks((payload) => {
     // Ignorer les tâches d'autres projets
     if (payload.document.projectId !== currentProjectId) return;
     
     handleTaskUpdate(payload);
   });
   ```

4. **Utiliser des refs pour les callbacks**
   ```typescript
   const callbackRef = useRef(callback);
   
   useEffect(() => {
     callbackRef.current = callback;
   }, [callback]);
   ```

### ❌ À éviter

1. **Ne pas oublier de se désabonner**
   ```typescript
   // ❌ MAUVAIS - fuite mémoire
   useEffect(() => {
     realtimeService.subscribeToProjects(callback);
     // Manque le return pour se désabonner
   }, []);
   ```

2. **Ne pas créer trop d'abonnements**
   ```typescript
   // ❌ MAUVAIS - trop d'abonnements
   projects.forEach(project => {
     realtimeService.subscribeToCollection(project.id, callback);
   });
   
   // ✅ BON - un seul abonnement avec filtrage
   useRealtimeProjects((payload) => {
     if (projectIds.includes(payload.document.$id)) {
       handleUpdate(payload);
     }
   });
   ```

3. **Ne pas mettre à jour l'état directement dans le callback**
   ```typescript
   // ❌ MAUVAIS - peut causer des boucles infinies
   useRealtimeProjects((payload) => {
     setProjects([...projects, payload.document]);
   });
   
   // ✅ BON - utiliser la forme fonctionnelle
   useRealtimeProjects((payload) => {
     setProjects(prev => [...prev, payload.document]);
   });
   ```

---

## 🔍 Debugging

### Activer les logs

Les logs de synchronisation sont automatiquement affichés dans la console :

```
📡 Abonnement temps réel: demo_projects
🔔 Événement temps réel [demo_projects]: create {...}
🔕 Désabonnement: demo_projects
```

### Vérifier les connexions WebSocket

Dans les DevTools du navigateur :
1. Onglet **Network**
2. Filtre **WS** (WebSocket)
3. Vérifier la connexion à `cloud.appwrite.io`

### Tester manuellement

```typescript
// Dans la console du navigateur
import { realtimeService } from './services/realtimeService';

realtimeService.subscribeToProjects((payload) => {
  console.log('Test:', payload);
});
```

---

## 🚀 Prochaines étapes

### Phase 1 : Implémentation de base ✅
- ✅ Service de synchronisation temps réel
- ✅ Hooks React personnalisés
- ✅ Support de toutes les collections principales

### Phase 2 : Optimisations (À venir)
- ⏳ Gestion de la reconnexion automatique
- ⏳ Mise en cache des événements manqués
- ⏳ Throttling des mises à jour
- ⏳ Indicateur de statut de connexion

### Phase 3 : Fonctionnalités avancées (À venir)
- ⏳ Synchronisation offline-first
- ⏳ Résolution de conflits
- ⏳ Historique des changements
- ⏳ Notifications push

---

## 📚 Ressources

- [Documentation Appwrite Realtime](https://appwrite.io/docs/realtime)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [React Hooks](https://react.dev/reference/react)

---

## ✅ Checklist d'implémentation

Pour ajouter la synchronisation temps réel à un module :

- [ ] Importer le hook approprié (`useRealtimeProjects`, etc.)
- [ ] Définir le callback de gestion des événements
- [ ] Gérer les 3 actions : `create`, `update`, `delete`
- [ ] Mettre à jour l'état local en conséquence
- [ ] Tester avec plusieurs onglets ouverts
- [ ] Vérifier les logs dans la console
- [ ] Ajouter des notifications visuelles (optionnel)

---

**🎉 La synchronisation temps réel est maintenant prête à être utilisée dans ECOSYSTIA !**

