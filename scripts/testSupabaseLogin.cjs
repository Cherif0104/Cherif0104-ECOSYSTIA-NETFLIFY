const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nigfrebfpkeoreaaiqzu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk';

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  try {
    console.log('🧪 TEST DE CONNEXION SUPABASE');
    console.log('=============================\n');
    
    const email = 'Mariemebl3@gmail.com';
    const password = 'Senegel2024!';
    
    console.log(`🔄 Test connexion: ${email}`);
    
    // Test de connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (authError) {
      console.error(`❌ Erreur auth: ${authError.message}`);
      return false;
    }
    
    if (!authData.user) {
      console.error(`❌ Aucun utilisateur retourné`);
      return false;
    }
    
    console.log(`✅ Connexion réussie!`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Created: ${authData.user.created_at}`);
    
    // Test de récupération des données utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error(`❌ Erreur récupération profil: ${userError.message}`);
      console.log(`ℹ️ Le profil utilisateur n'existe pas encore dans la table users`);
    } else {
      console.log(`✅ Profil utilisateur trouvé:`);
      console.log(`   Nom: ${userData.first_name} ${userData.last_name}`);
      console.log(`   Rôle: ${userData.role}`);
      console.log(`   Département: ${userData.department}`);
    }
    
    // Test de déconnexion
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.error(`❌ Erreur déconnexion: ${logoutError.message}`);
    } else {
      console.log(`✅ Déconnexion réussie`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur générale: ${error.message}`);
    return false;
  }
}

testLogin();
