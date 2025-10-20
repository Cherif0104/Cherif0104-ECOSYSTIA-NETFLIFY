import { databases, DATABASE_ID, ID, Query } from './appwriteService';
import { Contact, Lead, Interaction } from '../types';

class CRMService {
  private get contactsCollectionId() {
    return 'contacts';
  }

  private get crmClientsCollectionId() {
    return 'crm_clients';
  }

  // ===== CONTACTS =====

  private mapContactFromAppwrite(doc: any): Contact {
    return {
      id: doc.$id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      company: doc.company,
      position: doc.position,
      status: doc.status || 'active',
      source: doc.source || 'unknown',
      tags: doc.tags || [],
      notes: doc.notes || '',
      lastContactDate: doc.lastContactDate,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  }

  private mapContactToAppwrite(contact: Partial<Contact>): any {
    const data: any = {};
    if (contact.firstName !== undefined) data.firstName = contact.firstName;
    if (contact.lastName !== undefined) data.lastName = contact.lastName;
    if (contact.email !== undefined) data.email = contact.email;
    if (contact.phone !== undefined) data.phone = contact.phone;
    if (contact.company !== undefined) data.company = contact.company;
    if (contact.position !== undefined) data.position = contact.position;
    if (contact.status !== undefined) data.status = contact.status;
    if (contact.source !== undefined) data.source = contact.source;
    if (contact.tags !== undefined) data.tags = contact.tags;
    if (contact.notes !== undefined) data.notes = contact.notes;
    if (contact.lastContactDate !== undefined) data.lastContactDate = contact.lastContactDate;
    return data;
  }

  async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> {
    try {
      const appwriteData = this.mapContactToAppwrite(contactData);
      const response = await databases.createDocument(
        DATABASE_ID,
        this.contactsCollectionId,
        ID.unique(),
        appwriteData
      );
      console.log('✅ Contact créé dans Appwrite:', response.$id);
      return this.mapContactFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur création contact:', error);
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.contactsCollectionId
      );
      console.log(`✅ ${response.documents.length} contacts récupérés`);
      return response.documents.map(doc => this.mapContactFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération contacts:', error);
      return [];
    }
  }

  async getContactById(id: string): Promise<Contact | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        this.contactsCollectionId,
        id
      );
      console.log('✅ Contact récupéré:', id);
      return this.mapContactFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur récupération contact:', error);
      return null;
    }
  }

  async updateContact(id: string, contactData: Partial<Contact>): Promise<Contact | null> {
    try {
      const appwriteData = this.mapContactToAppwrite(contactData);
      const response = await databases.updateDocument(
        DATABASE_ID,
        this.contactsCollectionId,
        id,
        appwriteData
      );
      console.log('✅ Contact mis à jour dans Appwrite:', id);
      return this.mapContactFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur mise à jour contact:', error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        this.contactsCollectionId,
        id
      );
      console.log('✅ Contact supprimé de Appwrite:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression contact:', error);
      return false;
    }
  }

  // ===== LEADS =====

  private mapLeadFromAppwrite(doc: any): Lead {
    return {
      id: doc.$id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      phone: doc.phone,
      company: doc.company,
      position: doc.position,
      status: doc.status || 'new',
      source: doc.source || 'unknown',
      score: doc.score || 0,
      notes: doc.notes || '',
      lastContactDate: doc.lastContactDate,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  }

  private mapLeadToAppwrite(lead: Partial<Lead>): any {
    const data: any = {};
    if (lead.firstName !== undefined) data.firstName = lead.firstName;
    if (lead.lastName !== undefined) data.lastName = lead.lastName;
    if (lead.email !== undefined) data.email = lead.email;
    if (lead.phone !== undefined) data.phone = lead.phone;
    if (lead.company !== undefined) data.company = lead.company;
    if (lead.position !== undefined) data.position = lead.position;
    if (lead.status !== undefined) data.status = lead.status;
    if (lead.source !== undefined) data.source = lead.source;
    if (lead.score !== undefined) data.score = lead.score;
    if (lead.notes !== undefined) data.notes = lead.notes;
    if (lead.lastContactDate !== undefined) data.lastContactDate = lead.lastContactDate;
    return data;
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
    try {
      const appwriteData = this.mapLeadToAppwrite(leadData);
      const response = await databases.createDocument(
        DATABASE_ID,
        this.crmClientsCollectionId,
        ID.unique(),
        appwriteData
      );
      console.log('✅ Lead créé dans Appwrite:', response.$id);
      return this.mapLeadFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur création lead:', error);
      throw error;
    }
  }

  async getLeads(): Promise<Lead[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.crmClientsCollectionId
      );
      console.log(`✅ ${response.documents.length} leads récupérés`);
      return response.documents.map(doc => this.mapLeadFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération leads:', error);
      return [];
    }
  }

  // ===== INTERACTIONS =====

  private mapInteractionFromAppwrite(doc: any): Interaction {
    return {
      id: doc.$id,
      contactId: doc.contactId,
      type: doc.type,
      subject: doc.subject,
      description: doc.description,
      date: doc.date,
      duration: doc.duration || 0,
      outcome: doc.outcome || 'pending',
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  }

  async getInteractions(): Promise<Interaction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'interactions',
        [Query.orderDesc('$createdAt')]
      );
      
      return response.documents.map(doc => this.mapInteractionFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération interactions:', error);
      return [];
    }
  }

  async createInteraction(interactionData: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interaction | null> {
    try {
      const data = {
        contactId: interactionData.contactId,
        type: interactionData.type,
        subject: interactionData.subject,
        description: interactionData.description,
        date: interactionData.date,
        duration: interactionData.duration || 0,
        outcome: interactionData.outcome || 'pending',
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        'interactions',
        ID.unique(),
        data
      );

      return this.mapInteractionFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur création interaction:', error);
      return null;
    }
  }

  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        this.crmClientsCollectionId,
        id
      );
      console.log('✅ Lead récupéré:', id);
      return this.mapLeadFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur récupération lead:', error);
      return null;
    }
  }

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead | null> {
    try {
      const appwriteData = this.mapLeadToAppwrite(leadData);
      const response = await databases.updateDocument(
        DATABASE_ID,
        this.crmClientsCollectionId,
        id,
        appwriteData
      );
      console.log('✅ Lead mis à jour dans Appwrite:', id);
      return this.mapLeadFromAppwrite(response);
    } catch (error) {
      console.error('❌ Erreur mise à jour lead:', error);
      throw error;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        this.crmClientsCollectionId,
        id
      );
      console.log('✅ Lead supprimé de Appwrite:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression lead:', error);
      return false;
    }
  }

  // ===== LEAD CONVERSION =====

  async convertLeadToContact(leadId: string): Promise<Contact | null> {
    try {
      const lead = await this.getLeadById(leadId);
      if (!lead) {
        throw new Error('Lead non trouvé');
      }

      const contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        position: lead.position,
        status: 'active',
        source: lead.source,
        tags: ['converted'],
        notes: `Converti depuis lead: ${lead.notes}`,
        lastContactDate: new Date().toISOString().split('T')[0],
      };

      const contact = await this.createContact(contactData);
      
      if (contact) {
        // Marquer le lead comme converti
        await this.updateLead(leadId, { status: 'converted' });
        console.log('✅ Lead converti en contact:', leadId);
      }

      return contact;
    } catch (error) {
      console.error('❌ Erreur conversion lead:', error);
      throw error;
    }
  }

  // ===== INTERACTIONS =====

  async logInteraction(contactId: string, interaction: Omit<Interaction, 'id' | 'contactId' | 'createdAt'>): Promise<Interaction | null> {
    try {
      const interactionData = {
        ...interaction,
        contactId,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        this.contactsCollectionId, // Utiliser la même collection pour les interactions
        ID.unique(),
        {
          type: 'interaction',
          contactId,
          ...interactionData,
        }
      );

      console.log('✅ Interaction enregistrée:', response.$id);
      return {
        id: response.$id,
        contactId,
        type: interaction.type,
        description: interaction.description,
        date: interaction.date,
        outcome: interaction.outcome,
        createdAt: interactionData.createdAt,
      };
    } catch (error) {
      console.error('❌ Erreur enregistrement interaction:', error);
      throw error;
    }
  }

  async getContactHistory(contactId: string): Promise<Interaction[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.contactsCollectionId,
        [Query.equal('contactId', contactId), Query.equal('type', 'interaction')]
      );
      
      console.log(`✅ ${response.documents.length} interactions récupérées pour contact ${contactId}`);
      return response.documents.map(doc => ({
        id: doc.$id,
        contactId: doc.contactId,
        type: doc.type,
        description: doc.description,
        date: doc.date,
        outcome: doc.outcome,
        createdAt: doc.$createdAt,
      }));
    } catch (error) {
      console.error('❌ Erreur récupération historique contact:', error);
      return [];
    }
  }

  // ===== SEARCH AND FILTER =====

  async searchContacts(query: string): Promise<Contact[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.contactsCollectionId,
        [
          Query.or([
            Query.contains('firstName', query),
            Query.contains('lastName', query),
            Query.contains('email', query),
            Query.contains('company', query),
          ])
        ]
      );
      
      console.log(`✅ ${response.documents.length} contacts trouvés pour "${query}"`);
      return response.documents.map(doc => this.mapContactFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur recherche contacts:', error);
      return [];
    }
  }

  async getContactsByStatus(status: string): Promise<Contact[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.contactsCollectionId,
        [Query.equal('status', status)]
      );
      
      console.log(`✅ ${response.documents.length} contacts avec statut "${status}"`);
      return response.documents.map(doc => this.mapContactFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération contacts par statut:', error);
      return [];
    }
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        this.crmClientsCollectionId,
        [Query.equal('status', status)]
      );
      
      console.log(`✅ ${response.documents.length} leads avec statut "${status}"`);
      return response.documents.map(doc => this.mapLeadFromAppwrite(doc));
    } catch (error) {
      console.error('❌ Erreur récupération leads par statut:', error);
      return [];
    }
  }

  // ===== ANALYTICS =====

  async getCRMAnalytics(): Promise<any> {
    try {
      const [contacts, leads] = await Promise.all([
        this.getContacts(),
        this.getLeads()
      ]);

      const contactsByStatus = contacts.reduce((acc, contact) => {
        acc[contact.status] = (acc[contact.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const leadsByStatus = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const contactsBySource = contacts.reduce((acc, contact) => {
        acc[contact.source] = (acc[contact.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const leadsBySource = leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalContacts: contacts.length,
        totalLeads: leads.length,
        contactsByStatus,
        leadsByStatus,
        contactsBySource,
        leadsBySource,
        conversionRate: leads.filter(lead => lead.status === 'converted').length / leads.length * 100,
      };
    } catch (error) {
      console.error('❌ Erreur calcul analytics CRM:', error);
      throw error;
    }
  }
}

export const crmService = new CRMService();