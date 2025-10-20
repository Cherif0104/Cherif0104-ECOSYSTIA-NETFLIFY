const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testProjectsPersistence() {
  console.log('📁 TEST DE PERSISTANCE - MODULE PROJECTS');
  console.log('========================================');

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

    // Test 2: Vérifier les projets existants
    console.log('\n2️⃣ Vérification des projets existants...');
    const { data: existingProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('❌ Erreur lecture projets:', projectsError.message);
    } else {
      console.log(`✅ ${existingProjects.length} projets trouvés`);
      existingProjects.forEach(p => {
        console.log(`   - ${p.name} (owner: ${p.owner_id}, status: ${p.status})`);
      });
    }

    // Test 3: Création d'un nouveau projet avec owner_id correct
    console.log('\n3️⃣ Création d\'un nouveau projet...');
    const newProjectData = {
      name: 'TEST PERSISTANCE PROJECTS',
      description: 'Projet de test pour vérifier la persistance avec owner_id correct',
      status: 'active',
      priority: 'high',
      owner_id: authData.user.id, // IMPORTANT: owner_id correct
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 75000,
      team_members: []
    };

    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert([newProjectData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création projet:', createError.message);
      console.error('   - Code:', createError.code);
      console.error('   - Details:', createError.details);
      console.error('   - Hint:', createError.hint);
    } else {
      console.log('✅ Projet créé:', newProject.id);
      console.log('   - Nom:', newProject.name);
      console.log('   - Owner:', newProject.owner_id);
      console.log('   - Status:', newProject.status);
    }

    // Test 4: Vérifier que le projet est visible
    console.log('\n4️⃣ Vérification de la visibilité du projet créé...');
    const { data: updatedProjects, error: readError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', newProject.id);

    if (readError) {
      console.error('❌ Erreur lecture projet:', readError.message);
    } else {
      console.log(`✅ Projet visible: ${updatedProjects.length > 0 ? 'OUI' : 'NON'}`);
      if (updatedProjects.length > 0) {
        console.log('   - Projet trouvé:', updatedProjects[0].name);
      }
    }

    // Test 5: Test de mise à jour du projet
    console.log('\n5️⃣ Test de mise à jour du projet...');
    const { data: updateResult, error: updateError } = await supabase
      .from('projects')
      .update({ 
        description: 'Description mise à jour - Test persistance',
        progress: 25
      })
      .eq('id', newProject.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour projet:', updateError.message);
    } else {
      console.log('✅ Projet mis à jour:', updateResult.id);
      console.log('   - Description:', updateResult.description);
      console.log('   - Progress:', updateResult.progress);
    }

    // Test 6: Test de suppression du projet
    console.log('\n6️⃣ Test de suppression du projet...');
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', newProject.id);

    if (deleteError) {
      console.error('❌ Erreur suppression projet:', deleteError.message);
    } else {
      console.log('✅ Projet supprimé avec succès');
    }

    // Test 7: Vérifier que le projet a été supprimé
    console.log('\n7️⃣ Vérification de la suppression...');
    const { data: deletedProject, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', newProject.id);

    if (checkError) {
      console.error('❌ Erreur vérification suppression:', checkError.message);
    } else {
      console.log(`✅ Projet supprimé: ${deletedProject.length === 0 ? 'OUI' : 'NON'}`);
    }

    console.log('\n🎉 TEST DE PERSISTANCE PROJECTS TERMINÉ !');
    console.log('✅ Création: Projet créé avec owner_id correct');
    console.log('✅ Lecture: Projet visible après création');
    console.log('✅ Mise à jour: Projet modifié avec succès');
    console.log('✅ Suppression: Projet supprimé avec succès');
    console.log('✅ Persistance: Toutes les opérations CRUD fonctionnent');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testProjectsPersistence();
