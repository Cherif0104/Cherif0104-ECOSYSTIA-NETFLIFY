import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Project, Task, Risk, User, TimeLog } from '../types';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import LogTimeModal from './LogTimeModal';
import ConfirmationModal from './common/ConfirmationModal';
import ProjectFormModal from './ProjectFormModal';
import TeamManagementModal from './TeamManagementModal';
import ProjectDetailModal from './ProjectDetailModal';

// Types pour Projects UltraModern
interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamMembers: number;
  averageProgress: number;
}

interface ProjectFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  dateRange: { start: string; end: string };
  assignedTo: string;
}


const ProjectsUltraModernV2: React.FC<{
  timeLogs: TimeLog[];
  onAddTimeLog: (logData: Omit<TimeLog, 'id' | 'userId'>) => void;
}> = ({ timeLogs, onAddTimeLog }) => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les filtres et recherche
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: { start: '', end: '' },
    assignedTo: 'all'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'priority' | 'progress' | 'endDate'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // États pour les modales
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Calcul des métriques
  const metrics: ProjectMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const overdueProjects = projects.filter(p => {
      if (p.status === 'Completed') return false;
      return new Date(p.endDate) < new Date();
    }).length;
    
    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) => 
      sum + p.tasks.filter(t => t.status === 'Done').length, 0
    );
    
    const teamMembers = new Set(projects.flatMap(p => p.team.map(m => m.id))).size;
    const averageProgress = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects 
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalTasks,
      completedTasks,
      teamMembers,
      averageProgress: Math.round(averageProgress)
    };
  }, [projects]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les projets et utilisateurs depuis Supabase uniquement
      const [projectsData, usersData] = await Promise.all([
        projectService.getAll(),
        userService.getAll()
      ]);
      
      setProjects(projectsData);
      setUsers(usersData);
      
      console.log(`✅ ${projectsData.length} projets et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setProjects([]);
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

  // Fonction d'export
  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      if (type === 'pdf') {
        await exportToPDF();
      } else if (type === 'excel') {
        await exportToExcel();
      }
    } catch (error) {
      console.error(`Erreur export ${type}:`, error);
      setError(`Erreur lors de l'export ${type.toUpperCase()}`);
    }
  };

  const exportToPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Rapport Projets ECOSYSTIA', 20, 30);
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);
    doc.text(`Utilisateur: ${user?.firstName || 'Non connecté'}`, 20, 50);
    
    // Métriques
    doc.setFontSize(16);
    doc.text('Métriques', 20, 70);
    
    const metricsData = [
      ['Total Projets', metrics.totalProjects.toString()],
      ['Projets Actifs', metrics.activeProjects.toString()],
      ['Projets Terminés', metrics.completedProjects.toString()],
      ['Projets En Retard', metrics.overdueProjects.toString()],
      ['Tâches Total', metrics.totalTasks.toString()],
      ['Tâches Terminées', metrics.completedTasks.toString()],
      ['Membres Équipe', metrics.teamMembers.toString()],
      ['Progression Moyenne', `${metrics.averageProgress}%`]
    ];
    
    autoTable(doc, {
      head: [['Métrique', 'Valeur']],
      body: metricsData,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });
    
    // Projets
    if (projects.length > 0) {
      doc.setFontSize(14);
      doc.text('Projets', 20, doc.lastAutoTable.finalY + 20);
      
      const projectsData = projects.map(project => [
        project.title,
        project.status,
        project.priority,
        `${project.progress}%`,
        new Date(project.endDate).toLocaleDateString('fr-FR'),
        project.team.length.toString()
      ]);
      
      autoTable(doc, {
        head: [['Titre', 'Statut', 'Priorité', 'Progression', 'Échéance', 'Équipe']],
        body: projectsData,
        startY: doc.lastAutoTable.finalY + 30,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 9 }
      });
    }
    
    const fileName = `projets-ecosystia-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      if (!XLSX.utils) {
        throw new Error('XLSX.utils non disponible');
      }
      
      // Métriques
      const metricsData = [
        ['Métrique', 'Valeur'],
        ['Total Projets', metrics.totalProjects],
        ['Projets Actifs', metrics.activeProjects],
        ['Projets Terminés', metrics.completedProjects],
        ['Projets En Retard', metrics.overdueProjects],
        ['Tâches Total', metrics.totalTasks],
        ['Tâches Terminées', metrics.completedTasks],
        ['Membres Équipe', metrics.teamMembers],
        ['Progression Moyenne (%)', metrics.averageProgress]
      ];
      
      const workbook = XLSX.utils.book_new();
      const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métriques');
      
      // Projets
      if (projects.length > 0) {
        const projectsData = [
          ['Titre', 'Description', 'Statut', 'Priorité', 'Progression (%)', 'Échéance', 'Budget', 'Client', 'Équipe', 'Tâches', 'Risques']
        ].concat(projects.map(project => [
          project.title,
          project.description || '',
          project.status,
          project.priority,
          project.progress,
          new Date(project.endDate).toLocaleDateString('fr-FR'),
          project.budget || 0,
          project.client || '',
          project.team.length,
          project.tasks.length,
          project.risks.length
        ]));
        
        const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
        XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projets');
      }
      
      const fileName = `projets-ecosystia-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      console.log('✅ Export Excel réussi');
    } catch (error) {
      console.error('❌ Erreur export Excel:', error);
      throw error;
    }
  };

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouveau Projet',
      icon: PlusIcon,
      onClick: () => {
        setEditingProject(null);
        setShowProjectModal(true);
      },
      color: 'blue'
    },
    {
      label: 'Gérer Équipes',
      icon: UserGroupIcon,
      onClick: () => {
        if (projects.length > 0) {
          setSelectedProject(projects[0]);
          setShowTeamModal(true);
        } else {
          alert('Aucun projet disponible pour gérer les équipes');
        }
      },
      color: 'green'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => {
        // Rediriger vers le module Analytics
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }));
      },
      color: 'purple'
    },
    {
      label: 'Exporter Données',
      icon: ArrowDownTrayIcon,
      onClick: () => handleExport('excel'),
      color: 'orange'
    }
  ];

  // Filtrage et tri des projets
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                           project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' || project.status === filters.status;
      const matchesPriority = filters.priority === 'all' || project.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || project.category === filters.category;
      
      const matchesDateRange = (!filters.dateRange.start || project.startDate >= filters.dateRange.start) &&
                              (!filters.dateRange.end || project.endDate <= filters.dateRange.end);
      
      const matchesAssignedTo = filters.assignedTo === 'all' || 
        project.team.some(member => member.id === filters.assignedTo);

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
             matchesDateRange && matchesAssignedTo;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, filters, sortBy, sortOrder]);

  // Gestion des projets
  const handleCreateProject = async (projectData: Project | Omit<Project, 'id'>) => {
    try {
      if (user?.id && 'id' in projectData) {
        // Mode édition
        const updatedProject = await projectService.update(projectData.id, projectData);
        if (updatedProject) {
          setProjects(prev => prev.map(p => p.id === projectData.id ? updatedProject : p));
          setShowProjectModal(false);
          setEditingProject(null);
          return;
        }
      } else if (user?.id) {
        // Mode création
        const savedProject = await projectService.create({
          ...projectData,
          tasks: [],
          risks: []
        }, user.id);
        
        if (savedProject) {
          setProjects(prev => [savedProject, ...prev]);
          setShowProjectModal(false);
          setEditingProject(null);
          return;
        }
      }
      
      // Fallback local
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        ...projectData,
        tasks: [],
        risks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProjects(prev => [newProject, ...prev]);
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Erreur création/modification projet:', error);
      setError('Erreur lors de la sauvegarde du projet');
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    await handleCreateProject(updatedProject);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (user?.id) {
      try {
        const success = await projectService.delete(projectId);
        if (success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          setShowDeleteModal(false);
          setSelectedProject(null);
          return;
        }
      } catch (error) {
        console.error('Erreur suppression projet:', error);
      }
    }
    
    // Fallback local
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Not Started': return 'Non démarré';
      case 'In Progress': return 'En cours';
      case 'Completed': return 'Terminé';
      case 'On Hold': return 'En attente';
      case 'Cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Obtenir la priorité en français
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'Low': return 'Faible';
      case 'Medium': return 'Moyenne';
      case 'High': return 'Élevée';
      case 'Critical': return 'Critique';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Chargement des projets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      {/* En-tête */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              Gestion des Projets
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez vos projets avec une interface moderne et intuitive
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl shadow-md hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all duration-300"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all duration-300"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 animate-fade-in">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Projets
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalProjects}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">
                  +{metrics.activeProjects} actifs
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Projets Actifs
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.activeProjects}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-blue-600">
                  {metrics.completedProjects} terminés
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <PlayIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Tâches Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalTasks}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-purple-600">
                  {metrics.completedTasks} terminées
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Progression Moy.
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.averageProgress}%
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-orange-600">
                  {metrics.teamMembers} membres
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
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
                placeholder="Rechercher des projets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="Not Started">Non démarré</option>
              <option value="In Progress">En cours</option>
              <option value="Completed">Terminé</option>
              <option value="On Hold">En attente</option>
              <option value="Cancelled">Annulé</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les priorités</option>
              <option value="Low">Faible</option>
              <option value="Medium">Moyenne</option>
              <option value="High">Élevée</option>
              <option value="Critical">Critique</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vue grille"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vue liste"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vue kanban"
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Projets ({filteredAndSortedProjects.length})
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Titre</option>
                <option value="status">Statut</option>
                <option value="priority">Priorité</option>
                <option value="progress">Progression</option>
                <option value="endDate">Date de fin</option>
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
            {filteredAndSortedProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {getPriorityLabel(project.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(project.endDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {project.team.length} membres
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setShowProjectModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Modifier le projet"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer le projet"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowLogTimeModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Enregistrer du temps"
                  >
                    <ClockIcon className="h-4 w-4 mr-1 inline" />
                    Temps
                  </button>
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
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {project.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {getPriorityLabel(project.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.team.length} membres
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setShowProjectModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Modifier le projet"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Supprimer le projet"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  Non démarrés ({filteredAndSortedProjects.filter(p => p.status === 'Not Started').length})
                </h3>
                <div className="space-y-3">
                  {filteredAndSortedProjects.filter(p => p.status === 'Not Started').map((project) => (
                    <div key={project.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-500">{project.category}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                  En cours ({filteredAndSortedProjects.filter(p => p.status === 'In Progress').length})
                </h3>
                <div className="space-y-3">
                  {filteredAndSortedProjects.filter(p => p.status === 'In Progress').map((project) => (
                    <div key={project.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-500">{project.category}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                  En attente ({filteredAndSortedProjects.filter(p => p.status === 'On Hold').length})
                </h3>
                <div className="space-y-3">
                  {filteredAndSortedProjects.filter(p => p.status === 'On Hold').map((project) => (
                    <div key={project.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-500">{project.category}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  Terminés ({filteredAndSortedProjects.filter(p => p.status === 'Completed').length})
                </h3>
                <div className="space-y-3">
                  {filteredAndSortedProjects.filter(p => p.status === 'Completed').map((project) => (
                    <div key={project.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-500">{project.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showProjectModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleCreateProject}
          users={users}
        />
      )}

      {showTeamModal && selectedProject && (
        <TeamManagementModal
          project={selectedProject}
          availableUsers={users}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedProject(null);
          }}
          onUpdate={handleUpdateProject}
        />
      )}

      {showDetailModal && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
          }}
          onEdit={(project) => {
            setEditingProject(project);
            setShowDetailModal(false);
            setShowProjectModal(true);
          }}
          onDelete={(projectId) => {
            setShowDetailModal(false);
            setSelectedProject(null);
            handleDeleteProject(projectId);
          }}
          onManageTeam={(project) => {
            setSelectedProject(project);
            setShowDetailModal(false);
            setShowTeamModal(true);
          }}
          canManage={true}
        />
      )}

      {showLogTimeModal && selectedProject && (
        <LogTimeModal
          onClose={() => {
            setShowLogTimeModal(false);
            setSelectedProject(null);
          }}
          onSave={onAddTimeLog}
          projects={projects}
          courses={[]}
          user={user!}
          initialEntity={{ type: 'project', id: selectedProject.id }}
        />
      )}

      {showDeleteModal && selectedProject && (
        <ConfirmationModal
          title="Supprimer le projet"
          message={`Êtes-vous sûr de vouloir supprimer le projet "${selectedProject.title}" ? Cette action est irréversible.`}
          onConfirm={() => handleDeleteProject(selectedProject.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsUltraModernV2;
