/**
 * Script pour lister TOUTES les collections Appwrite
 * Pour identifier les vrais IDs à utiliser
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('68e54e9c002cb568cfec');

const databases = new Databases(client);
const databaseId = '68e56de100267007af6a';

async function listAllCollections() {
  console.log('🔍 LISTING TOUTES LES COLLECTIONS APPWRITE...\n');

  try {
    // Note: listCollections n'existe pas dans le SDK client
    // On va tester chaque collection connue
    
        const collectionsToTest = [
          'demo_users',
          'demo_projects',
          'demo_tasks',
          'demo_courses',
          'demo_jobs',
          'demo_invoices',
          'demo_expenses',
          'demo_time_logs',
          'demo_leave_requests',
          'demo_contacts',
          'demo_crm_clients',
          'demo_documents',
          'demo_risks',
          'demo_objectives',
          'demo_key_results',
          'demo_notifications',
          'demo_meetings',
        ];

    console.log('📋 Test des collections possibles:\n');

    for (const collectionId of collectionsToTest) {
      try {
        const result = await databases.listDocuments(databaseId, collectionId, []);
        console.log(`✅ "${collectionId}" - EXISTE (${result.total} documents)`);
      } catch (error: any) {
        if (error.code === 404) {
          console.log(`❌ "${collectionId}" - N'existe pas`);
        } else {
          console.log(`⚠️  "${collectionId}" - Erreur: ${error.message}`);
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

listAllCollections()
  .then(() => {
    console.log('\n✅ Scan terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

