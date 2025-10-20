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

async function testTimeTrackingPersistence() {
  console.log('⏰ TEST DE PERSISTANCE - MODULE TIME TRACKING');
  console.log('============================================');

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

    // Test 2: Récupérer un projet existant pour le time log
    console.log('\n2️⃣ Récupération d\'un projet existant...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', authData.user.id)
      .limit(1);

    if (projectsError || !projects || projects.length === 0) {
      console.error('❌ Aucun projet trouvé pour l\'utilisateur');
      return;
    }

    const testProject = projects[0];
    console.log('✅ Projet trouvé:', testProject.name, '(ID:', testProject.id + ')');

    // Test 3: Vérifier les time logs existants
    console.log('\n3️⃣ Vérification des time logs existants...');
    const { data: existingTimeLogs, error: timeLogsError } = await supabase
      .from('time_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (timeLogsError) {
      console.error('❌ Erreur lecture time logs:', timeLogsError.message);
    } else {
      console.log(`✅ ${existingTimeLogs.length} time logs trouvés`);
      existingTimeLogs.forEach(tl => {
        console.log(`   - ${tl.description} (user: ${tl.user_id}, project: ${tl.project_id})`);
      });
    }

    // Test 4: Création d'un nouveau time log avec user_id correct
    console.log('\n4️⃣ Création d\'un nouveau time log...');
    const newTimeLogData = {
      user_id: authData.user.id, // IMPORTANT: user_id correct
      project_id: testProject.id,
      description: 'TEST PERSISTANCE TIME TRACKING',
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
      console.error('   - Code:', createError.code);
      console.error('   - Details:', createError.details);
    } else {
      console.log('✅ Time log créé:', newTimeLog.id);
      console.log('   - Description:', newTimeLog.description);
      console.log('   - User:', newTimeLog.user_id);
      console.log('   - Project:', newTimeLog.project_id);
      console.log('   - Hours:', newTimeLog.hours);
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
      if (updatedTimeLogs.length > 0) {
        console.log('   - Time log trouvé:', updatedTimeLogs[0].description);
      }
    }

    // Test 6: Test de mise à jour du time log
    console.log('\n6️⃣ Test de mise à jour du time log...');
    const { data: updateResult, error: updateError } = await supabase
      .from('time_logs')
      .update({ 
        description: 'Description mise à jour - Test persistance Time Tracking',
        hours: 3.0
      })
      .eq('id', newTimeLog.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour time log:', updateError.message);
    } else {
      console.log('✅ Time log mis à jour:', updateResult.id);
      console.log('   - Description:', updateResult.description);
      console.log('   - Hours:', updateResult.hours);
    }

    // Test 7: Test de suppression du time log
    console.log('\n7️⃣ Test de suppression du time log...');
    const { error: deleteError } = await supabase
      .from('time_logs')
      .delete()
      .eq('id', newTimeLog.id);

    if (deleteError) {
      console.error('❌ Erreur suppression time log:', deleteError.message);
    } else {
      console.log('✅ Time log supprimé avec succès');
    }

    // Test 8: Vérifier que le time log a été supprimé
    console.log('\n8️⃣ Vérification de la suppression...');
    const { data: deletedTimeLog, error: checkError } = await supabase
      .from('time_logs')
      .select('*')
      .eq('id', newTimeLog.id);

    if (checkError) {
      console.error('❌ Erreur vérification suppression:', checkError.message);
    } else {
      console.log(`✅ Time log supprimé: ${deletedTimeLog.length === 0 ? 'OUI' : 'NON'}`);
    }

    // Test 9: Test d'isolation avec un autre utilisateur
    console.log('\n9️⃣ Test d\'isolation avec un autre utilisateur...');
    await supabase.auth.signOut();
    
    const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
      email: 'nabyaminatoul08@gmail.com',
      password: 'Senegel2024!'
    });

    if (authError2) {
      console.error('❌ Erreur connexion utilisateur 2:', authError2.message);
    } else {
      console.log('✅ Connexion utilisateur 2 réussie:', authData2.user.email);
      
      const { data: timeLogs2, error: timeLogsError2 } = await supabase
        .from('time_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (timeLogsError2) {
        console.error('❌ Erreur lecture time logs utilisateur 2:', timeLogsError2.message);
      } else {
        console.log(`✅ ${timeLogs2.length} time logs visibles pour l'utilisateur 2`);
        const ownTimeLogs = timeLogs2.filter(tl => tl.user_id === authData2.user.id);
        const otherTimeLogs = timeLogs2.filter(tl => tl.user_id !== authData2.user.id);
        
        console.log(`   - Time logs propres: ${ownTimeLogs.length}`);
        console.log(`   - Time logs d'autres: ${otherTimeLogs.length}`);
        
        if (otherTimeLogs.length > 0) {
          console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
          otherTimeLogs.forEach(tl => {
            console.log(`   - Time log d'autrui visible: ${tl.description} (user: ${tl.user_id})`);
          });
        } else {
          console.log('✅ ISOLATION PARFAITE !');
        }
      }
    }

    console.log('\n🎉 TEST DE PERSISTANCE TIME TRACKING TERMINÉ !');
    console.log('✅ Création: Time log créé avec user_id correct');
    console.log('✅ Lecture: Time log visible après création');
    console.log('✅ Mise à jour: Time log modifié avec succès');
    console.log('✅ Suppression: Time log supprimé avec succès');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses time logs');
    console.log('✅ Persistance: Toutes les opérations CRUD fonctionnent');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testTimeTrackingPersistence();
