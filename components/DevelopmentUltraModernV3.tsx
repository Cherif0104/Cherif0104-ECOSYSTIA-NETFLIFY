/**
 * 💻 DEVELOPMENT ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CodeBracketIcon,
  BugAntIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { User } from '../types';
import { developmentService, Deployment, BugReport, CodeReview } from '../services/developmentService';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';

// Types pour Development UltraModern
interface DevelopmentMetrics {
  totalDeployments: number;
  runningDeployments: number;
  failedDeployments: number;
  totalBugReports: number;
  openBugReports: number;
  criticalBugs: number;
  totalCodeReviews: number;
  pendingReviews: number;
  averageResolutionTime: number;
}

interface DevelopmentFilters {
  search: string;
  status: string;
  environment: string;
  severity: string;
  priority: string;
  assignee: string;
}

const DevelopmentUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [codeReviews, setCodeReviews] = useState<CodeReview[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedItem, setSelectedItem] = useState<Deployment | BugReport | CodeReview | null>(null);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [editingBug, setEditingBug] = useState<BugReport | null>(null);
  const [editingReview, setEditingReview] = useState<CodeReview | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'deployments' | 'bugs' | 'reviews'>('deployments');
  const [filters, setFilters] = useState<DevelopmentFilters>({
    search: '',
    status: '',
    environment: '',
    severity: '',
    priority: '',
    assignee: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des données Development...');
      
      // Charger les déploiements, bugs, revues et utilisateurs depuis Supabase
      const [deploymentsData, bugReportsData, codeReviewsData, usersData] = await Promise.all([
        developmentService.getAllDeployments(),
        developmentService.getAllBugReports(),
        developmentService.getAllCodeReviews(),
        userService.getAll()
      ]);
      
      setDeployments(deploymentsData);
      setBugReports(bugReportsData);
      setCodeReviews(codeReviewsData);
      setUsers(usersData);
      
      console.log(`✅ ${deploymentsData.length} déploiements, ${bugReportsData.length} bugs, ${codeReviewsData.length} revues et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données Development:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setDeployments([]);
      setBugReports([]);
      setCodeReviews([]);
      setUsers([]);
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
  const metrics: DevelopmentMetrics = useMemo(() => {
    const totalDeployments = deployments.length;
    const runningDeployments = deployments.filter(d => d.status === 'Running').length;
    const failedDeployments = deployments.filter(d => d.status === 'Failed').length;
    
    const totalBugReports = bugReports.length;
    const openBugReports = bugReports.filter(b => b.status === 'Open').length;
    const criticalBugs = bugReports.filter(b => b.severity === 'Critical').length;
    
    const totalCodeReviews = codeReviews.length;
    const pendingReviews = codeReviews.filter(r => r.status === 'Pending').length;
    
    const averageResolutionTime = bugReports.length > 0 
      ? bugReports.reduce((sum, bug) => {
          const created = new Date(bug.createdAt).getTime();
          const updated = new Date(bug.updatedAt).getTime();
          return sum + (updated - created);
        }, 0) / bugReports.length / (1000 * 60 * 60 * 24) // en jours
      : 0;
    
    return {
      totalDeployments,
      runningDeployments,
      failedDeployments,
      totalBugReports,
      openBugReports,
      criticalBugs,
      totalCodeReviews,
      pendingReviews,
      averageResolutionTime: Math.round(averageResolutionTime * 10) / 10
    };
  }, [deployments, bugReports, codeReviews]);

  // Filtrer et trier les déploiements
  const filteredAndSortedDeployments = useMemo(() => {
    let filtered = deployments.filter(deployment => {
      const matchesSearch = !filters.search || 
        deployment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        deployment.version.toLowerCase().includes(filters.search.toLowerCase()) ||
        deployment.branch.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || deployment.status === filters.status;
      const matchesEnvironment = !filters.environment || deployment.environment === filters.environment;
      
      return matchesSearch && matchesStatus && matchesEnvironment;
    });
    
    // Trier
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Deployment];
      let bValue: any = b[sortBy as keyof Deployment];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'deployedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [deployments, filters, sortBy, sortOrder]);

  // Filtrer les rapports de bugs
  const filteredBugReports = useMemo(() => {
    return bugReports.filter(bug => {
      const matchesSearch = !filters.search || 
        bug.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        bug.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        bug.project.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || bug.status === filters.status;
      const matchesSeverity = !filters.severity || bug.severity === filters.severity;
      const matchesPriority = !filters.priority || bug.priority === filters.priority;
      const matchesAssignee = !filters.assignee || bug.assignee === filters.assignee;
      
      return matchesSearch && matchesStatus && matchesSeverity && matchesPriority && matchesAssignee;
    });
  }, [bugReports, filters]);

  // Filtrer les revues de code
  const filteredCodeReviews = useMemo(() => {
    return codeReviews.filter(review => {
      const matchesSearch = !filters.search || 
        review.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        review.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        review.project.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || review.status === filters.status;
      const matchesAssignee = !filters.assignee || review.reviewer === filters.assignee;
      
      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [codeReviews, filters]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouveau Déploiement',
      icon: RocketLaunchIcon,
      onClick: () => {
        setEditingDeployment(null);
        setShowDeploymentModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Nouveau Bug',
      icon: BugAntIcon,
      onClick: () => {
        setEditingBug(null);
        setShowBugModal(true);
      },
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      label: 'Nouvelle Revie',
      icon: CodeBracketIcon,
      onClick: () => {
        setEditingReview(null);
        setShowReviewModal(true);
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }));
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  // Gestion des déploiements
  const handleCreateDeployment = async (deploymentData: Deployment | Omit<Deployment, 'id'>) => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      let result: Deployment | null = null;
      
      if ('id' in deploymentData && deploymentData.id) {
        // Mise à jour
        result = await developmentService.updateDeployment(deploymentData.id, deploymentData);
      } else {
        // Création
        result = await developmentService.createDeployment(deploymentData as Omit<Deployment, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowDeploymentModal(false);
        setEditingDeployment(null);
        console.log('✅ Déploiement sauvegardé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde déploiement:', error);
      setError('Erreur lors de la sauvegarde du déploiement');
    }
  };

  const handleDeleteDeployment = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await developmentService.deleteDeployment(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Déploiement supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression déploiement:', error);
      setError('Erreur lors de la suppression du déploiement');
    }
  };

  // Gestion des bugs
  const handleCreateBug = async (bugData: BugReport | Omit<BugReport, 'id'>) => {
    try {
      let result: BugReport | null = null;
      
      if ('id' in bugData && bugData.id) {
        // Mise à jour
        result = await developmentService.updateBugReport(bugData.id, bugData);
      } else {
        // Création
        result = await developmentService.createBugReport(bugData as Omit<BugReport, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowBugModal(false);
        setEditingBug(null);
        console.log('✅ Rapport de bug sauvegardé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde rapport de bug:', error);
      setError('Erreur lors de la sauvegarde du rapport de bug');
    }
  };

  const handleDeleteBug = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await developmentService.deleteBugReport(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Rapport de bug supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression rapport de bug:', error);
      setError('Erreur lors de la suppression du rapport de bug');
    }
  };

  // Gestion des revues de code
  const handleCreateReview = async (reviewData: CodeReview | Omit<CodeReview, 'id'>) => {
    try {
      let result: CodeReview | null = null;
      
      if ('id' in reviewData && reviewData.id) {
        // Mise à jour
        result = await developmentService.updateCodeReview(reviewData.id, reviewData);
      } else {
        // Création
        result = await developmentService.createCodeReview(reviewData as Omit<CodeReview, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowReviewModal(false);
        setEditingReview(null);
        console.log('✅ Revue de code sauvegardée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde revue de code:', error);
      setError('Erreur lors de la sauvegarde de la revue de code');
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await developmentService.deleteCodeReview(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Revue de code supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression revue de code:', error);
      setError('Erreur lors de la suppression de la revue de code');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Développement</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos déploiements, bugs et revues de code
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
            <RocketLaunchIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Déploiements</p>
              <p className="text-2xl font-bold">{metrics.totalDeployments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">En Cours</p>
              <p className="text-2xl font-bold">{metrics.runningDeployments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <BugAntIcon className="h-8 w-8 text-red-200" />
            <div className="ml-4">
              <p className="text-red-100 text-sm font-medium">Bugs Critiques</p>
              <p className="text-2xl font-bold">{metrics.criticalBugs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CodeBracketIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Revues En Attente</p>
              <p className="text-2xl font-bold">{metrics.pendingReviews}</p>
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
              onClick={() => setActiveTab('deployments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deployments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Déploiements ({metrics.totalDeployments})
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bugs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bugs ({metrics.totalBugReports})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Revues ({metrics.totalCodeReviews})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Filtres et contrôles */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {activeTab === 'deployments' && (
                  <>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="Running">En cours</option>
                      <option value="Stopped">Arrêté</option>
                      <option value="Failed">Échoué</option>
                      <option value="Building">En construction</option>
                    </select>
                    
                    <select
                      value={filters.environment}
                      onChange={(e) => setFilters(prev => ({ ...prev, environment: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tous les environnements</option>
                      <option value="Development">Développement</option>
                      <option value="Staging">Staging</option>
                      <option value="Production">Production</option>
                    </select>
                  </>
                )}
                
                {activeTab === 'bugs' && (
                  <>
                    <select
                      value={filters.severity}
                      onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toutes les sévérités</option>
                      <option value="Low">Faible</option>
                      <option value="Medium">Moyen</option>
                      <option value="High">Élevé</option>
                      <option value="Critical">Critique</option>
                    </select>
                    
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toutes les priorités</option>
                      <option value="Low">Faible</option>
                      <option value="Medium">Moyen</option>
                      <option value="High">Élevé</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </>
                )}
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

          {activeTab === 'deployments' ? (
            filteredAndSortedDeployments.length === 0 ? (
              <div className="text-center py-12">
                <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun déploiement</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {deployments.length === 0 
                    ? "Commencez par créer votre premier déploiement."
                    : "Aucun déploiement ne correspond à vos critères de recherche."
                  }
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingDeployment(null);
                      setShowDeploymentModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouveau Déploiement
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredAndSortedDeployments.map((deployment) => (
                      <div key={deployment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{deployment.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">v{deployment.version}</p>
                            <p className="mt-1 text-sm text-gray-600">{deployment.branch}</p>
                          </div>
                          <div className="ml-4 flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedItem(deployment);
                                // TODO: Implémenter la vue détaillée
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingDeployment(deployment);
                                setShowDeploymentModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingItem({ id: deployment.id, type: 'déploiement' });
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{deployment.environment}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span>{deployment.deployedBy}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>{new Date(deployment.deployedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            deployment.status === 'Running' ? 'bg-green-100 text-green-800' :
                            deployment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            deployment.status === 'Building' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {deployment.status}
                          </span>
                          <span className="text-xs">
                            {deployment.commitHash.substring(0, 7)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Version
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Environnement
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Déployé par
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedDeployments.map((deployment) => (
                          <tr key={deployment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{deployment.name}</div>
                                  <div className="text-sm text-gray-500">{deployment.branch}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {deployment.version}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {deployment.environment}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                deployment.status === 'Running' ? 'bg-green-100 text-green-800' :
                                deployment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                deployment.status === 'Building' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {deployment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {deployment.deployedBy}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedItem(deployment);
                                    // TODO: Implémenter la vue détaillée
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Voir détails"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingDeployment(deployment);
                                    setShowDeploymentModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingItem({ id: deployment.id, type: 'déploiement' });
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'bugs' ? (
            <div className="text-center py-12">
              <BugAntIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Rapports de Bugs</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filteredBugReports.length === 0 
                  ? "Aucun rapport de bug trouvé."
                  : `${filteredBugReports.length} rapport(s) de bug trouvé(s).`
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Revues de Code</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filteredCodeReviews.length === 0 
                  ? "Aucune revue de code trouvée."
                  : `${filteredCodeReviews.length} revue(s) de code trouvée(s).`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showDeploymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingDeployment ? 'Modifier le déploiement' : 'Nouveau déploiement'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de déploiement à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeploymentModal(false);
                  setEditingDeployment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowDeploymentModal(false);
                  setEditingDeployment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showBugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingBug ? 'Modifier le rapport de bug' : 'Nouveau rapport de bug'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de rapport de bug à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBugModal(false);
                  setEditingBug(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowBugModal(false);
                  setEditingBug(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingReview ? 'Modifier la revue de code' : 'Nouvelle revue de code'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de revue de code à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setEditingReview(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setEditingReview(null);
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
          onConfirm={deletingItem.type === 'déploiement' ? handleDeleteDeployment : 
                    deletingItem.type === 'bug' ? handleDeleteBug : handleDeleteReview}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

export default DevelopmentUltraModernV3;
