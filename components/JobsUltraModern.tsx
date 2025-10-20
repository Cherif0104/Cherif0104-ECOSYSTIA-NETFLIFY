import React, { useState, useMemo } from 'react';
import { Job, JobApplication } from '../types';
import { jobsService } from '../services/jobsService';
import JobFormModal from './forms/JobFormModal';
import ApplicationFormModal from './forms/ApplicationFormModal';

interface JobsUltraModernProps {
  onAddJob?: (job: Job) => void;
  onUpdateJob?: (id: string, job: Job) => void;
  onDeleteJob?: (id: string) => void;
  onApplyJob?: (jobId: string, application: JobApplication) => void;
  onUpdateApplication?: (jobId: string, applicationId: string, application: JobApplication) => void;
  onDeleteApplication?: (jobId: string, applicationId: string) => void;
}

const JobsUltraModern: React.FC<JobsUltraModernProps> = ({
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onApplyJob,
  onUpdateApplication,
  onDeleteApplication
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'candidates' | 'analytics'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'salary' | 'applications'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'paused'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  
  // État pour les modales
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // États pour les données
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [jobsData, applicationsData] = await Promise.all([
          jobsService.getJobs(),
          jobsService.getApplications()
        ]);
        
        setJobs(jobsData);
        setApplications(applicationsData);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
        setJobs([]);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Métriques
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter(j => j.status === 'open').length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const averageSalary = jobs.length > 0 ? jobs.reduce((sum, j) => sum + (j.salary.min + j.salary.max) / 2, 0) / jobs.length : 0;
    const departments = [...new Set(jobs.map(j => j.department))].length;

    return {
      totalJobs,
      openJobs,
      totalApplications,
      pendingApplications,
      averageSalary,
      departments
    };
  }, [jobs, applications]);

  // Filtrage et tri
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment;
      const matchesLocation = filterLocation === 'all' || job.location === filterLocation;
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesLocation;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'salary':
          aValue = (a.salary.min + a.salary.max) / 2;
          bValue = (b.salary.min + b.salary.max) / 2;
          break;
        case 'applications':
          aValue = a.applicationsCount;
          bValue = b.applicationsCount;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [jobs, searchTerm, sortBy, sortOrder, filterStatus, filterDepartment, filterLocation]);

  const departments = useMemo(() => {
    const uniqueDepartments = [...new Set(jobs.map(j => j.department))];
    return uniqueDepartments;
  }, [jobs]);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(jobs.map(j => j.location))];
    return uniqueLocations;
  }, [jobs]);

  const formatCurrency = (amount: number, currency: string = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre d\'emploi ?')) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      if (onDeleteJob) onDeleteJob(jobId);
    }
  };

  const handleApplyJob = (job: Job) => {
    setSelectedJob(job);
    setEditingApplication(null);
    setIsApplicationModalOpen(true);
  };

  const handleEditApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setIsApplicationModalOpen(true);
  };

  const handleDeleteApplication = (applicationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      setApplications(prev => prev.filter(a => a.id !== applicationId));
      if (onDeleteApplication) onDeleteApplication('', applicationId);
    }
  };

  const renderJobCard = (job: Job) => (
    <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{job.company}</p>
            <p className="text-gray-500 text-sm mb-3">{job.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
              <span><i className="fas fa-briefcase mr-1"></i>{job.type}</span>
              <span><i className="fas fa-users mr-1"></i>{job.applicationsCount} candidatures</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
            </div>
            <div className="text-sm text-gray-500">par mois</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(job.level)}`}>
              {job.level}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {job.department}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <i className="fas fa-calendar mr-1"></i>
            Échéance: {formatDate(job.deadline)}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Compétences requises:</div>
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 3).map((req, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{job.requirements.length - 3} autres
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <i className="fas fa-clock mr-1"></i>
            Publié le {formatDate(job.createdAt)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditJob(job)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              onClick={() => handleApplyJob(job)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Voir candidatures"
            >
              <i className="fas fa-eye"></i>
            </button>
            <button
              onClick={() => handleDeleteJob(job.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplicationCard = (application: JobApplication) => {
    const job = jobs.find(j => j.id === application.jobId);
    return (
      <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {application.candidateName}
              </h4>
              <p className="text-gray-600 text-sm mb-2">{application.candidateEmail}</p>
              <p className="text-gray-500 text-sm mb-3">{job?.title} - {job?.company}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span><i className="fas fa-phone mr-1"></i>{application.candidatePhone}</span>
                <span><i className="fas fa-briefcase mr-1"></i>{application.experience} ans d'expérience</span>
                <span><i className="fas fa-calendar mr-1"></i>{formatDate(application.appliedAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getApplicationStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Compétences:</div>
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {application.notes && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Notes:</div>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{application.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <i className="fas fa-file-pdf mr-1"></i>
              {application.resume}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditApplication(application)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                onClick={() => handleDeleteApplication(application.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Emplois</h1>
              <p className="text-gray-600">Offres d'emploi et candidatures</p>
            </div>
            <button
              onClick={handleAddJob}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Nouvelle Offre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-briefcase text-2xl mr-3"></i>
              <div>
                <p className="text-blue-100 text-sm">Total Offres</p>
                <p className="text-2xl font-bold">{metrics.totalJobs}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-door-open text-2xl mr-3"></i>
              <div>
                <p className="text-green-100 text-sm">Offres Ouvertes</p>
                <p className="text-2xl font-bold">{metrics.openJobs}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-file-alt text-2xl mr-3"></i>
              <div>
                <p className="text-purple-100 text-sm">Candidatures</p>
                <p className="text-2xl font-bold">{metrics.totalApplications}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-clock text-2xl mr-3"></i>
              <div>
                <p className="text-yellow-100 text-sm">En Attente</p>
                <p className="text-2xl font-bold">{metrics.pendingApplications}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="px-6 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'jobs', label: 'Offres', icon: 'fas fa-briefcase' },
            { id: 'applications', label: 'Candidatures', icon: 'fas fa-file-alt' },
            { id: 'candidates', label: 'Candidats', icon: 'fas fa-users' },
            { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Rechercher des offres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="open">Ouvert</option>
              <option value="closed">Fermé</option>
              <option value="paused">En pause</option>
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les localisations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date de création</option>
              <option value="title">Titre</option>
              <option value="salary">Salaire</option>
              <option value="applications">Candidatures</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Trier ${sortOrder === 'asc' ? 'décroissant' : 'croissant'}`}
            >
              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Boutons de vue */}
      <div className="px-6 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Vue:</span>
          <div className="flex space-x-1">
            {[
              { id: 'grid', icon: 'fas fa-th', label: 'Grille' },
              { id: 'list', icon: 'fas fa-list', label: 'Liste' },
              { id: 'kanban', icon: 'fas fa-columns', label: 'Kanban' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === mode.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={mode.label}
              >
                <i className={mode.icon}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 pb-6">
        {activeTab === 'jobs' && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredJobs.map(job => renderJobCard(job))}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.map(application => renderApplicationCard(application))}
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="grid gap-6">
            {applications.map(application => renderApplicationCard(application))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par département</h3>
              <div className="space-y-4">
                {departments.map(dept => {
                  const count = jobs.filter(j => j.department === dept).length;
                  return (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-gray-600">{dept}</span>
                      <span className="font-semibold">{count} offres</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Salaire moyen</span>
                  <span className="font-semibold text-green-600">{formatCurrency(metrics.averageSalary)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Départements actifs</span>
                  <span className="font-semibold">{metrics.departments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taux de candidature</span>
                  <span className="font-semibold">
                    {metrics.totalJobs > 0 ? Math.round(metrics.totalApplications / metrics.totalJobs) : 0} par offre
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales améliorées avec formulaires complets */}
      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
        onSuccess={() => {
          // Recharger les offres depuis le service
          jobsService.getJobs().then(setJobs);
        }}
        editingJob={editingJob}
      />

      {isApplicationModalOpen && selectedJob && (
        <ApplicationFormModal
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setEditingApplication(null);
          }}
          onSuccess={() => {
            // Recharger les candidatures
            jobsService.getApplicationsByJob(selectedJob.id).then(setApplications);
          }}
          jobId={selectedJob.id}
          editingApplication={editingApplication}
        />
      )}
    </div>
  );
};

export default JobsUltraModern;
