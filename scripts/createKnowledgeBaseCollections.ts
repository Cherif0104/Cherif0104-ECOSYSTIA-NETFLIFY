/**
 * Script de création des collections Knowledge Base
 * À exécuter avec : npx tsx scripts/createKnowledgeBaseCollections.ts
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';
import { config } from '../config';

// Configuration Appwrite
const client = new Client()
  .setEndpoint(config.APPWRITE_ENDPOINT)
  .setProject(config.APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const DATABASE_ID = config.APPWRITE_DATABASE_ID;

async function createKnowledgeBaseCollections() {
  console.log('🚀 Création des collections Knowledge Base...\n');

  try {
    // ===== COLLECTION: knowledge_articles =====
    console.log('📋 Création collection "knowledge_articles"...');
    
    const articlesCollection = await databases.createCollection(
      DATABASE_ID,
      'knowledge_articles',
      'knowledge_articles',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection "knowledge_articles" créée:', articlesCollection.$id);

    // Attributs de la collection knowledge_articles
    const articlesAttributes = [
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'content', type: 'string', size: 50000, required: true },
      { key: 'summary', type: 'string', size: 500, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'type', type: 'enum', elements: ['article', 'tutorial', 'faq', 'guide'], required: true },
      { key: 'status', type: 'enum', elements: ['published', 'draft', 'archived'], required: true },
      { key: 'tags', type: 'string', size: 100, required: false, array: true },
      { key: 'author', type: 'string', size: 255, required: true },
      { key: 'views', type: 'integer', required: false, default: 0 },
      { key: 'rating', type: 'integer', required: false, default: 0 },
      { key: 'helpful', type: 'integer', required: false, default: 0 },
      { key: 'lastViewed', type: 'string', size: 50, required: false }
    ];

    for (const attr of articlesAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'knowledge_articles',
            attr.key,
            attr.size,
            attr.required,
            undefined,
            attr.array || false
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID,
            'knowledge_articles',
            attr.key,
            attr.elements,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'knowledge_articles',
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

    console.log('✅ Tous les attributs de "knowledge_articles" créés\n');

    // ===== COLLECTION: knowledge_categories =====
    console.log('📋 Création collection "knowledge_categories"...');
    
    const categoriesCollection = await databases.createCollection(
      DATABASE_ID,
      'knowledge_categories',
      'knowledge_categories',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Collection "knowledge_categories" créée:', categoriesCollection.$id);

    // Attributs de la collection knowledge_categories
    const categoriesAttributes = [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'color', type: 'enum', elements: ['blue', 'green', 'purple', 'orange', 'red'], required: true },
      { key: 'articleCount', type: 'integer', required: false, default: 0 }
    ];

    for (const attr of categoriesAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            'knowledge_categories',
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === 'enum') {
          await databases.createEnumAttribute(
            DATABASE_ID,
            'knowledge_categories',
            attr.key,
            attr.elements,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            'knowledge_categories',
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

    console.log('✅ Tous les attributs de "knowledge_categories" créés\n');

    // Créer les index
    console.log('📋 Création des index...');
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        'knowledge_articles',
        'category_index',
        'key',
        ['category'],
        ['ASC']
      );
      console.log('  ✅ Index "category_index" créé');
    } catch (error: any) {
      console.error('  ❌ Erreur création index:', error.message);
    }

    console.log('\n🎉 Collections Knowledge Base créées avec succès!');
    console.log('📊 Collections créées:');
    console.log('  - knowledge_articles');
    console.log('  - knowledge_categories');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création des collections:', error.message);
    throw error;
  }
}

// Exécuter le script
createKnowledgeBaseCollections()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script échoué:', error);
    process.exit(1);
  });

