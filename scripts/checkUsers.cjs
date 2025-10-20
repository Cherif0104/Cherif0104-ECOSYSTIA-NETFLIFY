const { Client, Account } = require('appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);

// Liste des utilisateurs à vérifier
const usersToCheck = [
  { email: 'Mariemebl3@gmail.com', name: 'Marieme BADIANE' },
  { email: 'rokhaya@senegel.org', name: 'Rokhaya BODIAN' },
  { email: 'Nabyaminatoul08@gmail.com', name: 'Amy DIAGNE' },
  { email: 'awadiagne1003@gmail.com', name: 'Awa DIAGNE' },
  { email: 'adjadiallo598@gmail.com', name: 'Adja Mame Sarr DIALLO' },
  { email: 'mdiasse26@gmail.com', name: 'Mouhamadou Lamine DIASSE' },
  { email: 'diopiste@yahoo.fr', name: 'Ousmane DIOP' },
  { email: 'bafode.drame@senegel.org', name: 'Bafode DRAME' },
  { email: 'adjabsf92@gmail.com', name: 'Adja Bineta Sylla FAYE' },
  { email: 'gningue04@gmail.com', name: 'Oumar GNINGUE' }
];

async function checkUser(email, name) {
  try {
    console.log(`\n🔍 Vérification: ${name} (${email})`);
    
    // Tenter de créer une session
    const session = await account.createEmailPasswordSession(email, 'Senegel2024!');
    
    if (session) {
      console.log(`✅ UTILISATEUR VALIDE`);
      console.log(`   ID: ${session.userId}`);
      console.log(`   Email: ${session.email}`);
      console.log(`   Name: ${session.name}`);
      
      // Supprimer la session de test
      await account.deleteSession('current');
      return true;
    }
    
  } catch (error) {
    if (error.code === 401) {
      console.log(`❌ CRÉDENTIALS INVALIDES`);
    } else if (error.code === 404) {
      console.log(`❌ UTILISATEUR NON TROUVÉ`);
    } else {
      console.log(`❌ ERREUR: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('🔍 VÉRIFICATION DES UTILISATEURS SENEGEL');
  console.log('========================================\n');
  
  let validUsers = 0;
  let invalidUsers = 0;
  
  for (const user of usersToCheck) {
    const isValid = await checkUser(user.email, user.name);
    if (isValid) validUsers++;
    else invalidUsers++;
    
    // Attendre entre les vérifications
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n📊 RÉSULTATS:`);
  console.log(`✅ Utilisateurs valides: ${validUsers}`);
  console.log(`❌ Utilisateurs invalides: ${invalidUsers}`);
  
  if (invalidUsers > 0) {
    console.log(`\n🚨 PROBLÈME: ${invalidUsers} utilisateurs ne peuvent pas se connecter!`);
    console.log(`💡 SOLUTION: Recréer les utilisateurs avec les bons mots de passe`);
  }
}

main();
