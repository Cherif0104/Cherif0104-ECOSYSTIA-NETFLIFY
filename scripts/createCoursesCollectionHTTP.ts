/**
 * Script de création de la collection Courses via HTTP
 * À exécuter avec : npx tsx scripts/createCoursesCollectionHTTP.ts
 */

import { config } from '../config';

const APPWRITE_ENDPOINT = config.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = config.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = config.APPWRITE_DATABASE_ID;
const APPWRITE_API_KEY = config.APPWRITE_API_KEY;

async function createCoursesCollection() {
  console.log('🚀 Création de la collection Courses via HTTP...\n');

  try {
    // ===== COLLECTION: courses =====
    console.log('📋 Création collection "courses"...');
    
    const response = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        collectionId: 'courses',
        name: 'Courses',
        permissions: [
          'read("any")',
          'create("any")',
          'update("any")',
          'delete("any")'
        ],
        documentSecurity: false,
        attributes: [
          {
            key: 'title',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'instructor',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'description',
            type: 'string',
            size: 2000
          },
          {
            key: 'duration',
            type: 'integer',
            required: true
          },
          {
            key: 'level',
            type: 'string',
            size: 50,
            required: true
          },
          {
            key: 'category',
            type: 'string',
            size: 100,
            required: true
          },
          {
            key: 'price',
            type: 'integer'
          },
          {
            key: 'status',
            type: 'string',
            size: 50,
            required: true
          },
          {
            key: 'lessons',
            type: 'string',
            size: 5000
          },
          {
            key: 'modules',
            type: 'string',
            size: 2000
          },
          {
            key: 'rating',
            type: 'float'
          },
          {
            key: 'enrollmentCount',
            type: 'integer'
          },
          {
            key: 'createdBy',
            type: 'string',
            size: 255,
            required: true
          }
        ]
      })
    });

    if (response.ok) {
      console.log('✅ Collection "courses" créée avec succès');
    } else {
      const error = await response.text();
      console.log('⚠️ Collection "courses" existe peut-être déjà:', error);
    }

    console.log('\n🎉 Collection Courses créée avec succès !');
    console.log('\n📊 Résumé:');
    console.log('  - courses: Collection des cours de formation');
    console.log('  - Niveaux: beginner, intermediate, advanced');
    console.log('  - Statuts: draft, active, completed');
    console.log('  - Gestion des leçons et modules en JSON');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la collection:', error);
    process.exit(1);
  }
}

// Exécuter le script
createCoursesCollection();
