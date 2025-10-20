import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContextSupabase';
import { Contact, Lead, Interaction } from '../types';
import { crmService } from '../services/crmService';
import { draftSalesEmail } from '../services/geminiService';
import ConfirmationModal from './common/ConfirmationModal';

const statusStyles = {
    'Lead': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Prospect': 'bg-purple-100 text-purple-800',
    'Customer': 'bg-green-100 text-green-800',
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'converted': 'bg-purple-100 text-purple-800',
};

const ContactFormModal: React.FC<{
    contact: Contact | null;
    onClose: () => void;
    onSave: (contact: Contact | Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ contact, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = contact !== null;
    const [formData, setFormData] = useState({
        firstName: contact?.firstName || '',
        lastName: contact?.lastName || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        company: contact?.company || '',
        position: contact?.position || '',
        status: contact?.status || 'active',
        source: contact?.source || 'unknown',
        tags: contact?.tags?.join(', ') || '',
        notes: contact?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        };
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isEditMode ? t('edit_contact') : t('add_contact')}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('first_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('last_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('phone')}
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('company')}
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('position')}
                                    </label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('status')}
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Actif</option>
                                        <option value="inactive">Inactif</option>
                                        <option value="converted">Converti</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('source')}
                                    </label>
                                    <select
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="unknown">Inconnu</option>
                                        <option value="website">Site web</option>
                                        <option value="referral">Parrainage</option>
                                        <option value="social">Réseaux sociaux</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Téléphone</option>
                                        <option value="event">Événement</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('tags')} (séparés par des virgules)
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="client, vip, prospect"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {isEditMode ? t('update') : t('add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LeadFormModal: React.FC<{
    lead: Lead | null;
    onClose: () => void;
    onSave: (lead: Lead | Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ lead, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = lead !== null;
    const [formData, setFormData] = useState({
        firstName: lead?.firstName || '',
        lastName: lead?.lastName || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        position: lead?.position || '',
        status: lead?.status || 'new',
        source: lead?.source || 'unknown',
        score: lead?.score || 0,
        notes: lead?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            score: Number(formData.score),
        };
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isEditMode ? t('edit_lead') : t('add_lead')}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('first_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('last_name')}
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('phone')}
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('company')}
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('position')}
                                    </label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('status')}
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="new">Nouveau</option>
                                        <option value="contacted">Contacté</option>
                                        <option value="qualified">Qualifié</option>
                                        <option value="proposal">Proposition</option>
                                        <option value="negotiation">Négociation</option>
                                        <option value="converted">Converti</option>
                                        <option value="lost">Perdu</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('score')}
                                    </label>
                                    <input
                                        type="number"
                                        name="score"
                                        value={formData.score}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('source')}
                                </label>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="unknown">Inconnu</option>
                                    <option value="website">Site web</option>
                                    <option value="referral">Parrainage</option>
                                    <option value="social">Réseaux sociaux</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Téléphone</option>
                                    <option value="event">Événement</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {isEditMode ? t('update') : t('add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InteractionModal: React.FC<{
    contactId: string;
    contactName: string;
    onClose: () => void;
    onSave: (interaction: Omit<Interaction, 'id' | 'contactId' | 'createdAt'>) => void;
}> = ({ contactId, contactName, onClose, onSave }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        type: 'call' as 'call' | 'email' | 'meeting' | 'note',
        description: '',
        date: new Date().toISOString().split('T')[0],
        outcome: 'positive' as 'positive' | 'neutral' | 'negative',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ajouter une interaction avec {contactName}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="call">Appel</option>
                                        <option value="email">Email</option>
                                        <option value="meeting">Réunion</option>
                                        <option value="note">Note</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Résultat
                                    </label>
                                    <select
                                        name="outcome"
                                        value={formData.outcome}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="positive">Positif</option>
                                        <option value="neutral">Neutre</option>
                                        <option value="negative">Négatif</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Décrivez l'interaction..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CRMSupabase: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    
    // États pour les données
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour l'interface
    const [activeTab, setActiveTab] = useState<'contacts' | 'leads'>('contacts');
    const [isContactFormOpen, setContactFormOpen] = useState(false);
    const [isLeadFormOpen, setLeadFormOpen] = useState(false);
    const [isInteractionModalOpen, setInteractionModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
    const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
    const [selectedContactForInteraction, setSelectedContactForInteraction] = useState<{id: string, name: string} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Charger les données
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [contactsData, leadsData] = await Promise.all([
                crmService.getContacts(),
                crmService.getLeads()
            ]);

            setContacts(contactsData);
            setLeads(leadsData);

            console.log(`✅ ${contactsData.length} contacts et ${leadsData.length} leads chargés`);
        } catch (error: any) {
            console.error('❌ Erreur chargement données CRM:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveContact = async (contactData: Contact | Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if ('id' in contactData) {
                // Mise à jour
                const updatedContact = await crmService.updateContact(contactData.id, contactData);
                if (updatedContact) {
                    setContacts(prev => prev.map(c => c.id === contactData.id ? updatedContact : c));
                    console.log('✅ Contact mis à jour');
                }
            } else {
                // Création
                const newContact = await crmService.createContact(contactData);
                if (newContact) {
                    setContacts(prev => [...prev, newContact]);
                    console.log('✅ Contact créé');
                }
            }
            
            setContactFormOpen(false);
            setEditingContact(null);
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde contact:', error);
            setError('Erreur lors de la sauvegarde du contact');
        }
    };

    const handleSaveLead = async (leadData: Lead | Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if ('id' in leadData) {
                // Mise à jour
                const updatedLead = await crmService.updateLead(leadData.id, leadData);
                if (updatedLead) {
                    setLeads(prev => prev.map(l => l.id === leadData.id ? updatedLead : l));
                    console.log('✅ Lead mis à jour');
                }
            } else {
                // Création
                const newLead = await crmService.createLead(leadData);
                if (newLead) {
                    setLeads(prev => [...prev, newLead]);
                    console.log('✅ Lead créé');
                }
            }
            
            setLeadFormOpen(false);
            setEditingLead(null);
        } catch (error: any) {
            console.error('❌ Erreur sauvegarde lead:', error);
            setError('Erreur lors de la sauvegarde du lead');
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        try {
            const success = await crmService.deleteContact(contactId);
            if (success) {
                setContacts(prev => prev.filter(c => c.id !== contactId));
                setDeletingContactId(null);
                console.log('✅ Contact supprimé');
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression contact:', error);
            setError('Erreur lors de la suppression du contact');
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        try {
            const success = await crmService.deleteLead(leadId);
            if (success) {
                setLeads(prev => prev.filter(l => l.id !== leadId));
                setDeletingLeadId(null);
                console.log('✅ Lead supprimé');
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression lead:', error);
            setError('Erreur lors de la suppression du lead');
        }
    };

    const handleConvertLead = async (leadId: string) => {
        try {
            const contact = await crmService.convertLeadToContact(leadId);
            if (contact) {
                setContacts(prev => [...prev, contact]);
                setLeads(prev => prev.filter(l => l.id !== leadId));
                console.log('✅ Lead converti en contact');
            }
        } catch (error: any) {
            console.error('❌ Erreur conversion lead:', error);
            setError('Erreur lors de la conversion du lead');
        }
    };

    const handleSaveInteraction = async (interactionData: Omit<Interaction, 'id' | 'contactId' | 'createdAt'>) => {
        try {
            if (selectedContactForInteraction) {
                const interaction = await crmService.logInteraction(selectedContactForInteraction.id, interactionData);
                if (interaction) {
                    setInteractions(prev => [...prev, interaction]);
                    console.log('✅ Interaction enregistrée');
                }
            }
        } catch (error: any) {
            console.error('❌ Erreur enregistrement interaction:', error);
            setError('Erreur lors de l\'enregistrement de l\'interaction');
        }
    };

    // Filtrage des données
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Chargement des données CRM...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">CRM</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setContactFormOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <i className="fas fa-user-plus mr-2"></i>
                        Ajouter Contact
                    </button>
                    <button
                        onClick={() => setLeadFormOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <i className="fas fa-user-friends mr-2"></i>
                        Ajouter Lead
                    </button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Rechercher contacts/leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actif</option>
                            <option value="inactive">Inactif</option>
                            <option value="converted">Converti</option>
                            <option value="new">Nouveau</option>
                            <option value="contacted">Contacté</option>
                            <option value="qualified">Qualifié</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'contacts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <i className="fas fa-users mr-2"></i>
                        Contacts ({contacts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'leads'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <i className="fas fa-user-friends mr-2"></i>
                        Leads ({leads.length})
                    </button>
                </nav>
            </div>

            {/* Contenu des tabs */}
            {activeTab === 'contacts' ? (
                <div className="space-y-4">
                    {filteredContacts.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <i className="fas fa-users text-4xl mb-4"></i>
                            <p>Aucun contact trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredContacts.map(contact => (
                                <div key={contact.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-user text-blue-600"></i>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    {contact.firstName} {contact.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-600">{contact.position}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[contact.status as keyof typeof statusStyles]}`}>
                                            {contact.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p><i className="fas fa-envelope mr-2"></i>{contact.email}</p>
                                        {contact.phone && <p><i className="fas fa-phone mr-2"></i>{contact.phone}</p>}
                                        {contact.company && <p><i className="fas fa-building mr-2"></i>{contact.company}</p>}
                                        {contact.tags && contact.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {contact.tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => setSelectedContactForInteraction({id: contact.id, name: `${contact.firstName} ${contact.lastName}`})}
                                            className="p-2 text-gray-400 hover:text-blue-600"
                                            title="Ajouter interaction"
                                        >
                                            <i className="fas fa-comment"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingContact(contact);
                                                setContactFormOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-green-600"
                                            title="Modifier"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => setDeletingContactId(contact.id)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                            title="Supprimer"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLeads.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <i className="fas fa-user-friends text-4xl mb-4"></i>
                            <p>Aucun lead trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLeads.map(lead => (
                                <div key={lead.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                <i className="fas fa-user-friends text-green-600"></i>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    {lead.firstName} {lead.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-600">{lead.position}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[lead.status as keyof typeof statusStyles]}`}>
                                                {lead.status}
                                            </span>
                                            <p className="text-sm text-gray-600 mt-1">Score: {lead.score}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p><i className="fas fa-envelope mr-2"></i>{lead.email}</p>
                                        {lead.phone && <p><i className="fas fa-phone mr-2"></i>{lead.phone}</p>}
                                        {lead.company && <p><i className="fas fa-building mr-2"></i>{lead.company}</p>}
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleConvertLead(lead.id)}
                                            className="p-2 text-gray-400 hover:text-purple-600"
                                            title="Convertir en contact"
                                        >
                                            <i className="fas fa-exchange-alt"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingLead(lead);
                                                setLeadFormOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-green-600"
                                            title="Modifier"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => setDeletingLeadId(lead.id)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                            title="Supprimer"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modales */}
            {isContactFormOpen && (
                <ContactFormModal
                    contact={editingContact}
                    onClose={() => {
                        setContactFormOpen(false);
                        setEditingContact(null);
                    }}
                    onSave={handleSaveContact}
                />
            )}

            {isLeadFormOpen && (
                <LeadFormModal
                    lead={editingLead}
                    onClose={() => {
                        setLeadFormOpen(false);
                        setEditingLead(null);
                    }}
                    onSave={handleSaveLead}
                />
            )}

            {isInteractionModalOpen && selectedContactForInteraction && (
                <InteractionModal
                    contactId={selectedContactForInteraction.id}
                    contactName={selectedContactForInteraction.name}
                    onClose={() => {
                        setInteractionModalOpen(false);
                        setSelectedContactForInteraction(null);
                    }}
                    onSave={handleSaveInteraction}
                />
            )}

            {deletingContactId && (
                <ConfirmationModal
                    isOpen={!!deletingContactId}
                    onClose={() => setDeletingContactId(null)}
                    onConfirm={() => handleDeleteContact(deletingContactId)}
                    title="Supprimer le contact"
                    message="Êtes-vous sûr de vouloir supprimer ce contact ?"
                />
            )}

            {deletingLeadId && (
                <ConfirmationModal
                    isOpen={!!deletingLeadId}
                    onClose={() => setDeletingLeadId(null)}
                    onConfirm={() => handleDeleteLead(deletingLeadId)}
                    title="Supprimer le lead"
                    message="Êtes-vous sûr de vouloir supprimer ce lead ?"
                />
            )}
        </div>
    );
};

export default CRMSupabase;
