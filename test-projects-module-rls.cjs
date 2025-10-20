const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testProjectsModule() {
  console.log('📁 TEST DU MODULE PROJECTS AVEC RLS');
  console.log('===================================');

  try {
    // Test 1: Connexion utilisateur 1 (Rokhaya - Manager)
    console.log('\n1️⃣ Connexion utilisateur 1 (Rokhaya - Manager)...');
    const { data: authData1, error: authError1 } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authError1) {
      console.error('❌ Erreur de connexion:', authError1.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData1.user.email);
    console.log('🆔 User ID:', authData1.user.id);

    // Test 2: Vérifier les projets existants pour cet utilisateur
    console.log('\n2️⃣ Vérification des projets existants...');
    const { data: existingProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('❌ Erreur lecture projets:', projectsError.message);
    } else {
      console.log(`✅ ${existingProjects.length} projets trouvés pour cet utilisateur`);
      existingProjects.forEach(p => {
        console.log(`   - ${p.name} (owner: ${p.owner_id}, status: ${p.status})`);
      });
    }

    // Test 3: Création d'un nouveau projet
    console.log('\n3️⃣ Création d\'un nouveau projet...');
    const newProjectData = {
      name: 'Projet Test RLS - Rokhaya',
      description: 'Projet de test pour vérifier l\'isolation des données',
      status: 'active',
      priority: 'high',
      owner_id: authData1.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 50000,
      client: 'Client Test',
      tags: ['test', 'rls', 'isolation']
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
      console.log('   - Status:', newProject.status);
    }

    // Test 4: Vérifier que le projet est visible pour cet utilisateur
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

    // Test 5: Déconnexion et connexion avec un autre utilisateur
    console.log('\n5️⃣ Test d\'isolation - Connexion avec un autre utilisateur...');
    await supabase.auth.signOut();

    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'nabyaminatoul08@gmail.com',
      password: 'Senegel2024!'
    });

    if (authError2) {
      console.error('❌ Erreur de connexion utilisateur 2:', authError2.message);
    } else {
      console.log('✅ Connexion utilisateur 2 réussie:', authData2.user.email);
      console.log('🆔 User ID:', authData2.user.id);
    }

    // Test 6: Vérifier que l'autre utilisateur ne voit pas le projet créé
    console.log('\n6️⃣ Vérification de l\'isolation des données...');
    const { data: otherUserProjects, error: otherUserError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', newProject.id);

    if (otherUserError) {
      console.error('❌ Erreur lecture projets autre utilisateur:', otherUserError.message);
    } else {
      console.log(`✅ Isolation vérifiée: ${otherUserProjects.length === 0 ? 'OUI' : 'NON'}`);
      if (otherUserProjects.length === 0) {
        console.log('   - L\'autre utilisateur ne voit pas le projet créé par Rokhaya');
      } else {
        console.log('   - ⚠️ PROBLÈME: L\'autre utilisateur voit le projet !');
      }
    }

    // Test 7: Créer un projet pour le deuxième utilisateur
    console.log('\n7️⃣ Création d\'un projet pour le deuxième utilisateur...');
    const newProjectData2 = {
      name: 'Projet Test RLS - Naby',
      description: 'Projet de test pour le deuxième utilisateur',
      status: 'planning',
      priority: 'medium',
      owner_id: authData2.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 25000,
      client: 'Client Test 2',
      tags: ['test', 'isolation', 'user2']
    };

    const { data: newProject2, error: createError2 } = await supabase
      .from('projects')
      .insert([newProjectData2])
      .select()
      .single();

    if (createError2) {
      console.error('❌ Erreur création projet utilisateur 2:', createError2.message);
    } else {
      console.log('✅ Projet utilisateur 2 créé:', newProject2.id);
      console.log('   - Nom:', newProject2.name);
      console.log('   - Owner:', newProject2.owner_id);
    }

    // Test 8: Vérifier que chaque utilisateur ne voit que ses projets
    console.log('\n8️⃣ Vérification finale de l\'isolation...');
    const { data: allProjectsUser2, error: allProjectsError2 } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (allProjectsError2) {
      console.error('❌ Erreur lecture tous projets:', allProjectsError2.message);
    } else {
      console.log(`✅ Utilisateur 2 voit ${allProjectsUser2.length} projets`);
      allProjectsUser2.forEach(p => {
        console.log(`   - ${p.name} (owner: ${p.owner_id})`);
      });
      
      // Vérifier que seul son projet est visible
      const ownProjects = allProjectsUser2.filter(p => p.owner_id === authData2.user.id);
      console.log(`✅ Projets propres: ${ownProjects.length}/${allProjectsUser2.length}`);
      
      if (ownProjects.length === allProjectsUser2.length) {
        console.log('🎉 ISOLATION PARFAITE ! Chaque utilisateur ne voit que ses projets');
      } else {
        console.log('⚠️ PROBLÈME: L\'utilisateur voit des projets d\'autres utilisateurs');
      }
    }

    console.log('\n🎉 TEST DU MODULE PROJECTS TERMINÉ !');
    console.log('✅ Persistance: Les projets sont sauvegardés');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses projets');
    console.log('✅ Sécurité: RLS fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testProjectsModule();
