import React, { useState, useEffect, useMemo } from 'react';
import { 
  CodeBracketIcon,
  BugAntIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';

interface Deployment {
  id: string;
  name: string;
  environment: 'Development' | 'Staging' | 'Production';
  status: 'Running' | 'Stopped' | 'Failed' | 'Building';
  version: string;
  branch: string;
  commitHash: string;
  deployedAt: string;
  deployedBy: string;
  url?: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Fixed' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reporter: string;
  assignee?: string;
  environment: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface CodeReview {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Approved' | 'Rejected' | 'Merged';
  author: string;
  reviewers: string[];
  pullRequestUrl: string;
  branch: string;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  createdAt: string;
  updatedAt: string;
}

const DevelopmentUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'deployments' | 'bugs' | 'reviews'>('deployments');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Deployment | BugReport | CodeReview | null>(null);

  // Mock data - En production, ces données viendraient d'Supabase
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      name: 'Frontend v2.1.0',
      environment: 'Production',
      status: 'Running',
      version: '2.1.0',
      branch: 'main',
      commitHash: 'a1b2c3d',
      deployedAt: '2024-01-20T14:30:00Z',
      deployedBy: 'Dev Team',
      url: 'https://app.example.com',
      logs: ['Deployment started', 'Building application', 'Running tests', 'Deployment completed'],
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'API v1.5.2',
      environment: 'Staging',
      status: 'Building',
      version: '1.5.2',
      branch: 'feature/new-endpoints',
      commitHash: 'e4f5g6h',
      deployedAt: '2024-01-20T16:00:00Z',
      deployedBy: 'Backend Team',
      logs: ['Deployment started', 'Building application'],
      createdAt: '2024-01-20T15:45:00Z',
      updatedAt: '2024-01-20T16:00:00Z'
    }
  ]);

  const [bugs, setBugs] = useState<BugReport[]>([
    {
      id: '1',
      title: 'Login page not loading on mobile',
      description: 'Users cannot access the login page on mobile devices',
      severity: 'High',
      status: 'In Progress',
      priority: 'High',
      reporter: 'QA Team',
      assignee: 'Frontend Dev',
      environment: 'Production',
      stepsToReproduce: ['Open app on mobile', 'Navigate to login', 'Page shows blank'],
      expectedBehavior: 'Login page should load normally',
      actualBehavior: 'Page shows blank white screen',
      attachments: ['screenshot1.png', 'console-log.txt'],
      createdAt: '2024-01-19T10:00:00Z',
      updatedAt: '2024-01-20T09:30:00Z'
    },
    {
      id: '2',
      title: 'API timeout on large requests',
      description: 'API requests timeout when processing large data sets',
      severity: 'Medium',
      status: 'Open',
      priority: 'Medium',
      reporter: 'Backend Team',
      environment: 'Staging',
      stepsToReproduce: ['Send large data request', 'Wait for response', 'Request times out'],
      expectedBehavior: 'Request should complete successfully',
      actualBehavior: 'Request times out after 30 seconds',
      attachments: ['api-log.json'],
      createdAt: '2024-01-18T15:00:00Z',
      updatedAt: '2024-01-18T15:00:00Z'
    }
  ]);

  const [reviews, setReviews] = useState<CodeReview[]>([
    {
      id: '1',
      title: 'Add user authentication middleware',
      description: 'Implement JWT authentication for API endpoints',
      status: 'Open',
      author: 'Backend Dev',
      reviewers: ['Senior Dev', 'Tech Lead'],
      pullRequestUrl: 'https://github.com/repo/pull/123',
      branch: 'feature/auth-middleware',
      filesChanged: 8,
      linesAdded: 245,
      linesRemoved: 12,
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-20T11:00:00Z'
    },
    {
      id: '2',
      title: 'Update UI components styling',
      description: 'Modernize button and form components',
      status: 'Approved',
      author: 'Frontend Dev',
      reviewers: ['UI/UX Designer'],
      pullRequestUrl: 'https://github.com/repo/pull/122',
      branch: 'feature/ui-update',
      filesChanged: 15,
      linesAdded: 180,
      linesRemoved: 45,
      createdAt: '2024-01-19T14:00:00Z',
      updatedAt: '2024-01-20T10:30:00Z'
    }
  ]);

  // Calculs de métriques
  const metrics = useMemo(() => {
    const totalDeployments = deployments.length;
    const runningDeployments = deployments.filter(dep => dep.status === 'Running').length;
    const failedDeployments = deployments.filter(dep => dep.status === 'Failed').length;
    const totalBugs = bugs.length;
    const openBugs = bugs.filter(bug => bug.status === 'Open' || bug.status === 'In Progress').length;
    const criticalBugs = bugs.filter(bug => bug.severity === 'Critical').length;
    const totalReviews = reviews.length;
    const openReviews = reviews.filter(review => review.status === 'Open').length;
    const approvedReviews = reviews.filter(review => review.status === 'Approved').length;
    const avgReviewTime = 2.5; // Mock data

    return {
      totalDeployments,
      runningDeployments,
      failedDeployments,
      totalBugs,
      openBugs,
      criticalBugs,
      totalReviews,
      openReviews,
      approvedReviews,
      avgReviewTime
    };
  }, [deployments, bugs, reviews]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'deployments':
        data = deployments;
        break;
      case 'bugs':
        data = bugs;
        break;
      case 'reviews':
        data = reviews;
        break;
    }

    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.branch?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesEnvironment = filterEnvironment === 'all' || item.environment === filterEnvironment;
      
      return matchesSearch && matchesStatus && matchesEnvironment;
    });
  }, [activeTab, deployments, bugs, reviews, searchTerm, filterStatus, filterEnvironment]);

  const handleCreate = () => {
    setEditingItem(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: Deployment | BugReport | CodeReview) => {
    setEditingItem(item);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      switch (activeTab) {
        case 'deployments':
          setDeployments(prev => prev.filter(dep => dep.id !== id));
          break;
        case 'bugs':
          setBugs(prev => prev.filter(bug => bug.id !== id));
          break;
        case 'reviews':
          setReviews(prev => prev.filter(review => review.id !== id));
          break;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
      case 'Approved':
      case 'Fixed':
        return 'bg-green-100 text-green-800';
      case 'Building':
      case 'In Progress':
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Stopped':
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                <CodeBracketIcon className="h-8 w-8 text-blue-600" />
                {t('development_management')}
              </h1>
              <p className="text-gray-600 mt-1">{t('manage_deployments_bugs_reviews')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('timeline_view')}
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
                <p className="text-sm font-medium text-gray-600">{t('deployments')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalDeployments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('running')}: {metrics.runningDeployments}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('bugs')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalBugs}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <BugAntIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">{t('open')}: {metrics.openBugs}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('critical_bugs')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.criticalBugs}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600 font-medium">{t('needs_attention')}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('code_reviews')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalReviews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-medium">{t('approved')}: {metrics.approvedReviews}</span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'deployments', label: t('deployments'), count: deployments.length },
                { id: 'bugs', label: t('bugs'), count: bugs.length },
                { id: 'reviews', label: t('code_reviews'), count: reviews.length }
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
                    placeholder={t('search_development')}
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
                  <option value="Running">{t('running')}</option>
                  <option value="Building">{t('building')}</option>
                  <option value="Failed">{t('failed')}</option>
                  <option value="Stopped">{t('stopped')}</option>
                  <option value="Open">{t('open')}</option>
                  <option value="In Progress">{t('in_progress')}</option>
                  <option value="Fixed">{t('fixed')}</option>
                  <option value="Closed">{t('closed')}</option>
                  <option value="Approved">{t('approved')}</option>
                  <option value="Rejected">{t('rejected')}</option>
                  <option value="Merged">{t('merged')}</option>
                </select>
                <select
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('all_environments')}</option>
                  <option value="Development">{t('development')}</option>
                  <option value="Staging">{t('staging')}</option>
                  <option value="Production">{t('production')}</option>
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
                          {item.name || item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        {item.severity && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {item.version && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('version')}:</span>
                          <span className="text-gray-900">{item.version}</span>
                        </div>
                      )}
                      {item.branch && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('branch')}:</span>
                          <span className="text-gray-900">{item.branch}</span>
                        </div>
                      )}
                      {item.environment && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('environment')}:</span>
                          <span className="text-gray-900">{item.environment}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('updated')}:</span>
                        <span className="text-gray-900">{formatDate(item.updatedAt)}</span>
                      </div>
                    </div>

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
                        {activeTab === 'deployments' ? t('name') : t('title')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      {activeTab === 'bugs' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('severity')}
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('environment')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('updated')}
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
                            {item.name || item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description?.substring(0, 100)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        {activeTab === 'bugs' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                              {item.severity}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.environment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.updatedAt)}
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

            {viewMode === 'timeline' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('timeline_view')}</h3>
                  <p className="text-gray-600">{t('timeline_view_coming_soon')}</p>
                </div>
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <CodeBracketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_development_data')}</h3>
                <p className="text-gray-600 mb-6">{t('no_development_data_description')}</p>
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
    </div>
  );
};

export default DevelopmentUltraModernV2;
