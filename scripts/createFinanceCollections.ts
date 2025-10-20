/**
 * Script automatique pour créer les 5 collections Finance manquantes
 * Utilise l'API Key serveur pour créer les collections via l'API Appwrite
 */

import { Client, Databases } from 'appwrite';

// Configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '68e54e9c002cb568cfec';
const DATABASE_ID = '68e54e9c002cb568cfec';
const API_KEY = 'standard_b986e1a17fd54227435a76d31136ad2ef845cf1e7f872ea98fa219b28aa0b34ece9883ec3bc4b5fb4e6117f97a566c704459d71849c56fb12bf15646a4f28fa7456a9d155ebe0c085bbcabf38cdbbef963e57e014fc7f2febe532e192bf6bf7865baa08f045d6ece5986586aa8ca42d0302e675cf42403809c341c506e8ff65e';

// Collections à créer
const COLLECTIONS_TO_CREATE = [
  {
    id: 'demo_recurring_invoices',
    name: 'Demo Recurring Invoices',
    attributes: [
      { key: 'invoiceNumber', type: 'string', size: 100, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'frequency', type: 'string', size: 50, required: true },
      { key: 'startDate', type: 'string', size: 50, required: true },
      { key: 'endDate', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'lastGenerated', type: 'string', size: 50 },
      { key: 'nextDue', type: 'string', size: 50 },
      { key: 'ownerId', type: 'string', size: 50, required: true }
    ]
  },
  {
    id: 'demo_recurring_expenses',
    name: 'Demo Recurring Expenses',
    attributes: [
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'frequency', type: 'string', size: 50, required: true },
      { key: 'startDate', type: 'string', size: 50, required: true },
      { key: 'endDate', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'lastGenerated', type: 'string', size: 50 },
      { key: 'nextDue', type: 'string', size: 50 },
      { key: 'ownerId', type: 'string', size: 50, required: true }
    ]
  },
  {
    id: 'demo_budgets',
    name: 'Demo Budgets',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'totalAmount', type: 'double', required: true },
      { key: 'spentAmount', type: 'double', required: true },
      { key: 'startDate', type: 'string', size: 50, required: true },
      { key: 'endDate', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'category', type: 'string', size: 100 },
      { key: 'ownerId', type: 'string', size: 50, required: true }
    ]
  },
  {
    id: 'demo_budget_lines',
    name: 'Demo Budget Lines',
    attributes: [
      { key: 'budgetId', type: 'string', size: 50, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 500 },
      { key: 'allocatedAmount', type: 'double', required: true },
      { key: 'spentAmount', type: 'double', required: true },
      { key: 'category', type: 'string', size: 100 },
      { key: 'priority', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'ownerId', type: 'string', size: 50, required: true }
    ]
  },
  {
    id: 'demo_budget_items',
    name: 'Demo Budget Items',
    attributes: [
      { key: 'budgetLineId', type: 'string', size: 50, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 500 },
      { key: 'amount', type: 'double', required: true },
      { key: 'date', type: 'string', size: 50, required: true },
      { key: 'category', type: 'string', size: 100 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'invoiceId', type: 'string', size: 50 },
      { key: 'expenseId', type: 'string', size: 50 },
      { key: 'ownerId', type: 'string', size: 50, required: true }
    ]
  }
];

async function createCollections() {
  console.log('🚀 Démarrage de la création automatique des collections Finance...\n');

  // Initialiser le client Appwrite avec l'API Key serveur
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID);

  // Configuration de l'API Key pour les requêtes serveur
  client.headers['X-Appwrite-Key'] = API_KEY;

  const databases = new Databases(client);

  let successCount = 0;
  let errorCount = 0;

  for (const collection of COLLECTIONS_TO_CREATE) {
    try {
      console.log(`📝 Création de la collection: ${collection.name} (${collection.id})`);
      
      // Créer la collection
      const createdCollection = await databases.createCollection(
        DATABASE_ID,
        collection.id,
        collection.name,
        [], // permissions (vide pour l'instant)
        false // document security
      );

      console.log(`✅ Collection créée avec succès: ${collection.id}`);

      // Créer les attributs
      for (const attr of collection.attributes) {
        try {
          await databases.createStringAttribute(
            DATABASE_ID,
            collection.id,
            attr.key,
            attr.size || 255,
            attr.required || false
          );
          console.log(`  ✅ Attribut créé: ${attr.key} (${attr.type})`);
        } catch (attrError: any) {
          if (attrError.message.includes('already exists')) {
            console.log(`  ⚠️ Attribut déjà existant: ${attr.key}`);
          } else {
            console.log(`  ❌ Erreur attribut ${attr.key}:`, attrError.message);
          }
        }
      }

      successCount++;
      console.log(`🎉 Collection ${collection.name} terminée avec succès!\n`);

    } catch (error: any) {
      errorCount++;
      if (error.message.includes('already exists')) {
        console.log(`⚠️ Collection ${collection.id} existe déjà, passage à la suivante...\n`);
      } else {
        console.log(`❌ Erreur lors de la création de ${collection.id}:`, error.message);
        console.log(`🔍 Détails de l'erreur:`, error);
        console.log('');
      }
    }
  }

  // Résumé final
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ DE LA CRÉATION DES COLLECTIONS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ Collections créées avec succès: ${successCount}`);
  console.log(`❌ Erreurs rencontrées: ${errorCount}`);
  console.log(`📈 Taux de réussite: ${Math.round((successCount / COLLECTIONS_TO_CREATE.length) * 100)}%`);
  
  if (successCount === COLLECTIONS_TO_CREATE.length) {
    console.log('🎊 TOUTES LES COLLECTIONS FINANCE ONT ÉTÉ CRÉÉES AVEC SUCCÈS !');
  } else if (successCount > 0) {
    console.log('⚠️ Certaines collections ont été créées, vérifiez les erreurs ci-dessus');
  } else {
    console.log('❌ Aucune collection n\'a pu être créée');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
}

// Lancer le script
createCollections()
  .then(() => {
    console.log('\n🏁 Script terminé !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
