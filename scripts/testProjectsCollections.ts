/**
 * 🧪 TEST SIMPLIFIÉ - COLLECTIONS PROJETS
 * Test rapide des collections Appwrite pour le module Projects
 */

// Configuration simplifiée pour éviter les problèmes d'import
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = 'demo-ecosystia';
const DATABASE_ID = 'demo_database';
const API_KEY = 'your-api-key-here'; // À remplacer par la vraie clé

const COLLECTIONS_TO_TEST = [
  'demo_projects',
  'demo_tasks', 
  'demo_risks',
  'demo_budgets',
  'demo_invoices',
  'demo_expenses',
  'demo_time_logs',
  'demo_meetings',
  'demo_documents'
];

/**
 * Test de connexion à une collection
 */
async function testCollection(collectionId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        count: data.documents ? data.documents.length : 0
      };
    } else {
      return {
        success: false,
        count: 0,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Test de création d'un document test
 */
async function testDocumentCreation(collectionId: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents`;
    
    const testData = {
      documentId: `test_${Date.now()}`,
      data: {
        title: 'Test Document',
        description: 'Document créé par le test automatisé',
        createdAt: new Date().toISOString()
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        id: data.$id
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Test de suppression d'un document test
 */
async function testDocumentDeletion(collectionId: string, documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/documents/${documentId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { success: true };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Exécuter tous les tests
 */
async function runTests(): Promise<void> {
  console.log('🧪 TEST DES COLLECTIONS PROJETS');
  console.log('================================');
  console.log(`📡 Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`📁 Database: ${DATABASE_ID}`);
  console.log(`🔑 Project: ${PROJECT_ID}`);
  console.log('');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const collectionId of COLLECTIONS_TO_TEST) {
    console.log(`🔍 Test de la collection: ${collectionId}`);
    
    // Test 1: Lecture de la collection
    totalTests++;
    const readResult = await testCollection(collectionId);
    if (readResult.success) {
      console.log(`  ✅ Lecture: ${readResult.count} documents trouvés`);
      passedTests++;
    } else {
      console.log(`  ❌ Lecture: ${readResult.error}`);
      failedTests++;
      continue; // Passer aux autres tests si la lecture échoue
    }

    // Test 2: Création d'un document test
    totalTests++;
    const createResult = await testDocumentCreation(collectionId);
    if (createResult.success) {
      console.log(`  ✅ Création: Document créé avec ID ${createResult.id}`);
      passedTests++;

      // Test 3: Suppression du document test
      if (createResult.id) {
        totalTests++;
        const deleteResult = await testDocumentDeletion(collectionId, createResult.id);
        if (deleteResult.success) {
          console.log(`  ✅ Suppression: Document supprimé avec succès`);
          passedTests++;
        } else {
          console.log(`  ❌ Suppression: ${deleteResult.error}`);
          failedTests++;
        }
      }
    } else {
      console.log(`  ❌ Création: ${createResult.error}`);
      failedTests++;
    }

    console.log('');
  }

  // Résultats finaux
  console.log('📊 RÉSULTATS FINAUX');
  console.log('==================');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${failedTests}/${totalTests}`);
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`🎯 Taux de réussite: ${successRate}%`);

  if (failedTests === 0) {
    console.log('\n🎉 TOUTES LES COLLECTIONS SONT OPÉRATIONNELLES !');
    console.log('✅ MODULE PROJETS PRÊT POUR LA PRODUCTION');
  } else {
    console.log('\n⚠️ CERTAINES COLLECTIONS ONT DES PROBLÈMES');
    console.log('❌ VÉRIFIER LA CONFIGURATION APPWRITE');
  }
}

// Exécution si le script est lancé directement
if (typeof window === 'undefined') {
  // Environnement Node.js
  runTests().catch(console.error);
} else {
  // Environnement navigateur
  console.log('Pour exécuter les tests, utilisez: runTests()');
  (window as any).runTests = runTests;
}

export { runTests, testCollection, testDocumentCreation, testDocumentDeletion };
