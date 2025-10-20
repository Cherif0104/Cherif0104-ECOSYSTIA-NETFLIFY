import React, { useState, useEffect, useMemo } from 'react';
import { 
  FlagIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Objective, KeyResult, User } from '../types';
import { goalsService } from '../services/goalsService';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import ObjectiveFormModal from './forms/ObjectiveFormModal';
import ConfirmationModal from './common/ConfirmationModal';
import AnalyticsModal from './common/AnalyticsModal';
import TeamManagementModal from './TeamManagementModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types pour Goals UltraModern
interface GoalsMetrics {
  totalObjectives: number;
  completedObjectives: number;
  inProgressObjectives: number;
  overdueObjectives: number;
  totalKeyResults: number;
  completedKeyResults: number;
  averageProgress: number;
  teamMembers: number;
}

interface GoalsFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  dateRange: { start: string; end: string };
  assignedTo: string;
}


const kanbanColumns = [
  { id: 'Not Started', title: 'Non démarré' },
  { id: 'In Progress', title: 'En cours' },
  { id: 'On Hold', title: 'En attente' },
  { id: 'Completed', title: 'Terminé' },
];

// KanbanCard component
const KanbanCard = ({ objective }: { objective: Objective }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: objective.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg border mb-3"
    >
      <h4 className="font-medium text-gray-900">{objective.title}</h4>
      <p className="text-sm text-gray-500">{objective.category}</p>
    </div>
  );
};

// KanbanColumn component
const KanbanColumn = ({ id, title, objectives }: { id: string, title: string, objectives: Objective[] }) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
        {title} ({objectives.length})
      </h3>
      <SortableContext items={objectives.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {objectives.map(objective => (
            <KanbanCard key={objective.id} objective={objective} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const GoalsUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et recherche
  const [filters, setFilters] = useState<GoalsFilters>({
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
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // États pour les nouvelles fonctionnalités
  const [users, setUsers] = useState<User[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedObjectives = await goalsService.getAll();
      setObjectives(fetchedObjectives);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des objectifs.");
      console.error(err);
      setObjectives([]);
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

  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  // Calcul des métriques
  const metrics: GoalsMetrics = useMemo(() => {
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(o => o.status === 'Completed').length;
    const inProgressObjectives = objectives.filter(o => o.status === 'In Progress').length;
    const overdueObjectives = objectives.filter(o => {
      if (o.status === 'Completed') return false;
      return new Date(o.endDate) < new Date();
    }).length;
    
    const totalKeyResults = objectives.reduce((sum, o) => sum + o.keyResults.length, 0);
    const completedKeyResults = objectives.reduce((sum, o) => 
      sum + o.keyResults.filter(kr => kr.progress >= 100).length, 0
    );
    
    const teamMembers = new Set(objectives.flatMap(o => o.team)).size;
    const averageProgress = totalObjectives > 0 
      ? objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives 
      : 0;

    return {
      totalObjectives,
      completedObjectives,
      inProgressObjectives,
      overdueObjectives,
      totalKeyResults,
      completedKeyResults,
      averageProgress: Math.round(averageProgress),
      teamMembers
    };
  }, [objectives]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvel Objectif',
      icon: PlusIcon,
      onClick: () => {
        setEditingObjective(null);
        setShowObjectiveModal(true);
      },
      color: 'blue'
    },
    {
      label: 'Gérer Équipes',
      icon: UserGroupIcon,
      onClick: () => {
        if (objectives.length > 0) {
          setSelectedObjective(objectives[0]);
          setShowTeamModal(true);
        }
      },
      color: 'green'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => setShowAnalyticsModal(true),
      color: 'purple'
    },
    {
      label: 'Exporter Données',
      icon: ArrowDownTrayIcon,
      onClick: () => exportToPDF(filteredAndSortedObjectives),
      color: 'red'
    },
    {
      label: 'Rapport Trimestriel',
      icon: CalendarIcon,
      onClick: () => generateQuarterlyReport(),
      color: 'orange'
    }
  ];

  // Filtrage et tri des objectifs
  const filteredAndSortedObjectives = useMemo(() => {
    let filtered = objectives.filter(objective => {
      const matchesSearch = objective.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                           objective.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                           objective.category.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || objective.status === filters.status;
      const matchesPriority = filters.priority === 'all' || objective.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || objective.category === filters.category;
      
      const matchesDateRange = (!filters.dateRange.start || objective.startDate >= filters.dateRange.start) &&
                              (!filters.dateRange.end || objective.endDate <= filters.dateRange.end);
      
      const matchesAssignedTo = filters.assignedTo === 'all' || 
        objective.team.includes(filters.assignedTo);

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
  }, [objectives, filters, sortBy, sortOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeObjective = objectives.find(o => o.id === activeId);
    if (!activeObjective) return;

    // Find the container of the 'over' element
    const overContainerId = over.data.current?.sortable.containerId || over.id;
    
    if (kanbanColumns.some(c => c.id === overContainerId) && activeObjective.status !== overContainerId) {
      // Dropped in a new column
      const updatedObjective = { ...activeObjective, status: overContainerId };
      handleUpdateObjective(updatedObjective);
    } else {
      // Reorder within the same column
      const activeIndex = objectives.findIndex(o => o.id === activeId);
      const overIndex = objectives.findIndex(o => o.id === overId);
      if (activeIndex !== -1 && overIndex !== -1 && objectives[activeIndex].status === objectives[overIndex].status) {
        setObjectives(items => arrayMove(items, activeIndex, overIndex));
      }
    }
  };

  // Gestion des objectifs
  const handleCreateObjective = async (objectiveData: Omit<Objective, 'id' | 'keyResults'>) => {
    if (user?.id) {
      try {
        const savedObjective = await okrService.createObjective({
          ...objectiveData,
          keyResults: []
        });
        
        if (savedObjective) {
          setObjectives(prev => [savedObjective, ...prev]);
          setShowObjectiveModal(false);
          return;
        }
      } catch (error) {
        console.error('Erreur création objectif:', error);
      }
    }
    
    // Fallback local
    const newObjective: Objective = {
      id: `obj-${Date.now()}`,
      ...objectiveData,
      keyResults: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setObjectives(prev => [newObjective, ...prev]);
    setShowObjectiveModal(false);
  };

  const handleUpdateObjective = async (updatedObjective: Objective) => {
    if (user?.id && typeof updatedObjective.id === 'string') {
      try {
        const success = await okrService.updateObjective(updatedObjective.id, updatedObjective);
        if (success) {
          setObjectives(prev => prev.map(o => o.id === updatedObjective.id ? updatedObjective : o));
          setEditingObjective(null);
          setShowObjectiveModal(false);
          return;
        }
      } catch (error) {
        console.error('Erreur mise à jour objectif:', error);
      }
    }
    
    // Fallback local
    setObjectives(prev => prev.map(o => o.id === updatedObjective.id ? updatedObjective : o));
    setEditingObjective(null);
    setShowObjectiveModal(false);
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (user?.id) {
      try {
        const success = await okrService.deleteObjective(objectiveId);
        if (success) {
          setObjectives(prev => prev.filter(o => o.id !== objectiveId));
          setShowDeleteModal(false);
          setSelectedObjective(null);
          return;
        }
      } catch (error) {
        console.error('Erreur suppression objectif:', error);
      }
    }
    
    // Fallback local
    setObjectives(prev => prev.filter(o => o.id !== objectiveId));
    setShowDeleteModal(false);
    setSelectedObjective(null);
  };

  const exportToCSV = (objectivesToExport: Objective[]) => {
    const headers = [
      'ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 
      'Start Date', 'End Date', 'Progress', 'Owner', 'Team', 
      'Key Result ID', 'Key Result Title', 'Key Result Target', 'Key Result Current', 'Key Result Progress'
    ];

    const rows = objectivesToExport.flatMap(o => {
      if (o.keyResults.length === 0) {
        return [[
          o.id, o.title, o.description, o.category, o.priority, o.status,
          o.startDate, o.endDate, o.progress, o.owner, o.team.join('; '),
          '', '', '', '', ''
        ]];
      }
      return o.keyResults.map(kr => [
        o.id, o.title, o.description, o.category, o.priority, o.status,
        o.startDate, o.endDate, o.progress, o.owner, o.team.join('; '),
        kr.id, kr.title, kr.target, kr.current, kr.progress
      ]);
    });

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "okrs_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (objectivesToExport: Objective[]) => {
    const doc = new jsPDF();

    doc.text("OKRs Export", 14, 16);

    const head = [['ID', 'Title', 'Status', 'Progress', 'Owner']];
    const body = objectivesToExport.map(o => [
      o.id,
      o.title,
      o.status,
      `${o.progress}%`,
      o.owner
    ]);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 20,
    });

    doc.save('okrs_export.pdf');
  };

  const generateQuarterlyReport = () => {
    const doc = new jsPDF();
    const today = new Date();
    const quarter = Math.floor((today.getMonth() + 3) / 3);
    const year = today.getFullYear();

    doc.text(`Rapport Trimestriel - Q${quarter} ${year}`, 14, 16);

    doc.text("Résumé des métriques", 14, 30);
    autoTable(doc, {
      body: [
        ['Total Objectifs', metrics.totalObjectives],
        ['Objectifs Terminés', metrics.completedObjectives],
        ['Objectifs en cours', metrics.inProgressObjectives],
        ['Objectifs en retard', metrics.overdueObjectives],
        ['Progression moyenne', `${metrics.averageProgress}%`],
      ],
      startY: 35,
    });

    const lastQuarterObjectives = objectives.filter(o => {
        const endDate = new Date(o.endDate);
        const endQuarter = Math.floor((endDate.getMonth() + 3) / 3);
        const endYear = endDate.getFullYear();
        return endYear === year && endQuarter === quarter;
    });
    
    const completedThisQuarter = lastQuarterObjectives.filter(o => o.status === 'Completed');
    const inProgressThisQuarter = lastQuarterObjectives.filter(o => o.status === 'In Progress');
    const overdueThisQuarter = lastQuarterObjectives.filter(o => new Date(o.endDate) < today && o.status !== 'Completed');

    let finalY = (doc as any).lastAutoTable.finalY || 60;

    if (completedThisQuarter.length > 0) {
        doc.text("Objectifs terminés ce trimestre", 14, finalY + 10);
        autoTable(doc, {
            head: [['Titre', 'Progrès', 'Propriétaire']],
            body: completedThisQuarter.map(o => [o.title, `${o.progress}%`, o.owner]),
            startY: finalY + 15,
        });
        finalY = (doc as any).lastAutoTable.finalY;
    }

    if (inProgressThisQuarter.length > 0) {
        doc.text("Objectifs en cours ce trimestre", 14, finalY + 10);
        autoTable(doc, {
            head: [['Titre', 'Progrès', 'Propriétaire']],
            body: inProgressThisQuarter.map(o => [o.title, `${o.progress}%`, o.owner]),
            startY: finalY + 15,
        });
        finalY = (doc as any).lastAutoTable.finalY;
    }
    
    if (overdueThisQuarter.length > 0) {
        doc.text("Objectifs en retard ce trimestre", 14, finalY + 10);
        autoTable(doc, {
            head: [['Titre', 'Progrès', 'Propriétaire']],
            body: overdueThisQuarter.map(o => [o.title, `${o.progress}%`, o.owner]),
            startY: finalY + 15,
        });
    }

    doc.save(`rapport_trimestriel_Q${quarter}_${year}.pdf`);
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
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-4 text-lg font-medium text-gray-700">Chargement des objectifs...</span>
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
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Goals & OKRs
            </h1>
            <p className="text-gray-600">
              Gérez vos objectifs et résultats clés avec une interface moderne
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Objectifs
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalObjectives}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">
                  +{metrics.inProgressObjectives} en cours
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FlagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Objectifs Terminés
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.completedObjectives}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-blue-600">
                  {metrics.overdueObjectives} en retard
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Key Results Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalKeyResults}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-purple-600">
                  {metrics.completedKeyResults} terminés
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
                placeholder="Rechercher des objectifs..."
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
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vue liste"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vue kanban"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des objectifs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Objectifs ({filteredAndSortedObjectives.length})
            </h2>
            <div className="flex items-center gap-2">
              {/* Boutons de vue */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue grille"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue liste"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'kanban' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue kanban"
                >
                  <TableCellsIcon className="h-4 w-4" />
                </button>
              </div>
              
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
            {filteredAndSortedObjectives.map((objective) => (
              <div key={objective.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {objective.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {objective.description}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
                        {getStatusLabel(objective.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(objective.priority)}`}>
                        {getPriorityLabel(objective.priority)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{objective.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${objective.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Results ({objective.keyResults.length})</h4>
                  <div className="space-y-2">
                    {objective.keyResults.slice(0, 2).map((kr) => (
                      <div key={kr.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate">{kr.title}</span>
                        <span className="text-gray-900 font-medium">{kr.progress}%</span>
                      </div>
                    ))}
                    {objective.keyResults.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{objective.keyResults.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(objective.endDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {objective.team.length} membres
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedObjective(objective);
                        // setShowDetailModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
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
                        setSelectedObjective(objective);
                        setShowAnalyticsModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Voir Analytics"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingObjective(objective);
                        setShowObjectiveModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
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
                  
                  <div className="text-xs text-gray-500">
                    {objective.owner}
                  </div>
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
                    Objectif
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
                    Key Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propriétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedObjectives.map((objective) => (
                  <tr key={objective.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {objective.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {objective.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
                        {getStatusLabel(objective.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(objective.priority)}`}>
                        {getPriorityLabel(objective.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${objective.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{objective.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {objective.keyResults.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {objective.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedObjective(objective);
                            // setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
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
                            setSelectedObjective(objective);
                            setShowAnalyticsModal(true);
                          }}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                          title="Voir Analytics"
                        >
                          <ChartBarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingObjective(objective);
                            setShowObjectiveModal(true);
                          }}
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
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
        ) : ( // Kanban view
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <SortableContext items={kanbanColumns.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {kanbanColumns.map(column => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    objectives={filteredAndSortedObjectives.filter(o => o.status === column.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>

      {/* Modales */}
      {showObjectiveModal && (
        <ObjectiveFormModal
          objective={editingObjective}
          onClose={() => {
            setShowObjectiveModal(false);
            setEditingObjective(null);
          }}
          onSave={editingObjective ? handleUpdateObjective : handleCreateObjective}
        />
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
          message={`Êtes-vous sûr de vouloir supprimer l'objectif "${selectedObjective.title}" ? Cette action est irréversible.`}
        />
      )}

      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        metrics={metrics}
      />

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
            // Mettre à jour la liste des objectifs avec les nouveaux membres d'équipe
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

export default GoalsUltraModernV2;
