const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testNewSupabaseServices() {
    console.log("🚀 TEST DES NOUVEAUX SERVICES SUPABASE");
    console.log("=====================================");

    let successCount = 0;
    let errorCount = 0;

    // Test 1: Vérifier les tables existantes
    console.log("\n📋 Test 1: Vérification des tables");
    const tables = [
        'knowledge_articles',
        'knowledge_categories', 
        'jobs',
        'job_applications',
        'course_enrollments',
        'courses',
        'lessons'
    ];

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`❌ Table ${table}: ${error.message}`);
                errorCount++;
            } else {
                console.log(`✅ Table ${table}: OK`);
                successCount++;
            }
        } catch (err) {
            console.log(`❌ Table ${table}: ${err.message}`);
            errorCount++;
        }
    }

    // Test 2: Créer un article de test
    console.log("\n📝 Test 2: Création d'un article de test");
    try {
        const { data, error } = await supabase
            .from('knowledge_articles')
            .insert([{
                title: 'Test Article',
                content: 'Contenu de test pour vérifier le service',
                summary: 'Résumé de test',
                category: 'Test',
                type: 'article',
                status: 'published',
                author: 'test@example.com',
                tags: ['test', 'supabase']
            }])
            .select()
            .single();

        if (error) {
            console.log(`❌ Création article: ${error.message}`);
            errorCount++;
        } else {
            console.log(`✅ Article créé: ${data.id}`);
            successCount++;

            // Supprimer l'article de test
            await supabase
                .from('knowledge_articles')
                .delete()
                .eq('id', data.id);
            console.log(`✅ Article de test supprimé`);
        }
    } catch (err) {
        console.log(`❌ Erreur création article: ${err.message}`);
        errorCount++;
    }

    // Test 3: Créer un cours de test
    console.log("\n🎓 Test 3: Création d'un cours de test");
    try {
        const { data, error } = await supabase
            .from('courses')
            .insert([{
                title: 'Test Course',
                instructor: 'Test Instructor',
                description: 'Description de test pour le cours',
                duration: 60,
                level: 'beginner',
                category: 'Test',
                price: 10000,
                status: 'active'
            }])
            .select()
            .single();

        if (error) {
            console.log(`❌ Création cours: ${error.message}`);
            errorCount++;
        } else {
            console.log(`✅ Cours créé: ${data.id}`);
            successCount++;

            // Supprimer le cours de test
            await supabase
                .from('courses')
                .delete()
                .eq('id', data.id);
            console.log(`✅ Cours de test supprimé`);
        }
    } catch (err) {
        console.log(`❌ Erreur création cours: ${err.message}`);
        errorCount++;
    }

    // Test 4: Créer une offre d'emploi de test
    console.log("\n💼 Test 4: Création d'une offre d'emploi de test");
    try {
        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                title: 'Test Job',
                company: 'Test Company',
                location: 'Dakar, Sénégal',
                type: 'full-time',
                description: 'Description de test pour l\'offre d\'emploi',
                department: 'IT',
                level: 'entry',
                status: 'open'
            }])
            .select()
            .single();

        if (error) {
            console.log(`❌ Création offre: ${error.message}`);
            errorCount++;
        } else {
            console.log(`✅ Offre créée: ${data.id}`);
            successCount++;

            // Supprimer l'offre de test
            await supabase
                .from('jobs')
                .delete()
                .eq('id', data.id);
            console.log(`✅ Offre de test supprimée`);
        }
    } catch (err) {
        console.log(`❌ Erreur création offre: ${err.message}`);
        errorCount++;
    }

    // Test 5: Vérifier les catégories par défaut
    console.log("\n📂 Test 5: Vérification des catégories par défaut");
    try {
        const { data, error } = await supabase
            .from('knowledge_categories')
            .select('*');

        if (error) {
            console.log(`❌ Récupération catégories: ${error.message}`);
            errorCount++;
        } else {
            console.log(`✅ ${data.length} catégories trouvées`);
            data.forEach(cat => {
                console.log(`   - ${cat.name} (${cat.color})`);
            });
            successCount++;
        }
    } catch (err) {
        console.log(`❌ Erreur récupération catégories: ${err.message}`);
        errorCount++;
    }

    console.log("\n🎉 RÉSULTATS FINAUX");
    console.log("===================");
    console.log(`✅ ${successCount} tests réussis`);
    console.log(`❌ ${errorCount} erreurs`);
    console.log(`📊 Taux de réussite: ${((successCount / (successCount + errorCount)) * 100).toFixed(0)}%`);

    if (errorCount === 0) {
        console.log("\n🎊 TOUS LES SERVICES FONCTIONNENT PARFAITEMENT !");
        console.log("Les tables Supabase sont prêtes pour l'application.");
    } else {
        console.log("\n⚠️ Certains services ont des problèmes. Vérifiez les logs ci-dessus.");
        console.log("Assurez-vous que le script createAllSupabaseTables.sql a été exécuté.");
    }
}

testNewSupabaseServices();
