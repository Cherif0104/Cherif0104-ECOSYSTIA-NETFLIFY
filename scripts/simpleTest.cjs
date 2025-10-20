const { Client } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6737b2b4b5a5a5a5a5a5a5a5');

console.log('✅ Client Appwrite créé avec succès');
console.log('Endpoint:', client.config.endpoint);
console.log('Project ID:', client.config.project);

// Test de création d'une collection simple
async function createSimpleCollection() {
  try {
    const { Databases, ID, Permission, Role } = require('appwrite');
    const databases = new Databases(client);
    
    console.log('🔄 Création d\'une collection de test...');
    
    const response = await databases.createCollection(
      '6737b2b4b5a5a5a5a5a5a5a6', // DATABASE_ID
      'test_collection',
      'Collection de Test',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    
    console.log('✅ Collection créée:', response.$id);
    
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️ Collection existe déjà');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

createSimpleCollection();
