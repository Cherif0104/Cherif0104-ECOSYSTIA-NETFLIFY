import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { TimeLog, Project, Course, Meeting, User } from '../types';
import { timeLogService } from '../services/timeLogService';
import { projectService } from '../services/projectService';
import LogTimeModal from './LogTimeModal';
import ConfirmationModal from './common/ConfirmationModal';

// ===== MODALES =====

const MeetingFormModal: React.FC<{
    meeting: Meeting | null;
    users: User[];
    onClose: () => void;
    onSave: (meeting: Meeting | Omit<Meeting, 'id'>) => void;
}> = ({ meeting, users, onClose, onSave }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const isEditMode = meeting !== null;
    
    const [formData, setFormData] = useState({
        title: meeting?.title || '',
        description: meeting?.description || '',
        startDate: meeting ? new Date(meeting.startTime).toISOString().slice(0, 10) : '',
        startTime: meeting ? new Date(meeting.startTime).toTimeString().slice(0, 5) : '',
        endDate: meeting ? new Date(meeting.endTime).toISOString().slice(0, 10) : '',
        endTime: meeting ? new Date(meeting.endTime).toTimeString().slice(0, 5) : '',
        attendees: meeting?.attendees.map(u => u.id) || [currentUser?.id],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, attendees: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        const attendees = users.filter(u => formData.attendees.includes(u.id));
        const meetingData = {
            title: formData.title,
            description: formData.description,
            startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
            endTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
            attendees,
            organizerId: meeting?.organizerId || currentUser.id,
        };
        onSave(isEditMode ? { ...meeting, ...meetingData } : meetingData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Modifier la réunion' : 'Nouvelle réunion'}
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
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <i className="fas fa-heading mr-2 text-blue-600"></i>
                                    Titre de la réunion
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Ex: Réunion équipe projet"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <i className="fas fa-align-left mr-2 text-blue-600"></i>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Description de la réunion..."
                                />
                            </div>

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
                                        <i className="fas fa-clock mr-2 text-blue-600"></i>
                                        Heure de début
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <i className="fas fa-clock mr-2 text-blue-600"></i>
                                        Heure de fin
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <i className="fas fa-users mr-2 text-blue-600"></i>
                                    Participants
                                </label>
                                <select
                                    name="attendees"
                                    multiple
                                    value={formData.attendees}
                                    onChange={handleTeamChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    size={4}
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">Maintenez Ctrl pour sélectionner plusieurs participants</p>
                            </div>
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
                            {isEditMode ? 'Modifier' : 'Créer'} la réunion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===== COMPOSANT PRINCIPAL =====

interface TimeTrackingModernProps {
    projects: Project[];
    courses: Course[];
}

const TimeTrackingModern: React.FC<TimeTrackingModernProps> = ({ projects, courses }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    
    // États pour les données
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour l'interface
    const [activeTab, setActiveTab] = useState<'logs' | 'meetings'>('logs');
    const [isLogModalOpen, setLogModalOpen] = useState(false);
    const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
    const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
    
    // États pour les filtres
    const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
    const [projectFilter, setProjectFilter] = useState<string>('');
    const [entityFilter, setEntityFilter] = useState<'all' | 'project' | 'course' | 'task'>('all');

    // Charger les données
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [timeLogsData, meetingsData] = await Promise.all([
                timeLogService.getTimeLogs(),
                timeLogService.getMeetings()
            ]);

            setTimeLogs(timeLogsData);
            setMeetings(meetingsData);
            
            // Utilisateurs mock pour l'instant
            setUsers([
                {
                    id: '1',
                    firstName: 'Demo',
                    lastName: 'Utilisateur',
                    email: 'demo@ecosystia.sn',
                    avatar: `data:image/svg+xml;base64,${btoa(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#4F46E5"/><text x="50" y="60" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="white">DU</text></svg>`)}`,
                    role: 'manager',
                    skills: ['Gestion', 'Développement'],
                    phone: '+221 77 000 00 00'
                }
            ]);

            console.log(`✅ ${timeLogsData.length} logs de temps et ${meetingsData.length} réunions chargés`);
        } catch (error: any) {
            console.error('❌ Erreur chargement données time tracking:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLog = async (logData: TimeLog | Omit<TimeLog, 'id'>) => {
        try {
            if ('id' in logData) {
                // Mise à jour
                const updatedLog = await timeLogService.updateTimeLog(logData.id, logData);
                if (updatedLog) {
                    setTimeLogs(prev => prev.map(log => log.id === logData.id ? updatedLog : log));
                    console.log('✅ Log de temps mis à jour');
                }
            } else {
                // Création
                const newLog = await timeLogService.createTimeLog(logData);
                if (newLog) {
                    setTimeLogs(prev => [...prev, newLog]);
                    console.log('✅ Log de temps créé');
                }
            }
            
            setLogModalOpen(false);
            setEditingLog(null);
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde log:', error);
            setError('Erreur lors de la sauvegarde du log de temps');
        }
    };

    const handleSaveMeeting = async (meetingData: Meeting | Omit<Meeting, 'id'>) => {
        try {
            if ('id' in meetingData) {
                // Mise à jour
                const updatedMeeting = await timeLogService.updateMeeting(meetingData.id, meetingData);
                if (updatedMeeting) {
                    setMeetings(prev => prev.map(meeting => meeting.id === meetingData.id ? updatedMeeting : meeting));
                    console.log('✅ Réunion mise à jour');
                }
            } else {
                // Création
                const newMeeting = await timeLogService.createMeeting(meetingData);
                if (newMeeting) {
                    setMeetings(prev => [...prev, newMeeting]);
                    console.log('✅ Réunion créée');
                }
            }
            
            setMeetingModalOpen(false);
            setEditingMeeting(null);
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde réunion:', error);
            setError('Erreur lors de la sauvegarde de la réunion');
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            const success = await timeLogService.deleteTimeLog(logId);
            if (success) {
                setTimeLogs(prev => prev.filter(log => log.id !== logId));
                setDeletingLogId(null);
                console.log('✅ Log de temps supprimé');
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression log:', error);
            setError('Erreur lors de la suppression du log de temps');
        }
    };

    const handleDeleteMeeting = async (meetingId: string) => {
        try {
            const success = await timeLogService.deleteMeeting(meetingId);
            if (success) {
                setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
                setDeletingMeetingId(null);
                console.log('✅ Réunion supprimée');
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression réunion:', error);
            setError('Erreur lors de la suppression de la réunion');
        }
    };

    // Calculer les métriques
    const totalTimeLogged = useMemo(() => {
        return timeLogs.reduce((total, log) => total + log.duration, 0);
    }, [timeLogs]);

    const todayTimeLogged = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return timeLogs
            .filter(log => log.date === today)
            .reduce((total, log) => total + log.duration, 0);
    }, [timeLogs]);

    const weekTimeLogged = useMemo(() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return timeLogs
            .filter(log => new Date(log.date) >= weekAgo)
            .reduce((total, log) => total + log.duration, 0);
    }, [timeLogs]);

    // Filtrer les données
    const filteredTimeLogs = useMemo(() => {
        let filtered = timeLogs;

        // Filtre par date
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(log => new Date(log.date) >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(filterDate.getDate() - 7);
                    filtered = filtered.filter(log => new Date(log.date) >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(filterDate.getMonth() - 1);
                    filtered = filtered.filter(log => new Date(log.date) >= filterDate);
                    break;
            }
        }

        // Filtre par projet
        if (projectFilter) {
            filtered = filtered.filter(log => log.entityId === projectFilter);
        }

        // Filtre par type d'entité
        if (entityFilter !== 'all') {
            filtered = filtered.filter(log => log.entityType === entityFilter);
        }

        return filtered;
    }, [timeLogs, dateFilter, projectFilter, entityFilter]);

    const filteredMeetings = useMemo(() => {
        let filtered = meetings;

        // Filtre par date
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(meeting => new Date(meeting.startTime) >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(filterDate.getDate() - 7);
                    filtered = filtered.filter(meeting => new Date(meeting.startTime) >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(filterDate.getMonth() - 1);
                    filtered = filtered.filter(meeting => new Date(meeting.startTime) >= filterDate);
                    break;
            }
        }

        return filtered;
    }, [meetings, dateFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Chargement du suivi du temps...</p>
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Suivi du Temps</h2>
                        <p className="text-blue-100">Gérez votre temps de travail et vos réunions</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setLogModalOpen(true)}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 font-semibold"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Nouveau Log
                        </button>
                        <button
                            onClick={() => setMeetingModalOpen(true)}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 font-semibold"
                        >
                            <i className="fas fa-calendar-plus mr-2"></i>
                            Nouvelle Réunion
                        </button>
                    </div>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-clock text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-blue-100 text-sm">Aujourd'hui</p>
                                <p className="text-2xl font-bold">{Math.round(todayTimeLogged / 60)}h</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-calendar-week text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-blue-100 text-sm">Cette semaine</p>
                                <p className="text-2xl font-bold">{Math.round(weekTimeLogged / 60)}h</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-chart-line text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-blue-100 text-sm">Total</p>
                                <p className="text-2xl font-bold">{Math.round(totalTimeLogged / 60)}h</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <i className="fas fa-users text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-blue-100 text-sm">Réunions</p>
                                <p className="text-2xl font-bold">{meetings.length}</p>
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
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="today">Aujourd'hui</option>
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois</option>
                        <option value="all">Toutes les périodes</option>
                    </select>

                    <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les projets</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tous les types</option>
                        <option value="project">Projets</option>
                        <option value="course">Formations</option>
                        <option value="task">Tâches</option>
                    </select>
                </div>
            </div>

            {/* Onglets */}
            <div className="bg-white rounded-2xl shadow-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === 'logs'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-clock mr-2"></i>
                            Logs de Temps ({filteredTimeLogs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('meetings')}
                            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === 'meetings'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-calendar mr-2"></i>
                            Réunions ({filteredMeetings.length})
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'logs' ? (
                        /* Logs de temps */
                        <div className="space-y-4">
                            {filteredTimeLogs.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <i className="fas fa-clock text-4xl mb-4"></i>
                                    <p className="text-lg font-semibold">Aucun log de temps</p>
                                    <p className="text-sm">Commencez par enregistrer votre premier log de temps</p>
                                </div>
                            ) : (
                                filteredTimeLogs.map(log => (
                                    <div key={log.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className={`p-2 rounded-lg ${
                                                        log.entityType === 'project' ? 'bg-blue-100 text-blue-600' :
                                                        log.entityType === 'course' ? 'bg-green-100 text-green-600' :
                                                        'bg-purple-100 text-purple-600'
                                                    }`}>
                                                        <i className={`fas ${
                                                            log.entityType === 'project' ? 'fa-project-diagram' :
                                                            log.entityType === 'course' ? 'fa-graduation-cap' :
                                                            'fa-tasks'
                                                        }`}></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{log.entityTitle}</h3>
                                                        <p className="text-sm text-gray-600">{log.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span><i className="fas fa-calendar mr-1"></i>{log.date}</span>
                                                    <span><i className="fas fa-clock mr-1"></i>{Math.round(log.duration / 60)}h {log.duration % 60}min</span>
                                                    <span className="capitalize">{log.entityType}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingLog(log);
                                                        setLogModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                    title="Modifier"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingLogId(log.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                    title="Supprimer"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Réunions */
                        <div className="space-y-4">
                            {filteredMeetings.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <i className="fas fa-calendar text-4xl mb-4"></i>
                                    <p className="text-lg font-semibold">Aucune réunion</p>
                                    <p className="text-sm">Planifiez votre première réunion</p>
                                </div>
                            ) : (
                                filteredMeetings.map(meeting => (
                                    <div key={meeting.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                        <i className="fas fa-calendar"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                                                        <p className="text-sm text-gray-600">{meeting.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span><i className="fas fa-calendar mr-1"></i>{new Date(meeting.startTime).toLocaleDateString()}</span>
                                                    <span><i className="fas fa-clock mr-1"></i>{new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}</span>
                                                    <span><i className="fas fa-users mr-1"></i>{meeting.attendees.length} participants</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingMeeting(meeting);
                                                        setMeetingModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                    title="Modifier"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingMeetingId(meeting.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                    title="Supprimer"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            {isLogModalOpen && (
                <LogTimeModal
                    timeLog={editingLog}
                    projects={projects}
                    courses={courses}
                    onClose={() => {
                        setLogModalOpen(false);
                        setEditingLog(null);
                    }}
                    onSave={handleSaveLog}
                />
            )}

            {isMeetingModalOpen && (
                <MeetingFormModal
                    meeting={editingMeeting}
                    users={users}
                    onClose={() => {
                        setMeetingModalOpen(false);
                        setEditingMeeting(null);
                    }}
                    onSave={handleSaveMeeting}
                />
            )}

            {deletingLogId && (
                <ConfirmationModal
                    isOpen={!!deletingLogId}
                    onClose={() => setDeletingLogId(null)}
                    onConfirm={() => handleDeleteLog(deletingLogId)}
                    title="Supprimer le log de temps"
                    message="Êtes-vous sûr de vouloir supprimer ce log de temps ?"
                />
            )}

            {deletingMeetingId && (
                <ConfirmationModal
                    isOpen={!!deletingMeetingId}
                    onClose={() => setDeletingMeetingId(null)}
                    onConfirm={() => handleDeleteMeeting(deletingMeetingId)}
                    title="Supprimer la réunion"
                    message="Êtes-vous sûr de vouloir supprimer cette réunion ?"
                />
            )}
        </div>
    );
};

export default TimeTrackingModern;
