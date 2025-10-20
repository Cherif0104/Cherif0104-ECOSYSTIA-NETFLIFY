const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function populateKnowledgeBaseData() {
    console.log("📚 PEUPLEMENT DONNÉES KNOWLEDGE BASE");
    console.log("====================================\n");

    let contactUser = null;

    try {
        // 1. Récupérer l'utilisateur CONTACT
        console.log("1️⃣ Récupération utilisateur CONTACT...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .ilike('email', 'contact@senegel.org');

        if (usersError) throw usersError;
        if (users.length === 0) {
            console.error("❌ Utilisateur CONTACT non trouvé. Veuillez vous assurer qu'il existe.");
            return;
        }
        contactUser = users[0];
        console.log(`✅ Utilisateur: ${contactUser.first_name} ${contactUser.last_name} (${contactUser.id})\n`);

        const userId = contactUser.id;

        // 2. Création de catégories
        console.log("2️⃣ Création de catégories...");
        const categories = [
            {
                name: 'Développement',
                description: 'Articles et guides sur le développement logiciel',
                color: '#3B82F6',
                icon: 'code',
                user_id: userId
            },
            {
                name: 'Gestion de Projet',
                description: 'Méthodologies et outils de gestion de projet',
                color: '#10B981',
                icon: 'chart-bar',
                user_id: userId
            },
            {
                name: 'Ressources Humaines',
                description: 'Politiques et procédures RH',
                color: '#F59E0B',
                icon: 'users',
                user_id: userId
            },
            {
                name: 'Support Technique',
                description: 'FAQ et solutions techniques',
                color: '#EF4444',
                icon: 'wrench-screwdriver',
                user_id: userId
            }
        ];

        for (const category of categories) {
            const { data: createdCategory, error: categoryError } = await supabase
                .from('knowledge_categories')
                .insert([category])
                .select()
                .single();

            if (categoryError) {
                console.error(`❌ Erreur création catégorie ${category.name}:`, categoryError.message);
            } else {
                console.log(`✅ Catégorie créée: ${createdCategory.name}`);
            }
        }

        // 3. Création d'articles
        console.log("\n3️⃣ Création d'articles...");
        const articles = [
            {
                title: 'Guide de Développement React',
                content: 'Ce guide complet couvre les concepts fondamentaux de React, incluant les composants, les hooks, la gestion d\'état, et les meilleures pratiques de développement.',
                summary: 'Introduction complète au développement avec React',
                category: 'Développement',
                type: 'tutorial',
                status: 'published',
                tags: ['react', 'javascript', 'frontend', 'tutorial'],
                author: `${contactUser.first_name} ${contactUser.last_name}`,
                views: 25,
                rating: 4.5,
                helpful: 8,
                user_id: userId
            },
            {
                title: 'Méthodologie Agile - Guide Pratique',
                content: 'Découvrez comment implémenter efficacement les méthodologies agiles dans vos projets. Ce guide couvre Scrum, Kanban, et les cérémonies essentielles.',
                summary: 'Guide pratique pour l\'implémentation des méthodologies agiles',
                category: 'Gestion de Projet',
                type: 'guide',
                status: 'published',
                tags: ['agile', 'scrum', 'kanban', 'gestion-projet'],
                author: `${contactUser.first_name} ${contactUser.last_name}`,
                views: 18,
                rating: 4.2,
                helpful: 5,
                user_id: userId
            },
            {
                title: 'FAQ - Problèmes de Connexion',
                content: 'Solutions aux problèmes de connexion les plus courants. Inclut le dépannage des erreurs de réseau, les problèmes d\'authentification, et les solutions de contournement.',
                summary: 'Solutions aux problèmes de connexion fréquents',
                category: 'Support Technique',
                type: 'faq',
                status: 'published',
                tags: ['connexion', 'réseau', 'authentification', 'dépannage'],
                author: `${contactUser.first_name} ${contactUser.last_name}`,
                views: 42,
                rating: 4.8,
                helpful: 12,
                user_id: userId
            },
            {
                title: 'Politique de Télétravail',
                content: 'Document officiel définissant les règles et procédures pour le télétravail dans l\'organisation. Inclut les horaires, les outils, et les attentes.',
                summary: 'Politique officielle de télétravail',
                category: 'Ressources Humaines',
                type: 'article',
                status: 'published',
                tags: ['télétravail', 'politique', 'rh', 'organisation'],
                author: `${contactUser.first_name} ${contactUser.last_name}`,
                views: 15,
                rating: 4.0,
                helpful: 3,
                user_id: userId
            },
            {
                title: 'Tutoriel TypeScript Avancé',
                content: 'Tutoriel approfondi sur TypeScript couvrant les types avancés, les génériques, les décorateurs, et l\'intégration avec React.',
                summary: 'Tutoriel avancé sur TypeScript',
                category: 'Développement',
                type: 'tutorial',
                status: 'draft',
                tags: ['typescript', 'javascript', 'tutorial', 'avancé'],
                author: `${contactUser.first_name} ${contactUser.last_name}`,
                views: 0,
                rating: 0,
                helpful: 0,
                user_id: userId
            },
            {
                title: 'Guide de Gestion des Équipes',
                content: 'Guide complet sur la gestion d\'équipes, incluant la communication, la motivation, la résolution de conflits, et le leadership.',
                summary: 'Guide pratique pour la gestion d\'équipes',
                category: 'Ressources Humaines',
                type: 'guide',
                status: 'published',
                tags: ['gestion-équipe', 'leadership', 'communication', 'management'],
                author: `${contactUser.first_name} ${contactUser.last_name}`,
                views: 32,
                rating: 4.6,
                helpful: 7,
                user_id: userId
            }
        ];

        for (const article of articles) {
            const { data: createdArticle, error: articleError } = await supabase
                .from('knowledge_articles')
                .insert([article])
                .select()
                .single();

            if (articleError) {
                console.error(`❌ Erreur création article ${article.title}:`, articleError.message);
            } else {
                console.log(`✅ Article créé: ${createdArticle.title}`);
            }
        }

        console.log("\n🎉 PEUPLEMENT TERMINÉ !");
        console.log("✅ Données Knowledge Base créées pour l'utilisateur CONTACT");
        console.log(`   - ${categories.length} catégorie(s)`);
        console.log(`   - ${articles.length} article(s)`);

        // 4. Vérification des données
        console.log("\n4️⃣ Vérification des données...");
        const { data: categoriesCount } = await supabase.from('knowledge_categories').select('id').eq('user_id', userId);
        const { data: articlesCount } = await supabase.from('knowledge_articles').select('id').eq('user_id', userId);

        console.log(`📊 Résumé pour CONTACT:`);
        console.log(`   - Catégories: ${categoriesCount ? categoriesCount.length : 0}`);
        console.log(`   - Articles: ${articlesCount ? articlesCount.length : 0}`);

    } catch (error) {
        console.error("❌ Erreur lors du peuplement des données:", error.message || error);
    }
}

populateKnowledgeBaseData();
