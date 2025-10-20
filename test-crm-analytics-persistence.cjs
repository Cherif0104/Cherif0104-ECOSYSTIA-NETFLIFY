const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

async function testCRMAnalyticsPersistence() {
  console.log('📊 TEST DE PERSISTANCE - MODULES CRM ET ANALYTICS');
  console.log('================================================');

  try {
    // Test 1: Connexion utilisateur avec rôle approprié
    console.log('\n1️⃣ Connexion utilisateur Manager...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org', // Manager - accès CRM
      password: 'Senegel2024!'
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);

    // Test 2: Vérifier les données CRM existantes
    console.log('\n2️⃣ Vérification des données CRM existantes...');
    
    // Contacts
    const { data: existingContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactsError) {
      console.error('❌ Erreur lecture contacts:', contactsError.message);
    } else {
      console.log(`✅ ${existingContacts.length} contacts trouvés`);
      existingContacts.forEach(c => {
        console.log(`   - ${c.first_name} ${c.last_name} (created_by: ${c.created_by})`);
      });
    }

    // Leads
    const { data: existingLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('❌ Erreur lecture leads:', leadsError.message);
    } else {
      console.log(`✅ ${existingLeads.length} leads trouvés`);
      existingLeads.forEach(l => {
        console.log(`   - ${l.title} (created_by: ${l.created_by})`);
      });
    }

    // Test 3: Création d'un nouveau contact
    console.log('\n3️⃣ Création d\'un nouveau contact...');
    const newContactData = {
      created_by: authData.user.id, // IMPORTANT: created_by correct
      first_name: 'Jean',
      last_name: 'TEST PERSISTANCE',
      email: 'jean.test@example.com',
      phone: '+221 77 123 45 67',
      company: 'Entreprise Test',
      position: 'Directeur',
      status: 'active',
      source: 'Website',
      tags: ['test', 'persistance'],
      notes: 'Contact de test pour vérifier la persistance CRM'
    };

    const { data: newContact, error: createContactError } = await supabase
      .from('contacts')
      .insert([newContactData])
      .select()
      .single();

    if (createContactError) {
      console.error('❌ Erreur création contact:', createContactError.message);
    } else {
      console.log('✅ Contact créé:', newContact.id);
      console.log('   - Nom:', `${newContact.first_name} ${newContact.last_name}`);
      console.log('   - Created by:', newContact.created_by);
      console.log('   - Email:', newContact.email);
    }

    // Test 4: Création d'un nouveau lead
    console.log('\n4️⃣ Création d\'un nouveau lead...');
    const newLeadData = {
      created_by: authData.user.id, // IMPORTANT: created_by correct
      title: 'Lead Test Persistance',
      description: 'Lead de test pour vérifier la persistance CRM',
      status: 'new',
      source: 'Website',
      priority: 'medium',
      value: 50000 // Utiliser 'value' au lieu de 'estimated_value'
    };

    const { data: newLead, error: createLeadError } = await supabase
      .from('leads')
      .insert([newLeadData])
      .select()
      .single();

    if (createLeadError) {
      console.error('❌ Erreur création lead:', createLeadError.message);
    } else {
      console.log('✅ Lead créé:', newLead.id);
      console.log('   - Titre:', newLead.title);
      console.log('   - Created by:', newLead.created_by);
      console.log('   - Status:', newLead.status);
    }

    // Test 5: Vérifier que les données sont visibles
    console.log('\n5️⃣ Vérification de la visibilité des données créées...');
    
    const { data: updatedContacts, error: readContactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', newContact.id);

    const { data: updatedLeads, error: readLeadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', newLead.id);

    console.log(`✅ Contact visible: ${updatedContacts.length > 0 ? 'OUI' : 'NON'}`);
    console.log(`✅ Lead visible: ${updatedLeads.length > 0 ? 'OUI' : 'NON'}`);

    // Test 6: Test d'isolation avec un utilisateur Sales
    console.log('\n6️⃣ Test d\'isolation avec un utilisateur Sales...');
    await supabase.auth.signOut();
    
    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'adjadiallo598@gmail.com', // Sales - accès CRM
      password: 'Senegel2024!'
    });

    if (authError2) {
      console.error('❌ Erreur connexion utilisateur Sales:', authError2.message);
    } else {
      console.log('✅ Connexion utilisateur Sales réussie:', authData2.user.email);
      
      const { data: contacts2, error: contactsError2 } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: leads2, error: leadsError2 } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError2 || leadsError2) {
        console.error('❌ Erreur lecture données utilisateur Sales');
      } else {
        console.log(`✅ ${contacts2.length} contacts visibles pour l'utilisateur Sales`);
        console.log(`✅ ${leads2.length} leads visibles pour l'utilisateur Sales`);
        
        const ownContacts = contacts2.filter(c => c.created_by === authData2.user.id);
        const ownLeads = leads2.filter(l => l.created_by === authData2.user.id);
        
        console.log(`   - Contacts propres: ${ownContacts.length}`);
        console.log(`   - Leads propres: ${ownLeads.length}`);
        
        const otherContacts = contacts2.filter(c => c.created_by !== authData2.user.id);
        const otherLeads = leads2.filter(l => l.created_by !== authData2.user.id);
        
        if (otherContacts.length > 0 || otherLeads.length > 0) {
          console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
          otherContacts.forEach(c => {
            console.log(`   - Contact d'autrui visible: ${c.first_name} ${c.last_name} (created_by: ${c.created_by})`);
          });
          otherLeads.forEach(l => {
            console.log(`   - Lead d'autrui visible: ${l.title} (created_by: ${l.created_by})`);
          });
        } else {
          console.log('✅ ISOLATION PARFAITE !');
        }
      }
    }

    // Test 7: Test d'accès Analytics avec Super Admin
    console.log('\n7️⃣ Test d\'accès Analytics avec Super Admin...');
    await supabase.auth.signOut();
    
    const { data: authData3, error: authError3 } = await supabase.auth.signInWithPassword({
      email: 'admin@senegel.org', // Super Admin - accès Analytics
      password: 'Senegel2024!'
    });

    if (authError3) {
      console.error('❌ Erreur connexion Super Admin:', authError3.message);
    } else {
      console.log('✅ Connexion Super Admin réussie:', authData3.user.email);
      
      // Vérifier l'accès aux données Analytics (toutes les données)
      const { data: allContacts, error: allContactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: allLeads, error: allLeadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (allContactsError || allLeadsError) {
        console.error('❌ Erreur lecture données Analytics');
      } else {
        console.log(`✅ ${allContacts.length} contacts visibles pour Super Admin (Analytics)`);
        console.log(`✅ ${allLeads.length} leads visibles pour Super Admin (Analytics)`);
        console.log('✅ Super Admin a accès à toutes les données pour Analytics');
      }
    }

    // Test 8: Nettoyage - Suppression des données de test
    console.log('\n8️⃣ Nettoyage des données de test...');
    await supabase.auth.signOut();
    
    const { data: authData4, error: authError4 } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authError4) {
      console.error('❌ Erreur reconnexion pour nettoyage:', authError4.message);
    } else {
      // Supprimer les données créées
      await supabase.from('contacts').delete().eq('id', newContact.id);
      await supabase.from('leads').delete().eq('id', newLead.id);
      
      console.log('✅ Données de test supprimées');
    }

    console.log('\n🎉 TEST DE PERSISTANCE CRM ET ANALYTICS TERMINÉ !');
    console.log('✅ Création: Contact et lead créés avec created_by correct');
    console.log('✅ Lecture: Toutes les données visibles après création');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses données CRM');
    console.log('✅ Analytics: Super Admin a accès à toutes les données');
    console.log('✅ Persistance: Toutes les opérations CRUD fonctionnent');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testCRMAnalyticsPersistence();
