import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChartBarIcon,
  ChartPieIcon,
  ChartBarSquareIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';

const AnalyticsUltraModern: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'dashboard' | 'charts' | 'tables'>('dashboard');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');

  // Mock data pour les métriques
  const [metrics, setMetrics] = useState({
    totalRevenue: 125000,
    revenueGrowth: 12.5,
    totalUsers: 1250,
    userGrowth: 8.3,
    activeProjects: 45,
    projectGrowth: 15.2,
    completionRate: 87.5,
    completionGrowth: 3.1,
    avgSessionTime: 24.5,
    sessionGrowth: -2.1,
    conversionRate: 4.2,
    conversionGrowth: 1.8
  });

  // Mock data pour les graphiques
  const [chartData, setChartData] = useState({
    revenue: [
      { month: 'Jan', value: 85000 },
      { month: 'Fév', value: 92000 },
      { month: 'Mar', value: 88000 },
      { month: 'Avr', value: 105000 },
      { month: 'Mai', value: 112000 },
      { month: 'Juin', value: 125000 }
    ],
    users: [
      { month: 'Jan', value: 850 },
      { month: 'Fév', value: 920 },
      { month: 'Mar', value: 1050 },
      { month: 'Avr', value: 1100 },
      { month: 'Mai', value: 1180 },
      { month: 'Juin', value: 1250 }
    ],
    projects: [
      { month: 'Jan', value: 25 },
      { month: 'Fév', value: 28 },
      { month: 'Mar', value: 32 },
      { month: 'Avr', value: 35 },
      { month: 'Mai', value: 40 },
      { month: 'Juin', value: 45 }
    ]
  });

  // Mock data pour les tableaux
  const [tableData, setTableData] = useState({
    topProjects: [
      { name: 'Projet Alpha', revenue: 25000, users: 150, completion: 95 },
      { name: 'Projet Beta', revenue: 18000, users: 120, completion: 87 },
      { name: 'Projet Gamma', revenue: 15000, users: 95, completion: 78 },
      { name: 'Projet Delta', revenue: 12000, users: 80, completion: 92 },
      { name: 'Projet Epsilon', revenue: 10000, users: 65, completion: 85 }
    ],
    topUsers: [
      { name: 'Jean Dupont', projects: 8, revenue: 15000, lastActive: '2024-01-15' },
      { name: 'Marie Martin', projects: 6, revenue: 12000, lastActive: '2024-01-14' },
      { name: 'Pierre Durand', projects: 5, revenue: 10000, lastActive: '2024-01-13' },
      { name: 'Sophie Bernard', projects: 4, revenue: 8000, lastActive: '2024-01-12' },
      { name: 'Lucas Moreau', projects: 3, revenue: 6000, lastActive: '2024-01-11' }
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? ArrowUpIcon : ArrowDownIcon;
  };

  const renderChart = (data: any[], type: 'line' | 'bar' | 'pie' = 'line') => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    if (type === 'line') {
      return (
        <div className="h-64 flex items-end space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(item.value / maxValue) * 200}px` }}
              />
              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      );
    }
    
    if (type === 'bar') {
      return (
        <div className="h-64 flex items-end space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-green-500 rounded-t"
                style={{ height: `${(item.value / maxValue) * 200}px` }}
              />
              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics UltraModern</h1>
        <p className="text-gray-600">Analyse complète des performances et métriques de l'application</p>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ArrowPathIcon className="h-5 w-5" />
          Actualiser
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Exporter PDF
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <ArrowUpTrayIcon className="h-5 w-5" />
          Exporter Excel
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <DocumentChartBarIcon className="h-5 w-5" />
          Rapport Complet
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Période:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Métrique:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les métriques</option>
              <option value="revenue">Revenus</option>
              <option value="users">Utilisateurs</option>
              <option value="projects">Projets</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Vue:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-2 rounded-lg ${viewMode === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('charts')}
                className={`p-2 rounded-lg ${viewMode === 'charts' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ChartBarIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('tables')}
                className={`p-2 rounded-lg ${viewMode === 'tables' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'revenue', label: 'Revenus', icon: CurrencyDollarIcon },
              { id: 'users', label: 'Utilisateurs', icon: UserGroupIcon },
              { id: 'performance', label: 'Performance', icon: ChartBarSquareIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Revenus Totaux</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(metrics.totalRevenue)}</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${getGrowthColor(metrics.revenueGrowth)}`}>
                      {formatPercentage(metrics.revenueGrowth)}
                    </span>
                    <span className="text-gray-500 ml-2">vs mois précédent</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Utilisateurs Actifs</p>
                      <p className="text-2xl font-bold text-green-900">{metrics.totalUsers}</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-lg">
                      <UserGroupIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${getGrowthColor(metrics.userGrowth)}`}>
                      {formatPercentage(metrics.userGrowth)}
                    </span>
                    <span className="text-gray-500 ml-2">vs mois précédent</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Projets Actifs</p>
                      <p className="text-2xl font-bold text-purple-900">{metrics.activeProjects}</p>
                    </div>
                    <div className="p-3 bg-purple-200 rounded-lg">
                      <DocumentChartBarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${getGrowthColor(metrics.projectGrowth)}`}>
                      {formatPercentage(metrics.projectGrowth)}
                    </span>
                    <span className="text-gray-500 ml-2">vs mois précédent</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Taux de Réussite</p>
                      <p className="text-2xl font-bold text-orange-900">{metrics.completionRate}%</p>
                    </div>
                    <div className="p-3 bg-orange-200 rounded-lg">
                      <ChartPieIcon className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${getGrowthColor(metrics.completionGrowth)}`}>
                      {formatPercentage(metrics.completionGrowth)}
                    </span>
                    <span className="text-gray-500 ml-2">vs mois précédent</span>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus</h3>
                  {renderChart(chartData.revenue, 'line')}
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des Utilisateurs</h3>
                  {renderChart(chartData.users, 'bar')}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par Mois</h3>
                  {renderChart(chartData.revenue, 'line')}
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Projets par Revenus</h3>
                  <div className="space-y-3">
                    {tableData.topProjects.map((project, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-sm text-gray-600">{project.users} utilisateurs</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(project.revenue)}</p>
                          <p className="text-sm text-gray-600">{project.completion}% complété</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des Utilisateurs</h3>
                  {renderChart(chartData.users, 'bar')}
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Utilisateurs</h3>
                  <div className="space-y-3">
                    {tableData.topUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.projects} projets</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatCurrency(user.revenue)}</p>
                          <p className="text-sm text-gray-600">Actif: {formatDate(user.lastActive)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Projets par Mois</h3>
                  {renderChart(chartData.projects, 'line')}
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques de Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">Temps de Session Moyen</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{metrics.avgSessionTime} min</p>
                        <p className={`text-sm ${getGrowthColor(metrics.sessionGrowth)}`}>
                          {formatPercentage(metrics.sessionGrowth)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <ChartPieIcon className="h-5 w-5 text-green-600 mr-3" />
                        <span className="font-medium text-gray-900">Taux de Conversion</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{metrics.conversionRate}%</p>
                        <p className={`text-sm ${getGrowthColor(metrics.conversionGrowth)}`}>
                          {formatPercentage(metrics.conversionGrowth)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsUltraModern;
