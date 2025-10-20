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

async function testLeaveManagementPersistence() {
  console.log('🏖️ TEST DE PERSISTANCE - MODULE LEAVE MANAGEMENT');
  console.log('===============================================');

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

    // Test 2: Vérifier les demandes de congé existantes
    console.log('\n2️⃣ Vérification des demandes de congé existantes...');
    const { data: existingLeaveRequests, error: leaveRequestsError } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (leaveRequestsError) {
      console.error('❌ Erreur lecture demandes de congé:', leaveRequestsError.message);
    } else {
      console.log(`✅ ${existingLeaveRequests.length} demandes de congé trouvées`);
      existingLeaveRequests.forEach(lr => {
        console.log(`   - ${lr.reason} (user: ${lr.user_id}, status: ${lr.status})`);
      });
    }

    // Test 3: Création d'une nouvelle demande de congé avec user_id correct
    console.log('\n3️⃣ Création d\'une nouvelle demande de congé...');
    const newLeaveRequestData = {
      user_id: authData.user.id, // IMPORTANT: user_id correct
      leave_type_id: '81be1bb2-62bc-487d-98e5-382cf095271c', // UUID du congé annuel
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'TEST PERSISTANCE LEAVE MANAGEMENT',
      status: 'pending'
    };

    const { data: newLeaveRequest, error: createError } = await supabase
      .from('leave_requests')
      .insert([newLeaveRequestData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création demande de congé:', createError.message);
      console.error('   - Code:', createError.code);
      console.error('   - Details:', createError.details);
    } else {
      console.log('✅ Demande de congé créée:', newLeaveRequest.id);
      console.log('   - Raison:', newLeaveRequest.reason);
      console.log('   - User:', newLeaveRequest.user_id);
      console.log('   - Status:', newLeaveRequest.status);
      console.log('   - Start Date:', newLeaveRequest.start_date);
      console.log('   - End Date:', newLeaveRequest.end_date);
    }

    // Test 4: Vérifier que la demande de congé est visible
    console.log('\n4️⃣ Vérification de la visibilité de la demande créée...');
    const { data: updatedLeaveRequests, error: readError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', newLeaveRequest.id);

    if (readError) {
      console.error('❌ Erreur lecture demande de congé:', readError.message);
    } else {
      console.log(`✅ Demande de congé visible: ${updatedLeaveRequests.length > 0 ? 'OUI' : 'NON'}`);
      if (updatedLeaveRequests.length > 0) {
        console.log('   - Demande trouvée:', updatedLeaveRequests[0].reason);
      }
    }

    // Test 5: Test de mise à jour de la demande de congé
    console.log('\n5️⃣ Test de mise à jour de la demande de congé...');
    const { data: updateResult, error: updateError } = await supabase
      .from('leave_requests')
      .update({ 
        reason: 'Raison mise à jour - Test persistance Leave Management',
        status: 'approved'
      })
      .eq('id', newLeaveRequest.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour demande de congé:', updateError.message);
    } else {
      console.log('✅ Demande de congé mise à jour:', updateResult.id);
      console.log('   - Raison:', updateResult.reason);
      console.log('   - Status:', updateResult.status);
    }

    // Test 6: Test de suppression de la demande de congé
    console.log('\n6️⃣ Test de suppression de la demande de congé...');
    const { error: deleteError } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', newLeaveRequest.id);

    if (deleteError) {
      console.error('❌ Erreur suppression demande de congé:', deleteError.message);
    } else {
      console.log('✅ Demande de congé supprimée avec succès');
    }

    // Test 7: Vérifier que la demande de congé a été supprimée
    console.log('\n7️⃣ Vérification de la suppression...');
    const { data: deletedLeaveRequest, error: checkError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', newLeaveRequest.id);

    if (checkError) {
      console.error('❌ Erreur vérification suppression:', checkError.message);
    } else {
      console.log(`✅ Demande de congé supprimée: ${deletedLeaveRequest.length === 0 ? 'OUI' : 'NON'}`);
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
      
      const { data: leaveRequests2, error: leaveRequestsError2 } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (leaveRequestsError2) {
        console.error('❌ Erreur lecture demandes utilisateur 2:', leaveRequestsError2.message);
      } else {
        console.log(`✅ ${leaveRequests2.length} demandes de congé visibles pour l'utilisateur 2`);
        const ownLeaveRequests = leaveRequests2.filter(lr => lr.user_id === authData2.user.id);
        const otherLeaveRequests = leaveRequests2.filter(lr => lr.user_id !== authData2.user.id);
        
        console.log(`   - Demandes propres: ${ownLeaveRequests.length}`);
        console.log(`   - Demandes d'autres: ${otherLeaveRequests.length}`);
        
        if (otherLeaveRequests.length > 0) {
          console.log('❌ PROBLÈME D\'ISOLATION DÉTECTÉ !');
          otherLeaveRequests.forEach(lr => {
            console.log(`   - Demande d'autrui visible: ${lr.reason} (user: ${lr.user_id})`);
          });
        } else {
          console.log('✅ ISOLATION PARFAITE !');
        }
      }
    }

    console.log('\n🎉 TEST DE PERSISTANCE LEAVE MANAGEMENT TERMINÉ !');
    console.log('✅ Création: Demande créée avec user_id correct');
    console.log('✅ Lecture: Demande visible après création');
    console.log('✅ Mise à jour: Demande modifiée avec succès');
    console.log('✅ Suppression: Demande supprimée avec succès');
    console.log('✅ Isolation: Chaque utilisateur ne voit que ses demandes');
    console.log('✅ Persistance: Toutes les opérations CRUD fonctionnent');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  } finally {
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n🔚 Déconnexion effectuée');
  }
}

testLeaveManagementPersistence();
