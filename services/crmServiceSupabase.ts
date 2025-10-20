import { supabase } from './supabaseService';
import { Contact, Lead, Interaction } from '../types';

class CRMSupabaseService {
  private contactsTableName = 'contacts';
  private leadsTableName = 'leads';
  private interactionsTableName = 'interactions';

  // ===== CONTACTS =====

  private mapContactFromSupabase(data: any): Contact {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      position: data.position,
      status: data.status || 'active',
      source: data.source || 'unknown',
      tags: data.tags || [],
      notes: data.notes || '',
      lastContactDate: data.last_contact_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapContactToSupabase(contact: Omit<Contact, 'id'>): any {
    return {
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      status: contact.status,
      source: contact.source,
      tags: contact.tags,
      notes: contact.notes,
      last_contact_date: contact.lastContactDate,
    };
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      console.log('🔄 Récupération contacts Supabase...');
      
      const { data, error } = await supabase
        .from(this.contactsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contacts = (data || []).map(item => this.mapContactFromSupabase(item));
      console.log(`✅ ${contacts.length} contacts récupérés`);
      return contacts;
    } catch (error) {
      console.error('❌ Erreur récupération contacts:', error);
      return [];
    }
  }

  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact | null> {
    try {
      console.log('🔄 Création contact Supabase:', contact.firstName, contact.lastName);
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const supabaseData = this.mapContactToSupabase(contact);
      supabaseData.created_by = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.contactsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdContact = this.mapContactFromSupabase(data);
      console.log('✅ Contact créé:', createdContact.id);
      return createdContact;
    } catch (error) {
      console.error('❌ Erreur création contact:', error);
      return null;
    }
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact | null> {
    try {
      console.log('🔄 Mise à jour contact Supabase:', id);
      
      const supabaseData = this.mapContactToSupabase(contact as Omit<Contact, 'id'>);
      const { data, error } = await supabase
        .from(this.contactsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedContact = this.mapContactFromSupabase(data);
      console.log('✅ Contact mis à jour:', updatedContact.id);
      return updatedContact;
    } catch (error) {
      console.error('❌ Erreur mise à jour contact:', error);
      return null;
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression contact Supabase:', id);
      
      const { error } = await supabase
        .from(this.contactsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Contact supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression contact:', error);
      return false;
    }
  }

  // ===== LEADS =====

  private mapLeadFromSupabase(data: any): Lead {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      position: data.position,
      status: data.status || 'new',
      source: data.source || 'unknown',
      score: data.score || 0,
      notes: data.notes || '',
      assignedTo: data.assigned_to,
      expectedValue: data.expected_value || 0,
      probability: data.probability || 0,
      expectedCloseDate: data.expected_close_date,
      lastActivityDate: data.last_activity_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapLeadToSupabase(lead: Omit<Lead, 'id'>): any {
    return {
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      status: lead.status,
      source: lead.source,
      score: lead.score,
      notes: lead.notes,
      assigned_to: lead.assignedTo,
      expected_value: lead.expectedValue,
      probability: lead.probability,
      expected_close_date: lead.expectedCloseDate,
      last_activity_date: lead.lastActivityDate,
    };
  }

  async getAllLeads(): Promise<Lead[]> {
    try {
      console.log('🔄 Récupération leads Supabase...');
      
      const { data, error } = await supabase
        .from(this.leadsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const leads = (data || []).map(item => this.mapLeadFromSupabase(item));
      console.log(`✅ ${leads.length} leads récupérés`);
      return leads;
    } catch (error) {
      console.error('❌ Erreur récupération leads:', error);
      return [];
    }
  }

  async createLead(lead: Omit<Lead, 'id'>): Promise<Lead | null> {
    try {
      console.log('🔄 Création lead Supabase:', lead.firstName, lead.lastName);
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const supabaseData = this.mapLeadToSupabase(lead);
      supabaseData.created_by = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.leadsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdLead = this.mapLeadFromSupabase(data);
      console.log('✅ Lead créé:', createdLead.id);
      return createdLead;
    } catch (error) {
      console.error('❌ Erreur création lead:', error);
      return null;
    }
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead | null> {
    try {
      console.log('🔄 Mise à jour lead Supabase:', id);
      
      const supabaseData = this.mapLeadToSupabase(lead as Omit<Lead, 'id'>);
      const { data, error } = await supabase
        .from(this.leadsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedLead = this.mapLeadFromSupabase(data);
      console.log('✅ Lead mis à jour:', updatedLead.id);
      return updatedLead;
    } catch (error) {
      console.error('❌ Erreur mise à jour lead:', error);
      return null;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression lead Supabase:', id);
      
      const { error } = await supabase
        .from(this.leadsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Lead supprimé:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression lead:', error);
      return false;
    }
  }

  // ===== INTERACTIONS =====

  private mapInteractionFromSupabase(data: any): Interaction {
    return {
      id: data.id,
      contactId: data.contact_id,
      leadId: data.lead_id,
      type: data.type,
      subject: data.subject,
      description: data.description,
      date: data.date,
      duration: data.duration || 0,
      outcome: data.outcome || '',
      nextAction: data.next_action || '',
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapInteractionToSupabase(interaction: Omit<Interaction, 'id'>): any {
    return {
      contact_id: interaction.contactId,
      lead_id: interaction.leadId,
      type: interaction.type,
      subject: interaction.subject,
      description: interaction.description,
      date: interaction.date,
      duration: interaction.duration,
      outcome: interaction.outcome,
      next_action: interaction.nextAction,
      assigned_to: interaction.assignedTo,
    };
  }

  async getAllInteractions(): Promise<Interaction[]> {
    try {
      console.log('🔄 Récupération interactions Supabase...');
      
      const { data, error } = await supabase
        .from(this.interactionsTableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const interactions = (data || []).map(item => this.mapInteractionFromSupabase(item));
      console.log(`✅ ${interactions.length} interactions récupérées`);
      return interactions;
    } catch (error) {
      console.error('❌ Erreur récupération interactions:', error);
      return [];
    }
  }

  async createInteraction(interaction: Omit<Interaction, 'id'>): Promise<Interaction | null> {
    try {
      console.log('🔄 Création interaction Supabase:', interaction.subject);
      
      // Récupérer l'utilisateur connecté directement
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const supabaseData = this.mapInteractionToSupabase(interaction);
      supabaseData.created_by = user.id; // Utiliser directement l'ID de l'utilisateur connecté
      
      const { data, error } = await supabase
        .from(this.interactionsTableName)
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const createdInteraction = this.mapInteractionFromSupabase(data);
      console.log('✅ Interaction créée:', createdInteraction.id);
      return createdInteraction;
    } catch (error) {
      console.error('❌ Erreur création interaction:', error);
      return null;
    }
  }

  async updateInteraction(id: string, interaction: Partial<Interaction>): Promise<Interaction | null> {
    try {
      console.log('🔄 Mise à jour interaction Supabase:', id);
      
      const supabaseData = this.mapInteractionToSupabase(interaction as Omit<Interaction, 'id'>);
      const { data, error } = await supabase
        .from(this.interactionsTableName)
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedInteraction = this.mapInteractionFromSupabase(data);
      console.log('✅ Interaction mise à jour:', updatedInteraction.id);
      return updatedInteraction;
    } catch (error) {
      console.error('❌ Erreur mise à jour interaction:', error);
      return null;
    }
  }

  async deleteInteraction(id: string): Promise<boolean> {
    try {
      console.log('🔄 Suppression interaction Supabase:', id);
      
      const { error } = await supabase
        .from(this.interactionsTableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Interaction supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression interaction:', error);
      return false;
    }
  }
}

export const crmSupabaseService = new CRMSupabaseService();
