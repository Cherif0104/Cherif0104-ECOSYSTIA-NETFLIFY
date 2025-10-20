const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testLogin(email, password) {
  try {
    console.log(`🔄 Test connexion: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`❌ Erreur connexion ${email}:`, error.message);
      return null;
    }

    console.log(`✅ Connexion réussie: ${email}`);
    
    // Récupérer les données utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error(`❌ Erreur récupération données ${email}:`, userError.message);
      return null;
    }

    console.log(`📊 Données utilisateur ${email}:`, {
      role: userData.role,
      first_name: userData.first_name,
      last_name: userData.last_name
    });

    return userData;
  } catch (error) {
    console.error(`❌ Erreur inattendue ${email}:`, error.message);
    return null;
  }
}

async function testAllLogins() {
  const users = [
    { email: 'rokhaya@senegel.org', password: 'Senegel2024!' },
    { email: 'nabyaminatoul08@gmail.com', password: 'Senegel2024!' },
    { email: 'adjadiallo598@gmail.com', password: 'Senegel2024!' },
    { email: 'gningue04@gmail.com', password: 'Senegel2024!' }
  ];

  console.log('🚀 Test des connexions...');
  
  for (const user of users) {
    await testLogin(user.email, user.password);
    console.log('---');
  }
}

testAllLogins();
