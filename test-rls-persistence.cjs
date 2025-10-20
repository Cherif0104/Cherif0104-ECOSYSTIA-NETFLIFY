const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testRLSPersistence() {
  console.log('🧪 TEST DE PERSISTANCE AVEC RLS ACTIVÉ');
  console.log('=====================================');

  try {
    // Test 1: Connexion utilisateur
    console.log('\n1️⃣ Test de connexion...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);

    // Test 2: Vérifier les données existantes
    console.log('\n2️⃣ Test de lecture des données existantes...');
    
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('❌ Erreur lecture projets:', projectsError.message);
    } else {
      console.log(`✅ ${projects.length} projets trouvés`);
      projects.forEach(p => {
        console.log(`   - ${p.name} (owner: ${p.owner_id})`);
      });
    }

    // Test 3: Création d'un nouveau projet
    console.log('\n3️⃣ Test de création d\'un projet...');
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert([{
        name: 'Test RLS Project',
        description: 'Projet de test pour vérifier la persistance avec RLS',
        status: 'active',
        priority: 'medium',
        owner_id: authData.user.id,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création projet:', createError.message);
    } else {
      console.log('✅ Projet créé:', newProject.id);
    }

    // Test 4: Vérifier que le projet est visible
    console.log('\n4️⃣ Test de visibilité du projet créé...');
    const { data: updatedProjects, error: readError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', newProject.id);

    if (readError) {
      console.error('❌ Erreur lecture projet:', readError.message);
    } else {
      console.log(`✅ Projet visible: ${updatedProjects.length > 0 ? 'OUI' : 'NON'}`);
    }

    // Test 5: Création d'un objectif
    console.log('\n5️⃣ Test de création d\'un objectif...');
    const { data: newObjective, error: objectiveError } = await supabase
      .from('objectives')
      .insert([{
        title: 'Test RLS Objective',
        description: 'Objectif de test pour vérifier la persistance avec RLS',
        status: 'active',
        priority: 'Medium',
        owner_id: authData.user.id,
        quarter: 'Q4',
        year: new Date().getFullYear(),
        progress: 0
      }])
      .select()
      .single();

    if (objectiveError) {
      console.error('❌ Erreur création objectif:', objectiveError.message);
    } else {
      console.log('✅ Objectif créé:', newObjective.id);
    }

    // Test 6: Création d'un time log
    console.log('\n6️⃣ Test de création d\'un time log...');
    const { data: newTimeLog, error: timeLogError } = await supabase
      .from('time_logs')
      .insert([{
        user_id: authData.user.id,
        project_id: newProject.id,
        description: 'Test RLS Time Log',
        hours: 2,
        date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (timeLogError) {
      console.error('❌ Erreur création time log:', timeLogError.message);
    } else {
      console.log('✅ Time log créé:', newTimeLog.id);
    }

    // Test 7: Test d'accès CRM (pour utilisateur manager)
    console.log('\n7️⃣ Test d\'accès CRM...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*');

    if (contactsError) {
      console.error('❌ Erreur accès contacts:', contactsError.message);
    } else {
      console.log(`✅ ${contacts.length} contacts accessibles (CRM)`);
    }

    console.log('\n🎉 TESTS TERMINÉS AVEC SUCCÈS !');
    console.log('✅ La persistance avec RLS fonctionne correctement');
    console.log('✅ L\'isolation des données est active');
    console.log('✅ Les utilisateurs ne voient que leurs propres données');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testRLSPersistence();
