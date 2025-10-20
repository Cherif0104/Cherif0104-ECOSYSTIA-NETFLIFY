import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { timeLogService } from '../services/timeLogService';
import { TimeLog, Meeting } from '../types';
import TimeEntryFormModal from './forms/TimeEntryFormModal';

const TimeTrackingUltraModern: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'timelogs' | 'meetings' | 'reports'>('timelogs');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'project' | 'task'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // États pour les modales
  const [showTimeLogModal, setShowTimeLogModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Timer pour le suivi en temps réel
  const [isTracking, setIsTracking] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<{
    startTime: Date;
    project: string;
    task: string;
  } | null>(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [timeLogsData, meetingsData] = await Promise.all([
        timeLogService.getTimeLogs(),
        timeLogService.getMeetings()
      ]);

      setTimeLogs(timeLogsData);
      setMeetings(meetingsData);
    } catch (error: any) {
      console.error('Erreur chargement données time tracking:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les métriques
  const metrics = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayLogs = timeLogs.filter(log => new Date(log.date) >= startOfDay);
    const weekLogs = timeLogs.filter(log => new Date(log.date) >= startOfWeek);
    const monthLogs = timeLogs.filter(log => new Date(log.date) >= startOfMonth);

    const totalToday = todayLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalWeek = weekLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalMonth = monthLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalAll = timeLogs.reduce((sum, log) => sum + log.duration, 0);

    const avgDaily = timeLogs.length > 0 ? totalAll / timeLogs.length : 0;
    const totalMeetings = meetings.length;
    const todayMeetings = meetings.filter(meeting => new Date(meeting.date) >= startOfDay).length;

    return {
      totalToday,
      totalWeek,
      totalMonth,
      totalAll,
      avgDaily,
      totalMeetings,
      todayMeetings
    };
  }, [timeLogs, meetings]);

  // Filtrer et trier les données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'timelogs':
        data = timeLogs;
        break;
      case 'meetings':
        data = meetings;
        break;
      case 'reports':
        data = timeLogs; // Pour les rapports, on utilise les time logs
        break;
    }

    // Filtrage par recherche
    if (searchTerm) {
      data = data.filter(item => 
        item.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par projet
    if (filterProject !== 'all') {
      data = data.filter(item => item.project === filterProject);
    }

    // Filtrage par date
    const now = new Date();
    let startDate: Date;
    
    switch (filterDate) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    if (filterDate !== 'all') {
      data = data.filter(item => new Date(item.date) >= startDate);
    }

    // Tri
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'project':
          aValue = (a.project || '').toLowerCase();
          bValue = (b.project || '').toLowerCase();
          break;
        case 'task':
          aValue = (a.task || a.title || '').toLowerCase();
          bValue = (b.task || b.title || '').toLowerCase();
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
  }, [timeLogs, meetings, activeTab, searchTerm, filterProject, filterDate, sortBy, sortOrder]);

  const handleDelete = async (id: string, type: string) => {
    try {
      let success = false;
      
      switch (type) {
        case 'timelog':
          success = await timeLogService.deleteTimeLog(id);
          if (success) setTimeLogs(prev => prev.filter(item => item.id !== id));
          break;
        case 'meeting':
          success = await timeLogService.deleteMeeting(id);
          if (success) setMeetings(prev => prev.filter(item => item.id !== id));
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

  const startTimer = (project: string, task: string) => {
    setIsTracking(true);
    setCurrentTimer({
      startTime: new Date(),
      project,
      task
    });
  };

  const stopTimer = async () => {
    if (!currentTimer) return;

    const duration = Math.floor((Date.now() - currentTimer.startTime.getTime()) / 1000 / 60); // en minutes

    try {
      const newTimeLog: Omit<TimeLog, 'id'> = {
        project: currentTimer.project,
        task: currentTimer.task,
        duration,
        date: currentTimer.startTime.toISOString().split('T')[0],
        description: `Session de travail - ${currentTimer.task}`,
        userId: user?.id || ''
      };

      await timeLogService.createTimeLog(newTimeLog);
      await loadData();
      
      setIsTracking(false);
      setCurrentTimer(null);
    } catch (error: any) {
      console.error('Erreur sauvegarde time log:', error);
      setError('Erreur lors de la sauvegarde du temps');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getProjectColor = (project: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    const index = project.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de suivi du temps...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Suivi du Temps</h1>
                <p className="mt-1 text-sm text-gray-500">Gestion du temps et des réunions</p>
              </div>
              <div className="flex items-center space-x-4">
                {!isTracking ? (
                  <button
                    onClick={() => setShowTimeLogModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Démarrer Timer
                  </button>
                ) : (
                  <button
                    onClick={stopTimer}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <i className="fas fa-stop mr-2"></i>
                    Arrêter Timer
                  </button>
                )}
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Nouvelle Réunion
                </button>
              </div>
            </div>

            {/* Timer en cours */}
            {isTracking && currentTimer && (
              <div className="mt-4 bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Timer en cours</p>
                    <p className="text-xl font-bold">
                      {currentTimer.project} - {currentTimer.task}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Durée</p>
                    <p className="text-2xl font-bold">
                      {formatDuration(Math.floor((Date.now() - currentTimer.startTime.getTime()) / 1000 / 60))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-clock text-2xl mr-3"></i>
                  <div>
                    <p className="text-green-100 text-sm">Aujourd'hui</p>
                    <p className="text-2xl font-bold">{formatDuration(metrics.totalToday)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-calendar-week text-2xl mr-3"></i>
                  <div>
                    <p className="text-blue-100 text-sm">Cette Semaine</p>
                    <p className="text-2xl font-bold">{formatDuration(metrics.totalWeek)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-calendar-alt text-2xl mr-3"></i>
                  <div>
                    <p className="text-purple-100 text-sm">Ce Mois</p>
                    <p className="text-2xl font-bold">{formatDuration(metrics.totalMonth)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-users text-2xl mr-3"></i>
                  <div>
                    <p className="text-orange-100 text-sm">Réunions Aujourd'hui</p>
                    <p className="text-2xl font-bold">{metrics.todayMeetings}</p>
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
                { id: 'timelogs', label: 'Time Logs', icon: 'fas fa-clock', count: timeLogs.length },
                { id: 'meetings', label: 'Réunions', icon: 'fas fa-users', count: meetings.length },
                { id: 'reports', label: 'Rapports', icon: 'fas fa-chart-bar', count: 0 }
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
                  placeholder="Rechercher projets, tâches, réunions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les projets</option>
                {Array.from(new Set(timeLogs.map(log => log.project))).map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
              
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="all">Toutes les périodes</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Trier par date</option>
                <option value="duration">Trier par durée</option>
                <option value="project">Trier par projet</option>
                <option value="task">Trier par tâche</option>
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
                if (activeTab === 'timelogs') setShowTimeLogModal(true);
                else if (activeTab === 'meetings') setShowMeetingModal(true);
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
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.task || item.title || 'Sans titre'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          {formatDate(item.date)}
                        </span>
                        {item.duration && (
                          <span className="font-medium text-blue-600">
                            <i className="fas fa-clock mr-1"></i>
                            {formatDuration(item.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.project && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectColor(item.project)}`}>
                          {item.project}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          if (activeTab === 'timelogs') setShowTimeLogModal(true);
                          else if (activeTab === 'meetings') setShowMeetingModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, activeTab === 'timelogs' ? 'timelog' : 'meeting')}
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
      <TimeEntryFormModal
        isOpen={showTimeLogModal}
        onClose={() => {
          setShowTimeLogModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingTimeLog={editingItem}
        projects={[]}
      />

      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Modifier la réunion' : 'Nouvelle réunion'}
            </h2>
            <p className="text-gray-600 mb-4">Formulaire de réunion à implémenter</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowMeetingModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowMeetingModal(false);
                  setEditingItem(null);
                  loadData();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingUltraModern;
