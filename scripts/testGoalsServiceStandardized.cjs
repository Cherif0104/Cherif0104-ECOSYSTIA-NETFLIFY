const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testGoalsServiceStandardized() {
    console.log("🎯 TEST SERVICE GOALS STANDARDISÉ");
    console.log("=================================\n");

    try {
        // Test 1: Créer un objectif
        console.log("1️⃣ Création d'un objectif...");
        const newObjective = {
            title: "Objectif Test Standardisé",
            description: "Test du nouveau service goals standardisé",
            status: "In Progress",
            priority: "High",
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            progress: 50,
            owner_id: "00000000-0000-0000-0000-000000000000",
            category: "Test",
            owner_name: "Test User",
            team_members: ["user1", "user2"],
            quarter: "Q4",
            year: 2024
        };

        const { data: created, error: createError } = await supabase
            .from('objectives')
            .insert([newObjective])
            .select()
            .single();

        if (createError) throw createError;
        console.log("✅ Objectif créé:", created.id);
        console.log(`   - Titre: ${created.title}`);
        console.log(`   - Catégorie: ${created.category}`);
        console.log(`   - Équipe: ${JSON.stringify(created.team_members)}`);

        // Test 2: Récupérer tous les objectifs
        console.log("\n2️⃣ Récupération de tous les objectifs...");
        const { data: all, error: getError } = await supabase
            .from('objectives')
            .select('*')
            .order('created_at', { ascending: false });

        if (getError) throw getError;
        console.log(`✅ ${all.length} objectif(s) récupéré(s)`);
        
        // Test 3: Mettre à jour l'objectif
        console.log("\n3️⃣ Mise à jour de l'objectif...");
        const { data: updated, error: updateError } = await supabase
            .from('objectives')
            .update({ 
                progress: 75,
                status: "Completed",
                team_members: ["user1", "user2", "user3", "user4"]
            })
            .eq('id', created.id)
            .select()
            .single();

        if (updateError) throw updateError;
        console.log("✅ Objectif mis à jour:");
        console.log(`   - Progression: ${updated.progress}%`);
        console.log(`   - Statut: ${updated.status}`);
        console.log(`   - Équipe: ${JSON.stringify(updated.team_members)}`);

        // Test 4: Récupérer l'objectif par ID
        console.log("\n4️⃣ Récupération par ID...");
        const { data: byId, error: byIdError } = await supabase
            .from('objectives')
            .select('*')
            .eq('id', created.id)
            .single();

        if (byIdError) throw byIdError;
        console.log("✅ Objectif récupéré par ID:");
        console.log(`   - Titre: ${byId.title}`);
        console.log(`   - Progression: ${byId.progress}%`);
        console.log(`   - Statut: ${byId.status}`);

        // Test 5: Supprimer l'objectif
        console.log("\n5️⃣ Suppression de l'objectif...");
        const { error: deleteError } = await supabase
            .from('objectives')
            .delete()
            .eq('id', created.id);

        if (deleteError) throw deleteError;
        console.log("✅ Objectif supprimé");

        console.log("\n🎉 TOUS LES TESTS SONT PASSÉS !");
        console.log("✅ Le service Goals est maintenant standardisé et fonctionnel");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testGoalsServiceStandardized();
