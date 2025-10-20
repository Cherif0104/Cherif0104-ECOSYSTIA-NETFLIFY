const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function createTestLeaveRequest() {
    console.log("🔍 CRÉATION DEMANDE DE TEST LEAVE_REQUESTS");
    console.log("==========================================\n");

    try {
        // Récupérer un utilisateur
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé");
            return;
        }

        const testUser = users[0];
        console.log("✅ Utilisateur trouvé:", testUser.id);

        // Créer une demande de test simple
        const testData = {
            employee_id: testUser.id,
            leave_type: 'vacation',
            start_date: '2024-02-01',
            end_date: '2024-02-05',
            reason: 'Test structure table',
            status: 'pending',
            days_requested: 5
        };

        console.log("🔄 Création demande de test...");
        const { data: created, error: createError } = await supabase
            .from('leave_requests')
            .insert([testData])
            .select()
            .single();

        if (createError) {
            console.error("❌ Erreur création:", createError.message);
            return;
        }

        console.log("✅ Demande créée avec succès:");
        console.log(JSON.stringify(created, null, 2));

        // Nettoyer
        await supabase
            .from('leave_requests')
            .delete()
            .eq('id', created.id);
        console.log("✅ Demande de test supprimée");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
    }
}

createTestLeaveRequest();
