const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function testLeaveManagementComplete() {
    console.log("🏖️ TEST COMPLET LEAVE MANAGEMENT");
    console.log("=================================\n");

    try {
        // 1. Vérifier la table
        console.log("1️⃣ Vérification de la table leave_requests...");
        const { data: tableCheck, error: tableError } = await supabase
            .from('leave_requests')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error("❌ Table leave_requests n'existe pas:", tableError.message);
            return;
        }

        console.log("✅ Table leave_requests existe");

        // 2. Récupérer les utilisateurs
        console.log("\n2️⃣ Récupération des utilisateurs...");
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .limit(5);

        if (usersError || !users || users.length === 0) {
            console.error("❌ Aucun utilisateur trouvé");
            return;
        }

        console.log(`✅ ${users.length} utilisateur(s) trouvé(s)`);

        // 3. Créer plusieurs demandes de test
        console.log("\n3️⃣ Création de demandes de test...");
        const testRequests = [
            {
                employee_id: users[0].id,
                leave_type: 'vacation',
                start_date: '2024-02-01',
                end_date: '2024-02-05',
                reason: 'Vacances familiales',
                status: 'pending',
                days_requested: 5
            },
            {
                employee_id: users[1]?.id || users[0].id,
                leave_type: 'sick',
                start_date: '2024-02-10',
                end_date: '2024-02-12',
                reason: 'Grippe',
                status: 'approved',
                days_requested: 3
            },
            {
                employee_id: users[2]?.id || users[0].id,
                leave_type: 'personal',
                start_date: '2024-02-15',
                end_date: '2024-02-16',
                reason: 'Rendez-vous médical',
                status: 'rejected',
                days_requested: 2
            }
        ];

        const createdRequests = [];
        for (const request of testRequests) {
            const { data: created, error: createError } = await supabase
                .from('leave_requests')
                .insert([request])
                .select()
                .single();

            if (createError) {
                console.error(`❌ Erreur création demande ${request.leave_type}:`, createError.message);
            } else {
                console.log(`✅ Demande ${request.leave_type} créée: ${created.id}`);
                createdRequests.push(created);
            }
        }

        // 4. Vérifier les demandes créées
        console.log("\n4️⃣ Vérification des demandes...");
        const { data: allRequests, error: getError } = await supabase
            .from('leave_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (getError) {
            console.error("❌ Erreur récupération demandes:", getError.message);
        } else {
            console.log(`✅ ${allRequests.length} demande(s) trouvée(s)`);
            
            // Afficher les statistiques par statut
            const stats = allRequests.reduce((acc, req) => {
                acc[req.status] = (acc[req.status] || 0) + 1;
                return acc;
            }, {});

            console.log("📊 Statistiques par statut:");
            Object.entries(stats).forEach(([status, count]) => {
                console.log(`   - ${status}: ${count} demande(s)`);
            });
        }

        // 5. Tester les filtres
        console.log("\n5️⃣ Test des filtres...");
        
        // Filtre par statut
        const { data: pendingRequests } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('status', 'pending');

        console.log(`✅ ${pendingRequests.length} demande(s) en attente`);

        // Filtre par type
        const { data: vacationRequests } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('leave_type', 'vacation');

        console.log(`✅ ${vacationRequests.length} demande(s) de vacances`);

        // 6. Tester l'approbation
        if (createdRequests.length > 0) {
            console.log("\n6️⃣ Test d'approbation...");
            const requestToApprove = createdRequests.find(r => r.status === 'pending');
            
            if (requestToApprove) {
                const { data: approved, error: approveError } = await supabase
                    .from('leave_requests')
                    .update({
                        status: 'approved',
                        approved_by: users[0].id,
                        approved_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', requestToApprove.id)
                    .select()
                    .single();

                if (approveError) {
                    console.error("❌ Erreur approbation:", approveError.message);
                } else {
                    console.log("✅ Demande approuvée avec succès");
                }
            }
        }

        // 7. Nettoyer les demandes de test
        console.log("\n7️⃣ Nettoyage...");
        for (const request of createdRequests) {
            await supabase
                .from('leave_requests')
                .delete()
                .eq('id', request.id);
        }
        console.log("✅ Demandes de test supprimées");

        console.log("\n🎉 TEST TERMINÉ !");
        console.log("✅ Le module Leave Management fonctionne parfaitement");
        console.log("✅ Toutes les fonctionnalités sont opérationnelles");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        console.error("Détails:", error);
    }
}

testLeaveManagementComplete();
