const { Client, Databases, Query } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Tests de validation
const tests = [
  {
    name: 'Test de connexion Appwrite',
    test: async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, 'users', [Query.limit(1)]);
        return { success: true, message: 'Connexion Appwrite réussie' };
      } catch (error) {
        return { success: false, message: `Erreur connexion: ${error.message}` };
      }
    }
  },
  {
    name: 'Test des utilisateurs SENEGEL',
    test: async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, 'users');
        const userCount = response.documents.length;
        const senegelUsers = response.documents.filter(user => 
          user.email.includes('@senegel.org') || 
          user.lastName === 'SENEGEL' ||
          user.lastName === 'SAMB' ||
          user.lastName === 'DIASSE'
        );
        
        return { 
          success: userCount > 0, 
          message: `${userCount} utilisateurs trouvés, ${senegelUsers.length} utilisateurs SENEGEL` 
        };
      } catch (error) {
        return { success: false, message: `Erreur utilisateurs: ${error.message}` };
      }
    }
  },
  {
    name: 'Test des collections',
    test: async () => {
      try {
        const collections = ['users', 'projects', 'tasks', 'goals', 'invoices', 'expenses', 'budgets'];
        const results = [];
        
        for (const collection of collections) {
          try {
            await databases.listDocuments(DATABASE_ID, collection, [Query.limit(1)]);
            results.push(`✅ ${collection}`);
          } catch (error) {
            results.push(`❌ ${collection}: ${error.message}`);
          }
        }
        
        return { 
          success: results.filter(r => r.includes('✅')).length === collections.length,
          message: results.join('\n')
        };
      } catch (error) {
        return { success: false, message: `Erreur collections: ${error.message}` };
      }
    }
  },
  {
    name: 'Test des projets',
    test: async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, 'projects');
        const projectCount = response.documents.length;
        
        return { 
          success: true, 
          message: `${projectCount} projets trouvés` 
        };
      } catch (error) {
        return { success: false, message: `Erreur projets: ${error.message}` };
      }
    }
  },
  {
    name: 'Test des permissions',
    test: async () => {
      try {
        // Test de lecture
        await databases.listDocuments(DATABASE_ID, 'users', [Query.limit(1)]);
        
        return { 
          success: true, 
          message: 'Permissions de lecture OK' 
        };
      } catch (error) {
        return { success: false, message: `Erreur permissions: ${error.message}` };
      }
    }
  }
];

// Fonction pour exécuter tous les tests
async function runTests() {
  console.log('🧪 TESTS DE VALIDATION SENEGEL PRODUCTION');
  console.log('==========================================\n');
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`🔄 ${test.name}...`);
    
    try {
      const result = await test.test();
      
      if (result.success) {
        console.log(`✅ ${test.name}: ${result.message}`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Erreur inattendue - ${error.message}`);
    }
    
    console.log('');
  }
  
  // Résumé des tests
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS!');
    console.log('✅ La plateforme SENEGEL est prête pour la production!');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('❌ Vérifiez la configuration avant le déploiement');
  }
  
  // Informations de déploiement
  console.log('\n📋 INFORMATIONS DE DÉPLOIEMENT');
  console.log('==============================');
  console.log('🌐 URL de déploiement: https://senegel-production.netlify.app');
  console.log('📧 Support: contact@senegel.org');
  console.log('📞 Téléphone: 77 853 33 99');
  console.log('🏢 Entreprise: SENEGEL');
  console.log('📍 Adresse: Dakar, en face arrêt Brt Liberté 6. Immeuble N°5486B. 4eme Étage. App10');
  
  return passedTests === totalTests;
}

// Exécuter les tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
