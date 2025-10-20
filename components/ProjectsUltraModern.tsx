import React, { useState, useEffect, useMemo } from 'react';
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
import Avatar from './common/Avatar';
import AvatarGroup from './common/AvatarGroup';

// ===== MODALE DE DÉTAIL DE PROJET ULTRA-MODERNE =====

const ProjectDetailUltraModal: React.FC<{
    project: Project | null;
    onClose: () => void;
    onEdit: (project: Project) => void;
    onDelete: (projectId: string) => void;
    onManageTeam: (project: Project) => void;
}> = ({ project, onClose, onEdit, onDelete, onManageTeam }) => {
    const { t } = useLocalization();
    
    if (!project) return null;

    const progress = project.tasks.length > 0 
        ? (project.tasks.filter(task => task.status === 'Done').length / project.tasks.length) * 100
        : 0;

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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Low': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header avec gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <i className="fas fa-project-diagram text-2xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{project.title}</h2>
                                    <p className="text-blue-100 text-lg">{project.client || 'Projet interne'}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                                    <i className="fas fa-flag mr-2"></i>
                                    {project.status}
                                </span>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {project.priority}
                                </span>
                                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                                    <i className="fas fa-calendar mr-2"></i>
                                    Échéance: {new Date(project.dueDate).toLocaleDateString()}
                                </span>
                                {project.budget && (
                                    <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                                        <i className="fas fa-euro-sign mr-2"></i>
                                        Budget: {project.budget.toLocaleString()} €
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => onManageTeam(project)}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                title="Gérer l'équipe"
                            >
                                <i className="fas fa-users text-xl"></i>
                            </button>
                            <button
                                onClick={() => onEdit(project)}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                title="Modifier"
                            >
                                <i className="fas fa-edit text-xl"></i>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                                title="Fermer"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="p-8">
                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <i className="fas fa-align-left mr-3 text-blue-600"></i>
                            Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{project.description}</p>
                    </div>

                    {/* Métriques */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-500 rounded-xl text-white">
                                    <i className="fas fa-tasks text-xl"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-blue-600 text-sm font-semibold">Tâches</p>
                                    <p className="text-2xl font-bold text-blue-900">{project.tasks.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-xl text-white">
                                    <i className="fas fa-check-circle text-xl"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-green-600 text-sm font-semibold">Terminées</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {project.tasks.filter(t => t.status === 'Done').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-xl text-white">
                                    <i className="fas fa-users text-xl"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-purple-600 text-sm font-semibold">Équipe</p>
                                    <p className="text-2xl font-bold text-purple-900">{project.team.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-500 rounded-xl text-white">
                                    <i className="fas fa-exclamation-triangle text-xl"></i>
                                </div>
                                <div className="ml-4">
                                    <p className="text-orange-600 text-sm font-semibold">Risques</p>
                                    <p className="text-2xl font-bold text-orange-900">{project.risks.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Progression du projet</h3>
                            <span className="text-lg font-bold text-blue-600">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Contenu en onglets */}
                    <div className="space-y-8">
                        {/* Onglet Tâches */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-tasks mr-3 text-blue-600"></i>
                                Tâches ({project.tasks.length})
                            </h3>
                            <div className="space-y-3">
                                {project.tasks.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
                                        <i className="fas fa-tasks text-4xl mb-4"></i>
                                        <p>Aucune tâche définie</p>
                                    </div>
                                ) : (
                                    project.tasks.map(task => (
                                        <div key={task.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{task.text}</h4>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            task.status === 'Done' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {task.status}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {task.priority}
                                                        </span>
                                                        {task.assignee && (
                                                            <span className="flex items-center">
                                                                <Avatar 
                                                                    user={task.assignee} 
                                                                    size="sm"
                                                                    className="mr-2"
                                                                />
                                                                {task.assignee.firstName} {task.assignee.lastName}
                                                            </span>
                                                        )}
                                                        {task.dueDate && (
                                                            <span>
                                                                <i className="fas fa-calendar mr-1"></i>
                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Onglet Équipe */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-users mr-3 text-blue-600"></i>
                                Équipe ({project.team.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.team.map(member => (
                                    <div key={member.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-3">
                                            <Avatar 
                                                user={member} 
                                                size="lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    {member.firstName} {member.lastName}
                                                </h4>
                                                <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {member.skills.slice(0, 2).map(skill => (
                                                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {member.skills.length > 2 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            +{member.skills.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Onglet Risques */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-exclamation-triangle mr-3 text-blue-600"></i>
                                Risques ({project.risks.length})
                            </h3>
                            <div className="space-y-3">
                                {project.risks.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl">
                                        <i className="fas fa-shield-alt text-4xl mb-4"></i>
                                        <p>Aucun risque identifié</p>
                                    </div>
                                ) : (
                                    project.risks.map(risk => (
                                        <div key={risk.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{risk.description}</h4>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            risk.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                                                            risk.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            Probabilité: {risk.likelihood}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            risk.impact === 'High' ? 'bg-red-100 text-red-800' :
                                                            risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            Impact: {risk.impact}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <strong>Stratégie d'atténuation:</strong> {risk.mitigationStrategy}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer avec actions */}
                <div className="px-8 py-6 bg-gray-50 rounded-b-3xl flex justify-between items-center">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => onManageTeam(project)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-colors"
                        >
                            <i className="fas fa-users mr-2"></i>
                            Gérer l'équipe
                        </button>
                        <button
                            onClick={() => onEdit(project)}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold transition-colors"
                        >
                            <i className="fas fa-edit mr-2"></i>
                            Modifier
                        </button>
                    </div>
                    <button
                        onClick={() => onDelete(project.id)}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold transition-colors"
                    >
                        <i className="fas fa-trash mr-2"></i>
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===== COMPOSANT PRINCIPAL =====

interface ProjectsUltraModernProps {
    timeLogs: TimeLog[];
    onAddTimeLog: (timeLog: TimeLog) => void;
}

const ProjectsUltraModern: React.FC<ProjectsUltraModernProps> = ({ 
    timeLogs, 
    onAddTimeLog 
}) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    
    // États pour les données
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour l'interface
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [isTeamModalOpen, setTeamModalOpen] = useState(false);
    const [projectForTeam, setProjectForTeam] = useState<Project | null>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [projectForDetail, setProjectForDetail] = useState<Project | null>(null);
    
    // États pour les filtres et vues
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<'title' | 'dueDate' | 'createdAt' | 'priority'>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Charger les données
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [projectsData, usersData] = await Promise.all([
                projectService.getAll(),
                userService.getAll()
            ]);
            
            setProjects(projectsData);
            setUsers(usersData);
            
            console.log(`✅ ${projectsData.length} projets et ${usersData.length} utilisateurs chargés`);
        } catch (error: any) {
            console.error('❌ Erreur chargement données:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProject = async (projectData: Project | Omit<Project, 'id'>) => {
        try {
            setError(null);
            
            if ('id' in projectData) {
                // Mise à jour
                const updatedProject = await projectService.update(projectData.id, projectData);
                if (updatedProject) {
                    setProjects(prev => prev.map(p => p.id === projectData.id ? updatedProject : p));
                    console.log('✅ Projet mis à jour');
                }
            } else {
                // Création
                if (!currentUser) throw new Error('Utilisateur non connecté');
                const newProject = await projectService.create(projectData, currentUser.id);
                if (newProject) {
                    setProjects(prev => [...prev, newProject]);
                    console.log('✅ Projet créé');
                }
            }
            
            setFormModalOpen(false);
            setEditingProject(null);
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde projet:', error);
            setError('Erreur lors de la sauvegarde du projet');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            const success = await projectService.delete(projectId);
            if (success) {
                setProjects(prev => prev.filter(p => p.id !== projectId));
                setDeleteModalOpen(false);
                setProjectToDelete(null);
                console.log('✅ Projet supprimé');
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression projet:', error);
            setError('Erreur lors de la suppression du projet');
        }
    };

    const handleTeamUpdate = (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    };

    // Filtrer et trier les projets
    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects;

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.client?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        // Filtre par priorité
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(project => project.priority === priorityFilter);
        }

        // Tri
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title;
                    bValue = b.title;
                    break;
                case 'dueDate':
                    aValue = new Date(a.dueDate);
                    bValue = new Date(b.dueDate);
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt || '');
                    bValue = new Date(b.createdAt || '');
                    break;
                case 'priority':
                    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                    aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
                    bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [projects, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

    // Calculer les métriques
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const overdueProjects = projects.filter(p => 
        p.status !== 'Completed' && new Date(p.dueDate) < new Date()
    ).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Chargement des projets...</p>
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
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-4xl font-bold mb-2">Gestion des Projets</h2>
                        <p className="text-indigo-100 text-lg">Organisez et suivez vos projets en temps réel</p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setFormModalOpen(true)}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 font-semibold"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Nouveau Projet
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 font-semibold"
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                            Retour
                        </button>
                    </div>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center">
                            <div className="p-4 bg-white/20 rounded-xl">
                                <i className="fas fa-project-diagram text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-indigo-100 text-sm">Total Projets</p>
                                <p className="text-3xl font-bold">{totalProjects}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center">
                            <div className="p-4 bg-white/20 rounded-xl">
                                <i className="fas fa-play-circle text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-indigo-100 text-sm">En Cours</p>
                                <p className="text-3xl font-bold">{activeProjects}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center">
                            <div className="p-4 bg-white/20 rounded-xl">
                                <i className="fas fa-check-circle text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-indigo-100 text-sm">Terminés</p>
                                <p className="text-3xl font-bold">{completedProjects}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center">
                            <div className="p-4 bg-white/20 rounded-xl">
                                <i className="fas fa-exclamation-triangle text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-indigo-100 text-sm">En Retard</p>
                                <p className="text-3xl font-bold">{overdueProjects}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un projet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="Not Started">Non démarré</option>
                            <option value="In Progress">En cours</option>
                            <option value="Completed">Terminé</option>
                            <option value="On Hold">En pause</option>
                            <option value="Cancelled">Annulé</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Toutes les priorités</option>
                            <option value="Low">Faible</option>
                            <option value="Medium">Moyenne</option>
                            <option value="High">Élevée</option>
                            <option value="Critical">Critique</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="dueDate">Trier par échéance</option>
                            <option value="title">Trier par titre</option>
                            <option value="createdAt">Trier par date de création</option>
                            <option value="priority">Trier par priorité</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                        </button>
                    </div>
                </div>

                {/* Boutons de vue */}
                <div className="flex justify-between items-center mt-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                viewMode === 'grid' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <i className="fas fa-th mr-2"></i>
                            Grille
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <i className="fas fa-list mr-2"></i>
                            Liste
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                viewMode === 'kanban' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <i className="fas fa-columns mr-2"></i>
                            Kanban
                        </button>
                    </div>

                    <div className="text-sm text-gray-600">
                        {filteredAndSortedProjects.length} projet{filteredAndSortedProjects.length > 1 ? 's' : ''} trouvé{filteredAndSortedProjects.length > 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Liste des projets */}
            <div className="space-y-6">
                {filteredAndSortedProjects.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-white rounded-2xl shadow-lg">
                        <i className="fas fa-project-diagram text-6xl mb-4"></i>
                        <p className="text-xl font-semibold mb-2">Aucun projet trouvé</p>
                        <p className="text-sm">Commencez par créer votre premier projet</p>
                        <div className="mt-4 text-xs text-gray-400">
                            <p>Projets chargés: {projects.length}</p>
                            <p>Filtres appliqués: {searchTerm ? `Recherche: "${searchTerm}"` : 'Aucun'}</p>
                            <p>Statut: {statusFilter !== 'all' ? statusFilter : 'Tous'}</p>
                            <p>Priorité: {priorityFilter !== 'all' ? priorityFilter : 'Toutes'}</p>
                        </div>
                    </div>
                ) : (
                    filteredAndSortedProjects.map(project => {
                        const progress = project.tasks.length > 0 
                            ? (project.tasks.filter(task => task.status === 'Done').length / project.tasks.length) * 100
                            : 0;

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

                        const getPriorityColor = (priority: string) => {
                            switch (priority) {
                                case 'Low': return 'bg-green-100 text-green-800';
                                case 'Medium': return 'bg-yellow-100 text-yellow-800';
                                case 'High': return 'bg-orange-100 text-orange-800';
                                case 'Critical': return 'bg-red-100 text-red-800';
                                default: return 'bg-gray-100 text-gray-800';
                            }
                        };

                        return (
                            <div key={project.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                                                    {project.priority}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{project.description}</p>
                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <span><i className="fas fa-calendar mr-1"></i>Échéance: {new Date(project.dueDate).toLocaleDateString()}</span>
                                                <span><i className="fas fa-users mr-1"></i>Équipe: {project.team.length}</span>
                                                <span><i className="fas fa-tasks mr-1"></i>Tâches: {project.tasks.length}</span>
                                                {project.budget && (
                                                    <span><i className="fas fa-euro-sign mr-1"></i>Budget: {project.budget.toLocaleString()} €</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setProjectForDetail(project);
                                                    setDetailModalOpen(true);
                                                }}
                                                className="p-3 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                                                title="Voir les détails"
                                            >
                                                <i className="fas fa-eye text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingProject(project);
                                                    setFormModalOpen(true);
                                                }}
                                                className="p-3 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 transition-colors"
                                                title="Modifier"
                                            >
                                                <i className="fas fa-edit text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProjectForTeam(project);
                                                    setTeamModalOpen(true);
                                                }}
                                                className="p-3 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
                                                title="Gérer l'équipe"
                                            >
                                                <i className="fas fa-users text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProjectToDelete(project.id);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="p-3 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                                                title="Supprimer"
                                            >
                                                <i className="fas fa-trash text-lg"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Barre de progression */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Progression</span>
                                            <span>{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {project.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modales */}
            {isFormModalOpen && (
                <ProjectFormModal
                    project={editingProject}
                    users={users}
                    onClose={() => {
                        setFormModalOpen(false);
                        setEditingProject(null);
                    }}
                    onSave={handleSaveProject}
                />
            )}

            {isDeleteModalOpen && projectToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setProjectToDelete(null);
                    }}
                    onConfirm={() => handleDeleteProject(projectToDelete)}
                    title="Supprimer le projet"
                    message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
                />
            )}

            {isTeamModalOpen && projectForTeam && (
                <TeamManagementModal
                    project={projectForTeam}
                    users={users}
                    onClose={() => {
                        setTeamModalOpen(false);
                        setProjectForTeam(null);
                    }}
                    onUpdate={handleTeamUpdate}
                />
            )}

            {isDetailModalOpen && projectForDetail && (
                <ProjectDetailUltraModal
                    project={projectForDetail}
                    onClose={() => {
                        setDetailModalOpen(false);
                        setProjectForDetail(null);
                    }}
                    onEdit={(project) => {
                        setEditingProject(project);
                        setFormModalOpen(true);
                        setDetailModalOpen(false);
                    }}
                    onDelete={(projectId) => {
                        setProjectToDelete(projectId);
                        setDeleteModalOpen(true);
                        setDetailModalOpen(false);
                    }}
                    onManageTeam={(project) => {
                        setProjectForTeam(project);
                        setTeamModalOpen(true);
                        setDetailModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProjectsUltraModern;
