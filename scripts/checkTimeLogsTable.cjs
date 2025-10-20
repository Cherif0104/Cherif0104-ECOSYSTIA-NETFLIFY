const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function checkTimeLogsTable() {
    console.log("🔍 VÉRIFICATION TABLE TIME_LOGS");
    console.log("===============================\n");

    try {
        // Récupérer un échantillon de données pour voir la structure
        const { data, error } = await supabase
            .from('time_logs')
            .select('*')
            .limit(1);

        if (error) {
            console.error("❌ Erreur récupération données:", error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log("✅ Structure de la table time_logs:");
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("ℹ️ Table time_logs vide, création d'un enregistrement de test...");
            
            // Essayer de créer un enregistrement avec les colonnes de base
            const testData = {
                user_id: "00000000-0000-0000-0000-000000000000",
                project_id: "00000000-0000-0000-0000-000000000000",
                hours: 8,
                date: "2024-01-15"
            };

            const { data: created, error: createError } = await supabase
                .from('time_logs')
                .insert([testData])
                .select()
                .single();

            if (createError) {
                console.error("❌ Erreur création test:", createError.message);
            } else {
                console.log("✅ Enregistrement de test créé:");
                console.log(JSON.stringify(created, null, 2));
            }
        }

    } catch (error) {
        console.error(`❌ Erreur générale: ${error.message}`);
    }
}

checkTimeLogsTable();
