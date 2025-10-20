/**
 * 💼 JOBS ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Job, JobApplication, User } from '../types';
import { jobsService } from '../services/jobsService';
import { userService } from '../services/userService';
import JobFormModal from './forms/JobFormModal';
import ApplicationFormModal from './forms/ApplicationFormModal';
import ConfirmationModal from './common/ConfirmationModal';

// Types pour Jobs UltraModern
interface JobMetrics {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  averageSalary: number;
}

interface JobFilters {
  search: string;
  status: string;
  type: string;
  location: string;
  experience: string;
  salaryRange: { min: number; max: number };
}

const JobsUltraModernV3: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    status: '',
    type: '',
    location: '',
    experience: '',
    salaryRange: { min: 0, max: 10000000 }
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
      
      console.log('🔄 Chargement des données Jobs...');
      
      // Charger les emplois, candidatures et utilisateurs depuis Supabase
      const [jobsData, applicationsData, usersData] = await Promise.all([
        jobsService.getAllJobs(), // Récupérer tous les emplois pour l'instant
        jobsService.getAllApplications(),
        userService.getAll()
      ]);
      
      setJobs(jobsData);
      setApplications(applicationsData);
      setUsers(usersData);
      
      console.log(`✅ ${jobsData.length} emplois, ${applicationsData.length} candidatures et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données Jobs:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setJobs([]);
      setApplications([]);
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

  // Calculer les métriques
  const metrics: JobMetrics = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const closedJobs = jobs.filter(j => j.status === 'closed').length;
    
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
    
    const averageSalary = jobs.length > 0 
      ? jobs.reduce((sum, job) => sum + (job.salary?.min || 0), 0) / jobs.length 
      : 0;
    
    return {
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      averageSalary: Math.round(averageSalary)
    };
  }, [jobs, applications]);

  // Filtrer et trier les emplois
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesType = !filters.type || job.type === filters.type;
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });
    
    // Trier
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Job];
      let bValue: any = b[sortBy as keyof Job];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'postedDate') {
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
  }, [jobs, filters, sortBy, sortOrder]);

  // Filtrer les candidatures
  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      const matchesSearch = !filters.search || 
        application.candidateName.toLowerCase().includes(filters.search.toLowerCase()) ||
        application.jobTitle.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSearch;
    });
  }, [applications, filters]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvel Emploi',
      icon: PlusIcon,
      onClick: () => {
        setEditingJob(null);
        setShowJobModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Nouvelle Candidature',
      icon: UserGroupIcon,
      onClick: () => {
        setEditingApplication(null);
        setShowApplicationModal(true);
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
      onClick: () => {
        // TODO: Implémenter l'export
        console.log('Export des données Jobs');
      },
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  // Gestion des emplois
  const handleCreateJob = async (jobData: Job | Omit<Job, 'id'>) => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      let result: Job | null = null;
      
      if ('id' in jobData && jobData.id) {
        // Mise à jour
        result = await jobsService.updateJob(jobData.id, jobData);
      } else {
        // Création
        result = await jobsService.createJob(jobData as Omit<Job, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowJobModal(false);
        setEditingJob(null);
        console.log('✅ Emploi sauvegardé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde emploi:', error);
      setError('Erreur lors de la sauvegarde de l\'emploi');
    }
  };

  const handleDeleteJob = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await jobsService.deleteJob(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Emploi supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression emploi:', error);
      setError('Erreur lors de la suppression de l\'emploi');
    }
  };

  // Gestion des candidatures
  const handleCreateApplication = async (applicationData: JobApplication | Omit<JobApplication, 'id'>) => {
    try {
      let result: JobApplication | null = null;
      
      if ('id' in applicationData && applicationData.id) {
        // Mise à jour
        result = await jobsService.updateApplication(applicationData.id, applicationData);
      } else {
        // Création
        result = await jobsService.createApplication(applicationData as Omit<JobApplication, 'id'>);
      }
      
      if (result) {
        await loadData();
        setShowApplicationModal(false);
        setEditingApplication(null);
        console.log('✅ Candidature sauvegardée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde candidature:', error);
      setError('Erreur lors de la sauvegarde de la candidature');
    }
  };

  const handleDeleteApplication = async () => {
    if (!deletingItem) return;
    
    try {
      const success = await jobsService.deleteApplication(deletingItem.id);
      if (success) {
        await loadData();
        setShowDeleteModal(false);
        setDeletingItem(null);
        console.log('✅ Candidature supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression candidature:', error);
      setError('Erreur lors de la suppression de la candidature');
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Emplois</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos offres d'emploi et candidatures
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
            <BriefcaseIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Total Emplois</p>
              <p className="text-2xl font-bold">{metrics.totalJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Emplois Actifs</p>
              <p className="text-2xl font-bold">{metrics.activeJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Candidatures</p>
              <p className="text-2xl font-bold">{metrics.totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Salaire Moyen</p>
              <p className="text-2xl font-bold">{metrics.averageSalary.toLocaleString()} XOF</p>
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

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Emplois ({metrics.totalJobs})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Candidatures ({metrics.totalApplications})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Filtres et contrôles */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
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
                  <option value="active">Actif</option>
                  <option value="closed">Fermé</option>
                  <option value="draft">Brouillon</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les types</option>
                  <option value="Temps plein">Temps plein</option>
                  <option value="Temps partiel">Temps partiel</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
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
                </div>
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
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' ? (
            filteredAndSortedJobs.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun emploi</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {jobs.length === 0 
                    ? "Commencez par créer votre premier emploi."
                    : "Aucun emploi ne correspond à vos critères de recherche."
                  }
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingJob(null);
                      setShowJobModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouvel Emploi
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredAndSortedJobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{job.company}</p>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                          </div>
                          <div className="ml-4 flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                // TODO: Implémenter la vue détaillée
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingJob(job);
                                setShowJobModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingItem({ id: job.id, type: 'emploi' });
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
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            <span>{job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()} {job.salary?.currency}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'active' ? 'bg-green-100 text-green-800' :
                            job.status === 'closed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status === 'active' ? 'Actif' : job.status === 'closed' ? 'Fermé' : 'Brouillon'}
                          </span>
                          <span className="text-xs">
                            {job.applicationsCount} candidature(s)
                          </span>
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
                            Emploi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entreprise
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Localisation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidatures
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {job.company}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                job.status === 'active' ? 'bg-green-100 text-green-800' :
                                job.status === 'closed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {job.status === 'active' ? 'Actif' : job.status === 'closed' ? 'Fermé' : 'Brouillon'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.applicationsCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    // TODO: Implémenter la vue détaillée
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Voir détails"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingJob(job);
                                    setShowJobModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingItem({ id: job.id, type: 'emploi' });
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
              </div>
            )
          ) : (
            // Onglet Candidatures
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Candidatures</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filteredApplications.length === 0 
                  ? "Aucune candidature trouvée."
                  : `${filteredApplications.length} candidature(s) trouvée(s).`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showJobModal && (
        <JobFormModal
          isOpen={showJobModal}
          editingJob={editingJob}
          onSuccess={handleCreateJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
          }}
        />
      )}

      {showApplicationModal && (
        <ApplicationFormModal
          isOpen={showApplicationModal}
          editingApplication={editingApplication}
          jobId={editingApplication?.jobId || ''}
          onSuccess={handleCreateApplication}
          onClose={() => {
            setShowApplicationModal(false);
            setEditingApplication(null);
          }}
        />
      )}

      {showDeleteModal && deletingItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={deletingItem.type === 'emploi' ? handleDeleteJob : handleDeleteApplication}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
};

export default JobsUltraModernV3;
