/**
 * 🚀 SCRIPT DE CRÉATION DES COLLECTIONS APPWRITE - ECOSYSTIA
 * Ce script crée automatiquement toutes les collections nécessaires
 * 
 * IMPORTANT: Ce script utilise l'API Key et doit être exécuté côté serveur uniquement
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';

// Configuration depuis .env
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68ee2dc2001f0f499c02';
const APPWRITE_DATABASE_ID = '68ee527d002813e4e0ca';
const APPWRITE_API_KEY = 'standard_fb504064b1c31c135a7a0cf25d87a6e60f5f075bf7f272b246bf57e09df00c3e4244ca6fd1a609a8a5d991427616aace7e732b4937a243fd501b97d826d59497b397efcbf11afe781a7b3b35f0aca2ad0f774831209617480df32a38ab24f0d76b11d72cb984680109fffc729b7fa1ce7cac199e6159707d56bd3738511701e3';

// Configuration du client Appwrite pour les scripts serveur
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Pour les scripts serveur, on utilise l'API Key dans les headers des requêtes
const databases = new Databases(client);
const databaseId = APPWRITE_DATABASE_ID;

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

async function createAttribute(
  databaseId: string,
  collectionId: string,
  attr: AttributeDefinition
): Promise<void> {
  try {
    switch (attr.type) {
      case 'string':
        await databases.createStringAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.size || 255,
          attr.required || false,
          attr.default,
          attr.array || false
        );
        break;
      case 'integer':
        await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required || false,
          undefined,
          undefined,
          attr.default
        );
        break;
      case 'float':
        await databases.createFloatAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required || false,
          undefined,
          undefined,
          attr.default
        );
        break;
      case 'boolean':
        await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required || false,
          attr.default
        );
        break;
      case 'email':
        await databases.createEmailAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required || false,
          attr.default
        );
        break;
      case 'url':
        await databases.createUrlAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.required || false,
          attr.default
        );
        break;
    }
    console.log(`  ✅ Attribut créé: ${attr.key}`);
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log(`  ⚠️  Attribut existe déjà: ${attr.key}`);
    } else {
      console.error(`  ❌ Erreur attribut ${attr.key}:`, error.message);
    }
  }
}

async function createAllCollections(): Promise<void> {
  console.log('🚀 CRÉATION DES COLLECTIONS APPWRITE\n');

  for (const collection of collections) {
    console.log(`📂 Création collection: ${collection.name} (${collection.id})`);

    try {
      // Créer la collection
      await databases.createCollection(
        databaseId,
        collection.id,
        collection.name,
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log(`✅ Collection créée: ${collection.name}\n`);

      // Attendre un peu pour éviter les rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Créer les attributs
      for (const attr of collection.attributes) {
        await createAttribute(databaseId, collection.id, attr);
        // Attendre un peu entre chaque attribut
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`✅ Tous les attributs créés pour ${collection.name}\n`);

    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  Collection existe déjà: ${collection.name}`);
        
        // Essayer de créer les attributs manquants
        console.log('  Vérification des attributs...');
        for (const attr of collection.attributes) {
          await createAttribute(databaseId, collection.id, attr);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        console.log('');
      } else {
        console.error(`❌ Erreur collection ${collection.name}:`, error.message);
        console.log('');
      }
    }
  }

  console.log('\n🎉 CRÉATION TERMINÉE !');
  console.log('\n📋 RÉSUMÉ:');
  console.log(`  • ${collections.length} collections configurées`);
  console.log(`  • Base de données: ${databaseId}`);
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


