import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { TimeLog, Project, Course, Meeting, User } from '../types';
import { timeLogService } from '../services/timeLogService';
import { projectService } from '../services/projectService';
import LogTimeModal from './LogTimeModal';
import ConfirmationModal from './common/ConfirmationModal';

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
        onSave(isEditMode ? { ...meeting, ...meetingData } as Meeting : meetingData as Omit<Meeting, 'id'>);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isEditMode ? t('edit_meeting') : t('add_meeting')}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('title')}
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('description')}
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('start_date')}
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('start_time')}
                                    </label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('end_date')}
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('end_time')}
                                    </label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('attendees')}
                                </label>
                                <select
                                    name="attendees"
                                    value={formData.attendees}
                                    onChange={handleTeamChange}
                                    multiple
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {isEditMode ? t('update') : t('add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MeetingDetailModal: React.FC<{
    meeting: Meeting;
    onClose: () => void;
    onEdit: (meeting: Meeting) => void;
    onDelete: (meetingId: number) => void;
}> = ({ meeting, onClose, onEdit, onDelete }) => {
    const { t } = useLocalization();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('description')}
                            </label>
                            <p className="text-gray-900">{meeting.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('start_time')}
                                </label>
                                <p className="text-gray-900">
                                    {new Date(meeting.startTime).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('end_time')}
                                </label>
                                <p className="text-gray-900">
                                    {new Date(meeting.endTime).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t('attendees')}
                            </label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {meeting.attendees.map(attendee => (
                                    <span
                                        key={attendee.id}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {attendee.firstName} {attendee.lastName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={() => onEdit(meeting)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {t('edit')}
                    </button>
                    <button
                        onClick={() => onDelete(meeting.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        {t('delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface TimeTrackingSupabaseProps {
  projects: Project[];
  courses: Course[];
}

const TimeTrackingSupabase: React.FC<TimeTrackingSupabaseProps> = ({ projects, courses }) => {
  const { t, language } = useLocalization();
  const { user } = useAuth();
  
  // États pour les données
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'interface
  const [activeTab, setActiveTab] = useState<'logs' | 'calendar'>('logs');
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [isMeetingFormOpen, setMeetingFormOpen] = useState(false);
  const [isMeetingDetailOpen, setMeetingDetailOpen] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<number | null>(null);
  const [logInitialValues, setLogInitialValues] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les time logs
      const timeLogsData = await timeLogService.getTimeLogs();
      setTimeLogs(timeLogsData);

      // Charger les projets pour les time logs
      const projectsData = await projectService.getAll();
      
      // Pour l'instant, utiliser des utilisateurs mockés
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

      // Pour l'instant, utiliser des meetings mockés
      setMeetings([]);

      console.log(`✅ ${timeLogsData.length} time logs chargés`);
    } catch (error: any) {
      console.error('❌ Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const userTimeLogs = timeLogs.filter(log => log.userId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveLog = async (logData: Omit<TimeLog, 'id' | 'userId'>) => {
    try {
      const newLog = await timeLogService.createTimeLog({
        ...logData,
        userId: user.id
      });
      
      if (newLog) {
        setTimeLogs(prev => [newLog, ...prev]);
        console.log('✅ Time log créé');
      }
    } catch (error: any) {
      console.error('❌ Erreur création time log:', error);
      setError('Erreur lors de la création du time log');
    }
    
    setLogModalOpen(false);
    setLogInitialValues(null);
  };

  const handleSaveMeeting = async (data: Meeting | Omit<Meeting, 'id'>) => {
    try {
      if ('id' in data) {
        // Mise à jour - pour l'instant, simulation locale
        setMeetings(prev => prev.map(m => m.id === data.id ? data : m));
        console.log('✅ Meeting mis à jour');
      } else {
        // Création - pour l'instant, simulation locale
        const newMeeting: Meeting = {
          ...data,
          id: Date.now(),
        };
        setMeetings(prev => [...prev, newMeeting]);
        console.log('✅ Meeting créé');
      }
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde meeting:', error);
      setError('Erreur lors de la sauvegarde du meeting');
    }
    
    setMeetingFormOpen(false);
    setEditingMeeting(null);
  };
  
  const handleEditMeeting = (meeting: Meeting) => {
      setEditingMeeting(meeting);
      setMeetingDetailOpen(null);
      setMeetingFormOpen(true);
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    try {
      // Pour l'instant, simulation locale
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      setDeletingMeetingId(null);
      console.log('✅ Meeting supprimé');
    } catch (error: any) {
      console.error('❌ Erreur suppression meeting:', error);
      setError('Erreur lors de la suppression du meeting');
    }
  };

  const handleEditLog = (log: TimeLog) => {
    setLogInitialValues({
      projectId: log.projectId,
      taskId: log.taskId,
      courseId: log.courseId,
      description: log.description,
      duration: log.duration,
      date: log.date,
      startTime: log.startTime,
      endTime: log.endTime,
      type: log.type,
    });
    setLogModalOpen(true);
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const success = await timeLogService.deleteTimeLog(logId);
      if (success) {
        setTimeLogs(prev => prev.filter(log => log.id !== logId));
        console.log('✅ Time log supprimé');
      }
    } catch (error: any) {
      console.error('❌ Erreur suppression time log:', error);
      setError('Erreur lors de la suppression du time log');
    }
  };

  // Calculs des métriques
  const todayLogs = userTimeLogs.filter(log => log.date === new Date().toISOString().split('T')[0]);
  const weekLogs = userTimeLogs.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  const totalToday = todayLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalWeek = weekLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalAllTime = userTimeLogs.reduce((sum, log) => sum + log.duration, 0);

  const projectTime = userTimeLogs.reduce((acc, log) => {
    if (log.projectId) {
      acc[log.projectId] = (acc[log.projectId] || 0) + log.duration;
    }
    return acc;
  }, {} as Record<string, number>);

  const courseTime = userTimeLogs.reduce((acc, log) => {
    if (log.courseId) {
      acc[log.courseId] = (acc[log.courseId] || 0) + log.duration;
    }
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Chargement des données...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('time_tracking')}</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setLogModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <i className="fas fa-plus mr-2"></i>
            {t('log_time')}
          </button>
          <button
            onClick={() => setMeetingFormOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            {t('add_meeting')}
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="fas fa-clock text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('today')}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalToday}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="fas fa-calendar-week text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('this_week')}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalWeek}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <i className="fas fa-chart-line text-purple-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('all_time')}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalAllTime}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-list mr-2"></i>
            {t('time_logs')}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-calendar mr-2"></i>
            {t('calendar')}
          </button>
        </nav>
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'logs' ? (
        <div className="space-y-6">
          {/* Répartition par projet */}
          {Object.keys(projectTime).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('project_time')}</h3>
              <div className="space-y-3">
                {Object.entries(projectTime).map(([projectId, duration]) => {
                  const project = projects.find(p => p.id === projectId);
                  return (
                    <div key={projectId} className="flex justify-between items-center">
                      <span className="text-gray-700">{project?.title || `Projet ${projectId}`}</span>
                      <span className="font-semibold text-gray-900">{duration}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Répartition par cours */}
          {Object.keys(courseTime).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('course_time')}</h3>
              <div className="space-y-3">
                {Object.entries(courseTime).map(([courseId, duration]) => {
                  const course = courses.find(c => c.id === courseId);
                  return (
                    <div key={courseId} className="flex justify-between items-center">
                      <span className="text-gray-700">{course?.title || `Cours ${courseId}`}</span>
                      <span className="font-semibold text-gray-900">{duration}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Liste des time logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('recent_logs')}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {userTimeLogs.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <i className="fas fa-clock text-4xl mb-4"></i>
                  <p>{t('no_time_logs')}</p>
                </div>
              ) : (
                userTimeLogs.map(log => (
                  <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {log.description || t('no_description')}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {log.type}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {log.projectId && (
                            <span className="mr-4">
                              <i className="fas fa-project-diagram mr-1"></i>
                              {projects.find(p => p.id === log.projectId)?.title || `Projet ${log.projectId}`}
                            </span>
                          )}
                          {log.courseId && (
                            <span className="mr-4">
                              <i className="fas fa-book mr-1"></i>
                              {courses.find(c => c.id === log.courseId)?.title || `Cours ${log.courseId}`}
                            </span>
                          )}
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            {new Date(log.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">{log.duration}h</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditLog(log)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('meetings')}</h3>
          {meetings.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-calendar text-4xl mb-4"></i>
              <p>{t('no_meetings')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map(meeting => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                      <p className="text-sm text-gray-600">{meeting.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setMeetingDetailOpen(meeting)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => handleEditMeeting(meeting)}
                        className="p-2 text-gray-400 hover:text-green-600"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => setDeletingMeetingId(meeting.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {isLogModalOpen && (
        <LogTimeModal
          onClose={() => {
            setLogModalOpen(false);
            setLogInitialValues(null);
          }}
          onSave={handleSaveLog}
          projects={projects}
          courses={courses}
          initialValues={logInitialValues}
        />
      )}

      {isMeetingFormOpen && (
        <MeetingFormModal
          meeting={editingMeeting}
          users={users}
          onClose={() => {
            setMeetingFormOpen(false);
            setEditingMeeting(null);
          }}
          onSave={handleSaveMeeting}
        />
      )}

      {isMeetingDetailOpen && (
        <MeetingDetailModal
          meeting={isMeetingDetailOpen}
          onClose={() => setMeetingDetailOpen(null)}
          onEdit={handleEditMeeting}
          onDelete={handleDeleteMeeting}
        />
      )}

      {deletingMeetingId && (
        <ConfirmationModal
          isOpen={!!deletingMeetingId}
          onClose={() => setDeletingMeetingId(null)}
          onConfirm={() => handleDeleteMeeting(deletingMeetingId)}
          title={t('delete_meeting')}
          message={t('confirm_delete_meeting')}
        />
      )}
    </div>
  );
};

export default TimeTrackingSupabase;
