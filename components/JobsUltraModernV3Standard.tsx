/**
 * 💼 JOBS ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture 100% identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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
import { Job, JobApplication, User } from '../types';
import { jobsService } from '../services/jobsService';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';
import JobFormModal from './forms/JobFormModal';
import ApplicationFormModal from './forms/ApplicationFormModal';

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

const JobsUltraModernV3Standard: React.FC = () => {
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
      
      console.log('🔄 Chargement des données Jobs...');
      
      // Charger les emplois, candidatures et utilisateurs depuis Supabase (temporairement sans filtrage strict)
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
      console.error('❌ Erreur chargement données:', error);
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
  const metrics = useMemo((): JobMetrics => {
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

  // Logique de filtrage et recherche
  const getFilteredAndSortedItems = (items: any[]) => {
    let filtered = items.filter(item => {
      const matchesSearch = !filters.search ||
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.company?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.location?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesType = !filters.type || filters.type === 'all' || item.type === filters.type;
      const matchesLocation = !filters.location || filters.location === 'all' || item.location === filters.location;
      const matchesExperience = !filters.experience || filters.experience === 'all' || item.experience === filters.experience;

      return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesExperience;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

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
  };

  const currentItems = useMemo(() => {
    switch (activeTab) {
      case 'jobs':
        return getFilteredAndSortedItems(jobs);
      case 'applications':
        return getFilteredAndSortedItems(applications);
      default:
        return [];
    }
  }, [activeTab, jobs, applications, filters, sortBy, sortOrder]);

  // Fonctions CRUD
  const handleCreateJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdJob = await jobsService.createJob(jobData);
      if (createdJob) {
        setJobs(prev => [createdJob, ...prev]);
        console.log('✅ Emploi créé avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création emploi:', error);
      setError('Erreur lors de la création de l\'emploi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      setLoading(true);
      const updatedJob = await jobsService.updateJob(id, jobData);
      if (updatedJob) {
        setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
        console.log('✅ Emploi mis à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour emploi:', error);
      setError('Erreur lors de la mise à jour de l\'emploi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      setLoading(true);
      await jobsService.deleteJob(id);
      setJobs(prev => prev.filter(job => job.id !== id));
      console.log('✅ Emploi supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression emploi:', error);
      setError('Erreur lors de la suppression de l\'emploi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdApplication = await jobsService.createApplication(applicationData);
      if (createdApplication) {
        setApplications(prev => [createdApplication, ...prev]);
        console.log('✅ Candidature créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création candidature:', error);
      setError('Erreur lors de la création de la candidature');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (id: string, applicationData: Partial<JobApplication>) => {
    try {
      setLoading(true);
      const updatedApplication = await jobsService.updateApplication(id, applicationData);
      if (updatedApplication) {
        setApplications(prev => prev.map(app => app.id === id ? updatedApplication : app));
        console.log('✅ Candidature mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour candidature:', error);
      setError('Erreur lors de la mise à jour de la candidature');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      setLoading(true);
      await jobsService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      console.log('✅ Candidature supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression candidature:', error);
      setError('Erreur lors de la suppression de la candidature');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      if (deletingItem.type === 'job') {
        await handleDeleteJob(deletingItem.id);
      } else if (deletingItem.type === 'application') {
        await handleDeleteApplication(deletingItem.id);
      }
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  // Fonctions utilitaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'closed': return <XMarkIcon className="w-4 h-4" />;
      case 'draft': return <ClockIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'accepted': return <CheckIcon className="w-4 h-4" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4" />;
      case 'interview': return <CalendarIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-yellow-100 text-yellow-800';
      case 'internship': return 'bg-purple-100 text-purple-800';
      case 'freelance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      case 'executive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des emplois...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Emplois</h1>
              <p className="text-gray-600">Offres d'emploi et candidatures</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingJob(null);
                  setEditingApplication(null);
                  if (activeTab === 'jobs') setShowJobModal(true);
                  else if (activeTab === 'applications') setShowApplicationModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {activeTab === 'jobs' ? 'Nouvel Emploi' : 'Nouvelle Candidature'}
              </button>
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
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Emplois</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Emplois Actifs</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.activeJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Candidatures</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalApplications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Salaire Moyen</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.averageSalary)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`${activeTab === 'jobs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Emplois
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`${activeTab === 'applications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Candidatures
            </button>
          </nav>
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
                <option value="active">Actif</option>
                <option value="closed">Fermé</option>
                <option value="draft">Brouillon</option>
                {activeTab === 'applications' && (
                  <>
                    <option value="pending">En attente</option>
                    <option value="accepted">Accepté</option>
                    <option value="rejected">Rejeté</option>
                    <option value="interview">Entretien</option>
                  </>
                )}
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="full-time">Temps plein</option>
                <option value="part-time">Temps partiel</option>
                <option value="contract">Contrat</option>
                <option value="internship">Stage</option>
                <option value="freelance">Freelance</option>
              </select>

              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les niveaux</option>
                <option value="entry">Débutant</option>
                <option value="mid">Intermédiaire</option>
                <option value="senior">Senior</option>
                <option value="executive">Cadre</option>
              </select>

              <input
                type="text"
                placeholder="Localisation"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

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
                <option value="title-asc">Titre A-Z</option>
                <option value="title-desc">Titre Z-A</option>
                <option value="salary-desc">Salaire (élevé)</option>
                <option value="salary-asc">Salaire (faible)</option>
                <option value="company-asc">Entreprise A-Z</option>
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
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des éléments */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élément trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.type || filters.location || filters.experience
                ? 'Aucun élément ne correspond aux filtres appliqués.'
                : `Commencez par créer votre premier ${activeTab === 'jobs' ? 'emploi' : 'candidature'}.`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingJob(null);
                  setEditingApplication(null);
                  if (activeTab === 'jobs') setShowJobModal(true);
                  else if (activeTab === 'applications') setShowApplicationModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un élément
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {item.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(item.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                        </div>
                        {activeTab === 'jobs' && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(item.experience)}`}>
                              {item.experience}
                            </span>
                            <span className="flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {item.location}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {activeTab === 'jobs' ? formatCurrency(item.salary?.min || 0) : item.applicantName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (activeTab === 'jobs') {
                              setEditingJob(item);
                              setShowJobModal(true);
                            } else if (activeTab === 'applications') {
                              setEditingApplication(item);
                              setShowApplicationModal(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setDeletingItem({ id: item.id, type: activeTab.slice(0, -1) });
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeTab === 'jobs' ? item.company : item.jobTitle || 'N/A'}
                      </div>
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
                          {activeTab === 'jobs' ? 'Emploi' : 'Candidature'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        {activeTab === 'jobs' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Salaire
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </td>
                          {activeTab === 'jobs' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.salary?.min || 0)}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'jobs') {
                                    setEditingJob(item);
                                    setShowJobModal(true);
                                  } else if (activeTab === 'applications') {
                                    setEditingApplication(item);
                                    setShowApplicationModal(true);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingItem({ id: item.id, type: activeTab.slice(0, -1) });
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
                          {activeTab === 'jobs' ? 'Emploi' : 'Candidature'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        {activeTab === 'jobs' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Salaire
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </td>
                          {activeTab === 'jobs' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(item.salary?.min || 0)}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'jobs') {
                                    setEditingJob(item);
                                    setShowJobModal(true);
                                  } else if (activeTab === 'applications') {
                                    setEditingApplication(item);
                                    setShowApplicationModal(true);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingItem({ id: item.id, type: activeTab.slice(0, -1) });
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
      <JobFormModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setEditingJob(null);
        }}
        onSuccess={editingJob ? 
          (data) => handleUpdateJob(editingJob.id, data) : 
          handleCreateJob
        }
        editingJob={editingJob}
        users={users}
      />

      <ApplicationFormModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setEditingApplication(null);
        }}
        onSuccess={editingApplication ? 
          (data) => handleUpdateApplication(editingApplication.id, data) : 
          handleCreateApplication
        }
        editingApplication={editingApplication}
        jobs={jobs}
        users={users}
      />

      {showDeleteModal && deletingItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={handleDelete}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      )}
    </div>
  );
};

export default JobsUltraModernV3Standard;
