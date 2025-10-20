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
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import JobFormModal from './forms/JobFormModal';
import ApplicationFormModal from './forms/ApplicationFormModal';
import { Job, JobApplication } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

const JobsUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Job | JobApplication | null>(null);

  // Mock data - En production, ces données viendraient d'Supabase
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Développeur React Senior',
      description: 'Nous recherchons un développeur React expérimenté pour rejoindre notre équipe de développement.',
      company: 'TechCorp',
      location: 'Dakar, Sénégal',
      type: 'Temps plein',
      salary: '800000 - 1200000 XOF',
      experience: '3-5 ans',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      status: 'Open',
      postedAt: '2024-01-20T10:00:00Z',
      deadline: '2024-02-20T23:59:59Z',
      applicationsCount: 25,
      viewsCount: 150,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Chef de Projet Digital',
      description: 'Gestion de projets digitaux et coordination d\'équipes multidisciplinaires.',
      company: 'Digital Agency',
      location: 'Abidjan, Côte d\'Ivoire',
      type: 'Temps plein',
      salary: '600000 - 900000 XOF',
      experience: '2-4 ans',
      skills: ['Gestion de projet', 'Agile', 'Scrum', 'Communication'],
      status: 'Open',
      postedAt: '2024-01-18T14:30:00Z',
      deadline: '2024-02-18T23:59:59Z',
      applicationsCount: 18,
      viewsCount: 95,
      createdAt: '2024-01-18T14:30:00Z',
      updatedAt: '2024-01-18T14:30:00Z'
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      description: 'Création d\'interfaces utilisateur modernes et intuitives.',
      company: 'Design Studio',
      location: 'Remote',
      type: 'Freelance',
      salary: '400000 - 600000 XOF',
      experience: '1-3 ans',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      status: 'Closed',
      postedAt: '2024-01-15T09:00:00Z',
      deadline: '2024-02-15T23:59:59Z',
      applicationsCount: 32,
      viewsCount: 200,
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-20T16:00:00Z'
    }
  ]);

  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Développeur React Senior',
      candidateId: 'candidate-1',
      candidateName: 'Alice Johnson',
      candidateEmail: 'alice.johnson@email.com',
      candidatePhone: '+221 77 123 45 67',
      resumeUrl: '/resumes/alice-johnson.pdf',
      coverLetter: 'Je suis très intéressée par ce poste de développeur React...',
      status: 'Pending',
      appliedAt: '2024-01-21T15:30:00Z',
      reviewedAt: null,
      notes: 'Profil intéressant, à contacter pour entretien',
      experience: '4 ans',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
      createdAt: '2024-01-21T15:30:00Z',
      updatedAt: '2024-01-21T15:30:00Z'
    },
    {
      id: '2',
      jobId: '2',
      jobTitle: 'Chef de Projet Digital',
      candidateId: 'candidate-2',
      candidateName: 'Bob Smith',
      candidateEmail: 'bob.smith@email.com',
      candidatePhone: '+225 07 98 76 54 32',
      resumeUrl: '/resumes/bob-smith.pdf',
      coverLetter: 'Avec mon expérience en gestion de projet...',
      status: 'Interview',
      appliedAt: '2024-01-19T11:20:00Z',
      reviewedAt: '2024-01-20T10:00:00Z',
      notes: 'Entretien programmé pour le 25 janvier',
      experience: '3 ans',
      skills: ['Gestion de projet', 'Agile', 'Scrum', 'Jira', 'Communication'],
      createdAt: '2024-01-19T11:20:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      id: '3',
      jobId: '1',
      jobTitle: 'Développeur React Senior',
      candidateId: 'candidate-3',
      candidateName: 'Charlie Brown',
      candidateEmail: 'charlie.brown@email.com',
      candidatePhone: '+221 78 90 12 34',
      resumeUrl: '/resumes/charlie-brown.pdf',
      coverLetter: 'Passionné par le développement frontend...',
      status: 'Rejected',
      appliedAt: '2024-01-22T08:45:00Z',
      reviewedAt: '2024-01-22T14:30:00Z',
      notes: 'Profil junior, ne correspond pas aux exigences',
      experience: '1 an',
      skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      createdAt: '2024-01-22T08:45:00Z',
      updatedAt: '2024-01-22T14:30:00Z'
    }
  ]);

  // Calculs de métriques
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter(job => job.status === 'Open').length;
    const closedJobs = jobs.filter(job => job.status === 'Closed').length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'Pending').length;
    const interviewApplications = applications.filter(app => app.status === 'Interview').length;
    const hiredApplications = applications.filter(app => app.status === 'Hired').length;
    const rejectedApplications = applications.filter(app => app.status === 'Rejected').length;
    const avgApplicationsPerJob = totalJobs > 0 ? totalApplications / totalJobs : 0;
    const conversionRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;

    return {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      interviewApplications,
      hiredApplications,
      rejectedApplications,
      avgApplicationsPerJob,
      conversionRate
    };
  }, [jobs, applications]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'jobs':
        data = jobs;
        break;
      case 'applications':
        data = applications;
        break;
    }

    return data.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesLocation = filterLocation === 'all' || item.location === filterLocation;
      
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [activeTab, jobs, applications, searchTerm, filterStatus, filterLocation]);

  const handleCreate = () => {
    setEditingItem(null);
    switch (activeTab) {
      case 'jobs':
        setShowJobModal(true);
        break;
      case 'applications':
        setShowApplicationModal(true);
        break;
    }
  };

  const handleEdit = (item: Job | JobApplication) => {
    setEditingItem(item);
    switch (activeTab) {
      case 'jobs':
        setShowJobModal(true);
        break;
      case 'applications':
        setShowApplicationModal(true);
        break;
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      switch (activeTab) {
        case 'jobs':
          setJobs(prev => prev.filter(job => job.id !== id));
          break;
        case 'applications':
          setApplications(prev => prev.filter(app => app.id !== id));
          break;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
      case 'Hired':
        return 'bg-green-100 text-green-800';
      case 'Pending':
      case 'Interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Temps plein':
        return 'bg-blue-100 text-blue-800';
      case 'Temps partiel':
        return 'bg-purple-100 text-purple-800';
      case 'Freelance':
        return 'bg-orange-100 text-orange-800';
      case 'Stage':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                {t('jobs_management')}
              </h1>
              <p className="text-gray-600 mt-1">{t('manage_jobs_applications')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('kanban_view')}
              >
                <CalendarIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('grid_view')}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('list_view')}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                {t('add_new')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_jobs')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('open')}: {metrics.openJobs}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_applications')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('pending')}: {metrics.pendingApplications}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('interviews')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.interviewApplications}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600 font-medium">{t('hired')}: {metrics.hiredApplications}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('conversion_rate')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-medium">{t('avg_per_job')}: {metrics.avgApplicationsPerJob.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'jobs', label: t('jobs'), count: jobs.length },
                { id: 'applications', label: t('applications'), count: applications.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filtres et recherche */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search_jobs')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('all_status')}</option>
                  <option value="Open">{t('open')}</option>
                  <option value="Closed">{t('closed')}</option>
                  <option value="Pending">{t('pending')}</option>
                  <option value="Interview">{t('interview')}</option>
                  <option value="Hired">{t('hired')}</option>
                  <option value="Rejected">{t('rejected')}</option>
                </select>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('all_locations')}</option>
                  <option value="Dakar, Sénégal">{t('dakar')}</option>
                  <option value="Abidjan, Côte d'Ivoire">{t('abidjan')}</option>
                  <option value="Remote">{t('remote')}</option>
                </select>
                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4" />
                  {t('filters')}
                </button>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.title || item.jobTitle}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description || item.coverLetter}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.type && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {item.company && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('company')}:</span>
                          <span className="text-gray-900">{item.company}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('location')}:</span>
                          <span className="text-gray-900">{item.location}</span>
                        </div>
                      )}
                      {item.salary && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('salary')}:</span>
                          <span className="text-gray-900 font-semibold">{item.salary}</span>
                        </div>
                      )}
                      {item.candidateName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('candidate')}:</span>
                          <span className="text-gray-900">{item.candidateName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('posted')}:</span>
                        <span className="text-gray-900">{formatDate(item.postedAt || item.appliedAt)}</span>
                      </div>
                    </div>

                    {item.skills && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {item.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {item.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{item.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t('delete')}
                      </button>
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
                        {activeTab === 'jobs' ? t('job_title') : t('candidate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === 'jobs' ? t('company') : t('job_title')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      {activeTab === 'jobs' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('location')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('applications')}
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.title || item.jobTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description?.substring(0, 100)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.company || item.candidateName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        {activeTab === 'jobs' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.applicationsCount || 0}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.postedAt || item.appliedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
            )}

            {viewMode === 'kanban' && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('kanban_view')}</h3>
                <p className="text-gray-600">{t('kanban_view_coming_soon')}</p>
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_jobs_data')}</h3>
                <p className="text-gray-600 mb-6">{t('no_jobs_data_description')}</p>
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  {t('create_first')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showJobModal && (
        <JobFormModal
          isOpen={showJobModal}
          onClose={() => {
            setShowJobModal(false);
            setEditingItem(null);
          }}
          onSubmit={(data) => {
            // Handle job submission
            setShowJobModal(false);
            setEditingItem(null);
          }}
          initialData={editingItem as Job}
        />
      )}

      {showApplicationModal && (
        <ApplicationFormModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setEditingItem(null);
          }}
          onSubmit={(data) => {
            // Handle application submission
            setShowApplicationModal(false);
            setEditingItem(null);
          }}
          initialData={editingItem as JobApplication}
          jobs={jobs}
        />
      )}
    </div>
  );
};

export default JobsUltraModernV2;