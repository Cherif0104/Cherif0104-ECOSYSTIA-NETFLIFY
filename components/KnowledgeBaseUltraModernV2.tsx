import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpenIcon,
  DocumentTextIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import ArticleFormModal from './forms/ArticleFormModal';
import CategoryFormModal from './forms/CategoryFormModal';
import { Article, Category } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

const KnowledgeBaseUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Article | Category | null>(null);

  // Mock data - En production, ces données viendraient d'Supabase
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'Guide de démarrage rapide',
      content: 'Ce guide vous aidera à démarrer rapidement avec notre plateforme...',
      categoryId: 'cat-1',
      categoryName: 'Documentation',
      tags: ['démarrage', 'guide', 'tutoriel'],
      status: 'Published',
      authorId: 'user-1',
      authorName: 'Admin',
      views: 1250,
      likes: 45,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      title: 'FAQ - Questions fréquentes',
      content: 'Réponses aux questions les plus fréquemment posées...',
      categoryId: 'cat-2',
      categoryName: 'Support',
      tags: ['faq', 'aide', 'questions'],
      status: 'Published',
      authorId: 'user-1',
      authorName: 'Admin',
      views: 890,
      likes: 32,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      title: 'Guide API - Intégration',
      content: 'Documentation complète pour l\'intégration de notre API...',
      categoryId: 'cat-3',
      categoryName: 'Développement',
      tags: ['api', 'intégration', 'développement'],
      status: 'Draft',
      authorId: 'user-2',
      authorName: 'Dev Team',
      views: 0,
      likes: 0,
      createdAt: '2024-01-20T16:00:00Z',
      updatedAt: '2024-01-20T16:00:00Z'
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'cat-1',
      name: 'Documentation',
      description: 'Guides et documentation générale',
      color: '#3B82F6',
      articleCount: 15,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'cat-2',
      name: 'Support',
      description: 'Aide et support technique',
      color: '#10B981',
      articleCount: 8,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z'
    },
    {
      id: 'cat-3',
      name: 'Développement',
      description: 'Documentation technique et API',
      color: '#F59E0B',
      articleCount: 12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T16:00:00Z'
    }
  ]);

  // Calculs de métriques
  const metrics = useMemo(() => {
    const totalArticles = articles.length;
    const publishedArticles = articles.filter(art => art.status === 'Published').length;
    const draftArticles = articles.filter(art => art.status === 'Draft').length;
    const totalViews = articles.reduce((sum, art) => sum + art.views, 0);
    const totalLikes = articles.reduce((sum, art) => sum + art.likes, 0);
    const totalCategories = categories.length;
    const avgViewsPerArticle = totalArticles > 0 ? totalViews / totalArticles : 0;
    const engagementRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalLikes,
      totalCategories,
      avgViewsPerArticle,
      engagementRate
    };
  }, [articles, categories]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'articles':
        data = articles;
        break;
      case 'categories':
        data = categories;
        break;
    }

    return data.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [activeTab, articles, categories, searchTerm, filterCategory, filterStatus]);

  const handleCreate = () => {
    setEditingItem(null);
    switch (activeTab) {
      case 'articles':
        setShowArticleModal(true);
        break;
      case 'categories':
        setShowCategoryModal(true);
        break;
    }
  };

  const handleEdit = (item: Article | Category) => {
    setEditingItem(item);
    switch (activeTab) {
      case 'articles':
        setShowArticleModal(true);
        break;
      case 'categories':
        setShowCategoryModal(true);
        break;
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      switch (activeTab) {
        case 'articles':
          setArticles(prev => prev.filter(art => art.id !== id));
          break;
        case 'categories':
          setCategories(prev => prev.filter(cat => cat.id !== id));
          break;
      }
    }
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      // Mise à jour
      switch (activeTab) {
        case 'articles':
          setArticles(prev => prev.map(art => art.id === editingItem.id ? { ...art, ...data } : art));
          break;
        case 'categories':
          setCategories(prev => prev.map(cat => cat.id === editingItem.id ? { ...cat, ...data } : cat));
          break;
      }
    } else {
      // Création
      const newItem = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      switch (activeTab) {
        case 'articles':
          setArticles(prev => [...prev, newItem as Article]);
          break;
        case 'categories':
          setCategories(prev => [...prev, newItem as Category]);
          break;
      }
    }
    
    // Fermer les modales
    setShowArticleModal(false);
    setShowCategoryModal(false);
    setEditingItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
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
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                {t('knowledge_base')}
              </h1>
              <p className="text-gray-600 mt-1">{t('manage_articles_categories')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('tree')}
                className={`p-2 rounded-lg ${viewMode === 'tree' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title={t('tree_view')}
              >
                <FolderIcon className="h-5 w-5" />
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
                <p className="text-sm font-medium text-gray-600">{t('total_articles')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalArticles}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('published')}: {metrics.publishedArticles}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_views')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{t('avg_per_article')}: {metrics.avgViewsPerArticle.toFixed(0)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_likes')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalLikes}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">{t('engagement')}: {metrics.engagementRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('categories')}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCategories}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-medium">{t('drafts')}: {metrics.draftArticles}</span>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'articles', label: t('articles'), count: articles.length },
                { id: 'categories', label: t('categories'), count: categories.length }
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
                    placeholder={t('search_knowledge_base')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {activeTab === 'articles' && (
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t('all_categories')}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('all_status')}</option>
                  <option value="Published">{t('published')}</option>
                  <option value="Draft">{t('draft')}</option>
                  <option value="Archived">{t('archived')}</option>
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
                          {item.title || item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.content || item.description}
                        </p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('category')}:</span>
                        <span className="text-gray-900">{item.categoryName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('author')}:</span>
                        <span className="text-gray-900">{item.authorName || 'N/A'}</span>
                      </div>
                      {item.views !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('views')}:</span>
                          <span className="text-gray-900">{item.views.toLocaleString()}</span>
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
                        {activeTab === 'articles' ? t('title') : t('name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === 'articles' ? t('category') : t('description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      {activeTab === 'articles' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('views')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('likes')}
                          </th>
                        </>
                      )}
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
                            {item.title || item.name}
                          </div>
                          {item.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.categoryName || item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        {activeTab === 'articles' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.views?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.likes || 0}
                            </td>
                          </>
                        )}
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

            {viewMode === 'tree' && (
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <span className="text-sm text-gray-500">({category.articleCount} articles)</span>
                        </div>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {articles
                          .filter(art => art.categoryId === category.id)
                          .map(article => (
                            <div key={article.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                              <div>
                                <h4 className="font-medium text-gray-900">{article.title}</h4>
                                <p className="text-sm text-gray-500">{article.views} vues • {article.likes} likes</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(article)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(article.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_knowledge_data')}</h3>
                <p className="text-gray-600 mb-6">{t('no_knowledge_data_description')}</p>
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
      {showArticleModal && (
        <ArticleFormModal
          isOpen={showArticleModal}
          onClose={() => {
            setShowArticleModal(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingItem as Article}
          categories={categories}
        />
      )}

      {showCategoryModal && (
        <CategoryFormModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingItem as Category}
        />
      )}
    </div>
  );
};

export default KnowledgeBaseUltraModernV2;
