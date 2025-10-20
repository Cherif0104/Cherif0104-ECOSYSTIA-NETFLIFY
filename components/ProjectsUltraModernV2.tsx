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
  ExclamationCircleIcon,
  CheckIcon
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

const ProjectsUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // États pour les filtres et vues
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    dateRange: { start: '', end: '' },
    assignedTo: ''
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
      
      console.log('🔍 Debug - User ID:', user?.id);
      console.log('🔍 Debug - User object:', user);
      
      // Charger les projets et utilisateurs depuis Supabase (temporairement sans filtrage strict)
      const [projectsData, usersData] = await Promise.all([
        projectService.getAll(), // Récupérer tous les projets pour l'instant
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
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Titre
      doc.setFontSize(20);
      doc.text('Rapport des Projets', 14, 22);
      
      // Données des projets
      const tableData = projects.map(project => [
        project.title,
        project.status,
        project.priority,
        project.endDate || 'N/A',
        project.budget ? `${project.budget.toLocaleString()} FCFA` : 'N/A',
        project.progress ? `${project.progress}%` : '0%'
      ]);
      
      autoTable(doc, {
        head: [['Titre', 'Statut', 'Priorité', 'Date de fin', 'Budget', 'Progression']],
        body: tableData,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [79, 70, 229] }
      });
      
      doc.save('rapport-projets.pdf');
      console.log('✅ Export PDF réussi');
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      throw error;
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      if (!XLSX.utils) {
        throw new Error('XLSX.utils non disponible');
      }
      
      const worksheetData = [
        ['Titre', 'Statut', 'Priorité', 'Date de fin', 'Budget', 'Progression'],
        ...projects.map(project => [
          project.title,
          project.status,
          project.priority,
          project.endDate || 'N/A',
          project.budget || 0,
          project.progress || 0
        ])
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Projets');
      
      XLSX.writeFile(workbook, 'rapport-projets.xlsx');
      console.log('✅ Export Excel réussi');
    } catch (error) {
      console.error('❌ Erreur export Excel:', error);
      throw error;
    }
  };

  // Calculer les métriques
  const metrics: ProjectMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const overdueProjects = projects.filter(p => {
      if (!p.endDate) return false;
      return new Date(p.endDate) < new Date() && p.status !== 'Completed';
    }).length;
    
    const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
    const completedTasks = projects.reduce((sum, p) => 
      sum + (p.tasks?.filter(t => t.status === 'Done').length || 0), 0
    );
    
    const uniqueTeamMembers = new Set(
      projects.flatMap(p => p.team?.map(m => m.id) || [])
    ).size;
    
    const averageProgress = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects 
      : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalTasks,
      completedTasks,
      teamMembers: uniqueTeamMembers,
      averageProgress: Math.round(averageProgress)
    };
  }, [projects]);

  // Filtrer et trier les projets
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = !filters.search || 
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || project.status === filters.status;
      const matchesPriority = !filters.priority || project.priority === filters.priority;
      const matchesCategory = !filters.category || project.category === filters.category;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
    
    // Trier
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Project];
      let bValue: any = b[sortBy as keyof Project];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
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
  }, [projects, filters, sortBy, sortOrder]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouveau Projet',
      icon: PlusIcon,
      onClick: () => {
        setEditingProject(null);
        setShowProjectModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Gérer Équipes',
      icon: UserGroupIcon,
      onClick: () => {
        if (projects.length > 0) {
          setSelectedProject(projects[0]);
          setShowTeamModal(true);
        }
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
    },
    {
      label: 'Exporter Données',
      icon: ArrowDownTrayIcon,
      onClick: () => handleExport('excel'),
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  // Gestion des projets
  const handleCreateProject = async (projectData: Project | Omit<Project, 'id'>) => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      let result: Project | null = null;
      
      if ('id' in projectData && projectData.id) {
        // Mise à jour
        result = await projectService.update(projectData.id, projectData);
      } else {
        // Création - le service récupère automatiquement l'owner_id
        result = await projectService.create(projectData as Omit<Project, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowProjectModal(false);
        setEditingProject(null);
        console.log('✅ Projet sauvegardé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde projet:', error);
      setError('Erreur lors de la sauvegarde du projet');
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      const success = await projectService.delete(selectedProject.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setSelectedProject(null);
        console.log('✅ Projet supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      setError('Erreur lors de la suppression du projet');
    }
  };

  // Gestion des tâches
  const handleCreateTask = async (projectId: string, taskData: Omit<Task, 'id'>) => {
    try {
      const updatedProject = await projectService.addTask(projectId, taskData);
      if (updatedProject) {
        await loadData();
        console.log('✅ Tâche créée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Erreur lors de la création de la tâche');
    }
  };

  const handleUpdateTask = async (projectId: string, taskId: string, taskData: Partial<Task>) => {
    try {
      const updatedProject = await projectService.updateTask(projectId, taskId, taskData);
      if (updatedProject) {
        await loadData();
        console.log('✅ Tâche mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      setError('Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleDeleteTask = async (projectId: string, taskId: string) => {
    try {
      const updatedProject = await projectService.deleteTask(projectId, taskId);
      if (updatedProject) {
        await loadData();
        console.log('✅ Tâche supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  // Gestion des risques
  const handleCreateRisk = async (projectId: string, riskData: Omit<Risk, 'id'>) => {
    try {
      const updatedProject = await projectService.addRisk(projectId, riskData);
      if (updatedProject) {
        await loadData();
        console.log('✅ Risque créé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur création risque:', error);
      setError('Erreur lors de la création du risque');
    }
  };

  const handleUpdateRisk = async (projectId: string, riskId: string, riskData: Partial<Risk>) => {
    try {
      const updatedProject = await projectService.updateRisk(projectId, riskId, riskData);
      if (updatedProject) {
        await loadData();
        console.log('✅ Risque mis à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour risque:', error);
      setError('Erreur lors de la mise à jour du risque');
    }
  };

  const handleDeleteRisk = async (projectId: string, riskId: string) => {
    try {
      const updatedProject = await projectService.deleteRisk(projectId, riskId);
      if (updatedProject) {
        await loadData();
        console.log('✅ Risque supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression risque:', error);
      setError('Erreur lors de la suppression du risque');
    }
  };

  // Gestion de l'équipe
  const handleAddTeamMember = async (projectId: string, userId: string) => {
    try {
      const updatedProject = await projectService.addTeamMember(projectId, userId);
      if (updatedProject) {
        await loadData();
        console.log('✅ Membre d\'équipe ajouté avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur ajout membre équipe:', error);
      setError('Erreur lors de l\'ajout du membre d\'équipe');
    }
  };

  const handleRemoveTeamMember = async (projectId: string, userId: string) => {
    try {
      const updatedProject = await projectService.removeTeamMember(projectId, userId);
      if (updatedProject) {
        await loadData();
        console.log('✅ Membre d\'équipe supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression membre équipe:', error);
      setError('Erreur lors de la suppression du membre d\'équipe');
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Projets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos projets et équipes de manière efficace
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
            <FolderIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Projets</p>
              <p className="text-2xl font-bold">{metrics.totalProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">En Cours</p>
              <p className="text-2xl font-bold">{metrics.activeProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Terminés</p>
              <p className="text-2xl font-bold">{metrics.completedProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">En Retard</p>
              <p className="text-2xl font-bold">{metrics.overdueProjects}</p>
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

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="Not Started">Non démarré</option>
              <option value="In Progress">En cours</option>
              <option value="Completed">Terminé</option>
              <option value="On Hold">En pause</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les priorités</option>
              <option value="Low">Faible</option>
              <option value="Medium">Moyenne</option>
              <option value="High">Élevée</option>
              <option value="Critical">Critique</option>
            </select>
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
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vue kanban"
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length === 0 
              ? "Commencez par créer votre premier projet."
              : "Aucun projet ne correspond à vos critères de recherche."
            }
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setEditingProject(null);
                setShowProjectModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau Projet
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredAndSortedProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    </div>
                    <div className="ml-4 flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setShowProjectModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.priority === 'High' ? 'bg-red-100 text-red-800' :
                      project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    {project.startDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {project.dueDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>Fin: {new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {project.client && (
                      <div className="flex items-center">
                        <UserGroupIcon className="h-3 w-3 mr-1" />
                        <span>Client: {project.client}</span>
                      </div>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="mr-1">Tags:</span>
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-gray-400">+{project.tags.length - 3}</span>
                        )}
                      </div>
                    )}
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FolderIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.priority === 'High' ? 'bg-red-100 text-red-800' :
                          project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(project.team_members || []).length} membre(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setShowProjectModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
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

          {viewMode === 'kanban' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Colonne "À faire" */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                    À faire
                  </h3>
                  <div className="space-y-3">
                    {filteredAndSortedProjects
                      .filter(project => project.status === 'Not Started' || project.status === 'Planning')
                      .map((project) => (
                        <div key={project.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              project.priority === 'High' ? 'bg-red-100 text-red-800' :
                              project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {project.priority}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowDetailModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Voir détails"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setShowProjectModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Colonne "En cours" */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    En cours
                  </h3>
                  <div className="space-y-3">
                    {filteredAndSortedProjects
                      .filter(project => project.status === 'In Progress')
                      .map((project) => (
                        <div key={project.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                              <span>Progression</span>
                              <span>{project.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              project.priority === 'High' ? 'bg-red-100 text-red-800' :
                              project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {project.priority}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowDetailModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Voir détails"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setShowProjectModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Colonne "Terminé" */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Terminé
                  </h3>
                  <div className="space-y-3">
                    {filteredAndSortedProjects
                      .filter(project => project.status === 'Completed')
                      .map((project) => (
                        <div key={project.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Terminé
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowDetailModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Voir détails"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setShowProjectModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {showProjectModal && (
        <ProjectFormModal
          project={editingProject}
          users={users}
          onSave={handleCreateProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
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
          onUpdate={(updatedProject) => {
            // Mettre à jour la liste des projets
            setProjects(prevProjects => 
              prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
            );
            setSelectedProject(updatedProject);
          }}
        />
      )}

      {showDetailModal && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {showLogTimeModal && selectedProject && (
        <LogTimeModal
          project={selectedProject}
          onClose={() => {
            setShowLogTimeModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {showDeleteModal && selectedProject && (
        <ConfirmationModal
          title="Supprimer le projet"
          message={`Êtes-vous sûr de vouloir supprimer le projet "${selectedProject.title}" ? Cette action est irréversible.`}
          onConfirm={handleDeleteProject}
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
