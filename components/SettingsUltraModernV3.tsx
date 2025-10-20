/**
 * ⚙️ SETTINGS ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  CircleStackIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { User } from '../types';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';

interface SettingsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  systemHealth: number;
  storageUsed: number;
  lastBackup: string;
  securityScore: number;
  uptime: number;
}

const SettingsUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'security' | 'appearance'>('users');
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
      
      console.log('🔄 Chargement des données Settings...');
      
      const [usersData] = await Promise.all([
        userService.getAll()
      ]);
      
      setUsers(usersData);
      
      // Mock data pour l'instant
      const mockSettings = [];
      setSettings(mockSettings);
      
      console.log(`✅ ${usersData.length} utilisateurs et ${mockSettings.length} paramètres chargés`);
    } catch (error) {
      console.error('❌ Erreur chargement Settings:', error);
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
  const metrics: SettingsMetrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.role !== 'inactive').length;
    
    return {
      totalUsers,
      activeUsers,
      totalRoles: 5,
      systemHealth: 98,
      storageUsed: 2.5,
      lastBackup: '2024-01-15',
      securityScore: 95,
      uptime: 99.9
    };
  }, [users]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvel Utilisateur',
      icon: PlusIcon,
      onClick: () => {
        setEditingUser(null);
        setShowUserModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Sécurité',
      icon: ShieldCheckIcon,
      onClick: () => {
        setActiveTab('security');
      },
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      label: 'Apparence',
      icon: PaintBrushIcon,
      onClick: () => {
        setActiveTab('appearance');
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
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les paramètres du système et des utilisateurs
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
            <UserIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Utilisateurs</p>
              <p className="text-2xl font-bold">{metrics.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Score Sécurité</p>
              <p className="text-2xl font-bold">{metrics.securityScore}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CircleStackIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Stockage</p>
              <p className="text-2xl font-bold">{metrics.storageUsed} GB</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Uptime</p>
              <p className="text-2xl font-bold">{metrics.uptime}%</p>
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
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Utilisateurs ({metrics.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Système
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sécurité
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appearance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Apparence
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
                    <FunnelIcon className="h-5 w-5" />
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
                    <MagnifyingGlassIcon className="h-5 w-5" />
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

          <div className="text-center py-12">
            <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {activeTab === 'users' ? 'Gestion des Utilisateurs' : 
               activeTab === 'system' ? 'Paramètres Système' :
               activeTab === 'security' ? 'Sécurité' : 'Apparence'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Interface de paramètres à implémenter
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire d'utilisateur à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSetting ? 'Modifier le paramètre' : 'Nouveau paramètre'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de paramètre à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSettingModal(false);
                  setEditingSetting(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowSettingModal(false);
                  setEditingSetting(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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

export default SettingsUltraModernV3;
