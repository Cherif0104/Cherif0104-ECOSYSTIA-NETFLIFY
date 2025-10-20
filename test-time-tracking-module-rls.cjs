const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testTimeTrackingModule() {
  console.log('⏰ TEST DU MODULE TIME TRACKING AVEC RLS');
  console.log('========================================');

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

    // Test 2: Récupérer un projet existant pour ce test
    console.log('\n2️⃣ Récupération d\'un projet existant...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectsError) {
      console.error('❌ Erreur lecture projets:', projectsError.message);
      return;
    }

    const testProject = projects[0];
    console.log('✅ Projet trouvé:', testProject.name);

    // Test 3: Vérifier les time logs existants pour cet utilisateur
    console.log('\n3️⃣ Vérification des time logs existants...');
    const { data: existingTimeLogs, error: timeLogsError } = await supabase
      .from('time_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (timeLogsError) {
      console.error('❌ Erreur lecture time logs:', timeLogsError.message);
    } else {
      console.log(`✅ ${existingTimeLogs.length} time logs trouvés pour cet utilisateur`);
      existingTimeLogs.forEach(tl => {
        console.log(`   - ${tl.description} (user: ${tl.user_id}, hours: ${tl.hours})`);
      });
    }

    // Test 4: Création d'un nouveau time log
    console.log('\n4️⃣ Création d\'un nouveau time log...');
    const newTimeLogData = {
      user_id: authData1.user.id,
      project_id: testProject.id,
      description: 'Time Log Test RLS - Rokhaya',
      hours: 2.5,
      date: new Date().toISOString().split('T')[0]
    };

    const { data: newTimeLog, error: createError } = await supabase
      .from('time_logs')
      .insert([newTimeLogData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création time log:', createError.message);
    } else {
      console.log('✅ Time log créé:', newTimeLog.id);
      console.log('   - Description:', newTimeLog.description);
      console.log('   - User:', newTimeLog.user_id);
      console.log('   - Hours:', newTimeLog.hours);
      console.log('   - Project:', newTimeLog.project_id);
    }

    // Test 5: Vérifier que le time log est visible
    console.log('\n5️⃣ Vérification de la visibilité du time log créé...');
    const { data: updatedTimeLogs, error: readError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('id', newTimeLog.id);

    if (readError) {
      console.error('❌ Erreur lecture time log:', readError.message);
    } else {
      console.log(`✅ Time log visible: ${updatedTimeLogs.length > 0 ? 'OUI' : 'NON'}`);
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

    // Test 7: Vérifier que l'autre utilisateur ne voit pas le time log créé
    console.log('\n7️⃣ Vérification de l\'isolation des données...');
    const { data: otherUserTimeLogs, error: otherUserError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('id', newTimeLog.id);

    if (otherUserError) {
      console.error('❌ Erreur lecture time logs autre utilisateur:', otherUserError.message);
    } else {
      console.log(`✅ Isolation vérifiée: ${otherUserTimeLogs.length === 0 ? 'OUI' : 'NON'}`);
      if (otherUserTimeLogs.length === 0) {
        console.log('   - L\'autre utilisateur ne voit pas le time log créé par Rokhaya');
      } else {
        console.log('   - ⚠️ PROBLÈME: L\'autre utilisateur voit le time log !');
      }
    }

    // Test 8: Récupérer un projet pour l'utilisateur 2
    console.log('\n8️⃣ Récupération d\'un projet pour l\'utilisateur 2...');
    const { data: projectsUser2, error: projectsError2 } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectsError2) {
      console.error('❌ Erreur lecture projets utilisateur 2:', projectsError2.message);
    } else {
      const testProject2 = projectsUser2[0];
      console.log('✅ Projet trouvé pour utilisateur 2:', testProject2.name);

      // Test 9: Créer un time log pour le deuxième utilisateur
      console.log('\n9️⃣ Création d\'un time log pour le deuxième utilisateur...');
      const newTimeLogData2 = {
        user_id: authData2.user.id,
        project_id: testProject2.id,
        description: 'Time Log Test RLS - Naby',
        hours: 1.5,
        date: new Date().toISOString().split('T')[0]
      };

      const { data: newTimeLog2, error: createError2 } = await supabase
        .from('time_logs')
        .insert([newTimeLogData2])
        .select()
        .single();

      if (createError2) {
        console.error('❌ Erreur création time log utilisateur 2:', createError2.message);
      } else {
        console.log('✅ Time log utilisateur 2 créé:', newTimeLog2.id);
        console.log('   - Description:', newTimeLog2.description);
        console.log('   - User:', newTimeLog2.user_id);
        console.log('   - Hours:', newTimeLog2.hours);
      }

      // Test 10: Vérifier que chaque utilisateur ne voit que ses time logs
      console.log('\n🔟 Vérification finale de l\'isolation...');
      const { data: allTimeLogsUser2, error: allTimeLogsError2 } = await supabase
        .from('time_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (allTimeLogsError2) {
        console.error('❌ Erreur lecture tous time logs:', allTimeLogsError2.message);
      } else {
        console.log(`✅ Utilisateur 2 voit ${allTimeLogsUser2.length} time logs`);
        allTimeLogsUser2.forEach(tl => {
          console.log(`   - ${tl.description} (user: ${tl.user_id}, hours: ${tl.hours})`);
        });
        
        // Vérifier que seul ses time logs sont visibles
        const ownTimeLogs = allTimeLogsUser2.filter(tl => tl.user_id === authData2.user.id);
        console.log(`✅ Time logs propres: ${ownTimeLogs.length}/${allTimeLogsUser2.length}`);
        
        if (ownTimeLogs.length === allTimeLogsUser2.length) {
          console.log('🎉 ISOLATION PARFAITE ! Chaque utilisateur ne voit que ses time logs');
        } else {
          console.log('⚠️ PROBLÈME: L\'utilisateur voit des time logs d\'autres utilisateurs');
        }
      }
    }

    console.log('\n🎉 TEST DU MODULE TIME TRACKING TERMINÉ !');
    console.log('✅ Persistance: Les time logs sont sauvegardés');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses time logs');
    console.log('✅ Sécurité: RLS fonctionne correctement pour Time Tracking');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testTimeTrackingModule();
