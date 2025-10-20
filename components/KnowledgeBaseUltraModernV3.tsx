import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { userService } from '../services/userService';
import { moduleInterconnectionService } from '../services/moduleInterconnectionService';
import { KnowledgeArticle, KnowledgeCategory, User } from '../types';
import ArticleFormModal from './forms/ArticleFormModal';
import CategoryFormModal from './forms/CategoryFormModal';
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
  DocumentTextIcon,
  FolderIcon,
  TagIcon,
  StarIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const KnowledgeBaseUltraModernV3: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'search' | 'analytics'>('articles');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'views' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    type: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // États pour les modales
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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
      console.log('🔄 Chargement des données Knowledge Base...');
      const [articlesData, categoriesData, usersData] = await Promise.all([
        knowledgeBaseService.getArticles(user?.id), // Filtrer par utilisateur connecté
        knowledgeBaseService.getCategories(),
        userService.getAllUsers()
      ]);
      console.log(`✅ ${articlesData.length} articles chargés`);
      console.log(`✅ ${categoriesData.length} catégories chargées`);
      console.log(`✅ ${usersData.length} utilisateurs chargés`);
      setArticles(articlesData);
      setCategories(categoriesData);
      setUsers(usersData);
      setError(null);
    } catch (error: any) {
      console.error('❌ Erreur chargement données Knowledge Base:', error);
      setError('Erreur lors du chargement des données de la base de connaissances');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les métriques
  const metrics = useMemo(() => {
    const totalArticles = articles.length;
    const publishedArticles = articles.filter(article => article.status === 'published').length;
    const draftArticles = articles.filter(article => article.status === 'draft').length;
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
    const averageRating = articles.length > 0 
      ? articles.reduce((sum, article) => sum + (article.rating || 0), 0) / articles.length 
      : 0;
    const totalHelpful = articles.reduce((sum, article) => sum + (article.helpful || 0), 0);

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      averageRating,
      totalHelpful
    };
  }, [articles]);

  // Filtrer et trier les données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'articles':
        data = articles;
        break;
      case 'categories':
        data = categories;
        break;
      case 'search':
        data = articles; // Pour la recherche, on filtre les articles
        break;
      case 'analytics':
        data = articles; // Pour les analytics, on utilise les articles
        break;
    }

    // Filtrage par recherche
    if (filters.search) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.summary?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Filtrage par catégorie
    if (filters.category !== 'all' && activeTab === 'articles') {
      data = data.filter(item => item.category === filters.category);
    }

    // Filtrage par statut
    if (filters.status !== 'all' && activeTab === 'articles') {
      data = data.filter(item => item.status === filters.status);
    }

    // Filtrage par type
    if (filters.type !== 'all' && activeTab === 'articles') {
      data = data.filter(item => item.type === filters.type);
    }

    // Tri
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || a.created_at).getTime();
          bValue = new Date(b.createdAt || b.created_at).getTime();
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
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
  }, [articles, categories, activeTab, filters, sortBy, sortOrder]);

  const handleCreateArticle = async (articleData: any) => {
    try {
      const created = await knowledgeBaseService.createArticle(articleData);
      if (created) {
        setArticles(prev => [created, ...prev]);
        await moduleInterconnectionService.syncModuleData('knowledge_base', 'create', created);
        console.log('✅ Article créé avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur création article:', error);
      setError('Erreur lors de la création de l\'article');
    }
  };

  const handleCreateCategory = async (categoryData: any) => {
    try {
      const created = await knowledgeBaseService.createCategory(categoryData);
      if (created) {
        setCategories(prev => [created, ...prev]);
        await moduleInterconnectionService.syncModuleData('knowledge_base', 'create', created);
        console.log('✅ Catégorie créée avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur création catégorie:', error);
      setError('Erreur lors de la création de la catégorie');
    }
  };

  const handleUpdateArticle = async (id: string, articleData: any) => {
    try {
      const updated = await knowledgeBaseService.updateArticle(id, articleData);
      if (updated) {
        setArticles(prev => prev.map(item => item.id === id ? updated : item));
        await moduleInterconnectionService.syncModuleData('knowledge_base', 'update', updated);
        console.log('✅ Article mis à jour avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour article:', error);
      setError('Erreur lors de la mise à jour de l\'article');
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: any) => {
    try {
      const updated = await knowledgeBaseService.updateCategory(id, categoryData);
      if (updated) {
        setCategories(prev => prev.map(item => item.id === id ? updated : item));
        await moduleInterconnectionService.syncModuleData('knowledge_base', 'update', updated);
        console.log('✅ Catégorie mise à jour avec succès');
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour catégorie:', error);
      setError('Erreur lors de la mise à jour de la catégorie');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      let success = false;
      
      switch (deletingItem.type) {
        case 'article':
          success = await knowledgeBaseService.deleteArticle(deletingItem.id);
          if (success) setArticles(prev => prev.filter(item => item.id !== deletingItem.id));
          break;
        case 'category':
          success = await knowledgeBaseService.deleteCategory(deletingItem.id);
          if (success) setCategories(prev => prev.filter(item => item.id !== deletingItem.id));
          break;
      }

      if (success) {
        await moduleInterconnectionService.syncModuleData('knowledge_base', 'delete', { id: deletingItem.id, type: deletingItem.type });
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
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'tutorial': return 'bg-purple-100 text-purple-800';
      case 'faq': return 'bg-orange-100 text-orange-800';
      case 'guide': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la base de connaissances...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Base de Connaissances</h1>
                <p className="mt-1 text-sm text-gray-500">Gestion centralisée des articles et ressources</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowArticleModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouvel Article
                </button>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouvelle Catégorie
                </button>
              </div>
            </div>

            {/* Métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Total Articles</p>
                    <p className="text-2xl font-bold">{metrics.totalArticles}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <EyeIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-green-100 text-sm">Vues Total</p>
                    <p className="text-2xl font-bold">{metrics.totalViews}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <StarIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-purple-100 text-sm">Note Moyenne</p>
                    <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <HeartIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-orange-100 text-sm">Utiles</p>
                    <p className="text-2xl font-bold">{metrics.totalHelpful}</p>
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
                { id: 'articles', label: 'Articles', icon: DocumentTextIcon, count: articles.length },
                { id: 'categories', label: 'Catégories', icon: FolderIcon, count: categories.length },
                { id: 'search', label: 'Recherche', icon: MagnifyingGlassIcon, count: 0 },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, count: 0 }
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
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
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
                  placeholder="Rechercher dans la base de connaissances..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              {activeTab === 'articles' && (
                <>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="archived">Archivé</option>
                  </select>
                  
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="article">Article</option>
                    <option value="tutorial">Tutoriel</option>
                    <option value="faq">FAQ</option>
                    <option value="guide">Guide</option>
                  </select>
                </>
              )}
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Trier par date</option>
                <option value="title">Trier par titre</option>
                <option value="views">Trier par vues</option>
                <option value="rating">Trier par note</option>
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
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément trouvé</h3>
            <p className="text-gray-500 mb-6">
              {filters.search ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier élément.'}
            </p>
            <button
              onClick={() => {
                if (activeTab === 'articles') setShowArticleModal(true);
                else if (activeTab === 'categories') setShowCategoryModal(true);
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
                        {item.title || item.name || 'Sans titre'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.summary || item.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {formatDate(item.createdAt || item.created_at)}
                        </span>
                        {item.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                        {item.type && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.views !== undefined && (
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {item.views}
                        </div>
                      )}
                      {item.rating !== undefined && (
                        <div className="flex items-center text-sm text-gray-500">
                          <StarIcon className="w-4 h-4 mr-1" />
                          {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          if (activeTab === 'articles') setShowArticleModal(true);
                          else if (activeTab === 'categories') setShowCategoryModal(true);
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
      <ArticleFormModal
        isOpen={showArticleModal}
        onClose={() => {
          setShowArticleModal(false);
          setEditingItem(null);
        }}
        onSuccess={editingItem ? 
          (data) => handleUpdateArticle(editingItem.id, data) : 
          handleCreateArticle
        }
        editingArticle={editingItem}
        categories={categories}
        users={users}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingItem(null);
        }}
        onSuccess={editingItem ? 
          (data) => handleUpdateCategory(editingItem.id, data) : 
          handleCreateCategory
        }
        editingCategory={editingItem}
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

export default KnowledgeBaseUltraModernV3;
