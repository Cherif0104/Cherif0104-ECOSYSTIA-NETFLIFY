/**
 * Script de création de la collection Leave Requests
 * À exécuter avec : npx tsx scripts/createLeaveRequestsCollection.ts
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';
import { config } from '../config';

// Configuration Appwrite
const client = new Client()
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const DATABASE_ID = config.APPWRITE_DATABASE_ID;

async function createLeaveRequestsCollection() {
  console.log('🚀 Création de la collection Leave Requests...\n');

  try {
    // ===== COLLECTION: leave_requests =====
    console.log('📋 Création collection "leave_requests"...');
    
    const leaveCollection = await databases.createCollection(
      DATABASE_ID,
      'leave_requests',
      'leave_requests',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection "leave_requests" créée:', leaveCollection.$id);

    // Attributs de la collection leave_requests
    const attributes = [
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'type', type: 'enum', elements: ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'], required: true },
      { key: 'startDate', type: 'string', size: 50, required: true },
      { key: 'endDate', type: 'string', size: 50, required: true },
      { key: 'days', type: 'integer', required: true },
      { key: 'status', type: 'enum', elements: ['Pending', 'Approved', 'Rejected'], required: true },
      { key: 'reason', type: 'string', size: 2000, required: false },
      { key: 'approvedBy', type: 'string', size: 100, required: false },
      { key: 'approvedAt', type: 'string', size: 50, required: false },
      { key: 'rejectionReason', type: 'string', size: 1000, required: false }
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'leave_requests',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID,
            'leave_requests',
            attr.key,
            attr.elements,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'leave_requests',
            attr.key,
            attr.required
          );
        }
        console.log(`  ✅ Attribut "${attr.key}" créé`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`  ❌ Erreur création attribut "${attr.key}":`, error.message);
      }
    }

    console.log('✅ Tous les attributs de "leave_requests" créés\n');

    // Créer les index
    console.log('📋 Création des index...');
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'leave_requests',
        'userId_index',
        'key',
        ['userId'],
        ['ASC']
      );
      console.log('  ✅ Index "userId_index" créé');
      
      await databases.createIndex(
        DATABASE_ID,
        'leave_requests',
        'status_index',
        'key',
        ['status'],
        ['ASC']
      );
      console.log('  ✅ Index "status_index" créé');
    } catch (error: any) {
      console.error('  ❌ Erreur création index:', error.message);
    }

    console.log('\n🎉 Collection Leave Requests créée avec succès!');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création de la collection:', error.message);
    throw error;
  }
}

// Exécuter le script
createLeaveRequestsCollection()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script échoué:', error);
    process.exit(1);
  });

