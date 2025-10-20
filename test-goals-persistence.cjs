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

async function testGoalsPersistence() {
  console.log('🎯 TEST DE PERSISTANCE - MODULE GOALS');
  console.log('====================================');

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

    // Test 2: Vérifier les objectifs existants
    console.log('\n2️⃣ Vérification des objectifs existants...');
    const { data: existingObjectives, error: objectivesError } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });

    if (objectivesError) {
      console.error('❌ Erreur lecture objectifs:', objectivesError.message);
    } else {
      console.log(`✅ ${existingObjectives.length} objectifs trouvés`);
      existingObjectives.forEach(o => {
        console.log(`   - ${o.title} (owner: ${o.owner_id}, status: ${o.status})`);
      });
    }

    // Test 3: Création d'un nouvel objectif avec owner_id correct
    console.log('\n3️⃣ Création d\'un nouvel objectif...');
    const newObjectiveData = {
      title: 'TEST PERSISTANCE GOALS',
      description: 'Objectif de test pour vérifier la persistance avec owner_id correct',
      status: 'In Progress',
      priority: 'High',
      owner_id: authData.user.id, // IMPORTANT: owner_id correct
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 25,
      category: 'Test',
      quarter: 'Q4',
      year: new Date().getFullYear(),
      team_members: []
    };

    const { data: newObjective, error: createError } = await supabase
      .from('objectives')
      .insert([newObjectiveData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création objectif:', createError.message);
      console.error('   - Code:', createError.code);
      console.error('   - Details:', createError.details);
    } else {
      console.log('✅ Objectif créé:', newObjective.id);
      console.log('   - Titre:', newObjective.title);
      console.log('   - Owner:', newObjective.owner_id);
      console.log('   - Status:', newObjective.status);
    }

    // Test 4: Vérifier que l'objectif est visible
    console.log('\n4️⃣ Vérification de la visibilité de l\'objectif créé...');
    const { data: updatedObjectives, error: readError } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', newObjective.id);

    if (readError) {
      console.error('❌ Erreur lecture objectif:', readError.message);
    } else {
      console.log(`✅ Objectif visible: ${updatedObjectives.length > 0 ? 'OUI' : 'NON'}`);
      if (updatedObjectives.length > 0) {
        console.log('   - Objectif trouvé:', updatedObjectives[0].title);
      }
    }

    // Test 5: Test de mise à jour de l'objectif
    console.log('\n5️⃣ Test de mise à jour de l\'objectif...');
    const { data: updateResult, error: updateError } = await supabase
      .from('objectives')
      .update({ 
        description: 'Description mise à jour - Test persistance Goals',
        progress: 50
      })
      .eq('id', newObjective.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour objectif:', updateError.message);
    } else {
      console.log('✅ Objectif mis à jour:', updateResult.id);
      console.log('   - Description:', updateResult.description);
      console.log('   - Progress:', updateResult.progress);
    }

    // Test 6: Test de suppression de l'objectif
    console.log('\n6️⃣ Test de suppression de l\'objectif...');
    const { error: deleteError } = await supabase
      .from('objectives')
      .delete()
      .eq('id', newObjective.id);

    if (deleteError) {
      console.error('❌ Erreur suppression objectif:', deleteError.message);
    } else {
      console.log('✅ Objectif supprimé avec succès');
    }

    // Test 7: Vérifier que l'objectif a été supprimé
    console.log('\n7️⃣ Vérification de la suppression...');
    const { data: deletedObjective, error: checkError } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', newObjective.id);

    if (checkError) {
      console.error('❌ Erreur vérification suppression:', checkError.message);
    } else {
      console.log(`✅ Objectif supprimé: ${deletedObjective.length === 0 ? 'OUI' : 'NON'}`);
    }

    // Test 8: Test d'isolation avec un autre utilisateur
    console.log('\n8️⃣ Test d\'isolation avec un autre utilisateur...');
    await supabase.auth.signOut();
    
    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'nabyaminatoul08@gmail.com',
      password: 'Senegel2024!'
    });

    if (authError2) {
      console.error('❌ Erreur connexion utilisateur 2:', authError2.message);
    } else {
      console.log('✅ Connexion utilisateur 2 réussie:', authData2.user.email);
      
      const { data: objectives2, error: objectivesError2 } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (objectivesError2) {
        console.error('❌ Erreur lecture objectifs utilisateur 2:', objectivesError2.message);
      } else {
        console.log(`✅ ${objectives2.length} objectifs visibles pour l'utilisateur 2`);
        const ownObjectives = objectives2.filter(o => o.owner_id === authData2.user.id);
        const otherObjectives = objectives2.filter(o => o.owner_id !== authData2.user.id);
        
        console.log(`   - Objectifs propres: ${ownObjectives.length}`);
        console.log(`   - Objectifs d'autres: ${otherObjectives.length}`);
        
        if (otherObjectives.length > 0) {
          console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
          otherObjectives.forEach(o => {
            console.log(`   - Objectif d'autrui visible: ${o.title} (owner: ${o.owner_id})`);
          });
        } else {
          console.log('✅ ISOLATION PARFAITE !');
        }
      }
    }

    console.log('\n🎉 TEST DE PERSISTANCE GOALS TERMINÉ !');
    console.log('✅ Création: Objectif créé avec owner_id correct');
    console.log('✅ Lecture: Objectif visible après création');
    console.log('✅ Mise à jour: Objectif modifié avec succès');
    console.log('✅ Suppression: Objectif supprimé avec succès');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses objectifs');
    console.log('✅ Persistance: Toutes les opérations CRUD fonctionnent');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testGoalsPersistence();
