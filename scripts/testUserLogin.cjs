const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testUserLogin() {
  console.log('🔍 TEST DE CONNEXION UTILISATEUR');
  console.log('================================\n');
  
  try {
    // Tester la connexion avec un utilisateur existant
    const testEmail = 'contact@senegel.org';
    const testPassword = 'password123'; // Mot de passe par défaut
    
    console.log(`🔄 Test de connexion avec: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }
    
    console.log('✅ Connexion réussie !');
    console.log('🔍 Données auth:', {
      id: authData.user.id,
      email: authData.user.email,
      user_metadata: authData.user.user_metadata
    });
    
    // Récupérer le profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError.message);
    } else {
      console.log('✅ Profil utilisateur récupéré:');
      console.log(`   - ID: ${userProfile.id}`);
      console.log(`   - Email: ${userProfile.email}`);
      console.log(`   - Prénom: "${userProfile.first_name}"`);
      console.log(`   - Nom: "${userProfile.last_name}"`);
      console.log(`   - Rôle: ${userProfile.role}`);
      
      // Simuler la conversion comme dans le service
      const convertedUser = {
        id: userProfile.id,
        email: userProfile.email,
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.role,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        createdAt: userProfile.created_at,
        lastLoginAt: new Date().toISOString()
      };
      
      console.log('\n✅ Utilisateur converti:');
      console.log(`   - firstName: "${convertedUser.firstName}"`);
      console.log(`   - lastName: "${convertedUser.lastName}"`);
      console.log(`   - name: "${convertedUser.name}"`);
    }
    
    // Déconnexion
    await supabase.auth.signOut();
    console.log('\n✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testUserLogin();
