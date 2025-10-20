const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY2MjMwNiwiZXhwIjoyMDc2MjM4MzA2fQ.bcXLkGU3K2h1skNS5Q8jPOL23viSthS04pjqPwYw5K8'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

// Utilisateurs avec leurs rôles corrects pour Analytics et CRM
const usersToUpdate = [
  {
    email: 'admin@senegel.org',
    role: 'super_administrator',
    name: 'Super Admin'
  },
  {
    email: 'pape@senegel.org', 
    role: 'super_administrator',
    name: 'Alioune Badara Pape SAMB'
  },
  {
    email: 'rokhaya@senegel.org',
    role: 'manager',
    name: 'Rokhaya BODIAN'
  },
  {
    email: 'lyamadoudia@gmail.com',
    role: 'manager', 
    name: 'Amadou Dia LY'
  },
  {
    email: 'cnyafouna@gmail.com',
    role: 'manager',
    name: 'Charles NYAFOUNA'
  },
  {
    email: 'nabyaminatoul08@gmail.com',
    role: 'analyst',
    name: 'Amy DIAGNE'
  },
  {
    email: 'adjadiallo598@gmail.com',
    role: 'sales',
    name: 'Adja Mame Sarr DIALLO'
  },
  {
    email: 'gningue04@gmail.com',
    role: 'sales',
    name: 'Oumar GNINGUE'
  }
];

async function updateUserRoles() {
  console.log('🚀 Mise à jour des rôles utilisateurs pour Analytics et CRM...');
  
  for (const user of usersToUpdate) {
    try {
      console.log(`\n🔄 Mise à jour de ${user.email}...`);
      
      // Mettre à jour le rôle dans la table users
      const { data, error } = await supabase
        .from('users')
        .update({ 
          role: user.role,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email);

      if (error) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
      } else {
        console.log(`✅ ${user.email} mis à jour avec le rôle: ${user.role}`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur générale pour ${user.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Mise à jour terminée !');
  console.log('\n📋 Utilisateurs avec accès Analytics et CRM:');
  console.log('👑 Super Admin (Analytics + CRM):');
  console.log('   - admin@senegel.org');
  console.log('   - pape@senegel.org');
  console.log('\n👨‍💼 Managers (CRM):');
  console.log('   - rokhaya@senegel.org');
  console.log('   - lyamadoudia@gmail.com');
  console.log('   - cnyafouna@gmail.com');
  console.log('\n📊 Analyst (Analytics):');
  console.log('   - nabyaminatoul08@gmail.com');
  console.log('\n💼 Sales (CRM):');
  console.log('   - adjadiallo598@gmail.com');
  console.log('   - gningue04@gmail.com');
}

updateUserRoles();
