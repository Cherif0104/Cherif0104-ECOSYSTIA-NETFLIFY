import React, { useState, useMemo } from 'react';
import { KnowledgeArticle, KnowledgeCategory } from '../types';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import ArticleFormModal from './forms/ArticleFormModal';
import CategoryFormModal from './forms/CategoryFormModal';

interface KnowledgeBaseUltraModernProps {
  onAddArticle?: (article: KnowledgeArticle) => void;
  onUpdateArticle?: (id: string, article: KnowledgeArticle) => void;
  onDeleteArticle?: (id: string) => void;
  onAddCategory?: (category: KnowledgeCategory) => void;
  onUpdateCategory?: (id: string, category: KnowledgeCategory) => void;
  onDeleteCategory?: (id: string) => void;
}

const KnowledgeBaseUltraModern: React.FC<KnowledgeBaseUltraModernProps> = ({
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'search' | 'analytics'>('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'views' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'tutorial' | 'faq' | 'guide'>('all');
  
  // État pour les modales
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<KnowledgeCategory | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // États pour les données
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [articlesData, categoriesData] = await Promise.all([
          knowledgeBaseService.getArticles(),
          knowledgeBaseService.getCategories()
        ]);
        
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
        setArticles([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Métriques
  const metrics = useMemo(() => {
    const totalArticles = articles.length;
    const publishedArticles = articles.filter(a => a.status === 'published').length;
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    const averageRating = articles.length > 0 ? articles.reduce((sum, a) => sum + a.rating, 0) / articles.length : 0;
    const totalHelpful = articles.reduce((sum, a) => sum + a.helpful, 0);
    const totalCategories = categories.length;

    return {
      totalArticles,
      publishedArticles,
      totalViews,
      averageRating,
      totalHelpful,
      totalCategories
    };
  }, [articles, categories]);

  // Filtrage et tri
  const filteredArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
      const matchesType = filterType === 'all' || article.type === filterType;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
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
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
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
  }, [articles, searchTerm, sortBy, sortOrder, filterCategory, filterStatus, filterType]);

  const categoryNames = useMemo(() => {
    return categories.map(c => c.name);
  }, [categories]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
      case 'faq': return 'bg-green-100 text-green-800';
      case 'guide': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddArticle = () => {
    setEditingArticle(null);
    setIsArticleModalOpen(true);
  };

  const handleEditArticle = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setIsArticleModalOpen(true);
  };

  const handleDeleteArticle = (articleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setArticles(prev => prev.filter(a => a.id !== articleId));
      if (onDeleteArticle) onDeleteArticle(articleId);
    }
  };

  const handleViewArticle = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    // Simuler une vue
    setArticles(prev => prev.map(a => 
      a.id === article.id 
        ? { ...a, views: a.views + 1, lastViewed: new Date() }
        : a
    ));
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: KnowledgeCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      if (onDeleteCategory) onDeleteCategory(categoryId);
    }
  };

  const renderArticleCard = (article: KnowledgeArticle) => (
    <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{article.summary}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span><i className="fas fa-user mr-1"></i>{article.author}</span>
              <span><i className="fas fa-eye mr-1"></i>{article.views} vues</span>
              <span><i className="fas fa-thumbs-up mr-1"></i>{article.helpful} utiles</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-500">
                <i className="fas fa-star"></i>
              </span>
              <span className="text-sm text-gray-600">{article.rating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(article.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
              {article.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(article.type)}`}>
              {article.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
              {article.category}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {article.lastViewed && (
              <span><i className="fas fa-clock mr-1"></i>Vu le {formatDate(article.lastViewed)}</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Tags:</div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <i className="fas fa-edit mr-1"></i>
            Modifié le {formatDate(article.updatedAt)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewArticle(article)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Voir"
            >
              <i className="fas fa-eye"></i>
            </button>
            <button
              onClick={() => handleEditArticle(article)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              onClick={() => handleDeleteArticle(article.id)}
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

  const renderCategoryCard = (category: KnowledgeCategory) => (
    <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {category.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{category.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span><i className="fas fa-file-alt mr-1"></i>{category.articleCount} articles</span>
              <span><i className="fas fa-calendar mr-1"></i>Créé le {formatDate(category.createdAt)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category.color)}`}>
              {category.color}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <i className="fas fa-folder mr-1"></i>
            Catégorie de base de connaissances
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Base de Connaissances</h1>
              <p className="text-gray-600">Articles, guides et documentation</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddCategory}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-folder-plus"></i>
                <span>Nouvelle Catégorie</span>
              </button>
              <button
                onClick={handleAddArticle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-plus"></i>
                <span>Nouvel Article</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-file-alt text-2xl mr-3"></i>
              <div>
                <p className="text-blue-100 text-sm">Total Articles</p>
                <p className="text-2xl font-bold">{metrics.totalArticles}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-2xl mr-3"></i>
              <div>
                <p className="text-green-100 text-sm">Publiés</p>
                <p className="text-2xl font-bold">{metrics.publishedArticles}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-eye text-2xl mr-3"></i>
              <div>
                <p className="text-purple-100 text-sm">Total Vues</p>
                <p className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
            <div className="flex items-center">
              <i className="fas fa-star text-2xl mr-3"></i>
              <div>
                <p className="text-yellow-100 text-sm">Note Moyenne</p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="px-6 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'articles', label: 'Articles', icon: 'fas fa-file-alt' },
            { id: 'categories', label: 'Catégories', icon: 'fas fa-folder' },
            { id: 'search', label: 'Recherche', icon: 'fas fa-search' },
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
                placeholder="Rechercher dans la base de connaissances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categoryNames.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="article">Article</option>
              <option value="tutorial">Tutoriel</option>
              <option value="faq">FAQ</option>
              <option value="guide">Guide</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date de création</option>
              <option value="title">Titre</option>
              <option value="views">Vues</option>
              <option value="rating">Note</option>
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
        {activeTab === 'articles' && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredArticles.map(article => renderArticleCard(article))}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => renderCategoryCard(category))}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recherche avancée</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Entrez vos mots-clés..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auteur</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de l'auteur..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note minimum</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Toutes les notes</option>
                      <option value="4">4+ étoiles</option>
                      <option value="3">3+ étoiles</option>
                      <option value="2">2+ étoiles</option>
                    </select>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <i className="fas fa-search mr-2"></i>
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles les plus vus</h3>
              <div className="space-y-4">
                {articles
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map(article => (
                    <div key={article.id} className="flex items-center justify-between">
                      <span className="text-gray-600">{article.title}</span>
                      <span className="font-semibold">{article.views} vues</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Articles utiles</span>
                  <span className="font-semibold text-green-600">{metrics.totalHelpful}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Catégories actives</span>
                  <span className="font-semibold">{metrics.totalCategories}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taux de publication</span>
                  <span className="font-semibold">
                    {metrics.totalArticles > 0 ? Math.round((metrics.publishedArticles / metrics.totalArticles) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales améliorées avec formulaires complets */}
      <ArticleFormModal
        isOpen={isArticleModalOpen}
        onClose={() => {
          setIsArticleModalOpen(false);
          setEditingArticle(null);
        }}
        onSuccess={() => {
          // Recharger les articles depuis le service
          knowledgeBaseService.getArticles().then(setArticles);
        }}
        editingArticle={editingArticle}
        categories={categories}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          // Recharger les catégories depuis le service
          knowledgeBaseService.getCategories().then(setCategories);
        }}
        editingCategory={editingCategory}
      />

      {/* Modal de visualisation d'article */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">{selectedArticle.summary}</p>
              <div className="text-gray-700 whitespace-pre-wrap">{selectedArticle.content}</div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex space-x-4 text-sm text-gray-500">
                <span><i className="fas fa-user mr-1"></i>{selectedArticle.author}</span>
                <span><i className="fas fa-eye mr-1"></i>{selectedArticle.views} vues</span>
                <span><i className="fas fa-thumbs-up mr-1"></i>{selectedArticle.helpful} utiles</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseUltraModern;
