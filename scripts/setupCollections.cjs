const { Client, Databases, ID, Permission, Role } = require('appwrite');

// Configuration Appwrite
const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6737b2b4b5a5a5a5a5a5a5a5');

const databases = new Databases(client);
const DATABASE_ID = '6737b2b4b5a5a5a5a5a5a5a6';

// Collections à créer pour la production
const collections = [
  {
    collectionId: 'users',
    name: 'Utilisateurs',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
    collectionId: 'time_entries',
    name: 'Entrées de Temps',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
    collectionId: 'interactions',
    name: 'Interactions Commerciales',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'contactId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'subject', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'date', type: 'datetime', required: true },
      { key: 'outcome', type: 'string', size: 100, required: false },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'articles',
    name: 'Articles Base de Connaissances',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'authorId', type: 'string', size: 255, required: true },
      { key: 'views', type: 'integer', required: true, default: 0 },
      { key: 'rating', type: 'double', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'courses',
    name: 'Cours de Formation',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
    collectionId: 'applications',
    name: 'Candidatures',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'jobId', type: 'string', size: 255, required: true },
      { key: 'candidateName', type: 'string', size: 255, required: true },
      { key: 'candidateEmail', type: 'string', size: 255, required: true },
      { key: 'candidatePhone', type: 'string', size: 20, required: false },
      { key: 'resumeUrl', type: 'string', size: 500, required: false },
      { key: 'coverLetter', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'notes', type: 'string', size: 1000, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ]
  },
  {
    collectionId: 'notifications',
    name: 'Notifications',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
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
  },
  {
    collectionId: 'audit_logs',
    name: 'Logs d\'Audit',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'action', type: 'string', size: 100, required: true },
      { key: 'resource', type: 'string', size: 100, required: true },
      { key: 'resourceId', type: 'string', size: 255, required: false },
      { key: 'details', type: 'string', size: 2000, required: false },
      { key: 'ipAddress', type: 'string', size: 45, required: false },
      { key: 'userAgent', type: 'string', size: 500, required: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  }
];

// Fonction pour créer une collection
async function createCollection(collection) {
  try {
    console.log(`🔄 Création de la collection: ${collection.name}`);
    
    // Créer la collection
    const createdCollection = await databases.createCollection(
      DATABASE_ID,
      collection.collectionId,
      collection.name,
      collection.permissions
    );
    
    console.log(`✅ Collection ${collection.name} créée avec l'ID: ${createdCollection.$id}`);
    
    // Créer les attributs
    for (const attr of collection.attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            collection.collectionId,
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collection.collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            collection.collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collection.collectionId,
            attr.key,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            collection.collectionId,
            attr.key,
            attr.required
          );
        }
        
        console.log(`  ✅ Attribut ${attr.key} (${attr.type}) créé`);
      } catch (attrError) {
        if (attrError.code === 409) {
          console.log(`  ⚠️ Attribut ${attr.key} existe déjà`);
        } else {
          console.error(`  ❌ Erreur création attribut ${attr.key}:`, attrError.message);
        }
      }
    }
    
    console.log(`✅ Collection ${collection.name} configurée avec succès\n`);
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️ Collection ${collection.name} existe déjà\n`);
    } else {
      console.error(`❌ Erreur création collection ${collection.name}:`, error.message);
    }
  }
}

// Fonction principale
async function setupProductionCollections() {
  console.log('🚀 Configuration des collections Appwrite pour la production...\n');
  
  try {
    // Vérifier la connexion
    await databases.list(DATABASE_ID);
    console.log('✅ Connexion à Appwrite réussie\n');
    
    // Créer toutes les collections
    for (const collection of collections) {
      await createCollection(collection);
    }
    
    console.log('🎉 Configuration des collections terminée avec succès!');
    console.log('\n📋 Collections créées:');
    collections.forEach(col => {
      console.log(`  - ${col.name} (${col.collectionId})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
  }
}

// Exécuter le script
setupProductionCollections();
