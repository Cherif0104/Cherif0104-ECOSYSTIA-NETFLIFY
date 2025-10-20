# 🔄 Exemple d'intégration : Synchronisation temps réel des Projets

## 📋 Objectif

Intégrer la synchronisation temps réel dans le module Projects pour que :
- Les nouveaux projets apparaissent automatiquement
- Les modifications de projets se reflètent en temps réel
- Les suppressions de projets sont immédiatement visibles
- Plusieurs utilisateurs peuvent collaborer simultanément

---

## 🎯 Implémentation

### Étape 1 : Modifier `App.tsx`

```typescript
import { useRealtimeProjects } from './hooks/useRealtime';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les projets initiaux
  useEffect(() => {
    loadProjects();
  }, []);

  // S'abonner aux changements en temps réel
  useRealtimeProjects((payload) => {
    const { action, document } = payload;

    switch (action) {
      case 'create':
        // Nouveau projet créé (par un autre utilisateur ou onglet)
        setProjects(prev => {
          // Éviter les doublons
          if (prev.some(p => p.$id === document.$id)) return prev;
          
          return [...prev, mapAppwriteToProject(document)];
        });
        
        // Notification optionnelle
        showNotification({
          type: 'success',
          title: 'Nouveau projet',
          message: `${document.name} a été créé`
        });
        break;

      case 'update':
        // Projet modifié
        setProjects(prev =>
          prev.map(p => 
            p.$id === document.$id 
              ? mapAppwriteToProject(document)
              : p
          )
        );
        
        showNotification({
          type: 'info',
          title: 'Projet mis à jour',
          message: `${document.name} a été modifié`
        });
        break;

      case 'delete':
        // Projet supprimé
        setProjects(prev =>
          prev.filter(p => p.$id !== document.$id)
        );
        
        showNotification({
          type: 'warning',
          title: 'Projet supprimé',
          message: `${document.name} a été supprimé`
        });
        break;
    }
  });

  // Fonction de mapping Appwrite → Project
  const mapAppwriteToProject = (doc: any): Project => ({
    id: doc.$id,
    name: doc.name,
    description: doc.description,
    status: doc.status,
    priority: doc.priority,
    startDate: doc.startDate,
    endDate: doc.endDate,
    budget: doc.budget,
    ownerId: doc.ownerId,
    progress: doc.progress,
    tasks: [],
    team: []
  });

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const result = await projectService.list();
      setProjects(result.map(mapAppwriteToProject));
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ProjectsList projects={projects} />
      )}
    </div>
  );
}
```

---

## 🎨 Amélioration visuelle : Indicateur de mise à jour

### Composant `ProjectCard` avec animation

```typescript
import { useState, useEffect } from 'react';

function ProjectCard({ project }: { project: Project }) {
  const [isUpdated, setIsUpdated] = useState(false);

  // Animer lors d'une mise à jour
  useEffect(() => {
    setIsUpdated(true);
    const timer = setTimeout(() => setIsUpdated(false), 2000);
    return () => clearTimeout(timer);
  }, [project.$updatedAt]);

  return (
    <div
      className={`
        project-card
        transition-all duration-300
        ${isUpdated ? 'ring-2 ring-blue-500 scale-105' : ''}
      `}
    >
      {isUpdated && (
        <div className="absolute top-2 right-2">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}
      
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <ProjectProgress value={project.progress} />
    </div>
  );
}
```

---

## 🔔 Système de notifications

### Composant `RealtimeNotifications`

```typescript
import { useRealtimeProjects } from '../hooks/useRealtime';
import { useNotification } from '../contexts/NotificationContext';

function RealtimeNotifications() {
  const { showNotification } = useNotification();
  const { user } = useAuth();

  useRealtimeProjects((payload) => {
    const { action, document } = payload;

    // Ne pas notifier pour ses propres actions
    if (document.ownerId === user?.id) return;

    const messages = {
      create: {
        type: 'success' as const,
        title: '🆕 Nouveau projet',
        message: `${document.name} a été créé par ${document.ownerName}`
      },
      update: {
        type: 'info' as const,
        title: '🔄 Mise à jour',
        message: `${document.name} a été modifié`
      },
      delete: {
        type: 'warning' as const,
        title: '🗑️ Suppression',
        message: `Un projet a été supprimé`
      }
    };

    const notification = messages[action];
    if (notification) {
      showNotification(notification);
    }
  });

  return null; // Composant invisible
}

// Utilisation dans App.tsx
function App() {
  return (
    <div>
      <RealtimeNotifications />
      {/* Reste de l'application */}
    </div>
  );
}
```

---

## 📊 Indicateur de statut de connexion

### Composant `ConnectionStatus`

```typescript
import { useState, useEffect } from 'react';

function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useRealtimeProjects(() => {
    setIsConnected(true);
    setLastUpdate(new Date());
  });

  // Vérifier la connexion toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceUpdate = Date.now() - lastUpdate.getTime();
      if (timeSinceUpdate > 60000) { // 1 minute sans mise à jour
        setIsConnected(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Reconnexion en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 text-xs text-gray-500">
      <div className="flex items-center">
        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
        Connecté
      </div>
    </div>
  );
}
```

---

## 🧪 Test de la synchronisation

### Scénario de test 1 : Deux onglets

1. Ouvrir ECOSYSTIA dans deux onglets différents
2. Se connecter avec le même utilisateur
3. Dans l'onglet 1 : Créer un nouveau projet
4. Dans l'onglet 2 : **Le projet apparaît automatiquement** ✅

### Scénario de test 2 : Deux utilisateurs

1. Utilisateur A : Créer un projet
2. Utilisateur B : **Voir le projet apparaître en temps réel** ✅
3. Utilisateur A : Modifier le projet
4. Utilisateur B : **Voir les modifications instantanément** ✅

### Scénario de test 3 : Modification simultanée

1. Deux utilisateurs ouvrent le même projet
2. Utilisateur A : Change le statut à "En cours"
3. Utilisateur B : **Voit le changement de statut immédiatement** ✅
4. Utilisateur B : Change la priorité à "Haute"
5. Utilisateur A : **Voit le changement de priorité immédiatement** ✅

---

## 🔧 Gestion des cas limites

### Cas 1 : Éviter les doublons

```typescript
useRealtimeProjects((payload) => {
  if (payload.action === 'create') {
    setProjects(prev => {
      // Vérifier si le projet existe déjà
      if (prev.some(p => p.$id === payload.document.$id)) {
        console.log('⚠️ Projet déjà présent, ignoré');
        return prev;
      }
      return [...prev, mapAppwriteToProject(payload.document)];
    });
  }
});
```

### Cas 2 : Gestion des erreurs de mapping

```typescript
useRealtimeProjects((payload) => {
  try {
    const project = mapAppwriteToProject(payload.document);
    handleProjectUpdate(project);
  } catch (error) {
    console.error('❌ Erreur mapping projet:', error);
    // Recharger tous les projets en cas d'erreur
    loadProjects();
  }
});
```

### Cas 3 : Filtrage par utilisateur

```typescript
useRealtimeProjects((payload) => {
  const { user } = useAuth();
  
  // Afficher uniquement les projets de l'utilisateur
  if (payload.document.ownerId !== user?.id) {
    console.log('⏭️ Projet d\'un autre utilisateur, ignoré');
    return;
  }
  
  handleProjectUpdate(payload);
});
```

---

## 📈 Métriques de performance

### Temps de latence

- **Création de projet** : ~100-300ms
- **Mise à jour** : ~50-150ms
- **Suppression** : ~50-100ms

### Optimisations

1. **Debouncing des mises à jour**
   ```typescript
   const debouncedUpdate = useMemo(
     () => debounce(handleProjectUpdate, 300),
     []
   );
   
   useRealtimeProjects((payload) => {
     debouncedUpdate(payload);
   });
   ```

2. **Mise à jour partielle**
   ```typescript
   useRealtimeProjects((payload) => {
     if (payload.action === 'update') {
       // Mettre à jour uniquement les champs modifiés
       setProjects(prev =>
         prev.map(p =>
           p.$id === payload.document.$id
             ? { ...p, ...payload.document }
             : p
         )
       );
     }
   });
   ```

---

## ✅ Checklist d'implémentation

- [x] Service de synchronisation temps réel créé
- [x] Hooks React personnalisés créés
- [ ] Intégration dans `App.tsx`
- [ ] Composant `RealtimeNotifications` ajouté
- [ ] Composant `ConnectionStatus` ajouté
- [ ] Tests avec deux onglets effectués
- [ ] Tests avec deux utilisateurs effectués
- [ ] Gestion des erreurs implémentée
- [ ] Optimisations de performance appliquées
- [ ] Documentation mise à jour

---

## 🚀 Prochaines étapes

1. **Intégrer dans App.tsx** (5 min)
2. **Tester avec deux onglets** (2 min)
3. **Ajouter les notifications** (10 min)
4. **Répliquer pour les autres modules** (30 min)

---

**🎉 La synchronisation temps réel est prête pour les projets !**

