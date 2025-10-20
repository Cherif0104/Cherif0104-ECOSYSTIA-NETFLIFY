/**
 * 🔐 TEST AUTHENTIFICATION - ECOSYSTIA
 * Test simple de connexion Appwrite
 */

import { Client, Account, Databases } from 'appwrite';

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ee2dc2001f0f499c02';
const APPWRITE_DATABASE_ID = '68ee527d002813e4e0ca';
const APPWRITE_API_KEY = 'standard_02717fc47c45cff4edc16624ae9127ca436dff8bd115037e795dec54eb8c50f53d989078ad57f2ca52daa41ce272dfc205bca21613f2d07c98525613e3da936d71ff2c5804b392c7c79760dcd3c8a7998c1c2078d73bd310b8dde7224c14fb802c5302625bd3a3fca79c7ca5d52b4585dcd959a9810d387a065f2e64af71df38';

async function testConnection() {
  try {
    console.log('🔄 Test de connexion Appwrite...');
    
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    // Test de connexion en listant les collections
    const collections = await databases.listCollections(APPWRITE_DATABASE_ID);
    
    console.log('✅ Connexion réussie !');
    console.log(`📊 Collections trouvées: ${collections.total}`);
    
    collections.collections.forEach(collection => {
      console.log(`  - ${collection.name} (${collection.$id})`);
    });
    
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testConnection();
