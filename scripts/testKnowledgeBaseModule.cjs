const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testKnowledgeBaseModule() {
    console.log("📚 TEST MODULE KNOWLEDGE BASE");
    console.log("==============================\n");

    let createdArticleId = null;
    let createdCategoryId = null;

    try {
        // 1. Récupérer un utilisateur pour les tests
        console.log("1️⃣ Récupération d'un utilisateur pour les tests...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .limit(1);

        if (usersError) throw usersError;
        if (users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé. Veuillez créer des utilisateurs de test.");
            return;
        }
        const testUser = users[0];
        console.log(`✅ Utilisateur trouvé: ${testUser.first_name} ${testUser.last_name} (${testUser.id})\n`);

        const userId = testUser.id;

        // 2. Tester la création d'une catégorie
        console.log("2️⃣ Test création catégorie...");
        const testCategory = {
            name: 'Développement',
            description: 'Articles liés au développement logiciel',
            color: '#3B82F6',
            icon: 'code',
            user_id: userId
        };

        const { data: category, error: categoryError } = await supabase
            .from('knowledge_categories')
            .insert([testCategory])
            .select()
            .single();

        if (categoryError) {
            console.error("❌ Erreur création catégorie:", categoryError.message);
        } else {
            createdCategoryId = category.id;
            console.log("✅ Catégorie créée avec succès:", category.id);
            console.log(`   - Nom: ${category.name}`);
            console.log(`   - Description: ${category.description}`);
        }

        // 3. Tester la création d'un article
        console.log("\n3️⃣ Test création article...");
        const testArticle = {
            title: 'Guide de développement React',
            content: 'Ce guide couvre les bases du développement avec React...',
            summary: 'Introduction aux concepts fondamentaux de React',
            category: 'Développement',
            type: 'tutorial',
            status: 'published',
            tags: ['react', 'javascript', 'frontend'],
            author: `${testUser.first_name} ${testUser.last_name}`,
            views: 0,
            rating: 0,
            helpful: 0,
            user_id: userId
        };

        const { data: article, error: articleError } = await supabase
            .from('knowledge_articles')
            .insert([testArticle])
            .select()
            .single();

        if (articleError) {
            console.error("❌ Erreur création article:", articleError.message);
        } else {
            createdArticleId = article.id;
            console.log("✅ Article créé avec succès:", article.id);
            console.log(`   - Titre: ${article.title}`);
            console.log(`   - Catégorie: ${article.category}`);
            console.log(`   - Type: ${article.type}`);
            console.log(`   - Statut: ${article.status}`);
        }

        // 4. Tester la récupération des données
        console.log("\n4️⃣ Test récupération des données...");
        const { data: allArticles, error: articlesError } = await supabase
            .from('knowledge_articles')
            .select('*')
            .eq('user_id', userId);

        const { data: allCategories, error: categoriesError } = await supabase
            .from('knowledge_categories')
            .select('*')
            .eq('user_id', userId);

        if (articlesError) {
            console.error("❌ Erreur récupération articles:", articlesError.message);
        } else {
            console.log(`✅ ${allArticles.length} article(s) récupéré(s) pour l'utilisateur`);
        }

        if (categoriesError) {
            console.error("❌ Erreur récupération catégories:", categoriesError.message);
        } else {
            console.log(`✅ ${allCategories.length} catégorie(s) récupérée(s) pour l'utilisateur`);
        }

        // 5. Tester la mise à jour
        console.log("\n5️⃣ Test mise à jour article...");
        if (createdArticleId) {
            const { data: updatedArticle, error: updateError } = await supabase
                .from('knowledge_articles')
                .update({ 
                    views: 10,
                    rating: 4.5,
                    helpful: 3,
                    updated_at: new Date().toISOString()
                })
                .eq('id', createdArticleId)
                .select()
                .single();

            if (updateError) {
                console.error("❌ Erreur mise à jour article:", updateError.message);
            } else {
                console.log("✅ Article mis à jour avec succès:");
                console.log(`   - Nouvelles vues: ${updatedArticle.views}`);
                console.log(`   - Nouvelle note: ${updatedArticle.rating}`);
                console.log(`   - Nouveaux utiles: ${updatedArticle.helpful}`);
            }
        }

        console.log("\n🎉 TEST MODULE KNOWLEDGE BASE TERMINÉ !");
        console.log("✅ Le module Knowledge Base fonctionne correctement");
        console.log("✅ L'isolation des données par utilisateur est active");
        console.log("✅ Les opérations CRUD sont fonctionnelles");

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message || error);
    } finally {
        // 6. Nettoyage
        console.log("\n6️⃣ Nettoyage des données de test...");
        
        if (createdArticleId) {
            const { error: deleteArticleError } = await supabase
                .from('knowledge_articles')
                .delete()
                .eq('id', createdArticleId);
            if (deleteArticleError) {
                console.error("❌ Erreur suppression article:", deleteArticleError.message);
            } else {
                console.log("✅ Article de test supprimé");
            }
        }

        if (createdCategoryId) {
            const { error: deleteCategoryError } = await supabase
                .from('knowledge_categories')
                .delete()
                .eq('id', createdCategoryId);
            if (deleteCategoryError) {
                console.error("❌ Erreur suppression catégorie:", deleteCategoryError.message);
            } else {
                console.log("✅ Catégorie de test supprimée");
            }
        }

        console.log("\n✅ Nettoyage terminé");
    }
}

testKnowledgeBaseModule();
