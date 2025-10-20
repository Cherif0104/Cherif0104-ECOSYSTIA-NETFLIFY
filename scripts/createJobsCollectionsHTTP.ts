/**
 * Script de création des collections Jobs & Applications via HTTP
 * À exécuter avec : npx tsx scripts/createJobsCollectionsHTTP.ts
 */

import { config } from '../config';

const APPWRITE_ENDPOINT = config.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = config.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = config.APPWRITE_DATABASE_ID;
const APPWRITE_API_KEY = config.APPWRITE_API_KEY;

async function createJobsCollections() {
  console.log('🚀 Création des collections Jobs & Applications via HTTP...\n');

  try {
    // ===== COLLECTION: jobs =====
    console.log('📋 Création collection "jobs"...');
    
    const jobsResponse = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        collectionId: 'jobs',
        name: 'Jobs',
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
            key: 'company',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'location',
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
            key: 'department',
            type: 'string',
            size: 100
          },
          {
            key: 'level',
            type: 'string',
            size: 50
          },
          {
            key: 'salaryMin',
            type: 'integer'
          },
          {
            key: 'salaryMax',
            type: 'integer'
          },
          {
            key: 'description',
            type: 'string',
            size: 2000
          },
          {
            key: 'requirements',
            type: 'string',
            size: 2000
          },
          {
            key: 'benefits',
            type: 'string',
            size: 2000
          },
          {
            key: 'skills',
            type: 'string',
            size: 1000
          },
          {
            key: 'deadline',
            type: 'datetime'
          },
          {
            key: 'status',
            type: 'string',
            size: 50,
            required: true
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

    if (jobsResponse.ok) {
      console.log('✅ Collection "jobs" créée avec succès');
    } else {
      const error = await jobsResponse.text();
      console.log('⚠️ Collection "jobs" existe peut-être déjà:', error);
    }

    // ===== COLLECTION: job_applications =====
    console.log('\n📋 Création collection "job_applications"...');
    
    const applicationsResponse = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        collectionId: 'job_applications',
        name: 'Job Applications',
        permissions: [
          'read("any")',
          'create("any")',
          'update("any")',
          'delete("any")'
        ],
        documentSecurity: false,
        attributes: [
          {
            key: 'jobId',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'fullName',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'email',
            type: 'email',
            size: 255,
            required: true
          },
          {
            key: 'phone',
            type: 'string',
            size: 20
          },
          {
            key: 'cvUrl',
            type: 'url',
            size: 500
          },
          {
            key: 'coverLetter',
            type: 'string',
            size: 2000
          },
          {
            key: 'experience',
            type: 'integer'
          },
          {
            key: 'skills',
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
            key: 'notes',
            type: 'string',
            size: 1000
          }
        ]
      })
    });

    if (applicationsResponse.ok) {
      console.log('✅ Collection "job_applications" créée avec succès');
    } else {
      const error = await applicationsResponse.text();
      console.log('⚠️ Collection "job_applications" existe peut-être déjà:', error);
    }

    console.log('\n🎉 Collections Jobs créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log('  - jobs: Collection des offres d\'emploi');
    console.log('  - job_applications: Collection des candidatures');

  } catch (error) {
    console.error('❌ Erreur lors de la création des collections:', error);
    process.exit(1);
  }
}

// Exécuter le script
createJobsCollections();
