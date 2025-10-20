/**
 * Script de test automatique pour vérifier les collections Appwrite
 * Vérifie que toutes les collections existent et sont accessibles
 */

import { databases, DATABASE_ID, COLLECTION_IDS } from '../services/appwriteService';

// Collections à tester
const COLLECTIONS_TO_TEST = [
  { id: COLLECTION_IDS.USERS, name: 'Users' },
  { id: COLLECTION_IDS.PROJECTS, name: 'Projects' },
  { id: COLLECTION_IDS.TASKS, name: 'Tasks' },
  { id: COLLECTION_IDS.INVOICES, name: 'Invoices' },
  { id: COLLECTION_IDS.EXPENSES, name: 'Expenses' },
  { id: COLLECTION_IDS.RECURRING_INVOICES, name: 'Recurring Invoices' },
  { id: COLLECTION_IDS.RECURRING_EXPENSES, name: 'Recurring Expenses' },
  { id: COLLECTION_IDS.BUDGETS, name: 'Budgets' },
  { id: COLLECTION_IDS.BUDGET_LINES, name: 'Budget Lines' },
  { id: COLLECTION_IDS.BUDGET_ITEMS, name: 'Budget Items' },
  { id: COLLECTION_IDS.CRM_CLIENTS, name: 'CRM Clients' },
  { id: COLLECTION_IDS.CONTACTS, name: 'Contacts' },
  { id: COLLECTION_IDS.COURSES, name: 'Courses' },
  { id: COLLECTION_IDS.JOBS, name: 'Jobs' },
  { id: COLLECTION_IDS.TIME_LOGS, name: 'Time Logs' },
  { id: COLLECTION_IDS.LEAVE_REQUESTS, name: 'Leave Requests' },
  { id: COLLECTION_IDS.DOCUMENTS, name: 'Documents' },
  { id: COLLECTION_IDS.RISKS, name: 'Risks' },
  { id: COLLECTION_IDS.OBJECTIVES, name: 'Objectives' },
  { id: COLLECTION_IDS.KEY_RESULTS, name: 'Key Results' },
  { id: COLLECTION_IDS.MEETINGS, name: 'Meetings' },
  { id: COLLECTION_IDS.NOTIFICATIONS, name: 'Notifications' },
  { id: COLLECTION_IDS.LESSONS, name: 'Lessons' },
  { id: COLLECTION_IDS.MODULES, name: 'Modules' },
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
    COLLECTION_IDS.USERS,
    COLLECTION_IDS.PROJECTS,
    COLLECTION_IDS.INVOICES,
    COLLECTION_IDS.EXPENSES,
    COLLECTION_IDS.BUDGETS
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
