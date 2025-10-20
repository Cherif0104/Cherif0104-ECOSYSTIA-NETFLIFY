const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);

async function fixLeaveRequests() {
    console.log("🔧 CORRECTION DEMANDES DE CONGÉ");
    console.log("===============================\n");

    try {
        // 1. Récupérer l'utilisateur CONTACT
        console.log("1️⃣ Récupération utilisateur CONTACT...");
        const { data: contactUser, error: userError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .eq('email', 'contact@senegel.org')
            .single();

        if (userError || !contactUser) {
            console.error("❌ Utilisateur CONTACT non trouvé");
            return;
        }

        console.log(`✅ Utilisateur CONTACT: ${contactUser.first_name} ${contactUser.last_name} (${contactUser.id})`);

        // 2. Supprimer les mauvaises demandes (créées avec le mauvais employee_id)
        console.log("\n2️⃣ Nettoyage des mauvaises demandes...");
        const { data: badRequests, error: badError } = await supabase
            .from('leave_requests')
            .select('*')
            .neq('employee_id', contactUser.id);

        if (badError) {
            console.error("❌ Erreur récupération mauvaises demandes:", badError.message);
        } else {
            console.log(`✅ ${badRequests.length} mauvaise(s) demande(s) trouvée(s)`);
            
            for (const request of badRequests) {
                const { error: deleteError } = await supabase
                    .from('leave_requests')
                    .delete()
                    .eq('id', request.id);
                
                if (deleteError) {
                    console.error(`❌ Erreur suppression demande ${request.id}:`, deleteError.message);
                } else {
                    console.log(`✅ Demande ${request.id} supprimée`);
                }
            }
        }

        // 3. Créer une demande correcte pour CONTACT
        console.log("\n3️⃣ Création d'une demande correcte...");
        const correctRequest = {
            employee_id: contactUser.id, // Utiliser le bon ID
            leave_type: 'vacation',
            start_date: '2024-02-01',
            end_date: '2024-02-05',
            days_requested: 5,
            reason: 'Test correction isolation',
            status: 'pending'
        };

        const { data: createdRequest, error: createError } = await supabase
            .from('leave_requests')
            .insert([correctRequest])
            .select()
            .single();

        if (createError) {
            console.error("❌ Erreur création demande correcte:", createError.message);
        } else {
            console.log("✅ Demande correcte créée:", createdRequest.id);
        }

        // 4. Vérifier que la demande est visible pour CONTACT
        console.log("\n4️⃣ Vérification de la visibilité...");
        const { data: contactRequests, error: contactError } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('employee_id', contactUser.id);

        if (contactError) {
            console.error("❌ Erreur vérification:", contactError.message);
        } else {
            console.log(`✅ ${contactRequests.length} demande(s) visible(s) pour CONTACT`);
            contactRequests.forEach((request, index) => {
                console.log(`   ${index + 1}. ${request.leave_type} - ${request.status} - ${request.days_requested} jour(s)`);
            });
        }

        console.log("\n🎉 CORRECTION TERMINÉE !");
        console.log("✅ Les demandes de congé devraient maintenant s'afficher");

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
    }
}

fixLeaveRequests();
