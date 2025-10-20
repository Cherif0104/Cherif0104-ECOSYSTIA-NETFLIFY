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

// Utilisateurs SENEGEL avec les vrais UUIDs
const senegelUsers = [
  { firstName: "Marieme", lastName: "BADIANE", email: "mariemebl3@gmail.com", phone: "77 926 24 77", role: "hr", dept: "Ressources Humaines", pos: "Responsable RH", authId: "1b1004d1-9101-44fa-a2b1-1adce5a0795e" },
  { firstName: "Rokhaya", lastName: "BODIAN", email: "rokhaya@senegel.org", phone: "77 520 32 78", role: "manager", dept: "Direction", pos: "Directrice Générale", authId: "71f1686b-564e-4403-ab43-0eb7eeaf4a4b" },
  { firstName: "Amy", lastName: "DIAGNE", email: "nabyaminatoul08@gmail.com", phone: "77 905 14 87", role: "analyst", dept: "Analyse", pos: "Analyste de Données", authId: "414bd9e5-651c-40b1-bf69-a94d965e60e5" },
  { firstName: "Awa", lastName: "DIAGNE", email: "awadiagne1003@gmail.com", phone: "77 453 44 76", role: "finance", dept: "Finance", pos: "Comptable", authId: "6d7b913b-36fb-43a8-bddf-0adde8a06d41" },
  { firstName: "Adja Mame Sarr", lastName: "DIALLO", email: "adjadiallo598@gmail.com", phone: "77 477 39 39", role: "sales", dept: "Commercial", pos: "Responsable Commercial", authId: "c0ae26df-2f71-4952-96ed-ff9d78986483" },
  { firstName: "Mouhamadou Lamine", lastName: "DIASSE", email: "mdiasse26@gmail.com", phone: "77 194 87 25", role: "developer", dept: "Technique", pos: "Développeur Senior", authId: "b7cc3bd6-bfbd-4766-8e30-d93f309c59f0" },
  { firstName: "Ousmane", lastName: "DIOP", email: "diopiste@yahoo.fr", phone: "77 511 97 91", role: "developer", dept: "Technique", pos: "Développeur Full-Stack", authId: "49962125-c510-441e-80d2-1aac96ebd304" },
  { firstName: "Bafode", lastName: "DRAME", email: "bafode.drame@senegel.org", phone: "77 650 96 68", role: "operations", dept: "Opérations", pos: "Responsable Opérations", authId: "a794bedc-09a4-43d5-b09a-c5fead7132f9" },
  { firstName: "Adja Bineta Sylla", lastName: "FAYE", email: "adjabsf92@gmail.com", phone: "77 484 55 80", role: "hr", dept: "Ressources Humaines", pos: "Assistante RH", authId: "83d81d12-a9d1-42d2-ac11-43cd2e0d56e4" },
  { firstName: "Oumar", lastName: "GNINGUE", email: "gningue04@gmail.com", phone: "77 768 49 99", role: "sales", dept: "Commercial", pos: "Commercial", authId: "02fd1232-ce52-41b7-ac21-e090b01e4d35" },
  { firstName: "Mariame Diouldé", lastName: "GUINDO", email: "onevisionbmca@gmail.com", phone: "77 564 44 40", role: "marketing", dept: "Marketing", pos: "Responsable Marketing", authId: "64b9037d-e148-435d-946d-288896f6f532" },
  { firstName: "Rokhaya", lastName: "KEBE", email: "rokhayakebe23@gmail.com", phone: "76 194 72 04", role: "support", dept: "Support", pos: "Support Client", authId: "a71d1916-dda6-4c39-97fc-cdc6c9566ec4" },
  { firstName: "Amadou Dia", lastName: "LY", email: "lyamadoudia@gmail.com", phone: "+1 (971) 270-8619", role: "manager", dept: "Direction", pos: "Manager International", authId: "5a838e3e-3aa3-4d56-beb8-9d269a4fe7de" },
  { firstName: "Cheikh Mohamed", lastName: "NDIAYE", email: "wowastudios@gmail.com", phone: "77 283 55 14", role: "designer", dept: "Design", pos: "Designer UI/UX", authId: "d8d09c0c-ed9f-45e2-ae19-46357ba9e050" },
  { firstName: "Charles", lastName: "NYAFOUNA", email: "cnyafouna@gmail.com", phone: "+44 7545 341935", role: "manager", dept: "Direction", pos: "Manager Stratégique", authId: "f6e9a621-7e12-468d-9809-5c400de77351" },
  { firstName: "Alioune Badara Pape", lastName: "SAMB", email: "pape@senegel.org", phone: "+1 (202) 557-4901", role: "administrator", dept: "Direction", pos: "Administrateur Principal", authId: "b0f5cfc8-af12-4374-ab91-68370754a104" },
  { firstName: "Rokhaya", lastName: "SAMB", email: "sambrokhy700@gmail.com", phone: "77 286 33 12", role: "content", dept: "Communication", pos: "Responsable Contenu", authId: "80c0d760-5625-48d3-b902-64178ac2acbb" },
  { firstName: "Adama Mandaw", lastName: "SENE", email: "adamasene.fa@gmail.com", phone: "77 705 32 51", role: "tester", dept: "Qualité", pos: "Testeur QA", authId: "2d772318-0c7f-4447-bd90-d365be5f4d40" },
  { firstName: "CONTACT", lastName: "SENEGEL", email: "contact@senegel.org", phone: "77 853 33 99", role: "super_admin", dept: "Direction", pos: "Super Administrateur", authId: "a285f277-d898-4ada-9aef-19c8148b6049" }
];

async function createAllProfiles() {
  console.log('👥 CRÉATION FINALE DES PROFILS UTILISATEURS SENEGEL');
  console.log('===================================================\n');
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

  console.log(`\n🎉 CRÉATION FINALE TERMINÉE!`);
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
createAllProfiles().catch(console.error);
