const { Client, Databases } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6737b2b4b5a5a5a5a5a5a5a5');

const databases = new Databases(client);
const DATABASE_ID = '6737b2b4b5a5a5a5a5a5a5a6';

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à Appwrite...');
    console.log('Endpoint:', client.config.endpoint);
    console.log('Project ID:', client.config.project);
    console.log('Database ID:', DATABASE_ID);
    
    // Test simple de connexion
    const response = await databases.list(DATABASE_ID);
    console.log('✅ Connexion réussie!');
    console.log('Collections existantes:', response.collections.length);
    
    response.collections.forEach(col => {
      console.log(`  - ${col.name} (${col.$id})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
  }
}

testConnection();
