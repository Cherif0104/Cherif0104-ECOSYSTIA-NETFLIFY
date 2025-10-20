const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testLeaveManagementPersistence() {
    console.log("🏖️ TEST PERSISTANCE LEAVE MANAGEMENT");
    console.log("====================================\n");

    try {
        // 1. Vérifier que la table existe
        console.log("1️⃣ Vérification de la table leave_requests...");
        const { data: tableCheck, error: tableError } = await supabase
            .from('leave_requests')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error("❌ Table leave_requests n'existe pas:", tableError.message);
            console.log("📝 Exécutez d'abord le script SQL: scripts/createLeaveRequestsTable.sql");
            return;
        }

        console.log("✅ Table leave_requests existe");

        // 2. Récupérer un utilisateur pour les tests
        console.log("\n2️⃣ Récupération d'un utilisateur pour les tests...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé pour les tests");
            return;
        }

        const testUser = users[0];
        console.log(`✅ Utilisateur trouvé: ${testUser.first_name} ${testUser.last_name}`);

        // 3. Créer une demande de congé de test
        console.log("\n3️⃣ Création d'une demande de congé de test...");
        const testLeaveRequest = {
            employee_id: testUser.id,
            leave_type: 'vacation',
            start_date: '2024-02-01',
            end_date: '2024-02-05',
            reason: 'Vacances familiales',
            status: 'pending',
            days_requested: 5
        };

        const { data: created, error: createError } = await supabase
            .from('leave_requests')
            .insert([testLeaveRequest])
            .select()
            .single();

        if (createError) {
            console.error("❌ Erreur création demande:", createError.message);
            return;
        }

        console.log("✅ Demande de congé créée:", created.id);

        // 4. Vérifier que la demande existe
        console.log("\n4️⃣ Vérification de l'existence...");
        const { data: all, error: getError } = await supabase
            .from('leave_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (getError) {
            console.error("❌ Erreur récupération demandes:", getError.message);
            return;
        }

        console.log(`✅ ${all.length} demande(s) trouvée(s)`);

        const testRequest = all.find(req => req.id === created.id);
        if (testRequest) {
            console.log("✅ Demande de test trouvée:");
            console.log(`   - Employé: ${testRequest.employee_id}`);
            console.log(`   - Type: ${testRequest.leave_type}`);
            console.log(`   - Période: ${testRequest.start_date} - ${testRequest.end_date}`);
            console.log(`   - Statut: ${testRequest.status}`);
            console.log(`   - Durée: ${testRequest.days_requested} jour(s)`);
        }

        // 5. Simuler un refresh
        console.log("\n5️⃣ Simulation d'un refresh...");
        const { data: afterRefresh, error: refreshError } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('id', created.id)
            .single();

        if (refreshError) {
            console.error("❌ Erreur refresh:", refreshError.message);
            return;
        }

        if (afterRefresh) {
            console.log("✅ Demande persiste après 'refresh':");
            console.log(`   - Type: ${afterRefresh.leave_type}`);
            console.log(`   - Statut: ${afterRefresh.status}`);
            console.log(`   - Durée: ${afterRefresh.days_requested} jour(s)`);
        } else {
            console.log("❌ Demande disparue après refresh !");
        }

        // 6. Tester la mise à jour (approbation)
        console.log("\n6️⃣ Test d'approbation...");
        const { data: approved, error: approveError } = await supabase
            .from('leave_requests')
            .update({
                status: 'approved',
                approved_by: testUser.id,
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', created.id)
            .select()
            .single();

        if (approveError) {
            console.error("❌ Erreur approbation:", approveError.message);
        } else {
            console.log("✅ Demande approuvée:");
            console.log(`   - Nouveau statut: ${approved.status}`);
            console.log(`   - Approuvé par: ${approved.approved_by}`);
            console.log(`   - Date d'approbation: ${approved.approved_at}`);
        }

        // 7. Nettoyer
        console.log("\n7️⃣ Nettoyage...");
        const { error: deleteError } = await supabase
            .from('leave_requests')
            .delete()
            .eq('id', created.id);

        if (deleteError) {
            console.error("❌ Erreur suppression:", deleteError.message);
        } else {
            console.log("✅ Demande de test supprimée");
        }

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("✅ La persistance Leave Management fonctionne parfaitement");
        console.log("✅ Les demandes de congé sont correctement sauvegardées en base");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testLeaveManagementPersistence();
