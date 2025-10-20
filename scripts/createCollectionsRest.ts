/**
 * 🚀 SCRIPT DE CRÉATION DES COLLECTIONS APPWRITE - ECOSYSTIA (API REST)
 * Ce script crée automatiquement toutes les collections via l'API REST
 */

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ee2dc2001f0f499c02';
const APPWRITE_DATABASE_ID = '68ee527d002813e4e0ca';
const APPWRITE_API_KEY = 'standard_02717fc47c45cff4edc16624ae9127ca436dff8bd115037e795dec54eb8c50f53d989078ad57f2ca52daa41ce272dfc205bca21613f2d07c98525613e3da936d71ff2c5804b392c7c79760dcd3c8a7998c1c2078d73bd310b8dde7224c14fb802c5302625bd3a3fca79c7ca5d52b4585dcd959a9810d387a065f2e64af71df38';

interface CollectionSchema {
  id: string;
  name: string;
  attributes: AttributeDefinition[];
}

interface AttributeDefinition {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'email' | 'url';
  size?: number;
  required?: boolean;
  default?: any;
  array?: boolean;
}

const collections: CollectionSchema[] = [
  {
    id: 'users',
    name: 'Users',
    attributes: [
      { key: 'firstName', type: 'string', size: 255, required: true },
      { key: 'lastName', type: 'string', size: 255, required: true },
      { key: 'email', type: 'email', size: 255, required: true },
      { key: 'avatar', type: 'url', size: 500 },
      { key: 'role', type: 'string', size: 50, required: true },
      { key: 'skills', type: 'string', size: 1000 },
      { key: 'phone', type: 'string', size: 20 },
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000 },
      { key: 'status', type: 'string', size: 50, required: true },
      { key: 'priority', type: 'string', size: 50 },
      { key: 'startDate', type: 'string', size: 50 },
      { key: 'endDate', type: 'string', size: 50 },
      { key: 'budget', type: 'float' },
      { key: 'ownerId', type: 'string', size: 50, required: true },
      { key: 'teamMembers', type: 'string', size: 50, array: true },
      { key: 'progress', type: 'integer' },
      { key: 'tags', type: 'string', size: 100, array: true },
      { key: 'category', type: 'string', size: 100 },
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'text', type: 'string', size: 500, required: true },
      { key: 'status', type: 'string', size: 50 },
      { key: 'priority', type: 'string', size: 50 },
      { key: 'assigneeId', type: 'string', size: 50 },
      { key: 'estimatedTime', type: 'float' },
      { key: 'loggedTime', type: 'float' },
      { key: 'dueDate', type: 'string', size: 50 },
    ]
  },
  {
    id: 'courses',
    name: 'Courses',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000 },
      { key: 'instructor', type: 'string', size: 255, required: true },
      { key: 'duration', type: 'string', size: 100 },
      { key: 'level', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'enrolled', type: 'integer' },
      { key: 'roleId', type: 'string', size: 100 },
    ]
  },
  {
    id: 'jobs',
    name: 'Jobs',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000 },
      { key: 'company', type: 'string', size: 255 },
      { key: 'location', type: 'string', size: 255 },
      { key: 'salary', type: 'float' },
      { key: 'type', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'requirements', type: 'string', size: 2000 },
    ]
  },
  {
    id: 'invoices',
    name: 'Invoices',
    attributes: [
      { key: 'invoiceNumber', type: 'string', size: 100, required: true },
      { key: 'clientName', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'dueDate', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50 },
      { key: 'recurringSourceId', type: 'integer' },
    ]
  },
  {
    id: 'expenses',
    name: 'Expenses',
    attributes: [
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'date', type: 'string', size: 50, required: true },
      { key: 'dueDate', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'budgetItemId', type: 'string', size: 50 },
      { key: 'recurringSourceId', type: 'integer' },
    ]
  },
  {
    id: 'time_logs',
    name: 'Time Logs',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'projectId', type: 'string', size: 50 },
      { key: 'courseId', type: 'string', size: 50 },
      { key: 'taskId', type: 'string', size: 50 },
      { key: 'taskDescription', type: 'string', size: 500 },
      { key: 'hours', type: 'float', required: true },
      { key: 'date', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 1000 },
    ]
  },
  {
    id: 'leave_requests',
    name: 'Leave Requests',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'userName', type: 'string', size: 255, required: true },
      { key: 'userAvatar', type: 'url', size: 500 },
      { key: 'type', type: 'string', size: 100, required: true },
      { key: 'startDate', type: 'string', size: 50, required: true },
      { key: 'endDate', type: 'string', size: 50, required: true },
      { key: 'reason', type: 'string', size: 1000 },
      { key: 'status', type: 'string', size: 50 },
    ]
  },
  {
    id: 'contacts',
    name: 'Contacts',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'workEmail', type: 'email', size: 255 },
      { key: 'personalEmail', type: 'email', size: 255 },
      { key: 'company', type: 'string', size: 255 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'avatar', type: 'url', size: 500 },
      { key: 'officePhone', type: 'string', size: 20 },
      { key: 'mobilePhone', type: 'string', size: 20 },
      { key: 'whatsappNumber', type: 'string', size: 20 },
    ]
  },
  {
    id: 'documents',
    name: 'Documents',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000, required: true },
      { key: 'createdAt', type: 'string', size: 50 },
      { key: 'createdBy', type: 'string', size: 255 },
    ]
  },
  {
    id: 'risks',
    name: 'Risks',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'impact', type: 'string', size: 50 },
      { key: 'probability', type: 'string', size: 50 },
      { key: 'mitigationStrategy', type: 'string', size: 1000 },
    ]
  },
  {
    id: 'objectives',
    name: 'Objectives',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'targetDate', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'progress', type: 'integer' },
    ]
  },
  {
    id: 'meetings',
    name: 'Meetings',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'date', type: 'string', size: 50, required: true },
      { key: 'duration', type: 'integer' },
      { key: 'participants', type: 'string', size: 50, array: true },
      { key: 'projectId', type: 'string', size: 50 },
    ]
  },
  {
    id: 'notifications',
    name: 'Notifications',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50 },
      { key: 'read', type: 'boolean' },
      { key: 'createdAt', type: 'string', size: 50 },
    ]
  },
  {
    id: 'lessons',
    name: 'Lessons',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000 },
      { key: 'order', type: 'integer' },
      { key: 'duration', type: 'integer' },
      { key: 'videoUrl', type: 'url', size: 500 },
    ]
  },
  {
    id: 'modules',
    name: 'Modules',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'order', type: 'integer' },
      { key: 'duration', type: 'integer' },
    ]
  },
  {
    id: 'course_enrollments',
    name: 'Course Enrollments',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'enrolledDate', type: 'string', size: 50, required: true },
      { key: 'progress', type: 'integer' },
      { key: 'completedLessons', type: 'string', size: 50, array: true },
      { key: 'status', type: 'string', size: 50 },
      { key: 'completionDate', type: 'string', size: 50 },
    ]
  },
  {
    id: 'budget_items',
    name: 'Budget Items',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500 },
      { key: 'budgetedAmount', type: 'float', required: true },
      { key: 'actualAmount', type: 'float' },
      { key: 'status', type: 'string', size: 50 },
    ]
  },
  {
    id: 'recurring_sources',
    name: 'Recurring Sources',
    attributes: [
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'frequency', type: 'string', size: 50, required: true },
      { key: 'nextDate', type: 'string', size: 50 },
      { key: 'active', type: 'boolean' },
    ]
  },
  {
    id: 'goals',
    name: 'Goals',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'targetDate', type: 'string', size: 50 },
      { key: 'status', type: 'string', size: 50 },
      { key: 'progress', type: 'integer' },
    ]
  },
];

async function makeRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Appwrite-Key': APPWRITE_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function createCollection(collection: CollectionSchema): Promise<void> {
  const url = `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`;
  
  const body = {
    collectionId: collection.id,
    name: collection.name,
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")'
    ]
  };

  try {
    await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    console.log(`✅ Collection créée: ${collection.name}`);
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('409')) {
      console.log(`⚠️  Collection existe déjà: ${collection.name}`);
    } else {
      console.error(`❌ Erreur collection ${collection.name}:`, error.message);
      throw error;
    }
  }
}

async function createAttribute(collectionId: string, attr: AttributeDefinition): Promise<void> {
  const url = `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/attributes/${attr.type}`;
  
  let body: any = {
    key: attr.key,
    required: attr.required || false,
  };

  if (attr.type === 'string') {
    body.size = attr.size || 255;
    body.array = attr.array || false;
  }

  if (attr.default !== undefined) {
    body.default = attr.default;
  }

  try {
    await makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    console.log(`  ✅ Attribut créé: ${attr.key}`);
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('409')) {
      console.log(`  ⚠️  Attribut existe déjà: ${attr.key}`);
    } else {
      console.error(`  ❌ Erreur attribut ${attr.key}:`, error.message);
    }
  }
}

async function createAllCollections(): Promise<void> {
  console.log('🚀 CRÉATION DES COLLECTIONS APPWRITE (API REST)\n');

  for (const collection of collections) {
    console.log(`📂 Création collection: ${collection.name} (${collection.id})`);

    try {
      // Créer la collection
      await createCollection(collection);
      
      // Attendre un peu pour éviter les rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Créer les attributs
      for (const attr of collection.attributes) {
        await createAttribute(collection.id, attr);
        // Attendre un peu entre chaque attribut
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`✅ Tous les attributs créés pour ${collection.name}\n`);

    } catch (error: any) {
      console.error(`❌ Erreur fatale pour ${collection.name}:`, error.message);
      console.log('');
    }
  }

  console.log('\n🎉 CRÉATION TERMINÉE !');
  console.log('\n📋 RÉSUMÉ:');
  console.log(`  • ${collections.length} collections configurées`);
  console.log(`  • Base de données: ${APPWRITE_DATABASE_ID}`);
  console.log(`  • Project: ${APPWRITE_PROJECT_ID}\n`);
}

// Exécuter le script
createAllCollections()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
