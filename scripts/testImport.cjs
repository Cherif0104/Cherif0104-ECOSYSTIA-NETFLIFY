console.log('🔄 Test d\'import Appwrite...');

try {
  const appwrite = require('appwrite');
  console.log('✅ Appwrite importé avec succès');
  console.log('Modules disponibles:', Object.keys(appwrite));
  
  const { Client, Databases, ID, Permission, Role } = appwrite;
  console.log('✅ Modules extraits:', { Client: !!Client, Databases: !!Databases, ID: !!ID, Permission: !!Permission, Role: !!Role });
  
  // Test de création du client
  const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68ee2dc2001f0f499c02');
  
  console.log('✅ Client créé avec succès');
  console.log('Endpoint:', client.config.endpoint);
  console.log('Project ID:', client.config.project);
  
  // Test de création de l'instance Databases
  const databases = new Databases(client);
  console.log('✅ Instance Databases créée');
  console.log('Méthodes disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(databases)));
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.error('Stack:', error.stack);
}
