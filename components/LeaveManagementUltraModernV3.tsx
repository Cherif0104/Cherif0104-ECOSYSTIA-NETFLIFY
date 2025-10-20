/**
 * 🏖️ LEAVE MANAGEMENT ULTRA MODERN V3
 * Module de gestion des congés - Architecture standardisée
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { LeaveRequest, User } from '../types';
import { leaveManagementService } from '../services/leaveManagementService';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';
import LeaveRequestFormModal from './forms/LeaveRequestFormModal';

const LeaveManagementUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();

  // États principaux
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les vues et filtres
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [sortBy, setSortBy] = useState<'startDate' | 'endDate' | 'status' | 'employeeId'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    employeeId: ''
  });

  // États pour les modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Chargement des données
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des demandes de congé...');
      const [leaveRequestsData, usersData] = await Promise.all([
        leaveManagementService.getAll(user?.id), // Filtrer par utilisateur connecté
        userService.getAllUsers()
      ]);
      console.log(`✅ ${leaveRequestsData.length} demandes chargées`);
      console.log(`✅ ${usersData.length} utilisateurs chargés`);
      setLeaveRequests(leaveRequestsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement demandes:', err);
      setError("Erreur lors du chargement des données.");
      setLeaveRequests([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gestion des demandes de congé
  const handleCreateLeaveRequest = async (leaveRequest: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Création demande de congé...');
      await leaveManagementService.create(leaveRequest);
      await loadData();
      setShowLeaveModal(false);
      setEditingLeaveRequest(null);
      console.log('✅ Demande créée avec succès');
    } catch (error) {
      console.error('❌ Erreur création demande:', error);
    }
  };

  const handleUpdateLeaveRequest = async (leaveRequest: LeaveRequest) => {
    try {
      console.log('🔄 Mise à jour demande...');
      await leaveManagementService.update(leaveRequest.id, leaveRequest);
      await loadData();
      setShowLeaveModal(false);
      setEditingLeaveRequest(null);
      console.log('✅ Demande mise à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
    }
  };

  const handleDeleteLeaveRequest = async (id: string) => {
    try {
      console.log('🔄 Suppression demande...');
      await leaveManagementService.remove(id);
      await loadData();
      setShowDeleteModal(false);
      console.log('✅ Demande supprimée');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  const handleApproveLeaveRequest = async (id: string) => {
    try {
      console.log('🔄 Approbation demande...');
      await leaveManagementService.approve(id, user?.id || '', 'Demande approuvée');
      await loadData();
      console.log('✅ Demande approuvée');
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
    }
  };

  const handleRejectLeaveRequest = async (id: string) => {
    try {
      console.log('🔄 Rejet demande...');
      await leaveManagementService.reject(id, user?.id || '', 'Demande rejetée');
      await loadData();
      console.log('✅ Demande rejetée');
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
    }
  };

  // Logique de filtrage et recherche
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      getEmployeeName(request.employeeId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesLeaveType = !filters.leaveType || request.leaveType === filters.leaveType;
    const matchesEmployee = !filters.employeeId || request.employeeId === filters.employeeId;
    
    return matchesSearch && matchesStatus && matchesLeaveType && matchesEmployee;
  });

  // Tri des demandes
  const sortedLeaveRequests = [...filteredLeaveRequests].sort((a, b) => {
    let aValue: any = a[sortBy as keyof LeaveRequest];
    let bValue: any = b[sortBy as keyof LeaveRequest];
    
    if (sortBy === 'startDate' || sortBy === 'endDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Fonction pour obtenir le nom de l'employé
  const getEmployeeName = (employeeId: string) => {
    const employee = users.find(u => u.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employé inconnu';
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-3 h-3" />;
      case 'approved': return <CheckIcon className="w-3 h-3" />;
      case 'rejected': return <XMarkIcon className="w-3 h-3" />;
      default: return null;
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Congés</h1>
            <p className="text-gray-600 mt-1">Gérez les demandes de congés et absences</p>
          </div>
          <button
            onClick={() => {
              setEditingLeaveRequest(null);
              setShowLeaveModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle Demande
          </button>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Recherche */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>

            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="vacation">Vacances</option>
              <option value="sick">Maladie</option>
              <option value="personal">Personnel</option>
              <option value="maternity">Maternité</option>
              <option value="paternity">Paternité</option>
            </select>

            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les employés</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Boutons de vue */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Tri */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="startDate">Date de début</option>
              <option value="endDate">Date de fin</option>
              <option value="status">Statut</option>
              <option value="employeeId">Employé</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLeaveRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{getEmployeeName(request.employeeId)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {request.leaveType}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Durée:</span> {request.daysRequested} jour(s)
                </div>
                {request.reason && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Motif:</span> {request.reason}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLeaveRequest(request);
                    setShowLeaveModal(true);
                  }}
                  className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Voir
                </button>
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveLeaveRequest(request.id)}
                      className="px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectLeaveRequest(request.id)}
                      className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLeaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{getEmployeeName(request.employeeId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.leaveType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.daysRequested} jour(s)</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingLeaveRequest(request);
                            setShowLeaveModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveLeaveRequest(request.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleRejectLeaveRequest(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucune donnée */}
      {filteredLeaveRequests.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande de congé</h3>
          <p className="text-gray-600 mb-4">Commencez par créer une nouvelle demande de congé.</p>
          <button
            onClick={() => {
              setEditingLeaveRequest(null);
              setShowLeaveModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nouvelle Demande
          </button>
        </div>
      )}

      {/* Modal de formulaire de demande */}
      {showLeaveModal && (
        <LeaveRequestFormModal
          isOpen={showLeaveModal}
          onClose={() => {
            setShowLeaveModal(false);
            setEditingLeaveRequest(null);
          }}
          onSubmit={editingLeaveRequest ? handleUpdateLeaveRequest : handleCreateLeaveRequest}
          leaveRequest={editingLeaveRequest}
          users={users}
          currentUserId={user?.id} // Passer l'ID de l'utilisateur connecté
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedLeaveRequest && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteLeaveRequest(selectedLeaveRequest.id)}
          title="Supprimer la demande"
          message={`Êtes-vous sûr de vouloir supprimer la demande de congé de ${getEmployeeName(selectedLeaveRequest.employeeId)} ?`}
        />
      )}
    </div>
  );
};

export default LeaveManagementUltraModernV3;
