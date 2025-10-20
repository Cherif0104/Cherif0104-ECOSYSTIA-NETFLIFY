/**
 * Script de création des collections Knowledge Base via HTTP
 * À exécuter avec : npx tsx scripts/createKnowledgeBaseCollectionsHTTP.ts
 */

import { config } from '../config';

const APPWRITE_ENDPOINT = config.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = config.APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = config.APPWRITE_DATABASE_ID;
const APPWRITE_API_KEY = config.APPWRITE_API_KEY;

async function createKnowledgeBaseCollections() {
  console.log('🚀 Création des collections Knowledge Base via HTTP...\n');

  try {
    // ===== COLLECTION: knowledge_articles =====
    console.log('📋 Création collection "knowledge_articles"...');
    
    const articlesResponse = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        collectionId: 'knowledge_articles',
        name: 'Knowledge Articles',
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
            key: 'summary',
            type: 'string',
            size: 500
          },
          {
            key: 'content',
            type: 'string',
            size: 10000,
            required: true
          },
          {
            key: 'categoryId',
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
            key: 'tags',
            type: 'string',
            size: 1000
          },
          {
            key: 'author',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'status',
            type: 'string',
            size: 50,
            required: true
          },
          {
            key: 'views',
            type: 'integer'
          },
          {
            key: 'rating',
            type: 'float'
          },
          {
            key: 'featured',
            type: 'boolean'
          },
          {
            key: 'publishedAt',
            type: 'datetime'
          }
        ]
      })
    });

    if (articlesResponse.ok) {
      console.log('✅ Collection "knowledge_articles" créée avec succès');
    } else {
      const error = await articlesResponse.text();
      console.log('⚠️ Collection "knowledge_articles" existe peut-être déjà:', error);
    }

    // ===== COLLECTION: knowledge_categories =====
    console.log('\n📋 Création collection "knowledge_categories"...');
    
    const categoriesResponse = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        collectionId: 'knowledge_categories',
        name: 'Knowledge Categories',
        permissions: [
          'read("any")',
          'create("any")',
          'update("any")',
          'delete("any")'
        ],
        documentSecurity: false,
        attributes: [
          {
            key: 'name',
            type: 'string',
            size: 255,
            required: true
          },
          {
            key: 'description',
            type: 'string',
            size: 1000
          },
          {
            key: 'color',
            type: 'string',
            size: 50,
            required: true
          },
          {
            key: 'articleCount',
            type: 'integer'
          }
        ]
      })
    });

    if (categoriesResponse.ok) {
      console.log('✅ Collection "knowledge_categories" créée avec succès');
    } else {
      const error = await categoriesResponse.text();
      console.log('⚠️ Collection "knowledge_categories" existe peut-être déjà:', error);
    }

    console.log('\n🎉 Collections Knowledge Base créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log('  - knowledge_articles: Collection des articles de la base de connaissances');
    console.log('  - knowledge_categories: Collection des catégories');

  } catch (error) {
    console.error('❌ Erreur lors de la création des collections:', error);
    process.exit(1);
  }
}

// Exécuter le script
createKnowledgeBaseCollections();
