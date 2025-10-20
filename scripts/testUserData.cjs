const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testUserData() {
  console.log('🔍 TEST DES DONNÉES UTILISATEUR');
  console.log('================================\n');
  
  try {
    // Récupérer tous les utilisateurs
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    if (!users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }
    
    console.log(`✅ ${users.length} utilisateur(s) trouvé(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Prénom: "${user.first_name}"`);
      console.log(`   Nom: "${user.last_name}"`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Créé: ${new Date(user.created_at).toLocaleString()}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    // Tester la récupération d'un utilisateur spécifique
    console.log('\n🔍 TEST DE RÉCUPÉRATION D\'UN UTILISATEUR SPÉCIFIQUE');
    console.log('===================================================\n');
    
    const testUser = users[0];
    console.log(`Test avec l'utilisateur: ${testUser.first_name} ${testUser.last_name}`);
    
    // Simuler la récupération comme dans le service
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError.message);
    } else {
      console.log('✅ Profil récupéré avec succès:');
      console.log(`   - first_name: "${userProfile.first_name}"`);
      console.log(`   - last_name: "${userProfile.last_name}"`);
      console.log(`   - email: "${userProfile.email}"`);
      console.log(`   - role: "${userProfile.role}"`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testUserData();
