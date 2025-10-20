const { Client, Account } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);

// Utilisateurs SENEGEL pour test
const testUsers = [
  {
    name: 'Marieme BADIANE',
    email: 'Mariemebl3@gmail.com',
    password: 'Senegel2024!',
    role: 'hr'
  },
  {
    name: 'Rokhaya BODIAN',
    email: 'rokhaya@senegel.org',
    password: 'Senegel2024!',
    role: 'manager'
  },
  {
    name: 'Amy DIAGNE',
    email: 'Nabyaminatoul08@gmail.com',
    password: 'Senegel2024!',
    role: 'analyst'
  },
  {
    name: 'Awa DIAGNE',
    email: 'awadiagne1003@gmail.com',
    password: 'Senegel2024!',
    role: 'finance'
  },
  {
    name: 'Adja Mame Sarr DIALLO',
    email: 'adjadiallo598@gmail.com',
    password: 'Senegel2024!',
    role: 'sales'
  }
];

// Fonction pour tester la connexion
async function testLogin(userData) {
  try {
    console.log(`🔄 Test connexion: ${userData.name} (${userData.email})`);
    
    const session = await account.createEmailPasswordSession(
      userData.email,
      userData.password
    );
    
    if (session) {
      console.log(`✅ Connexion réussie: ${userData.name}`);
      console.log(`   Session ID: ${session.$id}`);
      console.log(`   User ID: ${session.userId}`);
      
      // Tester la déconnexion
      await account.deleteSession(session.$id);
      console.log(`✅ Déconnexion réussie: ${userData.name}`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Échec connexion ${userData.name}: ${error.message}`);
    return false;
  }
}

// Fonction principale
async function testSenegelLogin() {
  console.log('🧪 TEST DE CONNEXION DES UTILISATEURS SENEGEL');
  console.log('============================================\n');
  
  let successCount = 0;
  let totalCount = testUsers.length;
  
  for (const user of testUsers) {
    const success = await testLogin(user);
    if (success) {
      successCount++;
    }
    
    // Attendre entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 RÉSULTATS DES TESTS:`);
  console.log(`✅ ${successCount}/${totalCount} connexions réussies`);
  console.log(`❌ ${totalCount - successCount}/${totalCount} connexions échouées`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS!');
    console.log('✅ Les utilisateurs SENEGEL peuvent se connecter');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('❌ Vérifiez les comptes utilisateurs');
  }
  
  console.log('\n🔐 INFORMATIONS DE CONNEXION:');
  console.log('URL: http://localhost:5176');
  console.log('Email: [email de l\'utilisateur]');
  console.log('Mot de passe: Senegel2024!');
}

// Exécuter les tests
testSenegelLogin();
