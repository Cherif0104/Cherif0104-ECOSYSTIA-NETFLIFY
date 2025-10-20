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

// Utilisateurs SENEGEL à créer
const senegelUsers = [
  { firstName: "Marieme", lastName: "BADIANE", email: "Mariemebl3@gmail.com", phone: "77 926 24 77", role: "hr", dept: "Ressources Humaines", pos: "Responsable RH" },
  { firstName: "Rokhaya", lastName: "BODIAN", email: "rokhaya@senegel.org", phone: "77 520 32 78", role: "manager", dept: "Direction", pos: "Directrice Générale" },
  { firstName: "Amy", lastName: "DIAGNE", email: "Nabyaminatoul08@gmail.com", phone: "77 905 14 87", role: "analyst", dept: "Analyse", pos: "Analyste de Données" },
  { firstName: "Awa", lastName: "DIAGNE", email: "awadiagne1003@gmail.com", phone: "77 453 44 76", role: "finance", dept: "Finance", pos: "Comptable" },
  { firstName: "Adja Mame Sarr", lastName: "DIALLO", email: "adjadiallo598@gmail.com", phone: "77 477 39 39", role: "sales", dept: "Commercial", pos: "Responsable Commercial" },
  { firstName: "Mouhamadou Lamine", lastName: "DIASSE", email: "mdiasse26@gmail.com", phone: "77 194 87 25", role: "developer", dept: "Technique", pos: "Développeur Senior" },
  { firstName: "Ousmane", lastName: "DIOP", email: "diopiste@yahoo.fr", phone: "77 511 97 91", role: "developer", dept: "Technique", pos: "Développeur Full-Stack" },
  { firstName: "Bafode", lastName: "DRAME", email: "bafode.drame@senegel.org", phone: "77 650 96 68", role: "operations", dept: "Opérations", pos: "Responsable Opérations" },
  { firstName: "Adja Bineta Sylla", lastName: "FAYE", email: "adjabsf92@gmail.com", phone: "77 484 55 80", role: "hr", dept: "Ressources Humaines", pos: "Assistante RH" },
  { firstName: "Oumar", lastName: "GNINGUE", email: "gningue04@gmail.com", phone: "77 768 49 99", role: "sales", dept: "Commercial", pos: "Commercial" },
  { firstName: "Mariame Diouldé", lastName: "GUINDO", email: "onevisionbmca@gmail.com", phone: "77 564 44 40", role: "marketing", dept: "Marketing", pos: "Responsable Marketing" },
  { firstName: "Rokhaya", lastName: "KEBE", email: "rokhayakebe23@gmail.com", phone: "76 194 72 04", role: "support", dept: "Support", pos: "Support Client" },
  { firstName: "Amadou Dia", lastName: "LY", email: "lyamadoudia@gmail.com", phone: "+1 (971) 270-8619", role: "manager", dept: "Direction", pos: "Manager International" },
  { firstName: "Cheikh Mohamed", lastName: "NDIAYE", email: "Wowastudios@gmail.com", phone: "77 283 55 14", role: "designer", dept: "Design", pos: "Designer UI/UX" },
  { firstName: "Charles", lastName: "NYAFOUNA", email: "cnyafouna@gmail.com", phone: "+44 7545 341935", role: "manager", dept: "Direction", pos: "Manager Stratégique" },
  { firstName: "Alioune Badara Pape", lastName: "SAMB", email: "pape@senegel.org", phone: "+1 (202) 557-4901", role: "administrator", dept: "Direction", pos: "Administrateur Principal" },
  { firstName: "Rokhaya", lastName: "SAMB", email: "sambrokhy700@gmail.com", phone: "77 286 33 12", role: "content", dept: "Communication", pos: "Responsable Contenu" },
  { firstName: "Adama Mandaw", lastName: "SENE", email: "adamasene.fa@gmail.com", phone: "77 705 32 51", role: "tester", dept: "Qualité", pos: "Testeur QA" },
  { firstName: "CONTACT", lastName: "SENEGEL", email: "contact@senegel.org", phone: "77 853 33 99", role: "super_admin", dept: "Direction", pos: "Super Administrateur" }
];

const defaultPassword = "Senegel2024!";

async function createSenegelUsers() {
  console.log('🚀 CRÉATION DES UTILISATEURS SENEGEL SUR SUPABASE');
  console.log('=================================================\n');
  console.log(`📊 ${senegelUsers.length} utilisateurs à créer`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < senegelUsers.length; i++) {
    const user = senegelUsers[i];
    const { firstName, lastName, email, phone, role, dept, pos } = user;

    try {
      console.log(`\n[${i+1}/${senegelUsers.length}] Création: ${firstName} ${lastName} (${role})`);

      // 1. Créer le compte auth avec Supabase Admin
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        }
      });

      if (authError) {
        console.error(`❌ Erreur auth: ${authError.message}`);
        errors++;
        continue;
      }

      if (!authData.user) {
        console.error(`❌ Aucun utilisateur créé`);
        errors++;
        continue;
      }

      // 2. Créer le profil utilisateur dans la table users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: role,
          department: dept,
          position: pos,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Erreur profil: ${profileError.message}`);
        errors++;
        continue;
      }

      console.log(`✅ Utilisateur créé: ${email} (${authData.user.id})`);
      success++;

      // Attendre entre les créations pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Erreur générale: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n🎉 CRÉATION TERMINÉE!`);
  console.log(`✅ ${success} utilisateurs créés avec succès`);
  console.log(`❌ ${errors} erreurs`);
  
  console.log(`\n🔐 INFORMATIONS DE CONNEXION:`);
  console.log(`URL: http://localhost:5173`);
  console.log(`Mot de passe: ${defaultPassword}`);
  console.log(`\n👥 UTILISATEURS CRÉÉS:`);
  senegelUsers.forEach((user, index) => {
    if (index < success) {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    }
  });
}

// Exécuter la création
createSenegelUsers().catch(console.error);
