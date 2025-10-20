import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import ContactFormModal from './forms/ContactFormModal';
import LeadFormModal from './forms/LeadFormModal';
import InteractionFormModal from './forms/InteractionFormModal';
import { Contact, Lead, Interaction } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { crmService } from '../services/crmService';

const CRMSalesUltraModernV2: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'contacts' | 'leads' | 'interactions'>('contacts');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);

  // Mock data
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33 1 23 45 67 89',
      company: 'TechCorp',
      position: 'Directeur Technique',
      status: 'active',
      priority: 'high',
      lastContact: '2024-01-15',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      phone: '+33 1 98 76 54 32',
      company: 'InnovateLab',
      position: 'Chef de Projet',
      status: 'prospect',
      priority: 'medium',
      lastContact: '2024-01-10',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10'
    }
  ]);

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Pierre Durand',
      email: 'pierre.durand@example.com',
      phone: '+33 1 11 22 33 44',
      company: 'StartupXYZ',
      position: 'CEO',
      status: 'new',
      priority: 'high',
      source: 'website',
      value: 50000,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12'
    }
  ]);

  const [interactions, setInteractions] = useState<Interaction[]>([
    {
      id: '1',
      contactId: '1',
      type: 'call',
      subject: 'Appel de suivi',
      description: 'Discussion sur les besoins techniques',
      date: '2024-01-15',
      duration: 30,
      outcome: 'positive',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  // Charger les données depuis le service CRM
  useEffect(() => {
    const loadData = async () => {
      try {
        const [contactsData, leadsData, interactionsData] = await Promise.all([
          crmService.getContacts(),
          crmService.getLeads(),
          crmService.getInteractions()
        ]);
        
        setContacts(contactsData);
        setLeads(leadsData);
        setInteractions(interactionsData);
      } catch (error) {
        console.error('Erreur chargement données CRM:', error);
      }
    };

    loadData();
  }, []);

  // Métriques calculées
  const metrics = useMemo(() => {
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => c.status === 'active').length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const conversionRate = totalContacts > 0 ? (activeContacts / totalContacts) * 100 : 0;
    const avgDealValue = leads.length > 0 ? totalValue / leads.length : 0;

    return {
      totalContacts,
      activeContacts,
      newLeads,
      totalValue,
      conversionRate,
      avgDealValue
    };
  }, [contacts, leads]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    let data = [];
    
    switch (activeTab) {
      case 'contacts':
        data = contacts;
        break;
      case 'leads':
        data = leads;
        break;
      case 'interactions':
        data = interactions;
        break;
    }

    return data.filter((item: any) => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activeTab, contacts, leads, interactions, searchTerm, statusFilter, priorityFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateContact = () => {
    setEditingContact(null);
    setShowContactModal(true);
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setShowLeadModal(true);
  };

  const handleCreateInteraction = () => {
    setEditingInteraction(null);
    setShowInteractionModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowLeadModal(true);
  };

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setShowInteractionModal(true);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const handleDeleteInteraction = (id: string) => {
    setInteractions(prev => prev.filter(i => i.id !== id));
  };

  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingContact) {
      setContacts(prev => prev.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...contactData, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      const newContact: Contact = {
        ...contactData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContacts(prev => [...prev, newContact]);
    }
    setShowContactModal(false);
  };

  const handleSaveLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingLead) {
      setLeads(prev => prev.map(l => 
        l.id === editingLead.id 
          ? { ...l, ...leadData, updatedAt: new Date().toISOString() }
          : l
      ));
    } else {
      const newLead: Lead = {
        ...leadData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLeads(prev => [...prev, newLead]);
    }
    setShowLeadModal(false);
  };

  const handleSaveInteraction = (interactionData: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingInteraction) {
      setInteractions(prev => prev.map(i => 
        i.id === editingInteraction.id 
          ? { ...i, ...interactionData, updatedAt: new Date().toISOString() }
          : i
      ));
    } else {
      const newInteraction: Interaction = {
        ...interactionData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setInteractions(prev => [...prev, newInteraction]);
    }
    setShowInteractionModal(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM & Sales UltraModern V2</h1>
        <p className="text-gray-600">Gestion complète des contacts, leads et interactions commerciales</p>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalContacts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">Actifs: {metrics.activeContacts}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux Leads</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.newLeads}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600 font-medium">En attente</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">Pipeline</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Conversion</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-medium">Performance</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.avgDealValue)}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-indigo-600 font-medium">Par lead</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Interactions</p>
              <p className="text-2xl font-bold text-gray-900">{interactions.length}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-cyan-600 font-medium">Ce mois</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleCreateContact}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau Contact
        </button>
        <button
          onClick={handleCreateLead}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau Lead
        </button>
        <button
          onClick={handleCreateInteraction}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle Interaction
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Exporter
        </button>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'contacts', label: 'Contacts', count: contacts.length },
              { id: 'leads', label: 'Leads', count: leads.length },
              { id: 'interactions', label: 'Interactions', count: interactions.length }
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
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filtres et recherche */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="prospect">Prospect</option>
              <option value="new">Nouveau</option>
              <option value="qualified">Qualifié</option>
              <option value="lost">Perdu</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'contacts' && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredData.map((contact: Contact) => (
                <div key={contact.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.position}</p>
                        <p className="text-sm text-gray-500">{contact.company}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {contact.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Dernier contact: {formatDate(contact.lastContact)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                      {contact.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'leads' && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredData.map((lead: Lead) => (
                <div key={lead.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <StarIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                        <p className="text-sm text-gray-600">{lead.position}</p>
                        <p className="text-sm text-gray-500">{lead.company}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Valeur: {formatCurrency(lead.value || 0)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Source: {lead.source}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredData.map((interaction: Interaction) => (
                <div key={interaction.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{interaction.subject}</h3>
                        <p className="text-sm text-gray-600">{interaction.type}</p>
                        <p className="text-sm text-gray-500">{formatDate(interaction.date)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditInteraction(interaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInteraction(interaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">{interaction.description}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Durée: {interaction.duration} min
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                      interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {interaction.outcome}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(interaction.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showContactModal && (
        <ContactFormModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          onSuccess={handleSaveContact}
          editingContact={editingContact}
        />
      )}

      {showLeadModal && (
        <LeadFormModal
          isOpen={showLeadModal}
          onClose={() => setShowLeadModal(false)}
          onSuccess={handleSaveLead}
          editingLead={editingLead}
        />
      )}

      {showInteractionModal && (
        <InteractionFormModal
          isOpen={showInteractionModal}
          onClose={() => setShowInteractionModal(false)}
          onSuccess={handleSaveInteraction}
          editingInteraction={editingInteraction}
          contacts={contacts}
        />
      )}
    </div>
  );
};

export default CRMSalesUltraModernV2;
