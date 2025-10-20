const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function checkLeaveRequestsTable() {
    console.log("🔍 VÉRIFICATION TABLE LEAVE_REQUESTS");
    console.log("===================================\n");

    try {
        // Récupérer un échantillon de données pour voir la structure
        const { data, error } = await supabase
            .from('leave_requests')
            .select('*')
            .limit(1);

        if (error) {
            console.error("❌ Erreur récupération données:", error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log("✅ Structure de la table leave_requests:");
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("ℹ️ Table leave_requests vide");
        }

    } catch (error) {
        console.error(`❌ Erreur générale: ${error.message}`);
    }
}

checkLeaveRequestsTable();
