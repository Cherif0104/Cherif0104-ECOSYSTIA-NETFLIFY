const { Client, Account, Databases, Query } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('68ee2dc2001f0f499c02');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

// Fonction pour supprimer tous les utilisateurs
async function deleteAllUsers() {
  console.log('🗑️ SUPPRESSION DE TOUS LES UTILISATEURS');
  console.log('=====================================\n');
  
  try {
    // 1. Supprimer tous les documents utilisateurs de la base de données
    console.log('🔄 Suppression des documents utilisateurs...');
    
    let offset = 0;
    const limit = 100;
    let totalDeleted = 0;
    
    while (true) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          'users',
          [Query.limit(limit), Query.offset(offset)]
        );
        
        if (response.documents.length === 0) {
          break;
        }
        
        for (const user of response.documents) {
          try {
            await databases.deleteDocument(DATABASE_ID, 'users', user.$id);
            console.log(`✅ Document supprimé: ${user.firstName} ${user.lastName}`);
            totalDeleted++;
          } catch (error) {
            console.log(`⚠️ Erreur suppression document ${user.firstName} ${user.lastName}: ${error.message}`);
          }
        }
        
        offset += limit;
      } catch (error) {
        console.log(`⚠️ Erreur lors de la récupération des utilisateurs: ${error.message}`);
        break;
      }
    }
    
    console.log(`\n✅ ${totalDeleted} documents utilisateurs supprimés`);
    
    // 2. Note sur les comptes Appwrite
    console.log('\n📝 NOTE IMPORTANTE:');
    console.log('Les comptes Appwrite ne peuvent pas être supprimés via l\'API');
    console.log('Ils seront réutilisés lors de la recréation des utilisateurs');
    console.log('ou peuvent être supprimés manuellement depuis la console Appwrite');
    
    console.log('\n🎉 SUPPRESSION TERMINÉE!');
    console.log('Prêt pour la création des vrais utilisateurs SENEGEL');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
  }
}

// Exécuter le script
deleteAllUsers();
