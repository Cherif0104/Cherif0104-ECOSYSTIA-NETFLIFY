const { createClient } = require('@supabase/supabase-js');

const supabaseConfig = {
  url: 'https://nigfrebfpkeoreaaiqzu.supabase.co',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ2ZyZWJmcGtlb3JlYWFpcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY2MjMwNiwiZXhwIjoyMDc2MjM4MzA2fQ.bcXLkGU3K2h1skNS5Q8jPOL23viSthS04pjqPwYw5K8'
};

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

const usersToCreate = [
  { email: "rokhaya@senegel.org", firstName: "Rokhaya", lastName: "BODIAN", role: "manager", phone: "77 520 32 78" },
  { email: "nabyaminatoul08@gmail.com", firstName: "Amy", lastName: "DIAGNE", role: "analyst", phone: "77 905 14 87" },
  { email: "awadiagne1003@gmail.com", firstName: "Awa", lastName: "DIAGNE", role: "finance", phone: "77 453 44 76" },
  { email: "adjadiallo598@gmail.com", firstName: "Adja Mame Sarr", lastName: "DIALLO", role: "sales", phone: "77 477 39 39" },
  { email: "mdiasse26@gmail.com", firstName: "Mouhamadou Lamine", lastName: "DIASSE", role: "developer", phone: "77 194 87 25" },
  { email: "diopiste@yahoo.fr", firstName: "Ousmane", lastName: "DIOP", role: "developer", phone: "77 511 97 91" },
  { email: "bafode.drame@senegel.org", firstName: "Bafode", lastName: "DRAME", role: "operations", phone: "77 650 96 68" },
  { email: "adjabsf92@gmail.com", firstName: "Adja Bineta Sylla", lastName: "FAYE", role: "hr", phone: "77 484 55 80" },
  { email: "gningue04@gmail.com", firstName: "Oumar", lastName: "GNINGUE", role: "sales", phone: "77 768 49 99" },
  { email: "onevisionbmca@gmail.com", firstName: "Mariame Diouldé", lastName: "GUINDO", role: "marketing", phone: "77 564 44 40" },
  { email: "rokhayakebe23@gmail.com", firstName: "Rokhaya", lastName: "KEBE", role: "support", phone: "76 194 72 04" },
  { email: "lyamadoudia@gmail.com", firstName: "Amadou Dia", lastName: "LY", role: "manager", phone: "+1 (971) 270-8619" },
  { email: "wowastudios@gmail.com", firstName: "Cheikh Mohamed", lastName: "NDIAYE", role: "designer", phone: "77 283 55 14" },
  { email: "cnyafouna@gmail.com", firstName: "Charles", lastName: "NYAFOUNA", role: "manager", phone: "+44 7545 341935" },
  { email: "pape@senegel.org", firstName: "Alioune Badara Pape", lastName: "SAMB", role: "administrator", phone: "+1 (202) 557-4901" },
  { email: "sambrokhy700@gmail.com", firstName: "Rokhaya", lastName: "SAMB", role: "content", phone: "77 286 33 12" },
  { email: "adamasene.fa@gmail.com", firstName: "Adama Mandaw", lastName: "SENE", role: "tester", phone: "77 705 32 51" },
  { email: "contact@senegel.org", firstName: "CONTACT", lastName: "SENEGEL", role: "super_admin", phone: "77 853 33 99" }
];

const defaultPassword = "Senegel2024!";

async function createAllMissingUsers() {
  console.log('🚀 Création de tous les utilisateurs manquants...');
  console.log(`📊 ${usersToCreate.length} utilisateurs à créer`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const userData of usersToCreate) {
    const { email, firstName, lastName, role, phone } = userData;
    
    try {
      console.log(`\n[${successCount + errorCount + 1}/${usersToCreate.length}] Création: ${firstName} ${lastName} (${email})`);

      // 1. Créer le compte utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          phone: phone,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.warn(`⚠️ Utilisateur déjà enregistré: ${email}`);
          // Tenter de récupérer l'utilisateur existant
          const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserByEmail(email);
          if (fetchError || !existingUser) {
            console.error(`❌ Erreur récupération utilisateur existant: ${fetchError?.message || 'Non trouvé'}`);
            errorCount++;
            continue;
          }
          authData.user = existingUser.user;
        } else {
          console.error(`❌ Erreur auth: ${authError.message}`);
          errorCount++;
          continue;
        }
      }

      if (authData.user) {
        // 2. Mettre à jour le profil dans la table users
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .update({
            id: authData.user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);

        if (profileError) {
          console.error(`❌ Erreur profil: ${profileError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Utilisateur créé: ${email}`);
          successCount++;
        }
      } else {
        console.error(`❌ Erreur: Compte utilisateur non créé pour ${email}`);
        errorCount++;
      }

    } catch (error) {
      console.error(`❌ Erreur inattendue pour ${email}:`, error.message);
      errorCount++;
    }
  }

  console.log("\n🎉 CRÉATION TERMINÉE!");
  console.log(`✅ ${successCount} utilisateurs créés avec succès`);
  console.log(`❌ ${errorCount} erreurs`);
  console.log(`\n🔐 Mot de passe pour tous: ${defaultPassword}`);
}

createAllMissingUsers();
