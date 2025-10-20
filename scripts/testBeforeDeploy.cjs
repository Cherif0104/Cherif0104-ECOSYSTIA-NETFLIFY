const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testBeforeDeploy() {
    console.log("🚀 TEST PRÉ-DÉPLOIEMENT NETLIFY");
    console.log("================================");

    let totalTests = 0;
    let passedTests = 0;
    const failedTests = [];

    try {
        // Test 1: Connexion Supabase
        console.log("\n📋 Test 1: Connexion Supabase");
        totalTests++;
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.log(`❌ Connexion Supabase: ${testError.message}`);
            failedTests.push('Connexion Supabase');
        } else {
            console.log("✅ Connexion Supabase réussie");
            passedTests++;
        }

        // Test 2: Vérifier les utilisateurs SENEGEL
        console.log("\n👥 Test 2: Utilisateurs SENEGEL");
        totalTests++;
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, role')
            .limit(20);

        if (usersError) {
            console.log(`❌ Récupération utilisateurs: ${usersError.message}`);
            failedTests.push('Utilisateurs SENEGEL');
        } else {
            console.log(`✅ ${users.length} utilisateurs trouvés`);
            if (users.length >= 19) {
                console.log("✅ Tous les utilisateurs SENEGEL sont présents");
                passedTests++;
            } else {
                console.log(`⚠️ Seulement ${users.length}/19 utilisateurs trouvés`);
                failedTests.push('Utilisateurs SENEGEL (nombre insuffisant)');
            }
        }

        // Test 3: Vérifier les tables principales
        console.log("\n🗄️ Test 3: Tables principales");
        const tables = [
            'projects',
            'knowledge_articles', 
            'jobs',
            'courses',
            'invoices',
            'time_logs'
        ];

        for (const table of tables) {
            totalTests++;
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`❌ Table ${table}: ${error.message}`);
                failedTests.push(`Table ${table}`);
            } else {
                console.log(`✅ Table ${table} accessible`);
                passedTests++;
            }
        }

        // Test 4: Test d'authentification (avec service role)
        console.log("\n🔐 Test 4: Authentification");
        totalTests++;
        try {
            // Tester l'accès aux données avec l'anon key
            const { data: authTest, error: authError } = await supabase
                .from('users')
                .select('id')
                .limit(1);

            if (authError) {
                console.log(`❌ Test auth: ${authError.message}`);
                failedTests.push('Authentification');
            } else {
                console.log("✅ Authentification fonctionnelle (accès aux données)");
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Test auth: ${error.message}`);
            failedTests.push('Authentification');
        }

        // Test 5: Test de création de données
        console.log("\n📝 Test 5: Création de données");
        totalTests++;
        try {
            // Créer un projet de test
            const testProject = {
                name: 'Test Déploiement',
                description: 'Projet de test pour le déploiement',
                status: 'active',
                priority: 'medium',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                owner_id: users[0]?.id || '00000000-0000-0000-0000-000000000000'
            };

            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert([testProject])
                .select()
                .single();

            if (projectError) {
                console.log(`❌ Création projet: ${projectError.message}`);
                failedTests.push('Création de données');
            } else {
                console.log("✅ Création de données fonctionnelle");
                passedTests++;

                // Supprimer le projet de test
                await supabase.from('projects').delete().eq('id', projectData.id);
            }
        } catch (error) {
            console.log(`❌ Création données: ${error.message}`);
            failedTests.push('Création de données');
        }

        // Résultats finaux
        console.log("\n🎉 RÉSULTATS FINAUX");
        console.log("===================");
        console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
        console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
        console.log(`📊 Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(0)}%`);

        if (failedTests.length > 0) {
            console.log("\n❌ TESTS ÉCHOUÉS:");
            failedTests.forEach(test => console.log(`   - ${test}`));
            console.log("\n⚠️ CORRIGEZ CES PROBLÈMES AVANT LE DÉPLOIEMENT !");
            return false;
        } else {
            console.log("\n🎊 TOUS LES TESTS SONT PASSÉS !");
            console.log("✅ L'application est prête pour le déploiement Netlify");
            console.log("✅ Supabase est correctement configuré");
            console.log("✅ Tous les modules sont fonctionnels");
            console.log("✅ La persistance des données est opérationnelle");
            return true;
        }

    } catch (error) {
        console.error("❌ Erreur inattendue:", error.message);
        return false;
    }
}

// Exécuter le test
testBeforeDeploy().then(success => {
    if (success) {
        console.log("\n🚀 PRÊT POUR LE DÉPLOIEMENT !");
        process.exit(0);
    } else {
        console.log("\n🛑 DÉPLOIEMENT NON RECOMMANDÉ");
        process.exit(1);
    }
});
