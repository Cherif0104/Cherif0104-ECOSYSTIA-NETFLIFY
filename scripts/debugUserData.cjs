const { createClient } = require('@supabase/supabase-js');
const { supabaseConfig } = require('../config/supabase.cjs');

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

async function debugUserData() {
    console.log("🔍 DEBUG DONNÉES UTILISATEUR");
    console.log("============================\n");

    try {
        // 1. Récupérer tous les utilisateurs
        console.log("1️⃣ Tous les utilisateurs:");
        const { data: allUsers, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.error("❌ Erreur utilisateurs:", usersError.message);
            return;
        }

        console.log(`✅ ${allUsers.length} utilisateurs trouvés:`);
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ID: ${user.id}`);
        });

        // 2. Chercher l'utilisateur CONTACT
        console.log("\n2️⃣ Recherche utilisateur CONTACT:");
        const contactUser = allUsers.find(user => 
            user.first_name === 'CONTACT' || 
            user.email === 'contact@senegel.org'
        );

        if (contactUser) {
            console.log(`✅ Utilisateur CONTACT trouvé: ${contactUser.id}`);
        } else {
            console.log("❌ Utilisateur CONTACT non trouvé");
        }

        // 3. Vérifier les demandes de congé
        console.log("\n3️⃣ Toutes les demandes de congé:");
        const { data: allLeaveRequests, error: leaveError } = await supabase
            .from('leave_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (leaveError) {
            console.error("❌ Erreur demandes:", leaveError.message);
        } else {
            console.log(`✅ ${allLeaveRequests.length} demandes trouvées:`);
            allLeaveRequests.forEach((request, index) => {
                const user = allUsers.find(u => u.id === request.employee_id);
                console.log(`   ${index + 1}. ID: ${request.id}`);
                console.log(`      - Employé ID: ${request.employee_id}`);
                console.log(`      - Employé: ${user ? `${user.first_name} ${user.last_name}` : 'Inconnu'}`);
                console.log(`      - Type: ${request.leave_type}`);
                console.log(`      - Statut: ${request.status}`);
                console.log(`      - Créé: ${request.created_at}`);
                console.log('');
            });
        }

        // 4. Tester la requête avec l'ID de CONTACT
        if (contactUser) {
            console.log("\n4️⃣ Test requête avec ID CONTACT:");
            const { data: contactRequests, error: contactError } = await supabase
                .from('leave_requests')
                .select('*')
                .eq('employee_id', contactUser.id);

            if (contactError) {
                console.error("❌ Erreur requête CONTACT:", contactError.message);
            } else {
                console.log(`✅ ${contactRequests.length} demandes pour CONTACT`);
            }
        }

    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
    }
}

debugUserData();
