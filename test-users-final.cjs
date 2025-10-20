const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testUserAccess(email, password, expectedRole) {
  try {
    console.log(`\n🔄 Test: ${email}`);
    
    // Connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error(`❌ Connexion échouée: ${authError.message}`);
      return false;
    }

    // Récupération des données utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error(`❌ Récupération données échouée: ${userError.message}`);
      return false;
    }

    // Vérification du rôle
    const roleMatch = userData.role === expectedRole;
    console.log(`✅ Connexion réussie`);
    console.log(`📊 Rôle: ${userData.role} ${roleMatch ? '✅' : '❌'} (attendu: ${expectedRole})`);
    console.log(`👤 Nom: ${userData.first_name} ${userData.last_name}`);

    // Test d'accès aux modules
    const hasCrmAccess = ['manager', 'sales', 'super_administrator'].includes(userData.role);
    const hasAnalyticsAccess = ['super_administrator', 'analyst'].includes(userData.role);
    
    console.log(`🔐 Accès CRM: ${hasCrmAccess ? '✅' : '❌'}`);
    console.log(`📊 Accès Analytics: ${hasAnalyticsAccess ? '✅' : '❌'}`);

    // Déconnexion
    await supabase.auth.signOut();
    
    return roleMatch;
  } catch (error) {
    console.error(`❌ Erreur inattendue: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 TEST COMPLET DES UTILISATEURS CORRIGÉS');
  console.log('==========================================');
  
  const testUsers = [
    { email: 'rokhaya@senegel.org', password: 'Senegel2024!', role: 'manager' },
    { email: 'nabyaminatoul08@gmail.com', password: 'Senegel2024!', role: 'analyst' },
    { email: 'adjadiallo598@gmail.com', password: 'Senegel2024!', role: 'sales' },
    { email: 'gningue04@gmail.com', password: 'Senegel2024!', role: 'sales' }
  ];

  let successCount = 0;
  
  for (const user of testUsers) {
    const success = await testUserAccess(user.email, user.password, user.role);
    if (success) successCount++;
  }

  console.log('\n📊 RÉSULTATS FINAUX');
  console.log('==================');
  console.log(`✅ Tests réussis: ${successCount}/${testUsers.length}`);
  console.log(`❌ Tests échoués: ${testUsers.length - successCount}/${testUsers.length}`);
  
  if (successCount === testUsers.length) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('🚀 L\'application est prête pour les tests utilisateurs.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
}

runAllTests();
