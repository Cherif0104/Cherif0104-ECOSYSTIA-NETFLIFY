/**
 * 🧠 GEN AI LAB ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CpuChipIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
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
import { useFeedback } from '../hooks/useFeedback';
import FeedbackDisplay from './common/FeedbackDisplay';
import LoadingButton from './common/LoadingButton';
import { User } from '../types';
import { userService } from '../services/userService';
import { genAILabService, AIExperiment, AIModel } from '../services/genAILabService';
import ConfirmationModal from './common/ConfirmationModal';

// Types pour Gen AI Lab
interface AIExperiment {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'code' | 'data';
  status: 'draft' | 'running' | 'completed' | 'failed';
  model: string;
  parameters: Record<string, any>;
  results: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  isActive: boolean;
  performance: number;
  createdAt: Date;
}

interface GenAIMetrics {
  totalExperiments: number;
  activeExperiments: number;
  completedExperiments: number;
  totalModels: number;
  activeModels: number;
  averagePerformance: number;
  totalUsage: number;
  successRate: number;
}

const GenAILabUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const { 
    isSubmitting, 
    submitSuccess, 
    submitError, 
    setSubmitting, 
    setSuccess, 
    setError 
  } = useFeedback();
  
  // États principaux
  const [experiments, setExperiments] = useState<AIExperiment[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showExperimentModal, setShowExperimentModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [editingExperiment, setEditingExperiment] = useState<AIExperiment | null>(null);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'experiments' | 'models' | 'playground'>('experiments');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des données Gen AI Lab...');
      
      const [experimentsData, modelsData, usersData] = await Promise.all([
        genAILabService.getAllExperiments(),
        genAILabService.getAllModels(),
        userService.getAll()
      ]);
      
      setExperiments(experimentsData);
      setModels(modelsData);
      setUsers(usersData);
      
      console.log(`✅ ${experimentsData.length} expériences, ${modelsData.length} modèles et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement Gen AI Lab:', error);
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

  // ===== CRUD OPERATIONS =====

  const handleCreateExperiment = async (experimentData: Omit<AIExperiment, 'id'>) => {
    try {
      setLoading(true);
      const createdExperiment = await genAILabService.createExperiment(experimentData);
      if (createdExperiment) {
        setExperiments(prev => [createdExperiment, ...prev]);
        console.log('✅ Expérience créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création expérience:', error);
      setError('Erreur lors de la création de l\'expérience');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExperiment = async (id: string, experimentData: Partial<AIExperiment>) => {
    try {
      setLoading(true);
      const updatedExperiment = await genAILabService.updateExperiment(id, experimentData);
      if (updatedExperiment) {
        setExperiments(prev => prev.map(e => e.id === id ? updatedExperiment : e));
        console.log('✅ Expérience mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour expérience:', error);
      setError('Erreur lors de la mise à jour de l\'expérience');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    try {
      setLoading(true);
      const success = await genAILabService.deleteExperiment(id);
      if (success) {
        setExperiments(prev => prev.filter(e => e.id !== id));
        console.log('✅ Expérience supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression expérience:', error);
      setError('Erreur lors de la suppression de l\'expérience');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (modelData: Omit<AIModel, 'id'>) => {
    try {
      setLoading(true);
      const createdModel = await genAILabService.createModel(modelData);
      if (createdModel) {
        setModels(prev => [createdModel, ...prev]);
        console.log('✅ Modèle créé avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création modèle:', error);
      setError('Erreur lors de la création du modèle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModel = async (id: string, modelData: Partial<AIModel>) => {
    try {
      setLoading(true);
      const updatedModel = await genAILabService.updateModel(id, modelData);
      if (updatedModel) {
        setModels(prev => prev.map(m => m.id === id ? updatedModel : m));
        console.log('✅ Modèle mis à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour modèle:', error);
      setError('Erreur lors de la mise à jour du modèle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (id: string) => {
    try {
      setLoading(true);
      const success = await genAILabService.deleteModel(id);
      if (success) {
        setModels(prev => prev.filter(m => m.id !== id));
        console.log('✅ Modèle supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression modèle:', error);
      setError('Erreur lors de la suppression du modèle');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les métriques
  const metrics: GenAIMetrics = useMemo(() => {
    const totalExperiments = experiments.length;
    const activeExperiments = experiments.filter(e => e.status === 'running').length;
    const completedExperiments = experiments.filter(e => e.status === 'completed').length;
    const totalModels = models.length;
    const activeModels = models.filter(m => m.isActive).length;
    const averagePerformance = models.length > 0 
      ? models.reduce((sum, model) => sum + model.performance, 0) / models.length 
      : 0;
    const totalUsage = experiments.length; // Mock data
    const successRate = experiments.length > 0 
      ? (completedExperiments / experiments.length) * 100 
      : 0;
    
    return {
      totalExperiments,
      activeExperiments,
      completedExperiments,
      totalModels,
      activeModels,
      averagePerformance: Math.round(averagePerformance),
      totalUsage,
      successRate: Math.round(successRate)
    };
  }, [experiments, models]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvelle Expérience',
      icon: PlusIcon,
      onClick: () => {
        setEditingExperiment(null);
        setShowExperimentModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Nouveau Modèle',
      icon: CpuChipIcon,
      onClick: () => {
        setEditingModel(null);
        setShowModelModal(true);
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Playground IA',
      icon: SparklesIcon,
      onClick: () => {
        setActiveTab('playground');
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
          <h1 className="text-2xl font-bold text-gray-900">Gen AI Lab</h1>
          <p className="mt-1 text-sm text-gray-500">
            Laboratoire d'intelligence artificielle générative
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
            <CpuChipIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Expériences</p>
              <p className="text-2xl font-bold">{metrics.totalExperiments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Modèles Actifs</p>
              <p className="text-2xl font-bold">{metrics.activeModels}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Performance</p>
              <p className="text-2xl font-bold">{metrics.averagePerformance}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <LightBulbIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Taux de Succès</p>
              <p className="text-2xl font-bold">{metrics.successRate}%</p>
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
              onClick={() => setActiveTab('experiments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'experiments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expériences ({metrics.totalExperiments})
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'models'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Modèles ({metrics.totalModels})
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'playground'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Playground
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
              
              {activeTab === 'experiments' && (
                <>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="text">Texte</option>
                    <option value="image">Image</option>
                    <option value="code">Code</option>
                    <option value="data">Données</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="running">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="failed">Échoué</option>
                  </select>
                </>
              )}
              
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

          {/* Messages de feedback */}
          <FeedbackDisplay
            success={submitSuccess}
            error={submitError}
            warning={null}
            info={null}
          />

          {/* Contenu principal */}
          {activeTab === 'experiments' ? (
            <div className="text-center py-12">
              <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Expériences IA</h3>
              <p className="mt-1 text-sm text-gray-500">
                {experiments.length === 0 
                  ? "Aucune expérience trouvée."
                  : `${experiments.length} expérience(s) trouvée(s).`
                }
              </p>
            </div>
          ) : activeTab === 'models' ? (
            <div className="text-center py-12">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Modèles IA</h3>
              <p className="mt-1 text-sm text-gray-500">
                {models.length === 0 
                  ? "Aucun modèle trouvé."
                  : `${models.length} modèle(s) trouvé(s).`
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Playground IA</h3>
              <p className="mt-1 text-sm text-gray-500">
                Interface de test des modèles IA à implémenter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showExperimentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingExperiment ? 'Modifier l\'expérience' : 'Nouvelle expérience'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire d'expérience à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowExperimentModal(false);
                  setEditingExperiment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowExperimentModal(false);
                  setEditingExperiment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingModel ? 'Modifier le modèle' : 'Nouveau modèle'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de modèle à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModelModal(false);
                  setEditingModel(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowModelModal(false);
                  setEditingModel(null);
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

export default GenAILabUltraModernV3;
