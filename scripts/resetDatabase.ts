import { clearAllData, testConnection } from '../services/dataService';

/**
 * Script pour réinitialiser la base de données Appwrite
 * ATTENTION: Ce script supprime TOUTES les données !
 */

const resetDatabase = async () => {
  console.log('🚨 ATTENTION: Réinitialisation de la base de données Appwrite...');
  console.log('⚠️  Toutes les données seront supprimées !');
  
  try {
    // Tester la connexion
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à Appwrite');
      return false;
    }

    // Demander confirmation (en mode script, on continue)
    console.log('🔄 Suppression de toutes les données...');
    
    // Nettoyer toutes les collections
    const success = await clearAllData();
    
    if (success) {
      console.log('✅ Base de données réinitialisée avec succès');
      console.log('🎯 Vous pouvez maintenant migrer de nouvelles données');
    } else {
      console.error('❌ Erreur lors de la réinitialisation');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    return false;
  }
};

// Exécuter le script si appelé directement
if (typeof window === 'undefined') {
  resetDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default resetDatabase;

