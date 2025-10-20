const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testTimeTrackingPersistence() {
    console.log("⏰ TEST PERSISTANCE TIME TRACKING");
    console.log("=================================\n");

    try {
        // 1. Créer un time log de test
        console.log("1️⃣ Création d'un time log de test...");
        const testTimeLog = {
            user_id: "00000000-0000-0000-0000-000000000000",
            project_id: "00000000-0000-0000-0000-000000000000",
            description: "Test Persistance Time Tracking", // Utiliser description pour le nom de la tâche
            date: "2024-01-15",
            hours: 8
        };

        const { data: created, error: createError } = await supabase
            .from('time_logs')
            .insert([testTimeLog])
            .select()
            .single();

        if (createError) throw createError;
        console.log("✅ Time log créé:", created.id);

        // 2. Vérifier qu'il existe
        console.log("\n2️⃣ Vérification de l'existence...");
        const { data: all, error: getError } = await supabase
            .from('time_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (getError) throw getError;
        console.log(`✅ ${all.length} time log(s) trouvé(s)`);

        const testLog = all.find(log => log.id === created.id);
        if (testLog) {
            console.log("✅ Time log de test trouvé:");
            console.log(`   - Tâche: ${testLog.description}`);
            console.log(`   - Durée: ${testLog.hours}h`);
            console.log(`   - Date: ${testLog.date}`);
        }

        // 3. Simuler un refresh (récupération après création)
        console.log("\n3️⃣ Simulation d'un refresh...");
        const { data: afterRefresh, error: refreshError } = await supabase
            .from('time_logs')
            .select('*')
            .eq('id', created.id)
            .single();

        if (refreshError) throw refreshError;
        
        if (afterRefresh) {
            console.log("✅ Time log persiste après 'refresh':");
            console.log(`   - Tâche: ${afterRefresh.description}`);
            console.log(`   - Durée: ${afterRefresh.hours}h`);
            console.log(`   - Date: ${afterRefresh.date}`);
        } else {
            console.log("❌ Time log disparu après refresh !");
        }

        // 4. Tester la mise à jour
        console.log("\n4️⃣ Test de mise à jour...");
        const { data: updated, error: updateError } = await supabase
            .from('time_logs')
            .update({ 
                hours: 10,
                updated_at: new Date().toISOString()
            })
            .eq('id', created.id)
            .select()
            .single();

        if (updateError) throw updateError;
        console.log("✅ Time log mis à jour:");
        console.log(`   - Nouvelle durée: ${updated.hours}h`);
        console.log(`   - Date: ${updated.date}`);

        // 5. Nettoyer
        console.log("\n5️⃣ Nettoyage...");
        const { error: deleteError } = await supabase
            .from('time_logs')
            .delete()
            .eq('id', created.id);

        if (deleteError) throw deleteError;
        console.log("✅ Time log de test supprimé");

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("✅ La persistance Time Tracking fonctionne parfaitement");
        console.log("✅ Les données sont correctement sauvegardées en base");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testTimeTrackingPersistence();
