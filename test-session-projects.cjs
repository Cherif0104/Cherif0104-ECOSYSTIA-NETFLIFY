const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testSessionAndProjects() {
  console.log('🔍 TEST DE SESSION ET PROJETS');
  console.log('============================');

  try {
    // Test 1: Connexion utilisateur
    console.log('\n1️⃣ Connexion utilisateur...');
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

    // Test 2: Vérifier la session
    console.log('\n2️⃣ Vérification de la session...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError.message);
    } else if (user) {
      console.log('✅ Session active:', user.email);
      console.log('🆔 Session User ID:', user.id);
    } else {
      console.log('❌ Aucune session active');
    }

    // Test 3: Vérifier les projets avec RLS
    console.log('\n3️⃣ Vérification des projets avec RLS...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('❌ Erreur lecture projets:', projectsError.message);
    } else {
      console.log(`✅ ${projects.length} projets visibles avec RLS`);
      projects.forEach(p => {
        console.log(`   - ${p.name} (owner: ${p.owner_id})`);
      });
    }

    // Test 4: Vérifier tous les projets (sans RLS)
    console.log('\n4️⃣ Vérification de tous les projets (sans RLS)...');
    const { data: allProjects, error: allProjectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (allProjectsError) {
      console.error('❌ Erreur lecture tous projets:', allProjectsError.message);
    } else {
      console.log(`✅ ${allProjects.length} projets au total dans la base`);
      allProjects.forEach(p => {
        const isOwned = p.owner_id === authData.user.id;
        console.log(`   - ${p.name} (owner: ${p.owner_id}) ${isOwned ? '✅ PROPRE' : '❌ AUTRE'}`);
      });
    }

    // Test 5: Création d'un nouveau projet
    console.log('\n5️⃣ Test de création d\'un nouveau projet...');
    const newProjectData = {
      name: 'TEST SESSION FIX',
      description: 'Projet de test pour vérifier la session',
      status: 'active',
      priority: 'high',
      owner_id: authData.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 100000,
      team_members: []
    };

    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert([newProjectData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création projet:', createError.message);
    } else {
      console.log('✅ Projet créé:', newProject.id);
      console.log('   - Nom:', newProject.name);
      console.log('   - Owner:', newProject.owner_id);
    }

    // Test 6: Vérifier que le nouveau projet est visible
    console.log('\n6️⃣ Vérification de la visibilité du nouveau projet...');
    const { data: updatedProjects, error: readError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', newProject.id);

    if (readError) {
      console.error('❌ Erreur lecture nouveau projet:', readError.message);
    } else {
      console.log(`✅ Nouveau projet visible: ${updatedProjects.length > 0 ? 'OUI' : 'NON'}`);
    }

    console.log('\n🎉 TEST TERMINÉ !');
    console.log('✅ Session:', user ? 'ACTIVE' : 'INACTIVE');
    console.log('✅ Projets visibles:', projects.length);
    console.log('✅ Projets totaux:', allProjects.length);
    console.log('✅ Création:', newProject ? 'RÉUSSIE' : 'ÉCHOUÉE');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testSessionAndProjects();
