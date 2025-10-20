/**
 * 💼 CRM & SALES ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Contact, Lead, Interaction, User } from '../types';
import { crmSupabaseService } from '../services/crmServiceSupabase';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';

interface CRMMetrics {
  totalContacts: number;
  totalLeads: number;
  totalInteractions: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  totalValue: number;
  averageDealSize: number;
}

const CRMSalesUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'contacts' | 'leads' | 'interactions'>('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [contactsData, leadsData, interactionsData, usersData] = await Promise.all([
        crmSupabaseService.getAllContacts(),
        crmSupabaseService.getAllLeads(),
        crmSupabaseService.getAllInteractions(),
        userService.getAll()
      ]);
      
      setContacts(contactsData);
      setLeads(leadsData);
      setInteractions(interactionsData);
      setUsers(usersData);
      
      console.log(`✅ ${contactsData.length} contacts, ${leadsData.length} leads, ${interactionsData.length} interactions chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement CRM:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Calculer les métriques
  const metrics: CRMMetrics = useMemo(() => {
    const totalContacts = contacts.length;
    const totalLeads = leads.length;
    const totalInteractions = interactions.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const totalValue = leads.reduce((sum, lead) => sum + (lead.expectedValue || 0), 0);
    const averageDealSize = leads.length > 0 ? totalValue / leads.length : 0;
    
    return {
      totalContacts,
      totalLeads,
      totalInteractions,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      totalValue,
      averageDealSize: Math.round(averageDealSize)
    };
  }, [contacts, leads, interactions]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouveau Contact',
      icon: UserGroupIcon,
      onClick: () => {
        setEditingContact(null);
        setShowContactModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Nouveau Lead',
      icon: CurrencyDollarIcon,
      onClick: () => {
        setEditingLead(null);
        setShowLeadModal(true);
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Nouvelle Interaction',
      icon: PhoneIcon,
      onClick: () => {
        setEditingInteraction(null);
        setShowInteractionModal(true);
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }));
      },
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM & Ventes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos contacts, leads et interactions commerciales
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Contacts</p>
              <p className="text-2xl font-bold">{metrics.totalContacts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Leads</p>
              <p className="text-2xl font-bold">{metrics.totalLeads}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <PhoneIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Interactions</p>
              <p className="text-2xl font-bold">{metrics.totalInteractions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Valeur Totale</p>
              <p className="text-2xl font-bold">{metrics.totalValue.toLocaleString()} XOF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contacts ({metrics.totalContacts})
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leads ({metrics.totalLeads})
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'interactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Interactions ({metrics.totalInteractions})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Filtres */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue grille"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue liste"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <p className="mt-1 text-sm text-red-700">{errorState}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Contacts</h3>
              <p className="mt-1 text-sm text-gray-500">
                {contacts.length === 0 
                  ? "Aucun contact trouvé."
                  : `${contacts.length} contact(s) trouvé(s).`
                }
              </p>
            </div>
          ) : activeTab === 'leads' ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Leads</h3>
              <p className="mt-1 text-sm text-gray-500">
                {leads.length === 0 
                  ? "Aucun lead trouvé."
                  : `${leads.length} lead(s) trouvé(s).`
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Interactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                {interactions.length === 0 
                  ? "Aucune interaction trouvée."
                  : `${interactions.length} interaction(s) trouvée(s).`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de contact à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContact(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContact(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingLead ? 'Modifier le lead' : 'Nouveau lead'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de lead à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLeadModal(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowLeadModal(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showInteractionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingInteraction ? 'Modifier l\'interaction' : 'Nouvelle interaction'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire d'interaction à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowInteractionModal(false);
                  setEditingInteraction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowInteractionModal(false);
                  setEditingInteraction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

export default CRMSalesUltraModernV3;
