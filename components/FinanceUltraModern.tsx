import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { financeService } from '../services/financeServiceSupabase';
import { Invoice, Expense, Budget, RecurringItem } from '../types';
import InvoiceFormModal from './forms/InvoiceFormModal';
import ExpenseFormModal from './forms/ExpenseFormModal';
import BudgetFormModal from './forms/BudgetFormModal';

const FinanceUltraModern: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'budgets' | 'recurring'>('invoices');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);

  // États pour les modales
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [invoicesData, expensesData, budgetsData, recurringData] = await Promise.all([
        financeService.getInvoices(),
        financeService.getExpenses(),
        financeService.getBudgets(),
        financeService.getRecurringItems()
      ]);

      setInvoices(invoicesData);
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setRecurringItems(recurringData);
    } catch (error: any) {
      console.error('Erreur chargement données finance:', error);
      setError('Erreur lors du chargement des données');
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
    if (searchTerm) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all' && activeTab === 'invoices') {
      data = data.filter(item => item.status === filterStatus);
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
          aValue = a.title || a.clientName || '';
          bValue = b.title || b.clientName || '';
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
  }, [invoices, expenses, budgets, recurringItems, activeTab, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleDelete = async (id: string, type: string) => {
    try {
      let success = false;
      
      switch (type) {
        case 'invoice':
          success = await financeService.deleteInvoice(id);
          if (success) setInvoices(prev => prev.filter(item => item.id !== id));
          break;
        case 'expense':
          success = await financeService.deleteExpense(id);
          if (success) setExpenses(prev => prev.filter(item => item.id !== id));
          break;
        case 'budget':
          success = await financeService.deleteBudget(id);
          if (success) setBudgets(prev => prev.filter(item => item.id !== id));
          break;
        case 'recurring':
          success = await financeService.deleteRecurringItem(id);
          if (success) setRecurringItems(prev => prev.filter(item => item.id !== id));
          break;
      }

      if (success) {
        console.log(`✅ ${type} supprimé avec succès`);
      }
    } catch (error: any) {
      console.error(`❌ Erreur suppression ${type}:`, error);
      setError(`Erreur lors de la suppression du ${type}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (date: string) => {
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Nouvelle Facture
                </button>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-minus mr-2"></i>
                  Nouvelle Dépense
                </button>
              </div>
            </div>

            {/* Métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-file-invoice text-2xl mr-3"></i>
                  <div>
                    <p className="text-blue-100 text-sm">Total Factures</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalInvoices)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-2xl mr-3"></i>
                  <div>
                    <p className="text-green-100 text-sm">Factures Payées</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.paidInvoices)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-2xl mr-3"></i>
                  <div>
                    <p className="text-red-100 text-sm">Dépenses</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-chart-line text-2xl mr-3"></i>
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
                { id: 'invoices', label: 'Factures', icon: 'fas fa-file-invoice', count: invoices.length },
                { id: 'expenses', label: 'Dépenses', icon: 'fas fa-receipt', count: expenses.length },
                { id: 'budgets', label: 'Budgets', icon: 'fas fa-wallet', count: budgets.length },
                { id: 'recurring', label: 'Récurrents', icon: 'fas fa-sync', count: recurringItems.length }
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
                  <i className={`${tab.icon} mr-2`}></i>
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
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              {activeTab === 'invoices' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="paid">Payées</option>
                  <option value="pending">En attente</option>
                  <option value="overdue">En retard</option>
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
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
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
                { id: 'grid', icon: 'fas fa-th', label: 'Grille' },
                { id: 'list', icon: 'fas fa-list', label: 'Liste' },
                { id: 'kanban', icon: 'fas fa-columns', label: 'Kanban' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className={`${mode.icon} mr-1`}></i>
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
              <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier élément.'}
            </p>
            <button
              onClick={() => {
                if (activeTab === 'invoices') setShowInvoiceModal(true);
                else if (activeTab === 'expenses') setShowExpenseModal(true);
                else if (activeTab === 'budgets') setShowBudgetModal(true);
                else if (activeTab === 'recurring') setShowRecurringModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
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
                        {item.title || item.clientName || 'Sans titre'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
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
                          else if (activeTab === 'recurring') setShowRecurringModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, activeTab.slice(0, -1))}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Supprimer
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales améliorées avec formulaires complets */}
      <InvoiceFormModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingInvoice={editingItem}
      />

      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingExpense={editingItem}
      />

      <BudgetFormModal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingBudget={editingItem}
      />
    </div>
  );
};

export default FinanceUltraModern;
