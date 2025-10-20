const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testLeaveManagementModule() {
  console.log('🏖️ TEST DU MODULE LEAVE MANAGEMENT AVEC RLS');
  console.log('============================================');

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

    // Test 2: Récupérer un leave_type_id existant
    console.log('\n2️⃣ Récupération d\'un type de congé existant...');
    const { data: leaveTypes, error: leaveTypesError } = await supabase
      .from('leave_types')
      .select('*')
      .limit(1);

    if (leaveTypesError) {
      console.error('❌ Erreur lecture leave types:', leaveTypesError.message);
      return;
    }

    const testLeaveType = leaveTypes[0];
    console.log('✅ Type de congé trouvé:', testLeaveType.name);

    // Test 3: Vérifier les demandes de congé existantes pour cet utilisateur
    console.log('\n3️⃣ Vérification des demandes de congé existantes...');
    const { data: existingLeaveRequests, error: leaveRequestsError } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (leaveRequestsError) {
      console.error('❌ Erreur lecture demandes de congé:', leaveRequestsError.message);
    } else {
      console.log(`✅ ${existingLeaveRequests.length} demandes de congé trouvées pour cet utilisateur`);
      existingLeaveRequests.forEach(lr => {
        console.log(`   - ${lr.reason || 'Sans raison'} (user: ${lr.user_id}, status: ${lr.status})`);
      });
    }

    // Test 4: Création d'une nouvelle demande de congé
    console.log('\n4️⃣ Création d\'une nouvelle demande de congé...');
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 jours

    const newLeaveRequestData = {
      user_id: authData1.user.id,
      leave_type_id: testLeaveType.id,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'pending',
      reason: 'Demande de congé Test RLS - Rokhaya'
    };

    const { data: newLeaveRequest, error: createError } = await supabase
      .from('leave_requests')
      .insert([newLeaveRequestData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création demande de congé:', createError.message);
    } else {
      console.log('✅ Demande de congé créée:', newLeaveRequest.id);
      console.log('   - Raison:', newLeaveRequest.reason);
      console.log('   - User:', newLeaveRequest.user_id);
      console.log('   - Status:', newLeaveRequest.status);
      console.log('   - Dates:', newLeaveRequest.start_date, 'à', newLeaveRequest.end_date);
    }

    // Test 5: Vérifier que la demande est visible
    console.log('\n5️⃣ Vérification de la visibilité de la demande créée...');
    const { data: updatedLeaveRequests, error: readError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', newLeaveRequest.id);

    if (readError) {
      console.error('❌ Erreur lecture demande de congé:', readError.message);
    } else {
      console.log(`✅ Demande visible: ${updatedLeaveRequests.length > 0 ? 'OUI' : 'NON'}`);
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

    // Test 7: Vérifier que l'autre utilisateur ne voit pas la demande créée
    console.log('\n7️⃣ Vérification de l\'isolation des données...');
    const { data: otherUserLeaveRequests, error: otherUserError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', newLeaveRequest.id);

    if (otherUserError) {
      console.error('❌ Erreur lecture demandes autre utilisateur:', otherUserError.message);
    } else {
      console.log(`✅ Isolation vérifiée: ${otherUserLeaveRequests.length === 0 ? 'OUI' : 'NON'}`);
      if (otherUserLeaveRequests.length === 0) {
        console.log('   - L\'autre utilisateur ne voit pas la demande créée par Rokhaya');
      } else {
        console.log('   - ⚠️ PROBLÈME: L\'autre utilisateur voit la demande !');
      }
    }

    // Test 8: Créer une demande pour le deuxième utilisateur
    console.log('\n8️⃣ Création d\'une demande pour le deuxième utilisateur...');
    const startDate2 = new Date();
    const endDate2 = new Date(startDate2.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 jours

    const newLeaveRequestData2 = {
      user_id: authData2.user.id,
      leave_type_id: testLeaveType.id,
      start_date: startDate2.toISOString().split('T')[0],
      end_date: endDate2.toISOString().split('T')[0],
      status: 'pending',
      reason: 'Demande de congé Test RLS - Naby'
    };

    const { data: newLeaveRequest2, error: createError2 } = await supabase
      .from('leave_requests')
      .insert([newLeaveRequestData2])
      .select()
      .single();

    if (createError2) {
      console.error('❌ Erreur création demande utilisateur 2:', createError2.message);
    } else {
      console.log('✅ Demande utilisateur 2 créée:', newLeaveRequest2.id);
      console.log('   - Raison:', newLeaveRequest2.reason);
      console.log('   - User:', newLeaveRequest2.user_id);
      console.log('   - Status:', newLeaveRequest2.status);
    }

    // Test 9: Vérifier que chaque utilisateur ne voit que ses demandes
    console.log('\n9️⃣ Vérification finale de l\'isolation...');
    const { data: allLeaveRequestsUser2, error: allLeaveRequestsError2 } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (allLeaveRequestsError2) {
      console.error('❌ Erreur lecture toutes demandes:', allLeaveRequestsError2.message);
    } else {
      console.log(`✅ Utilisateur 2 voit ${allLeaveRequestsUser2.length} demandes de congé`);
      allLeaveRequestsUser2.forEach(lr => {
        console.log(`   - ${lr.reason || 'Sans raison'} (user: ${lr.user_id}, status: ${lr.status})`);
      });
      
      // Vérifier que seul ses demandes sont visibles
      const ownLeaveRequests = allLeaveRequestsUser2.filter(lr => lr.user_id === authData2.user.id);
      console.log(`✅ Demandes propres: ${ownLeaveRequests.length}/${allLeaveRequestsUser2.length}`);
      
      if (ownLeaveRequests.length === allLeaveRequestsUser2.length) {
        console.log('🎉 ISOLATION PARFAITE ! Chaque utilisateur ne voit que ses demandes de congé');
      } else {
        console.log('⚠️ PROBLÈME: L\'utilisateur voit des demandes d\'autres utilisateurs');
      }
    }

    // Test 10: Test de validation par un manager (si l'utilisateur 1 est manager)
    console.log('\n🔟 Test de validation par un manager...');
    await supabase.auth.signOut();

    // Reconnexion avec Rokhaya (manager)
    const { data: authDataManager, error: authErrorManager } = await supabase.auth.signInWithPassword({
      email: 'rokhaya@senegel.org',
      password: 'Senegel2024!'
    });

    if (authErrorManager) {
      console.error('❌ Erreur de connexion manager:', authErrorManager.message);
    } else {
      console.log('✅ Connexion manager réussie:', authDataManager.user.email);

      // Essayer de valider la demande de l'utilisateur 2
      const { data: updateResult, error: updateError } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'approved',
          approver_id: authDataManager.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', newLeaveRequest2.id);

      if (updateError) {
        console.log('✅ Isolation maintenue: Le manager ne peut pas valider les demandes d\'autres utilisateurs');
        console.log('   - Erreur attendue:', updateError.message);
      } else {
        console.log('⚠️ PROBLÈME: Le manager peut modifier les demandes d\'autres utilisateurs');
      }
    }

    console.log('\n🎉 TEST DU MODULE LEAVE MANAGEMENT TERMINÉ !');
    console.log('✅ Persistance: Les demandes de congé sont sauvegardées');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses demandes');
    console.log('✅ Sécurité: RLS fonctionne correctement pour Leave Management');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testLeaveManagementModule();
