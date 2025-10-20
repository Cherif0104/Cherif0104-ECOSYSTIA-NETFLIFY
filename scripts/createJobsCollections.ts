/**
 * Script de création des collections Jobs & Applications
 * À exécuter avec : npx tsx scripts/createJobsCollections.ts
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';
import { config } from '../config';

// Configuration Appwrite
const client = new Client()
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const DATABASE_ID = config.APPWRITE_DATABASE_ID;

async function createJobsCollections() {
  console.log('🚀 Création des collections Jobs & Applications...\n');

  try {
    // ===== COLLECTION: jobs =====
    console.log('📋 Création collection "jobs"...');
    
    const jobsCollection = await databases.createCollection(
      DATABASE_ID,
      'jobs',
      'jobs',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection "jobs" créée:', jobsCollection.$id);

    // Attributs de la collection jobs
    const jobsAttributes = [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'company', type: 'string', size: 255, required: true },
      { key: 'location', type: 'string', size: 255, required: true },
      { key: 'type', type: 'enum', elements: ['Full-time', 'Part-time', 'Contract', 'CDI', 'CDD'], required: true },
      { key: 'postedDate', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 10000, required: true },
      { key: 'requiredSkills', type: 'string', size: 5000, required: false, array: true },
      { key: 'department', type: 'string', size: 100, required: true },
      { key: 'level', type: 'enum', elements: ['junior', 'intermediate', 'senior', 'expert'], required: true },
      { key: 'salary', type: 'string', size: 500, required: true }, // JSON stringifié
      { key: 'status', type: 'enum', elements: ['open', 'closed', 'paused'], required: true },
      { key: 'requirements', type: 'string', size: 5000, required: false, array: true },
      { key: 'benefits', type: 'string', size: 5000, required: false, array: true },
      { key: 'applicationsCount', type: 'integer', required: false, default: 0 },
      { key: 'deadline', type: 'string', size: 50, required: true }
    ];

    for (const attr of jobsAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.size,
            attr.required,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.elements,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'jobs',
            attr.key,
            attr.required,
            undefined,
            undefined,
            attr.default
          );
        }
        console.log(`  ✅ Attribut "${attr.key}" créé`);
        
        // Attendre un peu entre chaque attribut
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`  ❌ Erreur création attribut "${attr.key}":`, error.message);
      }
    }

    console.log('✅ Tous les attributs de "jobs" créés\n');

    // ===== COLLECTION: job_applications =====
    console.log('📋 Création collection "job_applications"...');
    
    const applicationsCollection = await databases.createCollection(
      DATABASE_ID,
      'job_applications',
      'job_applications',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection "job_applications" créée:', applicationsCollection.$id);

    // Attributs de la collection job_applications
    const applicationsAttributes = [
      { key: 'jobId', type: 'string', size: 100, required: true },
      { key: 'candidateName', type: 'string', size: 255, required: true },
      { key: 'candidateEmail', type: 'string', size: 255, required: true },
      { key: 'candidatePhone', type: 'string', size: 50, required: true },
      { key: 'resume', type: 'string', size: 1000, required: true },
      { key: 'coverLetter', type: 'string', size: 10000, required: true },
      { key: 'status', type: 'enum', elements: ['pending', 'reviewed', 'interviewed', 'accepted', 'rejected'], required: true },
      { key: 'experience', type: 'integer', required: true },
      { key: 'skills', type: 'string', size: 100, required: false, array: true },
      { key: 'appliedAt', type: 'string', size: 50, required: true },
      { key: 'notes', type: 'string', size: 5000, required: false }
    ];

    for (const attr of applicationsAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'job_applications',
            attr.key,
            attr.size,
            attr.required,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID,
            'job_applications',
            attr.key,
            attr.elements,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'job_applications',
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

    console.log('✅ Tous les attributs de "job_applications" créés\n');

    // Créer les index
    console.log('📋 Création des index...');
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'job_applications',
        'jobId_index',
        'key',
        ['jobId'],
        ['ASC']
      );
      console.log('  ✅ Index "jobId_index" créé');
    } catch (error: any) {
      console.error('  ❌ Erreur création index:', error.message);
    }

    console.log('\n🎉 Collections Jobs créées avec succès!');
    console.log('📊 Collections créées:');
    console.log('  - jobs');
    console.log('  - job_applications');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création des collections:', error.message);
    throw error;
  }
}

// Exécuter le script
createJobsCollections()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script échoué:', error);
    process.exit(1);
  });

