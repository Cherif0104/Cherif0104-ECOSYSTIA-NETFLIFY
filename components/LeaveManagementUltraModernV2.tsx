import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { LeaveRequest, Employee, LeavePolicy } from '../types';
import { leaveService } from '../services/leaveService';
import LeaveRequestFormModal from './forms/LeaveRequestFormModal';
import ConfirmationModal from './common/ConfirmationModal';

// Types pour Leave Management UltraModern
interface LeaveMetrics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysTaken: number;
  remainingDays: number;
  averageProcessingTime: number;
  teamMembers: number;
}

interface LeaveFilters {
  search: string;
  status: string;
  type: string;
  dateRange: { start: string; end: string };
  employee: string;
}


const LeaveManagementUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et recherche
  const [filters, setFilters] = useState<LeaveFilters>({
    search: '',
    status: 'all',
    type: 'all',
    dateRange: { start: '', end: '' },
    employee: 'all'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [sortBy, setSortBy] = useState<'employeeName' | 'status' | 'startDate' | 'days'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // États pour les modales
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState<LeaveRequest | null>(null);

  // Calcul des métriques
  const metrics: LeaveMetrics = useMemo(() => {
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(req => req.status === 'Pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'Approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'Rejected').length;
    
    const totalDaysTaken = leaveRequests
      .filter(req => req.status === 'Approved')
      .reduce((sum, req) => sum + req.days, 0);
    
    const remainingDays = 25 - totalDaysTaken; // Basé sur 25 jours annuels
    
    const processedRequests = leaveRequests.filter(req => req.reviewedAt);
    const averageProcessingTime = processedRequests.length > 0 
      ? processedRequests.reduce((sum, req) => {
          const submitted = new Date(req.submittedAt);
          const reviewed = new Date(req.reviewedAt!);
          return sum + (reviewed.getTime() - submitted.getTime()) / (1000 * 60 * 60); // en heures
        }, 0) / processedRequests.length
      : 0;
    
    const teamMembers = new Set(leaveRequests.map(req => req.employeeId)).size;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalDaysTaken,
      remainingDays: Math.max(0, remainingDays),
      averageProcessingTime: Math.round(averageProcessingTime * 10) / 10,
      teamMembers
    };
  }, [leaveRequests]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvelle Demande',
      icon: PlusIcon,
      onClick: () => setShowLeaveModal(true),
      color: 'blue'
    },
    {
      label: 'Voir Calendrier',
      icon: CalendarIcon,
      onClick: () => setViewMode('calendar'),
      color: 'green'
    },
    {
      label: 'Rapport Congés',
      icon: ChartBarIcon,
      onClick: () => console.log('Rapport'),
      color: 'purple'
    },
    {
      label: 'Exporter Données',
      icon: ArrowDownIcon,
      onClick: () => console.log('Export'),
      color: 'orange'
    }
  ];

  // Filtrage et tri des demandes de congé
  const filteredAndSortedLeaveRequests = useMemo(() => {
    let filtered = leaveRequests.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
                           request.reason.toLowerCase().includes(filters.search.toLowerCase()) ||
                           request.leaveType.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || request.status === filters.status;
      const matchesType = filters.type === 'all' || request.leaveType === filters.type;
      const matchesEmployee = filters.employee === 'all' || request.employeeId === filters.employee;
      
      const matchesDateRange = (!filters.dateRange.start || request.startDate >= filters.dateRange.start) &&
                              (!filters.dateRange.end || request.endDate <= filters.dateRange.end);

      return matchesSearch && matchesStatus && matchesType && matchesEmployee && matchesDateRange;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'employeeName':
          aValue = a.employeeName.toLowerCase();
          bValue = b.employeeName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'days':
          aValue = a.days;
          bValue = b.days;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leaveRequests, filters, sortBy, sortOrder]);

  // Gestion des demandes de congé
  const handleCreateLeaveRequest = async (leaveData: Omit<LeaveRequest, 'id' | 'submittedAt' | 'reviewedAt' | 'reviewedBy' | 'createdAt' | 'updatedAt'>) => {
    if (user?.id) {
      try {
        const savedRequest = await leaveService.create({
          ...leaveData,
          submittedAt: new Date().toISOString(),
          reviewedAt: null,
          reviewedBy: null,
          comments: ''
        });
        
        if (savedRequest) {
          setLeaveRequests(prev => [savedRequest, ...prev]);
          setShowLeaveModal(false);
          return;
        }
      } catch (error) {
        console.error('Erreur création demande congé:', error);
      }
    }
    
    // Fallback local
    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      ...leaveData,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      comments: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setLeaveRequests(prev => [newRequest, ...prev]);
    setShowLeaveModal(false);
  };

  const handleUpdateLeaveRequest = async (updatedRequest: LeaveRequest) => {
    if (user?.id && typeof updatedRequest.id === 'string') {
      try {
        const success = await leaveService.update(updatedRequest.id, updatedRequest);
        if (success) {
          setLeaveRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
          setEditingLeaveRequest(null);
          return;
        }
      } catch (error) {
        console.error('Erreur mise à jour demande congé:', error);
      }
    }
    
    // Fallback local
    setLeaveRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
    setEditingLeaveRequest(null);
  };

  const handleDeleteLeaveRequest = async (requestId: string) => {
    if (user?.id) {
      try {
        const success = await leaveService.delete(requestId);
        if (success) {
          setLeaveRequests(prev => prev.filter(req => req.id !== requestId));
          setShowDeleteModal(false);
          setSelectedLeaveRequest(null);
          return;
        }
      } catch (error) {
        console.error('Erreur suppression demande congé:', error);
      }
    }
    
    // Fallback local
    setLeaveRequests(prev => prev.filter(req => req.id !== requestId));
    setShowDeleteModal(false);
    setSelectedLeaveRequest(null);
  };

  const handleApproveRequest = async (requestId: string, comments?: string) => {
    const request = leaveRequests.find(req => req.id === requestId);
    if (request) {
      const updatedRequest = {
        ...request,
        status: 'Approved' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.name || 'Manager',
        comments: comments || request.comments
      };
      await handleUpdateLeaveRequest(updatedRequest);
    }
  };

  const handleRejectRequest = async (requestId: string, comments?: string) => {
    const request = leaveRequests.find(req => req.id === requestId);
    if (request) {
      const updatedRequest = {
        ...request,
        status: 'Rejected' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.name || 'Manager',
        comments: comments || request.comments
      };
      await handleUpdateLeaveRequest(updatedRequest);
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return 'En attente';
      case 'Approved': return 'Approuvé';
      case 'Rejected': return 'Rejeté';
      case 'Cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Obtenir le type de congé en français
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'Annual': return 'Annuel';
      case 'Sick': return 'Maladie';
      case 'Maternity': return 'Maternité';
      case 'Personal': return 'Personnel';
      case 'Emergency': return 'Urgence';
      default: return type;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Congés
        </h1>
        <p className="text-gray-600">
          Gérez les demandes de congés et les politiques de l'entreprise
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Demandes
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalRequests}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-yellow-600">
                  {metrics.pendingRequests} en attente
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Approuvées
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.approvedRequests}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-green-600">
                  {metrics.rejectedRequests} rejetées
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
                Jours Pris
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalDaysTaken}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-purple-600">
                  {metrics.remainingDays} restants
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Temps Moy. Traitement
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.averageProcessingTime}h
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium text-orange-600">
                  {metrics.teamMembers} employés
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
                placeholder="Rechercher des demandes..."
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
              <option value="Pending">En attente</option>
              <option value="Approved">Approuvé</option>
              <option value="Rejected">Rejeté</option>
              <option value="Cancelled">Annulé</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="Annual">Annuel</option>
              <option value="Sick">Maladie</option>
              <option value="Maternity">Maternité</option>
              <option value="Personal">Personnel</option>
              <option value="Emergency">Urgence</option>
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
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${
                viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des demandes de congé */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Demandes de Congé ({filteredAndSortedLeaveRequests.length})
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="employeeName">Employé</option>
                <option value="status">Statut</option>
                <option value="startDate">Date de début</option>
                <option value="days">Durée</option>
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
            {filteredAndSortedLeaveRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {request.employeeName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {getLeaveTypeLabel(request.leaveType)} - {request.days} jour{request.days > 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Période:</strong> {new Date(request.startDate).toLocaleDateString('fr-FR')} - {new Date(request.endDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Raison:</strong> {request.reason}
                  </div>
                </div>
                
                {request.comments && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <strong>Commentaires:</strong> {request.comments}
                    </div>
                    {request.reviewedBy && (
                      <div className="text-xs text-gray-500 mt-1">
                        Par {request.reviewedBy} le {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString('fr-FR') : ''}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLeaveRequest(request);
                        // setShowDetailModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingLeaveRequest(request);
                        setShowLeaveModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLeaveRequest(request);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {request.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Rejeter
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
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedLeaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLeaveTypeLabel(request.leaveType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.startDate).toLocaleDateString('fr-FR')} - {new Date(request.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.days} jour{request.days > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLeaveRequest(request);
                            // setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingLeaveRequest(request);
                            setShowLeaveModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLeaveRequest(request);
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
            <div className="text-center text-gray-500 py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vue Calendrier</h3>
              <p>La vue calendrier sera disponible dans une prochaine version</p>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showLeaveModal && (
        <LeaveRequestFormModal
          leaveRequest={editingLeaveRequest}
          employees={employees}
          leavePolicies={leavePolicies}
          onClose={() => {
            setShowLeaveModal(false);
            setEditingLeaveRequest(null);
          }}
          onSave={editingLeaveRequest ? handleUpdateLeaveRequest : handleCreateLeaveRequest}
        />
      )}

      {showDeleteModal && selectedLeaveRequest && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedLeaveRequest(null);
          }}
          onConfirm={() => handleDeleteLeaveRequest(selectedLeaveRequest.id)}
          title="Supprimer la demande de congé"
          message={`Êtes-vous sûr de vouloir supprimer cette demande de congé ? Cette action est irréversible.`}
        />
      )}
    </div>
  );
};

export default LeaveManagementUltraModernV2;
