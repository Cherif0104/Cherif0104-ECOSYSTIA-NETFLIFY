const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testGoalsFrontend() {
    console.log("🔍 TEST FRONTEND - MODULE GOALS");
    console.log("===============================\n");

    try {
        // Test 1: Créer un objectif de test
        console.log("1️⃣ Création d'un objectif de test...");
        const testObjective = {
            title: "Test Frontend Persistance",
            description: "Objectif créé pour tester la persistance frontend",
            status: "In Progress",
            priority: "High",
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            progress: 50,
            owner_id: "00000000-0000-0000-0000-000000000000",
            category: "Test Frontend",
            owner_name: "Test User Frontend",
            team_members: ["user1", "user2", "user3"],
            quarter: "Q4",
            year: 2024
        };

        const { data: createdObjective, error: createError } = await supabase
            .from('objectives')
            .insert([testObjective])
            .select()
            .single();

        if (createError) throw createError;

        console.log("✅ Objectif créé avec succès:");
        console.log(`   - ID: ${createdObjective.id}`);
        console.log(`   - Titre: ${createdObjective.title}`);
        console.log(`   - Catégorie: ${createdObjective.category}`);
        console.log(`   - Propriétaire: ${createdObjective.owner_name}`);
        console.log(`   - Équipe: ${JSON.stringify(createdObjective.team_members)}`);

        // Test 2: Récupérer tous les objectifs (comme le fait le frontend)
        console.log("\n2️⃣ Récupération de tous les objectifs...");
        const { data: allObjectives, error: retrieveError } = await supabase
            .from('objectives')
            .select('*')
            .order('created_at', { ascending: false });

        if (retrieveError) throw retrieveError;

        console.log(`✅ ${allObjectives.length} objectif(s) récupéré(s):`);
        allObjectives.forEach((obj, index) => {
            console.log(`   ${index + 1}. ${obj.title}`);
            console.log(`      - Catégorie: ${obj.category || 'Non définie'}`);
            console.log(`      - Propriétaire: ${obj.owner_name || 'Non défini'}`);
            console.log(`      - Équipe: ${JSON.stringify(obj.team_members || [])}`);
        });

        // Test 3: Supprimer l'objectif de test
        console.log("\n3️⃣ Suppression de l'objectif de test...");
        const { error: deleteError } = await supabase
            .from('objectives')
            .delete()
            .eq('id', createdObjective.id);

        if (deleteError) throw deleteError;

        console.log("✅ Objectif supprimé avec succès");

        console.log("\n🎉 TEST FRONTEND RÉUSSI !");
        console.log("Les données sont correctement persistées et récupérées.");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testGoalsFrontend();
