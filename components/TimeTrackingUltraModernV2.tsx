import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { TimeLog, Project, Task } from '../types';
import { timeTrackingService } from '../services/timeTrackingServiceSupabase';
import { projectService } from '../services/projectService';
import TimeEntryFormModal from './forms/TimeEntryFormModal';
import ConfirmationModal from './common/ConfirmationModal';
import StartTimerModal from './forms/StartTimerModal';

// Types pour Time Tracking UltraModern
interface TimeTrackingMetrics {
  totalHours: number;
  todayHours: number;
  weekHours: number;
  monthHours: number;
  activeTimers: number;
  completedTasks: number;
  averageSession: number;
  productivity: number;
}

interface TimeTrackingFilters {
  search: string;
  project: string;
  task: string;
  dateRange: { start: string; end: string };
  status: string;
}


const TimeTrackingUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState([]); // Keep using mock tasks for now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et recherche
  const [filters, setFilters] = useState<TimeTrackingFilters>({
    search: '',
    project: 'all',
    task: 'all',
    dateRange: { start: '', end: '' },
    status: 'all'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'startTime' | 'duration' | 'project' | 'task'>('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // États pour les modales
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [editingTimeLog, setEditingTimeLog] = useState<TimeLog | null>(null);
  const [showStartTimerModal, setShowStartTimerModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [timeLogsData, projectsData] = await Promise.all([
          timeTrackingService.getAll(),
          projectService.getAll(),
        ]);
        setTimeLogs(timeLogsData);
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
        // Pas de fallback vers les données mockées
        setTimeLogs([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // États pour le timer
  const [activeTimer, setActiveTimer] = useState<TimeLog | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(activeTimer.startTime);
        setTimerDuration((now.getTime() - start.getTime()) / 1000 / 3600); // duration in hours
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTimer]);

  // Calcul des métriques
  const metrics: TimeTrackingMetrics = useMemo(() => {
    const totalHours = timeLogs.reduce((sum, log) => sum + log.duration, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = timeLogs.filter(log => 
      log.startTime.startsWith(today)
    );
    const todayHours = todayLogs.reduce((sum, log) => sum + log.duration, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekLogs = timeLogs.filter(log => 
      new Date(log.startTime) >= weekStart
    );
    const weekHours = weekLogs.reduce((sum, log) => sum + log.duration, 0);
    
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    const monthLogs = timeLogs.filter(log => 
      new Date(log.startTime) >= monthStart
    );
    const monthHours = monthLogs.reduce((sum, log) => sum + log.duration, 0);
    
    const activeTimers = timeLogs.filter(log => log.status === 'running').length;
    const completedTasks = timeLogs.filter(log => log.status === 'completed').length;
    
    const averageSession = completedTasks > 0 ? totalHours / completedTasks : 0;
    const productivity = weekHours > 0 ? (weekHours / 40) * 100 : 0; // Basé sur 40h/semaine

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      todayHours: Math.round(todayHours * 10) / 10,
      weekHours: Math.round(weekHours * 10) / 10,
      monthHours: Math.round(monthHours * 10) / 10,
      activeTimers,
      completedTasks,
      averageSession: Math.round(averageSession * 10) / 10,
      productivity: Math.round(productivity)
    };
  }, [timeLogs]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvelle Entrée',
      icon: PlusIcon,
      onClick: () => setShowTimeEntryModal(true),
      color: 'blue'
    },
    {
      label: 'Démarrer Timer',
      icon: PlayIcon,
      onClick: () => setShowStartTimerModal(true),
      color: 'green'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => console.log('Analytics'),
      color: 'purple'
    },
    {
      label: 'Exporter Temps',
      icon: ArrowDownIcon,
      onClick: () => console.log('Export'),
      color: 'orange'
    }
  ];

  // Filtrage et tri des logs de temps
  const filteredAndSortedTimeLogs = useMemo(() => {
    let filtered = timeLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                           log.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
                           log.taskName.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesProject = filters.project === 'all' || log.projectId === filters.project;
      const matchesTask = filters.task === 'all' || log.taskId === filters.task;
      const matchesStatus = filters.status === 'all' || log.status === filters.status;
      
      const matchesDateRange = (!filters.dateRange.start || log.startTime >= filters.dateRange.start) &&
                              (!filters.dateRange.end || log.startTime <= filters.dateRange.end);

      return matchesSearch && matchesProject && matchesTask && matchesStatus && matchesDateRange;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'startTime':
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'project':
          aValue = a.projectName.toLowerCase();
          bValue = b.projectName.toLowerCase();
          break;
        case 'task':
          aValue = a.taskName.toLowerCase();
          bValue = b.taskName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [timeLogs, filters, sortBy, sortOrder]);

  // Gestion des logs de temps
  const handleCreateTimeLog = async (timeLogData: Omit<TimeLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (user?.id) {
      try {
        const savedTimeLog = await timeTrackingService.create({
          ...timeLogData,
          userId: user.id
        });
        
        if (savedTimeLog) {
          setTimeLogs(prev => [savedTimeLog, ...prev]);
          setShowTimeEntryModal(false);
          return;
        }
      } catch (error) {
        console.error('Erreur création log temps:', error);
      }
    }
    
    // Fallback local
    const newTimeLog: TimeLog = {
      id: `log-${Date.now()}`,
      ...timeLogData,
      userId: user?.id || 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTimeLogs(prev => [newTimeLog, ...prev]);
    setShowTimeEntryModal(false);
  };

  const handleUpdateTimeLog = async (updatedTimeLog: TimeLog) => {
    if (user?.id && typeof updatedTimeLog.id === 'string') {
      try {
        const success = await timeTrackingService.update(updatedTimeLog.id, updatedTimeLog);
        if (success) {
          setTimeLogs(prev => prev.map(log => log.id === updatedTimeLog.id ? updatedTimeLog : log));
          setEditingTimeLog(null);
          return;
        }
      } catch (error) {
        console.error('Erreur mise à jour log temps:', error);
      }
    }
    
    // Fallback local
    setTimeLogs(prev => prev.map(log => log.id === updatedTimeLog.id ? updatedTimeLog : log));
    setEditingTimeLog(null);
  };

  const handleDeleteTimeLog = async (timeLogId: string) => {
    if (user?.id) {
      try {
        const success = await timeTrackingService.delete(timeLogId);
        if (success) {
          setTimeLogs(prev => prev.filter(log => log.id !== timeLogId));
          setShowDeleteModal(false);
          setSelectedTimeLog(null);
          return;
        }
      } catch (error) {
        console.error('Erreur suppression log temps:', error);
      }
    }
    
    // Fallback local
    setTimeLogs(prev => prev.filter(log => log.id !== timeLogId));
    setShowDeleteModal(false);
    setSelectedTimeLog(null);
  };

  const handleStartTimer = async (projectId: string, taskDescription: string) => {
    if (user?.id) {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const newTimeLog: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        projectName: project.title,
        taskId: '', // No task selection for now
        taskName: taskDescription,
        description: taskDescription,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        status: 'running',
        userId: user.id,
        tags: [],
      };

      try {
        const savedTimeLog = await timeTrackingService.create(newTimeLog);
        if (savedTimeLog) {
          setTimeLogs(prev => [savedTimeLog, ...prev]);
          setActiveTimer(savedTimeLog);
          setShowStartTimerModal(false);
        }
      } catch (error) {
        console.error('Erreur démarrage timer:', error);
        setError('Erreur lors du démarrage du timer.');
      }
    }
  };

  const handleStopTimer = async () => {
    if (activeTimer) {
      const endTime = new Date().toISOString();
      const duration = (new Date(endTime).getTime() - new Date(activeTimer.startTime).getTime()) / 1000 / 3600;
      const updatedTimeLog = { ...activeTimer, endTime, duration, status: 'completed' as 'completed' };
      
      try {
        const success = await timeTrackingService.update(activeTimer.id, updatedTimeLog);
        if (success) {
          setTimeLogs(prev => prev.map(log => log.id === activeTimer.id ? updatedTimeLog : log));
          setActiveTimer(null);
          setTimerDuration(0);
        }
      } catch (error) {
        console.error('Erreur arrêt timer:', error);
        setError('Erreur lors de l\'arrêt du timer.');
      }
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'En cours';
      case 'completed': return 'Terminé';
      case 'paused': return 'En pause';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Formater la durée
  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-4 text-lg font-medium text-gray-700">Chargement du suivi du temps...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6" role="alert">
          <div className="flex">
            <div className="py-1"><ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-4" /></div>
            <div>
              <p className="font-bold">Erreur de chargement</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {activeTimer && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
          <div>
            <p className="font-bold">Timer en cours</p>
            <p>{activeTimer.projectName} - {activeTimer.taskName}</p>
          </div>
          <div className="flex items-center">
            <p className="font-bold text-xl mr-4">{formatDuration(timerDuration)}</p>
            <button onClick={handleStopTimer} className="p-2 text-gray-400 hover:text-red-600">
              <StopIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Suivi du Temps
        </h1>
        <p className="text-gray-600">
          Gérez votre temps de travail avec précision et efficacité
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Aujourd'hui
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(metrics.todayHours)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">
                  {metrics.activeTimers} timers actifs
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Cette Semaine
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(metrics.weekHours)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-blue-600">
                  {metrics.completedTasks} tâches terminées
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Ce Mois
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(metrics.monthHours)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-purple-600">
                  {formatDuration(metrics.averageSession)}/session
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Productivité
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.productivity}%
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-orange-600">
                  {formatDuration(metrics.totalHours)} total
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <ArrowUpIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
                action.color === 'blue' ? 'hover:bg-blue-50' :
                action.color === 'green' ? 'hover:bg-green-50' :
                action.color === 'purple' ? 'hover:bg-purple-50' :
                'hover:bg-orange-50'
              }`}
            >
              <action.icon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des entrées de temps..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.project}
              onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les projets</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="running">En cours</option>
              <option value="completed">Terminé</option>
              <option value="paused">En pause</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg ${
                viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des logs de temps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Entrées de Temps ({filteredAndSortedTimeLogs.length})
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="startTime">Date de début</option>
                <option value="duration">Durée</option>
                <option value="project">Projet</option>
                <option value="task">Tâche</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTimeLogs.map((timeLog) => (
              <div key={timeLog.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {timeLog.taskName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {timeLog.description}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(timeLog.status)}`}>
                        {getStatusLabel(timeLog.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {timeLog.projectName}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Durée</span>
                    <span className="font-semibold">{formatDuration(timeLog.duration)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(timeLog.startTime)}
                    {timeLog.endTime && ` - ${formatDate(timeLog.endTime)}`}
                  </div>
                </div>
                
                {timeLog.tags && timeLog.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {timeLog.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTimeLog(timeLog);
                        // setShowDetailModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTimeLog(timeLog);
                        setShowTimeEntryModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTimeLog(timeLog);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {timeLog.status === 'running' && (
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-yellow-600">
                        <PauseIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <StopIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tâche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTimeLogs.map((timeLog) => (
                  <tr key={timeLog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {timeLog.taskName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {timeLog.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {timeLog.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(timeLog.status)}`}>
                        {getStatusLabel(timeLog.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(timeLog.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(timeLog.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTimeLog(timeLog);
                            // setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTimeLog(timeLog);
                            setShowTimeEntryModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTimeLog(timeLog);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
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
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {filteredAndSortedTimeLogs.map((timeLog) => (
                <div key={timeLog.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{timeLog.taskName}</h4>
                      <span className="text-sm text-gray-500">{formatDuration(timeLog.duration)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{timeLog.projectName}</p>
                    <p className="text-xs text-gray-500">{formatDate(timeLog.startTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showTimeEntryModal && (
        <TimeEntryFormModal
          timeLog={editingTimeLog}
          projects={projects}
          tasks={tasks}
          onClose={() => {
            setShowTimeEntryModal(false);
            setEditingTimeLog(null);
          }}
          onSave={editingTimeLog ? handleUpdateTimeLog : handleCreateTimeLog}
        />
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
          message={`Êtes-vous sûr de vouloir supprimer cette entrée de temps ? Cette action est irréversible.`}
        />
      )}

      {showStartTimerModal && (
        <StartTimerModal
          isOpen={showStartTimerModal}
          onClose={() => setShowStartTimerModal(false)}
          onStart={handleStartTimer}
          projects={projects}
        />
      )}
    </div>
  );
};

export default TimeTrackingUltraModernV2;
