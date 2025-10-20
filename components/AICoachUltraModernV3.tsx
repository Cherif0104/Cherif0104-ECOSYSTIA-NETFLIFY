/**
 * 🤖 AI COACH ULTRA MODERN V3 - STANDARDISÉ SUR PROJECTS
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  TrashIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { useFeedback } from '../hooks/useFeedback';
import FeedbackDisplay from './common/FeedbackDisplay';
import LoadingButton from './common/LoadingButton';
import { User } from '../types';
import { userService } from '../services/userService';
import { aiCoachService, ChatSession, Recommendation } from '../services/aiCoachService';
import ConfirmationModal from './common/ConfirmationModal';

// Types pour AI Coach
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  rating?: number;
  isBookmarked?: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'resource' | 'action' | 'tip';
  priority: 'high' | 'medium' | 'low';
  category: string;
  isRead: boolean;
  createdAt: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface AICoachMetrics {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  totalRecommendations: number;
  unreadRecommendations: number;
  averageRating: number;
  totalBookmarks: number;
  responseTime: number;
}

const AICoachUltraModernV3: React.FC = () => {
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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour la sélection
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | null>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: string} | null>(null);
  
  // États pour les formulaires
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: ''
  });
  
  // États pour les filtres et vues
  const [activeTab, setActiveTab] = useState<'sessions' | 'recommendations' | 'chat'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des données AI Coach...');
      
      // Charger les sessions, recommandations et utilisateurs depuis Supabase
      const [sessionsData, recommendationsData, usersData] = await Promise.all([
        aiCoachService.getAllSessions(),
        aiCoachService.getAllRecommendations(),
        userService.getAll()
      ]);
      
      setSessions(sessionsData);
      setRecommendations(recommendationsData);
      setUsers(usersData);
      
      console.log(`✅ ${sessionsData.length} sessions, ${recommendationsData.length} recommandations et ${usersData.length} utilisateurs chargés depuis Supabase`);
    } catch (error) {
      console.error('❌ Erreur chargement AI Coach:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // ===== CRUD OPERATIONS =====

  const handleCreateSession = async (sessionData: Omit<ChatSession, 'id'>) => {
    try {
      setLoading(true);
      const createdSession = await aiCoachService.createSession(sessionData);
      if (createdSession) {
        setSessions(prev => [createdSession, ...prev]);
        console.log('✅ Session créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création session:', error);
      setError('Erreur lors de la création de la session');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (id: string, sessionData: Partial<ChatSession>) => {
    try {
      setLoading(true);
      const updatedSession = await aiCoachService.updateSession(id, sessionData);
      if (updatedSession) {
        setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));
        console.log('✅ Session mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour session:', error);
      setError('Erreur lors de la mise à jour de la session');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      setLoading(true);
      const success = await aiCoachService.deleteSession(id);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== id));
        console.log('✅ Session supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression session:', error);
      setError('Erreur lors de la suppression de la session');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecommendation = async (recommendationData: Omit<Recommendation, 'id'>) => {
    try {
      setLoading(true);
      const createdRecommendation = await aiCoachService.createRecommendation(recommendationData);
      if (createdRecommendation) {
        setRecommendations(prev => [createdRecommendation, ...prev]);
        console.log('✅ Recommandation créée avec succès');
        await loadData(); // Recharger pour cohérence
      }
    } catch (error) {
      console.error('❌ Erreur création recommandation:', error);
      setError('Erreur lors de la création de la recommandation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecommendation = async (id: string, recommendationData: Partial<Recommendation>) => {
    try {
      setLoading(true);
      const updatedRecommendation = await aiCoachService.updateRecommendation(id, recommendationData);
      if (updatedRecommendation) {
        setRecommendations(prev => prev.map(r => r.id === id ? updatedRecommendation : r));
        console.log('✅ Recommandation mise à jour avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour recommandation:', error);
      setError('Erreur lors de la mise à jour de la recommandation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      setLoading(true);
      const success = await aiCoachService.deleteRecommendation(id);
      if (success) {
        setRecommendations(prev => prev.filter(r => r.id !== id));
        console.log('✅ Recommandation supprimée avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression recommandation:', error);
      setError('Erreur lors de la suppression de la recommandation');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les métriques
  const metrics: AICoachMetrics = useMemo(() => {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.isActive).length;
    const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
    const totalRecommendations = recommendations.length;
    const unreadRecommendations = recommendations.filter(r => !r.isRead).length;
    const averageRating = sessions.length > 0 
      ? sessions.reduce((sum, session) => {
          const ratings = session.messages.filter(m => m.rating).map(m => m.rating!);
          return sum + (ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);
        }, 0) / sessions.length
      : 0;
    const totalBookmarks = sessions.reduce((sum, session) => 
      sum + session.messages.filter(m => m.isBookmarked).length, 0);
    
    return {
      totalSessions,
      activeSessions,
      totalMessages,
      totalRecommendations,
      unreadRecommendations,
      averageRating: Math.round(averageRating * 10) / 10,
      totalBookmarks,
      responseTime: 1.2 // Mock data
    };
  }, [sessions, recommendations]);

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvelle Session',
      icon: ChatBubbleLeftRightIcon,
      onClick: () => {
        setEditingSession(null);
        setShowSessionModal(true);
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Nouvelle Recommandation',
      icon: LightBulbIcon,
      onClick: () => {
        setEditingRecommendation(null);
        setShowRecommendationModal(true);
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Voir Analytics',
      icon: ChartBarIcon,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }));
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'Paramètres AI',
      icon: Cog6ToothIcon,
      onClick: () => {
        // TODO: Implémenter les paramètres AI
        console.log('Paramètres AI');
      },
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
          <p className="mt-1 text-sm text-gray-500">
            Votre assistant IA personnel pour le développement professionnel
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowSessionModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle Session
          </button>
          <button
            onClick={() => setShowRecommendationModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle Recommandation
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

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-200" />
            <div className="ml-4">
              <p className="text-blue-100 text-sm font-medium">Sessions</p>
              <p className="text-2xl font-bold">{metrics.totalSessions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <LightBulbIcon className="h-8 w-8 text-green-200" />
            <div className="ml-4">
              <p className="text-green-100 text-sm font-medium">Recommandations</p>
              <p className="text-2xl font-bold">{metrics.totalRecommendations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-purple-200" />
            <div className="ml-4">
              <p className="text-purple-100 text-sm font-medium">Note Moyenne</p>
              <p className="text-2xl font-bold">{metrics.averageRating}/5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <BookmarkIcon className="h-8 w-8 text-orange-200" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Favoris</p>
              <p className="text-2xl font-bold">{metrics.totalBookmarks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200`}
            >
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sessions ({metrics.totalSessions})
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recommandations ({metrics.totalRecommendations})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chat IA
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Filtres */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              
              {activeTab === 'recommendations' && (
                <>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="course">Cours</option>
                    <option value="resource">Ressource</option>
                    <option value="action">Action</option>
                    <option value="tip">Conseil</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Toutes les priorités</option>
                    <option value="high">Élevée</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Faible</option>
                  </select>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue grille"
                  >
                    <SparklesIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue liste"
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages de feedback */}
          <FeedbackDisplay
            success={submitSuccess}
            error={submitError}
            warning={null}
            info={null}
          />

          {/* Contenu principal */}
          {activeTab === 'sessions' ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sessions de Chat</h3>
              <p className="mt-1 text-sm text-gray-500">
                {sessions.length === 0 
                  ? "Aucune session trouvée."
                  : `${sessions.length} session(s) trouvée(s).`
                }
              </p>
            </div>
          ) : activeTab === 'recommendations' ? (
            <div className="text-center py-12">
              <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Recommandations IA</h3>
              <p className="mt-1 text-sm text-gray-500">
                {recommendations.length === 0 
                  ? "Aucune recommandation trouvée."
                  : `${recommendations.length} recommandation(s) trouvée(s).`
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chat IA</h3>
              <p className="mt-1 text-sm text-gray-500">
                Interface de chat avec l'IA à implémenter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSession ? 'Modifier la session' : 'Nouvelle session'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de session à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSessionModal(false);
                  setEditingSession(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowSessionModal(false);
                  setEditingSession(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecommendationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingRecommendation ? 'Modifier la recommandation' : 'Nouvelle recommandation'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Formulaire de recommandation à implémenter
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRecommendationModal(false);
                  setEditingRecommendation(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowRecommendationModal(false);
                  setEditingRecommendation(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingItem && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          onConfirm={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
          title="Supprimer l'élément"
          message={`Êtes-vous sûr de vouloir supprimer ce ${deletingItem.type} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}

      {/* Modale de création de session */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nouvelle session de coaching
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la session
                </label>
                <input
                  type="text"
                  value={sessionFormData.title}
                  onChange={(e) => setSessionFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Session de développement leadership"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={sessionFormData.description}
                  onChange={(e) => setSessionFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Décrivez l'objectif de cette session..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSessionModal(false);
                  setSessionFormData({ title: '', description: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (!sessionFormData.title.trim()) {
                    setError('Le titre de la session est requis');
                    return;
                  }
                  
                  try {
                    setSubmitting(true);
                    const newSession = await aiCoachService.createSession({
                      title: sessionFormData.title,
                      description: sessionFormData.description,
                      messages: [],
                      isActive: true
                    });
                    
                    if (newSession) {
                      setSessions(prev => [newSession, ...prev]);
                      setSessionFormData({ title: '', description: '' });
                      setShowSessionModal(false);
                      setSuccess('Session créée avec succès');
                    }
                  } catch (error) {
                    console.error('❌ Erreur création session:', error);
                    setError('Erreur lors de la création de la session');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Création...' : 'Créer la session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de création de recommandation */}
      {showRecommendationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nouvelle recommandation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la recommandation
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Améliorer vos compétences en leadership"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Décrivez la recommandation..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="course">Cours</option>
                  <option value="resource">Ressource</option>
                  <option value="action">Action</option>
                  <option value="tip">Conseil</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRecommendationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // TODO: Implémenter la création de recommandation
                  setShowRecommendationModal(false);
                  console.log('Recommandation créée');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Créer la recommandation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoachUltraModernV3;
