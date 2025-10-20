const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY2MjMwNiwiZXhwIjoyMDc2MjM4MzA2fQ.bcXLkGU3K2h1skNS5Q8jPOL23viSthS04pjqPwYw5K8'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function createAdminUser() {
  console.log('🚀 Création de l\'utilisateur admin@senegel.org...');
  
  try {
    // 1. Créer le compte utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@senegel.org',
      password: 'Senegel2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
      },
    });

    if (authError) {
      console.error('❌ Erreur auth:', authError.message);
      return;
    }

    console.log('✅ Compte auth créé:', authData.user.email);

    // 2. Mettre à jour le profil dans la table users
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .update({
        id: authData.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('email', 'admin@senegel.org');

    if (profileError) {
      console.error('❌ Erreur profil:', profileError.message);
    } else {
      console.log('✅ Profil mis à jour');
    }

    console.log('🎉 Utilisateur admin créé avec succès !');
    console.log('📧 Email: admin@senegel.org');
    console.log('🔑 Mot de passe: Senegel2024!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAdminUser();
