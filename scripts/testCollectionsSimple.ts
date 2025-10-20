/**
 * Script de test simple pour vérifier les collections Appwrite
 * Utilise les valeurs directes pour éviter les problèmes d'environnement
 */

import { Client, Databases } from 'appwrite';

// Configuration directe
const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('68e54e9c002cb568cfec');

const databases = new Databases(client);
const DATABASE_ID = '68e56de100267007af6a';

// Collections à tester
const COLLECTIONS_TO_TEST = [
  { id: 'demo_users', name: 'Users' },
  { id: 'demo_projects', name: 'Projects' },
  { id: 'demo_tasks', name: 'Tasks' },
  { id: 'demo_invoices', name: 'Invoices' },
  { id: 'demo_expenses', name: 'Expenses' },
  { id: 'demo_recurring_invoices', name: 'Recurring Invoices' },
  { id: 'demo_recurring_expenses', name: 'Recurring Expenses' },
  { id: 'demo_budgets', name: 'Budgets' },
  { id: 'demo_budget_lines', name: 'Budget Lines' },
  { id: 'demo_budget_items', name: 'Budget Items' },
  { id: 'demo_crm_clients', name: 'CRM Clients' },
  { id: 'demo_contacts', name: 'Contacts' },
  { id: 'demo_courses', name: 'Courses' },
  { id: 'demo_jobs', name: 'Jobs' },
  { id: 'demo_time_logs', name: 'Time Logs' },
  { id: 'demo_leave_requests', name: 'Leave Requests' },
];

async function testCollection(collectionId: string, collectionName: string) {
  try {
    console.log(`🔍 Test de la collection: ${collectionName} (${collectionId})`);
    
    // Tenter de lister les documents (test d'accès)
    const documents = await databases.listDocuments(DATABASE_ID, collectionId);
    
    console.log(`  ✅ Collection accessible - ${documents.total} documents trouvés`);
    return { success: true, count: documents.total };
    
  } catch (error: any) {
    console.log(`  ❌ Erreur: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllCollections() {
  console.log('🚀 DÉMARRAGE DU TEST AUTOMATIQUE DES COLLECTIONS\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  let successCount = 0;
  let errorCount = 0;
  const results: any[] = [];
  
  for (const collection of COLLECTIONS_TO_TEST) {
    const result = await testCollection(collection.id, collection.name);
    results.push({ ...collection, ...result });
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    console.log(''); // Ligne vide pour la lisibilité
  }
  
  // Résumé des résultats
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ DU TEST DES COLLECTIONS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Collections accessibles: ${successCount}`);
  console.log(`❌ Collections avec erreur: ${errorCount}`);
  console.log(`📈 Taux de réussite: ${Math.round((successCount / COLLECTIONS_TO_TEST.length) * 100)}%`);
  console.log('');
  
  // Détail des erreurs
  if (errorCount > 0) {
    console.log('🔍 DÉTAIL DES ERREURS:');
    console.log('─────────────────────────────────────────────────────────');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`❌ ${r.name} (${r.id}): ${r.error}`);
      });
    console.log('');
  }
  
  // Collections critiques
  const criticalCollections = [
    'demo_users',
    'demo_projects',
    'demo_invoices',
    'demo_expenses',
    'demo_budgets'
  ];
  
  const criticalResults = results.filter(r => criticalCollections.includes(r.id));
  const criticalSuccess = criticalResults.filter(r => r.success).length;
  
  console.log('🎯 COLLECTIONS CRITIQUES:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`✅ Collections critiques accessibles: ${criticalSuccess}/${criticalCollections.length}`);
  
  if (criticalSuccess === criticalCollections.length) {
    console.log('🎉 TOUTES LES COLLECTIONS CRITIQUES SONT ACCESSIBLES !');
  } else {
    console.log('⚠️ Certaines collections critiques ont des problèmes');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (successCount === COLLECTIONS_TO_TEST.length) {
    console.log('🎊 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
    console.log('🚀 L\'application est prête pour les tests manuels !');
  } else if (criticalSuccess === criticalCollections.length) {
    console.log('✅ Les collections critiques fonctionnent !');
    console.log('⚠️ Certaines collections optionnelles ont des problèmes');
    console.log('🚀 L\'application peut être testée manuellement !');
  } else {
    console.log('❌ Des collections critiques ont des problèmes');
    console.log('🔧 Correction nécessaire avant les tests manuels');
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  
  return {
    total: COLLECTIONS_TO_TEST.length,
    success: successCount,
    errors: errorCount,
    criticalSuccess,
    criticalTotal: criticalCollections.length
  };
}

// Lancer le test
testAllCollections()
  .then((results) => {
    console.log('\n🏁 Test terminé !');
    process.exit(results.criticalSuccess === results.criticalTotal ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale lors du test:', error);
    process.exit(1);
  });
