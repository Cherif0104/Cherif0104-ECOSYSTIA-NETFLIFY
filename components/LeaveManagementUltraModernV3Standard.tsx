/**
 * 🏖️ LEAVE MANAGEMENT ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture 100% identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
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
  CheckIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { LeaveRequest, User, Project } from '../types';
import { leaveManagementService } from '../services/leaveManagementService';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import ConfirmationModal from './common/ConfirmationModal';
import LeaveRequestFormModalV3 from './forms/LeaveRequestFormModalV3';

// Types pour Leave Management UltraModern
interface LeaveMetrics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDays: number;
  averageDuration: number;
  teamMembers: number;
  approvalRate: number;
}

interface LeaveFilters {
  search: string;
  status: string;
  leaveType: string;
  projectId: string;
  dateRange: { start: string; end: string };
  employeeId: string;
}

const LeaveManagementUltraModernV3Standard: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [deletingLeaveRequest, setDeletingLeaveRequest] = useState<LeaveRequest | null>(null);
  
  // États pour les filtres et vues
  const [filters, setFilters] = useState<LeaveFilters>({
    search: '',
    status: '',
    leaveType: '',
    projectId: '',
    dateRange: { start: '', end: '' },
    employeeId: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
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
      
      console.log('🔄 Chargement des demandes de congé...');
      
      // Charger les demandes, projets et utilisateurs depuis Supabase
      const [leaveRequestsData, projectsData, usersData] = await Promise.all([
        leaveManagementService.getAll(), // Récupérer toutes les demandes pour l'instant
        projectService.getAll(), // Récupérer tous les projets
        userService.getAll()
      ]);
      
      setLeaveRequests(leaveRequestsData);
      setProjects(projectsData);
      setUsers(usersData);
      
      console.log(`✅ ${leaveRequestsData.length} demandes, ${projectsData.length} projets et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setLeaveRequests([]);
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

  // Fonction pour récupérer le nom du projet
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Projet non trouvé';
  };

  // Calculer les métriques
  const metrics = useMemo((): LeaveMetrics => {
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;
    
    const totalDays = leaveRequests.reduce((sum, req) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return sum + diffDays;
    }, 0);
    
    const averageDuration = totalRequests > 0 ? totalDays / totalRequests : 0;
    const teamMembers = users.length;
    const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalDays,
      averageDuration,
      teamMembers,
      approvalRate
    };
  }, [leaveRequests, users]);

  // Logique de filtrage et recherche
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter(request => {
      const matchesSearch = !filters.search || 
        getEmployeeName(request.employeeId).toLowerCase().includes(filters.search.toLowerCase()) ||
        request.leaveType.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.reason?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || request.status === filters.status;
      const matchesLeaveType = !filters.leaveType || request.leaveType === filters.leaveType;
      const matchesProject = !filters.projectId || request.projectId === filters.projectId;
      const matchesEmployee = !filters.employeeId || request.employeeId === filters.employeeId;
      
      const matchesDateRange = !filters.dateRange.start || !filters.dateRange.end || 
        (new Date(request.startDate) >= new Date(filters.dateRange.start) && 
         new Date(request.startDate) <= new Date(filters.dateRange.end));
      
      return matchesSearch && matchesStatus && matchesLeaveType && matchesProject && matchesEmployee && matchesDateRange;
    });
  }, [leaveRequests, filters, users]);

  // Tri des demandes
  const sortedLeaveRequests = useMemo(() => {
    return [...filteredLeaveRequests].sort((a, b) => {
      let aValue: any = a[sortBy as keyof LeaveRequest];
      let bValue: any = b[sortBy as keyof LeaveRequest];
      
      if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredLeaveRequests, sortBy, sortOrder]);

  // Fonctions CRUD
  const handleCreateLeaveRequest = async (leaveRequestData: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdRequest = await leaveManagementService.create(leaveRequestData);
      if (createdRequest) {
        setLeaveRequests(prev => [createdRequest, ...prev]);
        console.log('✅ Demande de congé créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      setError('Erreur lors de la création de la demande de congé');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeaveRequest = async (id: string, leaveRequestData: Partial<LeaveRequest>) => {
    try {
      setLoading(true);
      const updatedRequest = await leaveManagementService.update(id, leaveRequestData);
      if (updatedRequest) {
        setLeaveRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
        console.log('✅ Demande de congé mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour demande:', error);
      setError('Erreur lors de la mise à jour de la demande de congé');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaveRequest = async (id: string) => {
    try {
      setLoading(true);
      await leaveManagementService.delete(id);
      setLeaveRequests(prev => prev.filter(req => req.id !== id));
      console.log('✅ Demande de congé supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression demande:', error);
      setError('Erreur lors de la suppression de la demande de congé');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLeaveRequest) return;
    
    try {
      await handleDeleteLeaveRequest(deletingLeaveRequest.id);
      setShowDeleteModal(false);
      setDeletingLeaveRequest(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  const handleValidateRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const updatedRequest = await leaveManagementService.validateRequest(requestId, user.id, action);
      if (updatedRequest) {
        setLeaveRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
        console.log(`✅ Demande ${action === 'approve' ? 'validée' : 'rejetée'} avec succès`);
      }
    } catch (error) {
      console.error(`❌ Erreur ${action} demande:`, error);
      setError(`Erreur lors du ${action === 'approve' ? 'validation' : 'rejet'} de la demande`);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const getEmployeeName = (employeeId: string) => {
    const employee = users.find(u => u.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Utilisateur inconnu';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4" />;
      case 'cancelled': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'annual': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'maternity': return 'bg-pink-100 text-pink-800';
      case 'paternity': return 'bg-indigo-100 text-indigo-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeLabel = (leaveType: string) => {
    switch (leaveType) {
      case 'annual': return 'Congés annuels';
      case 'sick': return 'Congés maladie';
      case 'personal': return 'Congés personnels';
      case 'maternity': return 'Congé maternité';
      case 'paternity': return 'Congé paternité';
      case 'other': return 'Autre';
      default: return leaveType;
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des demandes de congé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Congés</h1>
              <p className="text-gray-600">Demandes de congé et suivi des absences</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingLeaveRequest(null);
                  setShowLeaveModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvelle Demande
              </button>
              {user?.role && ['manager', 'administrator', 'super_administrator'].includes(user.role) && (
                <button
                  onClick={() => {
                    setEditingLeaveRequest(null);
                    setShowLeaveModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Demande Manuelle
                </button>
              )}
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Demandes</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.pendingRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approuvées</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.approvedRequests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Jours</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et contrôles */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvée</option>
                <option value="rejected">Rejetée</option>
                <option value="cancelled">Annulée</option>
              </select>

              <select
                value={filters.leaveType}
                onChange={(e) => setFilters(prev => ({ ...prev, leaveType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="annual">Congés annuels</option>
                <option value="sick">Congés maladie</option>
                <option value="personal">Congés personnels</option>
                <option value="maternity">Congé maternité</option>
                <option value="paternity">Congé paternité</option>
                <option value="other">Autre</option>
              </select>

              <select
                value={filters.projectId}
                onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les projets</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>

              <select
                value={filters.employeeId}
                onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les employés</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Plus récent</option>
                <option value="createdAt-asc">Plus ancien</option>
                <option value="startDate-asc">Date début (proche)</option>
                <option value="startDate-desc">Date début (lointaine)</option>
                <option value="status-asc">Statut A-Z</option>
                <option value="status-desc">Statut Z-A</option>
              </select>
            </div>

            {/* Vues */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
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
                <p className="text-sm text-red-700 mt-1">{errorState}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des demandes */}
        {sortedLeaveRequests.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.leaveType || filters.employeeId
                ? 'Aucune demande ne correspond aux filtres appliqués.'
                : 'Commencez par créer votre première demande de congé.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingLeaveRequest(null);
                  setShowLeaveModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer une demande
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedLeaveRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {getEmployeeName(request.employeeId)}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {getLeaveTypeLabel(request.leaveType)} • {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </p>
                        {request.projectId && (
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📁 {getProjectName(request.projectId)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(request.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {request.reason || 'Aucune raison spécifiée'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingLeaveRequest(request);
                            setShowLeaveModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Modifier
                        </button>
                        {request.status === 'pending' && user?.role && ['manager', 'administrator', 'super_administrator'].includes(user.role) && (
                          <>
                            <button
                              onClick={() => handleValidateRequest(request.id, 'approve')}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Valider
                            </button>
                            <button
                              onClick={() => handleValidateRequest(request.id, 'reject')}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                            >
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Rejeter
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setDeletingLeaveRequest(request);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                        {getLeaveTypeLabel(request.leaveType)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Période
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raison
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedLeaveRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getEmployeeName(request.employeeId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                              {getLeaveTypeLabel(request.leaveType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {request.projectId ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                📁 {getProjectName(request.projectId)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Aucun projet</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.reason || 'Aucune raison'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingLeaveRequest(request);
                                  setShowLeaveModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              {request.status === 'pending' && user?.role && ['manager', 'administrator', 'super_administrator'].includes(user.role) && (
                                <>
                                  <button
                                    onClick={() => handleValidateRequest(request.id, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Valider
                                  </button>
                                  <button
                                    onClick={() => handleValidateRequest(request.id, 'reject')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Rejeter
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setDeletingLeaveRequest(request);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Période
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raison
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedLeaveRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getEmployeeName(request.employeeId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                              {getLeaveTypeLabel(request.leaveType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {request.projectId ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                📁 {getProjectName(request.projectId)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Aucun projet</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.reason || 'Aucune raison'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingLeaveRequest(request);
                                  setShowLeaveModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              {request.status === 'pending' && user?.role && ['manager', 'administrator', 'super_administrator'].includes(user.role) && (
                                <>
                                  <button
                                    onClick={() => handleValidateRequest(request.id, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Valider
                                  </button>
                                  <button
                                    onClick={() => handleValidateRequest(request.id, 'reject')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Rejeter
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setDeletingLeaveRequest(request);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <LeaveRequestFormModalV3
        isOpen={showLeaveModal}
        onClose={() => {
          setShowLeaveModal(false);
          setEditingLeaveRequest(null);
        }}
        onSubmit={editingLeaveRequest ? 
          (data) => handleUpdateLeaveRequest(editingLeaveRequest.id, data) : 
          handleCreateLeaveRequest
        }
        leaveRequest={editingLeaveRequest}
        users={users}
        projects={projects}
        currentUserId={user?.id}
        currentUserRole={user?.role}
      />

      {showDeleteModal && deletingLeaveRequest && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingLeaveRequest(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer la demande"
          message={`Êtes-vous sûr de vouloir supprimer la demande de congé de ${getEmployeeName(deletingLeaveRequest.employeeId)} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      )}
    </div>
  );
};

export default LeaveManagementUltraModernV3Standard;
