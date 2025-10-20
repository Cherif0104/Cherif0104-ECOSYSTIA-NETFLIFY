import React, { useState, useEffect, useRef } from 'react';
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
  FunnelIcon
} from '@heroicons/react/24/outline';

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


const AICoachUltraModern: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Métriques
  const metrics = [
    {
      title: 'Conversations',
      value: sessions.length,
      change: '+3',
      changeType: 'increase' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'blue'
    },
    {
      title: 'Recommandations',
      value: recommendations.length,
      change: '+5',
      changeType: 'increase' as const,
      icon: LightBulbIcon,
      color: 'green'
    },
    {
      title: 'Temps Moyen',
      value: '12 min',
      change: '-2 min',
      changeType: 'decrease' as const,
      icon: ClockIcon,
      color: 'purple'
    },
    {
      title: 'Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      changeType: 'increase' as const,
      icon: StarIcon,
      color: 'orange'
    }
  ];

  // Actions rapides
  const quickActions = [
    {
      label: 'Nouvelle Conversation',
      icon: ChatBubbleLeftRightIcon,
      onClick: () => createNewSession(),
      color: 'blue'
    },
    {
      label: 'Voir Recommandations',
      icon: LightBulbIcon,
      onClick: () => console.log('Recommandations'),
      color: 'green'
    },
    {
      label: 'Historique',
      icon: ClockIcon,
      onClick: () => console.log('Historique'),
      color: 'purple'
    },
    {
      label: 'Paramètres',
      icon: Cog6ToothIcon,
      onClick: () => setShowSettings(true),
      color: 'orange'
    }
  ];

  // Filtrage des recommandations
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || rec.type === filterType;
    return matchesSearch && matchesType;
  });

  // Créer une nouvelle session
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nouvelle Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    // Ajouter le message utilisateur
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date()
    };

    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
    setNewMessage('');
    setIsTyping(true);

    // Simuler la réponse de l'IA
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(newMessage),
        timestamp: new Date()
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date()
      };

      setCurrentSession(finalSession);
      setSessions(sessions.map(s => s.id === currentSession.id ? finalSession : s));
      setIsTyping(false);
    }, 2000);
  };

  // Générer une réponse IA (simulation)
  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "C'est une excellente question ! Laissez-moi vous expliquer...",
      "Je comprends votre préoccupation. Voici ce que je recommande :",
      "Basé sur votre contexte, je suggère cette approche :",
      "Excellente observation ! Voici mon analyse :",
      "C'est un point important. Laissez-moi vous donner quelques conseils :"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           "\n\nJe peux vous aider à approfondir ce sujet. Avez-vous des questions spécifiques ?";
  };

  // Marquer une recommandation comme lue
  const markRecommendationAsRead = (id: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, isRead: true } : rec
    ));
  };

  // Noter un message
  const rateMessage = (messageId: string, rating: number) => {
    if (!currentSession) return;
    
    const updatedMessages = currentSession.messages.map(msg =>
      msg.id === messageId ? { ...msg, rating } : msg
    );
    
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages
    };
    
    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  // Marquer un message comme favori
  const toggleBookmark = (messageId: string) => {
    if (!currentSession) return;
    
    const updatedMessages = currentSession.messages.map(msg =>
      msg.id === messageId ? { ...msg, isBookmarked: !msg.isBookmarked } : msg
    );
    
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages
    };
    
    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Focus sur l'input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSession]);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            AI Coach
          </h1>
          <p className="text-sm text-gray-600">
            Votre assistant personnel intelligent
          </p>
        </div>

        {/* Métriques */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                  metric.color === 'blue' ? 'bg-blue-100' :
                  metric.color === 'green' ? 'bg-green-100' :
                  metric.color === 'purple' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  <metric.icon className={`h-4 w-4 ${
                    metric.color === 'blue' ? 'text-blue-600' :
                    metric.color === 'green' ? 'text-green-600' :
                    metric.color === 'purple' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  {metric.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Actions Rapides
          </h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                  action.color === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                  action.color === 'green' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                  action.color === 'purple' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                  'bg-orange-50 text-orange-700 hover:bg-orange-100'
                }`}
              >
                <action.icon className="h-4 w-4 mr-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Conversations
            </h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSession(session)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.messages.length} messages • {session.updatedAt.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">
        {/* En-tête de la conversation */}
        {currentSession && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentSession.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentSession.messages.length} messages
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentSession ? (
            <div className="space-y-4">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  } rounded-lg p-4`}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === 'assistant' && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => rateMessage(message.id, star)}
                                className={`${
                                  message.rating && star <= message.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                } hover:text-yellow-400`}
                              >
                                <StarIcon className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => toggleBookmark(message.id)}
                            className={`${
                              message.isBookmarked ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400`}
                          >
                            <BookmarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">IA en train d'écrire...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Commencez une conversation
                </h3>
                <p className="text-gray-500 mb-4">
                  Posez-moi une question ou demandez des conseils
                </p>
                <button
                  onClick={createNewSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Nouvelle Conversation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zone de saisie */}
        {currentSession && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Tapez votre message..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg ${
                    isRecording ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel des recommandations */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommandations
          </h3>
          
          {/* Filtres */}
          <div className="space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="course">Cours</option>
              <option value="resource">Ressources</option>
              <option value="action">Actions</option>
              <option value="tip">Conseils</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  rec.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => markRecommendationAsRead(rec.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {rec.title}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority === 'high' ? 'Élevé' :
                     rec.priority === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {rec.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {rec.category}
                  </span>
                  <span>
                    {rec.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachUltraModern;
