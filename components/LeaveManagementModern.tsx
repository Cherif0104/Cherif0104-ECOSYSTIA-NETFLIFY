import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { LeaveRequest, User } from '../types';
import ConfirmationModal from './common/ConfirmationModal';

// ===== MODALE DE FORMULAIRE DE CONGÉ =====

const LeaveRequestFormModal: React.FC<{
    leaveRequest: LeaveRequest | null;
    onClose: () => void;
    onSave: (leaveRequest: LeaveRequest | Omit<LeaveRequest, 'id'>) => void;
}> = ({ leaveRequest, onClose, onSave }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const isEditMode = leaveRequest !== null;
    
    const [formData, setFormData] = useState({
        type: leaveRequest?.type || 'vacation',
        startDate: leaveRequest ? new Date(leaveRequest.startDate).toISOString().slice(0, 10) : '',
        endDate: leaveRequest ? new Date(leaveRequest.endDate).toISOString().slice(0, 10) : '',
        reason: leaveRequest?.reason || '',
        status: leaveRequest?.status || 'pending',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const leaveRequestData = {
            ...formData,
            userId: currentUser.id,
            submittedAt: leaveRequest?.submittedAt || new Date().toISOString(),
            approvedBy: leaveRequest?.approvedBy,
            approvedAt: leaveRequest?.approvedAt,
        };
        
        onSave(isEditMode ? { ...leaveRequest, ...leaveRequestData } : leaveRequestData);
    };

    const leaveTypes = [
        { value: 'vacation', label: 'Congés payés', icon: 'fas fa-umbrella-beach', color: 'blue' },
        { value: 'sick', label: 'Arrêt maladie', icon: 'fas fa-thermometer-half', color: 'red' },
        { value: 'personal', label: 'Congés personnels', icon: 'fas fa-user', color: 'green' },
        { value: 'maternity', label: 'Congé maternité', icon: 'fas fa-baby', color: 'pink' },
        { value: 'paternity', label: 'Congé paternité', icon: 'fas fa-child', color: 'purple' },
        { value: 'emergency', label: 'Congé d\'urgence', icon: 'fas fa-exclamation-triangle', color: 'orange' },
    ];

    const statusOptions = [
        { value: 'pending', label: 'En attente', icon: 'fas fa-clock', color: 'yellow' },
        { value: 'approved', label: 'Approuvé', icon: 'fas fa-check', color: 'green' },
        { value: 'rejected', label: 'Rejeté', icon: 'fas fa-times', color: 'red' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Modifier la demande' : 'Nouvelle demande de congé'}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Type de congé */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <i className="fas fa-tag mr-2 text-blue-600"></i>
                                    Type de congé
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {leaveTypes.map(type => (
                                        <label
                                            key={type.value}
                                            className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                formData.type === type.value
                                                    ? `border-${type.color}-500 bg-${type.color}-50`
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type.value}
                                                checked={formData.type === type.value}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center space-x-3">
                                                <i className={`${type.icon} text-${type.color}-600 text-lg`}></i>
                                                <span className="font-medium text-gray-900">{type.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <i className="fas fa-calendar mr-2 text-blue-600"></i>
                                        Date de début
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <i className="fas fa-calendar mr-2 text-blue-600"></i>
                                        Date de fin
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Raison */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <i className="fas fa-comment mr-2 text-blue-600"></i>
                                    Raison du congé
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Décrivez la raison de votre demande de congé..."
                                    required
                                />
                            </div>

                            {/* Statut (seulement en mode édition) */}
                            {isEditMode && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        <i className="fas fa-flag mr-2 text-blue-600"></i>
                                        Statut
                                    </label>
                                    <div className="flex space-x-3">
                                        {statusOptions.map(status => (
                                            <label
                                                key={status.value}
                                                className={`relative flex items-center px-4 py-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                    formData.status === status.value
                                                        ? `border-${status.color}-500 bg-${status.color}-50`
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={status.value}
                                                    checked={formData.status === status.value}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <i className={`${status.icon} text-${status.color}-600`}></i>
                                                    <span className="font-medium text-gray-900">{status.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-colors"
                        >
                            {isEditMode ? 'Modifier' : 'Soumettre'} la demande
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===== COMPOSANT PRINCIPAL =====

const LeaveManagementModern: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    
    // États pour les données
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour l'interface
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
    const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
    
    // États pour les filtres
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'current' | 'upcoming' | 'past'>('all');

    // Charger les données
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mode démo : charger depuis localStorage
            const savedRequests = localStorage.getItem('ecosystia_demo_leave_requests');
            if (savedRequests) {
                const requests = JSON.parse(savedRequests);
                setLeaveRequests(requests);
                console.log(`✅ ${requests.length} demandes de congé chargées depuis localStorage`);
            } else {
                // Données de démonstration
                const demoRequests = getDemoLeaveRequests();
                setLeaveRequests(demoRequests);
                localStorage.setItem('ecosystia_demo_leave_requests', JSON.stringify(demoRequests));
                console.log(`✅ ${demoRequests.length} demandes de congé de démonstration chargées`);
            }
        } catch (error: any) {
            console.error('❌ Erreur chargement demandes de congé:', error);
            setError('Erreur lors du chargement des demandes de congé');
        } finally {
            setLoading(false);
        }
    };

    const getDemoLeaveRequests = (): LeaveRequest[] => [
        {
            id: 'demo-leave-1',
            userId: 'demo-user-manager',
            type: 'vacation',
            startDate: '2024-12-20',
            endDate: '2024-12-27',
            reason: 'Vacances de fin d\'année en famille',
            status: 'approved',
            submittedAt: '2024-11-01T00:00:00.000Z',
            approvedBy: 'admin',
            approvedAt: '2024-11-02T00:00:00.000Z'
        },
        {
            id: 'demo-leave-2',
            userId: 'demo-user-manager',
            type: 'sick',
            startDate: '2024-11-15',
            endDate: '2024-11-17',
            reason: 'Grippe et fièvre',
            status: 'approved',
            submittedAt: '2024-11-14T00:00:00.000Z',
            approvedBy: 'admin',
            approvedAt: '2024-11-14T00:00:00.000Z'
        },
        {
            id: 'demo-leave-3',
            userId: 'demo-user-manager',
            type: 'personal',
            startDate: '2024-12-10',
            endDate: '2024-12-12',
            reason: 'Démarches administratives importantes',
            status: 'pending',
            submittedAt: '2024-11-10T00:00:00.000Z'
        }
    ];

    const handleSaveRequest = async (requestData: LeaveRequest | Omit<LeaveRequest, 'id'>) => {
        try {
            if ('id' in requestData) {
                // Mise à jour
                const updatedRequests = leaveRequests.map(req => 
                    req.id === requestData.id ? requestData : req
                );
                setLeaveRequests(updatedRequests);
                localStorage.setItem('ecosystia_demo_leave_requests', JSON.stringify(updatedRequests));
                console.log('✅ Demande de congé mise à jour');
            } else {
                // Création
                const newRequest: LeaveRequest = {
                    ...requestData,
                    id: `demo-leave-${Date.now()}`,
                    userId: user?.id || 'demo-user-manager',
                    submittedAt: new Date().toISOString()
                };
                const updatedRequests = [...leaveRequests, newRequest];
                setLeaveRequests(updatedRequests);
                localStorage.setItem('ecosystia_demo_leave_requests', JSON.stringify(updatedRequests));
                console.log('✅ Demande de congé créée');
            }
            
            setFormModalOpen(false);
            setEditingRequest(null);
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde demande:', error);
            setError('Erreur lors de la sauvegarde de la demande');
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        try {
            const updatedRequests = leaveRequests.filter(req => req.id !== requestId);
            setLeaveRequests(updatedRequests);
            localStorage.setItem('ecosystia_demo_leave_requests', JSON.stringify(updatedRequests));
            setDeletingRequestId(null);
            console.log('✅ Demande de congé supprimée');
        } catch (error: any) {
            console.error('❌ Erreur suppression demande:', error);
            setError('Erreur lors de la suppression de la demande');
        }
    };

    // Calculer les métriques
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;

    // Filtrer les données
    const filteredRequests = useMemo(() => {
        let filtered = leaveRequests;

        // Filtre par statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter(req => req.status === statusFilter);
        }

        // Filtre par type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(req => req.type === typeFilter);
        }

        // Filtre par date
        const now = new Date();
        switch (dateFilter) {
            case 'current':
                filtered = filtered.filter(req => {
                    const start = new Date(req.startDate);
                    const end = new Date(req.endDate);
                    return start <= now && end >= now;
                });
                break;
            case 'upcoming':
                filtered = filtered.filter(req => new Date(req.startDate) > now);
                break;
            case 'past':
                filtered = filtered.filter(req => new Date(req.endDate) < now);
                break;
        }

        return filtered;
    }, [leaveRequests, statusFilter, typeFilter, dateFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Chargement des demandes de congé...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec métriques */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Gestion des Congés</h2>
                        <p className="text-green-100">Gérez vos demandes de congé et vos absences</p>
                    </div>
                    <button
                        onClick={() => setFormModalOpen(true)}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 font-semibold"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Nouvelle Demande
                    </button>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-file-alt text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-green-100 text-sm">Total</p>
                                <p className="text-2xl font-bold">{totalRequests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-clock text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-green-100 text-sm">En attente</p>
                                <p className="text-2xl font-bold">{pendingRequests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-check text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-green-100 text-sm">Approuvées</p>
                                <p className="text-2xl font-bold">{approvedRequests}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-times text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-green-100 text-sm">Rejetées</p>
                                <p className="text-2xl font-bold">{rejectedRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-filter text-gray-500"></i>
                        <span className="font-semibold text-gray-700">Filtres:</span>
                    </div>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvées</option>
                        <option value="rejected">Rejetées</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tous les types</option>
                        <option value="vacation">Congés payés</option>
                        <option value="sick">Arrêt maladie</option>
                        <option value="personal">Congés personnels</option>
                        <option value="maternity">Congé maternité</option>
                        <option value="paternity">Congé paternité</option>
                        <option value="emergency">Congé d'urgence</option>
                    </select>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Toutes les périodes</option>
                        <option value="current">En cours</option>
                        <option value="upcoming">À venir</option>
                        <option value="past">Passées</option>
                    </select>
                </div>
            </div>

            {/* Liste des demandes */}
            <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Demandes de Congé ({filteredRequests.length})
                    </h3>
                    
                    {filteredRequests.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <i className="fas fa-calendar-times text-4xl mb-4"></i>
                            <p className="text-lg font-semibold">Aucune demande de congé</p>
                            <p className="text-sm">Commencez par créer votre première demande</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map(request => {
                                const leaveTypes = {
                                    vacation: { label: 'Congés payés', icon: 'fas fa-umbrella-beach', color: 'blue' },
                                    sick: { label: 'Arrêt maladie', icon: 'fas fa-thermometer-half', color: 'red' },
                                    personal: { label: 'Congés personnels', icon: 'fas fa-user', color: 'green' },
                                    maternity: { label: 'Congé maternité', icon: 'fas fa-baby', color: 'pink' },
                                    paternity: { label: 'Congé paternité', icon: 'fas fa-child', color: 'purple' },
                                    emergency: { label: 'Congé d\'urgence', icon: 'fas fa-exclamation-triangle', color: 'orange' },
                                };

                                const statusConfig = {
                                    pending: { label: 'En attente', icon: 'fas fa-clock', color: 'yellow' },
                                    approved: { label: 'Approuvé', icon: 'fas fa-check', color: 'green' },
                                    rejected: { label: 'Rejeté', icon: 'fas fa-times', color: 'red' },
                                };

                                const typeConfig = leaveTypes[request.type as keyof typeof leaveTypes];
                                const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
                                const duration = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

                                return (
                                    <div key={request.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className={`p-3 rounded-lg bg-${typeConfig.color}-100 text-${typeConfig.color}-600`}>
                                                        <i className={`${typeConfig.icon} text-lg`}></i>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{typeConfig.label}</h4>
                                                        <p className="text-sm text-gray-600">{request.reason}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <i className="fas fa-calendar mr-2"></i>
                                                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <i className="fas fa-clock mr-2"></i>
                                                        {duration} jour{duration > 1 ? 's' : ''}
                                                    </div>
                                                    <div>
                                                        <i className="fas fa-calendar-plus mr-2"></i>
                                                        Soumis le {new Date(request.submittedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                                                    <i className={`${statusInfo.icon} mr-1`}></i>
                                                    {statusInfo.label}
                                                </span>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingRequest(request);
                                                            setFormModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingRequestId(request.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            {isFormModalOpen && (
                <LeaveRequestFormModal
                    leaveRequest={editingRequest}
                    onClose={() => {
                        setFormModalOpen(false);
                        setEditingRequest(null);
                    }}
                    onSave={handleSaveRequest}
                />
            )}

            {deletingRequestId && (
                <ConfirmationModal
                    isOpen={!!deletingRequestId}
                    onClose={() => setDeletingRequestId(null)}
                    onConfirm={() => handleDeleteRequest(deletingRequestId)}
                    title="Supprimer la demande de congé"
                    message="Êtes-vous sûr de vouloir supprimer cette demande de congé ?"
                />
            )}
        </div>
    );
};

export default LeaveManagementModern;
