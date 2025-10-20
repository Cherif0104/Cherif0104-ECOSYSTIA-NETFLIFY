const { Client, Account } = require('appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);

// Test de connexion avec un utilisateur existant
async function testLogin() {
  try {
    console.log('🧪 TEST DE CONNEXION SENEGEL');
    console.log('============================\n');
    
    const email = 'Mariemebl3@gmail.com';
    const password = 'Senegel2024!';
    
    console.log(`🔄 Test connexion: ${email}`);
    
    // Supprimer toute session existante
    try {
      const currentSession = await account.getSession('current');
      if (currentSession) {
        await account.deleteSession('current');
        console.log('✅ Session précédente supprimée');
      }
    } catch (error) {
      console.log('ℹ️ Aucune session active');
    }
    
    // Créer une nouvelle session
    const session = await account.createEmailPasswordSession(email, password);
    
    if (session) {
      console.log(`✅ Connexion réussie!`);
      console.log(`   Session ID: ${session.$id}`);
      console.log(`   User ID: ${session.userId}`);
      console.log(`   Email: ${session.email}`);
      console.log(`   Name: ${session.name}`);
      
      // Tester la déconnexion
      await account.deleteSession('current');
      console.log(`✅ Déconnexion réussie`);
      
      return true;
    } else {
      console.log(`❌ Échec de la connexion`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

testLogin();
