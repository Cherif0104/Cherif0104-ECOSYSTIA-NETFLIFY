# 🎯 TEMPLATE MODULE STANDARDISÉ

## ARCHITECTURE IDENTIQUE À PROJECTS

### 1. **Structure du composant**
```typescript
// NomModuleUltraModernV3.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { nomService } from '../services/nomService';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';
import TeamManagementModal from './TeamManagementModal';

const NomModuleUltraModernV3: React.FC = () => {
  // États identiques à Projects
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // États modales
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // États équipe
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Chargement des données
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des items...');
      const fetchedItems = await nomService.getAll();
      console.log(`✅ ${fetchedItems.length} items chargés`);
      setItems(fetchedItems);
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement items:', err);
      setError("Erreur lors du chargement des items.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  // CRUD Operations
  const handleCreateItem = async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Création item...');
      await nomService.create(item);
      await loadData(); // Recharger les données
      setShowItemModal(false);
      console.log('✅ Item créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création item:', error);
    }
  };

  const handleUpdateItem = async (item: Item) => {
    try {
      console.log('🔄 Mise à jour item...');
      await nomService.update(item.id, item);
      await loadData(); // Recharger les données
      setShowItemModal(false);
      setEditingItem(null);
      console.log('✅ Item mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur mise à jour item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      console.log('🔄 Suppression item...');
      await nomService.delete(id);
      await loadData(); // Recharger les données
      setShowDeleteModal(false);
      setSelectedItem(null);
      console.log('✅ Item supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression item:', error);
    }
  };

  // Filtrage et tri
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Rendu des vues (Grid, List, Kanban)
  const renderGridView = () => (/* ... */);
  const renderListView = () => (/* ... */);
  const renderKanbanView = () => (/* ... */);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header identique à Projects */}
      {/* Filtres identiques à Projects */}
      {/* Boutons de vue identiques à Projects */}
      {/* Contenu principal avec 3 vues */}
      {/* Modales identiques à Projects */}
    </div>
  );
};

export default NomModuleUltraModernV3;
```

### 2. **Structure du service**
```typescript
// services/nomService.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase';
import { Item } from '../types';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

class NomService {
  async getAll(): Promise<Item[]> {
    try {
      console.log('🔄 Récupération items Supabase...');
      const { data, error } = await supabase
        .from('nom_table')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (data || []).map(item => ({
        // Mapping des données
      }));

      console.log(`✅ ${items.length} items récupérés`);
      return items;
    } catch (error) {
      console.error('❌ Erreur récupération items:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Item | null> { /* ... */ }
  async create(item: Partial<Item>): Promise<Item> { /* ... */ }
  async update(id: string, updates: Partial<Item>): Promise<Item | null> { /* ... */ }
  async delete(id: string): Promise<boolean> { /* ... */ }
  async addTeamMember(itemId: string, userId: string): Promise<Item | null> { /* ... */ }
  async removeTeamMember(itemId: string, userId: string): Promise<Item | null> { /* ... */ }
}

export const nomService = new NomService();
```

## 🎯 **MODULES À STANDARDISER**

### Priorité 1 (Modules avec données)
1. **Time Tracking** - Utilise déjà `timeTrackingServiceSupabase`
2. **Finance** - Utilise déjà `financeServiceSupabase`  
3. **Knowledge Base** - Utilise déjà `knowledgeBaseService`

### Priorité 2 (Modules sans données)
4. **Development**
5. **Courses** 
6. **Jobs**
7. **Tools**
8. **AI Coach**
9. **Gen AI Lab**
10. **Management Panel**
11. **CRM & Sales**
12. **Course Management**

## ✅ **AVANTAGES DE CETTE STRATÉGIE**

- **Architecture identique** - Même structure que Projects
- **Persistance garantie** - Rechargement automatique
- **Interface cohérente** - Même design et fonctionnalités
- **Maintenance facile** - Code standardisé
- **Scalabilité** - Facile d'ajouter de nouveaux modules

## 🚀 **PROCHAINES ÉTAPES**

1. **Standardiser Time Tracking** (a déjà des données)
2. **Standardiser Finance** (a déjà des données)
3. **Standardiser Knowledge Base** (a déjà des données)
4. **Puis les autres modules un par un**

**Cette stratégie garantit que tous les modules auront la même qualité que Projects !** 🎉
