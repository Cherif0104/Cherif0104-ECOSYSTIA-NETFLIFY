/**
 * 💰 FINANCE ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture 100% identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  WalletIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
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
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { useFeedback } from '../hooks/useFeedback';
import FeedbackDisplay from './common/FeedbackDisplay';
import LoadingButton from './common/LoadingButton';
import { Invoice, Expense, Budget, User } from '../types';
import { financeService } from '../services/financeServiceSupabase';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';
import InvoiceFormModal from './forms/InvoiceFormModal';
import ExpenseFormModal from './forms/ExpenseFormModal';
import BudgetFormModal from './forms/BudgetFormModal';

// Types pour Finance UltraModern
interface FinanceMetrics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalExpenses: number;
  totalBudgets: number;
  netIncome: number;
  averageInvoiceAmount: number;
  expenseRatio: number;
}

interface FinanceFilters {
  search: string;
  status: string;
  category: string;
  dateRange: { start: string; end: string };
  assignedTo: string;
}

const FinanceUltraModernV3Standard: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const { 
    isSubmitting, 
    submitSuccess, 
    submitError, 
    setSubmitting, 
    setSuccess, 
    setError 
  } = useFeedback();
  
  // États principaux
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedItem, setSelectedItem] = useState<Invoice | Expense | Budget | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'budgets'>('invoices');
  const [filters, setFilters] = useState<FinanceFilters>({
    search: '',
    status: '',
    category: '',
    dateRange: { start: '', end: '' },
    assignedTo: ''
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
      
      console.log('🔄 Chargement des données financières...');
      
      // Charger les données depuis Supabase (temporairement sans filtrage strict)
      const [invoicesData, expensesData, budgetsData, usersData] = await Promise.all([
        financeService.getAllInvoices(), // Récupérer toutes les factures pour l'instant
        financeService.getAllExpenses(), // Récupérer toutes les dépenses pour l'instant
        financeService.getAllBudgets(), // Récupérer tous les budgets pour l'instant
        userService.getAll()
      ]);
      
      setInvoices(invoicesData);
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setUsers(usersData);
      
      console.log(`✅ ${invoicesData.length} factures, ${expensesData.length} dépenses, ${budgetsData.length} budgets et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setInvoices([]);
      setExpenses([]);
      setBudgets([]);
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
  const metrics = useMemo((): FinanceMetrics => {
    const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudgets = budgets.reduce((sum, bud) => sum + bud.amount, 0);
    const netIncome = paidInvoices - totalExpenses;
    const averageInvoiceAmount = invoices.length > 0 ? totalInvoices / invoices.length : 0;
    const expenseRatio = totalInvoices > 0 ? (totalExpenses / totalInvoices) * 100 : 0;

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalExpenses,
      totalBudgets,
      netIncome,
      averageInvoiceAmount,
      expenseRatio
    };
  }, [invoices, expenses, budgets]);

  // Logique de filtrage et recherche
  const getFilteredAndSortedItems = (items: any[]) => {
    let filtered = items.filter(item => {
      const matchesSearch = !filters.search ||
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.client?.toLowerCase().includes(filters.search.toLowerCase()) ||
        getUsername(item.userId || item.employeeId)?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
      const matchesAssignedTo = !filters.assignedTo || filters.assignedTo === 'all' || item.userId === filters.assignedTo;

      return matchesSearch && matchesStatus && matchesCategory && matchesAssignedTo;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === 'createdAt' || sortBy === 'date' || sortBy === 'dueDate' || sortBy === 'issueDate') {
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
      case 'invoices':
        return getFilteredAndSortedItems(invoices);
      case 'expenses':
        return getFilteredAndSortedItems(expenses);
      case 'budgets':
        return getFilteredAndSortedItems(budgets);
      default:
        return [];
    }
  }, [activeTab, invoices, expenses, budgets, filters, sortBy, sortOrder, users]);

  // Fonctions CRUD
  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdInvoice = await financeService.createInvoice(invoiceData);
      if (createdInvoice) {
        setInvoices(prev => [createdInvoice, ...prev]);
        console.log('✅ Facture créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
      setError('Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    try {
      setLoading(true);
      const updatedInvoice = await financeService.updateInvoice(id, invoiceData);
      if (updatedInvoice) {
        setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
        console.log('✅ Facture mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour facture:', error);
      setError('Erreur lors de la mise à jour de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      await financeService.deleteInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      console.log('✅ Facture supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression facture:', error);
      setError('Erreur lors de la suppression de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdExpense = await financeService.createExpense(expenseData);
      if (createdExpense) {
        setExpenses(prev => [createdExpense, ...prev]);
        console.log('✅ Dépense créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création dépense:', error);
      setError('Erreur lors de la création de la dépense');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      setLoading(true);
      const updatedExpense = await financeService.updateExpense(id, expenseData);
      if (updatedExpense) {
        setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
        console.log('✅ Dépense mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour dépense:', error);
      setError('Erreur lors de la mise à jour de la dépense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      setLoading(true);
      await financeService.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      console.log('✅ Dépense supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression dépense:', error);
      setError('Erreur lors de la suppression de la dépense');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdBudget = await financeService.createBudget(budgetData);
      if (createdBudget) {
        setBudgets(prev => [createdBudget, ...prev]);
        console.log('✅ Budget créé avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création budget:', error);
      setError('Erreur lors de la création du budget');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (id: string, budgetData: Partial<Budget>) => {
    try {
      setLoading(true);
      const updatedBudget = await financeService.updateBudget(id, budgetData);
      if (updatedBudget) {
        setBudgets(prev => prev.map(bud => bud.id === id ? updatedBudget : bud));
        console.log('✅ Budget mis à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour budget:', error);
      setError('Erreur lors de la mise à jour du budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      setLoading(true);
      await financeService.deleteBudget(id);
      setBudgets(prev => prev.filter(bud => bud.id !== id));
      console.log('✅ Budget supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression budget:', error);
      setError('Erreur lors de la suppression du budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      if (deletingItem.type === 'invoice') {
        await handleDeleteInvoice(deletingItem.id);
      } else if (deletingItem.type === 'expense') {
        await handleDeleteExpense(deletingItem.id);
      } else if (deletingItem.type === 'budget') {
        await handleDeleteBudget(deletingItem.id);
      }
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  // Fonctions utilitaires
  const getUsername = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'N/A';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'salary': return <CurrencyDollarIcon className="w-5 h-5 text-green-500" />;
      case 'rent': return <ReceiptRefundIcon className="w-5 h-5 text-red-500" />;
      case 'utilities': return <WalletIcon className="w-5 h-5 text-blue-500" />;
      default: return <CurrencyDollarIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données financières...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestion Financière</h1>
              <p className="text-gray-600">Factures, dépenses et budgets</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setEditingExpense(null);
                  setEditingBudget(null);
                  if (activeTab === 'invoices') setShowInvoiceModal(true);
                  else if (activeTab === 'expenses') setShowExpenseModal(true);
                  else if (activeTab === 'budgets') setShowBudgetModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {activeTab === 'invoices' ? 'Nouvelle Facture' : activeTab === 'expenses' ? 'Nouvelle Dépense' : 'Nouveau Budget'}
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
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Factures</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.totalInvoices)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Factures Payées</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.paidInvoices)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ReceiptRefundIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Dépenses</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenu Net</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.netIncome)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`${activeTab === 'invoices' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Factures
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`${activeTab === 'expenses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Dépenses
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`${activeTab === 'budgets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Budgets
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
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
                <option value="draft">Brouillon</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                <option value="salary">Salaire</option>
                <option value="rent">Loyer</option>
                <option value="utilities">Services publics</option>
                <option value="marketing">Marketing</option>
                <option value="equipment">Équipement</option>
              </select>

              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les utilisateurs</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>

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
                <option value="amount-desc">Montant (élevé)</option>
                <option value="amount-asc">Montant (faible)</option>
                <option value="status-asc">Statut A-Z</option>
                <option value="status-desc">Statut Z-A</option>
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
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des éléments */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élément trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.category || filters.assignedTo
                ? 'Aucun élément ne correspond aux filtres appliqués.'
                : `Commencez par créer votre première ${activeTab === 'invoices' ? 'facture' : activeTab === 'expenses' ? 'dépense' : 'budget'}.`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setEditingExpense(null);
                  setEditingBudget(null);
                  if (activeTab === 'invoices') setShowInvoiceModal(true);
                  else if (activeTab === 'expenses') setShowExpenseModal(true);
                  else if (activeTab === 'budgets') setShowBudgetModal(true);
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
                          {item.title || item.number || item.client}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {formatDate(item.issueDate || item.date || item.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (activeTab === 'invoices') {
                              setEditingInvoice(item);
                              setShowInvoiceModal(true);
                            } else if (activeTab === 'expenses') {
                              setEditingExpense(item);
                              setShowExpenseModal(true);
                            } else if (activeTab === 'budgets') {
                              setEditingBudget(item);
                              setShowBudgetModal(true);
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
                      {activeTab === 'expenses' && getCategoryIcon(item.category)}
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
                          Élément
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title || item.number || item.client}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.issueDate || item.date || item.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'invoices') {
                                    setEditingInvoice(item);
                                    setShowInvoiceModal(true);
                                  } else if (activeTab === 'expenses') {
                                    setEditingExpense(item);
                                    setShowExpenseModal(true);
                                  } else if (activeTab === 'budgets') {
                                    setEditingBudget(item);
                                    setShowBudgetModal(true);
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
                          Élément
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title || item.number || item.client}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.issueDate || item.date || item.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'invoices') {
                                    setEditingInvoice(item);
                                    setShowInvoiceModal(true);
                                  } else if (activeTab === 'expenses') {
                                    setEditingExpense(item);
                                    setShowExpenseModal(true);
                                  } else if (activeTab === 'budgets') {
                                    setEditingBudget(item);
                                    setShowBudgetModal(true);
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
      <InvoiceFormModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setEditingInvoice(null);
        }}
        onSuccess={editingInvoice ? 
          (data) => handleUpdateInvoice(editingInvoice.id, data) : 
          handleCreateInvoice
        }
        editingInvoice={editingInvoice}
        users={users}
      />

      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        onSuccess={editingExpense ? 
          (data) => handleUpdateExpense(editingExpense.id, data) : 
          handleCreateExpense
        }
        editingExpense={editingExpense}
        users={users}
      />

      <BudgetFormModal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setEditingBudget(null);
        }}
        onSuccess={editingBudget ? 
          (data) => handleUpdateBudget(editingBudget.id, data) : 
          handleCreateBudget
        }
        editingBudget={editingBudget}
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

export default FinanceUltraModernV3Standard;
