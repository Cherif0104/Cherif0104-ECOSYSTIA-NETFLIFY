const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testGoalsFrontendPersistence() {
    console.log("🎯 TEST PERSISTANCE FRONTEND GOALS");
    console.log("==================================\n");

    try {
        // 1. Créer un objectif de test
        console.log("1️⃣ Création d'un objectif de test...");
        const testObjective = {
            title: "Test Persistance Frontend",
            description: "Objectif pour tester la persistance frontend",
            status: "In Progress",
            priority: "High",
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            progress: 30,
            owner_id: "00000000-0000-0000-0000-000000000000",
            category: "Test Frontend",
            owner_name: "Test User",
            team_members: ["user1", "user2"],
            quarter: "Q4",
            year: 2024
        };

        const { data: created, error: createError } = await supabase
            .from('objectives')
            .insert([testObjective])
            .select()
            .single();

        if (createError) throw createError;
        console.log("✅ Objectif créé:", created.id);

        // 2. Vérifier qu'il existe
        console.log("\n2️⃣ Vérification de l'existence...");
        const { data: all, error: getError } = await supabase
            .from('objectives')
            .select('*')
            .order('created_at', { ascending: false });

        if (getError) throw getError;
        console.log(`✅ ${all.length} objectif(s) trouvé(s)`);

        const testObj = all.find(obj => obj.id === created.id);
        if (testObj) {
            console.log("✅ Objectif de test trouvé:");
            console.log(`   - Titre: ${testObj.title}`);
            console.log(`   - Progression: ${testObj.progress}%`);
            console.log(`   - Statut: ${testObj.status}`);
        }

        // 3. Simuler un refresh (récupération après création)
        console.log("\n3️⃣ Simulation d'un refresh...");
        const { data: afterRefresh, error: refreshError } = await supabase
            .from('objectives')
            .select('*')
            .eq('id', created.id)
            .single();

        if (refreshError) throw refreshError;
        
        if (afterRefresh) {
            console.log("✅ Objectif persiste après 'refresh':");
            console.log(`   - Titre: ${afterRefresh.title}`);
            console.log(`   - Progression: ${afterRefresh.progress}%`);
            console.log(`   - Statut: ${afterRefresh.status}`);
        } else {
            console.log("❌ Objectif disparu après refresh !");
        }

        // 4. Nettoyer
        console.log("\n4️⃣ Nettoyage...");
        const { error: deleteError } = await supabase
            .from('objectives')
            .delete()
            .eq('id', created.id);

        if (deleteError) throw deleteError;
        console.log("✅ Objectif de test supprimé");

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("Si l'objectif persiste, le problème est dans le frontend.");
        console.log("Si l'objectif disparaît, le problème est dans la base de données.");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
    }
}

testGoalsFrontendPersistence();
