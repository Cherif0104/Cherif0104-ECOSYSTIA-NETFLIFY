/**
 * ⏰ TIME TRACKING ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
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
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { useFeedback } from '../hooks/useFeedback';
import FeedbackDisplay from './common/FeedbackDisplay';
import LoadingButton from './common/LoadingButton';
import { TimeLog, Project, User } from '../types';
import { timeTrackingService } from '../services/timeTrackingServiceSupabase';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { moduleInterconnectionService } from '../services/moduleInterconnectionService';
import ConfirmationModal from './common/ConfirmationModal';

const TimeTrackingUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const { 
    isSubmitting, 
    submitSuccess, 
    submitError, 
    setSubmitting, 
    setSuccess
  } = useFeedback();
  
  // États principaux
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // États pour les vues
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'startTime' | 'duration' | 'project' | 'task'>('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // États pour les modales
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [editingTimeLog, setEditingTimeLog] = useState<TimeLog | null>(null);
  
  // États pour le timer
  const [activeTimer, setActiveTimer] = useState<TimeLog | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);

  // Chargement des données
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des time logs...');
      const [timeLogsData, projectsData, usersData] = await Promise.all([
        timeTrackingService.getAll(user?.id), // Filtrer par utilisateur connecté
        projectService.getAll(user?.id), // Filtrer par utilisateur connecté
        userService.getAllUsers()
      ]);
      console.log(`✅ ${timeLogsData.length} time logs chargés`);
      console.log(`✅ ${projectsData.length} projets chargés`);
      console.log('📊 Projets disponibles:', projectsData.map(p => ({ id: p.id, name: p.name })));
      setTimeLogs(timeLogsData);
      setProjects(projectsData);
      setUsers(usersData);
      setErrorState(null);
    } catch (err) {
      console.error('❌ Erreur chargement time logs:', err);
      setErrorState("Erreur lors du chargement des données.");
      setTimeLogs([]);
      setProjects([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gestion des time logs
  const handleCreateTimeLog = async (timeLog: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Création time log...');
      await timeTrackingService.create(timeLog);
      
      // Synchroniser avec les autres modules
      await moduleInterconnectionService.syncModuleData('time_tracking', 'create', timeLog);
      
      await loadData(); // Recharger les données
      setShowTimeEntryModal(false);
      console.log('✅ Time log créé avec succès');
    } catch (error) {
      console.error('❌ Erreur création time log:', error);
    }
  };

  const handleUpdateTimeLog = async (timeLog: TimeLog) => {
    try {
      console.log('🔄 Mise à jour time log...');
      await timeTrackingService.update(timeLog.id, timeLog);
      await loadData(); // Recharger les données
      setShowTimeEntryModal(false);
      setEditingTimeLog(null);
      console.log('✅ Time log mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur mise à jour time log:', error);
    }
  };

  const handleDeleteTimeLog = async (id: string) => {
    try {
      console.log('🔄 Suppression time log...');
      await timeTrackingService.delete(id);
      await loadData(); // Recharger les données
      setShowDeleteModal(false);
      setSelectedTimeLog(null);
      console.log('✅ Time log supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression time log:', error);
    }
  };

  // Timer functions
  const startTimer = async (projectId: string, taskName: string) => {
    try {
      console.log('🔄 Démarrage timer...');
      const newTimeLog = await timeTrackingService.startTimer(projectId, taskName);
      setActiveTimer(newTimeLog);
      setTimerDuration(0);
      console.log('✅ Timer démarré');
    } catch (error) {
      console.error('❌ Erreur démarrage timer:', error);
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;
    
    try {
      console.log('🔄 Arrêt timer...');
      await timeTrackingService.stopTimer(activeTimer.id);
      setActiveTimer(null);
      setTimerDuration(0);
      await loadData(); // Recharger les données
      console.log('✅ Timer arrêté');
    } catch (error) {
      console.error('❌ Erreur arrêt timer:', error);
    }
  };

  // Filtrage et tri
  const filteredTimeLogs = timeLogs.filter(timeLog => {
    const matchesSearch = timeLog.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         timeLog.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || timeLog.projectId === filterProject;
    const matchesStatus = filterStatus === 'all' || timeLog.status === filterStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const sortedTimeLogs = [...filteredTimeLogs].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'duration') {
      aValue = a.duration || 0;
      bValue = b.duration || 0;
    }
    
    if (sortBy === 'project') {
      const projectA = projects.find(p => p.id === a.projectId);
      const projectB = projects.find(p => p.id === b.projectId);
      aValue = projectA?.title || '';
      bValue = projectB?.title || '';
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
      {sortedTimeLogs.map((timeLog) => {
        const project = projects.find(p => p.id === timeLog.projectId);
        const user = users.find(u => u.id === timeLog.userId);
        return (
          <div key={timeLog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{timeLog.taskName}</h3>
                <p className="text-sm text-gray-600 mb-3">{timeLog.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(timeLog.startTime).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500">
                  Projet: {project?.title || 'Non assigné'}
                </div>
                <div className="text-sm text-gray-500">
                  Utilisateur: {user?.firstName || 'Inconnu'}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingTimeLog(timeLog);
                    setShowTimeEntryModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedTimeLog(timeLog);
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
                <span className="text-sm font-medium text-gray-700">Durée</span>
                <span className="text-sm text-gray-600">{timeLog.duration || 0}h</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  timeLog.status === 'completed' ? 'bg-green-100 text-green-800' :
                  timeLog.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {timeLog.status === 'completed' ? 'Terminé' :
                   timeLog.status === 'active' ? 'Actif' : 'En attente'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(timeLog.startTime).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTimeLogs.map((timeLog) => {
              const project = projects.find(p => p.id === timeLog.projectId);
              const user = users.find(u => u.id === timeLog.userId);
              return (
                <tr key={timeLog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{timeLog.taskName}</div>
                      <div className="text-sm text-gray-500">{timeLog.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project?.title || 'Non assigné'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user?.firstName || 'Inconnu'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {timeLog.duration || 0}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(timeLog.startTime).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      timeLog.status === 'completed' ? 'bg-green-100 text-green-800' :
                      timeLog.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {timeLog.status === 'completed' ? 'Terminé' :
                       timeLog.status === 'active' ? 'Actif' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTimeLog(timeLog);
                          setShowTimeEntryModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTimeLog(timeLog);
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-4">
      {sortedTimeLogs.map((timeLog) => {
        const project = projects.find(p => p.id === timeLog.projectId);
        const user = users.find(u => u.id === timeLog.userId);
        return (
          <div key={timeLog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{timeLog.taskName}</h3>
                  <p className="text-sm text-gray-600">{timeLog.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Projet: {project?.title || 'Non assigné'}</span>
                    <span>Utilisateur: {user?.firstName || 'Inconnu'}</span>
                    <span>Durée: {timeLog.duration || 0}h</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  timeLog.status === 'completed' ? 'bg-green-100 text-green-800' :
                  timeLog.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {timeLog.status === 'completed' ? 'Terminé' :
                   timeLog.status === 'active' ? 'Actif' : 'En attente'}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingTimeLog(timeLog);
                      setShowTimeEntryModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTimeLog(timeLog);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Gérez votre temps de travail</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {activeTimer ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Timer actif: {Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={stopTimer}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <StopIcon className="h-4 w-4 mr-2" />
                Arrêter
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTimeEntryModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle Entrée
            </button>
          )}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une tâche..."
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="pending">En attente</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="startTime">Date</option>
              <option value="duration">Durée</option>
              <option value="project">Projet</option>
              <option value="task">Tâche</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
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
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg ${
              viewMode === 'timeline' 
                ? 'bg-purple-100 text-purple-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Vue timeline"
          >
            <QueueListIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {sortedTimeLogs.length} entrée(s) trouvée(s)
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

      {sortedTimeLogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
            <ClockIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune entrée de temps</h3>
          <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première entrée de temps.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'timeline' && renderTimelineView()}
        </>
      )}

      {/* Modales */}
      {showTimeEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingTimeLog ? 'Modifier l\'entrée' : 'Nouvelle entrée de temps'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const projectId = formData.get('projectId') as string;
              const taskName = formData.get('taskName') as string;
              
              // Validation
              if (!projectId || !taskName) {
                alert('Veuillez sélectionner un projet et saisir un nom de tâche');
                return;
              }
              
              const timeLog = {
                taskName,
                description: formData.get('description') as string,
                projectId,
                userId: user?.id || '00000000-0000-0000-0000-000000000000',
                startTime: new Date(formData.get('startTime') as string), // Convertir en Date
                duration: parseInt(formData.get('duration') as string) || 0,
                status: formData.get('status') as any
              };
              
              if (editingTimeLog) {
                handleUpdateTimeLog({ ...editingTimeLog, ...timeLog });
              } else {
                handleCreateTimeLog(timeLog);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la tâche</label>
                  <input
                    type="text"
                    name="taskName"
                    defaultValue={editingTimeLog?.taskName || ''}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => {
                      // Activer le bouton créer quand un nom de tâche est saisi
                      const form = e.target.closest('form');
                      const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
                      const projectSelect = form?.querySelector('select[name="projectId"]') as HTMLSelectElement;
                      if (submitButton && projectSelect) {
                        submitButton.disabled = !e.target.value || !projectSelect.value;
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingTimeLog?.description || ''}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projet</label>
                  <select
                    name="projectId"
                    defaultValue={editingTimeLog?.projectId || ''}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => {
                      // Activer le bouton créer quand un projet est sélectionné
                      const form = e.target.closest('form');
                      const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
                      const taskInput = form?.querySelector('input[name="taskName"]') as HTMLInputElement;
                      if (submitButton && taskInput) {
                        submitButton.disabled = !e.target.value || !taskInput.value;
                      }
                    }}
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="startTime"
                      defaultValue={editingTimeLog?.startTime ? new Date(editingTimeLog.startTime).toISOString().split('T')[0] : ''}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée (heures)</label>
                    <input
                      type="number"
                      name="duration"
                      min="0"
                      step="0.5"
                      defaultValue={editingTimeLog?.duration || 0}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    name="status"
                    defaultValue={editingTimeLog?.status || 'completed'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="completed">Terminé</option>
                    <option value="active">Actif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeEntryModal(false);
                    setEditingTimeLog(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!editingTimeLog} // Désactivé par défaut pour nouvelle entrée
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingTimeLog ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedTimeLog && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTimeLog(null);
          }}
          onConfirm={() => handleDeleteTimeLog(selectedTimeLog.id)}
          title="Supprimer l'entrée de temps"
          message={`Êtes-vous sûr de vouloir supprimer l'entrée "${selectedTimeLog.taskName}" ?`}
        />
      )}
    </div>
  );
};

export default TimeTrackingUltraModernV3;
