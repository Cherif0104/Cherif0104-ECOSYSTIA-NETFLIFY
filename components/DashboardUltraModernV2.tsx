import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  CogIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContextSupabase';
import { useLocalization } from '../contexts/LocalizationContext';
import { Course, Job, Project, TimeLog, LeaveRequest, Invoice, Expense } from '../types';

interface DashboardUltraModernV2Props {
  setView: (view: string) => void;
  projects: Project[];
  courses: Course[];
  jobs: Job[];
  timeLogs: TimeLog[];
  leaveRequests: LeaveRequest[];
  invoices: Invoice[];
  expenses: Expense[];
}

const DashboardUltraModernV2: React.FC<DashboardUltraModernV2Props> = ({
  setView,
  projects,
  courses,
  jobs,
  timeLogs,
  leaveRequests,
  invoices,
  expenses
}) => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'courses' | 'jobs' | 'finance' | 'time'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Métriques calculées
  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress === 100).length;
    const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const appliedJobs = jobs.filter(j => j.status === 'applied').length;
    
    const totalTimeLogged = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalHours = Math.round(totalTimeLogged / 60);
    
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);
    
    const totalExpenses = expenses.length;
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const pendingLeaveRequests = leaveRequests.filter(l => l.status === 'pending').length;
    const approvedLeaveRequests = leaveRequests.filter(l => l.status === 'approved').length;

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
      },
      courses: {
        total: totalCourses,
        completed: completedCourses,
        inProgress: inProgressCourses,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        applied: appliedJobs,
        successRate: totalJobs > 0 ? Math.round((appliedJobs / totalJobs) * 100) : 0
      },
      time: {
        totalHours: totalHours,
        averagePerDay: timeLogs.length > 0 ? Math.round(totalHours / timeLogs.length) : 0,
        productivity: totalHours > 0 ? Math.min(100, Math.round((totalHours / 40) * 100)) : 0
      },
      finance: {
        revenue: totalRevenue,
        expenses: totalExpenseAmount,
        profit: totalRevenue - totalExpenseAmount,
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          pending: pendingInvoices
        }
      },
      leave: {
        pending: pendingLeaveRequests,
        approved: approvedLeaveRequests,
        total: leaveRequests.length
      }
    };
  }, [projects, courses, jobs, timeLogs, invoices, expenses, leaveRequests]);

  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(timer);
  }, []);

  // Fonction pour générer le message d'accueil personnalisé
  const getPersonalizedGreeting = () => {
    const hour = currentTime.getHours();
    
    // Debug pour voir les données utilisateur
    console.log('🔍 Données utilisateur:', user);
    console.log('🔍 firstName:', user?.firstName);
    console.log('🔍 first_name:', user?.first_name);
    console.log('🔍 name:', user?.name);
    
    const userName = user?.firstName || user?.first_name || user?.name || 'Utilisateur';
    
    // Salutation selon l'heure
    let greeting = '';
    if (hour >= 5 && hour < 12) {
      greeting = 'Bonjour';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Bon après-midi';
    } else if (hour >= 18 && hour < 22) {
      greeting = 'Bonsoir';
    } else {
      greeting = 'Bonne nuit';
    }

    // Messages motivants selon l'heure
    const motivationalMessages = {
      morning: [
        "Prêt à conquérir cette nouvelle journée ?",
        "Votre succès commence maintenant !",
        "Une journée productive vous attend !",
        "C'est parti pour de nouvelles réalisations !"
      ],
      afternoon: [
        "Comment se déroule votre journée ?",
        "Continuez sur cette lancée !",
        "Vous êtes sur la bonne voie !",
        "Excellent travail jusqu'à présent !"
      ],
      evening: [
        "Quelle belle journée de travail !",
        "Vous avez accompli de grandes choses !",
        "Profitez de cette soirée bien méritée !",
        "Félicitations pour cette journée productive !"
      ],
      night: [
        "Travaillez-vous encore ? Prenez soin de vous !",
        "Une pause s'impose peut-être ?",
        "Votre dévouement est admirable !",
        "N'oubliez pas de vous reposer !"
      ]
    };

    // Sélectionner la catégorie de messages
    let messageCategory = 'morning';
    if (hour >= 12 && hour < 18) messageCategory = 'afternoon';
    else if (hour >= 18 && hour < 22) messageCategory = 'evening';
    else if (hour >= 22 || hour < 5) messageCategory = 'night';

    // Sélectionner un message aléatoire
    const messages = motivationalMessages[messageCategory];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      greeting,
      userName,
      message: randomMessage,
      time: currentTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const greetingData = user ? getPersonalizedGreeting() : {
    greeting: 'Bonjour',
    userName: 'Utilisateur',
    message: 'Chargement de votre profil...',
    time: currentTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };

  // Données filtrées
  const filteredData = useMemo(() => {
    if (!searchTerm) return { projects, courses, jobs, invoices, expenses };
    
    const filterItems = (items: any[], searchFields: string[]) => {
      return items.filter(item => 
        searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    };

    return {
      projects: filterItems(projects, ['title', 'description', 'status']),
      courses: filterItems(courses, ['title', 'instructor', 'description']),
      jobs: filterItems(jobs, ['title', 'company', 'description']),
      invoices: filterItems(invoices, ['client', 'description', 'status']),
      expenses: filterItems(expenses, ['description', 'category', 'status'])
    };
  }, [projects, courses, jobs, invoices, expenses, searchTerm]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulation d'un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Déclencher un rechargement des données parent
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      
      console.log('✅ Dashboard actualisé avec succès');
      
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
      setError('Erreur lors du rechargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (type === 'pdf') {
        await exportToPDF();
        console.log('✅ Export PDF réussi');
      } else if (type === 'excel') {
        await exportToExcel();
        console.log('✅ Export Excel réussi');
      }
    } catch (error) {
      console.error(`Erreur lors de l'export ${type}:`, error);
      setError(`Erreur lors de l'export ${type.toUpperCase()}. Vérifiez que les données sont disponibles.`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    // Vérifier s'il y a des données à exporter
    if (projects.length === 0 && courses.length === 0 && invoices.length === 0) {
      console.warn('⚠️ Aucune donnée à exporter. Le PDF sera généré avec des métriques vides.');
    }
    
    // Import dynamique de jsPDF pour éviter les erreurs de build
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // En-tête du rapport
    doc.setFontSize(20);
    doc.text('Rapport Dashboard ECOSYSTIA', 20, 30);
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);
    doc.text(`Utilisateur: ${user?.name || 'Non connecté'}`, 20, 50);
    
    // Métriques principales
    doc.setFontSize(16);
    doc.text('Métriques Principales', 20, 70);
    
    const metricsData = [
      ['Projets Actifs', metrics.projects.active.toString()],
      ['Projets Complétés', metrics.projects.completed.toString()],
      ['Taux de Complétion', `${metrics.projects.completionRate}%`],
      ['Cours Terminés', metrics.courses.completed.toString()],
      ['Heures Travaillées', `${metrics.time.totalHours}h`],
      ['Revenus', `${metrics.finance.revenue.toLocaleString()} FCFA`],
      ['Dépenses', `${metrics.finance.expenses.toLocaleString()} FCFA`],
      ['Profit', `${metrics.finance.profit.toLocaleString()} FCFA`]
    ];
    
    autoTable(doc, {
      head: [['Métrique', 'Valeur']],
      body: metricsData,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });
    
    // Projets récents
    if (projects.length > 0) {
      doc.setFontSize(14);
      doc.text('Projets Récents', 20, doc.lastAutoTable.finalY + 20);
      
      const projectsData = projects.slice(0, 10).map(project => [
        project.title,
        project.status,
        project.priority,
        new Date(project.createdAt).toLocaleDateString('fr-FR')
      ]);
      
      autoTable(doc, {
        head: [['Titre', 'Statut', 'Priorité', 'Date de Création']],
        body: projectsData,
        startY: doc.lastAutoTable.finalY + 30,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 9 }
      });
    }
    
    // Sauvegarder le PDF
    const fileName = `dashboard-ecosystia-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = async () => {
    // Vérifier s'il y a des données à exporter
    if (projects.length === 0 && courses.length === 0 && invoices.length === 0) {
      console.warn('⚠️ Aucune donnée à exporter. Le fichier Excel sera généré avec des métriques vides.');
    }
    
    // Import dynamique de xlsx
    const XLSX = await import('xlsx');
    
    if (!XLSX.utils) {
      throw new Error('XLSX.utils non disponible. Vérifiez l\'installation de la bibliothèque xlsx.');
    }
    
    // Créer un nouveau workbook
    const workbook = XLSX.utils.book_new();
    
    // Feuille des métriques
    const metricsData = [
      ['Métrique', 'Valeur'],
      ['Projets Actifs', metrics.projects.active],
      ['Projets Complétés', metrics.projects.completed],
      ['Taux de Complétion (%)', metrics.projects.completionRate],
      ['Cours Terminés', metrics.courses.completed],
      ['Cours en Progrès', metrics.courses.inProgress],
      ['Taux de Réussite Cours (%)', metrics.courses.completionRate],
      ['Offres d\'Emploi', metrics.jobs.total],
      ['Offres Actives', metrics.jobs.active],
      ['Candidatures', metrics.jobs.applied],
      ['Taux de Succès (%)', metrics.jobs.successRate],
      ['Heures Travaillées', metrics.time.totalHours],
      ['Moyenne par Jour (h)', metrics.time.averagePerDay],
      ['Productivité (%)', metrics.time.productivity],
      ['Revenus (FCFA)', metrics.finance.revenue],
      ['Dépenses (FCFA)', metrics.finance.expenses],
      ['Profit (FCFA)', metrics.finance.profit],
      ['Factures Total', metrics.finance.invoices.total],
      ['Factures Payées', metrics.finance.invoices.paid],
      ['Factures En Attente', metrics.finance.invoices.pending],
      ['Demandes de Congé', metrics.leave.total],
      ['Congés Approuvés', metrics.leave.approved],
      ['Congés En Attente', metrics.leave.pending]
    ];
    
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métriques');
    
    // Feuille des projets
    if (projects.length > 0) {
      const projectsData = [
        ['Titre', 'Description', 'Statut', 'Priorité', 'Date de Création', 'Date de Mise à Jour']
      ].concat(projects.map(project => [
        project.title,
        project.description || '',
        project.status,
        project.priority,
        new Date(project.createdAt).toLocaleDateString('fr-FR'),
        new Date(project.updatedAt).toLocaleDateString('fr-FR')
      ]));
      
      const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
      XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projets');
    }
    
    // Feuille des cours
    if (courses.length > 0) {
      const coursesData = [
        ['Titre', 'Instructeur', 'Description', 'Progrès (%)', 'Durée', 'Niveau', 'Date de Création']
      ].concat(courses.map(course => [
        course.title,
        course.instructor || '',
        course.description || '',
        course.progress,
        course.duration || '',
        course.level || '',
        new Date(course.createdAt).toLocaleDateString('fr-FR')
      ]));
      
      const coursesSheet = XLSX.utils.aoa_to_sheet(coursesData);
      XLSX.utils.book_append_sheet(workbook, coursesSheet, 'Cours');
    }
    
    // Feuille des factures
    if (invoices.length > 0) {
      const invoicesData = [
        ['Client', 'Description', 'Montant (FCFA)', 'Statut', 'Date d\'Échéance', 'Date de Création']
      ].concat(invoices.map(invoice => [
        invoice.client || '',
        invoice.description || '',
        invoice.amount || 0,
        invoice.status,
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : '',
        new Date(invoice.createdAt).toLocaleDateString('fr-FR')
      ]));
      
      const invoicesSheet = XLSX.utils.aoa_to_sheet(invoicesData);
      XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Factures');
    }
    
    // Sauvegarder le fichier Excel
    const fileName = `dashboard-ecosystia-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Projets Actifs</p>
              <p className="text-3xl font-bold text-blue-900">{metrics.projects.active}</p>
              <p className="text-blue-700 text-sm">
                {metrics.projects.completionRate}% complétés
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Cours Terminés</p>
              <p className="text-3xl font-bold text-green-900">{metrics.courses.completed}</p>
              <p className="text-green-700 text-sm">
                {metrics.courses.completionRate}% de réussite
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Heures Travaillées</p>
              <p className="text-3xl font-bold text-purple-900">{metrics.time.totalHours}h</p>
              <p className="text-purple-700 text-sm">
                {metrics.time.productivity}% productivité
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <ClockIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Revenus</p>
              <p className="text-3xl font-bold text-orange-900">
                {metrics.finance.revenue.toLocaleString()} FCFA
              </p>
              <p className="text-orange-700 text-sm">
                {metrics.finance.profit > 0 ? '+' : ''}{metrics.finance.profit.toLocaleString()} FCFA profit
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression des Projets</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Projets Actifs</span>
              <span className="text-sm font-medium text-gray-900">{metrics.projects.active}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(metrics.projects.active / Math.max(metrics.projects.total, 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Projets Complétés</span>
              <span className="text-sm font-medium text-gray-900">{metrics.projects.completed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.projects.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-3">
            {projects.slice(0, 3).map((project, index) => (
              <div key={project.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{project.title}</p>
                  <p className="text-xs text-gray-500">{project.status}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setView('projects')}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Nouveau Projet</span>
          </button>
          <button
            onClick={() => setView('courses')}
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Nouveau Cours</span>
          </button>
          <button
            onClick={() => setView('jobs')}
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Nouvelle Offre</span>
          </button>
          <button
            onClick={() => setView('finance')}
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <CurrencyDollarIcon className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">Nouvelle Facture</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Projets</h3>
        <button
          onClick={() => setView('projects')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouveau Projet</span>
        </button>
      </div>
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredData.projects.slice(0, 6).map((project) => (
          <div key={project.id} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{project.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              <span>{project.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cours</h3>
        <button
          onClick={() => setView('courses')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouveau Cours</span>
        </button>
      </div>
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredData.courses.slice(0, 6).map((course) => (
          <div key={course.id} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{course.title}</h4>
              <span className="text-sm font-medium text-green-600">{course.progress}%</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{course.instructor}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{course.duration}</span>
              <span>{course.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJobsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Offres d'Emploi</h3>
        <button
          onClick={() => setView('jobs')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouvelle Offre</span>
        </button>
      </div>
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredData.jobs.slice(0, 6).map((job) => (
          <div key={job.id} className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                job.status === 'active' ? 'bg-green-100 text-green-800' :
                job.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{job.company}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{job.type}</span>
              <span>{job.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Finance</h3>
        <button
          onClick={() => setView('finance')}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouvelle Facture</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Factures Récentes</h4>
          <div className="space-y-3">
            {filteredData.invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.client}</p>
                  <p className="text-xs text-gray-500">{invoice.status}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {invoice.amount?.toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dépenses Récentes</h4>
          <div className="space-y-3">
            {filteredData.expenses.slice(0, 3).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500">{expense.category}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {expense.amount?.toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Suivi du Temps</h3>
        <button
          onClick={() => setView('time_tracking')}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nouvelle Entrée</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du Temps</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{metrics.time.totalHours}h</p>
            <p className="text-sm text-gray-600">Total Travaillé</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{metrics.time.averagePerDay}h</p>
            <p className="text-sm text-gray-600">Moyenne par Jour</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{metrics.time.productivity}%</p>
            <p className="text-sm text-gray-600">Productivité</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {greetingData.greeting}, {greetingData.userName} ! 👋
                {!user && <span className="text-sm text-gray-500 ml-2">(Chargement...)</span>}
              </h1>
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <ClockIcon className="h-4 w-4" />
                <span>{greetingData.time}</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-1">{greetingData.message}</p>
            <p className="text-gray-500 text-sm">Vue d'ensemble de votre activité ECOSYSTIA</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans le dashboard..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'projects', name: 'Projets', icon: ChartBarIcon },
              { id: 'courses', name: 'Cours', icon: DocumentTextIcon },
              { id: 'jobs', name: 'Emplois', icon: UserGroupIcon },
              { id: 'finance', name: 'Finance', icon: CurrencyDollarIcon },
              { id: 'time', name: 'Temps', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Chargement des données...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'projects' && renderProjectsTab()}
              {activeTab === 'courses' && renderCoursesTab()}
              {activeTab === 'jobs' && renderJobsTab()}
              {activeTab === 'finance' && renderFinanceTab()}
              {activeTab === 'time' && renderTimeTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardUltraModernV2;
