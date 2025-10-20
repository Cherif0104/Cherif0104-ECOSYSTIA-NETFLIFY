const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY2MjMwNiwiZXhwIjoyMDc2MjM4MzA2fQ.bcXLkGU3K2h1skNS5Q8jPOL23viSthS04pjqPwYw5K8'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

const usersToCreate = [
  {
    email: 'rokhaya@senegel.org',
    password: 'Senegel2024!',
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    role: 'manager'
  },
  {
    email: 'nabyaminatoul08@gmail.com',
    password: 'Senegel2024!',
    firstName: 'Amy',
    lastName: 'DIAGNE',
    role: 'analyst'
  },
  {
    email: 'adjadiallo598@gmail.com',
    password: 'Senegel2024!',
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    role: 'sales'
  },
  {
    email: 'gningue04@gmail.com',
    password: 'Senegel2024!',
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    role: 'sales'
  }
];

async function createOrUpdateUser(userData) {
  try {
    console.log(`🔄 Création/Mise à jour compte pour ${userData.email}...`);
    
    // Supprimer l'ancien compte s'il existe
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === userData.email);
      if (existingUser) {
        await supabase.auth.admin.deleteUser(existingUser.id);
        console.log(`🗑️ Ancien compte supprimé pour ${userData.email}`);
      }
    } catch (error) {
      // Ignorer les erreurs de suppression
    }
    
    // Créer le nouveau compte
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role
      }
    });

    if (authError) {
      console.error(`❌ Erreur création auth pour ${userData.email}:`, authError.message);
      return null;
    }

    console.log(`✅ Compte auth créé pour ${userData.email} (ID: ${authData.user.id})`);
    
    // Mettre à jour la table users
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        is_active: true,
        updated_at: new Date().toISOString()
      });

    if (userError) {
      console.error(`❌ Erreur mise à jour table users pour ${userData.email}:`, userError.message);
    } else {
      console.log(`✅ Table users mise à jour pour ${userData.email}`);
    }

    return authData.user;
  } catch (error) {
    console.error(`❌ Erreur inattendue pour ${userData.email}:`, error.message);
    return null;
  }
}

async function createAllUsers() {
  console.log('🚀 Création/Mise à jour des comptes utilisateurs...');
  
  for (const user of usersToCreate) {
    await createOrUpdateUser(user);
    console.log('---');
  }
  
  console.log('\n🎉 Création terminée !');
  console.log('\n📋 Comptes créés avec le mot de passe: Senegel2024!');
  usersToCreate.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });
}

createAllUsers();
