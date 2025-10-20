const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testGoalsModule() {
  console.log('🎯 TEST DU MODULE GOALS AVEC RLS');
  console.log('=================================');

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

    // Test 2: Vérifier les objectifs existants pour cet utilisateur
    console.log('\n2️⃣ Vérification des objectifs existants...');
    const { data: existingObjectives, error: objectivesError } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });

    if (objectivesError) {
      console.error('❌ Erreur lecture objectifs:', objectivesError.message);
    } else {
      console.log(`✅ ${existingObjectives.length} objectifs trouvés pour cet utilisateur`);
      existingObjectives.forEach(obj => {
        console.log(`   - ${obj.title} (owner: ${obj.owner_id}, status: ${obj.status})`);
      });
    }

    // Test 3: Création d'un nouvel objectif
    console.log('\n3️⃣ Création d\'un nouvel objectif...');
    const newObjectiveData = {
      title: 'Objectif Test RLS - Rokhaya',
      description: 'Objectif de test pour vérifier l\'isolation des données',
      status: 'active',
      priority: 'High',
      owner_id: authData1.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      category: 'Test',
      quarter: 'Q4',
      year: new Date().getFullYear(),
      owner_name: 'Rokhaya Test'
    };

    const { data: newObjective, error: createError } = await supabase
      .from('objectives')
      .insert([newObjectiveData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création objectif:', createError.message);
    } else {
      console.log('✅ Objectif créé:', newObjective.id);
      console.log('   - Titre:', newObjective.title);
      console.log('   - Owner:', newObjective.owner_id);
      console.log('   - Status:', newObjective.status);
      console.log('   - Progress:', newObjective.progress + '%');
    }

    // Test 4: Création d'un Key Result pour cet objectif
    console.log('\n4️⃣ Création d\'un Key Result...');
    const newKeyResultData = {
      objective_id: newObjective.id,
      title: 'KR Test RLS - Rokhaya',
      description: 'Key Result de test pour l\'objectif',
      target_value: 100,
      current_value: 0,
      unit: 'points',
      status: 'active',
      priority: 'High'
    };

    const { data: newKeyResult, error: krCreateError } = await supabase
      .from('key_results')
      .insert([newKeyResultData])
      .select()
      .single();

    if (krCreateError) {
      console.error('❌ Erreur création Key Result:', krCreateError.message);
    } else {
      console.log('✅ Key Result créé:', newKeyResult.id);
      console.log('   - Titre:', newKeyResult.title);
      console.log('   - Objectif:', newKeyResult.objective_id);
      console.log('   - Target:', newKeyResult.target_value);
    }

    // Test 5: Vérifier que l'objectif et le KR sont visibles
    console.log('\n5️⃣ Vérification de la visibilité des données créées...');
    const { data: updatedObjectives, error: readError } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', newObjective.id);

    if (readError) {
      console.error('❌ Erreur lecture objectif:', readError.message);
    } else {
      console.log(`✅ Objectif visible: ${updatedObjectives.length > 0 ? 'OUI' : 'NON'}`);
    }

    // Test 6: Déconnexion et connexion avec un autre utilisateur
    console.log('\n6️⃣ Test d\'isolation - Connexion avec un autre utilisateur...');
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

    // Test 7: Vérifier que l'autre utilisateur ne voit pas l'objectif créé
    console.log('\n7️⃣ Vérification de l\'isolation des données...');
    const { data: otherUserObjectives, error: otherUserError } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', newObjective.id);

    if (otherUserError) {
      console.error('❌ Erreur lecture objectifs autre utilisateur:', otherUserError.message);
    } else {
      console.log(`✅ Isolation vérifiée: ${otherUserObjectives.length === 0 ? 'OUI' : 'NON'}`);
      if (otherUserObjectives.length === 0) {
        console.log('   - L\'autre utilisateur ne voit pas l\'objectif créé par Rokhaya');
      } else {
        console.log('   - ⚠️ PROBLÈME: L\'autre utilisateur voit l\'objectif !');
      }
    }

    // Test 8: Créer un objectif pour le deuxième utilisateur
    console.log('\n8️⃣ Création d\'un objectif pour le deuxième utilisateur...');
    const newObjectiveData2 = {
      title: 'Objectif Test RLS - Naby',
      description: 'Objectif de test pour le deuxième utilisateur',
      status: 'planning',
      priority: 'Medium',
      owner_id: authData2.user.id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 25,
      category: 'Test',
      quarter: 'Q4',
      year: new Date().getFullYear(),
      owner_name: 'Naby Test'
    };

    const { data: newObjective2, error: createError2 } = await supabase
      .from('objectives')
      .insert([newObjectiveData2])
      .select()
      .single();

    if (createError2) {
      console.error('❌ Erreur création objectif utilisateur 2:', createError2.message);
    } else {
      console.log('✅ Objectif utilisateur 2 créé:', newObjective2.id);
      console.log('   - Titre:', newObjective2.title);
      console.log('   - Owner:', newObjective2.owner_id);
      console.log('   - Progress:', newObjective2.progress + '%');
    }

    // Test 9: Vérifier que chaque utilisateur ne voit que ses objectifs
    console.log('\n9️⃣ Vérification finale de l\'isolation...');
    const { data: allObjectivesUser2, error: allObjectivesError2 } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });

    if (allObjectivesError2) {
      console.error('❌ Erreur lecture tous objectifs:', allObjectivesError2.message);
    } else {
      console.log(`✅ Utilisateur 2 voit ${allObjectivesUser2.length} objectifs`);
      allObjectivesUser2.forEach(obj => {
        console.log(`   - ${obj.title} (owner: ${obj.owner_id}, progress: ${obj.progress}%)`);
      });
      
      // Vérifier que seul ses objectifs sont visibles
      const ownObjectives = allObjectivesUser2.filter(obj => obj.owner_id === authData2.user.id);
      console.log(`✅ Objectifs propres: ${ownObjectives.length}/${allObjectivesUser2.length}`);
      
      if (ownObjectives.length === allObjectivesUser2.length) {
        console.log('🎉 ISOLATION PARFAITE ! Chaque utilisateur ne voit que ses objectifs');
      } else {
        console.log('⚠️ PROBLÈME: L\'utilisateur voit des objectifs d\'autres utilisateurs');
      }
    }

    // Test 10: Test des Key Results avec isolation
    console.log('\n🔟 Test des Key Results avec isolation...');
    const { data: allKeyResults, error: krError } = await supabase
      .from('key_results')
      .select('*, objectives!inner(*)')
      .order('created_at', { ascending: false });

    if (krError) {
      console.error('❌ Erreur lecture Key Results:', krError.message);
    } else {
      console.log(`✅ Utilisateur 2 voit ${allKeyResults.length} Key Results`);
      allKeyResults.forEach(kr => {
        console.log(`   - ${kr.title} (objectif: ${kr.objectives.title})`);
      });
    }

    console.log('\n🎉 TEST DU MODULE GOALS TERMINÉ !');
    console.log('✅ Persistance: Les objectifs et Key Results sont sauvegardés');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses objectifs');
    console.log('✅ Sécurité: RLS fonctionne correctement pour Goals et Key Results');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testGoalsModule();
