/**
 * 📚 KNOWLEDGE BASE ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 * Architecture 100% identique à ProjectsUltraModernV2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DocumentTextIcon,
  FolderIcon,
  TagIcon,
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
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { KnowledgeArticle, KnowledgeCategory, User } from '../types';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { userService } from '../services/userService';
import ConfirmationModal from './common/ConfirmationModal';
import ArticleFormModal from './forms/ArticleFormModal';
import CategoryFormModal from './forms/CategoryFormModal';

// Types pour Knowledge Base UltraModern
interface KnowledgeMetrics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  averageRating: number;
  totalHelpful: number;
  totalCategories: number;
  recentArticles: number;
}

interface KnowledgeFilters {
  search: string;
  status: string;
  category: string;
  dateRange: { start: string; end: string };
  author: string;
}

const KnowledgeBaseUltraModernV3Standard: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  
  // États principaux
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | null>(null);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<KnowledgeCategory | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  const [filters, setFilters] = useState<KnowledgeFilters>({
    search: '',
    status: '',
    category: '',
    dateRange: { start: '', end: '' },
    author: ''
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
      
      console.log('🔄 Chargement des données Knowledge Base...');
      
      // Charger les données depuis Supabase (temporairement sans filtrage strict)
      const [articlesData, categoriesData, usersData] = await Promise.all([
        knowledgeBaseService.getArticles(), // Récupérer tous les articles pour l'instant
        knowledgeBaseService.getCategories(),
        userService.getAll()
      ]);
      
      setArticles(articlesData);
      setCategories(categoriesData);
      setUsers(usersData);
      
      console.log(`✅ ${articlesData.length} articles, ${categoriesData.length} catégories et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setError('Erreur lors du chargement des données depuis la base de données');
      setArticles([]);
      setCategories([]);
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
  const metrics = useMemo((): KnowledgeMetrics => {
    const totalArticles = articles.length;
    const publishedArticles = articles.filter(article => article.status === 'published').length;
    const draftArticles = articles.filter(article => article.status === 'draft').length;
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    const averageRating = articles.length > 0 
      ? articles.reduce((sum, article) => sum + (article.rating || 0), 0) / articles.length 
      : 0;
    const totalHelpful = articles.reduce((sum, article) => sum + (article.helpful || 0), 0);
    const totalCategories = categories.length;
    const recentArticles = articles.filter(article => {
      const articleDate = new Date(article.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return articleDate > weekAgo;
    }).length;

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      averageRating,
      totalHelpful,
      totalCategories,
      recentArticles
    };
  }, [articles, categories]);

  // Logique de filtrage et recherche
  const getFilteredAndSortedItems = (items: any[]) => {
    let filtered = items.filter(item => {
      const matchesSearch = !filters.search ||
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(filters.search.toLowerCase())) ||
        getAuthorName(item.authorId)?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
      const matchesCategory = !filters.category || filters.category === 'all' || item.categoryId === filters.category;
      const matchesAuthor = !filters.author || filters.author === 'all' || item.authorId === filters.author;

      return matchesSearch && matchesStatus && matchesCategory && matchesAuthor;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
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
      case 'articles':
        return getFilteredAndSortedItems(articles);
      case 'categories':
        return getFilteredAndSortedItems(categories);
      default:
        return [];
    }
  }, [activeTab, articles, categories, filters, sortBy, sortOrder, users]);

  // Fonctions CRUD
  const handleCreateArticle = async (articleData: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdArticle = await knowledgeBaseService.createArticle(articleData);
      if (createdArticle) {
        setArticles(prev => [createdArticle, ...prev]);
        console.log('✅ Article créé avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création article:', error);
      setError('Erreur lors de la création de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArticle = async (id: string, articleData: Partial<KnowledgeArticle>) => {
    try {
      setLoading(true);
      const updatedArticle = await knowledgeBaseService.updateArticle(id, articleData);
      if (updatedArticle) {
        setArticles(prev => prev.map(art => art.id === id ? updatedArticle : art));
        console.log('✅ Article mis à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour article:', error);
      setError('Erreur lors de la mise à jour de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      setLoading(true);
      await knowledgeBaseService.deleteArticle(id);
      setArticles(prev => prev.filter(art => art.id !== id));
      console.log('✅ Article supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression article:', error);
      setError('Erreur lors de la suppression de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: Omit<KnowledgeCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const createdCategory = await knowledgeBaseService.createCategory(categoryData);
      if (createdCategory) {
        setCategories(prev => [createdCategory, ...prev]);
        console.log('✅ Catégorie créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création catégorie:', error);
      setError('Erreur lors de la création de la catégorie');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: Partial<KnowledgeCategory>) => {
    try {
      setLoading(true);
      const updatedCategory = await knowledgeBaseService.updateCategory(id, categoryData);
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
        console.log('✅ Catégorie mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour catégorie:', error);
      setError('Erreur lors de la mise à jour de la catégorie');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await knowledgeBaseService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      console.log('✅ Catégorie supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression catégorie:', error);
      setError('Erreur lors de la suppression de la catégorie');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      if (deletingItem.type === 'article') {
        await handleDeleteArticle(deletingItem.id);
      } else if (deletingItem.type === 'category') {
        await handleDeleteCategory(deletingItem.id);
      }
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  // Fonctions utilitaires
  const getAuthorName = (authorId: string) => {
    const author = users.find(u => u.id === authorId);
    return author ? `${author.firstName} ${author.lastName}` : 'Auteur inconnu';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft': return <ClockIcon className="w-4 h-4" />;
      case 'archived': return <XMarkIcon className="w-4 h-4" />;
      case 'pending': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la base de connaissances...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Base de Connaissances</h1>
              <p className="text-gray-600">Articles et catégories de connaissances</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setEditingCategory(null);
                  if (activeTab === 'articles') setShowArticleModal(true);
                  else if (activeTab === 'categories') setShowCategoryModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {activeTab === 'articles' ? 'Nouvel Article' : 'Nouvelle Catégorie'}
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
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Articles</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalArticles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Publiés</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.publishedArticles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Vues</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('articles')}
              className={`${activeTab === 'articles' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Articles
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`${activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              Catégories
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
              {activeTab === 'articles' && (
                <>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="archived">Archivé</option>
                    <option value="pending">En attente</option>
                  </select>

                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.author}
                    onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les auteurs</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </>
              )}

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
                {activeTab === 'articles' && (
                  <>
                    <option value="views-desc">Plus vus</option>
                    <option value="rating-desc">Mieux notés</option>
                  </>
                )}
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
                <p className="text-sm text-red-700 mt-1">{errorState}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des éléments */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élément trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.category || filters.author
                ? 'Aucun élément ne correspond aux filtres appliqués.'
                : `Commencez par créer votre premier ${activeTab === 'articles' ? 'article' : 'catégorie'}.`
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setEditingCategory(null);
                  if (activeTab === 'articles') setShowArticleModal(true);
                  else if (activeTab === 'categories') setShowCategoryModal(true);
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
                          {item.content?.substring(0, 100)}...
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
                        {activeTab === 'articles' && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              {item.views || 0} vues
                            </span>
                            <span className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1" />
                              {item.rating || 0}/5
                            </span>
                            <span className="flex items-center">
                              <HeartIcon className="w-4 h-4 mr-1" />
                              {item.helpful || 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (activeTab === 'articles') {
                              setEditingArticle(item);
                              setShowArticleModal(true);
                            } else if (activeTab === 'categories') {
                              setEditingCategory(item);
                              setShowCategoryModal(true);
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
                        {activeTab === 'articles' ? getAuthorName(item.authorId) : `${item.articlesCount || 0} articles`}
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
                          {activeTab === 'articles' ? 'Article' : 'Catégorie'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        {activeTab === 'articles' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Auteur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vues
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
                          {activeTab === 'articles' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getAuthorName(item.authorId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.views || 0}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'articles') {
                                    setEditingArticle(item);
                                    setShowArticleModal(true);
                                  } else if (activeTab === 'categories') {
                                    setEditingCategory(item);
                                    setShowCategoryModal(true);
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
                          {activeTab === 'articles' ? 'Article' : 'Catégorie'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        {activeTab === 'articles' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Auteur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vues
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
                          {activeTab === 'articles' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getAuthorName(item.authorId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.views || 0}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (activeTab === 'articles') {
                                    setEditingArticle(item);
                                    setShowArticleModal(true);
                                  } else if (activeTab === 'categories') {
                                    setEditingCategory(item);
                                    setShowCategoryModal(true);
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
      <ArticleFormModal
        isOpen={showArticleModal}
        onClose={() => {
          setShowArticleModal(false);
          setEditingArticle(null);
        }}
        onSuccess={editingArticle ? 
          (data) => handleUpdateArticle(editingArticle.id, data) : 
          handleCreateArticle
        }
        editingArticle={editingArticle}
        categories={categories}
        users={users}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSuccess={editingCategory ? 
          (data) => handleUpdateCategory(editingCategory.id, data) : 
          handleCreateCategory
        }
        editingCategory={editingCategory}
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

export default KnowledgeBaseUltraModernV3Standard;
