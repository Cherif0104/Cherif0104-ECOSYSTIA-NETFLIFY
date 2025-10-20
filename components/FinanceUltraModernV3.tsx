import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { financeService } from '../services/financeServiceSupabase';
import { userService } from '../services/userService';
import { moduleInterconnectionService } from '../services/moduleInterconnectionService';
import { Invoice, Expense, Budget, RecurringItem, User } from '../types';
import InvoiceFormModal from './forms/InvoiceFormModal';
import ExpenseFormModal from './forms/ExpenseFormModal';
import BudgetFormModal from './forms/BudgetFormModal';
import ConfirmationModal from './common/ConfirmationModal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  WalletIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const FinanceUltraModernV3: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'budgets' | 'recurring'>('invoices');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    dateRange: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // États pour les modales
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement des données financières...');
      const [invoicesData, expensesData, budgetsData, recurringData, usersData] = await Promise.all([
        financeService.getInvoices(user?.id), // Filtrer par utilisateur connecté
        financeService.getExpenses(user?.id), // Filtrer par utilisateur connecté
        financeService.getBudgets(user?.id), // Filtrer par utilisateur connecté
        financeService.getRecurringItems(),
        userService.getAllUsers()
      ]);
      console.log(`✅ ${invoicesData.length} factures chargées`);
      console.log(`✅ ${expensesData.length} dépenses chargées`);
      console.log(`✅ ${budgetsData.length} budgets chargés`);
      console.log(`✅ ${recurringData.length} éléments récurrents chargés`);
      console.log(`✅ ${usersData.length} utilisateurs chargés`);
      setInvoices(invoicesData);
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setRecurringItems(recurringData);
      setUsers(usersData);
      setError(null);
    } catch (error: any) {
      console.error('❌ Erreur chargement données finance:', error);
      setError('Erreur lors du chargement des données financières');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les métriques
  const metrics = useMemo(() => {
    const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudgets = budgets.reduce((sum, bud) => sum + bud.amount, 0);
    const netIncome = paidInvoices - totalExpenses;

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalExpenses,
      totalBudgets,
      netIncome
    };
  }, [invoices, expenses, budgets]);

  // Filtrer et trier les données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'invoices':
        data = invoices;
        break;
      case 'expenses':
        data = expenses;
        break;
      case 'budgets':
        data = budgets;
        break;
      case 'recurring':
        data = recurringItems;
        break;
    }

    // Filtrage par recherche
    if (filters.search) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.client?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filters.status !== 'all' && activeTab === 'invoices') {
      data = data.filter(item => item.status === filters.status);
    }

    // Filtrage par catégorie
    if (filters.category !== 'all' && (activeTab === 'expenses' || activeTab === 'budgets')) {
      data = data.filter(item => item.category === filters.category);
    }

    // Tri
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt || a.date).getTime();
          bValue = new Date(b.createdAt || b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'name':
          aValue = a.title || a.clientName || a.client || '';
          bValue = b.title || b.clientName || b.client || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  }, [invoices, expenses, budgets, recurringItems, activeTab, filters, sortBy, sortOrder]);

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      const created = await financeService.createInvoice(invoiceData);
      if (created) {
        setInvoices(prev => [created, ...prev]);
        await moduleInterconnectionService.syncModuleData('finance', 'create', created);
        console.log('✅ Facture créée avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur création facture:', error);
      setError('Erreur lors de la création de la facture');
    }
  };

  const handleCreateExpense = async (expenseData: any) => {
    try {
      const created = await financeService.createExpense(expenseData);
      if (created) {
        setExpenses(prev => [created, ...prev]);
        await moduleInterconnectionService.syncModuleData('finance', 'create', created);
        console.log('✅ Dépense créée avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur création dépense:', error);
      setError('Erreur lors de la création de la dépense');
    }
  };

  const handleCreateBudget = async (budgetData: any) => {
    try {
      const created = await financeService.createBudget(budgetData);
      if (created) {
        setBudgets(prev => [created, ...prev]);
        await moduleInterconnectionService.syncModuleData('finance', 'create', created);
        console.log('✅ Budget créé avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur création budget:', error);
      setError('Erreur lors de la création du budget');
    }
  };

  const handleUpdateInvoice = async (id: string, invoiceData: any) => {
    try {
      const updated = await financeService.updateInvoice(id, invoiceData);
      if (updated) {
        setInvoices(prev => prev.map(item => item.id === id ? updated : item));
        await moduleInterconnectionService.syncModuleData('finance', 'update', updated);
        console.log('✅ Facture mise à jour avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour facture:', error);
      setError('Erreur lors de la mise à jour de la facture');
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: any) => {
    try {
      const updated = await financeService.updateExpense(id, expenseData);
      if (updated) {
        setExpenses(prev => prev.map(item => item.id === id ? updated : item));
        await moduleInterconnectionService.syncModuleData('finance', 'update', updated);
        console.log('✅ Dépense mise à jour avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour dépense:', error);
      setError('Erreur lors de la mise à jour de la dépense');
    }
  };

  const handleUpdateBudget = async (id: string, budgetData: any) => {
    try {
      const updated = await financeService.updateBudget(id, budgetData);
      if (updated) {
        setBudgets(prev => prev.map(item => item.id === id ? updated : item));
        await moduleInterconnectionService.syncModuleData('finance', 'update', updated);
        console.log('✅ Budget mis à jour avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour budget:', error);
      setError('Erreur lors de la mise à jour du budget');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      let success = false;
      
      switch (deletingItem.type) {
        case 'invoice':
          success = await financeService.deleteInvoice(deletingItem.id);
          if (success) setInvoices(prev => prev.filter(item => item.id !== deletingItem.id));
          break;
        case 'expense':
          success = await financeService.deleteExpense(deletingItem.id);
          if (success) setExpenses(prev => prev.filter(item => item.id !== deletingItem.id));
          break;
        case 'budget':
          success = await financeService.deleteBudget(deletingItem.id);
          if (success) setBudgets(prev => prev.filter(item => item.id !== deletingItem.id));
          break;
      }

      if (success) {
        await moduleInterconnectionService.syncModuleData('finance', 'delete', { id: deletingItem.id, type: deletingItem.type });
        console.log(`✅ ${deletingItem.type} supprimé avec succès`);
      }
    } catch (error: any) {
      console.error(`❌ Erreur suppression ${deletingItem.type}:`, error);
      setError(`Erreur lors de la suppression du ${deletingItem.type}`);
    } finally {
      setShowDeleteModal(false);
      setDeletingItem(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données financières...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec métriques */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
                <p className="mt-1 text-sm text-gray-500">Gestion financière complète</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouvelle Facture
                </button>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouvelle Dépense
                </button>
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouveau Budget
                </button>
              </div>
            </div>

            {/* Métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Total Factures</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalInvoices)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <ReceiptRefundIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-green-100 text-sm">Factures Payées</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.paidInvoices)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <ReceiptRefundIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-red-100 text-sm">Dépenses</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <ChartBarIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-purple-100 text-sm">Bénéfice Net</p>
                    <p className={`text-2xl font-bold ${metrics.netIncome >= 0 ? 'text-white' : 'text-red-200'}`}>
                      {formatCurrency(metrics.netIncome)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation des onglets */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'invoices', label: 'Factures', icon: CurrencyDollarIcon, count: invoices.length },
                { id: 'expenses', label: 'Dépenses', icon: ReceiptRefundIcon, count: expenses.length },
                { id: 'budgets', label: 'Budgets', icon: WalletIcon, count: budgets.length },
                { id: 'recurring', label: 'Récurrents', icon: ArrowPathIcon, count: recurringItems.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              {activeTab === 'invoices' && (
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="paid">Payées</option>
                  <option value="pending">En attente</option>
                  <option value="overdue">En retard</option>
                </select>
              )}
              
              {(activeTab === 'expenses' || activeTab === 'budgets') && (
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="office">Bureau</option>
                  <option value="travel">Voyage</option>
                  <option value="marketing">Marketing</option>
                  <option value="development">Développement</option>
                </select>
              )}
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Trier par date</option>
                <option value="amount">Trier par montant</option>
                <option value="status">Trier par statut</option>
                <option value="name">Trier par nom</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FunnelIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Boutons de vue */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vue :</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'grid', icon: Squares2X2Icon, label: 'Grille' },
                { id: 'list', icon: ListBulletIcon, label: 'Liste' },
                { id: 'kanban', icon: ChartBarIcon, label: 'Kanban' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${
                    viewMode === mode.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <mode.icon className="w-4 h-4 mr-1" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredData.length} élément{filteredData.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Contenu principal */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément trouvé</h3>
            <p className="text-gray-500 mb-6">
              {filters.search ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier élément.'}
            </p>
            <button
              onClick={() => {
                if (activeTab === 'invoices') setShowInvoiceModal(true);
                else if (activeTab === 'expenses') setShowExpenseModal(true);
                else if (activeTab === 'budgets') setShowBudgetModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Créer le premier élément
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : viewMode === 'list' 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.title || item.clientName || item.client || 'Sans titre'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(item.createdAt || item.date)}
                        </span>
                        {item.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(item.amount || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          if (activeTab === 'invoices') setShowInvoiceModal(true);
                          else if (activeTab === 'expenses') setShowExpenseModal(true);
                          else if (activeTab === 'budgets') setShowBudgetModal(true);
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
                    <button className="text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <InvoiceFormModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setEditingItem(null);
        }}
        onSuccess={editingItem ? 
          (data) => handleUpdateInvoice(editingItem.id, data) : 
          handleCreateInvoice
        }
        editingInvoice={editingItem}
        users={users}
      />

      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingItem(null);
        }}
        onSuccess={editingItem ? 
          (data) => handleUpdateExpense(editingItem.id, data) : 
          handleCreateExpense
        }
        editingExpense={editingItem}
        users={users}
      />

      <BudgetFormModal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setEditingItem(null);
        }}
        onSuccess={editingItem ? 
          (data) => handleUpdateBudget(editingItem.id, data) : 
          handleCreateBudget
        }
        editingBudget={editingItem}
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

export default FinanceUltraModernV3;
