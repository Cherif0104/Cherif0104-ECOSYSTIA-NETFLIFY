import { Client, Databases, ID, Permission, Role } from 'appwrite';

// Configuration Appwrite
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ee2dc2001f0f499c02';
const APPWRITE_DATABASE_ID = '68ee527d002813e4e0ca';
const APPWRITE_API_KEY = 'standard_02717fc47c45cff4edc16624ae9127ca436dff8bd115037e795dec54eb8c50f53d989078ad57f2ca52daa41ce272dfc205bca21613f2d07c98525613e3da936d71ff2c5804b392c7c79760dcd3c8a7998c1c2078d73bd310b8dde7224c14fb802c5302625bd3a3fca79c7ca5d52b4585dcd959a9810d387a065f2e64af71df38';

// Initialisation Appwrite
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function createOKRCollections() {
  try {
    console.log('🚀 Création des collections OKR...');

    // 1. Créer la collection 'objectives'
    console.log('📋 Création de la collection objectives...');
    try {
      const objectivesCollection = await databases.createCollection(
        APPWRITE_DATABASE_ID,
        'objectives',
        'Objectives',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Collection objectives créée:', objectivesCollection.$id);

      // Ajouter les attributs
      await databases.createStringAttribute(APPWRITE_DATABASE_ID, 'objectives', 'title', 255, true);
      await databases.createStringAttribute(APPWRITE_DATABASE_ID, 'objectives', 'projectId', 255, true);
      await databases.createStringAttribute(APPWRITE_DATABASE_ID, 'objectives', 'keyResults', 10000, false);
      
      console.log('✅ Attributs objectives ajoutés');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️ Collection objectives existe déjà');
      } else {
        throw error;
      }
    }

    // 2. Créer la collection 'key_results'
    console.log('📋 Création de la collection key_results...');
    try {
      const keyResultsCollection = await databases.createCollection(
        APPWRITE_DATABASE_ID,
        'key_results',
        'Key Results',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('✅ Collection key_results créée:', keyResultsCollection.$id);

      // Ajouter les attributs
      await databases.createStringAttribute(APPWRITE_DATABASE_ID, 'key_results', 'title', 255, true);
      await databases.createIntegerAttribute(APPWRITE_DATABASE_ID, 'key_results', 'target', true);
      await databases.createIntegerAttribute(APPWRITE_DATABASE_ID, 'key_results', 'current', true);
      await databases.createStringAttribute(APPWRITE_DATABASE_ID, 'key_results', 'unit', 50, true);
      await databases.createStringAttribute(APPWRITE_DATABASE_ID, 'key_results', 'objectiveId', 255, true);
      
      console.log('✅ Attributs key_results ajoutés');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️ Collection key_results existe déjà');
      } else {
        throw error;
      }
    }

    console.log('🎉 Collections OKR créées avec succès !');

  } catch (error) {
    console.error('❌ Erreur création collections OKR:', error);
  }
}

createOKRCollections();
