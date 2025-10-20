const https = require('https');

// Configuration Appwrite
const PROJECT_ID = '68ee2dc2001f0f499c02';
const DATABASE_ID = '68ee527d002813e4e0ca';
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';

// Collections à créer
const collections = [
  {
    collectionId: 'users',
    name: 'Utilisateurs',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'firstName', type: 'string', size: 100, required: true },
      { key: 'lastName', type: 'string', size: 100, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, required: true },
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'skills', type: 'string', size: 1000, required: false },
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'lastLogin', type: 'datetime', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'projects',
    name: 'Projets',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'priority', type: 'string', size: 20, required: true },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: true },
      { key: 'budget', type: 'double', required: false },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'team', type: 'string', size: 2000, required: false },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'progress', type: 'integer', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'tasks',
    name: 'Tâches',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'priority', type: 'string', size: 20, required: true },
      { key: 'projectId', type: 'string', size: 255, required: true },
      { key: 'assigneeId', type: 'string', size: 255, required: false },
      { key: 'dueDate', type: 'datetime', required: false },
      { key: 'estimatedHours', type: 'double', required: false },
      { key: 'actualHours', type: 'double', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'goals',
    name: 'Objectifs',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'priority', type: 'string', size: 20, required: true },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: true },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'progress', type: 'integer', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'key_results',
    name: 'Résultats Clés',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'goalId', type: 'string', size: 255, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'targetValue', type: 'double', required: true },
      { key: 'currentValue', type: 'double', required: true, default: 0 },
      { key: 'unit', type: 'string', size: 50, required: true },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'invoices',
    name: 'Factures',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'invoiceNumber', type: 'string', size: 100, required: true },
      { key: 'clientId', type: 'string', size: 255, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'tax', type: 'double', required: true },
      { key: 'total', type: 'double', required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'issueDate', type: 'datetime', required: true },
      { key: 'dueDate', type: 'datetime', required: true },
      { key: 'paidDate', type: 'datetime', required: false },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'expenses',
    name: 'Dépenses',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'description', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'date', type: 'datetime', required: true },
      { key: 'vendor', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'receiptUrl', type: 'string', size: 500, required: false },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'budgets',
    name: 'Budgets',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: true },
      { key: 'totalAmount', type: 'double', required: true },
      { key: 'spentAmount', type: 'double', required: true, default: 0 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'time_logs',
    name: 'Entrées de Temps',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'projectId', type: 'string', size: 255, required: true },
      { key: 'taskId', type: 'string', size: 255, required: false },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'startTime', type: 'datetime', required: true },
      { key: 'endTime', type: 'datetime', required: false },
      { key: 'duration', type: 'double', required: true },
      { key: 'isRunning', type: 'boolean', required: true, default: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'leave_requests',
    name: 'Demandes de Congés',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: true },
      { key: 'reason', type: 'string', size: 1000, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'approvedBy', type: 'string', size: 255, required: false },
      { key: 'approvedAt', type: 'datetime', required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'contacts',
    name: 'Contacts CRM',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'firstName', type: 'string', size: 100, required: true },
      { key: 'lastName', type: 'string', size: 100, required: true },
      { key: 'email', type: 'string', size: 255, required: false },
      { key: 'phone', type: 'string', size: 20, required: false },
      { key: 'company', type: 'string', size: 255, required: false },
      { key: 'position', type: 'string', size: 100, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'source', type: 'string', size: 100, required: false },
      { key: 'notes', type: 'string', size: 2000, required: false },
      { key: 'ownerId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'courses',
    name: 'Cours de Formation',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'level', type: 'string', size: 50, required: true },
      { key: 'duration', type: 'integer', required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'instructorId', type: 'string', size: 255, required: true },
      { key: 'price', type: 'double', required: false },
      { key: 'enrollmentCount', type: 'integer', required: true, default: 0 },
      { key: 'rating', type: 'double', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'lessons',
    name: 'Leçons',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000, required: true },
      { key: 'courseId', type: 'string', size: 255, required: true },
      { key: 'order', type: 'integer', required: true },
      { key: 'duration', type: 'integer', required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'jobs',
    name: 'Offres d\'Emploi',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'department', type: 'string', size: 100, required: true },
      { key: 'location', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'level', type: 'string', size: 50, required: true },
      { key: 'salary', type: 'string', size: 100, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'requirements', type: 'string', size: 2000, required: false },
      { key: 'benefits', type: 'string', size: 2000, required: false },
      { key: 'createdBy', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'notifications',
    name: 'Notifications',
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'isRead', type: 'boolean', required: true, default: false },
      { key: 'data', type: 'string', size: 2000, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  }
];

// Fonction pour faire une requête HTTP
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Fonction pour créer une collection
async function createCollection(collection) {
  try {
    console.log(`🔄 Création de la collection: ${collection.name}`);
    
    const options = {
      hostname: 'nyc.cloud.appwrite.io',
      port: 443,
      path: `/v1/databases/${DATABASE_ID}/collections`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID
      }
    };

    const data = {
      collectionId: collection.collectionId,
      name: collection.name,
      permissions: collection.permissions
    };

    const response = await makeRequest(options, data);
    
    if (response.status === 201) {
      console.log(`✅ Collection ${collection.name} créée avec l'ID: ${response.data.$id}`);
      
      // Créer les attributs
      for (const attr of collection.attributes) {
        try {
          const attrOptions = {
            hostname: 'nyc.cloud.appwrite.io',
            port: 443,
            path: `/v1/databases/${DATABASE_ID}/collections/${collection.collectionId}/attributes/${attr.type}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': PROJECT_ID
            }
          };

          const attrData = {
            key: attr.key,
            size: attr.size,
            required: attr.required,
            default: attr.default
          };

          const attrResponse = await makeRequest(attrOptions, attrData);
          
          if (attrResponse.status === 201) {
            console.log(`  ✅ Attribut ${attr.key} (${attr.type}) créé`);
          } else {
            console.log(`  ⚠️ Attribut ${attr.key} - Status: ${attrResponse.status}`);
          }
        } catch (attrError) {
          console.log(`  ⚠️ Attribut ${attr.key} existe peut-être déjà`);
        }
      }
      
      console.log(`✅ Collection ${collection.name} configurée avec succès\n`);
    } else {
      console.log(`⚠️ Collection ${collection.name} - Status: ${response.status}`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur création collection ${collection.name}:`, error.message);
  }
}

// Fonction principale
async function setupProductionCollections() {
  console.log('🚀 Configuration des collections Appwrite pour la production...\n');
  console.log('Project ID:', PROJECT_ID);
  console.log('Database ID:', DATABASE_ID);
  console.log('Endpoint:', ENDPOINT);
  console.log('');
  
  // Créer toutes les collections
  for (const collection of collections) {
    await createCollection(collection);
    // Attendre un peu entre les créations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Configuration des collections terminée!');
  console.log('\n📋 Collections créées:');
  collections.forEach(col => {
    console.log(`  - ${col.name} (${col.collectionId})`);
  });
}

// Exécuter le script
setupProductionCollections();
