/**
 * Script de création de la collection Courses
 * À exécuter avec : npx tsx scripts/createCoursesCollection.ts
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';
import { config } from '../config';

// Configuration Appwrite
const client = new Client()
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const DATABASE_ID = config.APPWRITE_DATABASE_ID;

async function createCoursesCollection() {
  console.log('🚀 Création de la collection Courses...\n');

  try {
    // ===== COLLECTION: courses =====
    console.log('📋 Création collection "courses"...');
    
    const coursesCollection = await databases.createCollection(
      DATABASE_ID,
      'courses',
      'courses',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection "courses" créée:', coursesCollection.$id);

    // Attributs de la collection courses
    const attributes = [
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'instructor', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 10000, required: true },
      { key: 'duration', type: 'integer', required: true }, // en minutes
      { key: 'level', type: 'enum', elements: ['beginner', 'intermediate', 'advanced'], required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'status', type: 'enum', elements: ['draft', 'active', 'completed'], required: true },
      { key: 'rating', type: 'integer', required: false, default: 0 },
      { key: 'studentsCount', type: 'integer', required: false, default: 0 },
      { key: 'price', type: 'integer', required: true },
      { key: 'icon', type: 'string', size: 100, required: false },
      { key: 'lessons', type: 'string', size: 50000, required: false }, // JSON stringifié
      { key: 'modules', type: 'string', size: 50000, required: false } // JSON stringifié
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'courses',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID,
            'courses',
            attr.key,
            attr.elements,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'courses',
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.default
          );
        }
        console.log(`  ✅ Attribut "${attr.key}" créé`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`  ❌ Erreur création attribut "${attr.key}":`, error.message);
      }
    }

    console.log('✅ Tous les attributs de "courses" créés\n');

    // Créer les index
    console.log('📋 Création des index...');
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'courses',
        'category_index',
        'key',
        ['category'],
        ['ASC']
      );
      console.log('  ✅ Index "category_index" créé');
      
      await databases.createIndex(
        DATABASE_ID,
        'courses',
        'status_index',
        'key',
        ['status'],
        ['ASC']
      );
      console.log('  ✅ Index "status_index" créé');
    } catch (error: any) {
      console.error('  ❌ Erreur création index:', error.message);
    }

    console.log('\n🎉 Collection Courses créée avec succès!');
    console.log('📊 Note: La collection course_enrollments existe déjà pour gérer les inscriptions');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création de la collection:', error.message);
    throw error;
  }
}

// Exécuter le script
createCoursesCollection()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script échoué:', error);
    process.exit(1);
  });

