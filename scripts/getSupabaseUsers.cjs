const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nigfrebfpkeoreaaiqzu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY2MjMwNiwiZXhwIjoyMDc2MjM4MzA2fQ.bcXLkGU3K2h1skNS5Q8jPOL23viSthS04pjqPwYw5K8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getSupabaseUsers() {
  try {
    console.log('🔍 RÉCUPÉRATION DES UTILISATEURS SUPABASE');
    console.log('=========================================\n');
    
    // Récupérer tous les utilisateurs Supabase Auth
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }
    
    console.log(`📊 ${users.users.length} utilisateurs trouvés dans Supabase Auth\n`);
    
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Créé: ${user.created_at}`);
      console.log(`   Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log('');
    });
    
    // Créer un mapping email -> ID
    const emailToId = {};
    users.users.forEach(user => {
      emailToId[user.email.toLowerCase()] = user.id;
    });
    
    console.log('📋 MAPPING EMAIL -> ID:');
    console.log('======================');
    Object.entries(emailToId).forEach(([email, id]) => {
      console.log(`"${email}": "${id}",`);
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

getSupabaseUsers();
