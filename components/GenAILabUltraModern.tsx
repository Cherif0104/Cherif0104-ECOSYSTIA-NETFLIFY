import React, { useState, useEffect } from 'react';
import { 
  BeakerIcon,
  SparklesIcon,
  DocumentTextIcon,
  PhotoIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  BookmarkIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Types pour Gen AI Lab
interface Generation {
  id: string;
  title: string;
  type: 'text' | 'image' | 'code' | 'document';
  content: string;
  prompt: string;
  template?: string;
  tags: string[];
  isBookmarked: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  views: number;
  downloads: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'code' | 'document';
  prompt: string;
  variables: string[];
  category: string;
  isPublic: boolean;
  createdAt: Date;
  usageCount: number;
}

interface GenerationStats {
  totalGenerations: number;
  thisMonth: number;
  totalTemplates: number;
  totalDownloads: number;
}


const mockStats: GenerationStats = {
  totalGenerations: 156,
  thisMonth: 23,
  totalTemplates: 12,
  totalDownloads: 89
};

const GenAILabUltraModern: React.FC = () => {
  const [generations, setGenerations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState([]);
  const [activeTab, setActiveTab] = useState<'generations' | 'templates' | 'create'>('generations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Métriques
  const metrics = [
    {
      title: 'Générations Total',
      value: stats.totalGenerations,
      change: `+${stats.thisMonth} ce mois`,
      changeType: 'increase' as const,
      icon: BeakerIcon,
      color: 'blue'
    },
    {
      title: 'Templates',
      value: stats.totalTemplates,
      change: '+2 nouveaux',
      changeType: 'increase' as const,
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      title: 'Téléchargements',
      value: stats.totalDownloads,
      change: '+15 cette semaine',
      changeType: 'increase' as const,
      icon: ArrowDownTrayIcon,
      color: 'purple'
    },
    {
      title: 'Partages',
      value: '34',
      change: '+8 cette semaine',
      changeType: 'increase' as const,
      icon: ShareIcon,
      color: 'orange'
    }
  ];

  // Actions rapides
  const quickActions = [
    {
      label: 'Générer Texte',
      icon: DocumentTextIcon,
      onClick: () => setActiveTab('create'),
      color: 'blue'
    },
    {
      label: 'Créer Image',
      icon: PhotoIcon,
      onClick: () => setActiveTab('create'),
      color: 'green'
    },
    {
      label: 'Générer Code',
      icon: CodeBracketIcon,
      onClick: () => setActiveTab('create'),
      color: 'purple'
    },
    {
      label: 'Nouveau Template',
      icon: PlusIcon,
      onClick: () => console.log('Nouveau template'),
      color: 'orange'
    }
  ];

  // Filtrage des générations
  const filteredGenerations = generations.filter(gen => {
    const matchesSearch = gen.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gen.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gen.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || gen.type === filterType;
    const matchesCategory = filterCategory === 'all' || gen.template === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Filtrage des templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Générer du contenu
  const generateContent = async (prompt: string, type: 'text' | 'image' | 'code' | 'document') => {
    setIsGenerating(true);
    
    // Simuler la génération
    setTimeout(() => {
      const newGeneration: Generation = {
        id: Date.now().toString(),
        title: `Génération ${type} - ${new Date().toLocaleTimeString()}`,
        type,
        content: generateMockContent(type, prompt),
        prompt,
        tags: extractTags(prompt),
        isBookmarked: false,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        downloads: 0
      };
      
      setGenerations([newGeneration, ...generations]);
      setStats({
        ...stats,
        totalGenerations: stats.totalGenerations + 1,
        thisMonth: stats.thisMonth + 1
      });
      setIsGenerating(false);
    }, 3000);
  };

  // Générer du contenu mock
  const generateMockContent = (type: string, prompt: string): string => {
    switch (type) {
      case 'text':
        return `Contenu généré basé sur: "${prompt}"\n\nCeci est un exemple de contenu textuel généré par l'IA. Le contenu peut être personnalisé selon vos besoins spécifiques.`;
      case 'image':
        return 'https://example.com/generated-image.png';
      case 'code':
        return `// Code généré basé sur: "${prompt}"\n\nfunction generatedFunction() {\n  // Votre code ici\n  return "Hello World";\n}`;
      case 'document':
        return `Document généré basé sur: "${prompt}"\n\n# Titre du Document\n\n## Introduction\n\nContenu du document...`;
      default:
        return 'Contenu généré';
    }
  };

  // Extraire les tags du prompt
  const extractTags = (prompt: string): string[] => {
    const commonTags = ['IA', 'Généré', 'Automatique'];
    const words = prompt.toLowerCase().split(' ');
    const techTags = words.filter(word => 
      ['react', 'javascript', 'python', 'design', 'logo', 'article', 'code'].includes(word)
    );
    return [...commonTags, ...techTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1))];
  };

  // Marquer comme favori
  const toggleBookmark = (id: string) => {
    setGenerations(generations.map(gen =>
      gen.id === id ? { ...gen, isBookmarked: !gen.isBookmarked } : gen
    ));
  };

  // Toggle public/privé
  const togglePublic = (id: string) => {
    setGenerations(generations.map(gen =>
      gen.id === id ? { ...gen, isPublic: !gen.isPublic } : gen
    ));
  };

  // Supprimer une génération
  const deleteGeneration = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette génération ?')) {
      setGenerations(generations.filter(gen => gen.id !== id));
    }
  };

  // Télécharger une génération
  const downloadGeneration = (generation: Generation) => {
    const blob = new Blob([generation.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generation.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mettre à jour les stats
    setStats({
      ...stats,
      totalDownloads: stats.totalDownloads + 1
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gen AI Lab
        </h1>
        <p className="text-gray-600">
          Laboratoire d'intelligence artificielle générative pour créer du contenu innovant
        </p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                metric.color === 'blue' ? 'bg-blue-100' :
                metric.color === 'green' ? 'bg-green-100' :
                metric.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <metric.icon className={`h-6 w-6 ${
                  metric.color === 'blue' ? 'text-blue-600' :
                  metric.color === 'green' ? 'text-green-600' :
                  metric.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
                action.color === 'blue' ? 'hover:bg-blue-50' :
                action.color === 'green' ? 'hover:bg-green-50' :
                action.color === 'purple' ? 'hover:bg-purple-50' :
                'hover:bg-orange-50'
              }`}
            >
              <action.icon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'generations', label: 'Mes Générations', count: generations.length },
              { id: 'templates', label: 'Templates', count: templates.length },
              { id: 'create', label: 'Créer', count: null }
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
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'generations' && (
            <div>
              {/* Filtres */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher des générations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les types</option>
                    <option value="text">Texte</option>
                    <option value="image">Image</option>
                    <option value="code">Code</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Liste des générations */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGenerations.map((generation) => (
                    <div key={generation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {generation.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              generation.type === 'text' ? 'bg-blue-100 text-blue-800' :
                              generation.type === 'image' ? 'bg-green-100 text-green-800' :
                              generation.type === 'code' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {generation.type === 'text' ? 'Texte' :
                               generation.type === 'image' ? 'Image' :
                               generation.type === 'code' ? 'Code' : 'Document'}
                            </span>
                            {generation.isPublic && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Public
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-3">
                            {generation.content.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {generation.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {generation.views}
                          </span>
                          <span className="flex items-center">
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            {generation.downloads}
                          </span>
                        </div>
                        <span>
                          {generation.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(generation.id)}
                            className={`p-2 rounded-lg ${
                              generation.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <BookmarkIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => togglePublic(generation.id)}
                            className={`p-2 rounded-lg ${
                              generation.isPublic ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                            }`}
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedGeneration(generation)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadGeneration(generation)}
                            className="p-2 text-gray-400 hover:text-green-600"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteGeneration(generation.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Titre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vues
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléchargements
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
                      {filteredGenerations.map((generation) => (
                        <tr key={generation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {generation.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {generation.content.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              generation.type === 'text' ? 'bg-blue-100 text-blue-800' :
                              generation.type === 'image' ? 'bg-green-100 text-green-800' :
                              generation.type === 'code' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {generation.type === 'text' ? 'Texte' :
                               generation.type === 'image' ? 'Image' :
                               generation.type === 'code' ? 'Code' : 'Document'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {generation.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                              {generation.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{generation.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {generation.views}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {generation.downloads}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {generation.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedGeneration(generation)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => downloadGeneration(generation)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteGeneration(generation.id)}
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
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.type === 'text' ? 'bg-blue-100 text-blue-800' :
                            template.type === 'image' ? 'bg-green-100 text-green-800' :
                            template.type === 'code' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {template.type === 'text' ? 'Texte' :
                             template.type === 'image' ? 'Image' :
                             template.type === 'code' ? 'Code' : 'Document'}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Utilisé {template.usageCount} fois
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Utiliser
                      </button>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Créer du Contenu avec l'IA
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contenu
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { type: 'text', label: 'Texte', icon: DocumentTextIcon },
                      { type: 'image', label: 'Image', icon: PhotoIcon },
                      { type: 'code', label: 'Code', icon: CodeBracketIcon },
                      { type: 'document', label: 'Document', icon: ClipboardDocumentIcon }
                    ].map((item) => (
                      <button
                        key={item.type}
                        className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <item.icon className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    placeholder="Décrivez ce que vous voulez générer..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => generateContent('Exemple de prompt', 'text')}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Générer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détail */}
      {selectedGeneration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedGeneration.title}
              </h3>
              <button
                onClick={() => setSelectedGeneration(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt utilisé :</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {selectedGeneration.prompt}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contenu généré :</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {selectedGeneration.content}
                </pre>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadGeneration(selectedGeneration)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Télécharger
                </button>
                <button
                  onClick={() => toggleBookmark(selectedGeneration.id)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedGeneration.isBookmarked
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800'
                  }`}
                >
                  {selectedGeneration.isBookmarked ? 'Favori' : 'Ajouter aux favoris'}
                </button>
              </div>
              
              <button
                onClick={() => setSelectedGeneration(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
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

export default GenAILabUltraModern;
