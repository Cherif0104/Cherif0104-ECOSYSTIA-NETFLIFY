import { Client, Databases, ID, Permission, Role } from 'appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68ee2dc2001f0f499c02');

const databases = new Databases(client);
const DATABASE_ID = '68ee527d002813e4e0ca';

async function createKeyResultsCollection() {
    try {
        console.log('🔧 Création de la collection key_results...');

        // Créer la collection key_results
        const keyResultsCollection = await databases.createCollection(
            DATABASE_ID,
            'key_results',
            'Key Results',
            [
                {
                    key: 'okr_id',
                    type: 'string',
                    size: 255,
                    required: true,
                    array: false
                },
                {
                    key: 'title',
                    type: 'string',
                    size: 500,
                    required: true,
                    array: false
                },
                {
                    key: 'description',
                    type: 'string',
                    size: 2000,
                    required: false,
                    array: false
                },
                {
                    key: 'target_value',
                    type: 'double',
                    required: true,
                    array: false
                },
                {
                    key: 'current_value',
                    type: 'double',
                    required: true,
                    array: false
                },
                {
                    key: 'unit',
                    type: 'string',
                    size: 50,
                    required: true,
                    array: false
                },
                {
                    key: 'status',
                    type: 'enum',
                    elements: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
                    required: true,
                    array: false
                },
                {
                    key: 'priority',
                    type: 'enum',
                    elements: ['Low', 'Medium', 'High', 'Critical'],
                    required: true,
                    array: false
                },
                {
                    key: 'assigned_to',
                    type: 'string',
                    size: 255,
                    required: false,
                    array: false
                },
                {
                    key: 'due_date',
                    type: 'datetime',
                    required: false,
                    array: false
                },
                {
                    key: 'progress_percentage',
                    type: 'double',
                    required: true,
                    array: false
                },
                {
                    key: 'tags',
                    type: 'string',
                    size: 1000,
                    required: false,
                    array: true
                },
                {
                    key: 'created_by',
                    type: 'string',
                    size: 255,
                    required: true,
                    array: false
                },
                {
                    key: 'updated_by',
                    type: 'string',
                    size: 255,
                    required: false,
                    array: false
                }
            ],
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );

        console.log('✅ Collection key_results créée avec succès !');
        console.log('📊 ID:', keyResultsCollection.$id);

        // Créer des index pour optimiser les requêtes
        console.log('🔍 Création des index...');

        // Index pour okr_id
        await databases.createIndex(
            DATABASE_ID,
            'key_results',
            'idx_okr_id',
            'key',
            ['okr_id']
        );

        // Index pour status
        await databases.createIndex(
            DATABASE_ID,
            'key_results',
            'idx_status',
            'key',
            ['status']
        );

        // Index pour assigned_to
        await databases.createIndex(
            DATABASE_ID,
            'key_results',
            'idx_assigned_to',
            'key',
            ['assigned_to']
        );

        // Index composite pour okr_id + status
        await databases.createIndex(
            DATABASE_ID,
            'key_results',
            'idx_okr_status',
            'key',
            ['okr_id', 'status']
        );

        console.log('✅ Index créés avec succès !');

        return keyResultsCollection;

    } catch (error: any) {
        console.error('❌ Erreur lors de la création de la collection key_results:', error);
        throw error;
    }
}

// Exécuter le script
createKeyResultsCollection()
    .then(() => {
        console.log('🎉 Script terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });
