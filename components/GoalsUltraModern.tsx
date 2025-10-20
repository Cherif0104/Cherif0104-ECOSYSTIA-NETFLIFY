import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContextSupabase';
import { okrService } from '../services/okrService';
import { Objective, KeyResult } from '../types';
import ObjectiveFormModal from './forms/ObjectiveFormModal';

const GoalsUltraModern: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'objectives' | 'keyresults' | 'dashboard'>('objectives');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'date' | 'priority'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les données
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

  // États pour les modales
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showKeyResultModal, setShowKeyResultModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [objectivesData, keyResultsData] = await Promise.all([
        okrService.getObjectives(),
        okrService.getKeyResults()
      ]);

      setObjectives(objectivesData);
      setKeyResults(keyResultsData);
    } catch (error: any) {
      console.error('Erreur chargement données OKRs:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les métriques
  const metrics = useMemo(() => {
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(obj => {
      const progress = calculateObjectiveProgress(obj);
      return progress >= 100;
    }).length;
    
    const totalKeyResults = keyResults.length;
    const completedKeyResults = keyResults.filter(kr => {
      const progress = (kr.current / kr.target) * 100;
      return progress >= 100;
    }).length;

    const avgObjectiveProgress = objectives.length > 0 
      ? objectives.reduce((sum, obj) => sum + calculateObjectiveProgress(obj), 0) / objectives.length 
      : 0;

    const avgKeyResultProgress = keyResults.length > 0
      ? keyResults.reduce((sum, kr) => sum + (kr.current / kr.target) * 100, 0) / keyResults.length
      : 0;

    return {
      totalObjectives,
      completedObjectives,
      totalKeyResults,
      completedKeyResults,
      avgObjectiveProgress,
      avgKeyResultProgress
    };
  }, [objectives, keyResults]);

  const calculateObjectiveProgress = (objective: Objective) => {
    if (!objective.keyResults || objective.keyResults.length === 0) return 0;
    
    const totalProgress = objective.keyResults.reduce((sum, kr) => {
      return sum + (kr.current / kr.target) * 100;
    }, 0);
    
    return totalProgress / objective.keyResults.length;
  };

  // Filtrer et trier les données
  const filteredData = useMemo(() => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'objectives':
        data = objectives;
        break;
      case 'keyresults':
        data = keyResults;
        break;
      case 'dashboard':
        data = objectives; // Pour le dashboard, on affiche les objectifs
        break;
    }

    // Filtrage par recherche
    if (searchTerm) {
      data = data.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      data = data.filter(item => {
        if (activeTab === 'objectives') {
          const progress = calculateObjectiveProgress(item);
          switch (filterStatus) {
            case 'active': return progress > 0 && progress < 100;
            case 'completed': return progress >= 100;
            case 'paused': return progress === 0;
            default: return true;
          }
        } else if (activeTab === 'keyresults') {
          const progress = (item.current / item.target) * 100;
          switch (filterStatus) {
            case 'active': return progress > 0 && progress < 100;
            case 'completed': return progress >= 100;
            case 'paused': return progress === 0;
            default: return true;
          }
        }
        return true;
      });
    }

    // Tri
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'progress':
          if (activeTab === 'objectives') {
            aValue = calculateObjectiveProgress(a);
            bValue = calculateObjectiveProgress(b);
          } else {
            aValue = (a.current / a.target) * 100;
            bValue = (b.current / b.target) * 100;
          }
          break;
        case 'date':
          aValue = new Date(a.createdAt || a.date).getTime();
          bValue = new Date(b.createdAt || b.date).getTime();
          break;
        case 'priority':
          aValue = a.priority || 'medium';
          bValue = b.priority || 'medium';
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
  }, [objectives, keyResults, activeTab, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleDelete = async (id: string, type: string) => {
    try {
      let success = false;
      
      switch (type) {
        case 'objective':
          success = await okrService.deleteObjective(id);
          if (success) setObjectives(prev => prev.filter(item => item.id !== id));
          break;
        case 'keyresult':
          success = await okrService.deleteKeyResult(id);
          if (success) setKeyResults(prev => prev.filter(item => item.id !== id));
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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des objectifs et résultats clés...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Goals & OKRs</h1>
                <p className="mt-1 text-sm text-gray-500">Objectifs et résultats clés</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowObjectiveModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-bullseye mr-2"></i>
                  Nouvel Objectif
                </button>
                <button
                  onClick={() => setShowKeyResultModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-key mr-2"></i>
                  Nouveau Key Result
                </button>
              </div>
            </div>

            {/* Métriques */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-bullseye text-2xl mr-3"></i>
                  <div>
                    <p className="text-blue-100 text-sm">Total Objectifs</p>
                    <p className="text-2xl font-bold">{metrics.totalObjectives}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-2xl mr-3"></i>
                  <div>
                    <p className="text-green-100 text-sm">Objectifs Atteints</p>
                    <p className="text-2xl font-bold">{metrics.completedObjectives}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-key text-2xl mr-3"></i>
                  <div>
                    <p className="text-purple-100 text-sm">Key Results</p>
                    <p className="text-2xl font-bold">{metrics.totalKeyResults}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                <div className="flex items-center">
                  <i className="fas fa-chart-line text-2xl mr-3"></i>
                  <div>
                    <p className="text-orange-100 text-sm">Progrès Moyen</p>
                    <p className="text-2xl font-bold">{Math.round(metrics.avgObjectiveProgress)}%</p>
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
                { id: 'objectives', label: 'Objectifs', icon: 'fas fa-bullseye', count: objectives.length },
                { id: 'keyresults', label: 'Key Results', icon: 'fas fa-key', count: keyResults.length },
                { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', count: 0 }
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
                  placeholder="Rechercher objectifs, key results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">En cours</option>
                <option value="completed">Terminés</option>
                <option value="paused">En pause</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Trier par titre</option>
                <option value="progress">Trier par progrès</option>
                <option value="date">Trier par date</option>
                <option value="priority">Trier par priorité</option>
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
                if (activeTab === 'objectives') setShowObjectiveModal(true);
                else if (activeTab === 'keyresults') setShowKeyResultModal(true);
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
            {filteredData.map((item) => {
              const progress = activeTab === 'objectives' 
                ? calculateObjectiveProgress(item)
                : (item.current / item.target) * 100;
              
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.title || 'Sans titre'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.description || 'Aucune description'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            {formatDate(item.createdAt || item.date)}
                          </span>
                          {item.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round(progress)}%
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(progress)}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {activeTab === 'objectives' && item.keyResults && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Key Results ({item.keyResults.length})</p>
                        <div className="space-y-2">
                          {item.keyResults.slice(0, 3).map((kr, index) => {
                            const krProgress = (kr.current / kr.target) * 100;
                            return (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="flex-1 text-xs text-gray-600 truncate">
                                  {kr.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {kr.current}/{kr.target} {kr.unit}
                                </div>
                                <div className="w-12 h-1 bg-gray-200 rounded-full">
                                  <div 
                                    className={`h-1 rounded-full ${getProgressColor(krProgress)}`}
                                    style={{ width: `${Math.min(krProgress, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          {item.keyResults.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{item.keyResults.length - 3} autres...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'keyresults' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Progression: {item.current}/{item.target} {item.unit}
                          </span>
                          <span className="text-gray-500">
                            {item.objectiveId ? 'Objectif lié' : 'Sans objectif'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            if (activeTab === 'objectives') setShowObjectiveModal(true);
                            else if (activeTab === 'keyresults') setShowKeyResultModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, activeTab === 'objectives' ? 'objective' : 'keyresult')}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Modales améliorées avec formulaires complets */}
      <ObjectiveFormModal
        isOpen={showObjectiveModal}
        onClose={() => {
          setShowObjectiveModal(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        editingObjective={editingItem}
      />

      {showKeyResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Modifier le key result' : 'Nouveau key result'}
            </h2>
            <p className="text-gray-600 mb-4">Formulaire de key result à implémenter</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowKeyResultModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowKeyResultModal(false);
                  setEditingItem(null);
                  loadData();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsUltraModern;