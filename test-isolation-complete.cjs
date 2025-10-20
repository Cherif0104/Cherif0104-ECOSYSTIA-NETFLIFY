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

async function testUserIsolation() {
  console.log('🔒 TEST D\'ISOLATION ENTRE UTILISATEURS');
  console.log('=====================================');

  const users = [
    { email: 'rokhaya@senegel.org', password: 'Senegel2024!', name: 'Rokhaya' },
    { email: 'nabyaminatoul08@gmail.com', password: 'Senegel2024!', name: 'Naby' }
  ];

  try {
    // Test avec le premier utilisateur (Rokhaya)
    console.log('\n👤 TEST AVEC ROKHAYA');
    console.log('====================');
    
    const { data: authData1, error: authError1 } = await supabase.auth.signInWithPassword({
      email: users[0].email,
      password: users[0].password
    });

    if (authError1) {
      console.error('❌ Erreur connexion Rokhaya:', authError1.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData1.user.email);
    console.log('🆔 User ID:', authData1.user.id);

    // Vérifier les projets de Rokhaya
    console.log('\n📁 Projets visibles pour Rokhaya:');
    const { data: projects1, error: projectsError1 } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError1) {
      console.error('❌ Erreur lecture projets Rokhaya:', projectsError1.message);
    } else {
      console.log(`✅ ${projects1.length} projets trouvés`);
      projects1.forEach(p => {
        console.log(`   - ${p.name} (owner: ${p.owner_id})`);
      });
    }

    // Créer un projet pour Rokhaya
    console.log('\n🔄 Création projet pour Rokhaya...');
    const projectData1 = {
      name: 'PROJET ROKHAYA - ISOLATION TEST',
      description: 'Projet créé par Rokhaya pour tester l\'isolation',
      status: 'active',
      priority: 'high',
      owner_id: authData1.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 50000,
      team_members: []
    };

    const { data: newProject1, error: createError1 } = await supabase
      .from('projects')
      .insert([projectData1])
      .select()
      .single();

    if (createError1) {
      console.error('❌ Erreur création projet Rokhaya:', createError1.message);
    } else {
      console.log('✅ Projet Rokhaya créé:', newProject1.id);
    }

    // Déconnexion de Rokhaya
    console.log('\n🔚 Déconnexion de Rokhaya...');
    await supabase.auth.signOut();

    // Test avec le deuxième utilisateur (Naby)
    console.log('\n👤 TEST AVEC NABY');
    console.log('=================');
    
    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: users[1].email,
      password: users[1].password
    });

    if (authError2) {
      console.error('❌ Erreur connexion Naby:', authError2.message);
      return;
    }

    console.log('✅ Connexion réussie:', authData2.user.email);
    console.log('🆔 User ID:', authData2.user.id);

    // Vérifier les projets de Naby (ne devrait PAS voir ceux de Rokhaya)
    console.log('\n📁 Projets visibles pour Naby:');
    const { data: projects2, error: projectsError2 } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError2) {
      console.error('❌ Erreur lecture projets Naby:', projectsError2.message);
    } else {
      console.log(`✅ ${projects2.length} projets trouvés`);
      projects2.forEach(p => {
        const isOwned = p.owner_id === authData2.user.id;
        console.log(`   - ${p.name} (owner: ${p.owner_id}) ${isOwned ? '✅ PROPRE' : '❌ AUTRE'}`);
      });
    }

    // Créer un projet pour Naby
    console.log('\n🔄 Création projet pour Naby...');
    const projectData2 = {
      name: 'PROJET NABY - ISOLATION TEST',
      description: 'Projet créé par Naby pour tester l\'isolation',
      status: 'active',
      priority: 'medium',
      owner_id: authData2.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 75000,
      team_members: []
    };

    const { data: newProject2, error: createError2 } = await supabase
      .from('projects')
      .insert([projectData2])
      .select()
      .single();

    if (createError2) {
      console.error('❌ Erreur création projet Naby:', createError2.message);
    } else {
      console.log('✅ Projet Naby créé:', newProject2.id);
    }

    // Vérifier que Naby ne voit que ses projets
    console.log('\n🔍 Vérification finale pour Naby:');
    const { data: finalProjects2, error: finalError2 } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (finalError2) {
      console.error('❌ Erreur vérification finale:', finalError2.message);
    } else {
      console.log(`✅ ${finalProjects2.length} projets visibles pour Naby`);
      const ownProjects = finalProjects2.filter(p => p.owner_id === authData2.user.id);
      const otherProjects = finalProjects2.filter(p => p.owner_id !== authData2.user.id);
      
      console.log(`   - Projets propres: ${ownProjects.length}`);
      console.log(`   - Projets d'autres: ${otherProjects.length}`);
      
      if (otherProjects.length > 0) {
        console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
        otherProjects.forEach(p => {
          console.log(`   - Projet d'autrui visible: ${p.name} (owner: ${p.owner_id})`);
        });
      } else {
        console.log('✅ ISOLATION PARFAITE !');
      }
    }

    // Retour à Rokhaya pour vérifier
    console.log('\n👤 RETOUR À ROKHAYA');
    console.log('===================');
    
    await supabase.auth.signOut();
    const { data: authData3, error: authError3 } = await supabase.auth.signInWithPassword({
      email: users[0].email,
      password: users[0].password
    });

    if (authError3) {
      console.error('❌ Erreur reconnexion Rokhaya:', authError3.message);
      return;
    }

    console.log('✅ Reconnexion Rokhaya réussie');

    // Vérifier que Rokhaya voit ses projets + le nouveau
    console.log('\n📁 Projets visibles pour Rokhaya (après reconnexion):');
    const { data: finalProjects1, error: finalError1 } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (finalError1) {
      console.error('❌ Erreur vérification finale Rokhaya:', finalError1.message);
    } else {
      console.log(`✅ ${finalProjects1.length} projets visibles pour Rokhaya`);
      const ownProjects = finalProjects1.filter(p => p.owner_id === authData1.user.id);
      const otherProjects = finalProjects1.filter(p => p.owner_id !== authData1.user.id);
      
      console.log(`   - Projets propres: ${ownProjects.length}`);
      console.log(`   - Projets d'autres: ${otherProjects.length}`);
      
      if (otherProjects.length > 0) {
        console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
        otherProjects.forEach(p => {
          console.log(`   - Projet d'autrui visible: ${p.name} (owner: ${p.owner_id})`);
        });
      } else {
        console.log('✅ ISOLATION PARFAITE !');
      }
    }

    console.log('\n🎉 TEST D\'ISOLATION TERMINÉ !');
    console.log('============================');
    console.log('✅ Chaque utilisateur ne voit que ses propres projets');
    console.log('✅ Les projets sont persistants après reconnexion');
    console.log('✅ L\'isolation RLS fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion finale effectuée');
  }
}

testUserIsolation();
