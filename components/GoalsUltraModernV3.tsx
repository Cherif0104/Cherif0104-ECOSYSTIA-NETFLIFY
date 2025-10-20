/**
 * 🎯 GOALS ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  QueueListIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { useFeedback } from '../hooks/useFeedback';
import FeedbackDisplay from './common/FeedbackDisplay';
import LoadingButton from './common/LoadingButton';
import { Objective, User, Project } from '../types';
import { goalsService } from '../services/goalsService';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import ConfirmationModal from './common/ConfirmationModal';
import TeamManagementModal from './TeamManagementModal';

const GoalsUltraModernV3: React.FC = () => {
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
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // États pour les vues
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'status' | 'priority'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  
  // États pour les modales
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  
  // États pour l'équipe
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Chargement des données
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des objectifs et projets...');
      const [fetchedObjectives, fetchedProjects] = await Promise.all([
        goalsService.getAll(), // Récupérer tous les objectifs pour l'instant
        projectService.getAll() // Récupérer tous les projets
      ]);
      console.log(`✅ ${fetchedObjectives.length} objectifs et ${fetchedProjects.length} projets chargés`);
      setObjectives(fetchedObjectives);
      setProjects(fetchedProjects);
      setErrorState(null);
    } catch (err) {
      console.error('❌ Erreur chargement objectifs:', err);
      setErrorState("Erreur lors du chargement des objectifs.");
      setObjectives([]);
      setProjects([]);
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

  // Fonction pour récupérer le nom du projet
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Projet non trouvé';
  };

  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  // Gestion des objectifs
  const handleCreateObjective = async (objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Création objectif...');
      await goalsService.create(objective);
      await loadData(); // Recharger les données
      setShowObjectiveModal(false);
      console.log('✅ Objectif créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création objectif:', error);
    }
  };

  const handleUpdateObjective = async (objective: Objective) => {
    try {
      console.log('🔄 Mise à jour objectif...');
      await goalsService.update(objective.id, objective);
      await loadData(); // Recharger les données
      setShowObjectiveModal(false);
      setEditingObjective(null);
      console.log('✅ Objectif mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur mise à jour objectif:', error);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log('🔄 Suppression objectif...');
      await goalsService.delete(id);
      await loadData(); // Recharger les données
      setShowDeleteModal(false);
      setSelectedObjective(null);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      console.log('✅ Objectif supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression objectif:', error);
      setSubmitError('Erreur lors de la suppression de l\'objectif');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrage et tri
  const filteredObjectives = objectives.filter(objective => {
    const matchesSearch = objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         objective.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || objective.status === filterStatus;
    const matchesProject = filterProject === 'all' || objective.projectId === filterProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const sortedObjectives = [...filteredObjectives].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'progress') {
      aValue = a.progress || 0;
      bValue = b.progress || 0;
    }
    
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

  // Rendu des vues
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedObjectives.map((objective) => (
        <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{objective.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
              {objective.projectId && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📁 {getProjectName(objective.projectId)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedObjective(objective);
                  setShowTeamModal(true);
                }}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                title="Gérer l'équipe"
              >
                <UserGroupIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setEditingObjective(objective);
                  setShowObjectiveModal(true);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Modifier"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedObjective(objective);
                  setShowDeleteModal(true);
                }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Supprimer"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm text-gray-600">{objective.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${objective.progress || 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                objective.status === 'Completed' ? 'bg-green-100 text-green-800' :
                objective.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                objective.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {objective.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                objective.priority === 'High' ? 'bg-red-100 text-red-800' :
                objective.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {objective.priority}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectif</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedObjectives.map((objective) => (
              <tr key={objective.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{objective.title}</div>
                    <div className="text-sm text-gray-500">{objective.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {objective.projectId ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📁 {getProjectName(objective.projectId)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Aucun projet</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${objective.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{objective.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    objective.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    objective.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    objective.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {objective.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    objective.priority === 'High' ? 'bg-red-100 text-red-800' :
                    objective.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {objective.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedObjective(objective);
                        setShowTeamModal(true);
                      }}
                      className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Gérer l'équipe"
                    >
                      <UserGroupIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingObjective(objective);
                        setShowObjectiveModal(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedObjective(objective);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );

  const renderKanbanView = () => {
    const statusColumns = [
      { key: 'Not Started', title: 'À faire', color: 'gray' },
      { key: 'In Progress', title: 'En cours', color: 'blue' },
      { key: 'Completed', title: 'Terminé', color: 'green' },
      { key: 'On Hold', title: 'En attente', color: 'yellow' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnObjectives = sortedObjectives.filter(obj => obj.status === column.key);
          return (
            <div key={column.key} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
                  {columnObjectives.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnObjectives.map((objective) => (
                  <div key={objective.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">{objective.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{objective.progress || 0}%</span>
                      <span className={`px-2 py-1 rounded-full ${
                        objective.priority === 'High' ? 'bg-red-100 text-red-800' :
                        objective.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {objective.priority}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                      <div 
                        className={`h-1 rounded-full ${
                          column.color === 'gray' ? 'bg-gray-400' :
                          column.color === 'blue' ? 'bg-blue-400' :
                          column.color === 'green' ? 'bg-green-400' :
                          'bg-yellow-400'
                        }`}
                        style={{ width: `${objective.progress || 0}%` }}
                      />
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedObjective(objective);
                          setShowTeamModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Gérer l'équipe"
                      >
                        <UserGroupIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingObjective(objective);
                          setShowObjectiveModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedObjective(objective);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals (OKRs)</h1>
          <p className="text-gray-600">Gérez vos objectifs et résultats clés</p>
        </div>
        <button
          onClick={() => {
            setEditingObjective(null);
            setShowObjectiveModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvel Objectif
        </button>
      </div>

      {/* Messages de feedback */}
      <FeedbackDisplay
        success={submitSuccess}
        error={submitError}
        warning={null}
        info={null}
        onClearError={() => setErrorState("")}
      />

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un objectif..."
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="Not Started">À faire</option>
              <option value="In Progress">En cours</option>
              <option value="Completed">Terminé</option>
              <option value="On Hold">En attente</option>
              <option value="Cancelled">Annulé</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Projet</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les projets</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="title">Titre</option>
              <option value="progress">Progression</option>
              <option value="status">Statut</option>
              <option value="priority">Priorité</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Boutons de vue */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid' 
                ? 'bg-purple-100 text-purple-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Vue grille"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list' 
                ? 'bg-purple-100 text-purple-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Vue liste"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-lg ${
              viewMode === 'kanban' 
                ? 'bg-purple-100 text-purple-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Vue kanban"
          >
            <QueueListIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {sortedObjectives.length} objectif(s) trouvé(s)
        </div>
      </div>

      {/* Contenu principal */}
      {errorState && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{errorState}</p>
            </div>
          </div>
        </div>
      )}

      {sortedObjectives.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
            <ChartBarIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun objectif</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier objectif.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'kanban' && renderKanbanView()}
        </>
      )}

      {/* Modales */}
      {showObjectiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingObjective ? 'Modifier l\'objectif' : 'Nouvel objectif'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const objective = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                projectId: formData.get('projectId') as string || undefined,
                status: formData.get('status') as any,
                priority: formData.get('priority') as any,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                progress: parseInt(formData.get('progress') as string) || 0,
                category: formData.get('category') as string,
                owner: user?.firstName || 'Utilisateur',
                team: [],
                ownerId: user?.id || '00000000-0000-0000-0000-000000000000',
                quarter: 'Q4',
                year: new Date().getFullYear()
              };
              
              if (editingObjective) {
                handleUpdateObjective({ ...editingObjective, ...objective });
              } else {
                handleCreateObjective(objective);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingObjective?.title || ''}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingObjective?.description || ''}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projet associé</label>
                  <select
                    name="projectId"
                    defaultValue={editingObjective?.projectId || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sélectionner un projet (optionnel)</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      name="status"
                      defaultValue={editingObjective?.status || 'Not Started'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Not Started">À faire</option>
                      <option value="In Progress">En cours</option>
                      <option value="Completed">Terminé</option>
                      <option value="On Hold">En attente</option>
                      <option value="Cancelled">Annulé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <select
                      name="priority"
                      defaultValue={editingObjective?.priority || 'Medium'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Low">Faible</option>
                      <option value="Medium">Moyenne</option>
                      <option value="High">Élevée</option>
                      <option value="Critical">Critique</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={editingObjective?.startDate || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={editingObjective?.endDate || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    defaultValue={editingObjective?.progress || 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingObjective?.category || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowObjectiveModal(false);
                    setEditingObjective(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  {editingObjective ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedObjective && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedObjective(null);
          }}
          onConfirm={() => handleDeleteObjective(selectedObjective.id)}
          title="Supprimer l'objectif"
          message={`Êtes-vous sûr de vouloir supprimer l'objectif "${selectedObjective.title}" ?`}
          isLoading={isSubmitting}
          loadingText="Suppression en cours..."
        />
      )}

      {showTeamModal && selectedObjective && (
        <TeamManagementModal
          project={{
            id: selectedObjective.id,
            name: selectedObjective.title,
            team_members: selectedObjective.team || []
          }}
          availableUsers={users}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedObjective(null);
          }}
          onUpdate={(updatedProject) => {
            const updatedObjective = {
              ...selectedObjective,
              team: updatedProject.team_members || []
            };
            setObjectives(prevObjectives =>
              prevObjectives.map(o => o.id === updatedObjective.id ? updatedObjective : o)
            );
            setSelectedObjective(updatedObjective);
          }}
        />
      )}
    </div>
  );
};

export default GoalsUltraModernV3;
