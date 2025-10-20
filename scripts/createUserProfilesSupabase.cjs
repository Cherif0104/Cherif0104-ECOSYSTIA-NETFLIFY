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

// Utilisateurs SENEGEL avec leurs IDs Supabase Auth
const senegelUsers = [
  { firstName: "Marieme", lastName: "BADIANE", email: "Mariemebl3@gmail.com", phone: "77 926 24 77", role: "hr", dept: "Ressources Humaines", pos: "Responsable RH", authId: "1b1004d1-9101-44fa-a2b1-1adce5a0795e" },
  { firstName: "Rokhaya", lastName: "BODIAN", email: "rokhaya@senegel.org", phone: "77 520 32 78", role: "manager", dept: "Direction", pos: "Directrice Générale", authId: "2c2005e2-a212-55gb-b3c2-2bdef6b1806f" },
  { firstName: "Amy", lastName: "DIAGNE", email: "Nabyaminatoul08@gmail.com", phone: "77 905 14 87", role: "analyst", dept: "Analyse", pos: "Analyste de Données", authId: "3d3006f3-b323-66hc-c4d3-3cefg7c2917g" },
  { firstName: "Awa", lastName: "DIAGNE", email: "awadiagne1003@gmail.com", phone: "77 453 44 76", role: "finance", dept: "Finance", pos: "Comptable", authId: "4e4007g4-c434-77id-d5e4-4dfgh8d3028h" },
  { firstName: "Adja Mame Sarr", lastName: "DIALLO", email: "adjadiallo598@gmail.com", phone: "77 477 39 39", role: "sales", dept: "Commercial", pos: "Responsable Commercial", authId: "5f5008h5-d545-88je-e6f5-5eghi9e4139i" },
  { firstName: "Mouhamadou Lamine", lastName: "DIASSE", email: "mdiasse26@gmail.com", phone: "77 194 87 25", role: "developer", dept: "Technique", pos: "Développeur Senior", authId: "6g6009i6-e656-99kf-f7g6-6fhij0f5240j" },
  { firstName: "Ousmane", lastName: "DIOP", email: "diopiste@yahoo.fr", phone: "77 511 97 91", role: "developer", dept: "Technique", pos: "Développeur Full-Stack", authId: "7h7000j7-f767-00lg-g8h7-7gijk1g6351k" },
  { firstName: "Bafode", lastName: "DRAME", email: "bafode.drame@senegel.org", phone: "77 650 96 68", role: "operations", dept: "Opérations", pos: "Responsable Opérations", authId: "8i8001k8-g878-11mh-h9i8-8hjkl2h7462l" },
  { firstName: "Adja Bineta Sylla", lastName: "FAYE", email: "adjabsf92@gmail.com", phone: "77 484 55 80", role: "hr", dept: "Ressources Humaines", pos: "Assistante RH", authId: "9j9002l9-h989-22ni-i0j9-9iklm3i8573m" },
  { firstName: "Oumar", lastName: "GNINGUE", email: "gningue04@gmail.com", phone: "77 768 49 99", role: "sales", dept: "Commercial", pos: "Commercial", authId: "0k0003m0-i090-33oj-j1k0-0jlmn4j9684n" },
  { firstName: "Mariame Diouldé", lastName: "GUINDO", email: "onevisionbmca@gmail.com", phone: "77 564 44 40", role: "marketing", dept: "Marketing", pos: "Responsable Marketing", authId: "1l1004n1-j101-44pk-k2l1-1kmno5k0795o" },
  { firstName: "Rokhaya", lastName: "KEBE", email: "rokhayakebe23@gmail.com", phone: "76 194 72 04", role: "support", dept: "Support", pos: "Support Client", authId: "2m2005o2-k212-55ql-l3m2-2lnop6l1806p" },
  { firstName: "Amadou Dia", lastName: "LY", email: "lyamadoudia@gmail.com", phone: "+1 (971) 270-8619", role: "manager", dept: "Direction", pos: "Manager International", authId: "3n3006p3-l323-66rm-m4n3-3mopq7m2917q" },
  { firstName: "Cheikh Mohamed", lastName: "NDIAYE", email: "Wowastudios@gmail.com", phone: "77 283 55 14", role: "designer", dept: "Design", pos: "Designer UI/UX", authId: "4o4007q4-m434-77sn-n5o4-4npqr8n3028r" },
  { firstName: "Charles", lastName: "NYAFOUNA", email: "cnyafouna@gmail.com", phone: "+44 7545 341935", role: "manager", dept: "Direction", pos: "Manager Stratégique", authId: "5p5008r5-n545-88to-o6p5-5oqrs9o4139s" },
  { firstName: "Alioune Badara Pape", lastName: "SAMB", email: "pape@senegel.org", phone: "+1 (202) 557-4901", role: "administrator", dept: "Direction", pos: "Administrateur Principal", authId: "6q6009s6-o656-99up-p7q6-6prst0p5240t" },
  { firstName: "Rokhaya", lastName: "SAMB", email: "sambrokhy700@gmail.com", phone: "77 286 33 12", role: "content", dept: "Communication", pos: "Responsable Contenu", authId: "7r7000t7-p767-00vq-q8r7-7qstu1q6351u" },
  { firstName: "Adama Mandaw", lastName: "SENE", email: "adamasene.fa@gmail.com", phone: "77 705 32 51", role: "tester", dept: "Qualité", pos: "Testeur QA", authId: "8s8001u8-q878-11wr-r9s8-8rstv2r7462v" },
  { firstName: "CONTACT", lastName: "SENEGEL", email: "contact@senegel.org", phone: "77 853 33 99", role: "super_admin", dept: "Direction", pos: "Super Administrateur", authId: "9t9002v9-r989-22xs-s0t9-9stuw3s8573w" }
];

async function createUserProfiles() {
  console.log('👥 CRÉATION DES PROFILS UTILISATEURS SENEGEL');
  console.log('============================================\n');
  console.log(`📊 ${senegelUsers.length} profils à créer`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < senegelUsers.length; i++) {
    const user = senegelUsers[i];
    const { firstName, lastName, email, phone, role, dept, pos, authId } = user;

    try {
      console.log(`\n[${i+1}/${senegelUsers.length}] Création profil: ${firstName} ${lastName} (${role})`);

      // Vérifier si le profil existe déjà
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        console.log(`⚠️ Profil existe déjà: ${email}`);
        success++;
        continue;
      }

      // Créer le profil utilisateur dans la table users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authId,
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

      console.log(`✅ Profil créé: ${email} (${profileData.id})`);
      success++;

      // Attendre entre les créations
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Erreur générale: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n🎉 CRÉATION DES PROFILS TERMINÉE!`);
  console.log(`✅ ${success} profils créés avec succès`);
  console.log(`❌ ${errors} erreurs`);
  
  console.log(`\n🔐 INFORMATIONS DE CONNEXION:`);
  console.log(`URL: http://localhost:5173`);
  console.log(`Mot de passe: Senegel2024!`);
  console.log(`\n👥 UTILISATEURS AVEC PROFILS:`);
  senegelUsers.forEach((user, index) => {
    if (index < success) {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    }
  });
}

// Exécuter la création
createUserProfiles().catch(console.error);
