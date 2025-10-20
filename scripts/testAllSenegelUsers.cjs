const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjIzMDYsImV4cCI6MjA3NjIzODMwNn0.-_jcUhUeifEACMHl2SAErb7lAfzOVHzD7QGtAxFsgQk'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

const usersToTest = [
  { email: "admin@senegel.org", name: "Super Admin", role: "super_admin" },
  { email: "Mariemebl3@gmail.com", name: "Marieme BADIANE", role: "hr" },
  { email: "rokhaya@senegel.org", name: "Rokhaya BODIAN", role: "manager" },
  { email: "nabyaminatoul08@gmail.com", name: "Amy DIAGNE", role: "analyst" },
  { email: "awadiagne1003@gmail.com", name: "Awa DIAGNE", role: "finance" },
  { email: "adjadiallo598@gmail.com", name: "Adja Mame Sarr DIALLO", role: "sales" },
  { email: "mdiasse26@gmail.com", name: "Mouhamadou Lamine DIASSE", role: "developer" },
  { email: "diopiste@yahoo.fr", name: "Ousmane DIOP", role: "developer" },
  { email: "bafode.drame@senegel.org", name: "Bafode DRAME", role: "operations" },
  { email: "adjabsf92@gmail.com", name: "Adja Bineta Sylla FAYE", role: "hr" },
  { email: "gningue04@gmail.com", name: "Oumar GNINGUE", role: "sales" },
  { email: "onevisionbmca@gmail.com", name: "Mariame Diouldé GUINDO", role: "marketing" },
  { email: "rokhayakebe23@gmail.com", name: "Rokhaya KEBE", role: "support" },
  { email: "lyamadoudia@gmail.com", name: "Amadou Dia LY", role: "manager" },
  { email: "wowastudios@gmail.com", name: "Cheikh Mohamed NDIAYE", role: "designer" },
  { email: "cnyafouna@gmail.com", name: "Charles NYAFOUNA", role: "manager" },
  { email: "pape@senegel.org", name: "Alioune Badara Pape SAMB", role: "administrator" },
  { email: "sambrokhy700@gmail.com", name: "Rokhaya SAMB", role: "content" },
  { email: "adamasene.fa@gmail.com", name: "Adama Mandaw SENE", role: "tester" },
  { email: "contact@senegel.org", name: "CONTACT SENEGEL", role: "super_admin" }
];

const defaultPassword = "Senegel2024!";

async function testAllUsers() {
  console.log("🚀 TEST DE CONNEXION DE TOUS LES UTILISATEURS SENEGEL");
  console.log("=====================================================");
  console.log(`📊 ${usersToTest.length} utilisateurs à tester`);
  console.log(`🔐 Mot de passe: ${defaultPassword}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < usersToTest.length; i++) {
    const user = usersToTest[i];
    console.log(`\n[${i + 1}/${usersToTest.length}] Test: ${user.name} (${user.role})`);
    console.log(`📧 Email: ${user.email}`);

    try {
      // 1. Tester la connexion Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: defaultPassword
      });

      if (authError) {
        console.log(`❌ Erreur auth: ${authError.message}`);
        errorCount++;
        continue;
      }

      if (!authData.user) {
        console.log(`❌ Erreur: Utilisateur non trouvé`);
        errorCount++;
        continue;
      }

      console.log(`✅ Connexion auth réussie: ${authData.user.email}`);

      // 2. Tester la récupération du profil
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.log(`❌ Erreur profil: ${profileError.message}`);
        errorCount++;
        continue;
      }

      if (!profileData) {
        console.log(`❌ Erreur: Profil non trouvé`);
        errorCount++;
        continue;
      }

      console.log(`✅ Profil récupéré: ${profileData.first_name} ${profileData.last_name} (${profileData.role})`);

      // 3. Déconnexion
      await supabase.auth.signOut();
      console.log(`✅ Déconnexion réussie`);

      successCount++;

    } catch (error) {
      console.log(`❌ Erreur inattendue: ${error.message}`);
      errorCount++;
    }

    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n🎉 RÉSULTATS FINAUX");
  console.log("===================");
  console.log(`✅ ${successCount} utilisateurs connectés avec succès`);
  console.log(`❌ ${errorCount} erreurs`);
  console.log(`📊 Taux de réussite: ${Math.round((successCount / usersToTest.length) * 100)}%`);

  if (successCount === usersToTest.length) {
    console.log("\n🎊 TOUS LES UTILISATEURS FONCTIONNENT PARFAITEMENT !");
  } else {
    console.log("\n⚠️ Certains utilisateurs ont des problèmes de connexion.");
  }
}

testAllUsers();
