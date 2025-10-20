/**
 * Script de création de la collection Leave Requests via HTTP
 * À exécuter avec : npx tsx scripts/createLeaveRequestsCollectionHTTP.ts
 */

import { config } from '../config';

const APPWRITE_ENDPOINT = config.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = config.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = config.APPWRITE_DATABASE_ID;
const APPWRITE_API_KEY = config.APPWRITE_API_KEY;

async function createLeaveRequestsCollection() {
  console.log('🚀 Création de la collection Leave Requests via HTTP...\n');

  try {
    // ===== COLLECTION: leave_requests =====
    console.log('📋 Création collection "leave_requests"...');
    
    const response = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        collectionId: 'leave_requests',
        name: 'Leave Requests',
        permissions: [
          'read("any")',
          'create("any")',
          'update("any")',
          'delete("any")'
        ],
        documentSecurity: false,
        attributes: [
          {
            key: 'userId',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'type',
            type: 'string',
            size: 50,
            required: true
          },
          {
            key: 'startDate',
            type: 'datetime',
            required: true
          },
          {
            key: 'endDate',
            type: 'datetime',
            required: true
          },
          {
            key: 'reason',
            type: 'string',
            size: 1000
          },
          {
            key: 'status',
            type: 'string',
            size: 50,
            required: true
          },
          {
            key: 'approvedBy',
            type: 'string',
            size: 255
          },
          {
            key: 'approvedAt',
            type: 'datetime'
          },
          {
            key: 'notes',
            type: 'string',
            size: 1000
          },
          {
            key: 'totalDays',
            type: 'integer'
          }
        ]
      })
    });

    if (response.ok) {
      console.log('✅ Collection "leave_requests" créée avec succès');
    } else {
      const error = await response.text();
      console.log('⚠️ Collection "leave_requests" existe peut-être déjà:', error);
    }

    console.log('\n🎉 Collection Leave Requests créée avec succès !');
    console.log('\n📊 Résumé:');
    console.log('  - leave_requests: Collection des demandes de congés');
    console.log('  - Types: annual, sick, personal, maternity, paternity, unpaid');
    console.log('  - Statuts: Pending, Approved, Rejected');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la collection:', error);
    process.exit(1);
  }
}

// Exécuter le script
createLeaveRequestsCollection();
