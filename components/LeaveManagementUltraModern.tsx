import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon as ClockIconSolid,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline';

// Types pour Leave Management
interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  duration: number; // en jours
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
  attachments?: string[];
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  managerId: string;
  managerName: string;
  totalLeaveDays: number;
  usedLeaveDays: number;
  remainingLeaveDays: number;
}

interface LeavePolicy {
  id: string;
  leaveType: string;
  maxDays: number;
  requiresApproval: boolean;
  advanceNotice: number; // en jours
  carryOver: boolean;
  maxCarryOver: number;
}


const LeaveManagementUltraModern: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'kanban'>('list');
  
  // États pour les modales
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Calcul des métriques
  const metrics = [
    {
      title: 'Demandes en Attente',
      value: leaveRequests.filter(req => req.status === 'pending').length,
      change: '+2 cette semaine',
      changeType: 'increase' as const,
      icon: ClockIcon,
      color: 'yellow'
    },
    {
      title: 'Demandes Approuvées',
      value: leaveRequests.filter(req => req.status === 'approved').length,
      change: '+5 ce mois',
      changeType: 'increase' as const,
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      title: 'Jours de Congés Utilisés',
      value: leaveRequests
        .filter(req => req.status === 'approved')
        .reduce((total, req) => total + req.duration, 0),
      change: '+12 ce mois',
      changeType: 'increase' as const,
      icon: CalendarDaysIcon,
      color: 'blue'
    },
    {
      title: 'Taux d\'Approval',
      value: `${Math.round((leaveRequests.filter(req => req.status === 'approved').length / 
        leaveRequests.filter(req => req.status !== 'pending').length) * 100) || 0}%`,
      change: '+3% vs mois dernier',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      color: 'purple'
    }
  ];

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvelle Demande',
      icon: PlusIcon,
      onClick: () => setShowRequestModal(true),
      color: 'blue'
    },
    {
      label: 'Voir Calendrier',
      icon: CalendarIcon,
      onClick: () => setViewMode('calendar'),
      color: 'green'
    },
    {
      label: 'Politiques',
      icon: DocumentTextIcon,
      onClick: () => setShowPolicyModal(true),
      color: 'purple'
    },
    {
      label: 'Rapports',
      icon: ChartBarIcon,
      onClick: () => console.log('Rapports'),
      color: 'orange'
    }
  ];

  // Filtrage des demandes
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.leaveType === typeFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      employees.find(emp => emp.id === request.employeeId)?.department === departmentFilter;
    const matchesDateRange = (!dateRange.start || request.startDate >= dateRange.start) &&
                           (!dateRange.end || request.endDate <= dateRange.end);
    
    return matchesSearch && matchesStatus && matchesType && matchesDepartment && matchesDateRange;
  });

  // Gestion des demandes
  const handleApproveRequest = (id: string, comments?: string) => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === id
        ? {
            ...req,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Dr. Fatou Sall', // En réalité, récupérer l'utilisateur actuel
            comments
          }
        : req
    ));
  };

  const handleRejectRequest = (id: string, comments?: string) => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === id
        ? {
            ...req,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Dr. Fatou Sall',
            comments
          }
        : req
    ));
  };

  const handleCancelRequest = (id: string) => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === id
        ? { ...req, status: 'cancelled' }
        : req
    ));
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      setLeaveRequests(leaveRequests.filter(req => req.id !== id));
    }
  };

  // Créer une nouvelle demande
  const handleCreateRequest = (requestData: Partial<LeaveRequest>) => {
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: requestData.employeeId || '',
      employeeName: requestData.employeeName || '',
      leaveType: requestData.leaveType || 'annual',
      startDate: requestData.startDate || '',
      endDate: requestData.endDate || '',
      duration: requestData.duration || 0,
      reason: requestData.reason || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      attachments: requestData.attachments || []
    };
    
    setLeaveRequests([newRequest, ...leaveRequests]);
    setShowRequestModal(false);
  };

  // Obtenir le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Obtenir le type de congé en français
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual': return 'Congés annuels';
      case 'sick': return 'Congés maladie';
      case 'personal': return 'Congés personnels';
      case 'maternity': return 'Congés maternité';
      case 'paternity': return 'Congés paternité';
      case 'unpaid': return 'Congés sans solde';
      default: return type;
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          Gérez les demandes de congés et les politiques de votre équipe
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                metric.color === 'blue' ? 'bg-blue-100' :
                metric.color === 'green' ? 'bg-green-100' :
                metric.color === 'purple' ? 'bg-purple-100' :
                'bg-yellow-100'
              }`}>
                <metric.icon className={`h-6 w-6 ${
                  metric.color === 'blue' ? 'text-blue-600' :
                  metric.color === 'green' ? 'text-green-600' :
                  metric.color === 'purple' ? 'text-purple-600' :
                  'text-yellow-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
              <option value="cancelled">Annulées</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="annual">Congés annuels</option>
              <option value="sick">Congés maladie</option>
              <option value="personal">Congés personnels</option>
              <option value="maternity">Congés maternité</option>
              <option value="paternity">Congés paternité</option>
              <option value="unpaid">Congés sans solde</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg ${
                viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Demandes de Congés ({filteredRequests.length})
          </h2>
        </div>
        
        {viewMode === 'list' ? (
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
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soumis le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employees.find(emp => emp.id === request.employeeId)?.department}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLeaveTypeLabel(request.leaveType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(request.startDate).toLocaleDateString('fr-FR')}</div>
                        <div className="text-gray-500">au {new Date(request.endDate).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.duration} jour{request.duration > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.submittedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-gray-600 hover:text-red-600"
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
        ) : viewMode === 'kanban' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  En Attente ({filteredRequests.filter(r => r.status === 'pending').length})
                </h3>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{request.employeeName}</h4>
                      <p className="text-sm text-gray-500">{getLeaveTypeLabel(request.leaveType)}</p>
                      <p className="text-sm text-gray-500">{request.duration} jour{request.duration > 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                  Approuvées ({filteredRequests.filter(r => r.status === 'approved').length})
                </h3>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.status === 'approved').map((request) => (
                    <div key={request.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{request.employeeName}</h4>
                      <p className="text-sm text-gray-500">{getLeaveTypeLabel(request.leaveType)}</p>
                      <p className="text-sm text-gray-500">{request.duration} jour{request.duration > 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                  Rejetées ({filteredRequests.filter(r => r.status === 'rejected').length})
                </h3>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.status === 'rejected').map((request) => (
                    <div key={request.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{request.employeeName}</h4>
                      <p className="text-sm text-gray-500">{getLeaveTypeLabel(request.leaveType)}</p>
                      <p className="text-sm text-gray-500">{request.duration} jour{request.duration > 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Annulées ({filteredRequests.filter(r => r.status === 'cancelled').length})
                </h3>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.status === 'cancelled').map((request) => (
                    <div key={request.id} className="bg-white p-3 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{request.employeeName}</h4>
                      <p className="text-sm text-gray-500">{getLeaveTypeLabel(request.leaveType)}</p>
                      <p className="text-sm text-gray-500">{request.duration} jour{request.duration > 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vue Calendrier
              </h3>
              <p className="text-gray-500">
                La vue calendrier sera implémentée dans une prochaine version
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détail de la demande */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de la Demande
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Employé</label>
                  <p className="text-sm text-gray-900">{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type de congé</label>
                  <p className="text-sm text-gray-900">{getLeaveTypeLabel(selectedRequest.leaveType)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de début</label>
                  <p className="text-sm text-gray-900">{new Date(selectedRequest.startDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de fin</label>
                  <p className="text-sm text-gray-900">{new Date(selectedRequest.endDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Raison</label>
                <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.comments && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Commentaires</label>
                  <p className="text-sm text-gray-900">{selectedRequest.comments}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveRequest(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        handleRejectRequest(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de demande */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle Demande de Congé</h3>
            <p className="text-gray-600 mb-4">
              Formulaire de création de demande à implémenter
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementUltraModern;
