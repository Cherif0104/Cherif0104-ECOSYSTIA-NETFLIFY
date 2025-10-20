import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { crmService } from '../services/crmService';
import { Contact, Lead, Interaction } from '../types';
import ContactFormModal from './forms/ContactFormModal';
import LeadFormModal from './forms/LeadFormModal';
import InteractionFormModal from './forms/InteractionFormModal';

const CRMUltraModern: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'contacts' | 'leads' | 'interactions'>('contacts');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'priority'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'hot' | 'cold'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  // États pour les modales
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [contactsData, leadsData, interactionsData] = await Promise.all([
        crmService.getContacts(),
        crmService.getLeads(),
        crmService.getInteractions()
      ]);

      setContacts(contactsData);
      setLeads(leadsData);
      setInteractions(interactionsData);
    } catch (error: any) {
      console.error('Erreur chargement données CRM:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les métriques
  const metrics = useMemo(() => {
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => c.status === 'active').length;
    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.status === 'hot').length;
    const totalInteractions = interactions.length;
    const recentInteractions = interactions.filter(i => {
      const interactionDate = new Date(i.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return interactionDate > weekAgo;
    }).length;

    return {
      totalContacts,
      activeContacts,
      totalLeads,
      hotLeads,
      totalInteractions,
      recentInteractions
    };
  }, [contacts, leads, interactions]);

  // Filtrer et trier les données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'contacts':
        data = contacts;
        break;
      case 'leads':
        data = leads;
        break;
      case 'interactions':
        data = interactions;
        break;
    }

    // Filtrage par recherche
    if (searchTerm) {
      data = data.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status === filterStatus);
    }

    // Tri
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.createdAt || a.date).getTime();
          bValue = new Date(b.createdAt || b.date).getTime();
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'priority':
          aValue = a.priority || 'medium';
          bValue = b.priority || 'medium';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  }, [contacts, leads, interactions, activeTab, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleDelete = async (id: string, type: string) => {
    try {
      let success = false;
      
      switch (type) {
        case 'contact':
          success = await crmService.deleteContact(id);
          if (success) setContacts(prev => prev.filter(item => item.id !== id));
          break;
        case 'lead':
          success = await crmService.deleteLead(id);
          if (success) setLeads(prev => prev.filter(item => item.id !== id));
          break;
        case 'interaction':
          success = await crmService.deleteInteraction(id);
          if (success) setInteractions(prev => prev.filter(item => item.id !== id));
          break;
      }

      if (success) {
        console.log(`✅ ${type} supprimé avec succès`);
      }
    } catch (error: any) {
      console.error(`❌ Erreur suppression ${type}:`, error);
      setError(`Erreur lors de la suppression du ${type}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec métriques */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
                <p className="mt-1 text-sm text-gray-500">Gestion des relations clients</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Nouveau Contact
                </button>
                <button
                  onClick={() => setShowLeadModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-bullseye mr-2"></i>
                  Nouveau Lead
                </button>
              </div>
            </div>

            {/* Métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-users text-2xl mr-3"></i>
                  <div>
                    <p className="text-blue-100 text-sm">Total Contacts</p>
                    <p className="text-2xl font-bold">{metrics.totalContacts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-user-check text-2xl mr-3"></i>
                  <div>
                    <p className="text-green-100 text-sm">Contacts Actifs</p>
                    <p className="text-2xl font-bold">{metrics.activeContacts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-bullseye text-2xl mr-3"></i>
                  <div>
                    <p className="text-orange-100 text-sm">Total Leads</p>
                    <p className="text-2xl font-bold">{metrics.totalLeads}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-fire text-2xl mr-3"></i>
                  <div>
                    <p className="text-red-100 text-sm">Leads Chauds</p>
                    <p className="text-2xl font-bold">{metrics.hotLeads}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation des onglets */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'contacts', label: 'Contacts', icon: 'fas fa-users', count: contacts.length },
                { id: 'leads', label: 'Leads', icon: 'fas fa-bullseye', count: leads.length },
                { id: 'interactions', label: 'Interactions', icon: 'fas fa-comments', count: interactions.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Rechercher contacts, leads, interactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="hot">Chauds</option>
                <option value="cold">Froids</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Trier par nom</option>
                <option value="date">Trier par date</option>
                <option value="status">Trier par statut</option>
                <option value="priority">Trier par priorité</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Boutons de vue */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vue :</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'grid', icon: 'fas fa-th', label: 'Grille' },
                { id: 'list', icon: 'fas fa-list', label: 'Liste' },
                { id: 'kanban', icon: 'fas fa-columns', label: 'Kanban' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className={`${mode.icon} mr-1`}></i>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredData.length} élément{filteredData.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Contenu principal */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier élément.'}
            </p>
            <button
              onClick={() => {
                if (activeTab === 'contacts') setShowContactModal(true);
                else if (activeTab === 'leads') setShowLeadModal(true);
                else if (activeTab === 'interactions') setShowInteractionModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Créer le premier élément
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : viewMode === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(item.name || 'U')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name || 'Sans nom'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-1">
                          {item.email || item.company || 'Aucune information'}
                        </p>
                        {item.phone && (
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-phone mr-1"></i>
                            {item.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {item.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                      {item.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {item.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>
                      <i className="fas fa-calendar mr-1"></i>
                      {formatDate(item.createdAt || item.date)}
                    </span>
                    {item.source && (
                      <span>
                        <i className="fas fa-tag mr-1"></i>
                        {item.source}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          if (activeTab === 'contacts') setShowContactModal(true);
                          else if (activeTab === 'leads') setShowLeadModal(true);
                          else if (activeTab === 'interactions') setShowInteractionModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, activeTab.slice(0, -1))}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Supprimer
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales (à implémenter) */}
      {/* Modales améliorées avec formulaires complets */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingContact={editingItem}
      />

      <LeadFormModal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingLead={editingItem}
      />

      {showInteractionModal && editingItem && (
        <InteractionFormModal
          isOpen={showInteractionModal}
          onClose={() => {
            setShowInteractionModal(false);
            setEditingItem(null);
          }}
          onSuccess={loadData}
          contactId={editingItem.id}
        />
      )}
    </div>
  );
};

export default CRMUltraModern;
