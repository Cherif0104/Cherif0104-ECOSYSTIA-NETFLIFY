const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function testGoalsPersistence() {
    console.log("🔍 TEST DE PERSISTANCE DU MODULE GOALS");
    console.log("=====================================\n");

    try {
        // Test 1: Vérifier que la table objectives existe
        console.log("1️⃣ Vérification de l'existence de la table objectives...");
        const { data: objectives, error: objectivesError } = await supabase
            .from('objectives')
            .select('*')
            .limit(1);

        if (objectivesError) throw objectivesError;

        console.log("✅ Table objectives accessible");

        // Test 2: Créer un objectif de test
        console.log("\n2️⃣ Création d'un objectif de test...");
        const testObjective = {
            title: "Test Objectif Persistance",
            description: "Objectif créé pour tester la persistance des données",
            status: "In Progress",
            priority: "High",
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            progress: 25,
            owner_id: "00000000-0000-0000-0000-000000000000", // UUID factice
            category: "Test",
            owner_name: "Test User",
            team_members: ["user1", "user2"],
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
        console.log(`   - Statut: ${createdObjective.status}`);
        console.log(`   - Priorité: ${createdObjective.priority}`);
        console.log(`   - Équipe: ${JSON.stringify(createdObjective.team_members)}`);

        // Test 3: Récupérer l'objectif créé
        console.log("\n3️⃣ Récupération de l'objectif créé...");
        const { data: retrievedObjective, error: retrieveError } = await supabase
            .from('objectives')
            .select('*')
            .eq('id', createdObjective.id)
            .single();

        if (retrieveError) throw retrieveError;

        console.log("✅ Objectif récupéré avec succès:");
        console.log(`   - Titre: ${retrievedObjective.title}`);
        console.log(`   - Description: ${retrievedObjective.description}`);
        console.log(`   - Équipe: ${JSON.stringify(retrievedObjective.team_members)}`);

        // Test 4: Mettre à jour l'équipe
        console.log("\n4️⃣ Mise à jour de l'équipe...");
        const newTeamMembers = ["user1", "user2", "user3", "user4"];
        
        const { data: updatedObjective, error: updateError } = await supabase
            .from('objectives')
            .update({ team_members: newTeamMembers })
            .eq('id', createdObjective.id)
            .select()
            .single();

        if (updateError) throw updateError;

        console.log("✅ Équipe mise à jour avec succès:");
        console.log(`   - Nouvelle équipe: ${JSON.stringify(updatedObjective.team_members)}`);

        // Test 5: Supprimer l'objectif de test
        console.log("\n5️⃣ Suppression de l'objectif de test...");
        const { error: deleteError } = await supabase
            .from('objectives')
            .delete()
            .eq('id', createdObjective.id);

        if (deleteError) throw deleteError;

        console.log("✅ Objectif supprimé avec succès");

        console.log("\n🎉 TOUS LES TESTS DE PERSISTANCE SONT PASSÉS !");
        console.log("Le module Goals est maintenant entièrement connecté à Supabase.");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testGoalsPersistence();
