const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY2MjMwNiwiZXhwIjoyMDc2MjM4MzA2fQ.bcXLkGU3K2h1skNS5Q8jPOL23viSthS04pjqPwYw5K8'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

const usersToCreate = [
  {
    email: 'rokhaya@senegel.org',
    password: 'password123',
    firstName: 'Rokhaya',
    lastName: 'BODIAN',
    role: 'manager'
  },
  {
    email: 'nabyaminatoul08@gmail.com',
    password: 'password123',
    firstName: 'Amy',
    lastName: 'DIAGNE',
    role: 'analyst'
  },
  {
    email: 'adjadiallo598@gmail.com',
    password: 'password123',
    firstName: 'Adja Mame Sarr',
    lastName: 'DIALLO',
    role: 'sales'
  },
  {
    email: 'gningue04@gmail.com',
    password: 'password123',
    firstName: 'Oumar',
    lastName: 'GNINGUE',
    role: 'sales'
  }
];

async function createAuthUser(userData) {
  try {
    console.log(`🔄 Création compte auth pour ${userData.email}...`);
    
    // Créer le compte dans Supabase Auth
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
    return authData.user;
  } catch (error) {
    console.error(`❌ Erreur inattendue pour ${userData.email}:`, error.message);
    return null;
  }
}

async function createAllAuthUsers() {
  console.log('🚀 Création des comptes d\'authentification Supabase...');
  
  for (const user of usersToCreate) {
    await createAuthUser(user);
  }
  
  console.log('\n🎉 Création terminée !');
  console.log('\n📋 Comptes créés:');
  usersToCreate.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });
}

createAllAuthUsers();
